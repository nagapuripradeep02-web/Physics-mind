// Admin scratch page — verifies biot_savart_law concept end-to-end through the
// production assembleField3DHtml + Three.js field_3d renderer + concept JSON path.
// Reachable at /admin/test-biot-savart-law.
//
// Renders each EPIC-L state directly from the embedded `field_3d_config` block in
// src/data/concepts/biot_savart_law.json (scenario_type: biot_savart_element) —
// bypassing the live Sonnet pipeline so authoring is deterministic and verifiable.
// Mirrors the pattern used by /admin/test-magnetic-field-wire.

import { readFileSync } from 'fs';
import { join } from 'path';
import {
    assembleField3DHtml,
    type Field3DConfig,
} from '@/lib/renderers/field_3d_renderer';

type ConceptJson = {
    concept_id: string;
    concept_name: string;
    field_3d_config?: Field3DConfig;
    epic_l_path?: {
        states?: Record<
            string,
            {
                title?: string;
                teacher_script?: { tts_sentences?: Array<{ text_en?: string }> };
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
        'biot_savart_law.json',
    );
    return JSON.parse(readFileSync(path, 'utf-8')) as ConceptJson;
}

function buildConfigForState(stateId: string): Field3DConfig | null {
    const json = loadConcept();
    const base = json.field_3d_config;
    if (!base) return null;
    // Clone the config per state with the requested state cloned into STATE_1,
    // since the renderer's initial PM_currentState is STATE_1. The full states
    // map is preserved so SET_STATE navigation still works.
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
            'The result you already know — wire + current arrow + faint circular field. Caption asks where the circle comes from.',
    },
    {
        id: 'STATE_2',
        description:
            'Zoom in — one bright current element dl on the wire, plus the field point P. No r̂/cross/dB yet.',
    },
    {
        id: 'STATE_3',
        description:
            'Geometry — grey r̂ arrow from the element to P (distance r). Angle θ between dl and r̂.',
    },
    {
        id: 'STATE_4',
        description:
            'Build the law from proportionalities — dl, r̂ still shown; scalar form dB = (μ₀/4π) I dl sinθ/r².',
    },
    {
        id: 'STATE_5',
        description:
            'Cross product — green dl × r̂ at the element and the dB arrow at P, perpendicular to both (tangent to the circle).',
    },
    {
        id: 'STATE_6',
        description:
            'Predict the direction — top-down view; dot ⊙ / cross ⊗ circulation practice. dB tangent at P.',
    },
    {
        id: 'STATE_7',
        description:
            'AHA — accumulation: 9 elements light up on a stagger, each dropping a dB contribution at P that stacks; the circle ramps in.',
    },
    {
        id: 'STATE_8',
        description:
            'Why far ends barely matter — sinθ/r² weighting; the element across from P gives the biggest chunk, far ends nearly vanish.',
    },
    {
        id: 'STATE_9',
        description:
            'Biot-Savart ⇒ the familiar result — bright assembled circle, formula overlay ∑ dB → B = μ₀I/2πr.',
    },
    {
        id: 'STATE_10',
        description:
            'Free explore — I/r sliders + B readout, full circle + dB. Drag to rotate, scroll to zoom.',
    },
];

export default function BiotSavartLawTestPage() {
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
                biot_savart_law — end-to-end verification
            </h1>
            <p style={{ fontSize: 12, opacity: 0.65, maxWidth: 920, marginBottom: 16 }}>
                {json.concept_name}. Renders all 10 EPIC-L states of{' '}
                <code>biot_savart_law.json</code> through the production{' '}
                <code>assembleField3DHtml</code> path, reading the embedded{' '}
                <code>field_3d_config</code> block directly (no Sonnet runtime call).
                Scenario <code>biot_savart_element</code>. Three.js loads{' '}
                <code>r128</code> from CDN; drag any iframe to rotate the 3D scene,
                scroll to zoom. The accumulation (STATE_7/8) animates over a few
                seconds after the iframe loads.
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
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
