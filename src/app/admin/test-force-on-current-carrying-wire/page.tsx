// Admin scratch page — verifies force_on_current_carrying_wire (concept A15,
// Ch.36 — "Magnetic Force on a Current-Carrying Wire, F = I L × B") end-to-end
// through the production assembleField3DHtml + Three.js field_3d renderer +
// concept JSON path. Reachable at /admin/test-force-on-current-carrying-wire.
//
// Mirrors /admin/test-magnetic-force-moving-charge (its prerequisite sibling
// diamond). Renders each EPIC-L state directly from the embedded
// `field_3d_config` block in
// src/data/concepts/force_on_current_carrying_wire.json — bypassing the live
// Sonnet pipeline (CLAUDE.md Rule 18) so authoring is deterministic.
//
// NOTE: the field_3d_config declares the NEW scenario_type "force_on_current_wire".
// Until the renderer-primitives stage implements that scenario branch in
// field_3d_renderer.ts (per-state extras: wire / current_arrows / charge_arrows
// / F_net_arrow / hand_3d / current_flip / decoy_30_angle / true_90_arc /
// bent_wire / chord_arrow / square_loop / side_forces), the iframes load the
// Three.js shell but the scenario geometry will be absent. This page exists so
// the next (visual) stage can iterate against a live route.

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
        'force_on_current_carrying_wire.json',
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

// Foundation-first ordering (STATE_1 → STATE_7 as authored). Descriptions match
// each STATE_N key's content (the iframe reads the JSON live).
const STATES_TO_VERIFY: Array<{ id: string; description: string }> = [
    {
        id: 'STATE_1',
        description:
            'Hook — a current-carrying wire (orange, I along +x) sits in a uniform field B (blue grid). The net force F = I L × B is named. Indian anchor: the ceiling-fan / mixer / pump motor. auto_after_tts.',
    },
    {
        id: 'STATE_2',
        description:
            'PRIMARY aha — derivation as a picture. n·A·L carriers each carry a qv_dB arrow; they stack into one F arrow, and the symbols collapse nAqv_d → I, leaving F = I L B. predict→reveal (wait_for_answer); deep-dive enabled.',
    },
    {
        id: 'STATE_3',
        description:
            'Direction — the right-hand rule on the MACROSCOPIC vectors: fingers along L (current), curl toward B, thumb gives F. Then flip the current and watch F reverse. RHR primitives first appear here (Rule 25). manual_click.',
    },
    {
        id: 'STATE_4',
        description:
            'Angle trap — θ in F = BIL sin θ is ∠(L,B) = 90° here, NOT the 30° the wire makes with the page edge (red decoy). The L–B angle framing first appears here (Rule 25). predict→reveal (wait_for_answer); deep-dive enabled; misconception_watch.',
    },
    {
        id: 'STATE_5',
        description:
            'Bent wire = straight chord — the zig-zag wire is revealed, then the straight chord from end to end is shown as a discrete SNAPSHOT swap (no morph). F = I (L_chord × B). manual_click; deep-dive enabled; misconception_watch.',
    },
    {
        id: 'STATE_6',
        description:
            'Closed loop — the chord closes on itself so net F = 0, but opposite sides feel opposite forces (a couple) that twist the loop → torque (seeds the next concept). manual_click; misconception_watch.',
    },
    {
        id: 'STATE_7',
        description:
            'Interactive — top-right sliders for I, L, B, θ plus a flip-current button; bottom-right formula overlay F = B I L sin θ. Drag θ from 90 → 0 to watch the force fade; flip current to reverse F. interaction_complete.',
    },
];

export default function ForceOnCurrentCarryingWireTestPage() {
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
                force_on_current_carrying_wire — end-to-end verification
            </h1>
            <p style={{ fontSize: 12, opacity: 0.65, maxWidth: 920, marginBottom: 16 }}>
                {json.concept_name}. Renders all 7 EPIC-L states of{' '}
                <code>force_on_current_carrying_wire.json</code> through the production{' '}
                <code>assembleField3DHtml</code> path, reading the embedded{' '}
                <code>field_3d_config</code> block directly (no Sonnet runtime call).
                Three.js loads <code>r128</code> from CDN; drag any iframe to rotate
                the 3D scene, scroll to zoom. Use the green ▶ button under each iframe
                to hear that state&apos;s <code>teacher_script</code>. The{' '}
                <code>force_on_current_wire</code> scenario_type is declared here but
                implemented in the next (renderer) stage.
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
