/* LearnScreens — the classroom: the chapter list, a chapter's topics and
 * lessons, and one lesson as a thread that looks and behaves like the run
 * (Screens.ui: the same say / chips / question card / route chips).
 *
 *   #/physics/learn              chapters with lessons, in pool order
 *   #/physics/learn/<ck>         topics → lesson rows with state and tags
 *   #/physics/learn/<ck>/<sub>   the lesson: card → check → three practice
 *                                questions by the right route → feel
 *
 * Renders from LearnData / Study / Learn only. Nothing here decides a
 * result; the mark of a lesson is Learn.passStatus over what Study saved.
 * The words "ready", "exam ready" and "mastered" never appear. */
var LearnScreens = (function () {
  var ui = Screens.ui;

  function pill(state) {
    var p = el('span', 'ep-mpill', STR.learn_pill[state] || STR.learn_pill.none);
    p.setAttribute('data-state', state);
    return p;
  }
  function emptyPage(box, text, href) {
    var empty = el('div', 'ep-empty');
    empty.appendChild(el('p', null, text));
    var row = el('div', 'ep-chips');
    var go = el('a', 'ep-chip', STR.learn_open_weakness);
    go.href = href;
    row.appendChild(go);
    empty.appendChild(row);
    box.appendChild(empty);
  }

  // ── the chapter list ────────────────────────────────────────────────────
  function list() {
    ui.showView('learnView');
    ui.setBack('#/', STR.back_subjects);
    var box = $('learnBody');
    ui.clear(box);
    box.appendChild(el('p', 'ep-eyebrow', STR.eyebrow_physics));
    box.appendChild(el('h1', 'ep-h1', STR.learn_title));
    box.appendChild(el('p', 'ep-sub', STR.learn_sub));
    if (!LearnData.on()) {
      emptyPage(box, STR.learn_empty, '#/physics');
      Track.log('learn_list', { packs: 0 });
      return;
    }
    if (LearnData.anyUnreviewed()) box.appendChild(el('div', 'ep-sample', STR.learn_sample));
    var wrap = el('div', 'ep-chapters');
    var chapters = Data.chapters();
    for (var i = 0; i < chapters.length; i++) (function (ch) {
      var has = !!LearnData.pack(ch.key);
      var row = el(has ? 'a' : 'div', 'ep-row' + (has ? '' : ' ep-row-closed'));
      if (has) row.href = '#/physics/learn/' + ch.key;
      row.setAttribute('data-chapter', ch.key);
      var main = el('div', 'ep-row-main');
      main.appendChild(el('div', 'ep-row-name', ch.name));
      main.appendChild(el('div', 'ep-row-share', STR.share_line(ch.share_pct, ch.per_exam)));
      row.appendChild(main);
      if (has) {
        var p = Study.progress(ch.key);
        var all = p.total > 0 && p.done === p.total;
        row.appendChild(el('span', 'ep-badge' + (all ? ' ep-badge-strong' : ''), p.done ? STR.learn_badge_done(p.done, p.total) : STR.learn_badge_none));
      } else {
        row.appendChild(el('span', 'ep-badge ep-badge-closed', STR.learn_no_pack));
      }
      wrap.appendChild(row);
    })(chapters[i]);
    box.appendChild(wrap);
    Track.log('learn_list', { packs: LearnData.chapters().length });
  }

  // ── one chapter: topics and lessons ─────────────────────────────────────
  function chapter(ck) {
    var ch = Data.chapter(ck);
    var pack = LearnData.pack(ck);
    ui.showView('learnView');
    ui.setBack('#/physics/learn', STR.back_lessons);
    var box = $('learnBody');
    ui.clear(box);
    box.appendChild(el('p', 'ep-eyebrow', STR.eyebrow_physics));
    box.appendChild(el('h1', 'ep-h1', ch.name));
    if (!pack) {
      emptyPage(box, STR.hub_none, '#/physics/' + ck);
      Track.log('learn_chapter', { chapter: ck, packs: 0 });
      return;
    }
    if (!pack.reviewed) box.appendChild(el('div', 'ep-sample', STR.learn_sample));
    var p = Study.progress(ck);
    var bar = el('div', 'ep-pbar');
    var fill = el('span', 'ep-pbar-fill');
    fill.style.width = (p.total ? Math.round(100 * p.done / p.total) : 0) + '%';
    bar.appendChild(fill);
    box.appendChild(bar);
    var line = el('p', 'ep-pline', STR.learn_progress(p.done, p.total));
    line.id = 'learnProgress';
    box.appendChild(line);
    var fixing = Study.fixShapes(ck);
    var links = LearnData.links(ck);
    function toFix(sub) {
      for (var i = 0; i < fixing.length; i++) if ((links[fixing[i]] || []).indexOf(sub.key) >= 0) return true;
      return false;
    }
    for (var t = 0; t < pack.topics.length; t++) {
      var topic = pack.topics[t];
      box.appendChild(el('div', 'ep-h3', STR.learn_topic(t + 1, topic.title)));
      var wrap = el('div', 'ep-subs');
      for (var s = 0; s < topic.subtopics.length; s++) (function (sub) {
        var state = Study.stateOf(sub.key);
        var row = el('a', 'ep-sub-row');
        row.href = '#/physics/learn/' + ck + '/' + sub.key;
        row.setAttribute('data-sub', sub.key);
        row.setAttribute('data-state', state);
        row.appendChild(el('span', 'ep-dot'));
        var main = el('div', 'ep-sub-main');
        main.appendChild(el('div', 'ep-sub-title', sub.title));
        var tags = el('div', 'ep-sub-tags');
        if (sub.key === p.next) tags.appendChild(el('span', 'ep-tag ep-tag-next', STR.learn_tag_next));
        if (toFix(sub)) tags.appendChild(el('span', 'ep-tag ep-tag-fix', STR.learn_tag_fix));
        if (tags.firstChild) main.appendChild(tags);
        row.appendChild(main);
        row.appendChild(pill(state));
        wrap.appendChild(row);
      })(topic.subtopics[s]);
      box.appendChild(wrap);
    }
    Track.log('learn_chapter', { chapter: ck, done: p.done, total: p.total });
  }

  // ── one lesson, as a thread ─────────────────────────────────────────────
  var thread, chips, ctx;     // ctx: { ck, sub, entry (LearnData.subtopic) }
  var shownAt = 0;

  function say(text, who) { return ui.say(text, who, thread); }
  function setChips(list) { ui.setChips(list, chips); }
  function chip(label, value, fn) { return { label: label, value: value, onTap: fn }; }
  function go(hash) { return function () { location.hash = hash; }; }
  function setPill(state) {
    var old = $('subPill');
    if (!old) return;
    var p = pill(state);
    p.id = 'subPill';
    old.parentNode.replaceChild(p, old);
  }

  function conceptCard(s) {
    var c = s.concept;
    var card = el('div', 'ep-concept');
    card.id = 'conceptCard';
    var lines = el('div', 'ep-concept-lines');
    for (var i = 0; i < c.lines.length; i++) lines.appendChild(el('p', null, c.lines[i]));
    card.appendChild(lines);
    card.appendChild(el('div', 'ep-eyebrow', STR.learn_formula_title));
    card.appendChild(el('div', 'ep-concept-formula', c.formula.text));
    card.appendChild(el('p', 'ep-concept-meaning', c.formula.meaning));
    card.appendChild(el('div', 'ep-eyebrow', STR.learn_example_title));
    card.appendChild(el('p', 'ep-concept-given', c.example.given));
    var steps = el('ol', 'ep-steps');
    for (var k = 0; k < c.example.steps.length; k++) {
      var li = el('li', 'ep-step');
      li.appendChild(el('div', 'ep-step-text', c.example.steps[k].text));
      if (c.example.steps[k].equation) li.appendChild(el('div', 'ep-step-eq', c.example.steps[k].equation));
      steps.appendChild(li);
    }
    card.appendChild(steps);
    card.appendChild(el('p', 'ep-concept-answer', STR.learn_answer(c.example.answer)));
    return card;
  }

  function cardChips() {
    var st = Study.state(ctx.sub);
    var checked = !!(st && st.check);
    setChips(checked
      ? [chip(STR.learn_chip_apply, 'apply', startApply), chip(STR.learn_chip_reread, 'reread', showCard)]
      : [chip(STR.learn_chip_check, 'check', showCheck)]);
  }
  function showCard() {
    say(STR.learn_read);
    var card = conceptCard(ctx.entry.subtopic);
    thread.appendChild(card);
    cardChips();
    // The card is read from its top; the chip row stays in view, being sticky.
    card.scrollIntoView({ block: 'start' });
  }

  /** The check: one belief question, statements for options, no route menu, never a gate. */
  function checkCard(s, onPick_) {
    var c = s.check;
    var card = el('div', 'ep-card ep-check');
    card.id = 'checkCard';
    card.appendChild(el('div', 'ep-progress', STR.learn_check_head));
    card.appendChild(el('div', 'ep-stem', c.stem));
    var opts = el('div', 'ep-opts');
    for (var n = 1; n <= c.options.length; n++) (function (n) {
      var b = el('button', 'ep-opt');
      b.type = 'button';
      b.setAttribute('data-option', String(n));
      b.appendChild(el('span', 'ep-opt-n', STR.option_label(n)));
      b.appendChild(el('span', 'ep-opt-t', c.options[n - 1]));
      b.onclick = function () { onPick_(card, n); };
      opts.appendChild(b);
    })(n);
    card.appendChild(opts);
    return card;
  }
  function settleCheck(card, s, picked) {
    var c = s.check;
    var buttons = card.querySelectorAll('.ep-opt');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].disabled = true;
      var k = Number(buttons[i].getAttribute('data-option'));
      if (k === c.answer) buttons[i].classList.add('right');
      if (k === picked && picked !== c.answer) buttons[i].classList.add('wrong');
    }
    var right = picked === c.answer;
    var why = el('div', 'ep-check-why', right ? STR.learn_check_right + ' ' + c.why_right
                                              : STR.learn_check_wrong + ' ' + (c.why_wrong[String(picked)] || c.why_right));
    why.id = 'checkWhy';
    card.appendChild(why);
  }
  function showCheck() {
    var s = ctx.entry.subtopic;
    setChips([]);
    var card = checkCard(s, function (card_, n) {
      Study.check(ctx.ck, ctx.sub, n);
      settleCheck(card_, s, n);
      setPill(Study.stateOf(ctx.sub));
      cardChips();
    });
    thread.appendChild(card);
    card.scrollIntoView({ block: 'end' });
  }

  // ── the three practice questions ────────────────────────────────────────
  function askApply(slot) {
    var q = Study.variant(ctx.ck, ctx.sub, slot);
    var card = ui.questionCard(q, STR.learn_apply_progress(slot + 1), onPick);
    thread.appendChild(card);
    card.scrollIntoView({ block: 'end' });
    shownAt = Date.now();
  }
  function onPick(card, n) {
    var qid = card.getAttribute('data-qid');
    var q = LearnData.question(qid);
    var rec = Study.pick(ctx.ck, ctx.sub, qid, n, Date.now() - shownAt);
    ui.markPicked(card, q, n, rec.correct);
    say((rec.correct ? STR.correct : STR.wrong(n, q.answer)) + ' ' + ui.routePrompt(q));
    setChips(ui.routeChips(q, onRoute));
  }
  function onRoute(id) {
    var st = Study.state(ctx.sub);
    var recs = st.pass.records;
    var rec = recs[recs.length - 1];
    var q = LearnData.question(rec.qid);
    var r = Study.route(ctx.ck, ctx.sub, id);
    say(ui.routeLabel(q, id), 'student');
    setChips([]);
    setPill(Study.stateOf(ctx.sub));
    if (r.ended === 'green') { showGreen(); return; }
    if (r.ended === 'ended') { showEnded(q, rec, r.outcome); return; }
    askApply(r.status.i);
  }
  function startApply() {
    setChips([]);
    say(STR.learn_apply_intro);
    Study.startPass(ctx.ck, ctx.sub);
    setPill(Study.stateOf(ctx.sub));
    askApply(0);
  }
  function retryApply() {
    setChips([]);
    Study.startPass(ctx.ck, ctx.sub);
    askApply(0);
  }

  /** The pass ended: the outcome line, the pack's fix for the option (free), the chips. */
  function showEnded(q, rec, o) {
    if (o.outcome === 'guessed_right') say(STR.learn_guess_reset);
    else if (o.outcome === 'right_by_wrong_route') say(STR.learn_wrong_route_reset);
    else {
      say(ui.outcomeText(o, q, rec));
      var fixText = (q.fixes || {})[String(rec.picked)];
      if (fixText) {
        var card = el('div', 'ep-lfix');
        card.appendChild(el('div', 'ep-eyebrow', STR.learn_fix_title));
        card.appendChild(el('div', 'ep-lfix-text', fixText));
        thread.appendChild(card);
        card.scrollIntoView({ block: 'end' });
      }
      say(STR.learn_wrong_reset);
    }
    setChips([chip(STR.learn_chip_retry, 'retry', retryApply), chip(STR.learn_chip_reread, 'reread', showCard),
              chip(STR.learn_chip_all, 'all', go('#/physics/learn/' + ctx.ck))]);
  }

  function greenCard(again) {
    var card = el('div', 'ep-green');
    card.id = 'greenCard';
    card.appendChild(el('div', 'ep-green-title', again ? STR.learn_green_again : STR.learn_green_title));
    card.appendChild(el('p', 'ep-green-body', STR.learn_green_body));
    return card;
  }
  function showGreen() {
    var st = Study.state(ctx.sub);
    var greens = 0;
    for (var i = 0; i < st.passes.length; i++) if (st.passes[i].outcome === 'green') greens++;
    var card = greenCard(greens > 1);
    thread.appendChild(card);
    card.scrollIntoView({ block: 'end' });
    setPill('green');
    say(STR.learn_feel_q);
    setChips([chip(STR.learn_feel_confident, 'confident', function () { feel('confident'); }),
              chip(STR.learn_feel_not_yet, 'not_yet', function () { feel('not_yet'); })]);
  }
  function feel(v) {
    Study.feel(ctx.ck, ctx.sub, v);
    say(v === 'confident' ? STR.learn_feel_confident : STR.learn_feel_not_yet, 'student');
    say(STR.learn_feel_done);
    finalChips();
  }
  function finalChips() {
    var list = [];
    var next = Study.next(ctx.ck, ctx.sub);
    if (next) list.push(chip(STR.learn_chip_next, 'next', go('#/physics/learn/' + ctx.ck + '/' + next)));
    list.push(chip(STR.learn_chip_test, 'test', go('#/physics/' + ctx.ck)));
    list.push(chip(STR.learn_chip_all, 'all', go('#/physics/learn/' + ctx.ck)));
    setChips(list);
  }

  /** Open a lesson: the stored check replayed as answered, then the live pass
      (resumed at the owed route or the next card), else the card. */
  function subtopic(ck, sub) {
    var entry = LearnData.subtopic(ck, sub);
    if (!entry) {
      location.hash = '#/physics/learn/' + ck;
      if (typeof Nav !== 'undefined') Nav.toast(STR.learn_unknown);
      return;
    }
    var pack = LearnData.pack(ck);
    var ch = Data.chapter(ck);
    ctx = { ck: ck, sub: sub, entry: entry };
    ui.showView('subtopicView');
    ui.setBack('#/physics/learn/' + ck, ch.name);
    var head = $('subBody');
    ui.clear(head);
    head.appendChild(el('p', 'ep-eyebrow', STR.learn_topic(entry.ti + 1, entry.topic.title)));
    head.appendChild(el('h1', 'ep-h1 ep-h1-run', entry.subtopic.title));
    var row = el('div', 'ep-sub-head');
    if (!pack.reviewed) row.appendChild(el('span', 'ep-sample-tag', STR.learn_sample_tag));
    var p = pill(Study.stateOf(sub));
    p.id = 'subPill';
    row.appendChild(p);
    head.appendChild(row);
    thread = $('learnThread');
    chips = $('learnChips');
    ui.clear(thread);
    setChips([]);
    var st = Study.open(ck, sub);
    var s = entry.subtopic;

    if (!st.check) { showCard(); return; }
    say(STR.learn_read);
    thread.appendChild(conceptCard(s));
    var card = checkCard(s, function () {});
    settleCheck(card, s, st.check.picked);
    thread.appendChild(card);

    if (st.pass && st.pass.records.length) {
      var status = Study.status(ck, sub);
      say(STR.learn_resume);
      for (var i = 0; i < st.pass.records.length; i++) {
        var rec = st.pass.records[i];
        var q = LearnData.question(rec.qid);
        var qc = ui.questionCard(q, STR.learn_apply_progress(i + 1), function () {});
        ui.markPicked(qc, q, rec.picked, rec.correct);
        thread.appendChild(qc);
        if (rec.route) say(ui.routeLabel(q, rec.route), 'student');
      }
      if (status.owed) {
        var owed = st.pass.records[st.pass.records.length - 1];
        var oq = LearnData.question(owed.qid);
        say((owed.correct ? STR.correct : STR.wrong(owed.picked, oq.answer)) + ' ' + ui.routePrompt(oq));
        setChips(ui.routeChips(oq, onRoute));
      } else {
        askApply(status.i);
      }
      return;
    }
    if (st.green_at) thread.appendChild(greenCard(false));
    cardChips();
  }

  return { list: list, chapter: chapter, subtopic: subtopic };
})();
