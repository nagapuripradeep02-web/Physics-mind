// Admin scratch page — verifies magnetic_field_solenoid concept end-to-end through
// the production assembleField3DHtml + Three.js field_3d renderer + concept JSON path.
// Diamond #4 (magnetism proof-of-concept M4 binary gate) visual verification.
//
// Renders all 8 EPIC-L states of src/data/concepts/magnetic_field_solenoid.json by
// reading the embedded field_3d_config block directly — bypassing the live Sonnet
// pipeline (which is blocked on Anthropic credit). Mirrors the pattern used by
// /admin/test-magnetic-field-wire.

import { readFileSync } from 'fs';
import { join } from 'path';
import {
    assembleField3DHtml,
    type Field3DConfig,
} from '@/lib/renderers/field_3d_renderer';
import StateSelector from './StateSelector';

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
        'magnetic_field_solenoid.json',
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
            STATE_1: requested, // renderer's initial PM_currentState is STATE_1
        },
    };
}

const STATES_TO_VERIFY: Array<{ id: string; description: string }> = [
    {
        id: 'STATE_1',
        description:
            'Hook — straight wire morphs to coil. wire_to_coil_morph { enabled, straight_duration_ms: 3000, morph_duration_ms: 1500 }. Watch for ~3s straight wire, then 1.5s cross-fade into the 6-turn coil.',
    },
    {
        id: 'STATE_2',
        description:
            'Per-turn field reveal. Six sets of B-field circles wrapping each turn. Visual overload — sets up STATE_3.',
    },
    {
        id: 'STATE_3',
        description:
            'PRIMARY AHA — radial components cancel, axial survives. Pause_after_ms: 3000 on s3_2 prediction (architect-mandated). Red cancellation arrows BEFORE blue axial arrows.',
    },
    {
        id: 'STATE_4',
        description:
            'Outside reveal — B ≈ 0 outside the solenoid. Fade-in then fade-out animation for outside arrows.',
    },
    {
        id: 'STATE_5',
        description:
            'SUPPORTING AHA — RHR-swap. right_hand { case: "solenoid", fade_from_case: "A", fade_duration_ms: 1400 }. Should show wire-grip (Case A) for ~600ms, fade out, swap to solenoid-grip (fingers curl with current, thumb axial), fade in.',
    },
    {
        id: 'STATE_6',
        description:
            'Formula reveal — B = μ₀nI. Handwriting animation writes the formula into the callout zone. Stretch demonstrative shows N=500 fixed, L=0.5m → 1.0m, B halved.',
    },
    {
        id: 'STATE_7',
        description:
            'Reverse current. Current direction arrows flip; B vector rotates 180°. Magnitude formula unchanged.',
    },
    {
        id: 'STATE_8',
        description:
            'Exploration. Sliders for n and I active; B_inside meter live. current_direction reset to +1 (no leak from STATE_7).',
    },
];

export default function MagneticFieldSolenoidTestPage() {
    const json = loadConcept();
    const states = STATES_TO_VERIFY.map(({ id, description }) => {
        const cfg = buildConfigForState(id);
        const stateMeta = json.epic_l_path?.states?.[id];
        const title = stateMeta?.title ?? id;
        return {
            id,
            title,
            description,
            html: cfg
                ? assembleField3DHtml(cfg)
                : `<!doctype html><html><body style="background:#0A0A1A;color:#EF5350;font-family:system-ui;padding:24px">no field_3d_config for ${id}</body></html>`,
        };
    });
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
                magnetic_field_solenoid — Diamond #4 end-to-end verification
            </h1>
            <p style={{ fontSize: 12, opacity: 0.65, maxWidth: 920, marginBottom: 16 }}>
                {json.concept_name}. Single-iframe state selector to avoid multi-iframe
                <code>requestAnimationFrame</code> throttling. Click a state button to
                render that state in isolation; iframe remounts on switch so animations
                restart cleanly. Drag the scene to rotate, scroll to zoom. Critical
                visual checks: STATE_1 (wire_to_coil_morph), STATE_2/3 (per_turn +
                radial cancel + axial buildup), STATE_5 (RHR grip swap).
            </p>
            <StateSelector states={states} />
        </div>
    );
}
