/* Data — the pool, read-only, and the two draws the product makes from it.
 *
 * window.EP_POOL is the release file MINUS every solution (the build strips
 * them; an entitled device fetches a chapter's solutions from ep-state into
 * memory). A run draws only from a chapter's verified_ids: a question with no
 * verified solution behind it would leave a paying student with nothing to
 * open. EP_DEV_OPEN is the founder's dogfood switch — the build refuses it for
 * a hosted artifact. */
var Data = (function () {
  var POOL = window.EP_POOL || { chapters: [], questions: {}, siblings: {} };
  var DEV_OPEN = !!window.EP_DEV_OPEN;
  var RUN_LENGTH = 10;

  function chapters() { return POOL.chapters; }
  function chapter(key) {
    for (var i = 0; i < POOL.chapters.length; i++) if (POOL.chapters[i].key === key) return POOL.chapters[i];
    return null;
  }
  function question(id) { return POOL.questions[id] || null; }
  function runnableIds(ch) { return DEV_OPEN ? ch.pool_ids : ch.verified_ids; }
  function canRun(ch) { return DEV_OPEN ? ch.pool_ids.length >= RUN_LENGTH : ch.open; }

  /* Ten questions, seeded by device + chapter + run number so a draw can be
   * replayed, unseen first — "unseen" meaning not in the PREVIOUS run only; a
   * 13-question pool repeats on the third run and says so in the product. */
  function draw(ch, runNo, deviceSeed, seenIds) {
    var seed = hashStr(deviceSeed + '|' + ch.key + '|' + runNo);
    var random = rng(seed);
    var seen = {};
    for (var i = 0; i < (seenIds || []).length; i++) seen[seenIds[i]] = true;
    var ids = runnableIds(ch);
    var unseen = [], rest = [];
    for (var j = 0; j < ids.length; j++) (seen[ids[j]] ? rest : unseen).push(ids[j]);
    var pick = shuffled(unseen, random).concat(shuffled(rest, random)).slice(0, RUN_LENGTH);
    return { seed: seed, ids: pick };
  }

  /* A similar question to retry: the first unseen sibling, else any unseen
   * runnable question of the chapter, else the least recently seen one.
   * `seenOrder` is every id the student has met in this chapter, oldest first. */
  function sibling(qid, ch, seenOrder) {
    var seen = {};
    for (var i = 0; i < seenOrder.length; i++) seen[seenOrder[i]] = true;
    var sibs = POOL.siblings[qid] || [];
    var runnable = {};
    var ids = runnableIds(ch);
    for (var r = 0; r < ids.length; r++) runnable[ids[r]] = true;
    for (var j = 0; j < sibs.length; j++) if (runnable[sibs[j]] && !seen[sibs[j]]) return sibs[j];
    for (var k = 0; k < ids.length; k++) if (ids[k] !== qid && !seen[ids[k]]) return ids[k];
    for (var m = 0; m < seenOrder.length; m++) if (seenOrder[m] !== qid && runnable[seenOrder[m]]) return seenOrder[m];
    return null;
  }

  return { chapters: chapters, chapter: chapter, question: question, canRun: canRun,
           runnableIds: runnableIds, draw: draw, sibling: sibling, RUN_LENGTH: RUN_LENGTH, DEV_OPEN: DEV_OPEN };
})();
