/**
 * engine_bug_queue rows from the eye-walker RE-VERIFY walk of
 * kinetic_particle_theory (run .visual_runs/kinetic_particle_theory/20260728-010656,
 * 2026-07-28). That walk confirmed all five prior findings fixed at pixel level
 * and surfaced two new MODERATE ones.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_gas_box_eyewalker2.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-28_gas_box_eyewalker_reverify';
const RENDERER = 'src/lib/renderers/particle_field_renderer.ts';
const CONCEPT = 'kinetic_particle_theory';

const rows = [
  {
    bug_class: 'gas_box_settle_ticks_left_readout_window_unprimed',
    title: 'P and collisions/s showed a one-sample estimate in a state\'s opening frame — the instrument was wrong in exactly the frame a teacher opens on',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      'VERIFIED + FIXED 2026-07-28 (eye-walker re-verify). The init settle pass added to fix the ' +
      'lattice home pose ran gasIntegrate + gasCollide but not gasSampleStats, so the rolling ' +
      'pressure and collision-rate windows arrived at t=0 EMPTY. The HUD then divided a single ' +
      'tick of wall impulse by a one-sample window — a rate estimate with enormous variance. ' +
      'Measured: STATE_4 (compressed) opened at P=0.292 against a settled 0.135, while STATE_3 ' +
      '(open box) opened at P=0.000 with 0 collisions/s against a settled 0.050 — the two erring ' +
      'in OPPOSITE directions, which is the signature of variance rather than bias. Frozen H2 ' +
      'baselines were unaffected, so no gate would ever have caught it. FIXED by sampling during ' +
      'the settle pass so the windows are populated before the state is ever displayed; the ' +
      'cumulative per-state tallies are still zeroed. Re-verified: STATE_3 opens 0.076 vs settled ' +
      '0.065, STATE_4 opens 0.110 vs settled 0.132.',
    prevention_rule:
      'An init-time settle/relaxation pass must leave every rolling measurement window in the same ' +
      'state a running sim would produce — prime them, do not merely clear them. A HUD backed by a ' +
      'rolling average must never display a window shorter than its averaging period, because the ' +
      'opening frame of a state is the one a teacher looks at longest.',
    probe_type: 'js_eval',
    probe_logic:
      'At state entry (t=0) assert each rolling-average HUD reads within ~25% of its value after the ' +
      'averaging window has fully turned over.',
    status: 'FIXED',
    concepts_affected: [CONCEPT],
    fixed_in_files: [RENDERER],
    row_type: 'incident',
  },
  {
    bug_class: 'gas_box_compressed_state_empty_pane_no_affordance',
    title: 'STATE_4 frees ~55% of the canvas when the piston closes and leaves it black with no affordance — reads as broken rather than reserved',
    severity: 'MODERATE',
    owner_cluster: 'ambiguous',
    root_cause:
      'OPEN — founder/authoring call, 2026-07-28 (eye-walker re-verify, answering a direct ' +
      'adversarial question). Correction to an earlier assumption of mine: S1-S3 do NOT have a ' +
      'reserved pane; the box occupies the full canvas there. The empty pane exists only in ' +
      'STATE_4, where the piston compresses the box to half width and the freed right half stays ' +
      'black until STATE_5 fills it with the histogram. The only marker that the space is ' +
      'deliberate is the ghost outline, measured at ~14-15% effective alpha per antialiased row ' +
      '(3-4x fainter than a live box border) — discernible on deliberate inspection, not at a ' +
      'glance on a projector. No label, no dashed placeholder, nothing saying the space is ' +
      'reserved. Options: (a) accept as a Rule-32d continuity tradeoff, (b) strengthen the ghost ' +
      'outline further, (c) add a reserved-space affordance, (d) re-author so the histogram pane ' +
      'is introduced earlier.',
    prevention_rule:
      'A state that leaves canvas space empty for a later state to fill must mark that space as ' +
      'deliberately reserved at a legibility floor a teacher notices at a glance. Extends the ' +
      'Rule-32c "delta marker must survive dimming" logic to "reserved-empty must survive a glance".',
    probe_type: 'vision_model',
    probe_logic:
      'Flag any state where >30% of the canvas is empty background with no label, frame or affordance.',
    status: 'OPEN',
    concepts_affected: [CONCEPT],
    fixed_in_files: [],
    row_type: 'incident',
  },
];

async function main(): Promise<void> {
  let ok = 0;
  for (const r of rows) {
    const res = await supabaseAdmin
      .from('engine_bug_queue')
      .upsert({ ...r, discovered_in_session: SESSION }, { onConflict: 'bug_class' });
    if (res.error) console.error(`  x ${r.bug_class}: ${res.error.message}`);
    else { ok++; console.log(`  ok ${r.severity.padEnd(8)} ${r.status.padEnd(5)} ${r.bug_class}`); }
  }
  console.log(`\n${ok}/${rows.length} re-verify rows upserted.`);
}
main().catch((e) => { console.error('seed failed:', e); process.exit(1); });
