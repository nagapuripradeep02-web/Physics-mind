"use client";

import LearnConceptTab from "@/components/sections/LearnConceptTab";

/**
 * BoardExamTab is the board-exam learning surface.
 *
 * Visually and functionally mirrors LearnConceptTab (chat + answer-sheet
 * simulation + deep-dive + drill-down), but pins `section="board"` so every
 * chat/sim request flows through the board-mode pipeline:
 *  - `/api/chat` receives section='board' → NCERT-format explanation.
 *  - `/api/generate-simulation` receives examMode='board' → applyBoardMode()
 *    swaps scene_composition for derivation_sequence, canvas_style flips to
 *    'answer_sheet', iframe background becomes #FDFBF4 ruled paper.
 *
 * BoardExamTab does not take `onGoToCompetitive`, since board students can
 * cross-navigate via the left sidebar instead of an inline CTA.
 */
export default function BoardExamTab() {
    return (
        <LearnConceptTab
            section="board"
            onGoToCompetitive={() => {
                /* Cross-nav from Board Exam to Competitive happens via the
                   left sidebar. No inline CTA wired. */
            }}
        />
    );
}
