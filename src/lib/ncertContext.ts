import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";

// ── Topic → NCERT chapter map ─────────────────────────────────────────────────
// Ordered from most-specific to least-specific so the first match wins.
const TOPIC_TO_CHAPTER: Record<string, { class: string; chapter: number }> = {
    // Class 12 Ch3 — Current Electricity (longest list — most-used chapter)
    "internal resistance": { class: "12", chapter: 3 },
    "terminal voltage": { class: "12", chapter: 3 },
    "drift velocity": { class: "12", chapter: 3 },
    "metre bridge": { class: "12", chapter: 3 },
    "wheatstone": { class: "12", chapter: 3 },
    "potentiometer": { class: "12", chapter: 3 },
    "galvanometer": { class: "12", chapter: 3 },
    "kirchhoff": { class: "12", chapter: 3 },
    "ammeter": { class: "12", chapter: 3 },
    "voltmeter": { class: "12", chapter: 3 },
    "resistivity": { class: "12", chapter: 3 },
    "resistance": { class: "12", chapter: 3 },
    "emf": { class: "12", chapter: 3 },
    "kvl": { class: "12", chapter: 3 },
    "kcl": { class: "12", chapter: 3 },
    "ohm": { class: "12", chapter: 3 },
    "wire": { class: "12", chapter: 3 },
    // Class 12 Ch1 — Electrostatics
    "electric field": { class: "12", chapter: 1 },
    "coulomb": { class: "12", chapter: 1 },
    "gauss": { class: "12", chapter: 1 },
    // Class 12 Ch2 — Electrostatic Potential & Capacitance
    "capacitor": { class: "12", chapter: 2 },
    "capacitance": { class: "12", chapter: 2 },
    // Class 12 Ch4 — Moving Charges & Magnetism
    "biot savart": { class: "12", chapter: 4 },
    "magnetic force": { class: "12", chapter: 4 },
    "ampere": { class: "12", chapter: 4 },
    "solenoid": { class: "12", chapter: 4 },
    // Class 12 Ch5 — EMI
    "faraday": { class: "12", chapter: 5 },
    "inductance": { class: "12", chapter: 5 },
    "lenz": { class: "12", chapter: 5 },
    // Class 12 Ch6 — AC Circuits
    "transformer": { class: "12", chapter: 6 },
    "impedance": { class: "12", chapter: 6 },
    "resonance": { class: "12", chapter: 6 },
    // Class 10 Ch12 — Electricity
    "heating effect": { class: "10", chapter: 12 },
    "electric power": { class: "10", chapter: 12 },
    "current": { class: "10", chapter: 12 },
};

/**
 * Fetch relevant NCERT text chunk for the given question + class level.
 * Returns "" if no match or DB unavailable.
 */
export async function getNCERTContext(
    question: string,
    classLevel: string
): Promise<string> {
    const q = question.toLowerCase();

    // Find the first matching chapter for this class level
    let chapterNumber: number | null = null;
    let chapterName = "";

    for (const [keyword, info] of Object.entries(TOPIC_TO_CHAPTER)) {
        if (q.includes(keyword) && info.class === classLevel) {
            chapterNumber = info.chapter;
            break;
        }
    }

    // Fallback: if classLevel doesn't match any 12-specific topic
    // but the question is about electricity-type topics, try class 10 or 12 Ch3
    if (!chapterNumber) {
        for (const [keyword, info] of Object.entries(TOPIC_TO_CHAPTER)) {
            if (q.includes(keyword)) {
                chapterNumber = info.chapter;
                break;
            }
        }
    }

    if (!chapterNumber) return ""; // no match at all

    // Prefer the dedicated chapter extract; fall back to full-book row (chapter_number = 0)
    const { data } = await supabase
        .from("ncert_content")
        .select("content_text, chapter_name")
        .eq("class_level", classLevel)
        .eq("chapter_number", chapterNumber)
        .maybeSingle();

    const row = data ?? null;

    if (!row) {
        // Try the full-book row for this class
        const { data: bookRow } = await supabase
            .from("ncert_content")
            .select("content_text, chapter_name")
            .eq("class_level", classLevel)
            .eq("chapter_number", 0)
            .maybeSingle();
        if (!bookRow) return "";
        chapterName = bookRow.chapter_name;
        return formatContext(classLevel, chapterNumber, chapterName, bookRow.content_text);
    }

    return formatContext(classLevel, chapterNumber, row.chapter_name, row.content_text);
}

function formatContext(
    classLevel: string,
    chapter: number,
    chapterName: string,
    text: string
): string {
    return `NCERT REFERENCE (Class ${classLevel} — Chapter ${chapter}: ${chapterName}):
Use this as your source of truth. Follow NCERT's language and sequence exactly.
---
${text.substring(0, 6000)}
---`;
}
