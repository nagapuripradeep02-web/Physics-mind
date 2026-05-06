// Admin board-mode verification page for friction_static_kinetic.
// Renders STATE_1–STATE_5 in answer_sheet canvas mode, with each state's
// derivation_sequence primitives merged into the conceptual scene_composition.
// Reachable at /admin/test-friction-static-kinetic-board.

import { readFileSync } from 'fs';
import { join } from 'path';
import { assembleParametricHtml, type ParametricConfig } from '@/lib/renderers/parametric_renderer';

type DerivationPrimitive = {
    type: string;
    id: string;
    [key: string]: unknown;
};

type ConceptState = {
    scene_composition?: unknown[];
    focal_primitive_id?: string;
};

type ConceptJson = {
    concept_id: string;
    physics_engine_config?: { variables?: Record<string, { default?: number }> };
    epic_l_path?: { states?: Record<string, ConceptState> };
    mode_overrides?: {
        board?: {
            canvas_style?: string;
            mark_scheme?: unknown;
            derivation_sequence?: Record<string, { primitives?: DerivationPrimitive[] }>;
        };
    };
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

type PrimWithPos = { position?: { y?: number } };
const minY = (prims: unknown[]): number => {
    let m = Infinity;
    for (const p of prims) {
        const y = (p as PrimWithPos)?.position?.y;
        if (typeof y === 'number' && y < m) m = y;
    }
    return m;
};
const maxY = (prims: unknown[]): number => {
    let m = -Infinity;
    for (const p of prims) {
        const y = (p as PrimWithPos)?.position?.y;
        if (typeof y === 'number' && y > m) m = y;
    }
    return m;
};

function accumulatePerState(json: ConceptJson): Record<string, unknown[]> {
    const epicStates = json.epic_l_path?.states ?? {};
    const derivationSeq = json.mode_overrides?.board?.derivation_sequence ?? {};
    const out: Record<string, unknown[]> = {};
    let pagePrims: unknown[] = [];
    let pageMaxY = -Infinity;
    for (const stateKey of Object.keys(epicStates)) {
        const prims = derivationSeq[stateKey]?.primitives ?? [];
        if (prims.length > 0) {
            const stateMin = minY(prims);
            const stateMax = maxY(prims);
            if (stateMin < pageMaxY) {
                pagePrims = [...prims];
                pageMaxY = stateMax;
            } else {
                pagePrims = [...pagePrims, ...prims];
                pageMaxY = Math.max(pageMaxY, stateMax);
            }
        }
        out[stateKey] = [...pagePrims];
    }
    return out;
}

function buildBoardConfigForState(stateId: string): ParametricConfig {
    const json = loadConcept();
    const epicStates = json.epic_l_path?.states ?? {};
    const accumulated = accumulatePerState(json);

    return {
        concept_id: json.concept_id,
        scene_composition: accumulated[stateId] ?? [],
        states: Object.fromEntries(
            Object.entries(epicStates).map(([id, s]) => [id, {
                scene_composition: accumulated[id] ?? [],
                focal_primitive_id: s.focal_primitive_id,
            }])
        ),
        default_variables: defaultVarsFromConfig(json),
        current_state: stateId,
        canvas_style: 'answer_sheet',
    };
}

const BOARD_STATES: Array<{ id: string; label: string; description: string }> = [
    {
        id: 'STATE_1',
        label: 'STATE_1 — FBD Setup (+1 mark)',
        description: 'Almirah 5 kg on tile floor. Handwriting animates: body statement → forces listed → N = mg = 49 N. Mark badge "+1 for FBD" appears at right.',
    },
    {
        id: 'STATE_2',
        label: 'STATE_2 — Static Regime (+1 mark)',
        description: 'Block at rest. Handwriting: static friction acts → Newton I: fs = F → constraint fs ≤ μs·N. Mark badge "+1 for static regime".',
    },
    {
        id: 'STATE_3',
        label: 'STATE_3 — Threshold (+1 mark)',
        description: 'Block on verge of slipping. Handwriting: threshold statement → fs_max = 0.5 × 49 = 24.5 N → block slips when F > 24.5 N. Mark badge "+1 for threshold".',
    },
    {
        id: 'STATE_4',
        label: 'STATE_4 — Kinetic Regime (+1 mark)',
        description: 'Block sliding. Handwriting: friction switches to kinetic → fk = 0.3 × 49 = 14.7 N → fk is constant once moving. Mark badge "+1 for kinetic regime".',
    },
    {
        id: 'STATE_5',
        label: 'STATE_5 — Newton II + Numeric (+1 mark)',
        description: 'For F = 35 N. Handwriting: Newton II setup → F − fk = ma → a = 20.3/5 = 4.06 m/s². Mark badge "+1 for numeric". Total = 5/5.',
    },
];

export default async function FrictionBoardTestPage({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
    const params = await searchParams;
    const onlyState = params.state;
    const states = onlyState ? BOARD_STATES.filter(s => s.id === onlyState) : BOARD_STATES;
    return (
        <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif', backgroundColor: '#0A0A1A', minHeight: '100vh', color: '#E5E7EB' }}>
            <h1 style={{ fontSize: 18, marginBottom: 8 }}>friction_static_kinetic — Board Mode Verification</h1>
            <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 16, maxWidth: 920 }}>
                Renders {onlyState ?? 'STATE_1–STATE_5'} with <code>canvas_style: &quot;answer_sheet&quot;</code>.
                Append <code>?state=STATE_N</code> to render a single state.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {states.map(({ id, label, description }) => {
                    const html = assembleParametricHtml(buildBoardConfigForState(id));
                    return (
                        <section key={id}>
                            <h2 style={{ fontSize: 14, marginBottom: 4, color: '#FCD34D' }}>{label}</h2>
                            <p style={{ fontSize: 11, opacity: 0.65, marginBottom: 8, maxWidth: 760 }}>{description}</p>
                            <iframe
                                srcDoc={html}
                                style={{ width: 760, height: 520, border: '1px solid #1F2937', backgroundColor: '#FDFBF4' }}
                                title={`board-${id}-render`}
                            />
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
