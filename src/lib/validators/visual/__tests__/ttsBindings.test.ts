/**
 * extractTtsVisualBindings — glow normalization, math_show extraction,
 * primitive-legend assembly (Category I input layer).
 */
import { describe, it, expect } from 'vitest';
import { extractTtsVisualBindings } from '../ttsBindings';

function conceptWith(states: Record<string, unknown>): Record<string, unknown> {
    return { concept_id: 'test_concept', epic_l_path: { states } };
}

describe('extractTtsVisualBindings', () => {
    it('returns {} for null / missing epic_l_path', () => {
        expect(extractTtsVisualBindings(null)).toEqual({});
        expect(extractTtsVisualBindings({})).toEqual({});
    });

    it('normalizes single-string glow to a one-element array', () => {
        const out = extractTtsVisualBindings(conceptWith({
            STATE_1: {
                teacher_script: {
                    tts_sentences: [
                        { id: 's1_1', text_en: 'Watch the velocity arrow.', glow: 'v' },
                    ],
                },
            },
        }));
        expect(out.STATE_1.bindings).toHaveLength(1);
        expect(out.STATE_1.bindings[0].glow).toEqual(['v']);
        expect(out.STATE_1.bindings[0].sentence_id).toBe('s1_1');
    });

    it('keeps co-glow arrays and filters non-string entries', () => {
        const out = extractTtsVisualBindings(conceptWith({
            STATE_2: {
                teacher_script: {
                    tts_sentences: [
                        { id: 's2_1', text_en: 'v cos theta along B.', glow: ['v_parallel', 'b', 42, null] },
                    ],
                },
            },
        }));
        expect(out.STATE_2.bindings[0].glow).toEqual(['v_parallel', 'b']);
    });

    it('captures math_show and includes sentences with math but no glow', () => {
        const out = extractTtsVisualBindings(conceptWith({
            STATE_3: {
                teacher_script: {
                    tts_sentences: [
                        { id: 's3_1', text_en: 'So F dot v is zero.', math_show: 'F \\cdot v = 0' },
                    ],
                },
            },
        }));
        expect(out.STATE_3.bindings[0].math_show).toBe('F \\cdot v = 0');
        expect(out.STATE_3.bindings[0].glow).toEqual([]);
    });

    it('omits states whose sentences have neither glow nor math_show', () => {
        const out = extractTtsVisualBindings(conceptWith({
            STATE_4: {
                teacher_script: {
                    tts_sentences: [
                        { id: 's4_1', text_en: 'Plain narration only.' },
                    ],
                },
            },
        }));
        expect(out.STATE_4).toBeUndefined();
    });

    it('builds the legend from renderer elements + scene_composition primitives', () => {
        const out = extractTtsVisualBindings(conceptWith({
            STATE_5: {
                teacher_script: {
                    tts_sentences: [{ id: 's5_1', text_en: 'Speed stays frozen.', glow: 'speed_frozen_label' }],
                },
                scene_composition: {
                    primitives: [
                        { id: 'speed_frozen_label', type: 'annotation', properties: { text: 'Speed: CONSTANT' } },
                    ],
                },
            },
        }));
        const legend = out.STATE_5.primitive_legend;
        // Renderer-level elements always present...
        expect(legend.some(e => e.id === 'v')).toBe(true);
        expect(legend.some(e => e.id === 'trail')).toBe(true);
        // ...plus the state's own scene primitives with their text as label.
        const sceneEntry = legend.find(e => e.id === 'speed_frozen_label');
        expect(sceneEntry).toBeDefined();
        expect(sceneEntry!.label).toBe('Speed: CONSTANT');
    });

    it('synthesizes a sentence_id when the sentence has none', () => {
        const out = extractTtsVisualBindings(conceptWith({
            STATE_6: {
                teacher_script: {
                    tts_sentences: [{ text_en: 'Look here.', glow: 'f' }],
                },
            },
        }));
        expect(out.STATE_6.bindings[0].sentence_id).toBe('STATE_6_s1');
    });
});
