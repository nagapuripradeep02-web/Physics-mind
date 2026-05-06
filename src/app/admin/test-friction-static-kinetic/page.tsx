// Admin scratch page — verifies friction_static_kinetic concept end-to-end through
// the production assembleParametricHtml + premium primitives + concept JSON path.
// Reachable at /admin/test-friction-static-kinetic.

import { readFileSync } from 'fs';
import { join } from 'path';
import { assembleParametricHtml, type ParametricConfig } from '@/lib/renderers/parametric_renderer';

type TtsSentence = { id?: string; pause_after_ms?: number; highlight_primitive_id?: string };
type ConceptState = {
    scene_composition?: unknown[];
    focal_primitive_id?: string;
    teacher_script?: { tts_sentences?: TtsSentence[] };
};
type ConceptJson = {
    concept_id: string;
    physics_engine_config?: { variables?: Record<string, { default?: number }> };
    epic_l_path?: { states?: Record<string, ConceptState> };
};

function loadConcept(): ConceptJson {
    const path = join(process.cwd(), 'src', 'data', 'concepts', 'friction_static_kinetic.json');
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

function buildFocalSequence(s: ConceptState): Array<{ highlight_primitive_id: string; duration_ms: number }> | undefined {
    const sentences = s.teacher_script?.tts_sentences ?? [];
    const seq = sentences
        .filter(sen => !!sen.highlight_primitive_id)
        .map(sen => ({ highlight_primitive_id: sen.highlight_primitive_id!, duration_ms: sen.pause_after_ms ?? 3000 }));
    return seq.length > 0 ? seq : undefined;
}

function buildConfigForState(stateId: string): ParametricConfig {
    const json = loadConcept();
    const states = json.epic_l_path?.states ?? {};
    const stateScene = states[stateId]?.scene_composition ?? [];
    return {
        concept_id: json.concept_id,
        scene_composition: stateScene,
        states: Object.fromEntries(
            Object.entries(states).map(([id, s]) => [id, {
                scene_composition: s.scene_composition ?? [],
                focal_primitive_id: s.focal_primitive_id,
                focal_sequence: buildFocalSequence(s),
            }])
        ),
        default_variables: defaultVarsFromConfig(json),
        current_state: stateId,
    };
}

const STATES_TO_VERIFY: Array<{ id: string; label: string; description: string }> = [
    {
        id: 'STATE_1',
        label: 'STATE_1 — Push the Almirah — Hook',
        description: 'Almirah (5 kg) on tile floor. F = 5 N arrow pointing right. Hook callout: "You push lightly. The almirah does not move. What is stopping it?"',
    },
    {
        id: 'STATE_2',
        label: 'STATE_2 — Static Friction Matches the Push',
        description: 'F arrow (blue, 5 N right) + fs arrow (green, 5 N left) revealed at s3. Annotation "Static friction adjusts to match F." reveals at s4.',
    },
    {
        id: 'STATE_3',
        label: 'STATE_3 — The Threshold (F = 24.5 N)',
        description: 'F = 24.5 N (at fs_max). fs arrow at max. fs_max_label and threshold_value_label reveal with Socratic pauses.',
    },
    {
        id: 'STATE_4',
        label: 'STATE_4 — Kinetic Regime (F = 30 N, block sliding)',
        description: 'Block slides rightward. fk arrow (14.7 N) reveals at s3 — smaller than fs_max. "μk < μs" label at s4.',
    },
    {
        id: 'STATE_5',
        label: 'STATE_5 — Static vs Kinetic Side by Side',
        description: 'compare_contrast layout. Left scene static regime, right scene kinetic. Graph panel (fs vs F_applied curve) in Panel B.',
    },
    {
        id: 'STATE_6',
        label: 'STATE_6 — Slider Exploration (F and μ)',
        description: 'exploration_sliders state. F slider 0–200 N. mu_s slider 0.1–0.9. mu_k slider 0.05–0.8. Block animates slide_when_kinetic.',
    },
];

export default function FrictionStaticKineticTestPage() {
    return (
        <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif', backgroundColor: '#0A0A1A', minHeight: '100vh', color: '#E5E7EB' }}>
            <h1 style={{ fontSize: 18, marginBottom: 8 }}>friction_static_kinetic — end-to-end verification</h1>
            <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 16, maxWidth: 920 }}>
                Renders all 6 EPIC-L states of <code>friction_static_kinetic.json</code> through the
                production <code>assembleParametricHtml</code> path. Gold-standard shipped 2026-05-05.
                STATE_3 and STATE_5 have <code>allow_deep_dive: true</code>.
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
