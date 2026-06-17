'use client';

// Tiny Web-Speech-API "play TTS" button for the force_on_current_carrying_wire
// (concept A15) admin verification page. Copied verbatim from the sibling
// diamond's _TtsPlayButton (test-magnetic-force-moving-charge) — same glow /
// math / hand-phase / freeze postMessage contract, so it drives the field_3d
// renderer identically. Reads plain-English strings (each optionally tagged
// with a glow target) and speaks them in sequence on click. Click again to stop.
//
// Per CLAUDE.md / MEMORY (feedback_tts_unlock_pattern): Web Speech needs a
// gesture-unlock before speech can play. The button click IS that gesture.

import { useEffect, useRef, useState } from 'react';

export type TtsSentence = {
    text: string;
    /** Element(s) to pulse-highlight while this sentence speaks. Single string
     *  for one target, OR an array for co-glow. For A15 the valid glow targets
     *  match the force_on_current_wire extras keys:
     *    'wire'                 — the orange current-carrying wire + its label
     *    'b'                    — ambient B-field grid arrows
     *    'f_net'                — the net force arrow F
     *    'charge_arrows'        — per-carrier qv_dB arrows (STATE_2)
     *    'F_net_arrow'          — summed force arrow (STATE_2 build-from-sum)
     *    'hand'                 — 3D right-hand mesh (STATE_3 RHR on L,B)
     *    'decoy_30_angle'       — the wrong 30° angle (STATE_4 trap)
     *    'true_90_arc'          — the true θ(L,B) arc (STATE_4)
     *    'bent_wire'            — the zig-zag wire (STATE_5)
     *    'chord_arrow'          — the straight chord L_chord (STATE_5)
     *    'square_loop'          — the closed loop (STATE_6)
     *    'side_forces'          — opposite-side force couple (STATE_6)
     *    'sliders'              — STATE_7 sliders panel
     *    null / undefined       — clear / no glow */
    glow?: string | string[] | null;
    /** LaTeX expression to render in the iframe's #equation_panel while
     *  this sentence is speaking. */
    math_show?: string | null;
    /** When true, math_show appends below the previous equation(s) instead of
     *  replacing them — used for building up the STATE_2 derivation. */
    math_persist?: boolean;
    /** Freeze the 3D right-hand mesh at the named phase while this sentence
     *  speaks (STATE_3 RHR cycle): 'v' (fingers along L), 'b' (curl toward B),
     *  'f' (thumb along F). null/undefined → resume the default cycle. */
    hand_phase?: 'v' | 'b' | 'f' | null;
    /** Freeze the moving element at its current position while this sentence
     *  speaks (kept for contract parity with the sibling renderer). */
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
        window.speechSynthesis.getVoices();
    }, []);

    function pickVoice(): SpeechSynthesisVoice | null {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) return null;
        const local = voices.filter((v) => v.localService);
        const pool = local.length > 0 ? local : voices;
        return (
            pool.find((v) => v.lang === 'en-IN') ??
            pool.find((v) => v.lang === 'en-US') ??
            pool.find((v) => v.lang.startsWith('en')) ??
            pool[0]
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
