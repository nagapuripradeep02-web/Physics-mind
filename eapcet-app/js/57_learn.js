/* Learn — the rules of the classroom, pure: no DOM, no storage, no clock.
 * src/lib/eapcet/__tests__/learn.test.ts runs THIS source.
 *
 * A lesson is green when its three practice questions are answered right by
 * the right route, in order, in ONE pass — the same "three in a row by the
 * right route" the test hall uses for strong now. A wrong pick, a guess, or a
 * right answer by a wrong route ends the pass: the student reads the fix and
 * the three start again. Green is sticky. Pass n draws variants[n % len].
 *
 * A lesson's state entry (ep_state_v1.learn[sub], written by Study):
 *   { ck, opened, opened_at, check: {picked, correct, at} | null,
 *     pass: { started_at, records: [{qid, picked, correct, route, ms}] } | null,
 *     passes: [{ at, n, outcome: 'green' | 'ended' }], green_at, feel, feel_at } */
var Learn = (function () {
  var N = 3;
  var STATES = ['strong', 'fix', 'check', 'solid', 'learned', 'none'];

  /** Where a pass stands. `i` is the slot to show next: the one whose route
      is still owed, or the next unasked one; -1 once the pass has ended. */
  function passStatus(records, facts) {
    var recs = records || [];
    var f = facts || {};
    var solid = 0, ended = false, owed = false, last = null;
    for (var i = 0; i < recs.length; i++) {
      var r = recs[i];
      if (!r.route) { owed = true; break; }
      var o = Diag.outcomeOf(r, f[r.qid]);
      last = o;
      if (o.outcome === 'solid') solid++; else { ended = true; break; }
    }
    var green = !ended && !owed && solid >= N;
    return { solid: solid, ended: ended, owed: owed, green: green, last: last,
             i: ended ? -1 : (owed ? recs.length - 1 : solid) };
  }

  function subtopicState(entry) {
    if (!entry) return 'none';
    if (entry.green_at) return 'green';
    if (entry.check || entry.pass || (entry.passes && entry.passes.length)) return 'started';
    return 'none';
  }

  /** The first not-green subtopic among `subs`, or null when every one is green. */
  function nextFor(subs, learn) {
    var l = learn || {};
    for (var i = 0; i < (subs || []).length; i++) if (subtopicState(l[subs[i]]) !== 'green') return subs[i];
    return null;
  }

  /** The first not-green subtopic after `after` in `subs`, wrapping round; null when all green. */
  function nextAfter(subs, learn, after) {
    var list = subs || [];
    var at = list.indexOf(after);
    for (var k = 1; k <= list.length; k++) {
      var key = list[(at + k) % list.length];
      if (key !== after && subtopicState((learn || {})[key]) !== 'green') return key;
    }
    return null;
  }

  function progress(learn, subs) {
    var done = 0;
    for (var i = 0; i < (subs || []).length; i++) if (subtopicState((learn || {})[subs[i]]) === 'green') done++;
    return { done: done, total: (subs || []).length, next: nextFor(subs, learn) };
  }

  /* One state per shape, the test hall first: strong (strong_now) → the last
   * run's fix | check | solid → learned (every linked lesson green, the shape
   * not in the last run) → none. */
  function masteryOf(shapeKeys, strongNow, lastShapes, learn, links) {
    var last = {};
    for (var i = 0; i < (lastShapes || []).length; i++) last[lastShapes[i].key] = lastShapes[i].status;
    var out = {};
    for (var k = 0; k < (shapeKeys || []).length; k++) {
      var key = shapeKeys[k];
      if (strongNow && strongNow[key]) { out[key] = 'strong'; continue; }
      if (last[key]) { out[key] = last[key]; continue; }
      var subs = (links || {})[key] || [];
      out[key] = subs.length && nextFor(subs, learn) === null ? 'learned' : 'none';
    }
    return out;
  }

  /** Counts by state in display order, zero counts left out. */
  function summary(mastery) {
    var counts = {};
    for (var key in mastery) if (Object.prototype.hasOwnProperty.call(mastery, key)) counts[mastery[key]] = (counts[mastery[key]] || 0) + 1;
    var out = [];
    for (var i = 0; i < STATES.length; i++) if (counts[STATES[i]]) out.push({ state: STATES[i], n: counts[STATES[i]] });
    return out;
  }

  function variantIndex(passes, len) { return len ? (passes % len) : 0; }

  return { passStatus: passStatus, subtopicState: subtopicState, nextFor: nextFor, nextAfter: nextAfter,
           progress: progress, masteryOf: masteryOf, summary: summary, variantIndex: variantIndex, N: N, STATES: STATES };
})();
