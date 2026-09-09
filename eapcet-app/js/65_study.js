/* Study — the writer over ep_state_v1.learn: what the student did in the
 * classroom, on this device.
 *
 * `learn` is a top-level branch beside `chapters`, so Sync never pushes it
 * and Run.adopt never overwrites it (a later ep_sync that learns the branch
 * merges additively). Every tap saves before the screen moves. The rules
 * live in Learn (pure); the content in LearnData (read-only). Telemetry
 * carries ids and enums only. */
var Study = (function () {
  function now() { return new Date().toISOString(); }
  function root() {
    var st = Run.all();
    if (!st.learn || typeof st.learn !== 'object') st.learn = {};
    return st.learn;
  }
  function state(sub) { return root()[sub] || null; }
  function entry(ck, sub) {
    var l = root();
    if (!l[sub]) l[sub] = { ck: ck, opened: 0, opened_at: null, check: null, pass: null, passes: [], green_at: null, feel: null, feel_at: null };
    return l[sub];
  }
  function passCount(e) { return (e.passes || []).length; }
  function ids(recs) { var out = []; for (var i = 0; i < recs.length; i++) out.push(recs[i].qid); return out; }

  function open(ck, sub) {
    var e = entry(ck, sub);
    e.opened = (e.opened || 0) + 1;
    e.opened_at = now();
    Run.save();
    Track.log('learn_open', { chapter: ck, sub: sub, state: Learn.subtopicState(e), passes: passCount(e) });
    return e;
  }

  function check(ck, sub, picked) {
    var s = LearnData.subtopic(ck, sub);
    var e = entry(ck, sub);
    e.check = { picked: picked, correct: picked === s.subtopic.check.answer, at: now() };
    Run.save();
    Track.log('learn_check', { sub: sub, picked: picked, correct: e.check.correct });
    return e.check;
  }

  /** The question for a slot in the CURRENT pass: pass n draws variants[n % len]. */
  function variant(ck, sub, slot) {
    var s = LearnData.subtopic(ck, sub);
    var vs = s.subtopic.apply[slot].variants;
    return vs[Learn.variantIndex(passCount(entry(ck, sub)), vs.length)];
  }

  function startPass(ck, sub) {
    var e = entry(ck, sub);
    if (!e.pass) { e.pass = { started_at: now(), records: [] }; Run.save(); }
    return e.pass;
  }

  function status(ck, sub) {
    var e = entry(ck, sub);
    if (!e.pass) return Learn.passStatus([], {});
    return Learn.passStatus(e.pass.records, LearnData.factsOf(ids(e.pass.records)));
  }

  function pick(ck, sub, qid, option, ms) {
    var e = entry(ck, sub);
    if (!e.pass) startPass(ck, sub);
    var q = LearnData.question(qid);
    var rec = { qid: qid, picked: option, correct: option === q.answer, ms: ms || 0, route: null };
    e.pass.records.push(rec);
    Run.save();
    return rec;
  }

  /** The route tapped for the last pick. Returns the outcome, the pass status
      and how the pass ended ('green' | 'ended' | null). */
  function route(ck, sub, id) {
    var e = entry(ck, sub);
    var recs = e.pass.records;
    var rec = recs[recs.length - 1];
    rec.route = id;
    var q = LearnData.question(rec.qid);
    var o = Diag.outcomeOf(rec, LearnData.facts(q));
    var st = Learn.passStatus(recs, LearnData.factsOf(ids(recs)));
    Track.log('learn_apply', { sub: sub, qid: rec.qid, picked: rec.picked, correct: rec.correct, route: id,
                               outcome: o.outcome, type: o.type, mismatch: o.mismatch, ms: rec.ms, slot: recs.length });
    var ended = st.green ? 'green' : (st.ended ? 'ended' : null);
    if (ended) {
      e.passes.push({ at: now(), n: recs.length, outcome: ended });
      e.pass = null;
      Track.log('learn_pass', { sub: sub, outcome: ended, n: recs.length, passes: passCount(e) });
      if (ended === 'green' && !e.green_at) {
        e.green_at = todayStr();
        Track.log('learn_green', { chapter: ck, sub: sub, passes: passCount(e) });
      }
    }
    Run.save();
    return { outcome: o, status: st, ended: ended };
  }

  function feel(ck, sub, value) {
    var e = entry(ck, sub);
    e.feel = value;
    e.feel_at = now();
    Run.save();
    Track.log('learn_feel', { sub: sub, feel: value, green: !!e.green_at });
  }

  function progress(ck) { return Learn.progress(root(), LearnData.subtopics(ck)); }
  function next(ck, after) { return Learn.nextAfter(LearnData.subtopics(ck), root(), after); }
  function stateOf(sub) { return Learn.subtopicState(state(sub)); }

  /** The lesson a shape links to: the first not-green one, else the first. */
  function linkFor(ck, shapeKey) {
    var subs = LearnData.links(ck)[shapeKey] || [];
    if (!subs.length) return null;
    var key = Learn.nextFor(subs, root()) || subs[0];
    var s = LearnData.subtopic(ck, key);
    return s ? { sub: key, title: s.subtopic.title, green: Learn.subtopicState(state(key)) === 'green' } : null;
  }

  /** One state per shape of the chapter, the test hall first (Learn.masteryOf). */
  function mastery(ck) {
    var ch = Data.chapter(ck);
    var keys = [];
    for (var i = 0; ch && ch.shapes && i < ch.shapes.length; i++) keys.push(ch.shapes[i].key);
    var cs = Run.all().chapters[ck] || {};
    var last = Run.lastFinished(ck);
    var d = last ? Run.diagnosisOf(last) : null;
    return Learn.masteryOf(keys, cs.strong_now || {}, d ? d.shapes : null, root(), LearnData.links(ck));
  }

  /** Shape keys the last run found "fix", for the chapter page's tags. */
  function fixShapes(ck) {
    var last = Run.lastFinished(ck);
    var d = last ? Run.diagnosisOf(last) : null;
    var out = [];
    for (var i = 0; d && i < d.shapes.length; i++) if (d.shapes[i].status === 'fix') out.push(d.shapes[i].key);
    return out;
  }

  return { state: state, open: open, check: check, variant: variant, startPass: startPass, status: status,
           pick: pick, route: route, feel: feel, progress: progress, next: next, stateOf: stateOf,
           linkFor: linkFor, mastery: mastery, fixShapes: fixShapes, passCount: function (ck, sub) { return passCount(entry(ck, sub)); } };
})();
