'use client';

// Tiny Web-Speech-API "play TTS" button for the Diamond #2 admin verification
// page. Reads a list of plain-English strings (each optionally tagged with a
// "glow target") and speaks them in sequence on click. Click again to stop.
//
// Per CLAUDE.md / MEMORY (feedback_tts_unlock_pattern): Web Speech needs a
// gesture-unlock before speech can play. The button click IS that gesture.
//
// In addition to speaking, each sentence may carry a `glow` field naming a
// 3D vector to highlight while it speaks. The button postMessages the
// matching iframe ({ type: 'SET_GLOW', target: '...' }) so the renderer can
// pulse the corresponding label + arrow. Cleared at the end of each
// sentence (and on stop / completion).

import { useEffect, useRef, useState } from 'react';

export type TtsSentence = {
    text: string;
    /** Element(s) to pulse-highlight while this sentence speaks. Pass a single
     *  string for one target, OR an array of strings for co-glow (multiple
     *  elements pulse simultaneously). Valid values (see patterns/magnetism.md
     *  §7 for the rule-of-thumb chooser):
     *    'v' | 'f' | 'v_parallel' | 'v_perp'  — vector arrows + their labels
     *    'b'                                  — ambient B-field grid arrows
     *    'trail'                              — orbital particle trail
     *    'hand'                               — 3D right-hand mesh
     *    'fleming'                            — Fleming SVG overlay (whole panel)
     *    'fleming_index' | 'fleming_middle' | 'fleming_thumb'
     *                                         — one finger of the Fleming SVG
     *    'sliders'                            — STATE_7 sliders panel
     *    null / undefined                     — clear / no glow
     *  Pulse: 3D scale range [1.0, 1.7] (always above un-glowed baseline) or
     *  amber halo (HTML overlays). 1.8-sec period — visible at every phase,
     *  not a strobe.
     *  Use a single string when one element dominates the sentence; use an
     *  array when two co-equal elements are both named (e.g. "v cosθ along B"
     *  → ["v_parallel", "b"]). Hand-rule cycle sentences (s4_3b/c/d, s6_6b/c/d)
     *  use single-target glow + hand_phase, not arrays. */
    glow?: string | string[] | null;
    /** LaTeX expression to render in the iframe's #equation_panel while
     *  this sentence is speaking. Cleared on sentence end unless a later
     *  sentence persists. */
    math_show?: string | null;
    /** When true, this sentence's math_show appends below the previous
     *  equation(s) instead of replacing them — used for building up a
     *  derivation step by step. */
    math_persist?: boolean;
    /** Pause+co-glow choreography (founder note 2026-05-14): while this
     *  sentence speaks, freeze the 3D right-hand mesh at the named phase
     *  so the student can read the hand-rule label without the gesture
     *  cycling away. Valid:
     *    'v' → flat palm (fingers along velocity)
     *    'b' → mid-curl (fingertips through B)
     *    'f' → full curl (thumb along force)
     *    null/undefined → resume the default 9-sec cycle.
     *  Combine with `glow` to simultaneously highlight the matching scene
     *  vector (e.g. hand frozen at 'v' + glow='v' on the proton arrow). */
    hand_phase?: 'v' | 'b' | 'f' | null;
    /** Pause the proton at its current trajectory position while this sentence
     *  speaks (founder note 2026-05-14). Use when the script narrates the F or
     *  v arrow itself — a frozen base makes the arrow readable; a moving base
     *  drags it across the canvas mid-sentence. Glow + hand cycle keep ticking.
     *  Cleared automatically on sentence end / stop. */
    freeze_proton?: boolean;
};

interface TtsPlayButtonProps {
    sentences: TtsSentence[];
    iframeTitle?: string;
    label?: string;
}

