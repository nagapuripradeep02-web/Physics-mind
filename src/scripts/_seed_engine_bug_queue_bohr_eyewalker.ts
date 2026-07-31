/**
 * Seed engine_bug_queue with the defect classes surfaced by the eye_walker
 * frame-walk of bohr_model_energy_levels (2026-07-27).
 *
 * Third companion to the Bohr scar list:
 *   _seed_engine_bug_queue_chemistry_session.ts  — classes found during the BUILD
 *   _seed_engine_bug_queue_bohr_audit.ts         — classes found by the stage-4 AUDIT
 *   this file                                     — classes found by reading THE EYE's FRAMES
 *
 * Context: this was the first EYE run on the parametric family after the branch
 * absorbed 130 commits of master (new PM_focalEmphasis, deterministic clock,
 * PM_fitCanvas). Deterministic gates came back 39/39 with zero console errors,
 * so every row here is a legibility/coherence class that only reading the frames
 * could surface — exactly the split THE EYE + eye_walker exist to produce.
 *
 * Also flips three rows the frame-walk verified as no-longer-reproducing.
 *
 * Idempotent: upserts on the UNIQUE bug_class.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_bohr_eyewalker.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'chemistry-wave1-bohr-eyewalker-2026-07-27';
const CHEM = ['bohr_model_energy_levels'];

interface BugRow {
    bug_class: string;
    title: string;
    severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
    owner_cluster: string;
    root_cause: string;
    prevention_rule: string;
    probe_type: 'sql' | 'js_eval' | 'manual' | 'vision_model';
    probe_logic: string;
    status: 'OPEN' | 'FIXED';
    concepts_affected: string[];
    fixed_in_files: string[];
    subject: 'physics' | 'chemistry' | 'subject_neutral';
}

const ROWS: BugRow[] = [
    {
        bug_class: 'reveal_complete_frame_delta_invisible_across_states',
        title: 'A there-and-back state ends in the previous state’s resting pose — its frozen frame carries none of its own teaching',
        severity: 'MODERATE',
        owner_cluster: 'alex:json_author',
        root_cause:
            "STATE_3 (the PRIMARY misconception beat: 'staircase, not a ramp') teaches by showing a ghost electron glide smoothly between rungs, then dissolving it and snapping the real electron rung-to-rung. Both wrong-belief primitives carried disappear_at_ms, so by reveal-complete the canvas is the ladder plus one electron at n=1 with a glow — pixel-wise the same picture STATE_2 ends on. The delta is fully legible in the DENSE frames and completely absent from the frozen frame, which is precisely the frame that becomes the H2 regression baseline and the one a reviewer judges in isolation. Rule 32c/32d assume each state's single held picture shows its own new thing; a narrative that returns to a prior resting pose silently breaks that assumption.",
        prevention_rule:
            "When a state's narrative RETURNS to a visual pose an earlier state already ended on (a there-and-back trip, a rejected-then-corrected motion), author a persistent visual residue that survives to the frozen frame — a verdict badge, a dissolved-ghost trail, a struck-through wrong path. Test: put the state's frozen frame next to the previous state's frozen frame; if a teacher cannot name the new idea from that pair alone, the state has no delta where it counts.",
        probe_type: 'vision_model',
        probe_logic:
            "Compare each state's __frozen.png against the previous state's __frozen.png. FLAG any adjacent pair whose pixel difference is below the same threshold D7 uses for a static tail (<0.1% of canvas), since near-identical held frames mean the later state's teaching exists only in motion.",
        status: 'FIXED',
        // Fixed 2026-07-27: STATE_3 gained two persistent verdict labels
        // (verdict_ramp "✗ smooth ramp" / verdict_staircase "✓ fixed rungs only")
        // appearing at 13500ms with no disappear_at_ms, so the frozen frame now
        // states the state's own conclusion and differs from STATE_2's.
        concepts_affected: CHEM,
        fixed_in_files: ['src/data/concepts/chemistry/bohr_model_energy_levels.json'],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'state_duration_field_overpadded_vs_reveal',
        title: 'Authored `duration` is ~2x the real reveal+narration time, producing a long pixel-static tail',
        severity: 'MODERATE',
        owner_cluster: 'alex:json_author',
        root_cause:
            "STATE_3 declares duration 32000ms and STATE_7 declares 35000ms, but each state's reveal completes at ~18.6s / ~16.4s and its narration is ~51 / ~47 words (~18.2s / ~16.8s at 2.8 wps). Reveal-complete and narration-end therefore land within a second of each other — the pacing is actually FINE — while the declared duration leaves 13.4s / 18.6s of pixel-identical frames. Harmless under advance_mode 'manual_click' (a teacher clicks on when narration ends), but it inflates THE EYE's capture window and would become a real defect anywhere duration is read as authoritative: autoplay pacing, a Professor Pack beat timeline, or any future non-manual advance mode. NOTE: this row REFINES 'narration_outruns_choreography' — that probe measures body-motion timings, which do settle early (~10.7-12.8s) before the glow/annotation reveal finishes, so its signal is real but its framing ('teacher talks over a dead picture') overstates what the frames show.",
        prevention_rule:
            "Author `duration` from measured content, not a round number: max(reveal-complete ms, estimated narration ms = words/2.8*1000) plus a small settle margin (~2s), never 1.5-2x it. A dense-frame static tail should read as a brief Rule-26 hold, not as the majority of the state's declared life.",
        probe_type: 'js_eval',
        probe_logic:
            "For each guided state: reveal_end_ms = max over all timing fields; est_speech_ms = words/2.8*1000; content_ms = max(reveal_end_ms, est_speech_ms). FLAG when duration_ms > 1.5 * content_ms.",
        status: 'OPEN',
        concepts_affected: CHEM,
        fixed_in_files: [],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'core_ring_state_shows_value_whose_only_derivation_is_higher_ring',
        title: 'Explore state renders a computed VALUE whose derivation lives only in an extended-ring state (Rule 38b, value variant)',
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        root_cause:
            "Distinct from the symbol-level sibling row (explore_state_surfaces_non_core_ring_symbol): here the SYMBOL was legitimately core — STATE_6 (core) already labels the axis 'wavelength λ (nm)' — but no core state ever showed a NUMERIC nm value for a line. Core taught gaps in eV and lines as positions on the strip; the number came only from STATE_7's extended-ring hc/ΔE derivation. So under the qualitative_core preset the explore sandbox printed 'λ = 656 nm' as a bare computed value the student had never seen produced. A ring-coherence check that only diffs symbol sets passes this, because the symbol is present in core and only the value's provenance is missing.",
        prevention_rule:
            "Run the coherent-when-cut check on VALUES, not just symbols: for every quantity the explore state prints, find the earliest state that shows a concrete instance of that quantity. If that state is not core, either introduce a concrete instance in a core state (preferred — usually strengthens the core lesson) or drop the quantity from the explore surface. Introducing the value empirically in core while leaving the DERIVATION in extended is the correct split: core students see that a line has a wavelength, extended students see why.",
        probe_type: 'js_eval',
        probe_logic:
            "Collect the unit-bearing quantities rendered by the interaction_complete state (regex on rendered text/text_expr for number+unit pairs and computed_outputs keys). For each, find the earliest state rendering a concrete instance of the same quantity; FAIL when that state's depth_ring != 'core'.",
        status: 'FIXED',
        // Fixed 2026-07-27: STATE_6 (core) now labels each spectral line with its
        // wavelength as it solidifies (line_label_656/486/434/410 at y=462), so the
        // nm value is introduced empirically in core, tied to the gap that produces
        // it — which is STATE_6's own thesis ("Every line, one gap"). STATE_7's
        // hc/ΔE derivation correctly stays extended.
        concepts_affected: CHEM,
        fixed_in_files: ['src/data/concepts/chemistry/bohr_model_energy_levels.json'],
        subject: 'subject_neutral',
    },
    {
        bug_class: 'prose_annotation_encroaches_delta_cue_band',
        title: 'A full-sentence annotation sits in the top caption band where the eye expects only the ≤5-word delta cue',
        severity: 'MODERATE',
        owner_cluster: 'alex:json_author',
        root_cause:
            "STATE_4's `prereq_note` is a 10-word sentence positioned near the top-caption zone. It is not the delta_cue field, so it does not literally violate Rule 34a, but it lands in the band the teacher's eye scans for the one-line delta cue and reads as competing prose on a canvas whose rule is labels-and-equations only (Rule 24/34a). Prose belongs in the subtitle strip below the canvas.",
        prevention_rule:
            "Reserve the top caption band for the delta cue alone. Any explanatory sentence — prerequisite reminders, scope notes, caveats — either moves into the narration (subtitle strip) or is repositioned well clear of the caption band. The band, not just the field, is what the rule protects.",
        probe_type: 'js_eval',
        probe_logic:
            "For each state, FLAG any label/annotation other than the delta_cue whose y position is within the caption band (y < 60) and whose text exceeds ~6 words.",
        status: 'OPEN',
        concepts_affected: CHEM,
        fixed_in_files: [],
        subject: 'subject_neutral',
    },
];

// Rows the frame-walk verified as no longer reproducing. Recorded as an explicit
// status flip (with evidence) rather than a silent edit, so queue triage can see
// WHY each closed.
const CLOSURES: Array<{ bug_class: string; evidence: string }> = [
    {
        bug_class: 'authored_indicator_hardcoded_to_default_variable_value',
        evidence:
            'eye_walker 2026-07-27: verified by arithmetic, not proximity — S7 lambda_pointer uses position_expr "2*lambda_nm-705"; at λ=656nm that is canvas x=607, the exact x of line_656_solid. All three indicator bodies (lambda_pointer, lambda_caret_explore, start_level_marker) use position_expr with no animation block.',
    },
    {
        bug_class: 'focal_pulse_scales_size_violates_rule29',
        evidence:
            'eye_walker 2026-07-27: diffed S4 electron before/during glow (dense_t01000 vs t10000) — apparent diameter unchanged, only a radial halo + brightness increase. Post-merge PM_focalEmphasis (alpha + shadowBlur, peers dimmed to 0.6) replaced the size-pulse mechanism. Exactly one glow focal active at any instant across all 9 states.',
    },
    {
        bug_class: 'derived_contract_value_computed_but_never_surfaced',
        evidence:
            'eye_walker 2026-07-27: traced all four computed_outputs (delta_E_ev, lambda_nm, direction, spectral_region) through the JSON — each is consumed by at least one rendered text_expr or position_expr. Not reproduced.',
    },
    {
        bug_class: 'explore_state_surfaces_non_core_ring_symbol',
        evidence:
            'Resolved 2026-07-27 across two sessions. The original complaint was ΔE plus the UV/IR abbreviations — all three are now absent from STATE_9 (the readout says "gap … eV" and "visible line"/"not visible" in plain English). The residual leak eye_walker found was the λ VALUE, not the symbol, and is fixed by introducing wavelength numbers on the STATE_6 (core) spectral lines. Full audit of every symbol STATE_9 renders — n, eV, 400/700, "wavelength λ (nm)", λ value, gap in eV — now traces to a core-ring state. Tracked going forward as the sharper value-variant row core_ring_state_shows_value_whose_only_derivation_is_higher_ring.',
    },
];

async function main(): Promise<void> {
    console.log(`Seeding ${ROWS.length} eye_walker frame-walk defect classes into engine_bug_queue…\n`);
    let withSubject = true;
    let ok = 0;

    for (const row of ROWS) {
        const base = {
            ...row,
            discovered_in_session: SESSION,
            row_type: 'incident',
            fixed_at: row.status === 'FIXED' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
        };
        let payload: Record<string, unknown> = { ...base };
        if (!withSubject) delete payload.subject;

        let { error } = await supabaseAdmin
            .from('engine_bug_queue')
            .upsert(payload, { onConflict: 'bug_class' });

        if (error && /subject/i.test(error.message)) {
            withSubject = false;
            payload = { ...base };
            delete payload.subject;
            ({ error } = await supabaseAdmin
                .from('engine_bug_queue')
                .upsert(payload, { onConflict: 'bug_class' }));
        }

        if (error) console.log(`  ✖ ${row.bug_class} — ${error.message}`);
        else { ok++; console.log(`  ✓ [${row.severity.padEnd(8)}] ${row.status.padEnd(5)} ${row.bug_class}`); }
    }

    console.log(`\n${ok}/${ROWS.length} rows upserted.`);
    if (!withSubject) console.log('⚠ `subject` column absent — apply the 2026-07-24 migration, then re-run.');

    // Status flips for rows the frame-walk could not reproduce.
    console.log(`\nClosing ${CLOSURES.length} rows verified as no longer reproducing…`);
    for (const c of CLOSURES) {
        const { error } = await supabaseAdmin
            .from('engine_bug_queue')
            .update({
                status: 'FIXED',
                fixed_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                verification_note: c.evidence,
            })
            .eq('bug_class', c.bug_class);
        if (error) {
            // verification_note may not exist on this schema — retry without it.
            const { error: e2 } = await supabaseAdmin
                .from('engine_bug_queue')
                .update({ status: 'FIXED', fixed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
                .eq('bug_class', c.bug_class);
            console.log(e2 ? `  ✖ ${c.bug_class} — ${e2.message}` : `  ✓ ${c.bug_class} (note column absent; status flipped)`);
        } else {
            console.log(`  ✓ ${c.bug_class}`);
        }
    }

    // narration_outruns_choreography is deliberately NOT closed — the frame-walk
    // refined rather than refuted it. Left OPEN for founder triage against the new
    // state_duration_field_overpadded_vs_reveal row.
    console.log('\nNote: narration_outruns_choreography left OPEN — refined, not refuted (see the new duration row).');
}

main();
