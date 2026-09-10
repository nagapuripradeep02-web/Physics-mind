/* Screens — the hash router and every view. Renders from Data/Run/Diag only;
 * nothing here decides physics, scores or diagnosis.
 *
 *   #/                       subject door
 *   #/physics                chapter list
 *   #/physics/<key>          the run, as a thread
 *   #/physics/<key>/result   the diagnosis, and the reveal of the papers
 *   #/physics/<key>/fix/<id> the worked solution (paid: the lock wall for a locked device)
 *   #/unlock                 the plan, the price, sign-in, pay
 *   #/notastudent/<word>[/off]  team marking
 *   #/physics/learn[/<key>[/<sub>]]   learn and practice (82_learn_screens.js)
 *   #/physics/solutions[/<key>]       the doubt desk (84_solutions.js)
 *   #/physics/weakness       an alias of #/physics
 *
 * A question card in a run or a retry never names its paper; only the fix
 * page and the result's reveal do. */
var Screens = (function () {
  var VIEWS = ['doorView', 'chaptersView', 'runView', 'resultView', 'fixView', 'unlockView',
               'learnView', 'subtopicView', 'solutionsView'];
  /* What each view builds per visit. Cleared when the router leaves the view,
   * so a hidden view never keeps a card, a chip row or a chat behind it. */
  var DYNAMIC = {
    doorView: ['doorTiles'], chaptersView: ['chapterList'], runView: ['runThread', 'runChips'],
    resultView: ['resultBody'], fixView: ['fixBody'], unlockView: ['unlockBody'],
    learnView: ['learnBody'], subtopicView: ['subBody', 'learnThread', 'learnChips'],
    solutionsView: ['solThread', 'solChips']
  };
  var leaveHooks = {};
  var currentView = null;

  function showView(id) {
    if (currentView && currentView !== id) {
      var ids = DYNAMIC[currentView] || [];
      for (var k = 0; k < ids.length; k++) {
        var n = $(ids[k]);
        if (!n) continue;
        clear(n);
        if (n.classList.contains('ep-chips')) n.hidden = true;
      }
      if (leaveHooks[currentView]) leaveHooks[currentView]();
    }
    for (var i = 0; i < VIEWS.length; i++) $(VIEWS[i]).hidden = VIEWS[i] !== id;
    currentView = id;
    if (typeof Nav !== 'undefined') Nav.tabs();
    window.scrollTo(0, 0);
  }
  /** A module's own clean-up when the router leaves its view (object URLs, timers). */
  function onLeave(id, fn) { leaveHooks[id] = fn; }
  function setBack(href, label) {
    var b = $('btnBack');
    b.hidden = !href;
    if (href) { b.href = href; b.textContent = '← ' + label; }
  }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }
  function button(cls, label, fn) {
    var b = el('button', cls, label);
    b.type = 'button';
    b.onclick = fn;
    return b;
  }

  // ── door ────────────────────────────────────────────────────────────────
  function showDoor() {
    showView('doorView');
    setBack(null);
    $('doorTitle').textContent = STR.door_title;
    $('doorSub').textContent = STR.door_sub;
    var tiles = $('doorTiles');
    clear(tiles);
    var live = el('a', 'ep-tile');
    live.href = '#/physics';
    live.setAttribute('data-subject', 'physics');
    live.appendChild(el('span', 'ep-tile-name', STR.door_physics));
    live.appendChild(el('span', 'ep-tile-sub', STR.door_physics_sub));
    var openCount = 0, chs = Data.chapters();
    for (var c = 0; c < chs.length; c++) if (Data.canRun(chs[c])) openCount++;
    var packs = typeof LearnData !== 'undefined' ? LearnData.chapters().length : 0;
    live.appendChild(el('span', 'ep-tile-line', STR.door_physics_line(packs, openCount)));
    tiles.appendChild(live);
    var soon = [STR.door_chemistry, STR.door_maths];
    for (var i = 0; i < soon.length; i++) {
      var t = el('div', 'ep-tile ep-tile-soon');
      t.appendChild(el('span', 'ep-tile-name', soon[i]));
      t.appendChild(el('span', 'ep-tile-sub', STR.door_soon));
      tiles.appendChild(t);
    }
    Track.log('door', {});
  }

  // ── chapters ────────────────────────────────────────────────────────────
  function strongText(ch, key, sameShape, fixPage) {
    var label = sameShape ? Data.shapeLabel(ch, key) : null;
    if (fixPage) return label ? STR.fix_strong(label) : STR.fix_strong_similar;
    return label ? STR.badge_strong(label) : STR.badge_strong_similar;
  }
  function badgeNode(ch) {
    var never = ch.closed_because && /asked once/i.test(ch.closed_because);
    if (never) return el('span', 'ep-badge ep-badge-closed', STR.badge_never);
    if (!Data.canRun(ch)) return el('span', 'ep-badge ep-badge-closed', STR.badge_closed);
    var b = Run.badge(ch.key);
    if (b.kind === 'strong') return el('span', 'ep-badge ep-badge-strong', strongText(ch, b.shape_key, b.same_shape, false));
    if (b.kind === 'weak') return el('span', 'ep-badge ep-badge-weak', STR.badge_weak(b.type, b.score, b.total));
    if (b.kind === 'score') return el('span', 'ep-badge ep-badge-score', STR.badge_score(b.score, b.total));
    return el('span', 'ep-badge', STR.badge_untested);
  }
  function showChapters() {
    showView('chaptersView');
    setBack('#/', STR.back_subjects);
    $('chaptersEyebrow').textContent = STR.eyebrow_physics;
    $('chaptersTitle').textContent = STR.chapters_title;
    $('chaptersSub').textContent = STR.chapters_sub;
    var list = $('chapterList');
    clear(list);
    var chapters = Data.chapters();
    for (var i = 0; i < chapters.length; i++) (function (ch) {
      var runnable = Data.canRun(ch);
      var row = el(runnable ? 'a' : 'div', 'ep-row' + (runnable ? '' : ' ep-row-closed'));
      if (runnable) row.href = '#/physics/' + ch.key;
      row.setAttribute('data-chapter', ch.key);
      var main = el('div', 'ep-row-main');
      main.appendChild(el('div', 'ep-row-name', ch.name));
      main.appendChild(el('div', 'ep-row-share', STR.share_line(ch.share_pct, ch.per_exam)));
      masteryLine(main, ch);
      row.appendChild(main);
      row.appendChild(badgeNode(ch));
      list.appendChild(row);
    })(chapters[i]);
    Track.log('subject_pick', { subject: 'physics' });
  }

  /** One segment per shape under a chapter that has been tested or learned:
      what the test hall found, and what the classroom claims (dashed). */
  function masteryLine(host, ch) {
    if (typeof Study === 'undefined' || !ch.shapes || !ch.shapes.length) return;
    var m = Study.mastery(ch.key);
    var sum = Learn.summary(m);
    var any = !!Run.lastFinished(ch.key);
    for (var i = 0; i < sum.length; i++) if (sum[i].state !== 'none') any = true;
    if (!any) return;
    var parts = [];
    for (var k = 0; k < sum.length; k++) parts.push(STR.mastery_part(sum[k].state, sum[k].n));
    var text = parts.join(STR.mastery_join);
    var bar = el('div', 'ep-mastery');
    bar.setAttribute('role', 'img');
    bar.setAttribute('aria-label', text);
    for (var s = 0; s < ch.shapes.length; s++) {
      var seg = el('span', 'ep-mastery-seg');
      seg.setAttribute('data-state', m[ch.shapes[s].key] || 'none');
      seg.setAttribute('data-shape', ch.shapes[s].key);
      bar.appendChild(seg);
    }
    host.appendChild(bar);
    host.appendChild(el('div', 'ep-mastery-sum', text));
  }

  // ── the run, as a thread ────────────────────────────────────────────────
  var thread, chips;
  /** A line in a thread. `target` lets another screen's thread reuse it. */
  function say(text, who, target) {
    var host = target || thread;
    var m = el('div', 'ep-msg ' + (who || 'tutor'), text);
    host.appendChild(m);
    m.scrollIntoView({ block: 'end' });
    return m;
  }
  function setChips(list, target) {
    var host = target || chips;
    clear(host);
    for (var i = 0; i < list.length; i++) (function (c) {
      var b = el('button', 'ep-chip', c.label);
      b.type = 'button';
      b.setAttribute('data-route', c.value);
      b.onclick = function () { c.onTap(); };
      host.appendChild(b);
    })(list[i]);
    host.hidden = !list.length;
    // The row is sticky at the bottom; at the page's end it sits in its own
    // place, so the newest line of the thread is above it, not under it.
    if (list.length) window.scrollTo(0, document.documentElement.scrollHeight);
  }

  /** The menu after a pick: the question's routes (hash order) and "I guessed",
      or "I was sure" / "I guessed" when the question has no audited routes. */
  function hasMenu(q) { return !!(q.has_routes && !q.theory && q.routes && q.routes.length); }
  function routeLabel(q, id) {
    if (id === 'guess') return STR.route_guess;
    if (id === 'sure') return STR.probe_sure;
    var routes = q.routes || [];
    for (var i = 0; i < routes.length; i++) if (routes[i].id === id) return routes[i].text;
    return id;
  }
  function routePrompt(q) { return hasMenu(q) ? STR.route_q : STR.sure_q; }
  function routeChips(q, onRoute_) {
    var ids = Run.routesOf(q);
    var list = [];
    for (var i = 0; i < ids.length; i++) (function (id) {
      list.push({ label: routeLabel(q, id), value: id, onTap: function () { onRoute_(id); } });
    })(ids[i]);
    return list;
  }
  /** The route a wrong option is where of, when it has one. */
  function routeOfOption(q, option) {
    var routes = q.routes || [];
    for (var i = 0; i < routes.length; i++) if (routes[i].id !== 'r' && routes[i].option === option) return routes[i].text;
    return null;
  }

  /** A question card: stem, then — on a question whose answer is one number —
      a "your answer first" row that hides the options until the student has
      typed a number or said they have none; then the four option buttons. No
      paper label. onPick(card, n, typed) with typed = {typed, ms_typed} or
      null; hooks.onTyped(typed) fires when the options appear (the run re-arms
      its clock there); hooks.noTyped skips the row (a resumed pick). */
  function questionCard(q, progressText, onPick_, hooks) {
    hooks = hooks || {};
    var card = el('div', 'ep-card');
    card.setAttribute('data-qid', q.id);
    if (progressText) card.appendChild(el('div', 'ep-progress', progressText));
    card.appendChild(el('div', 'ep-stem', q.question_en));
    var typedInfo = null;
    var opts = el('div', 'ep-opts');
    for (var n = 1; n <= 4; n++) (function (n) {
      var b = el('button', 'ep-opt');
      b.type = 'button';
      b.setAttribute('data-option', String(n));
      b.appendChild(el('span', 'ep-opt-n', STR.option_label(n)));
      b.appendChild(el('span', 'ep-opt-t', q.options_en[n - 1]));
      b.onclick = function () { onPick_(card, n, typedInfo); };
      opts.appendChild(b);
    })(n);
    if (q.answer_kind === 'number' && !hooks.noTyped) {
      var shownAt = Date.now();
      var box = el('div', 'ep-typed');
      box.appendChild(el('div', 'ep-typed-label', STR.typed_prompt));
      var row = el('div', 'ep-typed-row');
      var input = document.createElement('input');
      input.className = 'ep-typed-input';
      input.type = 'text';
      input.setAttribute('inputmode', 'decimal');
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('aria-label', STR.typed_prompt);
      input.placeholder = STR.typed_placeholder;
      var go = button('btn btn-primary ep-typed-go', STR.typed_done, function () { done(input.value.trim() || null); });
      row.appendChild(input);
      row.appendChild(go);
      box.appendChild(row);
      box.appendChild(button('ep-typed-none', STR.typed_none, function () { done(null); }));
      input.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); go.click(); } };
      card.appendChild(box);
      opts.hidden = true;
    }
    function done(text) {
      typedInfo = { typed: text, ms_typed: Date.now() - shownAt };
      var said = el('div', 'ep-typed-said', text ? STR.typed_said(text) : STR.typed_said_none);
      card.replaceChild(said, box);
      opts.hidden = false;
      if (hooks.onTyped) hooks.onTyped(typedInfo);
    }
    card.appendChild(opts);
    return card;
  }
  /** The pick: every option locks and the picked one is marked. The key is
      NOT shown yet — the student says which way they went first (revealKey). */
  function markPicked(card, n) {
    var buttons = card.querySelectorAll('.ep-opt');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].disabled = true;
      if (Number(buttons[i].getAttribute('data-option')) === n) buttons[i].classList.add('picked');
    }
  }
  /** After the route tap: the key goes green, a wrong pick goes red. */
  function revealKey(card, q, n, correct) {
    var buttons = card.querySelectorAll('.ep-opt');
    for (var i = 0; i < buttons.length; i++) {
      var k = Number(buttons[i].getAttribute('data-option'));
      if (k === q.answer) buttons[i].classList.add('right');
      if (k === n && !correct) buttons[i].classList.add('wrong');
    }
  }
  function lastCardOf(host, qid) {
    var cards = host.querySelectorAll('.ep-card[data-qid="' + qid + '"]');
    return cards.length ? cards[cards.length - 1] : null;
  }

  function askCard() {
    var cur = Run.current();
    var q = Run.question();
    var card = questionCard(q, STR.run_progress(cur.i + 1, Run.total()), onPick, {
      onTyped: function (t) {
        Run.shown();                                    // ms stays render-to-tap of the OPTION
        Track.log('q_typed', { qid: q.id, typed: !!t.typed, ms_typed: t.ms_typed });
      }
    });
    thread.appendChild(card);
    card.scrollIntoView({ block: 'end' });
    Run.shown();
    Track.log('q_show', { qid: q.id, i: cur.i + 1 });
  }

  function onPick(card, n, typed) {
    var q = Run.question();
    var rec = Run.pick(n, typed);
    if (!rec) return;
    markPicked(card, n);
    say(routePrompt(q));
    setChips(routeChips(q, onRoute));
  }

  function onRoute(id) {
    var q = Run.question();
    var records = Run.current().run.records;
    var rec = records[records.length - 1];
    var phase = Run.route(id);
    if (!phase) return;
    say(routeLabel(q, id), 'student');
    var card = lastCardOf(thread, q.id);
    if (card) revealKey(card, q, rec.picked, rec.correct);
    say(rec.correct ? STR.correct : STR.wrong(rec.picked, q.answer));
    setChips([]);
    if (phase === 'done') {
      location.hash = '#/physics/' + Run.current().chapterKey + '/result';
    } else {
      askCard();
    }
  }

  function showRun(key) {
    var ch = Data.chapter(key);
    if (!ch) { location.hash = '#/physics'; return; }
    showView('runView');
    setBack('#/physics', STR.back_chapters);
    thread = $('runThread');
    chips = $('runChips');
    clear(thread);
    setChips([]);
    $('runTitle').textContent = ch.name;
    Track.log('chapter_open', { chapter: key, share: ch.share_pct });
    if (!Data.canRun(ch)) { say(STR.run_closed); return; }
    var cur = Run.resume(key);
    say(STR.run_head(ch.name));
    if (cur) {
      say(STR.run_resume);
    } else {
      say(STR.run_intro);
      cur = Run.start(key);
    }
    if (cur.phase === 'routing') {
      // The pick was saved; the route was not. Show the pick and ask again.
      var rec = cur.run.records[cur.run.records.length - 1];
      var q = Data.question(rec.qid);
      var card = questionCard(q, STR.run_progress(cur.i + 1, Run.total()), function () {}, { noTyped: true });
      markPicked(card, rec.picked);
      thread.appendChild(card);
      say(routePrompt(q));
      setChips(routeChips(q, onRoute));
    } else {
      askCard();
    }
  }

  // ── result ──────────────────────────────────────────────────────────────
  /** The sentence for one record's outcome. Type words and public route
      phrases only — never a mistake's text, which is paid. */
  function outcomeText(o, q, rec) {
    var claimed = rec.route && rec.route !== 'r' && rec.route !== 'sure' && rec.route !== 'guess' ? routeLabel(q, rec.route) : null;
    var picked = routeOfOption(q, rec.picked);
    var s;
    switch (o.outcome) {
      case 'solid': s = STR.outcome.solid; break;
      case 'guessed_right': s = STR.outcome.guessed_right; break;
      case 'right_by_wrong_route': s = STR.outcome.right_by_wrong_route; break;
      case 'guessed_wrong': s = STR.outcome.guessed_wrong; break;
      case 'wrong_unrouted': s = STR.outcome.wrong_unrouted(rec.picked, q.answer); break;
      case 'wrong_belief': s = STR.outcome.wrong_belief(o.confirmed); break;
      case 'slip': s = o.mismatch && claimed ? STR.outcome.slip_mismatch(claimed) : STR.outcome.slip; break;
      case 'slip_unconfirmed': s = STR.outcome.slip_unconfirmed; break;
      case 'wrong_route':
        if (!o.confirmed) s = STR.outcome.wrong_route_unconfirmed(claimed || '', o.type);
        else if (!o.mismatch) s = STR.outcome.wrong_route(claimed || '', o.type);
        else if (rec.route === 'r') s = STR.outcome.wrong_route_claimed_right(picked, o.type);
        else s = STR.outcome.wrong_route_other(claimed || '', picked, o.type);
        break;
      case 'wrong_distractor': s = STR.outcome.wrong_distractor; break;
      default: s = STR.outcome.legacy(rec.correct, rec.picked, q.answer);
    }
    if (o.anchored) s = STR.outcome.anchored(rec.typed_option, rec.picked) + ' ' + s;
    return s + (o.rushed ? STR.rushed_suffix : '');
  }

  function showResult(key) {
    var ch = Data.chapter(key);
    var run = ch && Run.lastFinished(key);
    if (!run) { location.hash = '#/physics/' + key; return; }
    var d = Run.diagnosisOf(run);
    showView('resultView');
    setBack('#/physics', STR.back_chapters);
    var box = $('resultBody');
    clear(box);
    box.appendChild(el('h2', 'ep-h2', ch.name));
    box.appendChild(el('div', 'ep-score', STR.result_score(d.score, d.total)));

    var verdict = el('p', 'ep-verdict' + (d.score === d.total || d.weakness === 'solid' ? ' ep-verdict-ok' : ''));
    verdict.id = 'resultVerdict';
    verdict.textContent = d.score === d.total ? STR.all_correct
      : (d.weakness ? STR.weakness[d.weakness](ch.name) : STR.no_pattern);
    box.appendChild(verdict);
    if (d.typed > 0) {
      var conf = el('p', 'ep-note', STR.result_confirmed(d.confirmed, d.wrong));
      conf.id = 'resultConfirmed';
      box.appendChild(conf);
    }
    box.appendChild(el('div', 'ep-h3', STR.hub_title));
    box.appendChild(hub(key, ch, d));

    box.appendChild(el('div', 'ep-h3', STR.result_params_title));
    var bars = el('div', 'ep-bars');
    var max = 1;
    for (var t = 0; t < Diag.PARAMS.length; t++) max = Math.max(max, d.params[Diag.PARAMS[t]]);
    for (var u = 0; u < Diag.PARAMS.length; u++) {
      var p = Diag.PARAMS[u];
      var row = el('div', 'ep-bar' + (p === d.weakness ? ' ep-bar-weak' : ''));
      row.setAttribute('data-param', p);
      row.appendChild(el('span', 'ep-bar-label', STR.param_label[p]));
      var track = el('span', 'ep-bar-track');
      var fill = el('span', 'ep-bar-fill');
      fill.style.width = (100 * d.params[p] / max) + '%';
      track.appendChild(fill);
      row.appendChild(track);
      row.appendChild(el('span', 'ep-bar-n', String(d.params[p])));
      bars.appendChild(row);
    }
    box.appendChild(bars);

    var byQid = {};
    for (var i = 0; i < d.outcomes.length; i++) byQid[d.outcomes[i].qid] = d.outcomes[i];
    function recordOf_(qid) {
      for (var j = 0; j < run.records.length; j++) if (run.records[j].qid === qid) return { rec: run.records[j], n: j + 1 };
      return null;
    }
    function group(status) {
      var shapes = [];
      for (var s = 0; s < d.shapes.length; s++) if (d.shapes[s].status === status) shapes.push(d.shapes[s]);
      if (!shapes.length) return;
      box.appendChild(el('div', 'ep-h3', STR.result_group[status]));
      var wrap = el('div', 'ep-shapes');
      wrap.setAttribute('data-group', status);
      for (var k = 0; k < shapes.length; k++) {
        var sh = shapes[k];
        var block = el('div', 'ep-shape');
        block.setAttribute('data-shape', sh.key);
        block.appendChild(shapeHead(key, ch, sh, status));
        for (var m = 0; m < sh.qids.length; m++) (function (qid) {
          var q = Data.question(qid);
          var found = recordOf_(qid);
          var o = byQid[qid] || {};
          var item = el('div', 'ep-shape-item');
          item.setAttribute('data-qid', qid);
          item.setAttribute('data-outcome', o.outcome || 'legacy');
          item.appendChild(el('div', 'ep-outcome', STR.q_label(found.n) + ' — ' + outcomeText(o, q, found.rec)));
          item.appendChild(el('div', 'ep-fix-stem', q.question_en));
          if (!found.rec.correct || o.outcome === 'guessed_right' || o.outcome === 'right_by_wrong_route') {
            var a = el('a', 'btn ep-fix-btn', STR.see_solution);
            a.href = '#/physics/' + key + '/fix/' + encodeURIComponent(qid);
            item.appendChild(a);
          }
          block.appendChild(item);
        })(sh.qids[m]);
        wrap.appendChild(block);
      }
      box.appendChild(wrap);
    }
    group('fix');
    group('check');
    group('solid');

    if (d.sec_per_q !== null) box.appendChild(el('p', 'ep-note', STR.result_timing(Math.round(d.sec_per_q), d.exam_sec_per_q + ' s')));

    // The reward: only now does the student learn the ten were real papers.
    var reveal = el('section', 'ep-reveal');
    reveal.id = 'resultReveal';
    reveal.appendChild(el('div', 'ep-reveal-title', d.score > 0 ? STR.reveal_title_won : STR.reveal_title));
    reveal.appendChild(el('p', 'ep-reveal-body', STR.reveal_body(d.total, d.score)));
    reveal.appendChild(el('div', 'ep-h3', STR.reveal_from));
    var papers = {}, order = [];
    for (var r = 0; r < run.ids.length; r++) {
      var pq = Data.question(run.ids[r]);
      if (!pq) continue;
      var label = String(pq.asked_label || '').replace(/,\s*Q\d+$/, '');
      if (!papers[label]) { papers[label] = []; order.push(label); }
      papers[label].push(pq.q_no);
    }
    for (var w = 0; w < order.length; w++) {
      var line = el('div', 'ep-reveal-paper', STR.reveal_paper(order[w], papers[order[w]]));
      line.setAttribute('data-paper', order[w]);
      reveal.appendChild(line);
    }
    box.appendChild(reveal);

    var again = el('a', 'btn btn-primary ep-again', STR.run_again);
    again.href = '#/physics/' + key;
    again.id = 'btnRunAgain';
    again.onclick = function () {
      // A finished run does not resume; a fresh draw follows. Force the route
      // even when the hash is already the run (same-hash writes do not fire).
      setTimeout(function () { if (location.hash === '#/physics/' + key) route(); }, 0);
    };
    box.appendChild(again);
    Track.log('diag_view', { chapter: key, run_no: run.run_no });
  }

  /** A shape's head row on the result: label, its state pill, and the free
      door to its lesson when the classroom has one. */
  function shapeHead(key, ch, sh, status) {
    var head = el('div', 'ep-shape-head');
    head.appendChild(el('div', 'ep-shape-label', sh.label || ch.name));
    var cs = Run.chapterState(key);
    var state = cs.strong_now && cs.strong_now[sh.key] ? 'strong' : status;
    var pill = el('span', 'ep-mpill', STR.mpill[state] || STR.mpill.none);
    pill.setAttribute('data-state', state);
    head.appendChild(pill);
    var lesson = typeof Study !== 'undefined' ? Study.linkFor(key, sh.key) : null;
    if (lesson) {
      var a = el('a', 'ep-learn-btn', STR.learn_this);
      a.href = '#/physics/learn/' + key + '/' + lesson.sub;
      a.setAttribute('data-sub', lesson.sub);
      a.onclick = function () { Track.log('learn_link', { from: 'shape', shape: sh.key, sub: lesson.sub }); };
      head.appendChild(a);
    }
    return head;
  }

  /** The hub: the three things a student can do with a result. Fix this
      opens the first question of the first shape to fix; Learn this opens
      that shape's lesson (else the chapter's next lesson); Ask opens the
      doubt desk with this chapter in mind. */
  function hub(key, ch, d) {
    var wrap = el('div', 'ep-hub');
    wrap.id = 'resultHub';
    var firstFix = null;
    for (var i = 0; i < d.shapes.length; i++) if (d.shapes[i].status === 'fix') { firstFix = d.shapes[i]; break; }
    function card(kind, href, title, sub, primary) {
      var a = el(href ? 'a' : 'div', 'ep-hub-btn' + (primary ? ' ep-hub-primary' : '') + (href ? '' : ' ep-hub-none'));
      if (href) a.href = href;
      a.setAttribute('data-hub', kind);
      a.appendChild(el('div', 'ep-hub-title', title));
      if (sub) a.appendChild(el('div', 'ep-hub-sub', sub));
      return a;
    }
    if (firstFix) wrap.appendChild(card('fix', '#/physics/' + key + '/fix/' + encodeURIComponent(firstFix.qids[0]), STR.hub_fix, STR.hub_fix_sub(firstFix.label || ch.name), true));
    else wrap.appendChild(card('fix', null, STR.hub_nothing, null, false));
    var lesson = null;
    if (typeof Study !== 'undefined') {
      if (firstFix) lesson = Study.linkFor(key, firstFix.key);
      if (!lesson && LearnData.pack(key)) {
        var p = Study.progress(key);
        if (p.next) lesson = { sub: p.next, title: LearnData.subtopic(key, p.next).subtopic.title };
      }
    }
    if (lesson) {
      var learn = card('learn', '#/physics/learn/' + key + '/' + lesson.sub, STR.hub_learn, STR.hub_learn_sub(lesson.title), false);
      learn.onclick = function () { Track.log('learn_link', { from: 'result', sub: lesson.sub }); };
      wrap.appendChild(learn);
    } else {
      wrap.appendChild(card('learn', null, STR.hub_none, null, false));
    }
    wrap.appendChild(card('ask', '#/physics/solutions/' + key, STR.hub_ask, STR.hub_ask_sub, false));
    return wrap;
  }

  // ── fix: the worked solution (paid) ─────────────────────────────────────
  /** The record of the run's last meeting with this question: what they
      picked and which way they said they went. Null when it was never in a run. */
  function recordOf(key, qid) {
    var cs = Run.chapterState(key);
    for (var i = cs.runs.length - 1; i >= 0; i--)
      for (var j = cs.runs[i].records.length - 1; j >= 0; j--)
        if (cs.runs[i].records[j].qid === qid) return cs.runs[i].records[j];
    return null;
  }

  function lockWall(box, key, qid) {
    Track.log('lock_hit', { from: qid, chapter: key });
    var wall = el('div', 'ep-lock');
    wall.id = 'lockWall';
    wall.appendChild(el('div', 'ep-lock-title', STR.lock_title));
    wall.appendChild(el('p', 'ep-lock-body', STR.lock_body));
    var sku = Gate.price();
    wall.appendChild(el('div', 'ep-lock-price', sku ? STR.lock_price(sku.price_inr, sku.period_days) : STR.lock_price_soon));
    var row = el('div', 'ep-lock-row');
    if (Gate.payable()) {
      row.appendChild(button('btn btn-primary', STR.lock_pay(sku.price_inr), function () {
        startPay(wall, '#/physics/' + key + '/fix/' + encodeURIComponent(qid));
      }));
    } else if (sku) {
      wall.appendChild(el('p', 'ep-note', STR.lock_price_soon));
    }
    var more = el('a', 'btn', STR.unlock_title);
    more.href = '#/unlock';
    row.appendChild(more);
    if (Auth.available() && !Auth.signedIn()) row.appendChild(button('btn', STR.lock_signin, function () { Auth.signIn(); }));
    wall.appendChild(row);
    box.appendChild(wall);
  }

  function startPay(host, returnTo) {
    var note = el('p', 'ep-note', STR.pay_opening);
    host.appendChild(note);
    Gate.startPayment(returnTo, function () { note.textContent = STR.pay_failed; });
  }

  function renderSolution(box, key, q, entry, rec) {
    var sol = entry.solution;
    var cards = entry.grounding || [];
    var picked = rec ? rec.picked : null;
    box.appendChild(el('p', 'ep-fix-key', STR.fix_key(q.answer) + (picked && picked !== q.answer ? ' ' + STR.fix_you_picked(picked) : '')));

    box.appendChild(el('div', 'ep-h3', STR.fix_approach_title));
    box.appendChild(el('p', 'ep-approach', sol.approach));

    box.appendChild(el('div', 'ep-h3', STR.fix_steps_title));
    var steps = el('ol', 'ep-steps');
    for (var i = 0; i < sol.steps.length; i++) (function (st, n) {
      var li = el('li', 'ep-step');
      li.setAttribute('data-step', String(n));
      li.appendChild(el('div', 'ep-step-text', st.text));
      if (st.equation) li.appendChild(el('div', 'ep-step-eq', st.equation));
      if (st.why_this_step) {
        var why = el('div', 'ep-step-why', st.why_this_step);
        why.hidden = true;
        var b = button('ep-why', STR.fix_why, function () {
          why.hidden = !why.hidden;
          Panel.setStep(n);
          Track.log('solution_step', { qid: q.id, step: n });
        });
        li.appendChild(b);
        li.appendChild(why);
      }
      steps.appendChild(li);
    })(sol.steps[i], i + 1);
    box.appendChild(steps);

    var mistakes = sol.common_mistakes || [];
    if (mistakes.length) {
      box.appendChild(el('div', 'ep-h3', STR.fix_mistakes_title));
      // The one that names the option the student picked comes first.
      var ordered = mistakes.slice().sort(function (a, b) {
        return (b.option === picked ? 1 : 0) - (a.option === picked ? 1 : 0);
      });
      var ul = el('div', 'ep-mistakes');
      for (var m = 0; m < ordered.length; m++) {
        var mk = ordered[m];
        var mine = picked && mk.option === picked && picked !== q.answer;
        var item = el('div', 'ep-mistake' + (mine ? ' ep-mistake-mine' : ''));
        if (mine) item.appendChild(el('div', 'ep-mistake-tag', STR.fix_your_mistake));
        item.appendChild(el('div', 'ep-mistake-text', mk.text));
        if (mk.option) item.appendChild(el('div', 'ep-mistake-opt', STR.fix_mistake_option(mk.option)));
        ul.appendChild(item);
      }
      box.appendChild(ul);
    }

    if (cards.length) {
      box.appendChild(el('div', 'ep-h3', STR.fix_cards_title));
      var cl = el('div', 'ep-cards');
      for (var c = 0; c < cards.length; c++) {
        var cd = el('div', 'ep-gcard');
        cd.appendChild(el('div', 'ep-gcard-title', cards[c].title));
        cd.appendChild(el('div', 'ep-gcard-text', cards[c].text));
        cl.appendChild(cd);
      }
      box.appendChild(cl);
    }

    // The sibling retry: a question of the same shape when one is unseen,
    // in this panel, counted toward "strong now" for this question's shape.
    var shapeKey = Data.shapeKey(q);
    var retryBox = el('div', 'ep-retry');
    retryBox.id = 'retryBox';
    var tryBtn = button('btn btn-primary ep-try', STR.fix_try_again, function () { sibling(retryBox, key, q.id, shapeKey); });
    retryBox.appendChild(tryBtn);
    box.appendChild(retryBox);

    var cs = Run.chapterState(key);
    var last = Run.lastFinished(key);
    var dg = last ? Run.diagnosisOf(last) : null;
    var solid = [], weak = [];
    for (var s = 0; dg && s < dg.shapes.length; s++) {
      if (dg.shapes[s].status === 'solid') solid.push(dg.shapes[s].key);
      if (dg.shapes[s].status === 'fix') weak.push(dg.shapes[s].key);
    }
    Panel.mount(box, {
      chapterKey: key, qid: q.id, key: q.answer, picked: picked, route: rec ? rec.route : null,
      solid_shapes: solid, weak_shapes: weak,
      streak: cs.streak[shapeKey] || 0, steps: sol.steps.length
    });
  }

  function sibling(host, key, fromQid, shapeKey) {
    clear(host);
    var ch = Data.chapter(key);
    var sib = Data.sibling(fromQid, ch, Run.seenIds(key));
    if (!sib) { host.appendChild(el('p', 'ep-note', STR.fix_sibling_none)); return; }
    var q = Data.question(sib.qid);
    host.appendChild(el('p', 'ep-note', sib.same_shape ? STR.fix_sibling_head_same : STR.fix_sibling_head));
    var shownAt = Date.now();
    var card = questionCard(q, null, function (card_, n) {
      var correct = n === q.answer;
      markPicked(card_, n);
      var ms = Date.now() - shownAt;
      var after = el('div', 'ep-retry-after');
      host.appendChild(after);
      function settle(routeId) {
        revealKey(card_, q, n, correct);
        after.appendChild(el('p', 'ep-note', correct ? STR.correct : STR.wrong(n, q.answer)));
        var streak = Run.retry(key, fromQid, shapeKey, q.id, n, correct, routeId, ms, sib.same_shape);
        var cs = Run.chapterState(key);
        var msg;
        if (routeId === 'guess') msg = STR.fix_streak_none;
        else if (cs.strong_now[shapeKey] && streak >= Diag.STRONG_AT) msg = strongText(ch, shapeKey, Run.sameShape(key, shapeKey), true);
        else if (streak > 0) msg = STR.fix_streak(streak, Diag.STRONG_AT);
        else msg = STR.fix_streak_reset;
        var note = el('p', 'ep-verdict', msg);
        note.id = 'retryVerdict';
        after.appendChild(note);
        var row = el('div', 'ep-lock-row');
        var link = el('a', 'btn', STR.fix_sibling_solution);
        link.href = '#/physics/' + key + '/fix/' + encodeURIComponent(q.id);
        row.appendChild(link);
        row.appendChild(button('btn', STR.fix_try_another, function () { sibling(host, key, fromQid, shapeKey); }));
        after.appendChild(row);
      }
      after.appendChild(el('p', 'ep-note', routePrompt(q)));
      var row = el('div', 'ep-chips ep-chips-inline');
      var ids = Run.routesOf(q);
      for (var i = 0; i < ids.length; i++) (function (id) {
        var b = button('ep-chip', routeLabel(q, id), function () { clear(row); settle(id); });
        b.setAttribute('data-route', id);
        row.appendChild(b);
      })(ids[i]);
      after.appendChild(row);
    }, { onTyped: function () { shownAt = Date.now(); } });
    host.appendChild(card);
    card.scrollIntoView({ block: 'end' });
    Track.log('retry_start', { qid: q.id, from_qid: fromQid, shape_key: shapeKey, same_shape: sib.same_shape });
  }

  function showFix(key, qid) {
    var q = Data.question(qid);
    if (!q) { location.hash = '#/physics/' + key + '/result'; return; }
    showView('fixView');
    // Opened from the doubt desk, Back returns there; otherwise to the result.
    var fromSol = typeof Nav !== 'undefined' && Nav.fromSolutions();
    setBack(fromSol ? '#/physics/solutions/' + key : '#/physics/' + key + '/result', fromSol ? STR.back_solutions : STR.result_title);
    var box = $('fixBody');
    clear(box);
    box.appendChild(el('div', 'ep-asked', q.asked_label));
    box.appendChild(el('div', 'ep-stem', q.question_en));
    var opts = el('div', 'ep-fix-opts');
    for (var n = 1; n <= 4; n++) opts.appendChild(el('div', 'ep-fix-opt' + (n === q.answer ? ' right' : ''), STR.option_label(n) + ' ' + q.options_en[n - 1]));
    box.appendChild(opts);
    // The free door to the classroom, when a lesson covers this question's shape.
    var lesson = typeof Study !== 'undefined' ? Study.linkFor(key, Data.shapeKey(q)) : null;
    if (lesson) {
      var learnRow = el('div', 'ep-fix-learn');
      var learnLink = el('a', 'ep-learn-btn', STR.fix_learn_first);
      learnLink.href = '#/physics/learn/' + key + '/' + lesson.sub;
      learnLink.onclick = function () { Track.log('learn_link', { from: 'fix', qid: qid, sub: lesson.sub }); };
      learnRow.appendChild(learnLink);
      box.appendChild(learnRow);
    }
    var rec = recordOf(key, qid);
    Track.log('fix_open', { qid: qid, built: Sync.on(), locked: Gate.locked() });

    if (!Sync.on()) { box.appendChild(el('p', 'ep-note', STR.fix_not_built)); return; }
    if (Gate.known() && Gate.locked()) { lockWall(box, key, qid); return; }

    // Not known yet (a cold open straight to a fix route), or unlocked: ask.
    // The server refuses a locked device the bundle, so this branch can never
    // put a solution byte in front of one.
    var wait = el('div');
    wait.appendChild(el('p', 'ep-note', STR.fix_loading));
    wait.appendChild(el('div', 'ep-skel'));
    wait.appendChild(el('div', 'ep-skel'));
    wait.appendChild(el('div', 'ep-skel ep-skel-short'));
    box.appendChild(wait);
    Sync.bundle(key, function (out) {
      // The student left this page (the router cleared it) or opened another
      // question: nothing here may be appended to what is on screen now.
      if (!box.contains(wait)) return;
      box.removeChild(wait);
      if (!out) { box.appendChild(el('p', 'ep-note', STR.fix_offline)); box.appendChild(button('btn', STR.try_again, function () { showFix(key, qid); })); return; }
      if (out.locked) { Gate.refresh(); lockWall(box, key, qid); return; }
      var entry = out.solutions && out.solutions[qid];
      if (!entry || !entry.solution) { box.appendChild(el('p', 'ep-note', STR.fix_missing)); return; }
      renderSolution(box, key, q, entry, rec);
    });
  }

  // ── unlock: the plan, the price, sign-in ───────────────────────────────
  function showUnlock() {
    showView('unlockView');
    setBack('#/physics', STR.back_chapters);
    var box = $('unlockBody');
    clear(box);
    box.appendChild(el('h2', 'ep-h2', STR.unlock_title));
    box.appendChild(el('div', 'ep-h3', STR.unlock_includes_title));
    var ul = el('ul', 'ep-includes');
    for (var i = 0; i < STR.unlock_includes.length; i++) ul.appendChild(el('li', null, STR.unlock_includes[i]));
    box.appendChild(ul);
    box.appendChild(el('p', 'ep-note', STR.unlock_free_line));
    var status = el('div', 'ep-unlock-status');
    box.appendChild(status);
    var row = el('div', 'ep-lock-row');
    box.appendChild(row);

    function paint() {
      clear(status); clear(row);
      var sku = Gate.price();
      var st = Gate.standing();
      if (st && st.unlocked) {
        status.appendChild(el('p', 'ep-verdict', st.paid_until
          ? STR.unlock_paid_until(String(st.paid_until).slice(0, 10))
          : STR.unlock_paid_open));
      } else {
        status.appendChild(el('div', 'ep-lock-price', sku ? STR.lock_price(sku.price_inr, sku.period_days) : STR.lock_price_soon));
        if (Gate.payable()) row.appendChild(button('btn btn-primary', STR.lock_pay(sku.price_inr), function () { startPay(box, '#/physics'); }));
        else if (sku) status.appendChild(el('p', 'ep-note', STR.lock_price_soon));
      }
      if (Auth.available()) {
        status.appendChild(el('p', 'ep-note', Auth.signedIn() ? STR.unlock_signed_in(Auth.email() || '') : STR.unlock_signin_note));
        row.appendChild(Auth.signedIn()
          ? button('btn', STR.unlock_signout, function () { Auth.signOut(); Sync.forget(); location.reload(); })
          : button('btn', STR.unlock_signin, function () { Auth.signIn(); }));
      }
      var back = el('a', 'btn', STR.unlock_back);
      back.href = '#/physics';
      row.appendChild(back);
    }
    paint();
    if (Gate.on() && !Gate.known()) Gate.refresh(function () { paint(); });
    if (Auth.signedIn() && !Auth.email()) Auth.loadProfile(function () { paint(); });
  }

  // ── team marking ────────────────────────────────────────────────────────
  function showTeamMark(word, off) {
    var ok = (window.EP_STAFF_WORD || '') && word === window.EP_STAFF_WORD;
    if (ok) Track.markInternal(!off);
    showView('doorView');
    setBack(null);
    var note = $('doorNote');
    note.hidden = !ok;
    note.textContent = ok ? (off ? STR.team_unmarked : STR.team_marked) : '';
  }

  // ── router ──────────────────────────────────────────────────────────────
  function route() {
    var h = location.hash || '#/';
    var ns = h.match(/^#\/notastudent\/([^\/]+)(?:\/(off))?$/);
    if (ns) { showTeamMark(decodeURIComponent(ns[1]), !!ns[2]); return; }
    if (h === '#/' || h === '#') { showDoor(); return; }
    if (h === '#/physics') { showChapters(); return; }
    if (h === '#/physics/weakness') { location.hash = '#/physics'; return; }
    if (h === '#/unlock') { showUnlock(); return; }
    var ln = h.match(/^#\/physics\/learn(?:\/(p[12]-\d{2})(?:\/([a-z0-9_]{1,50}))?)?$/);
    if (ln) {
      if (!ln[1]) { LearnScreens.list(); return; }
      if (!Data.chapter(ln[1])) { location.hash = '#/physics/learn'; return; }
      if (ln[2]) LearnScreens.subtopic(ln[1], ln[2]); else LearnScreens.chapter(ln[1]);
      return;
    }
    var so = h.match(/^#\/physics\/solutions(?:\/(p[12]-\d{2}))?$/);
    if (so) { Solutions.show(so[1] && Data.chapter(so[1]) ? so[1] : null); return; }
    var m = h.match(/^#\/physics\/(p[12]-\d{2})(?:\/(result|fix)(?:\/([^\/]+))?)?$/);
    if (!m) { location.hash = '#/'; return; }
    if (!Data.chapter(m[1])) { location.hash = '#/physics'; return; }
    if (m[2] === 'result') { showResult(m[1]); return; }
    if (m[2] === 'fix') { showFix(m[1], decodeURIComponent(m[3] || '')); return; }
    showRun(m[1]);
  }

  /* The pieces the learn and solutions screens reuse, so a thread there looks
   * and behaves exactly like the run's. */
  var ui = {
    say: say, setChips: setChips, questionCard: questionCard, markPicked: markPicked, revealKey: revealKey,
    routeChips: routeChips, routeLabel: routeLabel, routePrompt: routePrompt, routeOfOption: routeOfOption,
    outcomeText: outcomeText, button: button, clear: clear, setBack: setBack, showView: showView,
    onLeave: onLeave, strongText: strongText
  };

  return { route: route, showView: showView, ui: ui };
})();
var route = Screens.route;
