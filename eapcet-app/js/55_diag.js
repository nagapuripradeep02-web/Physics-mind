/* Diag — the diagnosis is arithmetic over observations, not opinion.
 *
 * No DOM, no storage, no clock: everything a screen says about a run is
 * derived here from the run's records and the public facts of its questions,
 * so the same records always give the same verdict, and the test in
 * src/lib/eapcet/__tests__/diagnose.test.ts runs THIS source, not a copy.
 *
 * A record: { qid, picked, correct, ms, route }
 *   route: 'r'     the right route, as the author wrote it
 *          'm<k>'  the route of the k-th explained mistake
 *          'sure' | 'guess'   on a question with no route menu
 *          null    not tapped yet
 *   probe: only on records written before routes existed; such a record
 *          counts toward the score and nothing else.
 *
 * facts[qid] (Data.facts): { has_routes, theory, route_key, option_types,
 * routes, shape }. option_types maps each explained wrong option to
 * concept|application|calculation|careless; routes is [{id, text, type, option}].
 *
 * The outcome table (design spec §6.1). The option the student picked is an
 * observation; the route they tapped is a claim. Where the two disagree the
 * option decides and the record is marked `mismatch`. A wrong answer whose
 * option is explained and typed is `confirmed`; one that rests on the claim
 * alone is not, and the result says how many are which. */
