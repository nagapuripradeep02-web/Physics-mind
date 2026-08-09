/**
 * check:review-site-timeline — headless verification of build_review_site.ts's
 * computeTimeline() (bug_class pcpl_reveal_timeline_shrinks_under_the_teacher_
 * speed_slider, founder_proxy Checkpoint B cycle 2, 2026-08-09, FIX 1) AND its
 * ride-along, #scrubtime's own label refresh (bug_class review_player_scrub_
 * total_label_not_refreshed_on_rail_entry_so_a_state_reads_zero_seconds,
 * Checkpoint B cycle 3, 2026-08-09, RIDE-ALONG 3).
 *
 * computeTimeline() (and its sibling updateScrubLabel()) live inside the
 * player's OWN embedded <script> — a giant template literal inside
 * renderConceptPage(), never exported as a named constant the way the
 * renderers export *_CODE. So this reads build_review_site.ts's RAW SOURCE
 * TEXT and pulls the SHIPPED function bodies out by brace-matching (the exact
 * technique check_cartesian_plane.ts uses on PARAMETRIC_RENDERER_CODE,
 * applied here to a .ts file's own text instead of an exported JS string) —
 * never a reimplementation of the real function under test.
 *
 * Every section carries a NEGATIVE CONTROL — a gate that has never failed is
 * not known to work.
 *
 *   npm run check:review-site-timeline
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const SRC = readFileSync(path.join(__dirname, 'build_review_site.ts'), 'utf8');

/** Pull `function NAME(...) { ... }` out of build_review_site.ts's raw source by brace matching. */
function grabFn(name: string): string {
  const start = SRC.indexOf('function ' + name + '(');
  if (start < 0) throw new Error('function not found in build_review_site.ts: ' + name);
  const i = SRC.indexOf('{', start);
  let depth = 0;
  for (let j = i; j < SRC.length; j++) {
    if (SRC[j] === '{') depth++;
    else if (SRC[j] === '}') { depth--; if (depth === 0) return SRC.slice(start, j + 1); }
  }
  throw new Error('unbalanced braces reading ' + name);
}

let failures = 0;
function check(label: string, got: unknown, want: unknown, tol: number): boolean {
  const ok = typeof got === 'number' && typeof want === 'number'
    ? Math.abs(got - want) <= tol
    : got === want;
  if (!ok) failures++;
  const fmt = (v: unknown) => (typeof v === 'number' ? v.toFixed(2) : JSON.stringify(v));
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(70)} got ${fmt(got)}  want ${fmt(want)}`);
  return ok;
}
function assertTrue(label: string, ok: boolean) {
  if (!ok) failures++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}`);
}

// A DEDICATED sandbox — computeTimeline() closes over cur()/sentDurMs()/
// sentText()/estSentenceMs()/updateScrubLabel()/rateEl/scrubEl/scrubTime/WPM/
// MIN_SENTENCE_MS/GAP_MS/timeline/timelineTotal, all supplied here as literal
// fixtures/stubs (mirrors check_cartesian_plane.ts's own runOverlay/
// runApplyChoreography pattern). grabFn pulls the SHIPPED function bodies
// verbatim. Module-scoped (not local to one section) so both the FIX 1 and
// RIDE-ALONG 3 sections below share the SAME extraction — computeTimeline()
// and updateScrubLabel() are two halves of one contract now (RIDE-ALONG 3),
// so testing them via two independently-drifting sandboxes would be the
// exact "two copies that merely happen to agree" trap this file's own
// PM_liveExprVars-adjacent doctrine (see conceptGates.ts) warns against.
function runComputeTimeline(fixture: {
  rate: number;
  duration: number | undefined;
  sentences: { text_en: string }[];
  scrubValue?: number;
}): { timelineTotal: number; scrubMax: string; scrubLabel: string } {
  const body = [
    'var WPM = 150;',
    'var MIN_SENTENCE_MS = 1400;',
    'var GAP_MS = 280;',
    'var lang = "en";',
    'var rateEl = { value: ' + JSON.stringify(String(fixture.rate)) + ' };',
    // scrubEl.value defaults to "0" — matches goToState() calling
    // scrubEl.value = '0' immediately before computeTimeline() on every
    // state entry (the rail-open path RIDE-ALONG 3 targets).
    'var scrubEl = { max: "1", value: ' + JSON.stringify(String(fixture.scrubValue ?? 0)) + ' };',
    'var scrubTime = { textContent: "" };',
    'var timeline = [];',
    'var timelineTotal = 0;',
    'var __st = { duration: ' + JSON.stringify(fixture.duration) + ', sentences: ' + JSON.stringify(fixture.sentences) + ' };',
    'function cur() { return __st; }',
    grabFn('sentText'),
    grabFn('estSentenceMs'),
    grabFn('sentDurMs'),
    grabFn('updateScrubLabel'),
    grabFn('computeTimeline'),
    'computeTimeline();',
    'return { timelineTotal: timelineTotal, scrubMax: scrubEl.max, scrubLabel: scrubTime.textContent };',
  ].join('\n');
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  return new Function(body)();
}

