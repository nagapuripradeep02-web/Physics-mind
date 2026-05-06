// Admin scratch page — verifies newton_second_law_direction concept end-to-end through
// the production assembleParametricHtml + premium primitives + concept JSON path.
// Sessions 56-plan, authored session 59. Phase 0 validation demo Sim 2.
// Reachable at /admin/test-newton-second-law-direction.

import { readFileSync } from 'fs';
import { join } from 'path';
import { assembleParametricHtml, type ParametricConfig } from '@/lib/renderers/parametric_renderer';

type ConceptJson = {
    concept_id: string;
    physics_engine_config?: { variables?: Record<string, { default?: number }> };
    epic_l_path?: { states?: Record<string, { scene_composition?: unknown[] }> };
};

function loadConcept(): ConceptJson {
    const path = join(process.cwd(), 'src', 'data', 'concepts', 'newton_second_law_direction.json');
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
    { id: 'STATE_1', label: 'STATE_1 — Push the Trolley Hook', description: 'trolley + force arrow + 3 guess callouts (green halo on "accelerates from 0")' },
    { id: 'STATE_2', label: 'STATE_2 — F = m·a Magnitude', description: 'horizontal F + parallel a arrow + formula box "a = 10/2 = 5 m/s²"' },
    { id: 'STATE_3', label: 'STATE_3 — Direction Matters (Vector Equation)', description: 'F at 30° + a at 30° (parallel); ding sound on alignment; vector_box callout' },
    { id: 'STATE_4', label: 'STATE_4 — v(t) = a·t', description: 'two velocity arrows (t=1s, t=2s) growing along a; v(t) formula box; key insight v ≠ F' },
    { id: 'STATE_5', label: 'STATE_5 — Case A: F along v (straight line)', description: 'block on smooth floor; F, v, a all rightward; ghost block trail; insight: trajectory stays straight' },
    { id: 'STATE_6', label: 'STATE_6 — Case B: Projectile (cannon launch)', description: 'cannon launches ball at 60°; full parabolic arc with ghost balls; mid-flight zoom; v_x constant + v_y changing strobe vectors' },
    { id: 'STATE_7', label: 'STATE_7 — Try-It Slider (F, m, theta_F)', description: 'three sliders for F, m, theta_F; F + a arrows respond live' },
];

export default function NewtonSecondLawDirectionTestPage() {
    return (
        <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif', backgroundColor: '#0A0A1A', minHeight: '100vh', color: '#E5E7EB' }}>
            <h1 style={{ fontSize: 18, marginBottom: 8 }}>newton_second_law_direction — end-to-end verification</h1>
            <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 16, maxWidth: 920 }}>
                Renders all 6 EPIC-L states of <code>newton_second_law_direction.json</code> through the
                production <code>assembleParametricHtml</code> path. Click any iframe first to unlock
                audio (USER_GESTURE), then refresh the page to hear sound_cue ding + whoosh.
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
