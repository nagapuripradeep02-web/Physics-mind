// Admin scratch page — verifies magnetic_force_moving_charge (Diamond #2 of
// the magnetism chapter, archetype B — force-in-field) end-to-end through the
// production assembleField3DHtml + Three.js field_3d renderer + concept JSON
// path. Reachable at /admin/test-magnetic-force-moving-charge.
//
// Renders each EPIC-L state directly from the embedded `field_3d_config` block
// in src/data/concepts/magnetic_force_moving_charge.json — bypassing the live
// Sonnet pipeline (CLAUDE.md Rule 18) so authoring is deterministic. Mirrors
// the pattern used by /admin/test-magnetic-field-wire (Diamond #1).
//
// Iteration 3 (founder feedback session 2026-05-11): 5-state arc with motion
// in every state (θ = 0 → 10 → 45 → 90 → interactive). Right-hand-rule overlay
// visible in every state. Per-state "▶ Play TTS" button so the founder can
// audition the teacher_script verbatim via Web Speech API.
//
// Iteration 4 (2026-05-11, evening): Fleming's left-hand rule promoted to its
// own dedicated STATE_5 (Class-10 mnemonic reconciliation). SVG redrawn as
// three-fingered palm matching DC Pandey Fig. 26.1, rotated so forefinger is
// UP to match the scene's vertical B field. Original STATE_5/6 renumbered to
// STATE_6/7 — arc is now 7 states (θ=0 → 10 → 45 → 90 → Fleming bridge →
// decomposition → interactive). Centripetal-F orbit-math bug fixed (u2 basis
// handedness + vDir chargeSign in circle/helix branches).
//
// Iteration 5 (2026-05-12, glow-pulse calibration): every TTS sentence carries
// a `glow` target — when a sentence speaks, the matching scene element pulses
// softly. Pulse formula converged over 5 sub-iterations to a DC-offset design:
// `1.35 + 0.35·sin(time·3.5)`, range [1.0, 1.7], 1.8-sec period — always
// elevated above the un-glowed baseline so the highlight is visible at every
// phase. HTML overlays (Fleming SVG, sliders panel) glow via a matching
// `.glow-pulse` CSS keyframe (amber box-shadow + border pulse).
//
// Iteration 6 (2026-05-14, pause + co-glow choreography): when a sentence
// narrates a hand-rule step or an arrow property, the simulation pauses /
// freezes / co-glows in sync. Five new mechanisms shipped:
//   (a) hand-phase freeze — `hand_phase: 'v'|'b'|'f'` locks the 3D right-hand
//       mesh at curlT 0 / 0.5 / 1 while the sentence speaks. Used by s4_3b/c/d
//       and s6_6b/c/d.
//   (b) proton-position freeze — `freeze_proton: true` snapshots the proton's
//       trajectory time so the F / v arrows stay readable mid-narration. Used
//       by s2_2, s2_3, s3_2, s4_2b.
//   (c) co-glow array — `glow` accepts a JSON array so two scene elements can
//       pulse together for sentences that name them in one breath (e.g.
//       "v cosθ along B" → `["v_parallel","b"]`). Used by s2_2 (f+v+b), s3_1a,
//       s5_2a/b/c, s6_2, s6_3a, s6_4a.
//   (d) per-finger Fleming SVG glow — `fleming_index`, `fleming_middle`,
//       `fleming_thumb` targets via `<g id="...">` wrappers + new
//       `flemingFingerGlow` keyframe (filter: drop-shadow + scale 1.05). Used
//       by s5_2a/b/c alongside scene co-glow.
//   (e) entry-phase trajectory — `entry_duration: number` on a helix-mode
//       state inserts a straight-line approach BEFORE the helix begins,
//       joining the helix tangent seamlessly at `tLocal = entry_duration`.
//       Companion `RESET_TRAJECTORY` postMessage fires automatically on ▶
//       Play TTS so the entry plays in sync with sentence 1. Used by STATE_3
//       (entry_duration 2.6 s) — proton enters the field at 45° before the
//       helix kicks in; s3_1 split into s3_1a ("watch the proton enter…")
//       and s3_1b ("now inside the field, the Lorentz force kicks in…").
//
// Iteration 7 (2026-06-10, A5 patch): "magnetic force does no work → speed
// constant" promoted out of the overloaded STATE_4 into its own dedicated
// STATE_5 (predict→reveal: the v arrow swings while the equal-arc trail proves
// |v| constant; formula overlay F⊥v → F·v=0). Fleming / why-sinθ / interactive
// renumbered STATE_5/6/7 → STATE_6/7/8 — the arc is now 8 states. Cross-refs
// (entry_state_map, EPIC-C branches, aha_moment, captions) updated; tsc +
// validate:concepts PASS. STATES_TO_VERIFY below extended to all 8 states.
//
// All mechanisms catalogued in detail at docs/patterns/magnetism.md §3.

