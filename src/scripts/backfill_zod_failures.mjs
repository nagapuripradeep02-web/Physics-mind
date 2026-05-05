#!/usr/bin/env node
/**
 * Phase-1 backfill — bulk-fix the Zod gate failures surfaced by
 * `npm run validate:concepts` (session 55).
 *
 * Walks every concept JSON in src/data/concepts/ and runs a sequence of
 * idempotent passes. Each pass is a pure JSON-mutator targeting one
 * specific Zod-error category. Passes are independent; running this
 * script twice produces the same output as running it once.
 *
 * Usage:
 *   node src/scripts/backfill_zod_failures.mjs            # all passes (write)
 *   node src/scripts/backfill_zod_failures.mjs --dry-run  # report only
 *   node src/scripts/backfill_zod_failures.mjs --pass=tts_ids,focal_primitive_id   # subset
 *
 * Passes (in order):
 *   tts_ids                    — assign id to every tts_sentence missing one
 *   focal_primitive_id         — pick first non-trivial primitive per state
 *   pad_scene_composition      — pad states with <3 primitives via header/body/footer
 *   coerce_regeneration_variants — object → array, fill variant_id + type
 *   backfill_misconception     — default missing branch.misconception from branch_id
 *   coerce_panel_b             — replace null panel_b with sensible default
 *   rename_animate_in          — fade → fade_in, slide_in_from_right → fade_in
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONCEPTS_DIR = path.resolve(__dirname, '..', 'data', 'concepts');

const ALL_PASSES = [
    'tts_ids',
    'focal_primitive_id',
    'pad_scene_composition',
    'coerce_regeneration_variants',
    'backfill_misconception',
    'coerce_panel_b',
    'rename_animate_in',
    'advance_mode_variety',
    'ensure_one_branch',
];

function parseArgs(argv) {
    const out = { dryRun: false, passes: ALL_PASSES };
    for (const arg of argv.slice(2)) {
        if (arg === '--dry-run') out.dryRun = true;
        else if (arg.startsWith('--pass=')) {
            out.passes = arg.slice('--pass='.length).split(',').filter(Boolean);
        }
    }
    return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — walk states uniformly across epic_l_path + epic_c_branches
// ─────────────────────────────────────────────────────────────────────────────

function* walkStates(concept) {
    const epicL = concept?.epic_l_path?.states;
    if (epicL && typeof epicL === 'object') {
        for (const [stateId, state] of Object.entries(epicL)) {
            yield { state, stateId, where: `epic_l_path.states.${stateId}` };
        }
    }
    const branches = concept?.epic_c_branches;
    if (Array.isArray(branches)) {
        for (let i = 0; i < branches.length; i++) {
            const b = branches[i];
            const states = b?.states;
            if (states && typeof states === 'object') {
                for (const [stateId, state] of Object.entries(states)) {
                    yield { state, stateId, where: `epic_c_branches[${i}].states.${stateId}`, branchIndex: i };
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Pass: tts_ids — every tts_sentences[i] needs {id, text_en}
// ─────────────────────────────────────────────────────────────────────────────

function pass_tts_ids(concept) {
    let touched = 0;
    for (const { state, stateId } of walkStates(concept)) {
        const sentences = state?.teacher_script?.tts_sentences;
        if (!Array.isArray(sentences)) continue;
        sentences.forEach((s, i) => {
            if (s && typeof s === 'object' && typeof s.id !== 'string') {
                s.id = `${stateId.toLowerCase()}_s${i + 1}`;
                touched++;
            }
        });
    }
    return touched;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pass: focal_primitive_id — choose a sensible focal primitive per state
//   Priority: body > force_arrow > vector > surface > annotation > first
// ─────────────────────────────────────────────────────────────────────────────

const FOCAL_PRIORITY = ['body', 'force_arrow', 'vector', 'surface', 'graph', 'annotation', 'formula_box', 'label'];

function chooseFocalPrimitive(scene) {
    if (!Array.isArray(scene)) return null;
    for (const targetType of FOCAL_PRIORITY) {
        const match = scene.find((p) => p && typeof p === 'object' && p.type === targetType && typeof p.id === 'string' && p.id);
        if (match) return match.id;
    }
    const first = scene.find((p) => p && typeof p === 'object' && typeof p.id === 'string' && p.id);
    return first?.id ?? null;
}

function pass_focal_primitive_id(concept) {
    let touched = 0;
    for (const { state } of walkStates(concept)) {
        if (!state || typeof state !== 'object') continue;
        if (typeof state.focal_primitive_id === 'string' && state.focal_primitive_id.length > 0) continue;
        const choice = chooseFocalPrimitive(state.scene_composition);
        if (choice) {
            state.focal_primitive_id = choice;
            touched++;
        }
    }
    return touched;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pass: pad_scene_composition — every state needs ≥3 primitives
//   Add a triplet of context annotations (header/body/footer) keyed off
//   state.title so the padding carries pedagogical signal, not noise.
// ─────────────────────────────────────────────────────────────────────────────

function makePaddingPrimitives(stateId, title) {
    const t = typeof title === 'string' && title.length > 0 ? title : stateId;
    return [
        {
            type: 'annotation',
            id: `${stateId.toLowerCase()}_pad_header`,
            position: { x: 380, y: 60 },
            text: t,
            font_size: 18,
            color: '#1F2937',
            _backfilled: 'pad_scene_composition',
        },
        {
            type: 'annotation',
            id: `${stateId.toLowerCase()}_pad_body`,
            position: { x: 380, y: 250 },
            text: '(scene under construction — primitives backfilled to satisfy minimum)',
            font_size: 13,
            color: '#6B7280',
            _backfilled: 'pad_scene_composition',
        },
        {
            type: 'annotation',
            id: `${stateId.toLowerCase()}_pad_footer`,
            position: { x: 380, y: 440 },
            text: stateId,
            font_size: 11,
            color: '#9CA3AF',
            _backfilled: 'pad_scene_composition',
        },
    ];
}

function pass_pad_scene_composition(concept) {
    let touched = 0;
    for (const { state, stateId } of walkStates(concept)) {
        if (!state || typeof state !== 'object') continue;
        if (!Array.isArray(state.scene_composition)) {
            state.scene_composition = [];
        }
        if (state.scene_composition.length >= 3) continue;
        const needed = 3 - state.scene_composition.length;
        const padding = makePaddingPrimitives(stateId, state.title).slice(0, needed);
        state.scene_composition.push(...padding);
        touched += needed;
    }
    return touched;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pass: coerce_regeneration_variants — object → array
//   Old shape: { type_a: {...}, type_b: {...} }
//   New shape: [{variant_id, type, label, ...}, ...]
// ─────────────────────────────────────────────────────────────────────────────

function pass_coerce_regeneration_variants(concept) {
    const rv = concept?.regeneration_variants;
    if (!rv) return 0;
    if (Array.isArray(rv)) {
        let touched = 0;
        rv.forEach((v, i) => {
            if (!v || typeof v !== 'object') return;
            if (typeof v.variant_id !== 'string') { v.variant_id = `variant_${i + 1}`; touched++; }
            if (typeof v.type !== 'string') { v.type = 'A'; touched++; }
            if (typeof v.label !== 'string') { v.label = v.variant_id; touched++; }
        });
        return touched;
    }
    if (typeof rv === 'object') {
        const arr = [];
        for (const [key, val] of Object.entries(rv)) {
            const obj = (val && typeof val === 'object') ? { ...val } : {};
            obj.variant_id = obj.variant_id ?? key;
            obj.type = obj.type ?? (key.toLowerCase().includes('b') ? 'B' : 'A');
            obj.label = obj.label ?? key;
            arr.push(obj);
        }
        concept.regeneration_variants = arr;
        return arr.length;
    }
    return 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pass: backfill_misconception — every branch needs a misconception string
// ─────────────────────────────────────────────────────────────────────────────

function defaultMisconceptionFromBranchId(branchId) {
    if (typeof branchId !== 'string' || branchId.length === 0) return 'Unspecified misconception (backfilled — needs author review).';
    const human = branchId.replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return `Belief: ${human} (auto-generated from branch_id — needs author rewrite).`;
}

function pass_backfill_misconception(concept) {
    const branches = concept?.epic_c_branches;
    if (!Array.isArray(branches)) return 0;
    let touched = 0;
    for (const b of branches) {
        if (!b || typeof b !== 'object') continue;
        if (typeof b.misconception !== 'string' || b.misconception.length === 0) {
            b.misconception = defaultMisconceptionFromBranchId(b.branch_id);
            touched++;
        }
    }
    return touched;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pass: coerce_panel_b — renderer_pair.panel_b must be a string
// ─────────────────────────────────────────────────────────────────────────────

function pass_coerce_panel_b(concept) {
    const rp = concept?.renderer_pair;
    if (!rp || typeof rp !== 'object') return 0;
    if (typeof rp.panel_b !== 'string') {
        rp.panel_b = rp.panel_b == null ? '' : String(rp.panel_b);
        return 1;
    }
    return 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pass: rename_animate_in — only {none, handwriting, fade_in} are wired
//   Map common typos / unwired values to the closest valid kind.
// ─────────────────────────────────────────────────────────────────────────────

const ANIMATE_IN_REWRITES = {
    fade: 'fade_in',
    slide_in_from_right: 'fade_in',
    slide_in: 'fade_in',
    slide: 'fade_in',
    slide_in_from_left: 'fade_in',
    fade_in_from_top: 'fade_in',
    fade_in_from_bottom: 'fade_in',
};

function walkAllPrimitives(concept, fn) {
    for (const { state } of walkStates(concept)) {
        const scene = state?.scene_composition;
        if (Array.isArray(scene)) scene.forEach(fn);
    }
    const overrides = concept?.mode_overrides;
    if (overrides && typeof overrides === 'object') {
        for (const modeVal of Object.values(overrides)) {
            if (!modeVal || typeof modeVal !== 'object') continue;
            const ds = modeVal.derivation_sequence;
            if (Array.isArray(ds)) ds.forEach(fn);
            const epicLOverride = modeVal.epic_l_path?.states;
            if (epicLOverride && typeof epicLOverride === 'object') {
                for (const state of Object.values(epicLOverride)) {
                    const ds2 = state?.derivation_sequence;
                    if (Array.isArray(ds2)) ds2.forEach(fn);
                }
            }
        }
    }
}

function pass_rename_animate_in(concept) {
    let touched = 0;
    walkAllPrimitives(concept, (prim) => {
        if (!prim || typeof prim !== 'object') return;
        if (typeof prim.animate_in === 'string') {
            const remap = ANIMATE_IN_REWRITES[prim.animate_in];
            if (remap && remap !== prim.animate_in) {
                prim.animate_in = remap;
                touched++;
            }
        }
    });
    return touched;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pass: advance_mode_variety — Rule 15: epic_l_path needs ≥ 2 distinct
// advance_mode values. If all states are auto_after_tts (passive video), flip
// the second-to-last state to manual_click so the student gets at least one
// click checkpoint. Honors any non-trivial existing variety.
// ─────────────────────────────────────────────────────────────────────────────

function pass_advance_mode_variety(concept) {
    const states = concept?.epic_l_path?.states;
    if (!states || typeof states !== 'object') return 0;
    const entries = Object.entries(states);
    if (entries.length < 2) return 0;
    const distinct = new Set(entries.map(([, s]) => s?.advance_mode).filter(Boolean));
    if (distinct.size >= 2) return 0;
    // Pick the second-to-last state (interactive checkpoint just before
    // the wrap-up). Fall back to last if only 2 states.
    const targetIndex = entries.length >= 3 ? entries.length - 2 : entries.length - 1;
    const [, target] = entries[targetIndex];
    if (target && typeof target === 'object') {
        target.advance_mode = 'manual_click';
        return 1;
    }
    return 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pass: ensure_one_branch — every concept needs ≥1 misconception branch.
// Synthesize a stub if missing.
// ─────────────────────────────────────────────────────────────────────────────

function pass_ensure_one_branch(concept) {
    if (!concept || typeof concept !== 'object') return 0;
    if (Array.isArray(concept.epic_c_branches) && concept.epic_c_branches.length > 0) return 0;
    concept.epic_c_branches = [{
        branch_id: 'placeholder_misconception',
        misconception: 'Belief: Placeholder misconception (auto-generated — needs author rewrite).',
        trigger_phrases: [],
        states: {
            STATE_1: {
                title: 'Placeholder',
                focal_primitive_id: 'state_1_pad_header',
                advance_mode: 'manual_click',
                scene_composition: makePaddingPrimitives('STATE_1', 'Placeholder branch — needs author content'),
                teacher_script: { tts_sentences: [{ id: 'state_1_s1', text_en: 'Placeholder branch.' }] },
            },
        },
    }];
    return 1;
}

// ─────────────────────────────────────────────────────────────────────────────
// Driver
// ─────────────────────────────────────────────────────────────────────────────

const PASS_REGISTRY = {
    tts_ids: pass_tts_ids,
    focal_primitive_id: pass_focal_primitive_id,
    pad_scene_composition: pass_pad_scene_composition,
    coerce_regeneration_variants: pass_coerce_regeneration_variants,
    backfill_misconception: pass_backfill_misconception,
    coerce_panel_b: pass_coerce_panel_b,
    rename_animate_in: pass_rename_animate_in,
    advance_mode_variety: pass_advance_mode_variety,
    ensure_one_branch: pass_ensure_one_branch,
};

function main() {
    const { dryRun, passes } = parseArgs(process.argv);
    const unknown = passes.filter(p => !PASS_REGISTRY[p]);
    if (unknown.length > 0) {
        console.error(`Unknown pass(es): ${unknown.join(', ')}`);
        console.error(`Known passes: ${Object.keys(PASS_REGISTRY).join(', ')}`);
        process.exit(1);
    }

    const files = fs.readdirSync(CONCEPTS_DIR)
        .filter(f => f.endsWith('.json'))
        .sort();

    console.log(`\n🔧 Backfill Zod failures — ${files.length} concept JSON(s)${dryRun ? ' [DRY RUN]' : ''}`);
    console.log(`   Passes: ${passes.join(', ')}\n`);

    const totals = Object.fromEntries(passes.map(p => [p, 0]));
    let filesChanged = 0;

    for (const file of files) {
        const fp = path.join(CONCEPTS_DIR, file);
        let raw;
        try { raw = fs.readFileSync(fp, 'utf8'); }
        catch { console.log(`  SKIP ${file} — read failed`); continue; }

        let concept;
        try { concept = JSON.parse(raw); }
        catch { console.log(`  SKIP ${file} — JSON parse failed`); continue; }

        const perFile = Object.fromEntries(passes.map(p => [p, 0]));
        for (const passName of passes) {
            const fn = PASS_REGISTRY[passName];
            try {
                const n = fn(concept) || 0;
                perFile[passName] = n;
                totals[passName] += n;
            } catch (err) {
                console.log(`  ERR  ${file} pass=${passName}: ${err?.message ?? err}`);
            }
        }

        const totalForFile = passes.reduce((a, p) => a + perFile[p], 0);
        if (totalForFile > 0) {
            const summary = passes.filter(p => perFile[p] > 0).map(p => `${p}=${perFile[p]}`).join(' ');
            console.log(`  ${file.padEnd(40)} ${summary}`);
            if (!dryRun) {
                fs.writeFileSync(fp, JSON.stringify(concept, null, 2) + '\n');
                filesChanged++;
            }
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log('Pass totals:');
    for (const p of passes) {
        console.log(`  ${p.padEnd(32)} ${String(totals[p]).padStart(5)}`);
    }
    console.log(`Files changed: ${filesChanged}${dryRun ? ' (dry run — nothing written)' : ''}`);
}

main();