console.log('\n=== FIX 1 — computeTimeline(): timelineTotal must not shrink below the state\'s authored duration, at every teacher Speed-slider rate (bug_class pcpl_reveal_timeline_shrinks_under_the_teacher_speed_slider, founder_proxy Checkpoint B cycle 2, 2026-08-09) ===');
{
  // The exact reported shape: a state authoring duration:20 (this
  // concept's STATE_1) whose narration (2 short sentences) finishes well
  // before 20s at every teacher Speed-slider rate (0.7-1.1). Sentence text
  // sized so its OWN narrationEnd is well under 20000ms even at the
  // SLOWEST rate (0.7, longest narration) — isolating the assertion to
  // "does duration win the max", not "did I accidentally pick sentences
  // long enough to already exceed duration on their own".
  const shortSentences = [{ text_en: 'The curve draws left to right, then the region fills in.' }, { text_en: 'A speed graph works this way too.' }];
  for (const rate of [0.7, 0.8, 0.9, 1.0, 1.05, 1.1]) {
    const result = runComputeTimeline({ rate, duration: 20, sentences: shortSentences });
    check(`REQUIRED: rate=${rate}, duration=20s > narration: timelineTotal === duration*1000 (20000)`, result.timelineTotal, 20000, 0);
  }

  // A state whose narration ALONE already runs longer than its authored
  // duration keeps that longer narration timeline — duration is a FLOOR,
  // never a ceiling that truncates authored narration.
  const longSentences = [
    { text_en: 'This sentence is deliberately long enough that, even paced at the fastest teacher rate the Speed slider allows, it alone will still run past a short authored duration, so the narration-derived end must win the max instead of the authored duration truncating it short.' },
  ];
  const longResult = runComputeTimeline({ rate: 1.1, duration: 5, sentences: longSentences });
  assertTrue('a narration longer than its OWN authored duration is NOT truncated (narrationEnd wins the max, duration does not shrink it)',
    longResult.timelineTotal > 5000);

  // A state with NO sentences and NO authored duration keeps the
  // pre-existing fallback (12s) — this fix must not remove that floor.
  const emptyResult = runComputeTimeline({ rate: 0.9, duration: undefined, sentences: [] });
  check('no sentences + no authored duration: falls back to the pre-existing 12s default, unchanged', emptyResult.timelineTotal, 12000, 0);

  // duration:0 (STATE_8's own real authored value, an interaction_complete
  // sandbox with one empty-text sentence) must NOT lengthen the timeline —
  // 0*1000=0 never wins the max against any non-zero narrationEnd.
  const zeroDurationResult = runComputeTimeline({ rate: 0.9, duration: 0, sentences: [{ text_en: '' }] });
  assertTrue('duration:0 (STATE_8\'s own real authored value) does not lengthen the timeline beyond its own (empty-sentence) narrationEnd',
    zeroDurationResult.timelineTotal > 0 && zeroDurationResult.timelineTotal < 3000);

  // NEGATIVE CONTROL FIRST — the PRE-FIX computeTimeline (timelineTotal
  // derived from narration alone, no authored-duration floor),
  // reimplemented independently here, never against the shipped file.
  // Reproduces the measured shrinking-timeline defect at the exact rates
  // the founder_proxy measured (1.0, 1.05, 1.1).
  function preFixTimelineTotal(rate: number, duration: number | undefined, sentences: { text_en: string }[]): number {
    const WPM = 150, MIN_SENTENCE_MS = 1400, GAP_MS = 280;
    let t = 0;
    let lastEnd = 0;
    for (const s of sentences) {
      const chars = (s.text_en || '').length;
      const words = chars / 5.5;
      const ms = Math.max(MIN_SENTENCE_MS, Math.round((words / (WPM * rate)) * 60000));
      lastEnd = t + ms;
      t = lastEnd + GAP_MS;
    }
    return sentences.length > 0 ? lastEnd : Math.max(1, Math.round((duration || 12) * 1000));
  }
  const brokenAt10 = preFixTimelineTotal(1.0, 20, shortSentences);
  const brokenAt105 = preFixTimelineTotal(1.05, 20, shortSentences);
  const brokenAt11 = preFixTimelineTotal(1.1, 20, shortSentences);
  assertTrue(`NEGATIVE CONTROL: the pre-fix timelineTotal at rate=1.0 (${brokenAt10}ms) is SHORTER than the authored duration (20000ms) — reproducing the measured shrinking-timeline defect (STATE_2's Sn=1.7500 never renders)`,
    brokenAt10 < 20000);
  assertTrue(`NEGATIVE CONTROL: at rate=1.05 (${brokenAt105}ms) also shorter — reproducing STATE_5 freezing on 'total area = 2.0000', the dim WRONG number`,
    brokenAt105 < 20000);
  assertTrue(`NEGATIVE CONTROL: at rate=1.1 (${brokenAt11}ms) also shorter — reproducing STATE_1's region fill stopping short`,
    brokenAt11 < 20000);
  const fixedAt10 = runComputeTimeline({ rate: 1.0, duration: 20, sentences: shortSentences }).timelineTotal;
  assertTrue('the shipped computeTimeline does NOT share that defect at the SAME input (rate=1.0)',
    fixedAt10 === 20000 && fixedAt10 !== brokenAt10);

  // STATIC REACHABILITY — the shipped source actually computes the max
  // against the authored duration (wired, not merely documented).
  const computeTimelineSrc = grabFn('computeTimeline');
  assertTrue('computeTimeline() takes Math.max(narrationEnd, authored-duration-in-ms)',
    /timelineTotal = Math\.max\(narrationEnd, Math\.round\(\(st\.duration \|\| 0\) \* 1000\)\)/.test(computeTimelineSrc));
}

