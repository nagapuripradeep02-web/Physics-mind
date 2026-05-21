// Admin scratch page — verifies torque_on_current_loop_in_field (Diamond #3 of
// the magnetism chapter, phase M2 of MAGNETISM_ARCHITECTURE.md, archetype C —
// closed-loop rotational dynamics) end-to-end through the production
// assembleField3DHtml + Three.js field_3d renderer + concept JSON path.
// Reachable at /admin/test-torque-on-current-loop-in-field.
//
// Renders all 7 EPIC-L states directly from the embedded `field_3d_config`
// block in src/data/concepts/torque_on_current_loop_in_field.json — bypassing
// the live Sonnet pipeline (CLAUDE.md Rule 18) so authoring is deterministic.
// Mirrors the pattern from Diamond #1 (magnetic_field_wire) and Diamond #2
// (magnetic_force_moving_charge).
//
// Rule 20 magnetism M1–M6 exception applies: ships conceptual-only.
// mode_overrides.board → retrofit at M7. mode_overrides.competitive → M8.

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
                        pause_after_ms?: number | null;
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
        'torque_on_current_loop_in_field.json',
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
            'Setup — rectangular yellow current loop sits in a uniform horizontal blue B field at θ = 90°. Current direction arrows visible on each side of the loop. No force vectors yet.',
    },
    {
        id: 'STATE_2',
        description:
            'F₁ on the LEFT side reveals — RHR (thumb up along current, fingers right along B → palm into page) → F₁ INTO the page. Magnitude F = I·L·B ≈ 0.005 N at defaults.',
    },
    {
        id: 'STATE_3',
        description:
            'F₂ on the RIGHT side reveals — current flows DOWN, B still right → F₂ OUT of the page. F₁ and F₂ are equal-and-opposite. ΣF = 0 badge appears.',
    },
    {
        id: 'STATE_4',
        description:
            'Torque emerges from the couple. ΣF = 0 yet Στ ≠ 0. Magenta τ-arrow appears along the vertical rotation axis. Loop begins to rotate slowly toward θ = 60°.',
    },
    {
        id: 'STATE_5',
        description:
            'Magnetic moment μ = NIA revealed as a yellow vector through the loop face (RHR: fingers curl with I, thumb gives μ). Sliders for N, I, L_side scale μ live.',
    },
    {
        id: 'STATE_6',
        description:
            'θ sweep 0° → 180°. τ-arrow scales as sin θ. Max at 90°. Zero at 0° (stable equilibrium, μ ∥ B) and 180° (unstable). Theta slider drives the rotation interactively.',
    },
    {
        id: 'STATE_7',
        description:
            'Toggle: loop ↔ bar magnet (red N pole / blue S pole). Same μ direction, same τ. Oscillation animation about θ = 0 (stable equilibrium) when released from θ = 60°.',
    },
];

export default function TorqueOnCurrentLoopInFieldTestPage() {
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
                torque_on_current_loop_in_field — end-to-end verification (Diamond #3)
            </h1>
            <p style={{ fontSize: 12, opacity: 0.65, maxWidth: 920, marginBottom: 16 }}>
                {json.concept_name}. Renders all 7 EPIC-L states of{' '}
                <code>torque_on_current_loop_in_field.json</code> through the
                production <code>assembleField3DHtml</code> path, reading the embedded{' '}
                <code>field_3d_config</code> block directly (no Sonnet runtime call).
                Phase M2 of MAGNETISM_ARCHITECTURE.md — archetype C (closed-loop
                rotational dynamics). Drag to orbit the 3D scene; scroll to zoom. Use
                the green ▶ button under each iframe to hear that state&apos;s{' '}
                <code>teacher_script</code>.
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
                                pause_after_ms: s.pause_after_ms ?? null,
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
