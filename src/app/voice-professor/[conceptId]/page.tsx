/**
 * Voice Professor demo page (backend-first; intentionally minimal UI).
 *
 * Server component: reads the concept JSON directly, assembles the
 * self-contained field_3d sim HTML (Rule-18-safe — deterministic assembly, no
 * LLM, no Supabase, same path as build_review_site.ts), and extracts per-state
 * narration from the existing teacher_script. The pretty shell (orb, layout,
 * transcript styling) is a later designer pass — this page exists to prove the
 * spoken Q&A loop end to end against correct physics.
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { Fraunces } from "next/font/google";
import { notFound } from "next/navigation";

// Serif "voice" for the premium theme (wordmark, concept title, professor notes).
// UI stays on Geist (root layout); this only adds the display serif on this route.
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
import { assembleField3DHtml, type Field3DConfig } from "@/lib/renderers/field_3d_renderer";
import { getConceptMoves } from "@/lib/voiceProfessor/professorBrain";
import { VoiceProfessorClient } from "./VoiceProfessorClient";

interface TtsSentenceJson {
    text_en?: string;
}

interface ConceptJson {
    concept_id?: string;
    concept_name?: string;
    field_3d_config?: Field3DConfig;
    epic_l_path?: {
        states?: Record<
            string,
            { title?: string; teacher_script?: { tts_sentences?: TtsSentenceJson[] } }
        >;
    };
}

interface PageProps {
    params: Promise<{ conceptId: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

type Actor = "founder_test" | "student" | "reviewer";
function asActor(v: unknown): Actor {
    return v === "student" || v === "reviewer" ? v : "founder_test";
}

function stateNumber(id: string): number {
    const m = /STATE_(\d+)/.exec(id);
    return m ? parseInt(m[1], 10) : 9999;
}

export default async function VoiceProfessorPage({ params, searchParams }: PageProps) {
    const { conceptId } = await params;
    // Cost-tracking actor from the URL: default founder_test (you), `?actor=student`
    // for pilot links you hand to real students, `?actor=reviewer` for teachers.
    const actor = asActor((await searchParams).actor);

    const conceptPath = join(process.cwd(), "src", "data", "concepts", `${conceptId}.json`);
    if (!existsSync(conceptPath)) {
        notFound();
    }
    const json = JSON.parse(readFileSync(conceptPath, "utf-8")) as ConceptJson;
    if (!json.field_3d_config) {
        // Voice professor demo only supports field_3d diamonds for now.
        notFound();
    }

    // Warm the sim's dark background to match the premium terracotta theme so the
    // canvas reads as the deepest panel in one warm-dark world (not a cool-black
    // hole in the warm frame). Scoped here — the shared renderer default is untouched.
    const themedConfig: Field3DConfig = {
        ...json.field_3d_config,
        pvl_colors: {
            background: "#120D09",
            text: json.field_3d_config.pvl_colors?.text ?? "#D4D4D8",
            positive: json.field_3d_config.pvl_colors?.positive ?? "#FFB366",
            negative: json.field_3d_config.pvl_colors?.negative ?? "#82B1FF",
            field_line: json.field_3d_config.pvl_colors?.field_line ?? "#42A5F5",
        },
    };
    const simHtml = assembleField3DHtml(themedConfig);

    const states = json.epic_l_path?.states ?? {};
    const orderedIds = Object.keys(states).sort((a, b) => stateNumber(a) - stateNumber(b));
    const stateInfo = orderedIds.map((id) => ({ id, title: states[id].title ?? id }));
    const stateNarration: Record<string, string[]> = {};
    for (const id of orderedIds) {
        stateNarration[id] = (states[id].teacher_script?.tts_sentences ?? [])
            .map((s) => (s.text_en ?? "").replace(/\*\*/g, "").replace(/\s+/g, " ").trim())
            .filter((t) => t.length > 0);
    }

    const moves = getConceptMoves(conceptId);

    return (
        <VoiceProfessorClient
            conceptId={conceptId}
            conceptName={json.concept_name ?? conceptId}
            simHtml={simHtml}
            states={stateInfo}
            stateNarration={stateNarration}
            moves={moves}
            actor={actor}
            fontClass={fraunces.variable}
        />
    );
}
