/* Run — the state machine behind one chapter run, and the store it writes.
 *
 *   idle → asking(i) → routing(i) → asking(i+1) … → done
 *
 * Every tap is written to ep_state_v1 before the screen moves, so a phone that
 * dies mid-run resumes at the same question. The record shape is the contract
 * with Diag (55_diag.js) and with ep_sync on the server:
 *   { qid, picked, correct, ms, route }
 * ms is render-to-tap; route is the id the student tapped after the pick:
 * 'r' | 'm<k>' | 'guess' on a question with a route menu, 'sure' | 'guess'
 * on one without. Records written before routes existed carry `probe`
 * instead; Diag scores them and reads nothing else from them. */
var Run = (function () {
  var KEY = 'ep_state_v1';
  var state = Store.getJSON(KEY, null);
  if (!state || typeof state !== 'object' || !state.chapters) state = { chapters: {} };

  function chapterState(key) {
    if (!state.chapters[key]) state.chapters[key] = { runs: [], retries: [], streak: {}, strong_now: {} };
    return state.chapters[key];
  }
  function save() {
    Store.setJSON(KEY, state);
    if (typeof Sync !== 'undefined') Sync.touch();
  }

  // The live run: which chapter, which run, which question, and when the card
  // was shown (for ms). Rebuilt from the store on resume.
  var cur = null;

  function seenBefore(cs) {
    var ids = [];
    for (var i = 0; i < cs.runs.length; i++)
      for (var j = 0; j < cs.runs[i].records.length; j++) ids.push(cs.runs[i].records[j].qid);
    for (var k = 0; k < cs.retries.length; k++) ids.push(cs.retries[k].qid);
    return ids;
  }

  function start(chapterKey) {
    var ch = Data.chapter(chapterKey);
    var cs = chapterState(chapterKey);
    var prev = cs.runs.length ? cs.runs[cs.runs.length - 1] : null;
    var seen = prev ? prev.records.map(function (r) { return r.qid; }) : [];
    var d = Data.draw(ch, cs.runs.length + 1, Track.session(), seen);
    var run = { run_no: cs.runs.length + 1, seed: d.seed, ids: d.ids, started_at: new Date().toISOString(),
                finished_at: null, records: [], diagnosis: null };
    cs.runs.push(run);
    save();
    cur = { chapterKey: chapterKey, run: run, i: 0, phase: 'asking', shownAt: 0 };
    Track.log('run_start', { chapter: chapterKey, run_no: run.run_no, n: run.ids.length });
    return cur;
  }

  /* An unfinished run resumes where it stopped; a finished one does not. A
   * record with neither route nor probe is a pick whose route is still owed. */
  function resume(chapterKey) {
    var cs = chapterState(chapterKey);
    var run = cs.runs.length ? cs.runs[cs.runs.length - 1] : null;
    if (!run || run.finished_at) return null;
    var n = run.records.length;
    var last = n ? run.records[n - 1] : null;
    var owed = !!last && !last.route && !last.probe;
    cur = { chapterKey: chapterKey, run: run, i: owed ? n - 1 : n, phase: owed ? 'routing' : 'asking', shownAt: 0 };
    return cur;
  }

  function current() { return cur; }
  function question() { return cur ? Data.question(cur.run.ids[cur.i]) : null; }
  function total() { return cur ? cur.run.ids.length : 0; }

  function shown() { if (cur) cur.shownAt = Date.now(); }

  function pick(option) {
    if (!cur || cur.phase !== 'asking') return null;
    var q = question();
    var rec = { qid: q.id, picked: option, correct: option === q.answer,
                ms: cur.shownAt ? Date.now() - cur.shownAt : 0, route: null };
    cur.run.records.push(rec);
    cur.phase = 'routing';
    save();
    Track.log('q_pick', { qid: q.id, picked: option, correct: rec.correct, ms: rec.ms });
    return rec;
  }

  /** The route ids a question accepts: its menu plus 'guess', or sure/guess. */
  function routesOf(q) {
    if (q && q.has_routes && !q.theory && q.routes && q.routes.length) {
      var ids = [];
      for (var i = 0; i < q.routes.length; i++) ids.push(q.routes[i].id);
      ids.push('guess');
      return ids;
    }
    return ['sure', 'guess'];
  }

  function route(id) {
    if (!cur || cur.phase !== 'routing') return null;
    var q = question();
    if (routesOf(q).indexOf(id) < 0) return null;
    var rec = cur.run.records[cur.run.records.length - 1];
    rec.route = id;
    var o = Diag.outcomeOf(rec, Data.facts([rec.qid])[rec.qid]);
    Track.log('route', { qid: rec.qid, route: id, outcome: o.outcome, mismatch: o.mismatch });
    if (cur.run.records.length >= cur.run.ids.length) {
      finish();
    } else {
      cur.i++;
      cur.phase = 'asking';
      save();
    }
    return cur.phase;
  }

  function finish() {
    var run = cur.run;
    run.finished_at = new Date().toISOString();
    run.diagnosis = Diag.diagnose(run.records, Data.facts(run.ids));
    cur.phase = 'done';
    save();
    var d = run.diagnosis;
    Track.log('run_done', { chapter: cur.chapterKey, run_no: run.run_no, score: d.score, params: d.params,
                            weakness: d.weakness, confirmed_share: d.confirmed_share, mismatches: d.mismatches,
                            sec_per_q: d.sec_per_q });
  }

  function lastFinished(chapterKey) {
    var cs = chapterState(chapterKey);
    for (var i = cs.runs.length - 1; i >= 0; i--) if (cs.runs[i].finished_at) return cs.runs[i];
    return null;
  }

  /** A run's diagnosis in the engine's current shape: the stored one, or a
      fresh read of its records when it predates the engine (no params) or
      came back from the server reduced. */
  function diagnosisOf(run) {
    if (run.diagnosis && run.diagnosis.params) return run.diagnosis;
    return Diag.diagnose(run.records || [], Data.facts(run.ids || []));
  }

  /** The last STRONG_AT retries for this shape were all of the same shape. */
  function sameShapeStreak(cs, key) {
    var n = 0;
    for (var i = cs.retries.length - 1; i >= 0 && n < Diag.STRONG_AT; i--) {
      if ((cs.retries[i].shape_key || 'other') !== key) continue;
      if (!cs.retries[i].same_shape) return false;
      n++;
    }
    return n > 0;
  }

  /* A sibling retry launched from a question of shape `shapeKey`. Right by
   * the right route extends streak[shapeKey]; at Diag.STRONG_AT the chapter
   * is "strong now" for that shape. */
  function retry(chapterKey, fromQid, shapeKey, qid, picked, correct, route_, ms, sameShape) {
    var cs = chapterState(chapterKey);
    var key = shapeKey || 'other';
    var probe_ = Diag.probeOf(route_, correct);
    cs.retries.push({ qid: qid, from_qid: fromQid, shape_key: key, route: route_, probe: probe_, same_shape: !!sameShape,
                      picked: picked, correct: correct, ms: ms, at: new Date().toISOString() });
    cs.streak[key] = Diag.streakAfter(cs.streak, key, { correct: correct, probe: probe_ });
    if (Diag.strongNow(cs.streak[key]) && !cs.strong_now[key]) {
      cs.strong_now[key] = todayStr();
      Track.log('strong_now', { chapter: chapterKey, shape_key: key, same_shape: sameShapeStreak(cs, key) });
    }
    save();
    Track.log('retry_pick', { qid: qid, from_qid: fromQid, shape_key: key, same_shape: !!sameShape,
                              correct: correct, route: route_, probe: probe_ });
    return cs.streak[key];
  }

  /* What the chapter list shows: the newest fact first. */
  function badge(chapterKey) {
    var cs = state.chapters[chapterKey];
    if (!cs) return { kind: 'untested' };
    for (var t in cs.strong_now) if (Object.prototype.hasOwnProperty.call(cs.strong_now, t)) {
      return { kind: 'strong', shape_key: t, same_shape: sameShapeStreak(cs, t) };
    }
    var run = lastFinished(chapterKey);
    if (!run) return { kind: 'untested' };
    var d = diagnosisOf(run);
    if (d.weakness && d.weakness !== 'solid') return { kind: 'weak', type: d.weakness, score: d.score, total: d.total };
    return { kind: 'score', score: d.score, total: d.total };
  }

  function seenIds(chapterKey) { return seenBefore(chapterState(chapterKey)); }
  function chapterStateOf(chapterKey) { return chapterState(chapterKey); }
  function all() { return state; }

  /* What the server merged, folded in without touching what is live here: a
   * run this device does not hold is added; a run it holds is kept (its own
   * copy is never older than the server's, and an unfinished one may have
   * moved on during the round trip); retries are added by (qid, at); the
   * streak and strong-now dates are the server's — it recomputes them over
   * every device's retries. Returns true when anything changed. */
  function adopt(serverChapters) {
    if (!serverChapters || typeof serverChapters !== 'object') return false;
    var changed = false;
    for (var key in serverChapters) {
      if (!Object.prototype.hasOwnProperty.call(serverChapters, key)) continue;
      var theirs = serverChapters[key] || {};
      var cs = chapterState(key);
      var have = {};
      for (var i = 0; i < cs.runs.length; i++) have[cs.runs[i].run_no] = true;
      var runs = theirs.runs || [];
      for (var j = 0; j < runs.length; j++) {
        if (have[runs[j].run_no] || !runs[j].finished_at) continue;
        cs.runs.push(runs[j]); changed = true;
      }
      cs.runs.sort(function (a, b) { return a.run_no - b.run_no; });
      var seen = {};
      for (var k = 0; k < cs.retries.length; k++) seen[cs.retries[k].qid + '|' + cs.retries[k].at] = true;
      var rets = theirs.retries || [];
      for (var m = 0; m < rets.length; m++) {
        if (seen[rets[m].qid + '|' + rets[m].at]) continue;
        cs.retries.push(rets[m]); changed = true;
      }
      if (theirs.streak && typeof theirs.streak === 'object') { cs.streak = theirs.streak; changed = true; }
      if (theirs.strong_now && typeof theirs.strong_now === 'object') {
        for (var t in theirs.strong_now) if (Object.prototype.hasOwnProperty.call(theirs.strong_now, t) && !cs.strong_now[t]) {
          cs.strong_now[t] = theirs.strong_now[t]; changed = true;
        }
      }
    }
    if (changed) Store.setJSON(KEY, state);     // no Sync.touch: this came FROM the server
    return changed;
  }

  return { start: start, resume: resume, current: current, question: question, total: total, shown: shown,
           pick: pick, route: route, routesOf: routesOf, lastFinished: lastFinished, diagnosisOf: diagnosisOf,
           retry: retry, badge: badge, seenIds: seenIds, chapterState: chapterStateOf, all: all, adopt: adopt,
           sameShape: function (chapterKey, key) { return sameShapeStreak(chapterState(chapterKey), key); }, KEY: KEY };
})();
