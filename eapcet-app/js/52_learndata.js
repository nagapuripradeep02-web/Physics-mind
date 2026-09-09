/* LearnData — the learn packs, read-only, from window.EP_LEARN.
 *
 * The build folds every practice question into the public shape a pool
 * question has (question_en, options_en, answer, option_types, routes in hash
 * order, route_key 'r', has_routes true, theory false) plus the pack's fixes
 * by option, so questionCard / Diag.outcomeOf read a lesson's question exactly
 * as they read a run's. A build without packs leaves every list empty, and
 * the learn screens say so. Nothing here writes. */
var LearnData = (function () {
  var L = window.EP_LEARN || { schema: null, chapters: {}, links: {} };
  function hasOwn(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }

  var byQid = {};       // question id → the folded question
  var bySub = {};       // 'ck|sub' → { ck, key, topic, ti, subtopic, si, index }
  var order = {};       // ck → subtopic keys in pack order
  for (var ck in L.chapters) if (hasOwn(L.chapters, ck)) {
    var chapterPack = L.chapters[ck];     // not `pack`: that name is the function below
    order[ck] = [];
    for (var ti = 0; ti < chapterPack.topics.length; ti++) {
      var t = chapterPack.topics[ti];
      for (var si = 0; si < t.subtopics.length; si++) {
        var s = t.subtopics[si];
        bySub[ck + '|' + s.key] = { ck: ck, key: s.key, topic: t, ti: ti, subtopic: s, si: si, index: order[ck].length };
        order[ck].push(s.key);
        for (var a = 0; a < s.apply.length; a++) {
          for (var v = 0; v < s.apply[a].variants.length; v++) byQid[s.apply[a].variants[v].id] = s.apply[a].variants[v];
        }
      }
    }
  }

  /** Chapter keys that have a pack, in pool order. */
  function chapters() {
    var out = [], chs = Data.chapters();
    for (var i = 0; i < chs.length; i++) if (hasOwn(L.chapters, chs[i].key)) out.push(chs[i].key);
    return out;
  }
  function pack(ck) { return hasOwn(L.chapters, ck) ? L.chapters[ck] : null; }
  function subtopic(ck, sub) { return bySub[ck + '|' + sub] || null; }
  function subtopics(ck) { return order[ck] || []; }
  function question(qid) { return byQid[qid] || null; }
  function links(ck) { return L.links[ck] || {}; }
  /** What Diag reads about a lesson question: the same fields as Data.facts. */
  function facts(q) {
    return { has_routes: true, theory: false, route_key: 'r', option_types: q.option_types || {}, routes: q.routes || [], shape: null };
  }
  function factsOf(ids) {
    var out = {};
    for (var i = 0; i < (ids || []).length; i++) { var q = question(ids[i]); if (q) out[q.id] = facts(q); }
    return out;
  }
  function anyUnreviewed() {
    for (var k in L.chapters) if (hasOwn(L.chapters, k) && !L.chapters[k].reviewed) return true;
    return false;
  }

  return { chapters: chapters, pack: pack, subtopic: subtopic, subtopics: subtopics, question: question,
           links: links, facts: facts, factsOf: factsOf, anyUnreviewed: anyUnreviewed,
           on: function () { return chapters().length > 0; } };
})();
