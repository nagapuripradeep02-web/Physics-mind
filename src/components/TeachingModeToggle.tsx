"use client";

/**
 * Teaching mode toggle — Conceptual / Board / Competitive.
 *
 * Distinct from `ModeToggle.tsx` which toggles ChatMode (competitive/board/both)
 * for the chat prompt style. This one controls the simulation `examMode` /
 * `section` passed to /api/chat + /api/generate-simulation, and drives the
 * applyBoardMode merge for board-mode answer-sheet rendering (Phase C.1).
 */

export type TeachingMode = "conceptual" | "board" | "competitive";

interface Props {
    mode: TeachingMode;
    onChange: (mode: TeachingMode) => void;
    disabled?: boolean;
    /** "inline" = no row wrapper, just the buttons; "bar" (default) = full-width row */
    variant?: "bar" | "inline";
}

const MODE_META: Record<TeachingMode, { label: string; short: string; activeClass: string; hint: string }> = {
    conceptual: {
        label: "📘 Conceptual",
        short: "Conceptual",
        activeClass: "bg-blue-600 text-white shadow-sm",
        hint: "Full explanation — hook, mechanism, formula, edge cases.",
    },
    board: {
        label: "✍️ Board",
        short: "Board",
        activeClass: "bg-emerald-600 text-white shadow-sm",
        hint: "Answer-sheet derivation — step-by-step handwriting for exam reproduction.",
    },
    competitive: {
        label: "⚡ JEE/NEET",
        short: "JEE",
        activeClass: "bg-amber-600 text-white shadow-sm",
        hint: "Shortcuts, edge cases, competitive traps.",
    },
};

export default function TeachingModeToggle({ mode, onChange, disabled, variant = "bar" }: Props) {
    const buttons = (Object.keys(MODE_META) as TeachingMode[]).map(m => {
        const meta = MODE_META[m];
        const isActive = mode === m;
        const inline = variant === "inline";
        return (
            <button
                key={m}
                type="button"
                onClick={() => !disabled && !isActive && onChange(m)}
                disabled={disabled}
                title={meta.hint}
                aria-pressed={isActive}
                className={`${inline ? "h-7 px-2.5 text-[11px]" : "px-3 py-1 text-[12px]"} font-semibold rounded transition ${
                    isActive
                        ? meta.activeClass
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {inline ? meta.short : meta.label}
            </button>
        );
    });

    if (variant === "inline") {
        return <div className="flex items-center gap-1">{buttons}</div>;
    }

    return (
        <div className="flex items-center gap-1 px-3 py-1.5 bg-zinc-950 border-b border-zinc-800">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide mr-2">Mode</span>
            {buttons}
            <span className="ml-auto text-[10px] text-zinc-600 italic hidden md:inline">
                {mode === "board" && "Switches the sim to answer-sheet style."}
                {mode === "competitive" && "Switches the sim to shortcut/edge-case style."}
            </span>
        </div>
    );
}