import { readFileSync } from 'fs';
import { join } from 'path';
import {
    assembleField3DHtml,
    type Field3DConfig,
} from '@/lib/renderers/field_3d_renderer';
import { TtsPlayButton, type TtsSentence } from './_TtsPlayButton';

type ConceptJson = {
    concept_id: string;
    concept_name: string;
    field_3d_config?: Field3DConfig;
    epic_l_path?: {
        states?: Record<
            string,
            {
                title?: string;
                teacher_script?: {
                    tts_sentences?: Array<{
                        text_en?: string;
                        glow?: string | string[] | null;
                        math_show?: string | null;
                        math_persist?: boolean;
                        hand_phase?: 'v' | 'b' | 'f' | null;
                        freeze_proton?: boolean;
                    }>;
                };
            }
        >;
    };
};

function loadConcept(): ConceptJson {
    const path = join(
        process.cwd(),
        'src',
        'data',
        'concepts',
        'magnetic_force_moving_charge.json',
    );
    return JSON.parse(readFileSync(path, 'utf-8')) as ConceptJson;
}

function buildConfigForState(stateId: string): Field3DConfig | null {
    const json = loadConcept();
    const base = json.field_3d_config;
    if (!base) return null;
    const requested = base.states?.[stateId];
    if (!requested) return base;
    return {
        ...base,
        states: {
            ...base.states,
            STATE_1: requested,
        },
    };
}

const STATES_TO_VERIFY: Array<{ id: string; description: string }> = [
    {
        id: 'STATE_1',
        description:
            'θ = 0° — v parallel to B. Orange v arrow aligned with vertical blue B grid. Particle drifts straight; F vector absent (F = 0). Right-hand-rule overlay visible top-left.',
    },
    {
        id: 'STATE_2',
        description:
            'θ = 10° — v tilted slightly off B. Path is a long stretched helix (slow drift along B + tiny circles ⊥ B). Green F arrow is short (sin 10° ≈ 0.17).',
    },
    {
        id: 'STATE_3',
        description:
            'θ = 45° — helix tightens. F is over 4× larger than at θ = 10° (sin 45° ≈ 0.71). Circular motion now dominates over drift. No decomposition here — pure narrative of "F grows with θ".',
    },
    {
        id: 'STATE_4',
        description:
            'θ = 90° — pure circle. F at maximum, always pointing to circle centre. r = mv/(qB), T = 2πm/(qB). Equal trail-spacing proves |v| constant.',
    },
    {
        id: 'STATE_5',
        description:
            'A5 (NEW) — Speed never changes; magnetic force does no work. Same θ = 90° circle continues. The orange v arrow swings to a new direction every instant, while the equal-arc trail dots prove |v| is constant. Bottom-right formula overlay: F ⊥ v → F·v = 0 → Δ(½mv²) = 0 → |v| constant. Predict→reveal beat (advance_mode wait_for_answer); confronts the #1 misconception "a stronger field makes it go faster".',
    },
    {
        id: 'STATE_6',
        description:
            'Fleming’s left-hand rule reconciliation — Class-10 mnemonic shown as a top-left SVG overlay (ForeFinger=B, seCond=v, thuMb=F). Same θ = 90° circular scene continues. Caption notes the scope: works for +q only; right-hand rule stays canonical for negative charges and any θ ≠ 90°.',
    },
    {
        id: 'STATE_7',
        description:
            'Why sin θ? — v decomposed into v cos θ (grey, along B — does nothing) and v sin θ (orange dashed, ⊥ B — makes F). Labels visible on every arrow. Decomposition reveals F = q · (v sin θ) · B.',
    },
    {
        id: 'STATE_8',
        description:
            'Interactive — top-right sliders for q sign, |v|, B, θ. Bottom-right formula overlay. Drag the angle slider from 0 → 90 to feel the path morph straight → helix → circle.',
    },
];

