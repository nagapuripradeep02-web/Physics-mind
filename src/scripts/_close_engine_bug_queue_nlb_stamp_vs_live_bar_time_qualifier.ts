/**
 * engine_bug_queue — CLOSE the latched-stamp / live-work-bar time-qualifier row
 * (field3d_surgeon, 2026-08-08). Routed by founder_proxy Checkpoint B as
 * BLOCKING on `conservative_vs_nonconservative_forces`.
 *
 * The diagnosis in the OPEN row is CONFIRMED, not refuted, and reproduced
 * independently at 60 fps against the PRE-fix renderer.
 *
 * The remedy is the row's own prevention_rule with ONE wording change and ONE
 * sharper gate — both argued in the update text below.
 *
 * UPDATE (never a duplicate INSERT): bug_class is the upsert key.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_close_engine_bug_queue_nlb_stamp_vs_live_bar_time_qualifier.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const BUG_CLASS =
    'nlb_latched_checkpoint_stamp_and_the_live_work_bar_report_one_symbol_at_two_values_with_no_time_qualifier';

const ROOT_CAUSE_SUFFIX =
    ' [FIXED 2026-08-08, field3d_surgeon] Diagnosis CONFIRMED, reproduced independently against the'
    + ' PRE-fix renderer with a 60 fps rAF collector over 9 s per state. STATE_1: 4 latch cycles,'
    + ' 13-14 frames each (199-216 ms), stamp "back at the start:  W gravity = 0.0 J" while the'
    + ' gravity bar swept +1.5 -> +22.9 J. STATE_2: 5 latch cycles, 14-17 frames each (216-266 ms),'
    + ' stamp "0.0 J / -27.4 J" while the bars read +0.6 -> +16.8 J and -27.6 -> -36.0 J. The bar'
    + ' matched the stamp on ZERO frames of ZERO cycles on either state — including the very first'
    + ' frame the stamp exists (STATE_2 opens at +0.6 J against a stamped 0.0 J).'
    + ' REMEDY: the work section header is now a per-state string. nlbWkCapLive(eng) resolves it ONCE'
    + ' at state entry (never per frame: a mid-state rewrite would reflow the panel width at exactly'
    + ' the instant the stamp lands, and a state-static string is trivially byte-stable under a'
    + ' SET_TIME_FREEZE pin) and nlbApplyWorkSection writes it on the same display pass that shows the'
    + ' slots, BEFORE nlbFitEnergyPanel measures. Qualified states read "Work done so far"; every'
    + ' other state keeps "Work done" byte-for-byte. The stamp is untouched — firing, dwell and text'
    + ' are all unchanged (post-fix: STATE_1 4 cycles / 13-14 frames, STATE_2 5 cycles / 14-15'
    + ' frames, identical stamp strings), because the stamp already carries its own time in its label'
    + ' ("back at the start:") and the thing with no time on it was the INSTRUMENT.';

const PREVENTION_SUFFIX =
    ' AMENDED IN TWO PLACES on the evidence. (1) WORDING: "so far", not "now". On a work-energy'
    + ' chapter "the work done now" reads as the work being done at this instant — a rate, which is'
    + ' what power is — while the bar is a running total accumulated since the run began. "Work done'
    + ' so far" is literally what the bar shows and stays inside Rule 41. (2) GATE: the narrowing'
    + ' clause "a ledger that changes sign inside the loop" is implemented as a PHYSICAL, statically'
    + ' decidable test rather than a runtime sign watch — the checkpoint must sit within 1 mm of its'
    + ' body initial_position_m. Every ledger is zeroed at the body seed, so for a position-determined'
    + ' force W(s) = F_along*(s - s0) and W = 0 EXACTLY at s = s0: a start-line crossing IS the'
    + ' instant the ledger passes through zero and reverses. All three conditions must hold — live'
    + ' work bars, a mode-first stamp whose capture list contains W, and that stamp on its body start'
    + ' line. Fleet reach measured, not assumed: only 3 concepts author nlb checkpoints at all;'
    + ' kinetic_energy_definition captures v and K (no W) and authors no work_accumulators;'
    + ' work_done_by_constant_force STATE_4 stamps W but its flag sits 2.0 m from the crate start, so'
    + ' its monotone bar has merely grown past the stamped value — same sign, same direction, no'
    + ' contradiction — and it is excluded. ATTRIBUTION MEASURED: pre-fix and post-fix EYE runs of'
    + ' work_done_by_constant_force (12 frames) and kinetic_energy_definition (12 frames) report'
    + ' IDENTICAL H2 percentages to the digit on every frame; the target concept moves on exactly the'
    + ' 4 frames of STATE_1/STATE_2 (0.02% and 0.07%, both inside the 2.0% tolerance, so no baseline'
    + ' fails) and 0.00% on all 6 frames of STATE_3/4/5. Rewind determinism verified directly: pin'
    + ' 1840 -> pin 600 -> pin 1840 on STATE_1 (and 1700/600/1700 on STATE_2) returns an identical'
    + ' header, bar set and formula surface.';

const PROBE_LOGIC =
    'js_eval over the cached sim, per state, after SET_STATE. Let Q = (the state authors'
    + ' work_accumulators) AND (some checkpoint has capture_mode absent-or-"first", its capture list'
    + ' contains "W", and |s_m - initial_position_m of its body| <= 0.001). Assert'
    + ' document.getElementById("nlb_wk_cap").textContent === (Q ? "Work done so far" : "Work done").'
    + ' Fleet expectation: Q is true on exactly conservative_vs_nonconservative_forces STATE_1 and'
    + ' STATE_2 and false everywhere else. (SUPERSEDES the original numeric form "assert'
    + ' abs(bar - stamp) <= 0.05 J OR the panel header differs from the stamp head": the second'
    + ' disjunct was already satisfied PRE-fix — "Work done" differs from "back at the start:" — so'
    + ' the probe passed on the very frames that carried the defect.)';

async function main(): Promise<void> {
    const { data: row, error: readErr } = await supabaseAdmin
        .from('engine_bug_queue')
        .select('bug_class, status, root_cause, prevention_rule, fixed_in_files, concepts_affected')
        .eq('bug_class', BUG_CLASS)
        .maybeSingle();
    if (readErr) throw new Error(`read failed: ${readErr.message}`);
    if (!row) throw new Error(`row not found — refusing to INSERT a duplicate for ${BUG_CLASS}`);
    if (row.status === 'FIXED') { console.log('already FIXED — nothing to do.'); return; }

    const { error } = await supabaseAdmin
        .from('engine_bug_queue')
        .update({
            status: 'FIXED',
            fixed_at: new Date().toISOString(),
            fixed_in_files: ['src/lib/renderers/field_3d_renderer.ts'],
            root_cause: (row.root_cause ?? '') + ROOT_CAUSE_SUFFIX,
            prevention_rule: (row.prevention_rule ?? '') + PREVENTION_SUFFIX,
            probe_logic: PROBE_LOGIC,
        })
        .eq('bug_class', BUG_CLASS);
    if (error) throw new Error(`update failed: ${error.message}`);
    console.log(`✅ CLOSED (FIXED) ${BUG_CLASS}`);
}

main().catch((err) => { console.error('💥 close failed:', err instanceof Error ? err.stack : err); process.exit(1); });
