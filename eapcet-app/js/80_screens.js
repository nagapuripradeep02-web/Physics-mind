/* Screens — the hash router and every view. Renders from Data/Run/Diag only;
 * nothing here decides physics, scores or diagnosis.
 *
 *   #/                       subject door
 *   #/physics                chapter list
 *   #/physics/<key>          the run, as a thread
 *   #/physics/<key>/result   the diagnosis
 *   #/physics/<key>/fix/<id> the worked solution (paid; not in this build)
 *   #/notastudent/<word>[/off]  team marking */
var Screens = (function () {
  var VIEWS = ['doorView', 'chaptersView', 'runView', 'resultView', 'fixView'];
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

  function askCard() {
    var cur = Run.current();
    var q = Run.question();
    var card = el('div', 'ep-card');
    card.setAttribute('data-qid', q.id);
    card.appendChild(el('div', 'ep-progress', STR.run_progress(cur.i + 1, Run.total())));
    card.appendChild(el('div', 'ep-asked', q.asked_label));
    card.appendChild(el('div', 'ep-stem', q.question_en));
    var opts = el('div', 'ep-opts');
    for (var n = 1; n <= 4; n++) (function (n) {
      var b = el('button', 'ep-opt');
      b.type = 'button';
      b.setAttribute('data-option', String(n));
      b.appendChild(el('span', 'ep-opt-n', STR.option_label(n)));
      b.appendChild(el('span', 'ep-opt-t', q.options_en[n - 1]));
      b.onclick = function () { onPick(card, n); };
      opts.appendChild(b);
    })(n);
    card.appendChild(opts);
    thread.appendChild(card);
    card.scrollIntoView({ block: 'end' });
    Run.shown();
    Track.log('q_show', { qid: q.id, i: cur.i + 1 });
  }

  function onPick(card, n) {
    var q = Run.question();
    var rec = Run.pick(n);
    if (!rec) return;
    var buttons = card.querySelectorAll('.ep-opt');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].disabled = true;
      var k = Number(buttons[i].getAttribute('data-option'));
      if (k === q.answer) buttons[i].classList.add('right');
      if (k === n && !rec.correct) buttons[i].classList.add('wrong');
      if (k === n) buttons[i].classList.add('picked');
    }
    if (rec.correct) {
      say(STR.correct + ' ' + STR.probe_correct_q);
      setChips([
        { label: STR.probe_sure, value: 'sure', onTap: function () { onProbe('sure'); } },
        { label: STR.probe_guessed, value: 'guessed', onTap: function () { onProbe('guessed'); } }
      ]);
    } else {
      say(STR.wrong(n, q.answer) + ' ' + STR.probe_wrong_q);
      setChips([
        { label: STR.probe_concept, value: 'concept', onTap: function () { onProbe('concept'); } },
        { label: STR.probe_calculation, value: 'calculation', onTap: function () { onProbe('calculation'); } },
        { label: STR.probe_application, value: 'application', onTap: function () { onProbe('application'); } },
        { label: STR.probe_time, value: 'time', onTap: function () { onProbe('time'); } }
      ]);
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
        setChips([
          { label: STR.probe_sure, value: 'sure', onTap: function () { onProbe('sure'); } },
          { label: STR.probe_guessed, value: 'guessed', onTap: function () { onProbe('guessed'); } }
        ]);
      } else {
        say(STR.wrong(rec.picked, q.answer) + ' ' + STR.probe_wrong_q);
        setChips([
          { label: STR.probe_concept, value: 'concept', onTap: function () { onProbe('concept'); } },
          { label: STR.probe_calculation, value: 'calculation', onTap: function () { onProbe('calculation'); } },
          { label: STR.probe_application, value: 'application', onTap: function () { onProbe('application'); } },
          { label: STR.probe_time, value: 'time', onTap: function () { onProbe('time'); } }
        ]);
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

  // ── fix (paid; the solution surface lands with the hosted build) ────────
  function showFix(key, qid) {
    var q = Data.question(qid);
    if (!q) { location.hash = '#/physics/' + key + '/result'; return; }
    showView('fixView');
    setBack('#/physics/' + key + '/result', STR.result_title);
    var box = $('fixBody');
    clear(box);
    box.appendChild(el('div', 'ep-asked', q.asked_label));
    box.appendChild(el('div', 'ep-stem', q.question_en));
    box.appendChild(el('p', 'ep-note', STR.fix_not_built));
    Track.log('fix_open', { qid: qid, built: false });
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