var Diag = (function () {
  // Tie order, most fundamental first: a student weak on the concept is told
  // that, not that a calculation slipped.
  var TYPES = ['concept', 'application', 'calculation'];
  var PARAMS = ['concept', 'application', 'calculation', 'guessed', 'rushed'];
  var STRONG_AT = 3;              // consecutive right-by-the-right-route siblings
  var MIN_TYPE = 2;               // a type names the weakness at this many...
  var HEADLINE_AT = 3;            // ...and only with this many CONFIRMED wrong answers of it, across the ledger
  var LEDGER_WINDOW = 3;          // a shape's state is read from its last attempts
  var MIN_GUESSED = 3;
  var SOLID_AT = 8;
  var RUSHED_MS = 15000;          // a wrong answer faster than this was rushed
  var EXAM_SEC_PER_Q = 67.5;      // 160 questions in 180 minutes

  function median(xs) {
    if (!xs.length) return null;
    var s = xs.slice().sort(function (a, b) { return a - b; });
    var m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }

  // A careless option is a calculation-class slip for the tally.
  function paramOf(label) { return label === 'careless' ? 'calculation' : label; }
  function isGuess(route) { return route === 'guess' || route === 'guessed'; }
  function isRight(route) { return route === 'r' || route === 'sure'; }

  /** The one row of the outcome table this record lands on. */
  function outcomeOf(rec, fact) {
    var f = fact || {};
    var route = rec.route || null;
    var o = { outcome: null, type: null, confirmed: false, mismatch: false, rushed: false, legacy: false, anchored: false };
    if (!route) { o.legacy = !!rec.probe; return o; }
    if (rec.correct) {
      o.outcome = isGuess(route) ? 'guessed_right' : (isRight(route) ? 'solid' : 'right_by_wrong_route');
      return o;
    }
    o.rushed = typeof rec.ms === 'number' && rec.ms >= 0 && rec.ms < RUSHED_MS;
    if (isGuess(route)) { o.outcome = 'guessed_wrong'; return o; }
    if (!f.has_routes) { o.outcome = 'wrong_unrouted'; return o; }
    var label = (f.option_types || {})[String(rec.picked)] || null;
    // The number typed before the options is evidence too: when the picked
    // option says nothing and the typed number is a labelled wrong option, that
    // label confirms the record, marked `anchored` (worked out one value, then
    // switched to another option once the menu appeared).
    if (!label && rec.typed_option && rec.typed_option !== rec.picked) {
      var tlabel = (f.option_types || {})[String(rec.typed_option)] || null;
      if (tlabel && tlabel !== 'distractor') { label = tlabel; o.anchored = true; }
    }
    // An option no method reaches: a pick there is a guess or a misread, never
    // a physics error the student can be told they made.
    if (label === 'distractor') { o.outcome = 'wrong_distractor'; return o; }
    if (f.theory || route === 'sure') {
      o.outcome = 'wrong_belief'; o.type = 'concept'; o.confirmed = !!label;
      return o;
    }
    if (route === 'r') {
      if (!label) { o.outcome = 'slip_unconfirmed'; o.type = 'calculation'; return o; }
      var p = paramOf(label);
      if (p === 'calculation') { o.outcome = 'slip'; o.type = 'calculation'; o.confirmed = true; return o; }
      o.outcome = 'wrong_route'; o.type = p; o.confirmed = true; o.mismatch = true;
      return o;
    }
    var claimed = null;
    for (var i = 0; i < (f.routes || []).length; i++) if (f.routes[i].id === route) claimed = f.routes[i];
    if (!claimed) { o.outcome = 'wrong_unrouted'; return o; }
    var claimedType = paramOf(claimed.type) || 'concept';
    if (claimed.option === rec.picked) {
      o.outcome = 'wrong_route'; o.type = claimedType; o.confirmed = true;
      return o;
    }
    if (!label) { o.outcome = 'wrong_route'; o.type = claimedType; return o; }
    var q = paramOf(label);
    o.confirmed = true; o.mismatch = true;
    if (q === 'calculation') { o.outcome = 'slip'; o.type = 'calculation'; }
    else { o.outcome = 'wrong_route'; o.type = q; }
    return o;
  }

  /* history: confirmed wrong answers per type from every OTHER attempt in the
   * chapter (Diag.ledger(...).types without this run), so the headline is
   * earned across runs and retries, never from one run's two slips. */
  function diagnose(records, facts, history) {
    facts = facts || {};
    var params = {}, confirmed_types = {};
    for (var p = 0; p < PARAMS.length; p++) params[PARAMS[p]] = 0;
    for (var c = 0; c < TYPES.length; c++) confirmed_types[TYPES[c]] = 0;
    var score = 0, wrong = 0, legacy = 0, typed = 0, confirmed = 0, mismatches = 0, guessed_right = 0, ms = [];
    var anchored = 0, typed_first = 0;
    var outcomes = [], wrong_ids = [], check_ids = [], guessed_ids = [];
    var shapeIndex = {}, shapes = [];
    for (var i = 0; i < records.length; i++) {
      var r = records[i];
      if (typeof r.ms === 'number' && r.ms >= 0) ms.push(r.ms);
      var f = facts[r.qid] || {};
      var o = outcomeOf(r, f);
      o.qid = r.qid;
      outcomes.push(o);
      if (r.correct) score++; else { wrong++; wrong_ids.push(r.qid); }
      // Every record sits in its shape's group, a legacy one by its old probe.
      var st = !r.correct ? 'fix'
        : o.outcome ? (o.outcome === 'solid' ? 'solid' : 'check')
        : (r.probe === 'guessed' ? 'check' : 'solid');
      var sh = f.shape || null;
      var key = sh && sh.key ? sh.key : 'other';
      var g = shapeIndex[key];
      if (!g) { g = { key: key, label: sh && sh.label ? sh.label : null, qids: [], status: 'solid' }; shapeIndex[key] = g; shapes.push(g); }
      g.qids.push(r.qid);
      if (st === 'fix' || (st === 'check' && g.status === 'solid')) g.status = st;
      if (!o.outcome) { if (o.legacy) legacy++; continue; }
      if (o.outcome === 'guessed_right') { guessed_right++; guessed_ids.push(r.qid); }
      if (o.outcome === 'guessed_right' || o.outcome === 'right_by_wrong_route') check_ids.push(r.qid);
      if (o.outcome === 'guessed_right' || o.outcome === 'guessed_wrong' || o.outcome === 'wrong_distractor') params.guessed++;
      if (o.rushed) params.rushed++;
      if (o.type) { params[o.type]++; typed++; if (o.confirmed) { confirmed++; confirmed_types[o.type]++; } }
      if (o.mismatch) mismatches++;
      if (o.anchored) anchored++;
      if (typeof r.typed === 'string' && r.typed) typed_first++;
    }
    var weakness = null, best = 0;
    for (var t = 0; t < TYPES.length; t++) {
      if (params[TYPES[t]] > best) { best = params[TYPES[t]]; weakness = TYPES[t]; }
    }
    // The largest type at two names the run's pattern; the HEADLINE needs the
    // option's evidence, three confirmed of that type across the ledger.
    var evidence = weakness ? confirmed_types[weakness] + ((history && history[weakness]) || 0) : 0;
    if (best < MIN_TYPE || evidence < HEADLINE_AT) weakness = params.guessed >= MIN_GUESSED ? 'guessed' : (score >= SOLID_AT ? 'solid' : null);
    var med = median(ms);
    return {
      score: score,
      total: records.length,
      outcomes: outcomes,
      params: params,
      weakness: weakness,
      wrong: wrong,
      typed: typed,
      confirmed: confirmed,
      confirmed_share: typed ? Math.round(100 * confirmed / typed) / 100 : null,
      confirmed_types: confirmed_types,
      evidence: evidence,
      mismatches: mismatches,
      anchored: anchored,
      typed_first: typed_first,
      guessed_right: guessed_right,
      legacy: legacy,
      wrong_ids: wrong_ids,
      check_ids: check_ids,
      guessed_ids: guessed_ids,
      shapes: shapes,
      sec_per_q: med === null ? null : Math.round(med / 100) / 10,
      exam_sec_per_q: EXAM_SEC_PER_Q
    };
  }

  /** What a retry's route says for the streak: right by the right route is
      'sure'; a guess is 'guessed'; right by a wrong route is 'wrong_route'. */
  function probeOf(route, correct) {
    if (isGuess(route)) return 'guessed';
    if (!correct) return 'wrong';
    return isRight(route) ? 'sure' : 'wrong_route';
  }

  // A sibling retry for shape `key`: correct AND by the right route extends the
  // streak; anything else — wrong, guessed, or right by a wrong route — starts it over.
  function streakAfter(streak, key, retry) {
    var n = (streak && streak[key]) || 0;
    return (retry.correct && retry.probe === 'sure') ? n + 1 : 0;
  }

  function strongNow(n) { return n >= STRONG_AT; }

  /* The ledger: every attempt in the chapter — each routed record of every
   * run and every sibling retry — folded per shape in time order. A shape's
   * state is read from its last attempts, so one run never has the last word:
   *   strong  strong_now says so (sticky, as the streak rule sets it)
   *   solid   the last two attempts were right by the right route
   *   fix     a wrong answer confirmed by its option in the last three
   *   check   a wrong answer resting on the claim, a guess, or a right
   *           answer by a wrong route in the last three
   *   solid   nothing wrong seen (a single clean attempt)
   *   none    never attempted
   * types: confirmed wrong answers per type over the whole ledger (the
   * headline's evidence); opts.without_run leaves that run out of the count. */
  function ledger(cs, facts, opts) {
    cs = cs || {}; facts = facts || {}; opts = opts || {};
    var attempts = [];
    function push(rec, at, kind, run_no) {
      var f = facts[rec.qid] || {};
      var o = outcomeOf(rec, f);
      if (!o.outcome && !o.legacy) return;            // never routed: not an attempt
      var wrong = !rec.correct;
      // A wrong answer in a chapter with no audited routes has nothing to
      // confirm it and nothing to excuse it: it is plainly wrong (fix).
      var mark = wrong ? (o.confirmed ? 'wrong_confirmed' : o.outcome === 'wrong_unrouted' ? 'wrong_plain' : 'wrong_claimed')
        : o.outcome ? (o.outcome === 'solid' ? 'solid' : 'check')
        : (rec.probe === 'guessed' ? 'check' : 'solid');
      var key = rec.shape_key || (f.shape && f.shape.key) || 'other';
      attempts.push({ qid: rec.qid, at: at || '', order: attempts.length, kind: kind, run_no: run_no,
                      correct: !!rec.correct, mark: mark, type: o.type, confirmed: !!o.confirmed,
                      key: key, label: f.shape && f.shape.label ? f.shape.label : null });
    }
    var runs = cs.runs || [];
    for (var i = 0; i < runs.length; i++) {
      var recs = runs[i].records || [];
      for (var j = 0; j < recs.length; j++) push(recs[j], runs[i].finished_at || runs[i].started_at, 'run', runs[i].run_no);
    }
    var rets = cs.retries || [];
    for (var k = 0; k < rets.length; k++) push(rets[k], rets[k].at, 'retry', null);
    attempts.sort(function (a, b) { return a.at < b.at ? -1 : a.at > b.at ? 1 : a.order - b.order; });

    var types = {};
    for (var t = 0; t < TYPES.length; t++) types[TYPES[t]] = 0;
    var RANK = ['wrong_confirmed', 'wrong_plain', 'wrong_claimed', 'check', 'solid'];   // worst first
    var by = {}, shapes = [];
    for (var n = 0; n < attempts.length; n++) {
      var a = attempts[n];
      if (!a.correct && a.confirmed && a.type && !(opts.without_run != null && a.kind === 'run' && a.run_no === opts.without_run)) types[a.type]++;
      var g = by[a.key];
      if (!g) {
        g = { key: a.key, label: a.label, attempts: 0, solid: 0, wrong_confirmed: 0, wrong_plain: 0, wrong_claimed: 0, last_at: null, status: 'none', marks: [] };
        by[a.key] = g; shapes.push(g);
      }
      g.attempts++;
      if (a.mark === 'solid') g.solid++;
      if (a.mark === 'wrong_confirmed') g.wrong_confirmed++;
      if (a.mark === 'wrong_plain') g.wrong_plain++;
      if (a.mark === 'wrong_claimed') g.wrong_claimed++;
      g.last_at = a.at || g.last_at;
      if (!g.label && a.label) g.label = a.label;
      // One episode per run (its worst mark for the shape) or per retry, so a
      // run with three questions of one shape is one attempt at that shape.
      var ep = a.kind === 'run' ? 'run:' + a.run_no : 'retry:' + a.order;
      var lastEp = g.marks.length ? g.marks[g.marks.length - 1] : null;
      if (lastEp && lastEp.ep === ep) { if (RANK.indexOf(a.mark) < RANK.indexOf(lastEp.mark)) lastEp.mark = a.mark; }
      else g.marks.push({ ep: ep, mark: a.mark });
    }
    var strong = cs.strong_now || {};
    for (var s = 0; s < shapes.length; s++) {
      var sh = shapes[s];
      var marks = [];
      for (var m = 0; m < sh.marks.length; m++) marks.push(sh.marks[m].mark);
      var last = marks.slice(-LEDGER_WINDOW);
      var two = marks.slice(-2);
      var st;
      if (strong[sh.key]) st = 'strong';
      else if (two.length === 2 && two[0] === 'solid' && two[1] === 'solid') st = 'solid';
      else if (last.indexOf('wrong_confirmed') >= 0 || last.indexOf('wrong_plain') >= 0) st = 'fix';
      else if (last.indexOf('wrong_claimed') >= 0 || last.indexOf('check') >= 0) st = 'check';
      else st = sh.attempts ? 'solid' : 'none';
      sh.status = st;
      delete sh.marks;
    }
    return { shapes: shapes, by: by, types: types, attempts: attempts.length };
  }

  return {
    diagnose: diagnose,
    ledger: ledger,
    outcomeOf: outcomeOf,
    probeOf: probeOf,
    streakAfter: streakAfter,
    strongNow: strongNow,
    TYPES: TYPES,
    PARAMS: PARAMS,
    STRONG_AT: STRONG_AT,
    MIN_TYPE: MIN_TYPE,
    HEADLINE_AT: HEADLINE_AT,
    LEDGER_WINDOW: LEDGER_WINDOW,
    MIN_GUESSED: MIN_GUESSED,
    SOLID_AT: SOLID_AT,
    RUSHED_MS: RUSHED_MS,
    EXAM_SEC_PER_Q: EXAM_SEC_PER_Q
  };
})();