export default function MagneticForceMovingChargeTestPage() {
    const json = loadConcept();
    return (
        <div
            style={{
                padding: 16,
                fontFamily: 'system-ui, sans-serif',
                backgroundColor: '#0A0A1A',
                minHeight: '100vh',
                color: '#E5E7EB',
            }}
        >
            <h1 style={{ fontSize: 18, marginBottom: 4 }}>
                magnetic_force_moving_charge — end-to-end verification
            </h1>
            <p style={{ fontSize: 12, opacity: 0.65, maxWidth: 920, marginBottom: 16 }}>
                {json.concept_name}. Renders all 8 EPIC-L states of{' '}
                <code>magnetic_force_moving_charge.json</code> through the production{' '}
                <code>assembleField3DHtml</code> path, reading the embedded{' '}
                <code>field_3d_config</code> block directly (no Sonnet runtime call).
                Three.js loads <code>r128</code> from CDN; drag any iframe to rotate
                the 3D scene, scroll to zoom. Use the green ▶ button under each iframe
                to hear that state&apos;s <code>teacher_script</code>.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {STATES_TO_VERIFY.map(({ id, description }) => {
                    const cfg = buildConfigForState(id);
                    if (!cfg) {
                        return (
                            <section key={id}>
                                <h2 style={{ fontSize: 14, color: '#EF5350' }}>
                                    {id} — ERROR: no field_3d_config in concept JSON
                                </h2>
                            </section>
                        );
                    }
                    const html = assembleField3DHtml(cfg);
                    const stateMeta = json.epic_l_path?.states?.[id];
                    const title = stateMeta?.title ?? id;
                    const sentences: TtsSentence[] =
                        stateMeta?.teacher_script?.tts_sentences
                            ?.map((s) => ({
                                text: s.text_en ?? '',
                                glow: s.glow ?? null,
                                math_show: s.math_show ?? null,
                                math_persist: s.math_persist === true,
                                hand_phase: s.hand_phase ?? null,
                                freeze_proton: s.freeze_proton === true,
                            }))
                            .filter((s) => s.text.length > 0) ?? [];
                    return (
                        <section key={id}>
                            <h2
                                style={{
                                    fontSize: 14,
                                    marginBottom: 4,
                                    color: '#FCD34D',
                                }}
                            >
                                {id} — {title}
                            </h2>
                            <p
                                style={{
                                    fontSize: 11,
                                    opacity: 0.65,
                                    marginBottom: 8,
                                    maxWidth: 760,
                                }}
                            >
                                {description}
                            </p>
                            <iframe
                                srcDoc={html}
                                style={{
                                    width: 820,
                                    height: 540,
                                    border: '1px solid #1F2937',
                                    backgroundColor: '#0A0A1A',
                                }}
                                title={`${id}-render`}
                            />
                            {sentences.length > 0 ? (
                                <TtsPlayButton
                                    sentences={sentences}
                                    iframeTitle={`${id}-render`}
                                    label={id}
                                />
                            ) : null}
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
