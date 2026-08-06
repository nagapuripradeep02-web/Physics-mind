// Admin scratch page — verifies scalar_vs_vector concept end-to-end through
// the production assembleParametricHtml + PCPL path. Ch.1 Vectors (Class 11
// Mechanics), concept #1 of the new chapter track. Authored 2026-07-23.
// Reachable at /admin/test-scalar-vs-vector.

import { readFileSync } from 'fs';
import { join } from 'path';
import { assembleParametricHtml, type ParametricConfig } from '@/lib/renderers/parametric_renderer';
import { buildParametricConfig, type ParametricSourceJson } from '@/scripts/lib/buildParametricConfig';

function loadConcept(): ParametricSourceJson {
    const path = join(process.cwd(), 'src', 'data', 'concepts', 'scalar_vs_vector.json');
    return JSON.parse(readFileSync(path, 'utf-8')) as ParametricSourceJson;
}

// One config per state via the SHARED assembler (whole-state passthrough).
// This page once hand-picked scene_composition ONLY — the 1-field ancestor of
// the review-site projection bug — so it rendered choreography-dead states
// while its own descriptions claimed live motion (engine_bug_queue:
// review_site_private_config_assembler_drops_variable_choreography).
function buildConfigForState(stateId: string): ParametricConfig {
    const json = loadConcept();
    const base = buildParametricConfig('scalar_vs_vector', json);
    return {
        ...base,
        current_state: stateId,
        scene_composition: base.states?.[stateId]?.scene_composition ?? base.scene_composition,
    };
}

const STATES_TO_VERIFY: Array<{ id: string; label: string; description: string }> = [
    { id: 'STATE_1', label: 'STATE_1 — Same Number, Many Endings', description: 'signpost "LAKE 5 km"; hook vector A toward the lake, then B toward the woods (flash-hold pair); just-fixed: B\'s "5 km" label offset off the "toward the woods?" annotation' },
    { id: 'STATE_2', label: 'STATE_2 — Spin It, Nothing Changes', description: '8 kg pack on a hanging scale; a decorative pointer at any angle; the reading never moves (deliberately static — the stillness IS the physics)' },
    { id: 'STATE_3', label: 'STATE_3 — Three Plus Four Equals Five (PRIMARY aha)', description: 'scale: 3 kg + 4 kg -> 7 kg; ground: two-leg walk -> resultant chord self-draws at 5.0 km; ghost card "3+4=7 km?" struck through' },
    { id: 'STATE_4', label: 'STATE_4 — The Angle Sets the Sum', description: 'theta slider drives live triangle geometry; |R| readout glides 7->5->1; pinned "3+4=7, always" card stays static; just-fixed: resultant "R" label perpendicular-offset off leg_b\'s label' },
    { id: 'STATE_5', label: 'STATE_5 — All Yours (sandbox)', description: 'a/b/theta all live; just-fixed: dropped combining-arrow glyphs (were rendering as tofu boxes) in favor of plain R/a/b' },
];

export default function ScalarVsVectorTestPage() {
    return (
        <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif', backgroundColor: '#0A0A1A', minHeight: '100vh', color: '#E5E7EB' }}>
            <h1 style={{ fontSize: 18, marginBottom: 8 }}>scalar_vs_vector — end-to-end verification</h1>
            <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 16, maxWidth: 920 }}>
                Ch.1 Vectors (Class 11 Mechanics) — concept #1 of the new chapter track. Renders all 5
                EPIC-L states of <code>scalar_vs_vector.json</code> through the production{' '}
                <code>assembleParametricHtml</code> path (mechanics_2d / PCPL renderer).
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
