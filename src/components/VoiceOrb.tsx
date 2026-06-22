"use client";

import { forwardRef } from "react";

/**
 * VoiceOrb — a soft, living terracotta sphere shown on the mic during a voice
 * turn (ChatGPT-voice-style, in our brand colour). Pure-CSS internal motion; the
 * parent drives live mic amplitude by setting the `--amp` CSS variable (0..1) on
 * this element. `active` pops it in / out. Styling lives in globals.css
 * (`.voice-orb*` + `orb-*` keyframes). It is pointer-events-none so taps pass
 * through to the mic button it overlays.
 */
export const VoiceOrb = forwardRef<HTMLDivElement, { active: boolean; className?: string }>(
    function VoiceOrb({ active, className = "" }, ref) {
        return (
            <div ref={ref} data-active={active ? "true" : "false"} className={`voice-orb ${className}`}>
                <div className="voice-orb__sphere">
                    <span className="voice-orb__blob voice-orb__blob--a" />
                    <span className="voice-orb__blob voice-orb__blob--b" />
                    <span className="voice-orb__blob voice-orb__blob--c" />
                    <span className="voice-orb__sheen" />
                </div>
            </div>
        );
    },
);