export function TtsPlayButton({ sentences, iframeTitle, label }: TtsPlayButtonProps) {
    const [playing, setPlaying] = useState(false);
    const cancelledRef = useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        // Warm-load the voice list — populates asynchronously on first call.
        window.speechSynthesis.getVoices();
    }, []);

    function pickVoice(): SpeechSynthesisVoice | null {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) return null;
        return (
            voices.find((v) => v.lang === 'en-IN') ??
            voices.find((v) => v.lang === 'en-US') ??
            voices.find((v) => v.lang.startsWith('en')) ??
            voices[0]
        );
    }

    function getIframeWindow(): Window | null {
        if (typeof window === 'undefined' || !iframeTitle) return null;
        const iframe = document.querySelector(
            `iframe[title="${iframeTitle}"]`,
        ) as HTMLIFrameElement | null;
        return iframe?.contentWindow ?? null;
    }

    function sendGlow(target: string | string[] | null) {
        const cw = getIframeWindow();
        if (!cw) return;
        cw.postMessage({ type: 'SET_GLOW', target }, '*');
    }

    function sendMath(expression: string | null, persist: boolean) {
        const cw = getIframeWindow();
        if (!cw) return;
        cw.postMessage({ type: 'SET_MATH', expression, persist }, '*');
    }

    function sendHandPhase(phase: 'v' | 'b' | 'f' | null) {
        const cw = getIframeWindow();
        if (!cw) return;
        cw.postMessage({ type: 'SET_HAND_PHASE', phase }, '*');
    }

    function sendFreezeProton(frozen: boolean) {
        const cw = getIframeWindow();
        if (!cw) return;
        cw.postMessage({ type: 'SET_FREEZE_PROTON', frozen }, '*');
    }

    function sendResetTrajectory() {
        const cw = getIframeWindow();
        if (!cw) return;
        cw.postMessage({ type: 'RESET_TRAJECTORY' }, '*');
    }

    function stop() {
        cancelledRef.current = true;
        window.speechSynthesis.cancel();
        sendGlow(null);
        sendMath(null, false);
        sendHandPhase(null);
        sendFreezeProton(false);
        setPlaying(false);
    }

    function play() {
        if (sentences.length === 0) return;
        cancelledRef.current = false;
        setPlaying(true);
        // Replay any entry-phase trajectory (STATE_3 etc.) from t=0 so the
        // motion is visible in sync with sentence 1.
        sendResetTrajectory();
        const voice = pickVoice();

        const speakAt = (i: number) => {
            if (cancelledRef.current) {
                sendGlow(null);
                sendMath(null, false);
                sendHandPhase(null);
                sendFreezeProton(false);
                return;
            }
            if (i >= sentences.length) {
                sendGlow(null);
                sendMath(null, false);
                sendHandPhase(null);
                sendFreezeProton(false);
                setPlaying(false);
                return;
            }
            const item = sentences[i];
            const utter = new SpeechSynthesisUtterance(item.text);
            utter.rate = 1.0;
            utter.pitch = 1.0;
            utter.lang = voice?.lang ?? 'en-US';
            if (voice) utter.voice = voice;
            sendGlow(item.glow ?? null);
            sendHandPhase(item.hand_phase ?? null);
            sendFreezeProton(item.freeze_proton === true);
            // Update equation panel BEFORE speaking, so the student sees the
            // math the instant they hear it referenced. Cleared by the next
            // sentence (replace) or persisted into a derivation chain.
            if (item.math_show) {
                sendMath(item.math_show, item.math_persist === true);
            } else if (!item.math_persist) {
                sendMath(null, false);
            }
            utter.onend = () => {
                sendGlow(null);
                sendHandPhase(null);
                sendFreezeProton(false);
                speakAt(i + 1);
            };
            utter.onerror = () => {
                sendGlow(null);
                sendHandPhase(null);
                sendFreezeProton(false);
                speakAt(i + 1);
            };
            window.speechSynthesis.speak(utter);
        };
        speakAt(0);
    }

    return (
        <button
            type="button"
            onClick={playing ? stop : play}
            style={{
                marginTop: 6,
                marginBottom: 4,
                padding: '6px 12px',
                background: playing ? '#EF5350' : '#66BB6A',
                color: '#0A0A1A',
                border: 'none',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: 'system-ui, sans-serif',
            }}
        >
            {playing ? '⏹  Stop TTS' : '▶  Play TTS'}
            {label ? ` — ${label}` : ''}
        </button>
    );
}
