'use client';

// Tiny Web-Speech-API "play TTS" button for the Diamond #3 admin verification
// page. Reads a list of plain-English strings (each optionally tagged with a
// "glow target") and speaks them in sequence on click. Click again to stop.
//
// Per CLAUDE.md / MEMORY (feedback_tts_unlock_pattern): Web Speech needs a
// gesture-unlock before speech can play. The button click IS that gesture.
//
// Each sentence may carry a `glow` field naming a 3D vector to highlight while
// it speaks. The button postMessages the iframe with { type: 'SET_GLOW',
// target } so the renderer pulses the corresponding label + arrow.

import { useEffect, useRef, useState } from 'react';

export type TtsSentence = {
    text: string;
    /** Element(s) to pulse-highlight while this sentence speaks. Single string
     *  or array. Valid targets for archetype-C (loop in field):
     *    'loop'           — the rectangular current loop
     *    'side_left' | 'side_right' | 'side_top' | 'side_bottom'
     *    'f_left' | 'f_right'    — per-side force arrows
     *    'sum_zero'              — ΣF = 0 badge
     *    'mu_arrow' | 'mu_arrow_label'    — magnetic moment vector
     *    'tau_arrow'             — torque vector along rotation axis
     *    'b'                     — ambient B-field grid
     *    'theta_slider' | 'mu_slider_label'   — slider panels
     *    'theta_predict' | 'theta_reveal' | 'rotation_label' | 'aha_label' | 'stable_unstable'
     *                            — text annotations
     *    'question' | 'swap_label' | 'oscillate_label' | 'summary_label'
     *    null / undefined        — clear / no glow                                       */
    glow?: string | string[] | null;
    /** LaTeX expression to render in the iframe's #equation_panel while
     *  this sentence speaks. Cleared on sentence end unless math_persist. */
    math_show?: string | null;
    math_persist?: boolean;
    /** Milliseconds to pause after this sentence speaks. Use for Socratic
     *  prediction beats — pause silently for ~3000 ms so the student has time
     *  to predict before the reveal sentence speaks. */
    pause_after_ms?: number | null;
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

    function sendGlow(target: string | string[] | null): void {
        const cw = getIframeWindow();
        if (!cw) return;
        cw.postMessage({ type: 'SET_GLOW', target }, '*');
    }

    function sendMath(expression: string | null, persist: boolean): void {
        const cw = getIframeWindow();
        if (!cw) return;
        cw.postMessage({ type: 'SET_MATH', expression, persist }, '*');
    }

    function sendReplay(): void {
        const cw = getIframeWindow();
        if (!cw) return;
        cw.postMessage({ type: 'REPLAY_ANIMATIONS' }, '*');
    }

    function stop(): void {
        cancelledRef.current = true;
        window.speechSynthesis.cancel();
        sendGlow(null);
        sendMath(null, false);
        setPlaying(false);
    }

    function play(): void {
        if (sentences.length === 0) return;
        cancelledRef.current = false;
        setPlaying(true);
        sendReplay();
        const voice = pickVoice();

        const speakAt = (i: number): void => {
            if (cancelledRef.current) {
                sendGlow(null);
                sendMath(null, false);
                return;
            }
            if (i >= sentences.length) {
                sendGlow(null);
                sendMath(null, false);
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
            if (item.math_show) {
                sendMath(item.math_show, item.math_persist === true);
            } else if (!item.math_persist) {
                sendMath(null, false);
            }
            const pauseMs = item.pause_after_ms ?? 0;
            utter.onend = (): void => {
                sendGlow(null);
                if (pauseMs > 0) {
                    setTimeout(() => speakAt(i + 1), pauseMs);
                } else {
                    speakAt(i + 1);
                }
            };
            utter.onerror = (): void => {
                sendGlow(null);
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
                marginTop: 4,
                padding: '6px 14px',
                fontSize: 12,
                fontFamily: 'system-ui, sans-serif',
                color: '#0A0A1A',
                backgroundColor: playing ? '#FCA5A5' : '#86EFAC',
                border: '1px solid #1F2937',
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: 600,
            }}
        >
            {playing ? `■ Stop ${label ?? ''}` : `▶ Play TTS ${label ?? ''}`}
        </button>
    );
}
