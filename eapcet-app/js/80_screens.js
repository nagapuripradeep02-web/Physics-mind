/* Screens — the hash router and every view. Renders from Data/Run/Diag only;
 * nothing here decides physics, scores or diagnosis.
 *
 *   #/                       subject door
 *   #/physics                chapter list
 *   #/physics/<key>          the run, as a thread
 *   #/physics/<key>/result   the diagnosis
 *   #/physics/<key>/fix/<id> the worked solution (paid: the lock wall for a locked device)
 *   #/unlock                 the plan, the price, sign-in, pay
 *   #/notastudent/<word>[/off]  team marking */
var Screens = (function () {
  var VIEWS = ['doorView', 'chaptersView', 'runView', 'resultView', 'fixView', 'unlockView'];
  var currentView = null;

  function showView(id) {
    for (var i = 0; i < VIEWS.length; i++) $(VIEWS[i]).hidden = VIEWS[i] !== id;
    currentView = id;
    window.scrollTo(0, 0);
  }
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
  function badgeNode(ch) {
    var never = ch.closed_because && /asked once/i.test(ch.closed_because);
    if (never) return el('span', 'ep-badge ep-badge-closed', STR.badge_never);
    if (!Data.canRun(ch)) return el('span', 'ep-badge ep-badge-closed', STR.badge_closed);
    var b = Run.badge(ch.key);
    if (b.kind === 'strong') return el('span', 'ep-badge ep-badge-strong', STR.badge_strong(b.type));
    if (b.kind === 'weak') return el('span', 'ep-badge ep-badge-weak', STR.badge_weak(b.type, b.score, b.total));
    if (b.kind === 'score') return el('span', 'ep-badge ep-badge-score', STR.badge_score(b.score, b.total));
    return el('span', 'ep-badge', STR.badge_untested);
  }
  function showChapters() {
    showView('chaptersView');
    setBack('#/', STR.back_subjects);
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
      row.appendChild(main);
      row.appendChild(badgeNode(ch));
      list.appendChild(row);
    })(chapters[i]);
    Track.log('subject_pick', { subject: 'physics' });
  }

  // ── the run, as a thread ────────────────────────────────────────────────
  var thread, chips;
  function say(text, who) {
    var m = el('div', 'ep-msg ' + (who || 'tutor'), text);
    thread.appendChild(m);
    m.scrollIntoView({ block: 'end' });
    return m;
  }
  function setChips(list) {
    clear(chips);
    for (var i = 0; i < list.length; i++) (function (c) {
      var b = el('button', 'ep-chip', c.label);
      b.type = 'button';
      b.setAttribute('data-probe', c.value);
      b.onclick = function () { c.onTap(); };
      chips.appendChild(b);
    })(list[i]);
    chips.hidden = !list.length;
  }
  function correctChips(onProbe_) {
    return [
      { label: STR.probe_sure, value: 'sure', onTap: function () { onProbe_('sure'); } },
      { label: STR.probe_guessed, value: 'guessed', onTap: function () { onProbe_('guessed'); } }
    ];
  }
  function wrongChips(onProbe_) {
    return [
      { label: STR.probe_concept, value: 'concept', onTap: function () { onProbe_('concept'); } },
      { label: STR.probe_calculation, value: 'calculation', onTap: function () { onProbe_('calculation'); } },
      { label: STR.probe_application, value: 'application', onTap: function () { onProbe_('application'); } },
      { label: STR.probe_time, value: 'time', onTap: function () { onProbe_('time'); } }
    ];
  }

  /** A question card: asked label, stem, four option buttons. onPick(card, n). */
  function questionCard(q, progressText, onPick_) {
    var card = el('div', 'ep-card');
    card.setAttribute('data-qid', q.id);
    if (progressText) card.appendChild(el('div', 'ep-progress', progressText));
    card.appendChild(el('div', 'ep-asked', q.asked_label));
    card.appendChild(el('div', 'ep-stem', q.question_en));
    var opts = el('div', 'ep-opts');
    for (var n = 1; n <= 4; n++) (function (n) {
      var b = el('button', 'ep-opt');
      b.type = 'button';
      b.setAttribute('data-option', String(n));
      b.appendChild(el('span', 'ep-opt-n', STR.option_label(n)));
      b.appendChild(el('span', 'ep-opt-t', q.options_en[n - 1]));
      b.onclick = function () { onPick_(card, n); };
      opts.appendChild(b);
    })(n);
    card.appendChild(opts);
    return card;
  }
  function markPicked(card, q, n, correct) {
    var buttons = card.querySelectorAll('.ep-opt');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].disabled = true;
      var k = Number(buttons[i].getAttribute('data-option'));
      if (k === q.answer) buttons[i].classList.add('right');
      if (k === n && !correct) buttons[i].classList.add('wrong');
      if (k === n) buttons[i].classList.add('picked');
    }
  }

  function askCard() {
    var cur = Run.current();
    var q = Run.question();
    var card = questionCard(q, STR.run_progress(cur.i + 1, Run.total()), onPick);
    thread.appendChild(card);
    card.scrollIntoView({ block: 'end' });
    Run.shown();
    Track.log('q_show', { qid: q.id, i: cur.i + 1 });
  }

  function onPick(card, n) {
    var q = Run.question();
    var rec = Run.pick(n);
    if (!rec) return;
    markPicked(card, q, n, rec.correct);
    if (rec.correct) {
      say(STR.correct + ' ' + STR.probe_correct_q);
      setChips(correctChips(onProbe));
    } else {
      say(STR.wrong(n, q.answer) + ' ' + STR.probe_wrong_q);
      setChips(wrongChips(onProbe));
    }
  }

  function onProbe(type) {
    var label = ({ sure: STR.probe_sure, guessed: STR.probe_guessed, concept: STR.probe_concept,
                   calculation: STR.probe_calculation, application: STR.probe_application, time: STR.probe_time })[type];
    say(label, 'student');
    setChips([]);
    var phase = Run.probe(type);
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
    if (cur.phase === 'probing') {
      // The tap was saved; the probe was not. Re-ask the probe for that record.
      var rec = cur.run.records[cur.run.records.length - 1];
      var q = Data.question(rec.qid);
      var card = el('div', 'ep-card');
      card.appendChild(el('div', 'ep-progress', STR.run_progress(cur.i + 1, Run.total())));
      card.appendChild(el('div', 'ep-asked', q.asked_label));
      card.appendChild(el('div', 'ep-stem', q.question_en));
      thread.appendChild(card);
      if (rec.correct) {
        say(STR.correct + ' ' + STR.probe_correct_q);
        setChips(correctChips(onProbe));
      } else {
        say(STR.wrong(rec.picked, q.answer) + ' ' + STR.probe_wrong_q);
        setChips(wrongChips(onProbe));
      }
    } else {
      askCard();
    }
  }

  // ── result ──────────────────────────────────────────────────────────────
  function showResult(key) {
    var ch = Data.chapter(key);
    var run = ch && Run.lastFinished(key);
    if (!run) { location.hash = '#/physics/' + key; return; }
    var d = run.diagnosis;
    showView('resultView');
    setBack('#/physics', STR.back_chapters);
    var box = $('resultBody');
    clear(box);
    box.appendChild(el('h2', 'ep-h2', ch.name));
    box.appendChild(el('div', 'ep-score', STR.result_score(d.score, d.total)));
    if (d.guessed_right) box.appendChild(el('div', 'ep-note', STR.result_guessed(d.guessed_right)));

    if (d.total - d.score > 0) {
      box.appendChild(el('div', 'ep-h3', STR.result_hist_title));
      var bars = el('div', 'ep-bars');
      var max = 1;
      for (var t = 0; t < Diag.WRONG_TYPES.length; t++) max = Math.max(max, d.hist[Diag.WRONG_TYPES[t]]);
      for (var u = 0; u < Diag.WRONG_TYPES.length; u++) {
        var type = Diag.WRONG_TYPES[u];
        var row = el('div', 'ep-bar' + (type === d.weakness ? ' ep-bar-weak' : ''));
        row.setAttribute('data-type', type);
        row.appendChild(el('span', 'ep-bar-label', STR.bar_label[type]));
        var track = el('span', 'ep-bar-track');
        var fill = el('span', 'ep-bar-fill');
        fill.style.width = (100 * d.hist[type] / max) + '%';
        track.appendChild(fill);
        row.appendChild(track);
        row.appendChild(el('span', 'ep-bar-n', String(d.hist[type])));
        bars.appendChild(row);
      }
      box.appendChild(bars);
    }

    var verdict = el('p', 'ep-verdict');
    verdict.id = 'resultVerdict';
    verdict.textContent = d.weakness ? STR.weakness[d.weakness](ch.name)
      : (d.score === d.total ? STR.all_correct : STR.no_weakness);
    box.appendChild(verdict);
    if (d.sec_per_q !== null) box.appendChild(el('p', 'ep-note', STR.result_timing(Math.round(d.sec_per_q), d.exam_sec_per_q + ' s')));

    function list(title, ids, rowText) {
      if (!ids.length) return;
      box.appendChild(el('div', 'ep-h3', title));
      var ul = el('div', 'ep-fix-list');
      for (var i = 0; i < ids.length; i++) (function (qid) {
        var rec = null, n = 0;
        for (var j = 0; j < run.records.length; j++) if (run.records[j].qid === qid) { rec = run.records[j]; n = j + 1; }
        var q = Data.question(qid);
        var item = el('div', 'ep-fix-item');
        item.setAttribute('data-qid', qid);
        item.appendChild(el('div', 'ep-fix-row', rowText(n, rec, q)));
        item.appendChild(el('div', 'ep-fix-stem', q.question_en));
        var a = el('a', 'btn ep-fix-btn', STR.see_solution);
        a.href = '#/physics/' + key + '/fix/' + encodeURIComponent(qid);
        item.appendChild(a);
        ul.appendChild(item);
      })(ids[i]);
      box.appendChild(ul);
    }
    list(STR.wrong_list_title, d.wrong_ids, function (n, rec, q) { return STR.wrong_row(n, rec.picked, q.answer); });
    list(STR.guessed_list_title, d.guessed_ids, function (n, rec, q) { return STR.guessed_row(n, q.answer); });

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

  // ── fix: the worked solution (paid) ─────────────────────────────────────
  /** The record of the run's last meeting with this question: what they
      picked and what they said happened. Null when it was never in a run. */
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

    // The sibling retry: a similar question, in this panel, counted toward
    // "strong now" for the kind of mistake this question was probed as.
    var retryBox = el('div', 'ep-retry');
    retryBox.id = 'retryBox';
    var type = rec ? rec.probe : null;
    var tryBtn = button('btn btn-primary ep-try', STR.fix_try_again, function () { sibling(retryBox, key, q.id, type); });
    retryBox.appendChild(tryBtn);
    box.appendChild(retryBox);

    var cs = Run.chapterState(key);
    Panel.mount(box, {
      chapterKey: key, qid: q.id, key: q.answer, picked: picked, probe: type,
      weakness: (Run.lastFinished(key) || { diagnosis: {} }).diagnosis.weakness || null,
      streak: type && cs.streak[type] ? cs.streak[type] : 0, steps: sol.steps.length
    });
  }

  function sibling(host, key, fromQid, type) {
    clear(host);
    var ch = Data.chapter(key);
    var sib = Data.sibling(fromQid, ch, Run.seenIds(key));
    if (!sib) { host.appendChild(el('p', 'ep-note', STR.fix_sibling_none)); return; }
    var q = Data.question(sib);
    host.appendChild(el('p', 'ep-note', STR.fix_sibling_head));
    var shownAt = Date.now();
    var card = questionCard(q, null, function (card_, n) {
      var correct = n === q.answer;
      markPicked(card_, q, n, correct);
      var ms = Date.now() - shownAt;
      var after = el('div', 'ep-retry-after');
      host.appendChild(after);
      function settle(probe_) {
        var streak = Run.retry(key, fromQid, type, q.id, n, correct, probe_, ms);
        var cs = Run.chapterState(key);
        var msg;
        if (streak === null) msg = STR.fix_streak_none;
        else if (cs.strong_now[type] && streak >= Diag.STRONG_AT) msg = STR.fix_strong(type);
        else if (streak > 0) msg = STR.fix_streak(streak, Diag.STRONG_AT);
        else msg = STR.fix_streak_reset;
        var note = el('p', 'ep-verdict', msg);
        note.id = 'retryVerdict';
        after.appendChild(note);
        var row = el('div', 'ep-lock-row');
        var link = el('a', 'btn', STR.fix_sibling_solution);
        link.href = '#/physics/' + key + '/fix/' + encodeURIComponent(q.id);
        row.appendChild(link);
        row.appendChild(button('btn', STR.fix_try_another, function () { sibling(host, key, fromQid, type); }));
        after.appendChild(row);
      }
      if (correct) {
        after.appendChild(el('p', 'ep-note', STR.correct + ' ' + STR.probe_correct_q));
        var row = el('div', 'ep-chips ep-chips-inline');
        row.appendChild(button('ep-chip', STR.probe_sure, function () { clear(row); settle('sure'); }));
        row.appendChild(button('ep-chip', STR.probe_guessed, function () { clear(row); settle('guessed'); }));
        after.appendChild(row);
      } else {
        after.appendChild(el('p', 'ep-note', STR.wrong(n, q.answer)));
        settle(null);
      }
    });
    host.appendChild(card);
    card.scrollIntoView({ block: 'end' });
    Track.log('retry_start', { qid: q.id, from_qid: fromQid, type: type });
  }

  function showFix(key, qid) {
    var q = Data.question(qid);
    if (!q) { location.hash = '#/physics/' + key + '/result'; return; }
    showView('fixView');
    setBack('#/physics/' + key + '/result', STR.result_title);
    var box = $('fixBody');
    clear(box);
    box.appendChild(el('div', 'ep-asked', q.asked_label));
    box.appendChild(el('div', 'ep-stem', q.question_en));
    var opts = el('div', 'ep-fix-opts');
    for (var n = 1; n <= 4; n++) opts.appendChild(el('div', 'ep-fix-opt' + (n === q.answer ? ' right' : ''), STR.option_label(n) + ' ' + q.options_en[n - 1]));
    box.appendChild(opts);
    var rec = recordOf(key, qid);
    Track.log('fix_open', { qid: qid, built: Sync.on(), locked: Gate.locked() });

    if (!Sync.on()) { box.appendChild(el('p', 'ep-note', STR.fix_not_built)); return; }
    if (Gate.known() && Gate.locked()) { lockWall(box, key, qid); return; }

    // Not known yet (a cold open straight to a fix route), or unlocked: ask.
    // The server refuses a locked device the bundle, so this branch can never
    // put a solution byte in front of one.
    var wait = el('p', 'ep-note', STR.fix_loading);
    box.appendChild(wait);
    Sync.bundle(key, function (out) {
      if (box.contains(wait)) box.removeChild(wait);
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
        status.appendChild(el('p', 'ep-verdict', STR.unlock_paid_until(st.paid_until ? String(st.paid_until).slice(0, 10) : '—')));
      } else {
        status.appendChild(el('div', 'ep-lock-price', sku ? STR.lock_price(sku.price_inr, sku.period_days) : STR.lock_price_soon));
        if (Gate.payable()) row.appendChild(button('btn btn-primary', STR.lock_pay(sku.price_inr), function () { startPay(box, '#/physics'); }));
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
    if (h === '#/unlock') { showUnlock(); return; }
    var m = h.match(/^#\/physics\/(p[12]-\d{2})(?:\/(result|fix)(?:\/([^\/]+))?)?$/);
    if (!m) { location.hash = '#/'; return; }
    if (!Data.chapter(m[1])) { location.hash = '#/physics'; return; }
    if (m[2] === 'result') { showResult(m[1]); return; }
    if (m[2] === 'fix') { showFix(m[1], decodeURIComponent(m[3] || '')); return; }
    showRun(m[1]);
  }

  return { route: route, showView: showView };
})();
var route = Screens.route;
