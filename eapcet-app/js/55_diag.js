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
  var MIN_TYPE = 2;               // a type names the weakness at this many
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
    var o = { outcome: null, type: null, confirmed: false, mismatch: false, rushed: false, legacy: false };
    if (!route) { o.legacy = !!rec.probe; return o; }
    if (rec.correct) {
      o.outcome = isGuess(route) ? 'guessed_right' : (isRight(route) ? 'solid' : 'right_by_wrong_route');
      return o;
    }
    o.rushed = typeof rec.ms === 'number' && rec.ms >= 0 && rec.ms < RUSHED_MS;
    if (isGuess(route)) { o.outcome = 'guessed_wrong'; return o; }
    if (!f.has_routes) { o.outcome = 'wrong_unrouted'; return o; }
    var label = (f.option_types || {})[String(rec.picked)] || null;
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

  function diagnose(records, facts) {
    facts = facts || {};
    var params = {};
    for (var p = 0; p < PARAMS.length; p++) params[PARAMS[p]] = 0;
    var score = 0, wrong = 0, legacy = 0, typed = 0, confirmed = 0, mismatches = 0, guessed_right = 0, ms = [];
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
      if (o.outcome === 'guessed_right' || o.outcome === 'guessed_wrong') params.guessed++;
      if (o.rushed) params.rushed++;
      if (o.type) { params[o.type]++; typed++; if (o.confirmed) confirmed++; }
      if (o.mismatch) mismatches++;
    }
    var weakness = null, best = 0;
    for (var t = 0; t < TYPES.length; t++) {
      if (params[TYPES[t]] > best) { best = params[TYPES[t]]; weakness = TYPES[t]; }
    }
    if (best < MIN_TYPE) weakness = params.guessed >= MIN_GUESSED ? 'guessed' : (score >= SOLID_AT ? 'solid' : null);
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
      mismatches: mismatches,
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

  return {
    diagnose: diagnose,
    outcomeOf: outcomeOf,
    probeOf: probeOf,
    streakAfter: streakAfter,
    strongNow: strongNow,
    TYPES: TYPES,
    PARAMS: PARAMS,
    STRONG_AT: STRONG_AT,
    MIN_TYPE: MIN_TYPE,
    MIN_GUESSED: MIN_GUESSED,
    SOLID_AT: SOLID_AT,
    RUSHED_MS: RUSHED_MS,
    EXAM_SEC_PER_Q: EXAM_SEC_PER_Q
  };
})();
