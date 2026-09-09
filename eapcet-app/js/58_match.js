/* Match — a typed question against the public pool, on the phone, no server.
 * src/lib/eapcet/__tests__/match.test.ts runs THIS source.
 *
 * Text is normalised (NFKD, lower case, superscripts and subscripts to
 * digits, everything but letters and digits to spaces), cut into tokens with
 * a short stoplist and a trailing-s strip, and scored against each stem as
 * |Q ∩ D| / sqrt(|Q| · |D|), numeric tokens weighing double. A query that is
 * a substring of a stem scores 1. A hit needs a score of 0.35 and three
 * shared tokens (two when one of them is a number). Three hits at most;
 * scores within 0.1 of each other go to the chapter the student came from. */
var Match = (function () {
  var MIN_SCORE = 0.35;
  var TIE = 0.1;
  var STOP = {};
  var stopWords = ['the', 'a', 'an', 'of', 'in', 'on', 'at', 'to', 'is', 'are', 'was', 'were', 'be', 'and', 'or', 'with',
                   'from', 'by', 'for', 'it', 'its', 'that', 'this', 'then', 'than', 'as', 'if', 'when', 'what', 'which',
                   'will', 'has', 'have', 'find', 'given'];
  for (var i = 0; i < stopWords.length; i++) STOP[stopWords[i]] = true;
  var SCRIPTS = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
                  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' };

  function normalise(s) {
    var t = String(s || '');
    t = t.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉]/g, function (c) { return SCRIPTS[c] || c; });
    if (t.normalize) t = t.normalize('NFKD');
    t = t.toLowerCase().replace(/[^a-z0-9]+/g, ' ');
    return t.replace(/\s+/g, ' ').trim();
  }

  function tokens(s) {
    var words = normalise(s).split(' ');
    var out = [];
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if (!w || STOP[w]) continue;
      if (w.length > 3 && /s$/.test(w) && !/ss$/.test(w) && !/^\d/.test(w)) w = w.slice(0, -1);
      if (out.indexOf(w) < 0) out.push(w);
    }
    return out;
  }

  function isNum(w) { return /^\d/.test(w); }
  function weight(w) { return isNum(w) ? 2 : 1; }

  /** {score, shared, sharedNum} of a query (tokens + normalised text) against one stem. */
  function score(qTokens, qNorm, stem) {
    var sNorm = normalise(stem);
    if (qNorm.length >= 12 && sNorm.indexOf(qNorm) >= 0) {
      var nums = 0;
      for (var n = 0; n < qTokens.length; n++) if (isNum(qTokens[n])) nums++;
      return { score: 1, shared: qTokens.length, sharedNum: nums };
    }
    var d = tokens(stem);
    var inD = {};
    for (var j = 0; j < d.length; j++) inD[d[j]] = true;
    var wq = 0, wd = 0, inter = 0, shared = 0, sharedNum = 0;
    for (var i = 0; i < qTokens.length; i++) {
      var w = qTokens[i];
      wq += weight(w);
      if (inD[w]) { inter += weight(w); shared++; if (isNum(w)) sharedNum++; }
    }
    for (var k = 0; k < d.length; k++) wd += weight(d[k]);
    return { score: wq && wd ? inter / Math.sqrt(wq * wd) : 0, shared: shared, sharedNum: sharedNum };
  }

  /** The best three of `questions` ([{id, chapter_key, question_en}]) for `text`.
      {few: true} when the text has under three tokens. */
  function find(text, questions, ck) {
    var qt = tokens(text);
    var qn = normalise(text);
    if (qt.length < 3) return { few: true, hits: [] };
    var hits = [];
    for (var i = 0; i < (questions || []).length; i++) {
      var q = questions[i];
      var r = score(qt, qn, q.question_en);
      var enough = r.shared >= 3 || (r.shared >= 2 && r.sharedNum >= 1);
      if (r.score >= MIN_SCORE && enough) hits.push({ qid: q.id, ck: q.chapter_key, score: r.score, shared: r.shared });
    }
    hits.sort(function (a, b) {
      if (Math.abs(a.score - b.score) <= TIE && ck && (a.ck === ck) !== (b.ck === ck)) return a.ck === ck ? -1 : 1;
      return b.score - a.score || a.qid.localeCompare(b.qid);
    });
    return { few: false, hits: hits.slice(0, 3) };
  }

  return { normalise: normalise, tokens: tokens, score: score, find: find, MIN_SCORE: MIN_SCORE, TIE: TIE };
})();
