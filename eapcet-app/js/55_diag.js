/* Diag — the diagnosis is arithmetic, not opinion. Records in, verdict out.
 *
 * No DOM, no storage, no clock: everything a screen shows about a student's run is
 * derived here from the records the run wrote, so the same records always give the
 * same verdict and the test in src/lib/eapcet/__tests__/diagnose.test.ts runs THIS
 * source, not a copy.
 *
 * A record: { qid, picked, correct, ms, probe }
 *   probe when correct: 'sure' | 'guessed'
 *   probe when wrong:   'concept' | 'calculation' | 'application' | 'time'
 */
var Diag = (function () {
  // Tie order, most fundamental first: a student weak on the concept is told that,
  // not that a calculation slipped.
  var WRONG_TYPES = ['concept', 'application', 'calculation', 'time'];
  var STRONG_AT = 3;              // consecutive correct-and-sure siblings
  var MIN_WRONG = 2;              // fewer wrong answers than this name no weakness
  var EXAM_SEC_PER_Q = 67.5;      // 160 questions in 180 minutes

  function median(xs) {
    if (!xs.length) return null;
    var s = xs.slice().sort(function (a, b) { return a - b; });
    var m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }

  function diagnose(records) {
    var hist = {};
    for (var t = 0; t < WRONG_TYPES.length; t++) hist[WRONG_TYPES[t]] = 0;
    var score = 0, guessed_right = 0, wrong = 0, ms = [];
    var wrong_ids = [], guessed_ids = [];
    for (var i = 0; i < records.length; i++) {
      var r = records[i];
      if (typeof r.ms === 'number' && r.ms >= 0) ms.push(r.ms);
      if (r.correct) {
        score++;
        if (r.probe === 'guessed') { guessed_right++; guessed_ids.push(r.qid); }
      } else {
        wrong++;
        wrong_ids.push(r.qid);
        if (hist.hasOwnProperty(r.probe)) hist[r.probe]++;
      }
    }
    var weakness = null;
    if (wrong >= MIN_WRONG) {
      var best = 0;
      for (var k = 0; k < WRONG_TYPES.length; k++) {
        if (hist[WRONG_TYPES[k]] > best) { best = hist[WRONG_TYPES[k]]; weakness = WRONG_TYPES[k]; }
      }
    }
    var med = median(ms);
    return {
      score: score,
      total: records.length,
      hist: hist,
      guessed_right: guessed_right,
      weakness: weakness,
      wrong_ids: wrong_ids,
      guessed_ids: guessed_ids,
      sec_per_q: med === null ? null : Math.round(med / 100) / 10,
      exam_sec_per_q: EXAM_SEC_PER_Q
    };
  }

  // A sibling retry for weakness type `type`: correct AND sure extends the streak,
  // anything else — wrong, or right but guessed — starts it over.
  function streakAfter(streak, type, retry) {
    var n = (streak && streak[type]) || 0;
    return (retry.correct && retry.probe === 'sure') ? n + 1 : 0;
  }

  function strongNow(n) { return n >= STRONG_AT; }

  return {
    diagnose: diagnose,
    streakAfter: streakAfter,
    strongNow: strongNow,
    WRONG_TYPES: WRONG_TYPES,
    STRONG_AT: STRONG_AT,
    MIN_WRONG: MIN_WRONG,
    EXAM_SEC_PER_Q: EXAM_SEC_PER_Q
  };
})();
