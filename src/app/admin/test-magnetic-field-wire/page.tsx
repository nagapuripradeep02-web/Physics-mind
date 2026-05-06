// Admin scratch page — verifies magnetic_field_wire concept end-to-end through
// the production assembleField3DHtml + Three.js field_3d renderer + concept JSON path.
// Phase 0 validation demo Sim 3 (session 60). Reachable at /admin/test-magnetic-field-wire.
//
// Renders each EPIC-L state directly from the embedded `field_3d_config` block in
// src/data/concepts/magnetic_field_wire.json — bypassing the live Sonnet pipeline so
// authoring is deterministic and verifiable. Mirrors the pattern used by
// /admin/test-newton-second-law-direction.

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
        'magnetic_field_wire.json',
    );
    return JSON.parse(readFileSync(path, 'utf-8')) as ConceptJson;
}

function buildConfigForState(stateId: string): Field3DConfig | null {
    const json = loadConcept();
    const base = json.field_3d_config;
    if (!base) return null;
    // Preserve the full states map so the renderer's PostMessage SET_STATE can
    // navigate through them, but set current_state visually by giving STATE_1
    // the camera_position and visible_elements of the requested stateId. Since
    // the existing renderer renders one initial state and then responds to
    // SET_STATE messages, the cleanest authoring pattern for the admin page is
    // to clone the config per state with the requested state as STATE_1.
    const requested = base.states?.[stateId];
    if (!requested) return base;
    return {
        ...base,
        states: {
            ...base.states,
            STATE_1: requested, // renderer's initial PM_currentState is STATE_1
        },
    };
}

const STATES_TO_VERIFY: Array<{ id: string; description: string }> = [
    {
        id: 'STATE_1',
        description:
            'Oersted hook — wire alone, current arrow + field circles hidden. Caption: "1820: a current-carrying wire deflects a compass."',
    },
    {
        id: 'STATE_2',
        description:
            'B-field circles emerge in 3D. All elements visible. Drag to rotate; field circles are visible at every height.',
    },
    {
        id: 'STATE_3',
        description:
            'Right-hand rule. Wire + current arrow + middle-height field circles only (cleaner). Caption explains thumb=I, fingers=B.',
    },
    {
        id: 'STATE_4',
        description:
            'Magnitude formula. All circles visible at all radii — outer rings = weaker B (1/r decay).',
    },
    {
        id: 'STATE_5',
        description:
            'B at one specific point P. Single highlighted field circle (middle height, third radius). Tangent direction visible.',
    },
    {
        id: 'STATE_6',
        description:
            'Top-down view. camera at [0.1, 7, 0.1] — looking straight down the wire. Circles compress to ⊗ / ⊙ pattern.',
    },
    {
        id: 'STATE_7',
        description:
            'Free explore. All elements visible, default oblique camera. Drag/scroll to test the right-hand rule at any angle.',
    },
];

export default function MagneticFieldWireTestPage() {
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
                magnetic_field_wire — end-to-end verification
            </h1>
            <p style={{ fontSize: 12, opacity: 0.65, maxWidth: 920, marginBottom: 16 }}>
                {json.concept_name}. Renders all 7 EPIC-L states of{' '}
                <code>magnetic_field_wire.json</code> through the production{' '}
                <code>assembleField3DHtml</code> path, reading the embedded{' '}
                <code>field_3d_config</code> block directly (no Sonnet runtime call).
                Three.js loads <code>r128</code> from CDN; drag any iframe to rotate
                the 3D scene, scroll to zoom. Mobile (&lt;768px) shows the SVG fallback.
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
