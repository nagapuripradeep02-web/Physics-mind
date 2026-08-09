import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
const S = 'pcpl_surgeon three-fix session, 2026-08-08';
const R = ['src/lib/renderers/particle_field_renderer.ts'];
const rows = [
{ bug_class: 'gas_kinetics_buffer_samples_stamped_with_stale_previous_state_clock',
  title: 'The kinetics buffer stamped its state-entry settle samples with the PREVIOUS state clock, so a displayed ratio depended on how long the teacher lingered on the prior slide',
  severity: 'CRITICAL', owner_cluster: 'peter_parker:renderer_primitives', subject: 'chemistry',
  root_cause:
    'resetToHomePose() called rebuildScene() BEFORE zeroing PM_simTimeMs. rebuildScene -> gasInit runs a 55-tick ' +
    'settle whose gasSampleStats -> gasSampleKinetics pushes samples keyed on the live clock with fwd:0/rev:0, so ' +
    'those 55 points carried the PREVIOUS state stale time instead of t=0 and landed inside the NEW state fit ' +
    'window. Measured on rate_law_and_order S2 primary aha: x1.24 / x2.75 / x0.03 for prior-state dwells of ' +
    '1000 / 3500 / 4500 ms, with the physics unchanged. THE EYE was orthogonal — it pins one fixed sequence and ' +
    'faithfully reproduced one arbitrary point of the family. gasTargetT had already been hardened against this ' +
    'exact ordering hazard; the new buffer had no such guard.',
  prevention_rule:
    'Any accumulator stamping samples with PM_simTimeMs and populated during a settle invoked from rebuildScene() ' +
    'must have the clock already at its NEW value before rebuildScene runs. The zero now happens first as an ' +
    'invariant, so future clock-keyed accumulators inherit it. Corollary: reproducible is not correct — a fixed ' +
    'capture sequence cannot detect a defect whose parameter is teacher dwell time.',
  probe_type: 'js_eval',
  probe_logic:
    'Enter a second state authoring kinetics_marks after stepping the first to a non-zero clock; assert every ' +
    'sample in the buffer immediately after gasInit has t === 0. Regression: the same fitted ratio at dwells of ' +
    '1000 / 3500 / 4500 ms, within seed variance.',
  status: 'FIXED', concepts_affected: ['rate_law_and_order','rate_of_reaction'], fixed_in_files: R, row_type: 'incident' },
{ bug_class: 'window_shrink_animation_shows_non_monotonic_unstable_intermediate_values',
  title: 'The shrink-to-settle chip swung non-monotonically before settling, teaching the opposite of the state thesis',
  severity: 'MAJOR', owner_cluster: 'peter_parker:renderer_primitives', subject: 'chemistry',
  root_cause:
    'converge_from was coded and documented as cosmetic: the drawn edges animated while the fit was requested over ' +
    'the literal final window. But the buffer holds no future samples, so requesting a window that has not elapsed ' +
    'silently fits [t0, now] — a left-anchored, right-edge-growing regression unrelated to what was drawn. ' +
    'Measured on rate_of_reaction S5 under narration reading "narrow it further and it holds steady": 20.03 -> ' +
    '23.52 -> 16.61 during the convergence, then frozen for 16 s once the literal window elapsed.',
  prevention_rule:
    'A shrink-to-settle construction must FIT THE SAME WINDOW IT DRAWS, resolved at each step — compute the ' +
    'animated centre-pinned window first, then fit on it, exactly as the teacher-drag path already did. Never fit ' +
    'a nominally fixed window whose right edge has not elapsed and assume the partial-fill behaviour resembles the ' +
    'intended animation.',
  probe_type: 'js_eval',
  probe_logic:
    'Sample the displayed rate at each half-width during the shrink; assert monotonic convergence, and that the ' +
    'drawn chord never extrapolates beyond the fitted sample range.',
  status: 'FIXED', concepts_affected: ['rate_of_reaction','rate_law_and_order'], fixed_in_files: R, row_type: 'incident' },
{ bug_class: 'gas_box_kinetics_ratio_needs_r10_not_r5_to_separate_x2_from_x1',
  title: 'Repeat-run averaging is built and correct, and R must be about 10 — not the 3 to 5 assumed — to separate x2 from x1 on this box',
  severity: 'MAJOR', owner_cluster: 'peter_parker:renderer_primitives', subject: 'chemistry',
  root_cause:
    'rate_law_and_order S2 (target ~2) and S5 (null ~1) fit a windowed rate over roughly 6-10 reaction events. ' +
    'Measured 10 seeds at R=1: S2 1.22-3.39 vs S5 0.55-2.51, heavy overlap. R=3: 1.09-3.90 vs 0.51-1.56, still ' +
    'overlapping. R=5 on 10 seeds appeared to separate (1.38-2.69 vs 0.71-1.29) — but an independent 20-seed batch ' +
    'at R=5 overlapped again (1.21-2.79 vs 0.66-1.65), so the apparent separation was a small-sample false ' +
    'positive. Only R=10 separated cleanly (1.64-2.32 vs 0.68-1.34), at a cost of ten measuring windows of ' +
    'narrated time per slot — beyond what a 15-20 s guided state can absorb.',
  prevention_rule:
    'Do not assume R=3-5 repeat-averaging makes a x2-vs-x1 ratio distinguishable at this event-count regime. Any ' +
    'state narrating "the number will read about N" from a repeat comparison must show the target and null ranges ' +
    'do not overlap across at least TWO independently seeded batches of at least 10 seeds — one batch is how a ' +
    'false positive ships. Prefer a LARGER authored contrast (a 4x pour distinguishes order 1 from order 0 and ' +
    'order 2 by wide margins) over more repeats, when the pedagogy allows it.',
  probe_type: 'js_eval',
  probe_logic:
    'For a baseline/disturbed composition pair and R in {1,3,5,10}, run at least 10 independent seeds through the ' +
    'same display path the chip uses and report the range; require non-overlap across two separate batches.',
  status: 'FIXED', concepts_affected: ['rate_law_and_order'], fixed_in_files: R, row_type: 'incident' },
];
(async () => { for (const r of rows) {
  const res = await supabaseAdmin.from('engine_bug_queue').upsert({ ...r, discovered_in_session: S }, { onConflict: 'bug_class' });
  console.log(res.error ? `  x ${r.bug_class}: ${res.error.message}` : `  ok ${r.severity.padEnd(8)} ${r.status.padEnd(5)} ${r.bug_class}`);
} })();
