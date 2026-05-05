// Admin scratch page — verifies all 5 premium primitives render in isolation.
// NOT shipped to students. Reachable at /admin/test-premium-primitives.
// Sessions 56+ Phase 0 build verification.

import { assembleParametricHtml, type ParametricConfig } from '@/lib/renderers/parametric_renderer';

const sceneAllFive = [
    // Anchor body — gives glow_focus and smooth_camera something to target.
    {
        type: 'body',
        id: 'demo_block',
        shape: 'rect',
        position: { x: 380, y: 280 },
        size: { w: 90, h: 90 },
        color: '#1F2937',
    },
    // 1. glow_focus — radial halo around the block
    {
        type: 'glow_focus',
        primitive_id: 'demo_block',
        halo_radius_px: 110,
        color: '#FCD34D',
        intensity: 0.6,
        appear_at_ms: 200,
        animate_in_ms: 600,
    },
    // 2. animated_path — vector that draws itself tip-first
    {
        type: 'animated_path',
        from: { x: 120, y: 120 },
        to: { x: 360, y: 240 },
        easing: 'ease_out',
        duration_ms: 1400,
        head_first: true,
        color: '#60A5FA',
        line_weight: 3,
        arrow_head: true,
        label: 'animated_path demo',
        appear_at_ms: 600,
    },
    // 3. sound_cue — whoosh once at state enter (silent until USER_GESTURE)
    {
        type: 'sound_cue',
        id: 'demo_whoosh',
        sound: 'whoosh',
        appear_at_ms: 800,
        volume: 0.25,
    },
    // 4. particle_field — radial outward dots
    {
        type: 'particle_field',
        id: 'demo_field',
        source: { x: 620, y: 280 },
        count: 50,
        drift_speed: 45,
        color: '#A78BFA',
        particle_size: 4,
        appear_at_ms: 0,
        animate_in_ms: 800,
    },
    // 5. smooth_camera — gentle zoom on the demo_block (low zoom factor so the
    //    rest of the scene stays visible).
    {
        type: 'smooth_camera',
        zoom: 1.08,
        target_primitive: 'demo_block',
        duration_ms: 1600,
    },
];

const demoConfig: ParametricConfig = {
    concept_id: 'field_forces',
    scene_composition: sceneAllFive,
    states: { STATE_1: { scene_composition: sceneAllFive } },
    default_variables: { m: 5 },
    current_state: 'STATE_1',
};

export default function PremiumPrimitivesTestPage() {
    const html = assembleParametricHtml(demoConfig);
    return (
        <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif', backgroundColor: '#0A0A1A', minHeight: '100vh', color: '#E5E7EB' }}>
            <h1 style={{ fontSize: 18, marginBottom: 8 }}>Premium primitives — verification scratch page</h1>
            <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 12, maxWidth: 760 }}>
                Renders all 5 premium primitives in one scene: a body anchor +{' '}
                <code>glow_focus</code> + <code>animated_path</code> + <code>sound_cue</code> +{' '}
                <code>particle_field</code> + <code>smooth_camera</code>. Click anywhere on the
                iframe first to unlock audio (<code>USER_GESTURE</code>), then refresh to hear the whoosh.
            </p>
            <iframe
                srcDoc={html}
                style={{ width: 760, height: 500, border: '1px solid #1F2937', backgroundColor: '#0A0A1A' }}
                title="premium-primitives-demo"
            />
        </div>
    );
}
