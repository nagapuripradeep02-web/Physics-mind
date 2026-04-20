"use client";

/**
 * SubSimPlayer — plays back a deep-dive or drill-down sub-simulation.
 *
 * Thin iframe-based player built on top of the existing parametric renderer.
 * The server (api/deep-dive or api/drill-down) has already assembled the full
 * HTML via assembleParametricHtml, so all we do here is:
 *
 *   1. srcDoc the HTML into an iframe
 *   2. Walk through the teacher_script_flat entries one sentence at a time
 *      (fixed 4s per sentence, pausable)
 *   3. When the STATE prefix of the current sentence changes, postMessage
 *      {type:'SET_STATE', state: <new_state>} to the iframe so its renderer
 *      advances. This matches the contract that TeacherPlayer uses for the
 *      main sim.
 *
 * Fixed per-sentence pacing is intentional: sub-sims are short (2-6 states,
 * each with 2-4 sentences) so a predictable cadence is better than trying to
 * estimate TTS-timing client-side.
 */

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

// Fallback per-sentence duration when the deep-dive generator didn't emit a
// per-sentence duration_ms (older cached rows, or Sonnet miss). New generations
// should always carry duration_ms in the 3000-6000 ms range.
const MS_PER_SENTENCE_FALLBACK = 4000;

export interface TeacherScriptSentence {
    id: string;
    text: string;
    /** Per-sentence pacing emitted by Sonnet (B3). When absent, falls back to
     *  MS_PER_SENTENCE_FALLBACK. Range authored as 3000-6000 ms based on
     *  sentence word count. */
    duration_ms?: number;
}

interface Props {
    simHtml: string;
    teacherScript: TeacherScriptSentence[];
    heightPx?: number;
}

/**
 * The id format from the Sonnet generator prompts is
 * `<STATE_KEY>_s<N>` (e.g. `STATE_3_DD1_s2` or `DR_1_s1`). Strip the trailing
 * `_s<N>` to get the parent state key.
 */
function stateKeyFromId(id: string | undefined): string | null {
    if (!id) return null;
    const m = id.match(/^(.+?)_s\d+$/);
    return m ? m[1] : id;
}

export default function SubSimPlayer({ simHtml, teacherScript, heightPx = 340 }: Props) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [simReady, setSimReady] = useState(false);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isComplete, setIsComplete] = useState(false);
    const sentRef = useRef<string | null>(null); // last state key sent to iframe

    // Listen for SIM_READY from the iframe
    useEffect(() => {
        function handler(e: MessageEvent) {
            if (e.source !== iframeRef.current?.contentWindow) return;
            if (e.data?.type === "SIM_READY") setSimReady(true);
        }
        window.addEventListener("message", handler);
        return () => window.removeEventListener("message", handler);
    }, []);

    // When the current sentence's state prefix changes, notify the iframe.
    useEffect(() => {
        if (!simReady) return;
        const id = teacherScript[currentIdx]?.id;
        const stateKey = stateKeyFromId(id);
        if (!stateKey) return;
        if (sentRef.current === stateKey) return;
        iframeRef.current?.contentWindow?.postMessage(
            { type: "SET_STATE", state: stateKey },
            "*"
        );
        sentRef.current = stateKey;
    }, [currentIdx, simReady, teacherScript]);

    // Auto-advance through sentences on a per-sentence timer driven by the
    // sentence's authored `duration_ms` (B3). Stops at the last sentence and
    // sets isComplete; user can click replay to restart.
    useEffect(() => {
        if (!isPlaying || isComplete || teacherScript.length === 0) return;
        const current = teacherScript[currentIdx];
        const authored = current?.duration_ms;
        const delay = (typeof authored === 'number' && authored >= 1500 && authored <= 10000)
            ? authored
            : MS_PER_SENTENCE_FALLBACK;
        const timeout = setTimeout(() => {
            setCurrentIdx(idx => {
                if (idx + 1 >= teacherScript.length) {
                    setIsPlaying(false);
                    setIsComplete(true);
                    return idx;
                }
                return idx + 1;
            });
        }, delay);
        return () => clearTimeout(timeout);
    }, [currentIdx, isPlaying, isComplete, teacherScript]);

    function handlePlayPause() {
        if (isComplete) {
            // Replay from the start
            setCurrentIdx(0);
            sentRef.current = null;
            setIsComplete(false);
            setIsPlaying(true);
            const firstStateKey = stateKeyFromId(teacherScript[0]?.id);
            if (firstStateKey && simReady) {
                iframeRef.current?.contentWindow?.postMessage(
                    { type: "SET_STATE", state: firstStateKey },
                    "*"
                );
                sentRef.current = firstStateKey;
            }
            return;
        }
        setIsPlaying(p => !p);
    }

    const currentSentence = teacherScript[currentIdx]?.text ?? "";
    const totalSentences = teacherScript.length;

    return (
        <div className="flex flex-col gap-2">
            <div
                className="relative rounded border border-zinc-800 overflow-hidden bg-black"
                style={{ height: heightPx }}
            >
                <iframe
                    ref={iframeRef}
                    srcDoc={simHtml}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin"
                    title="Sub-simulation"
                />
                {!simReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs text-zinc-400">
                        Loading simulation…
                    </div>
                )}
            </div>

            {/* Controls + progress + current sentence */}
            <div className="flex items-start gap-2">
                <button
                    type="button"
                    onClick={handlePlayPause}
                    className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 transition text-white"
                    title={isComplete ? "Replay" : isPlaying ? "Pause" : "Play"}
                    aria-label={isComplete ? "Replay" : isPlaying ? "Pause" : "Play"}
                >
                    {isComplete ? (
                        <RotateCcw className="w-3.5 h-3.5" />
                    ) : isPlaying ? (
                        <Pause className="w-3.5 h-3.5" />
                    ) : (
                        <Play className="w-3.5 h-3.5 ml-0.5" />
                    )}
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                        {teacherScript.map((_, i) => (
                            <div
                                key={i}
                                className={`rounded-full shrink-0 transition-all duration-300 ${
                                    i < currentIdx
                                        ? "w-2.5 h-2.5 bg-blue-500"
                                        : i === currentIdx
                                            ? "w-3 h-2.5 bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.6)]"
                                            : "w-2.5 h-2.5 bg-zinc-700"
                                }`}
                            />
                        ))}
                        <span className="ml-auto text-[10px] text-zinc-500">
                            {currentIdx + 1} / {totalSentences}
                        </span>
                    </div>
                    <p className="text-[13px] text-zinc-200 leading-relaxed">{currentSentence}</p>
                </div>
            </div>
        </div>
    );
}