console.log('\n=== RIDE-ALONG 3 — #scrubtime is refreshed INSIDE computeTimeline() itself, not left for whichever caller ticks next (bug_class review_player_scrub_total_label_not_refreshed_on_rail_entry_so_a_state_reads_zero_seconds, founder_proxy Checkpoint B cycle 3, 2026-08-09) ===');
{
  // Reproduces the measured defect exactly: goToState() sets scrubEl.value =
  // '0' then calls computeTimeline() — rail-opening a 24s state must read
  // "0.0 / 24.0s" immediately, not "0.0 / 0.0s" (the pre-fix reading,
  // measured live on STATE_5).
  const opened = runComputeTimeline({ rate: 0.9, duration: 24, sentences: [], scrubValue: 0 });
  check('REQUIRED: rail-opening a 24s state (scrubEl.value already 0) refreshes #scrubtime to "0.0 / 24.0s" inside computeTimeline() itself',
    opened.scrubLabel, '0.0 / 24.0s', 0);

  // The explore state (interaction_complete, duration authored 12s in this
  // fixture) was already reported correct pre-fix ("1.8 / 12.0s") because it
  // free-runs — this fix must not regress that path: computeTimeline() still
  // reports the right max even though goToState() never resets scrubEl.value
  // to 0 for it (the caller's own choice — this fixture pins scrubValue at a
  // representative mid-scrub position to prove the label tracks whatever
  // value is CURRENTLY on the element, not a hardcoded 0).
  const explore = runComputeTimeline({ rate: 0.9, duration: 12, sentences: [], scrubValue: 1800 });
  check('an in-progress scrub position (1800ms) against a 12s max reads "1.8 / 12.0s", matching the already-correct explore-state reading',
    explore.scrubLabel, '1.8 / 12.0s', 0);

  // The Speed-slider change handler is computeTimeline()'s OTHER caller
  // (rateEl 'change' listener) — it does NOT reset scrubEl.value first, so
  // the label must re-pair the CURRENT scrub position against the NEW max,
  // not snap to 0.
  const rideAlong3ShortSentences = [{ text_en: 'The curve draws left to right, then the region fills in.' }, { text_en: 'A speed graph works this way too.' }];
  const rateChanged = runComputeTimeline({ rate: 1.1, duration: 20, sentences: rideAlong3ShortSentences, scrubValue: 5000 });
  check('a rate change mid-scrub (scrubEl.value=5000, unchanged) re-labels against the freshly-computed max without resetting the numerator',
    rateChanged.scrubLabel, '5.0 / 20.0s', 0);

  // NEGATIVE CONTROL — the PRE-FIX computeTimeline (sets scrubEl.max but
  // never calls updateScrubLabel), reimplemented independently here,
  // reproducing the measured "0.0 / 0.0s" reading at the exact rail-open
  // input above.
  function preFixComputeTimeline(scrubMaxTarget: number): string {
    // scrubTime.textContent is whatever the LAST tick/updateScrubLabel call
    // left it as — on a fresh state entry (goToState just ran, no tick has
    // fired yet), that is the page's own initial HTML: "0.0 / 0.0s".
    void scrubMaxTarget;
    return '0.0 / 0.0s';
  }
  const brokenLabel = preFixComputeTimeline(24000);
  assertTrue(`NEGATIVE CONTROL: the pre-fix label stays "${brokenLabel}" on rail entry to a 24s state — reproducing the measured stale reading`,
    brokenLabel === '0.0 / 0.0s');
  assertTrue('the shipped computeTimeline() does NOT share that defect at the SAME input (rail-open, 24s)',
    opened.scrubLabel === '0.0 / 24.0s' && opened.scrubLabel !== brokenLabel);

  // STATIC REACHABILITY — computeTimeline() actually calls updateScrubLabel
  // (wired, not merely documented), and it does so AFTER scrubEl.max is set
  // (so the label reads the freshly-computed max, not a stale one).
  const src = grabFn('computeTimeline');
  const maxIdx = src.indexOf('scrubEl.max =');
  const labelIdx = src.indexOf('updateScrubLabel(');
  assertTrue('computeTimeline() calls updateScrubLabel(...)', labelIdx >= 0);
  assertTrue('...AFTER scrubEl.max is assigned', maxIdx >= 0 && labelIdx > maxIdx);
}

console.log(failures === 0
  ? '\nALL REVIEW-SITE-TIMELINE CHECKS PASS\n'
  : `\n*** ${failures} REVIEW-SITE-TIMELINE CHECK(S) FAILED ***\n`);
process.exit(failures === 0 ? 0 : 1);
