/**
 * engine_bug_queue rows for WP-F3 (PCPL hardening plan finale — cleanup + memory).
 *
 * 4 FIXED rows carrying forward the WP-R1/R3/T1 renderer + THE-EYE fixes from
 * this session's PCPL hardening pass (see
 * C:\Users\PRADEEEP\.claude\plans\what-a-photographer-is-deep-thunder.md), plus
 * 1 OPEN row for a cosmetic gap discovered but not fixed (out of scope for the
 * renderer WPs, left for the next renderer touch). Each FIXED row's underlying
 * function/fix was re-verified present in the actual source at seed time
 * (PM_focalEmphasis, PM_fitCanvas, pcplSceneRevealMs, the PM_simClockMs snap,
 * grep-zero on PM_focalPulseScale) — not taken on faith from the plan doc.
 *
 * Idempotent: upsert onConflict 'bug_class'. Run:
 *   npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_wpf3_pcpl_hardening_cleanup.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-23_wpf3_pcpl_hardening_cleanup';

type Owner =
  | 'alex:architect' | 'alex:physics_author' | 'alex:json_author'
  | 'peter_parker:renderer_primitives' | 'peter_parker:runtime_generation'
  | 'peter_parker:visual_validator' | 'ambiguous';
type Severity = 'CRITICAL' | 'MAJOR' | 'MODERATE';
type Status = 'OPEN' | 'FIXED' | 'DEFERRED' | 'NOT_REPRODUCING' | 'FALSE_POSITIVE';
type ProbeType = 'sql' | 'js_eval' | 'manual' | 'vision_model';
type RowType = 'incident' | 'directive';

interface Row {
  bug_class: string; title: string; severity: Severity; owner_cluster: Owner;
  root_cause: string; prevention_rule: string; probe_type: ProbeType; probe_logic: string;
  status: Status; concepts_affected: string[]; fixed_in_files: string[]; row_type: RowType;
}

const RENDERER = 'src/lib/renderers/parametric_renderer.ts';
const PREMIUM = 'src/lib/renderers/premium_primitives.ts';
const DERIVE_META = 'src/lib/validators/visual/deriveStateMeta.ts';

// All 16 PCPL_CONCEPTS (aiSimulationGenerator.ts) as of 2026-07-23 — the
// fleet-wide renderer/gate fixes below apply uniformly to every one of them.
const PCPL_16 = [
  'field_forces', 'contact_forces', 'normal_reaction', 'tension_in_string',
  'hinge_force', 'free_body_diagram', 'vector_resolution', 'resultant_formula',
  'direction_of_resultant', 'umbrella_tilt_angle', 'friction_static_kinetic',
  'current_not_vector', 'pressure_scalar', 'scalar_vs_vector',
  'vector_head_to_tail', 'newton_second_law_direction',
];

const rows: Row[] = [
  {
    bug_class: 'time_freeze_pin_float_precision_undershoot',
    title: 'SET_TIME_FREEZE catch-up accumulated float error, landing PM_simClockMs a hair below target — THE EYE\u2019s poll never saw target reached and silently fell back to a non-deterministic capture',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      'FIXED 2026-07-23 (WP-R1). The SET_TIME_FREEZE deterministic catch-up advanced PM_simClockMs by repeatedly adding 1000/60 per fixed step to reach the pinned target; because 1000/60 is not exactly representable in IEEE-754 float, N repeated additions accumulate rounding error, so a nominal target of 1000ms could land at e.g. 999.9999999999991 instead of exactly 1000. THE EYE\u2019s capture poll waits for PM_simTimeMs >= target; a clock landing fractionally BELOW target due to float drift failed that comparison and silently fell back to a non-deterministic "capture anyway" path \u2014 defeating the entire purpose of the pin (a byte-identical frame). Fixed by snapping PM_simClockMs = Math.max(PM_simClockMs, PM_pinTargetMs) once the ceil-stepped catch-up loop completes, so the poll condition is satisfied by construction regardless of accumulated float error.',
    prevention_rule:
      'Any renderer catch-up/accumulator loop that must satisfy a ">=target" poll (THE EYE\u2019s SET_TIME_FREEZE convergence check, or any future deterministic-pin mechanism) must snap-clamp the accumulator to the target with Math.max AFTER the step loop \u2014 never rely on N \u00d7 (target/N) floating-point additions summing to exactly target. Reference: particle_field_renderer.ts\u2019s own SET_TIME_FREEZE catch-up uses the same ceil-step + snap pattern; parametric_renderer.ts\u2019s clock now mirrors it.',
    probe_type: 'js_eval',
    probe_logic:
      'After sending SET_TIME_FREEZE {at_ms: N} to a PCPL iframe and waiting one animation frame, read the exposed sim-clock value and assert it is >= N exactly (not merely "close to") \u2014 repeat for at least two different N values in the same session to catch residual per-call drift. Reference regression: scalar_vs_vector at_ms=1000/2000/3000 all read back >= target with zero fallback-path log lines.',
    status: 'FIXED',
    concepts_affected: PCPL_16,
    fixed_in_files: [RENDERER],
    row_type: 'incident',
  },
  {
    bug_class: 'pcpl_reveal_hold_unreachable_under_rule31',
    title: 'pcplRevealMs() summed the Rule-31-forbidden pause_after_ms field, so it always fell back to the 1500ms DEFAULT_REVEAL_MS floor \u2014 D7\u2019s "reveal > 1500" relaxation was structurally unreachable on every correctly-authored PCPL state',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:visual_validator',
    root_cause:
      'FIXED 2026-07-23 (WP-T1, after WP-R5 locked the D5 choreography field names). deriveStateMeta.ts\u2019s pcplRevealMs() derived a state\u2019s reveal-complete time by summing tts_sentences[].pause_after_ms \u2014 a field Rule 31 explicitly FORBIDS authoring on new concepts (pause_after_ms/narrative_socratic are legacy-only). Every correctly-authored Rule-31 PCPL state therefore has zero pause_after_ms fields, so pcplRevealMs() always returned exactly DEFAULT_REVEAL_MS (1500ms) \u2014 meaning D7\u2019s "reveal > 1500" relaxation branch could never fire for a compliant concept, false-failing D7 on any state whose scene_composition genuinely reveals/settles past 1500ms (e.g. a 3400ms once-sweep choreography). Fixed by adding pcplSceneRevealMs(state), deriving reveal timing from the scene\u2019s OWN timeline instead \u2014 appear_at_ms+animate_in_ms, disappear_at_ms+fade_out_ms, animation.delay_sec/duration_sec, one rotate_continuous period, locus_trace.end_ms, and variable_choreography\u2019s once-mode settle (including holds) \u2014 then the single PCPL fallback site takes Math.max(pcplRevealMs, pcplSceneRevealMs), which flows into both D7\u2019s reveal_hold classification and frozen-pin target selection automatically. deriveMotionExpectations\u2019 PCPL branch was extended alongside it so looping choreography/rotate_continuous marks motion=true (else D7 would separately demand stillness from a state that is deliberately still spinning).',
    prevention_rule:
      'THE EYE\u2019s reveal-complete derivation for a Rule-31-compliant state must never depend SOLELY on a field Rule 31 forbids authoring (pause_after_ms) \u2014 any new PCPL choreography primitive with its own timeline (a new D5 addition, a future primitive type) must be added to pcplSceneRevealMs\u2019s walk, not left to fall through to the DEFAULT_REVEAL_MS floor.',
    probe_type: 'js_eval',
    probe_logic:
      'For a PCPL state with zero tts_sentences[].pause_after_ms fields (the Rule-31-compliant case) but a scene_composition primitive whose settle time exceeds 1500ms, assert deriveStateMeta\u2019s computed reveal value equals the scene-derived time (not the 1500ms floor) and that D7 passes rather than false-failing. Reference regression: scalar_vs_vector STATE_1 (phi_hook once-sweep, start 800 + dur 3400 + holds at 90\u00b0/270\u00b0) and STATE_4 (theta ping_pong) both previously false-failed D7 at exactly 1500ms and now clear it at their real scene-derived reveal time.',
    status: 'FIXED',
    concepts_affected: PCPL_16,
    fixed_in_files: [DERIVE_META],
    row_type: 'incident',
  },
  {
    bug_class: 'pcpl_focal_pulse_scales_size_not_brightness',
    title: 'PM_focalPulseScale applied a \u00b112% SIZE pulse to the focal primitive (Rule 29 violation) \u2014 and premium_primitives.ts\u2019s glow_focus scaled its halo RADIUS the same way',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      'FIXED 2026-07-23 (WP-R3, plan design decision D3). PM_focalPulseScale computed a sinusoidal \u00b112% geometry SCALE factor applied to the focal primitive\u2019s drawn size (arrow length, body radius, etc.) at 4 call sites, and premium_primitives.ts\u2019s glow_focus primitive independently pulsed its halo RADIUS the same way \u2014 both violate Rule 29 ("emphasis is brightness, NEVER size \u2014 no zoom-in/zoom-out bulge on any element"). Replaced entirely (deleted, not stubbed \u2014 so any missed caller fails node --check loudly) with PM_focalEmphasis(spec), returning {isFocal, alphaMul, glowPx}: the focal primitive gets full alpha + a drawingContext.shadowBlur glow, non-focal peers dim to ~0.6 alpha \u2014 every geometry constant is left untouched. No PCPL concept was baseline-locked at the time of this fix, so the visual change (identical geometry, different brightness only) was a free window with zero baseline-regression risk.',
    prevention_rule:
      'Focal/emphasis treatment on any PCPL primitive (present or future) must route through PM_focalEmphasis\u2019s {isFocal, alphaMul, glowPx} contract \u2014 alpha and drawingContext.shadowBlur only. Any new primitive type must NOT introduce its own ad-hoc size/radius pulse for emphasis; grep for PM_focalEmphasis before adding a new focal-treatment call site. Enforcement: `grep PM_focalPulseScale` across the renderer must always return zero matches \u2014 the function was deleted, not deprecated, specifically so a reintroduction is a loud, hard-to-miss event, not a silent revival.',
    probe_type: 'js_eval',
    probe_logic:
      'grep parametric_renderer.ts and premium_primitives.ts for PM_focalPulseScale \u2014 must return zero matches. Render two SET_TIME_FREEZE-pinned frames of the same focal state at t and t+500ms and assert every primitive\u2019s geometry (position, length, radius) is byte-identical between them while alpha/shadowBlur may differ \u2014 any geometry delta between two pinned frames of a "focal pulse" state is a Rule 29 regression.',
    status: 'FIXED',
    concepts_affected: PCPL_16,
    fixed_in_files: [RENDERER, PREMIUM],
    row_type: 'incident',
  },
  {
    bug_class: 'pcpl_canvas_fixed_760x500_no_scale_to_fit',
    title: 'createCanvas(760,500) had no windowResized/scaling and no centering CSS \u2014 PCPL sims rendered pinned top-left in any larger review-panel container',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      'FIXED 2026-07-23 (WP-R2, plan design decision D1). PCPL\u2019s p5 sketch called createCanvas(760, 500) with no windowResized() handler and no centering CSS on the emitted iframe body, so in any container larger than the logical 760\u00d7500 coordinate space (the review site\u2019s panel, a fullscreen player, a wide monitor) the canvas rendered pinned to the top-left corner with dead space filling the rest \u2014 founder-reported as half the review panel appearing empty. Fixed with PM_fitCanvas(): s = min(innerWidth/760, innerHeight/500), applied via canvas.style.width/height (a CSS style-based scale, NOT a CSS transform and NOT resizeCanvas) plus flex-centering in assembleParametricHtml\u2019s emitted CSS; called from both setup() and p5\u2019s windowResized(). Style-based sizing was specifically chosen because p5 1.9.4 divides mouse coordinates by canvas.scrollWidth/width internally \u2014 a CSS transform would have desynced mouse-to-canvas-coordinate mapping and silently broken every slider drag, whereas style-based width/height keeps p5\u2019s own compensation correct with zero mouse-mapping code of our own. At exactly 760\u00d7500 (s=1) the fit is a no-op \u2014 zero pixel change, baseline-safe.',
    prevention_rule:
      'Any renderer that authors a fixed logical canvas size (PCPL\u2019s 760\u00d7500 is mandated by every authored JSON\u2019s pixel coordinates) must scale-to-fit via CSS style width/height + flex centering, never resizeCanvas (which would change the logical coordinate space the JSON was authored against) and never a CSS transform (which desyncs p5\u2019s internal scrollWidth/width mouse-coordinate division). Call the fit function from both setup() and windowResized() so a browser resize or fullscreen toggle re-fits live.',
    probe_type: 'manual',
    probe_logic:
      'Render the same PCPL concept inside containers of 760\u00d7500 (must be pixel-identical to the pre-fit baseline) and three larger/odd sizes e.g. 1140\u00d7750 / 380\u00d7250 / 1200\u00d7500 (must render centered and aspect-locked, no top-left pinning, no distortion) \u2014 then verify a real slider drag at the scaled size still changes the underlying value (proves p5\u2019s scrollWidth-based mouse compensation survived the style-based resize).',
    status: 'FIXED',
    concepts_affected: PCPL_16,
    fixed_in_files: [RENDERER],
    row_type: 'incident',
  },
  {
    bug_class: 'pcpl_slider_label_stale_under_choreography',
    title: 'drawCanvasSlider renders its knob/label purely from PM_sliderValues \u2014 never the live choreographed value pre-seizure \u2014 so a scripted slider visually reads a frozen default while the physics underneath correctly animates',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      'NEW, OPEN \u2014 discovered 2026-07-23 during the WP-R5/WP-F1 choreography build-out; not fixed (out of the renderer WPs\u2019 scope, left for the next renderer touch). drawCanvasSlider seeds and reads its knob position + numeric label EXCLUSIVELY from PM_sliderValues[spec.variable] (falling back to the JSON default), with no awareness of a state-level variable_choreography currently animating that same variable via PM_safeEval/lerp. Confirmed via code read: a ping-pong-driven \u03b8 slider (e.g. scalar_vs_vector STATE_4\u2019s 0\u2192180 sweep) has its arc/readout/arrow correctly driven by the live choreographed value each frame, but the ON-SCREEN SLIDER KNOB AND LABEL stay pinned at PM_sliderValues\u2019 seeded default (e.g. a frozen "90\u00b0") until the teacher\u2019s real mouse-drag first writes PM_sliderValues and seizes the ramp (per D5, seizure sets PM_userTouched[var] only inside the real-drag branch). Purely cosmetic \u2014 the taught physics (the actual drawn arc, arrow, and numeric HUD readout) renders correctly throughout; only the slider widget\u2019s own knob/label lags.',
    prevention_rule:
      'Before a variable is seized (PM_userTouched[var] false), drawCanvasSlider should read its displayed knob position/label from the SAME live-choreographed value the rest of the scene uses for that variable, falling back to PM_sliderValues only once seized \u2014 mirroring the precedent already fixed for particle_field\u2019s DOM slider labels under scripted ramps (the pf_slider_label_ignores_oneshot_lerp family; see combination_of_cells/meter_bridge sessions). Do not ship a NEW PCPL concept authoring variable_choreography on a slider-bound variable without either fixing this or explicitly hiding that slider row during the choreographed portion of the state (visible_controls precedent).',
    probe_type: 'manual',
    probe_logic:
      'For a state whose variable_choreography animates a variable that also has an on-screen slider (not yet seized), read the slider\u2019s rendered numeric label at two different simulation clock times mid-ramp and assert it CHANGES to track the choreographed value \u2014 today it does not (stays at the JSON default) until a real drag seizes it. Reference repro: scalar_vs_vector STATE_4 theta ping_pong 0\u2192180 \u2014 the arc/HUD sweep visibly while the \u03b8 slider knob/label stay frozen at the authored default until dragged.',
    status: 'OPEN',
    concepts_affected: ['scalar_vs_vector'],
    fixed_in_files: [],
    row_type: 'incident',
  },
];

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string { return a.length === 0 ? `ARRAY[]::text[]` : `ARRAY[${a.map(sqlStr).join(', ')}]`; }
function sqlRow(r: Row): string {
  return `(${sqlStr(r.bug_class)}, ${sqlStr(r.title)}, ${sqlStr(r.severity)}, ${sqlStr(r.owner_cluster)}, ` +
    `${sqlStr(r.root_cause)}, ${sqlStr(r.prevention_rule)}, ${sqlStr(r.probe_type)}, ${sqlStr(r.probe_logic)}, ` +
    `${sqlStr(r.status)}, ${sqlArr(r.concepts_affected)}, ${sqlArr(r.fixed_in_files)}, ${sqlStr(SESSION)}, ${sqlStr(r.row_type)})`;
}
function emitSql(all: Row[]): string {
  const cols = 'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type';
  return `-- 2026-07-23 (WP-F3): PCPL hardening plan cleanup \u2014 4 FIXED rows carrying forward\n` +
    `-- WP-R1/R3/T1 (time-freeze float snap, Rule-29 focal emphasis, THE EYE PCPL reveal\n` +
    `-- derivation) + 1 OPEN row (slider label staleness under choreography, deferred).\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_wpf3_pcpl_hardening_cleanup.ts \u2014 idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files,\n` +
    `  fixed_at = CASE WHEN EXCLUDED.status = 'FIXED' THEN now() ELSE engine_bug_queue.fixed_at END;\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-07-23_seed_engine_bug_queue_wpf3_pcpl_hardening_cleanup_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} row(s))`);

  const payload = rows.map((r) => ({
    ...r,
    discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`\u2717 upsert failed: ${error.message}`); process.exit(1); }
  console.log(`\u2713 ${rows.length} row(s) upserted (4 FIXED, 1 OPEN)`);
}

main().catch((err) => { console.error('\ud83d\udca5 seed failed:', err instanceof Error ? err.stack : err); process.exit(1); });
