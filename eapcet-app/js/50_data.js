/* Data — the pool, read-only, and the two draws the product makes from it.
 *
 * window.EP_POOL is the release file MINUS every solution (the build strips
 * them; an entitled device fetches a chapter's solutions from ep-state into
 * memory). What the build leaves public on a question, beyond its text and
 * key: its shape ({key, label}, from the chapter's authored list), whether its
 * routes are audited (has_routes), whether it is a theory question (no right
 * route to describe), the route menu ([{id, text, type, option}], in hash
 * order so the right one is not always first), route_key ('r'), option_types
 * (which explained wrong option is which kind of mistake) and difficulty.
 *
 * A run draws only from a chapter's verified_ids: a question with no verified
 * solution behind it would leave a paying student with nothing to open.
 * EP_DEV_OPEN is the founder's dogfood switch — the build refuses it for a
 * hosted artifact. */
var Data = (function () {
  var POOL = window.EP_POOL || { chapters: [], questions: {}, siblings: {} };
  var DEV_OPEN = !!window.EP_DEV_OPEN;
  var RUN_LENGTH = 10;
  var DIFF_RANK = { easy: 0, medium: 1, hard: 2 };

  function chapters() { return POOL.chapters; }
  function chapter(key) {
    for (var i = 0; i < POOL.chapters.length; i++) if (POOL.chapters[i].key === key) return POOL.chapters[i];
    return null;
  }
  function question(id) { return POOL.questions[id] || null; }
  function runnableIds(ch) { return DEV_OPEN ? ch.pool_ids : ch.verified_ids; }
  function canRun(ch) { return DEV_OPEN ? ch.pool_ids.length >= RUN_LENGTH : ch.open; }

  /* A question with no authored shape sits under 'other'; a chapter with no
   * shapes is one group, and the draw below then behaves as it did before
   * shapes existed. */
  function shapeKey(q) { return q && q.shape && q.shape.key ? q.shape.key : 'other'; }
  function shapeLabel(ch, key) {
    var list = (ch && ch.shapes) || [];
    for (var i = 0; i < list.length; i++) if (list[i].key === key) return list[i].label;
    return null;
  }

  /** What Diag needs to read a record: the public facts of each question. */
  function facts(ids) {
    var out = {};
    for (var i = 0; i < (ids || []).length; i++) {
      var q = question(ids[i]);
      if (!q) continue;
      out[q.id] = { has_routes: !!q.has_routes, theory: !!q.theory, route_key: q.route_key || null,
                    option_types: q.option_types || {}, routes: q.routes || [], shape: q.shape || null };
    }
    return out;
  }

  /* Ten questions, seeded by device + chapter + run number so a draw can be
   * replayed. Round one takes one question per shape, shapes in seeded order,
   * unseen first within a shape; round two fills the rest, unseen first;
   * then the ten are ordered easy → medium → hard, stable, so the run opens
   * on a question the student can do. "Unseen" means not in the PREVIOUS run
   * only; a 13-question pool repeats on the third run and says so. */
  function draw(ch, runNo, deviceSeed, seenIds) {
    var seed = hashStr(deviceSeed + '|' + ch.key + '|' + runNo);
    var random = rng(seed);
    var seen = {};
    for (var i = 0; i < (seenIds || []).length; i++) seen[seenIds[i]] = true;
    var ids = runnableIds(ch);
    var groups = {}, keys = [];
    for (var j = 0; j < ids.length; j++) {
      var k = shapeKey(question(ids[j]));
      if (!groups[k]) { groups[k] = { unseen: [], seen: [] }; keys.push(k); }
      (seen[ids[j]] ? groups[k].seen : groups[k].unseen).push(ids[j]);
    }
    keys = shuffled(keys, random);
    var pick = [], rest = [];
    for (var m = 0; m < keys.length; m++) {
      var g = groups[keys[m]];
      var line = shuffled(g.unseen, random).concat(shuffled(g.seen, random));
      if (line.length && pick.length < RUN_LENGTH) pick.push(line.shift());
      rest = rest.concat(line);
    }
    var unseenRest = [], seenRest = [];
    for (var n = 0; n < rest.length; n++) (seen[rest[n]] ? seenRest : unseenRest).push(rest[n]);
    pick = pick.concat(shuffled(unseenRest, random), shuffled(seenRest, random)).slice(0, RUN_LENGTH);
    var ranked = [];
    for (var r = 0; r < pick.length; r++) {
      var q = question(pick[r]);
      var d = q && DIFF_RANK.hasOwnProperty(q.difficulty) ? DIFF_RANK[q.difficulty] : 1;
      ranked.push({ id: pick[r], rank: d, i: r });
    }
    ranked.sort(function (a, b) { return a.rank - b.rank || a.i - b.i; });
    var out = [];
    for (var s = 0; s < ranked.length; s++) out.push(ranked[s].id);
    return { seed: seed, ids: out };
  }

  /* A similar question to retry: an unseen question of the same shape, else
   * the first unseen sibling from the release's similarity list, else any
   * unseen runnable question of the chapter, else the least recently seen
   * one. `seenOrder` is every id the student has met in this chapter, oldest
   * first. Returns {qid, same_shape} or null. */
  function sibling(qid, ch, seenOrder) {
    var seen = {};
    for (var i = 0; i < seenOrder.length; i++) seen[seenOrder[i]] = true;
    var key = shapeKey(question(qid));
    var ids = runnableIds(ch);
    var runnable = {};
    for (var r = 0; r < ids.length; r++) runnable[ids[r]] = true;
    function pack(id) { return { qid: id, same_shape: key !== 'other' && shapeKey(question(id)) === key }; }
    if (key !== 'other') {
      for (var a = 0; a < ids.length; a++) if (ids[a] !== qid && !seen[ids[a]] && shapeKey(question(ids[a])) === key) return pack(ids[a]);
    }
    var sibs = POOL.siblings[qid] || [];
    for (var j = 0; j < sibs.length; j++) if (runnable[sibs[j]] && !seen[sibs[j]]) return pack(sibs[j]);
    for (var k = 0; k < ids.length; k++) if (ids[k] !== qid && !seen[ids[k]]) return pack(ids[k]);
    for (var m = 0; m < seenOrder.length; m++) if (seenOrder[m] !== qid && runnable[seenOrder[m]]) return pack(seenOrder[m]);
    return null;
  }

  return { chapters: chapters, chapter: chapter, question: question, canRun: canRun, runnableIds: runnableIds,
           draw: draw, sibling: sibling, facts: facts, shapeKey: shapeKey, shapeLabel: shapeLabel,
           RUN_LENGTH: RUN_LENGTH, DEV_OPEN: DEV_OPEN };
})();
