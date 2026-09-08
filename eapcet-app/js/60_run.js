/* Run — the state machine behind one chapter run, and the store it writes.
 *
 *   idle → asking(i) → probing(i) → asking(i+1) … → done
 *
 * Every tap is written to ep_state_v1 before the screen moves, so a phone that
 * dies mid-run resumes at the same question. The record shape is the contract
 * with Diag (55_diag.js) and with ep_sync on the server:
 *   { qid, picked, correct, ms, probe }
 * ms is render-to-tap; probe is sure|guessed when correct, else
 * concept|calculation|application|time. */
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

  /* An unfinished run resumes where it stopped; a finished one does not. */
  function resume(chapterKey) {
    var cs = chapterState(chapterKey);
    var run = cs.runs.length ? cs.runs[cs.runs.length - 1] : null;
    if (!run || run.finished_at) return null;
    var n = run.records.length;
    var last = n ? run.records[n - 1] : null;
    var probing = last && !last.probe;
    cur = { chapterKey: chapterKey, run: run, i: probing ? n - 1 : n, phase: probing ? 'probing' : 'asking', shownAt: 0 };
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
                ms: cur.shownAt ? Date.now() - cur.shownAt : 0, probe: null };
    cur.run.records.push(rec);
    cur.phase = 'probing';
    save();
    Track.log('q_pick', { qid: q.id, picked: option, correct: rec.correct, ms: rec.ms });
    return rec;
  }

  function probe(type) {
    if (!cur || cur.phase !== 'probing') return null;
    var rec = cur.run.records[cur.run.records.length - 1];
    rec.probe = type;
    Track.log('probe', { qid: rec.qid, type: type });
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
    run.diagnosis = Diag.diagnose(run.records);
    cur.phase = 'done';
    save();
    var d = run.diagnosis;
    Track.log('run_done', { chapter: cur.chapterKey, run_no: run.run_no, score: d.score, hist: d.hist,
                            guessed_right: d.guessed_right, weakness: d.weakness, sec_per_q: d.sec_per_q });
  }

  function lastFinished(chapterKey) {
    var cs = chapterState(chapterKey);
    for (var i = cs.runs.length - 1; i >= 0; i--) if (cs.runs[i].finished_at) return cs.runs[i];
    return null;
  }

  /* A sibling retry launched from a question probed as type T. Correct AND sure
   * extends streak[T]; at Diag.STRONG_AT the chapter is "strong now" for T. */
  function retry(chapterKey, fromQid, type, qid, picked, correct, probe_, ms) {
    var cs = chapterState(chapterKey);
    cs.retries.push({ qid: qid, from_qid: fromQid, type: type, picked: picked, correct: correct,
                      probe: probe_, ms: ms, at: new Date().toISOString() });
    var counts = type && Diag.WRONG_TYPES.indexOf(type) >= 0;
    if (counts) {
      cs.streak[type] = Diag.streakAfter(cs.streak, type, { correct: correct, probe: probe_ });
      if (Diag.strongNow(cs.streak[type]) && !cs.strong_now[type]) {
        cs.strong_now[type] = todayStr();
        Track.log('strong_now', { chapter: chapterKey, type: type });
      }
    }
    save();
    Track.log('retry_pick', { qid: qid, from_qid: fromQid, type: type, correct: correct, probe: probe_ });
    return counts ? cs.streak[type] : null;
  }

  /* What the chapter list shows: the newest fact first. */
  function badge(chapterKey) {
    var cs = state.chapters[chapterKey];
    if (!cs) return { kind: 'untested' };
    for (var t in cs.strong_now) if (Object.prototype.hasOwnProperty.call(cs.strong_now, t)) return { kind: 'strong', type: t };
    var run = lastFinished(chapterKey);
    if (!run) return { kind: 'untested' };
    var d = run.diagnosis;
    if (d.weakness) return { kind: 'weak', type: d.weakness, score: d.score, total: d.total };
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
           pick: pick, probe: probe, lastFinished: lastFinished, retry: retry, badge: badge,
           seenIds: seenIds, chapterState: chapterStateOf, all: all, adopt: adopt, KEY: KEY };
})();
