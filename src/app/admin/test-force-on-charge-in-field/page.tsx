// Admin scratch page — verifies force_on_charge_in_field (Class 12 Ch.1 —
// "Force on a Charge in an Electric Field, F = qE") end-to-end through the
// production assembleField3DHtml + Three.js field_3d renderer + concept JSON
// path. Reachable at /admin/test-force-on-charge-in-field.
//
// Companion/inverse of electric_field_point_charge. Renders each EPIC-L state
// directly from the embedded `field_3d_config` block in
// src/data/concepts/force_on_charge_in_field.json — bypassing the live Sonnet
// pipeline (CLAUDE.md Rule 18) so authoring + THE EYE are deterministic.
//
// The field_3d_config sets force_field_explorer:true + scenario_type
// "uniform_field_force", which routes through buildForceFieldDiamond() in
// field_3d_renderer.ts (uniform plate field, charge + F arrow, motion modes:
// rest / accelerate_straight / launch_parabola / launch_parabola_multimass /
// explorer with the q/sign/E/m sliders).

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
        'force_on_charge_in_field.json',
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
            'A charge in a field feels a force — a yellow charge q between two plates (top +, bottom −), uniform field lines pointing down, and a green force arrow F pointing down. F = qE. auto_after_tts.',
    },
    {
        id: 'STATE_2',
        description:
            'Sign sets direction — the charge is now −q and the green force arrow points UP, opposite the field. Same size, opposite direction. predict→reveal (wait_for_answer); misconception_watch.',
    },
    {
        id: 'STATE_3',
        description:
            'How big — +q at rest with the F arrow; F = qE scales with q and E (no velocity in the formula). manual_click.',
    },
    {
        id: 'STATE_4',
        description:
            'Constant force ⇒ constant acceleration — the charge is released from rest and accelerates straight down; the orange v arrow grows while the green F arrow stays fixed; a trail traces the straight drop. a = qE/m. manual_click; deep-dive.',
    },
    {
        id: 'STATE_5',
        description:
            'PRIMARY aha — launched sideways the charge traces a PARABOLA: the green F stays fixed downward while the orange v turns along the curving path; trail draws the parabola. constant F ⇒ parabola (like gravity). wait_for_answer; misconception_watch; deep-dive.',
    },
    {
        id: 'STATE_6',
        description:
            'Same force, different mass — a light (green) and a heavy (red) charge with identical q and E launch together; the light one curves sharply, the heavy one barely bends. same F, a = qE/m. manual_click; misconception_watch; deep-dive.',
    },
    {
        id: 'STATE_7',
        description:
            'Explore — top-right sliders: q (charge), a flip-sign button, E (field), m (mass), plus a live F = qE / a = qE/m readout; the force arrow and the parabola respond. interaction_complete.',
    },
];

export default function ForceOnChargeInFieldTestPage() {
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
                force_on_charge_in_field — end-to-end verification
            </h1>
            <p style={{ fontSize: 12, opacity: 0.65, maxWidth: 920, marginBottom: 16 }}>
                {json.concept_name}. Renders all 7 EPIC-L states of{' '}
                <code>force_on_charge_in_field.json</code> through the production{' '}
                <code>assembleField3DHtml</code> path, reading the embedded{' '}
                <code>field_3d_config</code> block directly (no Sonnet runtime call).
                Three.js loads <code>r128</code> from CDN; drag any iframe to rotate
                the 3D scene, scroll to zoom. STATE_4–6 animate motion; STATE_7 shows
                the q / sign / E / m explorer.
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
