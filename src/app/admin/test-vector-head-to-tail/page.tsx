// Admin scratch page — verifies vector_head_to_tail concept end-to-end through
// the production assembleParametricHtml + premium primitives + concept JSON path.
// Sessions 56+ Phase 0 validation demo Sim 1.
// Reachable at /admin/test-vector-head-to-tail.

import { readFileSync } from 'fs';
import { join } from 'path';
import { assembleParametricHtml, type ParametricConfig } from '@/lib/renderers/parametric_renderer';

type ConceptJson = {
    concept_id: string;
    physics_engine_config?: { variables?: Record<string, { default?: number }> };
    epic_l_path?: { states?: Record<string, { scene_composition?: unknown[] }> };
};

function loadConcept(): ConceptJson {
    const path = join(process.cwd(), 'src', 'data', 'concepts', 'vector_head_to_tail.json');
    return JSON.parse(readFileSync(path, 'utf-8')) as ConceptJson;
}

function defaultVarsFromConfig(json: ConceptJson): Record<string, number> {
    const vars: Record<string, number> = {};
    const declared = json.physics_engine_config?.variables ?? {};
    for (const [name, spec] of Object.entries(declared)) {
        if (typeof spec.default === 'number') vars[name] = spec.default;
    }
    return vars;
}

function buildConfigForState(stateId: string): ParametricConfig {
    const json = loadConcept();
    const states = json.epic_l_path?.states ?? {};
    const stateScene = states[stateId]?.scene_composition ?? [];
    return {
        concept_id: json.concept_id,
        scene_composition: stateScene,
        states: Object.fromEntries(
            Object.entries(states).map(([id, s]) => [id, { scene_composition: s.scene_composition ?? [] }])
        ),
        default_variables: defaultVarsFromConfig(json),
        current_state: stateId,
    };
}

const STATES_TO_VERIFY: Array<{ id: string; label: string; description: string }> = [
    { id: 'STATE_1', label: 'STATE_1 — Walked Path Hook', description: 'walked path 3m east + 4m north with start/end markers + 3 guess callouts (green halo on correct one)' },
    { id: 'STATE_2', label: 'STATE_2 — Name the Two Displacements', description: 'displacement A (3m east) + displacement B (4m north) at separate positions, each with glow_focus pulse' },
    { id: 'STATE_3', label: 'STATE_3 — Tip-to-Tail Moment', description: 'B slides over so its tail sits at the head of A; whoosh sound on USER_GESTURE' },
    { id: 'STATE_4', label: 'STATE_4 — Resultant Reveals as 5m', description: 'yellow diagonal draws itself; Pythagoras formula box; ding sound on USER_GESTURE' },
    { id: 'STATE_5', label: 'STATE_5 — Try-It Slider (d_east)', description: 'd_east slider 1-8m; resultant updates live (note: slider primitive without bound physics may render statically here)' },
];

export default function VectorHeadToTailTestPage() {
    return (
        <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif', backgroundColor: '#0A0A1A', minHeight: '100vh', color: '#E5E7EB' }}>
            <h1 style={{ fontSize: 18, marginBottom: 8 }}>vector_head_to_tail — end-to-end verification</h1>
            <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 16, maxWidth: 920 }}>
                Renders all 5 EPIC-L states of <code>vector_head_to_tail.json</code> through the
                production <code>assembleParametricHtml</code> path. Click any iframe first to unlock
                audio (USER_GESTURE), then refresh the page to hear sound_cue whoosh + ding.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {STATES_TO_VERIFY.map(({ id, label, description }) => {
                    const html = assembleParametricHtml(buildConfigForState(id));
                    return (
                        <section key={id}>
                            <h2 style={{ fontSize: 14, marginBottom: 4, color: '#FCD34D' }}>{label}</h2>
                            <p style={{ fontSize: 11, opacity: 0.65, marginBottom: 8, maxWidth: 760 }}>{description}</p>
                            <iframe
                                srcDoc={html}
                                style={{ width: 760, height: 500, border: '1px solid #1F2937', backgroundColor: '#0A0A1A' }}
                                title={`${id}-render`}
                            />
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
