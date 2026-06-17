// Admin scratch page — verifies electric_field_point_charge (Class 12 Ch.1 —
// "Electric Field due to a Point Charge (and its Field Lines)") end-to-end
// through the production assembleField3DHtml + Three.js field_3d renderer +
// concept JSON path. Reachable at /admin/test-electric-field-point-charge.
//
// First electrostatics diamond. Renders each EPIC-L state directly from the
// embedded `field_3d_config` block in
// src/data/concepts/electric_field_point_charge.json — bypassing the live Sonnet
// pipeline (CLAUDE.md Rule 18) so authoring + THE EYE are deterministic.
//
// The field_3d_config sets electric_explorer:true, which routes the
// point_charge_positive scenario through buildElectricDiamond() in
// field_3d_renderer.ts (dual +Q/−Q field, test charge + F arrow, emphasis
// E-arrow, STATE_6 rule-wrong glyphs, STATE_7 Q/sign/r explorer).

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
        states?: Record<string, { title?: string }>;
    };
};

function loadConcept(): ConceptJson {
    const path = join(
        process.cwd(),
        'src',
        'data',
        'concepts',
        'electric_field_point_charge.json',
    );
    return JSON.parse(readFileSync(path, 'utf-8')) as ConceptJson;
}

// The renderer boots at PM_currentState = 'STATE_1', so to view STATE_N we copy
// its config into the STATE_1 slot (same trick as the sibling admin pages).
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
            'What is E — a source charge +Q with a tiny yellow test charge q nearby and a green force arrow F. E = F/q. No field lines yet. auto_after_tts.',
    },
    {
        id: 'STATE_2',
        description:
            'E of a point charge — the emphasis E-arrow at the field point P (red, radially out from +Q), labelled E, with marker P and label r. E = kQ/r². No field lines yet. manual_click; deep-dive.',
    },
    {
        id: 'STATE_3',
        description:
            'Sign sets direction — the field is the −Q set: every arrow points INWARD (blue), charge relabelled −Q. Magnitude unchanged. predict→reveal (wait_for_answer); misconception_watch.',
    },
    {
        id: 'STATE_4',
        description:
            'Field lines = the map — the full +Q radial field lines stream outward; tangent = E direction. manual_click.',
    },
    {
        id: 'STATE_5',
        description:
            'Density = strength (PRIMARY aha) — the radial lines crowd near the charge and fan apart far away; line density ∝ E. wait_for_answer; misconception_watch; deep-dive.',
    },
    {
        id: 'STATE_6',
        description:
            'Two rules — the +Q field plus two struck-out wrong glyphs: crossing lines with a red ✗ (lines never cross), and a charge sitting on a line with a red ✗ (a line is direction, not a path). manual_click; misconception_watch.',
    },
    {
        id: 'STATE_7',
        description:
            'Explore — top-right sliders: Q (charge), a flip-sign button, r (distance), plus a live E = kQ/r² readout; the emphasis E-arrow + field respond. interaction_complete.',
    },
];

export default function ElectricFieldPointChargeTestPage() {
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
                electric_field_point_charge — end-to-end verification
            </h1>
            <p style={{ fontSize: 12, opacity: 0.65, maxWidth: 920, marginBottom: 16 }}>
                {json.concept_name}. Renders all 7 EPIC-L states of{' '}
                <code>electric_field_point_charge.json</code> through the production{' '}
                <code>assembleField3DHtml</code> path, reading the embedded{' '}
                <code>field_3d_config</code> block directly (no Sonnet runtime call).
                Three.js loads <code>r128</code> from CDN; drag any iframe to rotate
                the 3D scene, scroll to zoom. STATE_7 shows the Q / sign / r explorer.
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
                    const title = json.epic_l_path?.states?.[id]?.title ?? id;
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
