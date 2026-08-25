/* ═══════════════════════════════════════════════════════════════════════════
   Answer Book engine — notebook.js
   Classic script (no modules — Chrome blocks them from file://).
   Deterministic: no network, no randomness (Rule 18). Data arrives inlined
   as window.PM_QUESTIONS by build_answer_book.ts.

   Core mechanism — MEASURE, FREEZE, CLEAR, TYPE:
   a step block is built with its FULL final content, appended hidden
   (visibility:hidden, never display:none — getTotalLength() and offsetHeight
   both need layout), overflow-tested against the 32-rule page body, moved to
   a fresh page if it does not fit (a derivation step is never split), then
   every line's measured height is frozen, the text cleared, and the block
   revealed by typing. Nothing reflows during typing, so the pagination
   decision stays true.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // ── constants ─────────────────────────────────────────────────────────────
  var CHAR_MS = 1000 / 28;        // 28 chars/sec — board-mvp.html L591-623 harvest
  var LINE_GAP_MS = 180;          // pause between written lines
  var ELEMENT_GAP_MS = 110;       // pause between figure strokes/labels
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ═══ questions ═══════════════════════════════════════════════════════════
  // The build inlines the whole unit, and the page rendered PM_QUESTIONS[0] only
  // — so authoring a second question silently HID the first. A picker appears as
  // soon as there is more than one; switching is the same re-render a cut switch
  // does, which is the only reason this is a few lines rather than a rewrite.

  var questions = window.PM_QUESTIONS || [];
  if (!questions.length) { document.body.textContent = 'No question data in this build.'; return; }
  var qIndex = 0;
  var question = questions[0];

  // ═══ cuts — the same answer at two lengths ═══════════════════════════════
  // A cut SELECTS from the one authored step list; it never holds a second copy
  // of the answer. `steps` and `marksTotal` are therefore derived, never captured
  // once — the whole reason the chrome below had to stop being append-only.
  //
  // With no `cuts` in the data the synthesised single cut reproduces the old
  // behaviour exactly, so every existing question keeps working untouched.

  var cuts, cutIndex = 0, cut, steps, marksTotal;

  function loadCuts() {
    cuts = question.cuts && question.cuts.length ? question.cuts : [{
      key: 'full', label: 'Full answer', qtype: question.qtype,
      marks_total: question.marks_total, paper_section: question.paper_section,
      expected_time_min: question.expected_time_min, mark_split: question.mark_split,
      steps: question.answer.steps.reduce(function (acc, s) {
        acc[s.id] = { marks: s.marks }; return acc;
      }, {}),
      needs_teacher_verification:
        !!(question.verification && question.verification.needs_teacher_verification)
    }];
  }
  loadCuts();

  /** Project the authored steps through the active cut. Authored ORDER always wins. */
  function applyCut(i) {
    cutIndex = i;
    cut = cuts[i];
    steps = question.answer.steps
      .filter(function (s) { return Object.prototype.hasOwnProperty.call(cut.steps, s.id); })
      .map(function (s) {
        var o = cut.steps[s.id];
        var merged = {};
        for (var k in s) if (Object.prototype.hasOwnProperty.call(s, k)) merged[k] = s[k];
        merged.marks = o.marks;
        if (o.label) merged.label = o.label;
        if (o.lines) merged.lines = o.lines;
        if (o.margin_note) merged.margin_note = o.margin_note;
        if (o.why) merged.why = o.why;
        if (o.memory_tip) merged.memory_tip = o.memory_tip;
        // A 0-mark step gets no red tick, so it must carry no mark note.
        if (o.mark_note) merged.mark_note = o.mark_note;
        if (merged.marks === 0) delete merged.mark_note;
        return merged;
      });
    marksTotal = cut.marks_total;
  }
  applyCut(0);

  var QTYPE_WORD = { LAQ: 'Long Answer Question', SAQ: 'Short Answer Question',
                     VSAQ: 'Very Short Answer Question' };

  /** Derived, never literal: a hardcoded "· 8 marks" cannot follow a cut switch. */
  function pageHeaderLines() {
    return [cut.paper_section + ' — ' + (QTYPE_WORD[cut.qtype] || 'Answer'),
            question.chapter + ' · ' + marksTotal + ' marks'];
  }

  // ── state ─────────────────────────────────────────────────────────────────
  var stepIndex = -1;             // last fully revealed step
  var marksEarned = 0;
  var pageBodies = [];            // .page-body elements in order
  var revealing = false;
  var finishCurrent = null;       // completes the animating step instantly
  var completed = false;

  // ── DOM refs ──────────────────────────────────────────────────────────────
  var $ = function (id) { return document.getElementById(id); };
  var notebook = $('notebook');
  var btnNext = $('btnNext');

  document.querySelector('.notebook-col').setAttribute('data-question-id', question.question_id);

  // ═══ chrome ════════════════════════════════════════════════════════════════

  // Each renderer CLEARS first and reads the active cut. They used to be one
  // append-only function, which is why switching cuts was impossible: a second
  // call stacked a duplicate set of chips, split rows and step pills, and the
  // pill click handlers still closed over indices from the previous step set.

  function renderMeta() {
    var meta = $('questionMeta');
    meta.innerHTML = '';
    var chips = [
      question.class_label,
      // The chip names the PAPER, same table as the catalog's subject chips.
      ({ physics: 'Physics', chemistry: 'Chemistry',
         mathematics: 'Maths-1A', mathematics_1b: 'Maths-1B',
         botany: 'Botany' })[question.subject] ||
        question.subject.charAt(0).toUpperCase() + question.subject.slice(1),
      'Unit ' + question.unit.number + ' · ' + question.unit.name,
      cut.paper_section + ' · ' + cut.qtype,
      'about ' + cut.expected_time_min + ' minutes'
    ];
    chips.forEach(function (c) {
      var el = document.createElement('span');
      el.className = 'chip';
      el.textContent = c;
      meta.appendChild(el);
    });
    // Which papers asked this (board-tagged appearances — Session 89).
    var asked = askedLine(question);
    if (asked) {
      var ac = document.createElement('span');
      ac.className = 'chip asked';
      ac.textContent = asked;
      meta.appendChild(ac);
    }
    var marksChip = document.createElement('span');
    marksChip.className = 'chip chip-marks';
    marksChip.textContent = marksTotal + ' marks';
    meta.appendChild(marksChip);

    $('accTotal').textContent = '/' + marksTotal;
  }

  function renderMarkSplit() {
    var split = $('markSplit');
    split.innerHTML = '';
    cut.mark_split.forEach(function (row) {
      var el = document.createElement('div');
      el.className = 'split-row';
      var label = document.createElement('span');
      label.textContent = row.label;
      var m = document.createElement('span');
      m.className = 'split-m';
      m.textContent = row.marks + 'M';
      el.appendChild(label); el.appendChild(m);
      split.appendChild(el);
    });

    // The claim flag is per CUT: a verified 8-mark split says nothing about an
    // invented 4-mark one, so the note must follow whichever is on screen.
    var vn = $('verifyNote');
    var unverified = cut.needs_teacher_verification ||
      (question.verification && question.verification.needs_teacher_verification);
    vn.hidden = !unverified;
    if (unverified) {
      // The subject word follows the question: this surface now serves physics and
      // mathematics from one build, and 'the physics' on a maths page is a false
      // statement about what was checked.
      // The SUBJECT word, not the paper: 'the mathematics and the method are
      // checked' reads right for 1A and 1B alike.
      var subjectWord = (question.subject || '').indexOf('mathematics') === 0 ? 'mathematics'
        : question.subject === 'chemistry' ? 'chemistry'
        : question.subject === 'botany' ? 'botany' : 'physics';
      vn.textContent = 'Mark split not yet confirmed by a board teacher. ' +
        'The ' + subjectWord + ' and the method are checked; the exact split is a claim.';
    }
  }

  function renderStepList() {
    var list = $('stepList');
    list.innerHTML = '';
    steps.forEach(function (s, i) {
      var pill = document.createElement('div');
      pill.className = 'step-pill';
      pill.setAttribute('data-idx', String(i));
      var state = document.createElement('span');
      state.className = 'pill-state';
      var label = document.createElement('span');
      label.textContent = s.label;
      var m = document.createElement('span');
      m.className = 'pill-marks' + (s.marks === 0 ? ' zero' : '');
      m.textContent = s.marks === 0 ? 'no marks' : '+' + s.marks + 'M';
      pill.appendChild(state); pill.appendChild(label); pill.appendChild(m);
      pill.addEventListener('click', function () { goToIndex(i); });
      list.appendChild(pill);
    });
  }

  function renderChrome() {
    $('boardLabel').textContent = question.board_label;
    // The wording follows the cut: the paper asks for the trajectory AND the
    // results at 8 marks, and only the results at 4.
    $('questionText').textContent = 'Q. ' + (cut.question_text || question.question_text);
    renderMeta();
    renderMarkSplit();
    renderStepList();
  }

  /** Switching cut restarts the answer: it is a different answer, not a filter.
      The hash is kept truthful so the current view is always shareable. */
  function switchCut(i) {
    if (i === cutIndex) return;
    applyCut(i);
    renderChrome();
    renderUpTo(-1, false);
    initTestPaths();          // photo/mic are only honest on the default cut
    VidiPanel.onQuestion();
    syncHash();
  }

  /** Full question load — the mechanism behind the router. Always re-renders,
      even for the already-active question, so a route can be trusted blindly. */
  function loadQuestion(i, cutKey) {
    // The chapter gate (P3). A gated question has no answer body in the
    // page — Gate fetches the unit's bundle (or shows the lock sheet) and
    // re-enters here once the real question object is in place. Both
    // routes funnel through loadQuestion, so this is the WHOLE gate.
    if (questions[i] && questions[i].gated) { Gate.showLockFlow(i, cutKey); return; }
    qIndex = i;
    question = questions[i];
    loadCuts();
    var ci = 0;
    if (cutKey) {
      for (var k = 0; k < cuts.length; k++) if (cuts[k].key === cutKey) { ci = k; break; }
    }
    applyCut(ci);
    document.querySelector('.notebook-col').setAttribute('data-question-id', question.question_id);
    renderChrome();
    renderUpTo(-1, false);
    initTestPaths();
    VidiPanel.onQuestion();
  }

  // ═══ catalog + router ═════════════════════════════════════════════════════
  // The catalog is the landing view (founder decision 2026-08-20) and lists the
  // BOOK'S inventory (PM_UNITS), not just what is authored: an entry with a
  // question_id opens in the notebook, the rest render as coming-soon cards so
  // the chapter keeps its true shape. Routes: #/ = catalog, #/q/<id>(/<cutKey>)
  // = notebook — hash-based so back/forward work from file://.

  var UNITS = window.PM_UNITS || [];
  var qIndexById = {};
  questions.forEach(function (q, i) { qIndexById[q.question_id] = i; });

  var currentView = null;               // 'catalog' | 'notebook'
  var catFilter = { subject: 'ALL', qtype: 'ALL', unit: 'ALL', search: '' };

  function showView(v) {
    currentView = v;
    var nb = v === 'notebook';
    var ee = v === 'exam-eve';
    $('catalogView').hidden = nb || ee;
    $('notebookView').hidden = !nb;
    $('examEveView').hidden = !ee;
    $('btnCatalog').hidden = !(nb || ee);
    var only = document.querySelectorAll('.nb-only');
    for (var i = 0; i < only.length; i++) only[i].hidden = !nb;
    VidiPanel.syncView(nb);
    VidiPanel.onView(v);
  }

  /** ONE CARD = ONE QUESTION AT ONE LENGTH (founder, 2026-08-20 review). An
      entry belongs to exactly its book section — no unions, no filter-dependent
      cut resolution. The LAQ forms are their own manifest entries, so a student
      filtering SAQ never sees an 8-mark chip and vice versa. */
  function entryCut(e) {
    if (e.question_id === undefined) return null;
    var q = questions[qIndexById[e.question_id]];
    var qcuts = q.cuts || [];
    for (var i = 0; i < qcuts.length; i++) if (qcuts[i].key === e.cut) return qcuts[i];
    return { key: null, qtype: q.qtype, marks_total: q.marks_total,
             expected_time_min: q.expected_time_min };
  }

  /** "Asked: TS 2012, 2004 · AP 2026" from a question's appearances[]. Board absent
      = TS (the historical meaning). Empty appearances → null (no line, never "Asked:"
      with nothing after it). */
  function askedLine(q) {
    if (!q || !q.appearances || !q.appearances.length) return null;
    var by = { ts_ipe: [], ap_ipe: [] };
    q.appearances.forEach(function (a) {
      by[a.board === 'ap_ipe' ? 'ap_ipe' : 'ts_ipe'].push(a.year);
    });
    var parts = [];
    if (by.ts_ipe.length) parts.push('TS ' + by.ts_ipe.sort().reverse().join(', '));
    if (by.ap_ipe.length) parts.push('AP ' + by.ap_ipe.sort().reverse().join(', '));
    return 'Asked: ' + parts.join(' · ');
  }

  /** A unit's subject. Absent = physics: physics units predate the field, exactly the
      way an appearance with no board means TS. */
  function subjectOf(u) { return u.subject || 'physics'; }

  /** Unit numbers namespace PER SUBJECT (physics Unit 3 and maths Unit 3 are
      different chapters), so everything that identifies a unit — the chapter
      chips, the triage box, the exam-eve route — keys on subject-number,
      never the bare number. */
  function unitKey(u) { return subjectOf(u) + '-' + u.number; }

  /** A QUESTION's unit key. A question carries its subject at the TOP level, and its
      unit as {number, name} with no subject of its own (src/schemas/answerBook.ts:232),
      so unitKey(question.unit) would read EVERY card as physics. Build it from the
      question's own subject instead — same absent-means-physics rule as subjectOf. */
  function questionUnitKey(q) { return (q.subject || 'physics') + '-' + q.unit.number; }

  /** The chapter's 3-star set, for Vidi's grounding text. Keyed on subject-number,
      never the bare number: keying on the number told a Maths Unit 3 (Matrices) card
      that its chapter-mates were Physics Unit 3 (Motion in a Straight Line) questions,
      and physics sorts first in UNITS, so the maths mates were never reached at all. */
  function chapterMates(q, limit) {
    var mates = [];
    var want = questionUnitKey(q);
    var cap = limit || 6;
    for (var u2 = 0; u2 < UNITS.length; u2++) {
      if (unitKey(UNITS[u2]) !== want) continue;
      var qs2 = UNITS[u2].questions;
      for (var e2 = 0; e2 < qs2.length && mates.length < cap; e2++) {
        var me2 = qs2[e2];
        if (me2.question_id && me2.stars === 3 && me2.question_id !== q.question_id) {
          // Finish the word. A bare slice(0,80) cut mid-word — three graders quoted
          // "...completely burn 100 ml of acetylen" and "...in acid medium (or) Write t"
          // out of this list, and Vidi repeats it to students verbatim. Extend FORWARD
          // to the next space so the clip can only ever ADD characters; trimming
          // backwards could drop a word a caller asserts on.
          var t2 = String(me2.text);
          if (t2.length > 80) {
            var end2 = t2.indexOf(' ', 80);
            t2 = (end2 > 0 && end2 <= 100) ? t2.slice(0, end2) : t2.slice(0, 80);
            t2 = t2.replace(/[\s,;:.]+$/, '') + '…';
          }
          mates.push(me2.section + ' ' + me2.number + ': ' + t2);
        }
      }
    }
    return mates;
  }
  // --- end of the Vidi context key helpers ---

  function entryMatches(e, u) {
    if (catFilter.subject !== 'ALL' && subjectOf(u) !== catFilter.subject) return false;
    if (catFilter.qtype !== 'ALL' && e.section !== catFilter.qtype) return false;
    if (catFilter.unit !== 'ALL' && unitKey(u) !== catFilter.unit) return false;
    if (catFilter.search) {
      var blob = (e.section + ' ' + e.section + e.number + ' ' + e.section + ' ' + e.number +
                  ' ' + e.text + ' ' + u.name + ' ' + subjectOf(u)).toLowerCase();
      if (blob.indexOf(catFilter.search) < 0) return false;
    }
    return true;
  }

  function renderCatalog() {
    var allEntries = [];
    UNITS.forEach(function (u) { u.questions.forEach(function (e) { allEntries.push(e); }); });
    var ready = allEntries.filter(function (e) { return e.question_id !== undefined; }).length;
    var coming = allEntries.length - ready;
    $('catSub').textContent = ready + ' answers ready' + (coming ? ' · ' + coming + ' more coming' : '');

    // Subject chips. Hidden while the book holds ONE subject, so a physics-only
    // build looks exactly as it did — the row appears the moment a second subject
    // is authored. Counts are whole-inventory, static like the qtype counts below.
    var subjRow = $('subjectChips');
    subjRow.innerHTML = '';
    var subjects = [];
    UNITS.forEach(function (u) {
      if (subjects.indexOf(subjectOf(u)) < 0) subjects.push(subjectOf(u));
    });
    subjRow.hidden = subjects.length < 2;
    if (subjects.length >= 2) {
      // The chip names the PAPER, which is what a student picks by.
      var SUBJ_LABEL = { physics: 'Physics', chemistry: 'Chemistry',
                         mathematics: 'Maths-1A', mathematics_1b: 'Maths-1B',
                         botany: 'Botany' };
      var subjChips = [{ key: 'ALL', label: 'All subjects', n: allEntries.length }];
      subjects.forEach(function (sName) {
        var n = 0;
        UNITS.forEach(function (u) { if (subjectOf(u) === sName) n += u.questions.length; });
        subjChips.push({ key: sName, label: SUBJ_LABEL[sName] || sName, n: n });
      });
      subjChips.forEach(function (c) {
        var sb = document.createElement('button');
        sb.type = 'button';
        sb.className = 'cat-chip' + (catFilter.subject === c.key ? ' on' : '');
        sb.setAttribute('data-subject', String(c.key));
        sb.setAttribute('aria-pressed', catFilter.subject === c.key ? 'true' : 'false');
        sb.appendChild(document.createTextNode(c.label));
        var sct = document.createElement('span');
        sct.className = 'ct';
        sct.textContent = String(c.n);
        sb.appendChild(sct);
        sb.addEventListener('click', function () { catFilter.subject = c.key; catFilter.unit = 'ALL'; renderCatalog(); });
        subjRow.appendChild(sb);
      });
    }

    // qtype chips, counts static across the whole build so they read as an
    // inventory, not as a moving target
    var chipRow = $('qtypeChips');
    chipRow.innerHTML = '';
    ['ALL', 'LAQ', 'SAQ', 'VSAQ'].forEach(function (t) {
      var n = t === 'ALL'
        ? allEntries.length
        : allEntries.filter(function (e) { return e.section === t; }).length;
      if (t !== 'ALL' && n === 0) return;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'cat-chip' + (catFilter.qtype === t ? ' on' : '');
      b.setAttribute('data-qtype', t);
      b.setAttribute('aria-pressed', catFilter.qtype === t ? 'true' : 'false');
      b.innerHTML = '';
      b.appendChild(document.createTextNode(t === 'ALL' ? 'All' : t));
      var ct = document.createElement('span');
      ct.className = 'ct';
      ct.textContent = String(n);
      b.appendChild(ct);
      b.addEventListener('click', function () { catFilter.qtype = t; renderCatalog(); });
      chipRow.appendChild(b);
    });

    // Chapter chips, labelled by chapter NAME because that is what a student is
    // looking for. The row appears only from the second unit on: with one chapter a
    // chapter filter is noise, and with several a single scroll stops being usable.
    // Counts are whole-chapter inventory, static like the qtype counts above.
    var unitRow = $('unitChips');
    unitRow.innerHTML = '';
    unitRow.hidden = UNITS.length < 2;
    if (UNITS.length >= 2) {
      var unitChips = [{ key: 'ALL', label: 'All chapters', n: allEntries.length }];
      UNITS.forEach(function (u) {
        unitChips.push({ key: unitKey(u), label: u.name, n: u.questions.length });
      });
      unitChips.forEach(function (c) {
        var ub = document.createElement('button');
        ub.type = 'button';
        ub.className = 'cat-chip' + (catFilter.unit === c.key ? ' on' : '');
        ub.setAttribute('data-unit', String(c.key));
        ub.setAttribute('aria-pressed', catFilter.unit === c.key ? 'true' : 'false');
        ub.appendChild(document.createTextNode(c.label));
        var uct = document.createElement('span');
        uct.className = 'ct';
        uct.textContent = String(c.n);
        ub.appendChild(uct);
        ub.addEventListener('click', function () { catFilter.unit = c.key; renderCatalog(); });
        unitRow.appendChild(ub);
      });
    }

    var sections = $('catSections');
    sections.innerHTML = '';
    var shown = 0;

    UNITS.forEach(function (u) {
      var visible = u.questions.filter(function (e) { return entryMatches(e, u); });
      if (!visible.length) return;
      shown += visible.length;

      var sec = document.createElement('section');
      sec.className = 'cat-section';
      var h = document.createElement('h2');
      h.appendChild(document.createTextNode('Unit ' + u.number + ' — ' + u.name));
      var pill = document.createElement('span');
      pill.className = 'cat-count';
      var uReady = u.questions.filter(function (e) { return e.question_id !== undefined; }).length;
      pill.textContent = uReady + ' of ' + u.questions.length + ' ready';
      h.appendChild(pill);
      sec.appendChild(h);

      // Sub-group by exam section, in paper-marks order. A crammer thinks in
      // sections; interleaving LAQ cards among the book's SAQ numbering would
      // re-create the confusion the one-length model exists to remove.
      // The mark VALUE is read off the questions in the group, never hardcoded: a
      // Physics-I long answer is 8 marks but a Maths-1A long answer is 7, and a
      // baked-in "· 8 marks" printed the wrong number over the maths section.
      // A group with nothing authored yet shows no number rather than a guess.
      var SECTIONS = [
        { key: 'LAQ', label: 'Long Answer Questions' },
        { key: 'SAQ', label: 'Short Answer Questions' },
        { key: 'VSAQ', label: 'Very Short Answer Questions' }
      ];
      function sectionLabel(sg, group) {
        for (var gi = 0; gi < group.length; gi++) {
          var gc = entryCut(group[gi]);
          if (gc) return sg.label + ' · ' + gc.marks_total + ' marks';
        }
        return sg.label;
      }
      SECTIONS.forEach(function (sg) {
        var group = visible.filter(function (e) { return e.section === sg.key; });
        if (!group.length) return;

        var sh = document.createElement('h3');
        sh.className = 'cat-subhead';
        sh.textContent = sectionLabel(sg, group);
        sec.appendChild(sh);

        group.forEach(function (e) {
          var authored = e.question_id !== undefined;
          var card = document.createElement(authored ? 'a' : 'div');
          card.className = 'cat-card' + (authored ? '' : ' soon');
          var ec = entryCut(e);
          if (authored) {
            card.setAttribute('href', '#/q/' + encodeURIComponent(e.question_id) +
              (ec.key ? '/' + encodeURIComponent(ec.key) : ''));
          }
          var main = document.createElement('div');
          main.className = 'cc-main';

          var top = document.createElement('div');
          top.className = 'cc-top';
          var ref = document.createElement('span');
          ref.className = 'cc-ref';
          ref.textContent = e.section + ' ' + e.number;
          top.appendChild(ref);
          if (e.stars > 0) {
            var st = document.createElement('span');
            st.className = 'cc-stars';
            st.textContent = new Array(e.stars + 1).join('★');
            top.appendChild(st);
          }
          main.appendChild(top);

          var txt = document.createElement('div');
          txt.className = 'cc-text';
          txt.textContent = e.text;
          main.appendChild(txt);

          // ONE length per card: the marks of the answer this card opens, and
          // that answer's time. Never a second length.
          var badges = document.createElement('div');
          badges.className = 'cc-badges';
          if (authored) {
            var mk = document.createElement('span');
            mk.className = 'cc-chip marks';
            mk.textContent = ec.marks_total + ' marks';
            badges.appendChild(mk);
            var tm = document.createElement('span');
            tm.className = 'cc-chip';
            tm.textContent = '~' + ec.expected_time_min + ' min';
            badges.appendChild(tm);
            // Board differentiation (Session 89): a TS or AP student sees which
            // papers actually asked this. Enumerated entries say so plainly
            // (Rule 41) — a predicted question must never dress as an asked one.
            if (e.source === 'enumerated') {
              var pr = document.createElement('span');
              pr.className = 'cc-chip predicted';
              pr.textContent = 'Predicted — not asked yet';
              badges.appendChild(pr);
            } else {
              var asked = askedLine(questions[qIndexById[e.question_id]]);
              if (asked) {
                var ak = document.createElement('span');
                ak.className = 'cc-chip asked';
                ak.textContent = asked;
                badges.appendChild(ak);
              }
            }
            // Study progress (founder, 2026-08-23): yellow chip = understood,
            // says WHEN revision is due; green chip = done. Authored branch only
            // — the soon-card gate asserts its chips verbatim. A class turns the
            // red margin rule green.
            // The chapter gate's lock cue. Only in the GATED build, only
            // once the entitlement list has answered (no flicker), and
            // appended after the other chips so no first-chip gate moves.
            if (Gate.locked(unitKey(u))) {
              var lk = document.createElement('span');
              lk.className = 'cc-chip pm-lock';
              lk.textContent = '🔒';
              badges.appendChild(lk);
            }
            var stg = Vidi.stageFor(e.question_id);
            if (stg.u || stg.r) {
              var done = stg.u && stg.r;
              var pb = document.createElement('span');
              pb.className = 'cc-chip pm-upr ' + (done ? 'g' : 'y');
              pb.textContent = done ? '✓ done'
                : (stg.u < Vidi.todayStr() ? '✓ revise today' : '✓ revise tomorrow');
              badges.appendChild(pb);
              if (done) card.className += ' pm-done';
            }
          } else {
            var soon = document.createElement('span');
            soon.className = 'cc-chip';
            soon.textContent = 'Not written yet';
            badges.appendChild(soon);
          }
          main.appendChild(badges);
          card.appendChild(main);

          if (authored) {
            var arrow = document.createElement('span');
            arrow.className = 'cc-arrow';
            arrow.textContent = '→';
            card.appendChild(arrow);
          }
          sec.appendChild(card);
        });
      });
      sections.appendChild(sec);
    });

    $('catNone').hidden = shown > 0;
    renderTriage();
  }

  function showCatalog() {
    showView('catalog');
    renderCatalog();
  }

  /** Keep the hash truthful after an in-notebook cut switch, so the current
      view is always shareable. The default cut carries no /cut segment. */
  function syncHash() {
    var h = '#/q/' + encodeURIComponent(question.question_id) +
      (cutIndex > 0 ? '/' + encodeURIComponent(cut.key) : '');
    if (location.hash !== h) location.hash = h;
  }

  // ═══ the leave-question ask — the student, not the product, claims the tick ═
  // (founder, 2026-08-23: supersedes the 2026-08-22 auto-tick.) Navigating away
  // from a fully revealed answer asks "Did you understand and practice this?";
  // Yes = the yellow Understand tick. A question already understood on an
  // EARLIER day asks the revision form instead; Yes = the green tick.
  var askConsumed = false;             // one navigation passes after an answer

  function askGuard() {
    if (askConsumed) { askConsumed = false; return false; }
    if (currentView !== 'notebook' || !question || !completed) return false;
    var qid = question.question_id;
    if (location.hash.indexOf('#/q/' + encodeURIComponent(qid)) === 0) return false;
    var s = Vidi.stageFor(qid);
    var kind = !s.u ? 'u' : (!s.r && s.u < Vidi.todayStr() ? 'r' : null);
    if (!kind) return false;
    showAsk(qid, kind);
    return true;
  }

  function showAsk(qid, kind) {
    var ov = $('askOverlay'), yes = $('askYes'), no = $('askNo');
    $('askText').textContent = kind === 'u'
      ? 'Did you understand and practice this answer?'
      : 'Did you revise this answer once more?';
    yes.textContent = kind === 'u' ? 'Yes — understood & practiced' : 'Yes — revised';
    yes.hidden = false; no.hidden = false;
    ov.hidden = false;
    yes.onclick = function () {
      Vidi.setStage(qid, kind, true);
      Vidi.log('stage', { qid: qid, k: kind });
      VidiPanel.onStageTick();
      $('askText').textContent = kind === 'u'
        ? 'Marked in yellow — we will revise this one tomorrow.'
        : 'Full green tick — this one is done.';
      yes.hidden = true; no.hidden = true;
      setTimeout(function () {
        ov.hidden = true;
        askConsumed = true; route();
      }, 1100);
    };
    no.onclick = function () {
      ov.hidden = true;
      askConsumed = true; route();
    };
  }

  function route() {
    if (askGuard()) return;
    var ee = location.hash.match(/^#\/exam-eve\/([a-z]+-\d+|\d+)$/);
    if (ee) { showExamEve(ee[1]); return; }
    var m = location.hash.match(/^#\/q\/([^\/]+)(?:\/([^\/]+))?$/);
    if (!m) { showCatalog(); return; }
    var id = decodeURIComponent(m[1]);
    if (qIndexById[id] === undefined) { location.hash = '#/'; return; }
    var cutKey = m[2] ? decodeURIComponent(m[2]) : null;
    // No-op when this exact state is already on screen: a cut switch writes the
    // hash back, and re-loading here would restart the answer it just rendered.
    if (currentView === 'notebook' && qIndex === qIndexById[id]) {
      var want = cutKey || cuts[0].key;
      if (cut.key === want) return;
    }
    showView('notebook');
    loadQuestion(qIndexById[id], cutKey);
  }

  function updateChrome() {
    $('accValue').textContent = String(marksEarned);
    $('accFill').style.width = (marksEarned / marksTotal * 100) + '%';

    var pills = $('stepList').children;
    for (var i = 0; i < pills.length; i++) {
      var done = i <= stepIndex;
      var current = i === stepIndex + 1 && !completed;
      pills[i].className = 'step-pill' + (done ? ' done' : '') + (current ? ' current' : '');
      pills[i].firstChild.textContent = done ? '✓' : '·';
    }

    // `next` is the step the student is about to write, so its guidance is what
    // the rail should show. `why` and `common_mistakes` are authored but no longer
    // rendered here — they surface in the redo list after a check.
    var next = steps[stepIndex + 1];
    var noteCard = $('marginNoteCard');
    if (next && next.margin_note) {
      noteCard.hidden = false;
      $('marginNote').textContent = next.margin_note;
    } else {
      noteCard.hidden = true;
    }

    if (completed) {
      btnNext.disabled = true;
      btnNext.textContent = 'Answer complete — ' + marksEarned + ' / ' + marksTotal + ' marks';
    } else if (revealing) {
      btnNext.disabled = false;
      btnNext.textContent = 'Finish this step now';
    } else if (stepIndex === -1) {
      btnNext.textContent = 'Start writing';
    } else {
      var n = steps[stepIndex + 1];
      btnNext.textContent = n.marks > 0
        ? 'Next: ' + n.label + ' · +' + n.marks + ' mark' + (n.marks > 1 ? 's' : '')
        : 'Next: ' + n.label;
    }
  }

  // ═══ pages ═══════════════════════════════════════════════════════════════

  function newPage() {
    var page = document.createElement('section');
    page.className = 'page';
    var body = document.createElement('div');
    body.className = 'page-body';
    var no = document.createElement('div');
    no.className = 'page-no';
    no.textContent = 'Page ' + (pageBodies.length + 1);
    page.appendChild(body); page.appendChild(no);
    notebook.appendChild(page);
    pageBodies.push(body);
    return body;
  }

  function currentBody() { return pageBodies[pageBodies.length - 1]; }

  function writePageHeader() {
    var block = document.createElement('div');
    block.className = 'page-header-block';
    pageHeaderLines().forEach(function (t) {
      var el = document.createElement('div');
      el.className = 'line';
      el.textContent = t;
      block.appendChild(el);
    });
    currentBody().appendChild(block);
  }

  // ═══ block construction (full final content) ═════════════════════════════

  function lineSpec(raw) {
    return typeof raw === 'string' ? { text: raw, style: 'normal' } : raw;
  }

  function buildStepBlock(step) {
    var block = document.createElement('div');
    block.className = 'step-block';
    block.setAttribute('data-step-id', step.id);
    block.setAttribute('data-kind', step.kind);
    block.setAttribute('data-marks', String(step.marks));

    if (step.kind === 'diagram') {
      block.appendChild(buildFigure(step.figure));
    } else {
      var defaultStyle = step.kind === 'equation' ? 'eq' : 'normal';
      step.lines.forEach(function (raw, li) {
        var spec = lineSpec(raw);
        var style = spec.style || defaultStyle;
        var el = document.createElement('div');
        el.className = 'line ' + style;
        el.setAttribute('data-line-index', String(li));
        if (spec.render === 'katex' && spec.html) {
          // Typeset by the BUILD (never here — Rule 18). A typeset tree has no
          // characters to type, so this line is revealed by a width wipe instead;
          // data-tex keeps the source addressable for the chatbot seam.
          el.setAttribute('data-render', 'katex');
          var clip = document.createElement('span');
          clip.className = 'kx-clip';
          clip.setAttribute('data-tex', spec.text);
          var kin = document.createElement('span');
          kin.className = 'kx-in';
          kin.innerHTML = spec.html;
          clip.appendChild(kin);
          // A boxed final answer keeps its box when it has to be typeset — the box is
          // the student's "this is the answer" signal and must not depend on notation.
          if (style === 'boxed') {
            var bx = document.createElement('span');
            bx.className = 'boxed-inner';
            bx.appendChild(clip);
            el.appendChild(bx);
          } else {
            el.appendChild(clip);
          }
        } else if (style === 'boxed') {
          var inner = document.createElement('span');
          inner.className = 'boxed-inner';
          inner.textContent = spec.text;
          el.appendChild(inner);
        } else {
          el.textContent = spec.text;
        }
        block.appendChild(el);
      });
    }

    if (step.marks > 0) {
      var red = document.createElement('div');
      red.className = 'red-mark';
      red.innerHTML =
        '<svg width="40" height="30" viewBox="0 0 40 30">' +
        '<path class="tick" d="M 5 17 L 15 26 L 35 5" fill="none" stroke="#C62828" ' +
        'stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '<span class="red-num">' + step.marks + '</span>';
      block.appendChild(red);
    }
    return block;
  }

  // ═══ figure (progressive-stroke SVG) ═════════════════════════════════════

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var clipSeq = 0;

  function buildFigure(fig) {
    var wrap = document.createElement('div');
    wrap.className = 'figure-wrap';
    // reserve a whole number of rules so the block below stays on the rules
    var rules = Math.ceil(fig.height / 32);
    wrap.style.height = (rules * 32) + 'px';

    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + fig.width + ' ' + fig.height);
    svg.setAttribute('width', String(fig.width));
    svg.setAttribute('height', String(fig.height));
    var defs = document.createElementNS(SVG_NS, 'defs');
    svg.appendChild(defs);

    fig.elements.forEach(function (el) {
      if (el.type === 'stroke') {
        var path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', el.d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        if (el.pen === 'pencil') {
          path.setAttribute('stroke', '#7D8CA8');
          path.setAttribute('stroke-width', String(el.w || 1.6));
          path.setAttribute('stroke-dasharray', '6 5');
          // dasharray is spent on the dashes → reveal via clip wipe
          var clipId = 'abclip' + (clipSeq++);
          var clip = document.createElementNS(SVG_NS, 'clipPath');
          clip.setAttribute('id', clipId);
          var rect = document.createElementNS(SVG_NS, 'rect');
          clip.appendChild(rect);
          defs.appendChild(clip);
          var g = document.createElementNS(SVG_NS, 'g');
          g.setAttribute('clip-path', 'url(#' + clipId + ')');
          g.appendChild(path);
          svg.appendChild(g);
          el._node = path; el._clipRect = rect;
        } else {
          path.setAttribute('stroke', '#1A2F6B');
          path.setAttribute('stroke-width', String(el.w || 2.25));
          svg.appendChild(path);
          el._node = path;
        }
      } else { // label
        var text = document.createElementNS(SVG_NS, 'text');
        text.setAttribute('x', String(el.x));
        text.setAttribute('y', String(el.y));
        if (el.em) text.setAttribute('class', 'em');
        if (el.sm) text.setAttribute('class', 'sm');
        text.textContent = el.text;
        svg.appendChild(text);
        el._node = text;
      }
    });

    wrap.appendChild(svg);
    wrap._fig = fig;
    return wrap;
  }

  // hide every element (after layout, so getTotalLength works), ready to play
  function armFigure(wrap) {
    var fig = wrap._fig;
    fig.elements.forEach(function (el) {
      var node = el._node;
      if (el.type === 'stroke') {
        if (el._clipRect) {
          var bb = node.getBBox();
          // start the wipe at zero size along the drawing axis
          el._bb = bb;
          el._clipRect.setAttribute('x', String(bb.x - 4));
          el._clipRect.setAttribute('y', String(bb.y - 4));
          el._clipRect.setAttribute('width', el.wipe === 'y' ? String(bb.width + 8) : '0');
          el._clipRect.setAttribute('height', el.wipe === 'y' ? '0' : String(bb.height + 8));
        } else {
          var L = node.getTotalLength();
          el._len = L;
          node.style.strokeDasharray = String(L);
          node.style.strokeDashoffset = String(L);
        }
      } else {
        node.style.opacity = '0';
      }
    });
  }

  function playFigure(wrap, onDone) {
    var fig = wrap._fig;
    var i = 0;
    var timer = null;
    var cancelled = false;

    function playNext() {
      if (cancelled) return;
      if (i >= fig.elements.length) { onDone(); return; }
      var el = fig.elements[i++];
      var node = el._node;
      if (el.type === 'stroke') {
        if (el._clipRect) {
          var rect = el._clipRect;
          var bb = el._bb;
          rect.style.transition = (el.wipe === 'y' ? 'height ' : 'width ') + el.ms + 'ms linear';
          requestAnimationFrame(function () {
            if (cancelled) return;
            if (el.wipe === 'y') rect.setAttribute('height', String(bb.height + 8));
            else rect.setAttribute('width', String(bb.width + 8));
          });
        } else {
          node.style.transition = 'stroke-dashoffset ' + el.ms + 'ms linear';
          requestAnimationFrame(function () {
            if (cancelled) return;
            node.style.strokeDashoffset = '0';
          });
        }
      } else {
        node.style.transition = 'opacity ' + el.ms + 'ms ease';
        requestAnimationFrame(function () {
          if (cancelled) return;
          node.style.opacity = '1';
        });
      }
      timer = setTimeout(playNext, el.ms + ELEMENT_GAP_MS);
    }

    playNext();

    return function finish() {           // tap-to-finish
      cancelled = true;
      if (timer) clearTimeout(timer);
      finishFigure(wrap);
      onDone();
    };
  }

  function finishFigure(wrap) {
    wrap._fig.elements.forEach(function (el) {
      var node = el._node;
      if (el.type === 'stroke') {
        if (el._clipRect) {
          el._clipRect.style.transition = 'none';
          el._clipRect.setAttribute('width', String(el._bb.width + 8));
          el._clipRect.setAttribute('height', String(el._bb.height + 8));
        } else {
          node.style.transition = 'none';
          node.style.strokeDashoffset = '0';
        }
      } else {
        node.style.transition = 'none';
        node.style.opacity = '1';
      }
    });
  }

  // ═══ typing (board-mvp.html L591-623 harvest, adapted) ═══════════════════

  // A typeset line crops only while it is wiping; this hands the clip back its own
  // size once the wipe ends. Releasing it matters because the resting width then comes
  // from the tree's own ink rather than a frozen measurement — and a measurement taken
  // before the delimiter's KaTeX Size font has loaded is short by the width of the
  // closing bracket.
  function kxRest(el, afterMs) {
    setTimeout(function () {
      el.classList.remove('kx-wiping');
      el.style.transition = 'none';
      el.style.width = '';
    }, afterMs || 0);
  }

  function typeLines(block, onDone) {
    var targets = [];                    // {el, text} — el receives the chars
    var lineEls = block.querySelectorAll('.line');
    for (var i = 0; i < lineEls.length; i++) {
      var el = lineEls[i];
      var clip = el.querySelector('.kx-clip');
      if (clip) {
        // Freeze the natural width, then collapse it (scrollWidth still reports the
        // content width at width:0, the same trick the pencil wipe uses).
        clip.classList.add('kx-wiping');       // crops only for the wipe; see kxRest
        targets.push({ el: clip, kx: true, w: clip.scrollWidth,
                       text: clip.getAttribute('data-tex') || '' });
        clip.style.width = '0px';
        continue;
      }
      var inner = el.querySelector('.boxed-inner');
      var target = inner || el;
      targets.push({ el: target, text: target.textContent });
      target.textContent = '';
    }

    var li = 0, ci = 0;
    var timer = null;
    var cancelled = false;
    var cursor = document.createElement('span');
    cursor.className = 'cursor';

    function tick() {
      if (cancelled) return;
      if (li >= targets.length) { cursor.remove(); onDone(); return; }
      var t = targets[li];
      if (t.kx) {
        // Paced off the TeX length so a matrix does not land faster than the plain
        // line above it, and never so slow that a student waits on one construct.
        var dur = Math.max(320, Math.min(2400, t.text.length * CHAR_MS));
        t.el.style.transition = 'width ' + dur + 'ms linear';
        t.el.style.width = t.w + 'px';
        kxRest(t.el, dur);              // release the crop the moment the wipe ends
        li++; ci = 0;
        timer = setTimeout(tick, dur + LINE_GAP_MS);
        return;
      }
      if (ci === 0) t.el.appendChild(cursor);
      if (ci < t.text.length) {
        cursor.insertAdjacentText('beforebegin', t.text.charAt(ci));
        ci++;
        timer = setTimeout(tick, CHAR_MS);
      } else {
        li++; ci = 0;
        timer = setTimeout(tick, LINE_GAP_MS);
      }
    }
    tick();

    return function finish() {           // tap-to-finish
      cancelled = true;
      if (timer) clearTimeout(timer);
      cursor.remove();
      targets.forEach(function (t) {
        if (t.kx) { kxRest(t.el, 0); return; }
        t.el.textContent = t.text;
      });
      onDone();
    };
  }

  // ═══ placement — measure, freeze, clear, reveal ═══════════════════════════

  function placeStep(step, animate, onDone) {
    var block = buildStepBlock(step);

    // 1-3. append hidden with FULL content; overflow test; move if needed
    block.style.visibility = 'hidden';
    currentBody().appendChild(block);
    var body = currentBody();
    if (block.offsetTop + block.offsetHeight > body.clientHeight) {
      block.remove();
      body = newPage();
      body.appendChild(block);
      if (block.offsetTop + block.offsetHeight > body.clientHeight) {
        console.warn('answer-book: step "' + step.id + '" is taller than one page — authoring error, letting it overflow');
      }
    }

    // 4. freeze measured line heights (a wrapped line keeps its two-rule box)
    var lineEls = block.querySelectorAll('.line');
    for (var i = 0; i < lineEls.length; i++) {
      var lh = lineEls[i].offsetHeight;
      // A typeset block (a matrix is three rows tall) is NOT a multiple of the rule,
      // and one stray pixel here walks every later line off the ruled paper. Snap up
      // to whole rules — the same thing buildFigure does with its height.
      if (lineEls[i].getAttribute('data-render') === 'katex') {
        lh = Math.ceil(lh / 32) * 32;
        // A typeset line wider than the page body still overflows visibly and is an
        // authoring error, so say so. Measure against the CONTENT box: clientWidth
        // INCLUDES the 56px padding-left that .line.eq/.boxed add, and every matrix
        // line is eq-styled, so comparing against clientWidth alone silently tolerated
        // up to 56px of overflow.
        var kc = lineEls[i].querySelector('.kx-clip');
        var lcs = kc ? window.getComputedStyle(lineEls[i]) : null;
        var avail = lcs ? lineEls[i].clientWidth
          - parseFloat(lcs.paddingLeft) - parseFloat(lcs.paddingRight) : 0;
        if (kc && kc.scrollWidth > avail + 1) {
          console.warn('answer-book: typeset line is wider than the page body and will be ' +
            'clipped — shorten the TeX: ' + (kc.getAttribute('data-tex') || ''));
        }
      }
      lineEls[i].style.height = lh + 'px';
    }

    // arm the figure while layout is live (getTotalLength needs it)
    var figWrap = block.querySelector('.figure-wrap');
    var redMark = block.querySelector('.red-mark');
    if (redMark) redMark.style.visibility = 'hidden';

    function complete() {
      if (redMark) {
        redMark.style.visibility = '';
        var tick = redMark.querySelector('.tick');
        if (animate && !REDUCED) {
          var L = tick.getTotalLength();
          tick.style.strokeDasharray = String(L);
          tick.style.strokeDashoffset = String(L);
          tick.style.transition = 'stroke-dashoffset 250ms ease';
          requestAnimationFrame(function () { tick.style.strokeDashoffset = '0'; });
        }
        redMark.classList.add('shown');
      }
      onDone();
    }

    if (!animate || REDUCED) {
      block.style.visibility = '';
      // A figure placed INSTANTLY still has to be put into its finished state.
      // Pencil strokes are revealed by a clip-rect wipe and the rect is built
      // zero-sized along the wipe axis, so skipping this leaves every dashed
      // construction line invisible — on revealAll, on a rail jump, and on the
      // PRINTED page, which renders the whole answer instantly. armFigure first
      // because it is what measures _bb, which finishFigure then reads.
      if (figWrap) { armFigure(figWrap); finishFigure(figWrap); }
      complete();
      return;
    }

    // 5-7. clear content, show block, reveal
    if (figWrap) {
      armFigure(figWrap);
      block.style.visibility = '';
      block.scrollIntoView({ behavior: 'smooth', block: 'center' });
      finishCurrent = playFigure(figWrap, complete);
    } else {
      var finishTyping = null;
      // clear happens inside typeLines (it snapshots then empties)
      block.style.visibility = '';
      block.scrollIntoView({ behavior: 'smooth', block: 'center' });
      finishCurrent = typeLines(block, complete);
    }
  }

  function placeTotalBlock() {
    var block = document.createElement('div');
    block.className = 'step-block total-block';
    var inner = document.createElement('span');
    inner.className = 'total-underline';
    inner.textContent = 'Total : ' + marksEarned + ' / ' + marksTotal + ' marks';
    block.appendChild(inner);
    block.style.visibility = 'hidden';
    currentBody().appendChild(block);
    if (block.offsetTop + block.offsetHeight > currentBody().clientHeight) {
      block.remove();
      newPage().appendChild(block);
    }
    block.style.visibility = '';
    block.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // ═══ flow ═════════════════════════════════════════════════════════════════

  // The 2026-08-22 auto-tick is retired (founder, 2026-08-23): a full reveal no
  // longer sets Understand by itself. The leave-question ask (askGuard above)
  // owns the tick — the student claims it, the product never does.

  function advance() {
    if (revealing) {                     // impatience: finish the current step
      if (finishCurrent) finishCurrent();
      return;
    }
    if (completed) return;
    var next = stepIndex + 1;
    if (next >= steps.length) return;

    revealing = true;
    updateChrome();
    placeStep(steps[next], true, function () {
      revealing = false;
      finishCurrent = null;
      stepIndex = next;
      marksEarned += steps[next].marks;
      if (stepIndex === steps.length - 1) {
        completed = true;
        placeTotalBlock();
      }
      updateChrome();
      document.dispatchEvent(new CustomEvent('pm:step-revealed', {
        detail: { stepId: steps[next].id, marks: steps[next].marks, marksEarned: marksEarned }
      }));
    });
  }

  /** One code path for jump/restart — pagination identical to tapping through. */
  function renderUpTo(targetIndex, animateLast) {
    if (revealing && finishCurrent) finishCurrent();
    revealing = false; finishCurrent = null; completed = false;
    notebook.innerHTML = '';
    pageBodies = [];
    stepIndex = -1;
    marksEarned = 0;
    newPage();
    writePageHeader();

    var instantUpTo = animateLast ? targetIndex - 1 : targetIndex;
    for (var k = 0; k <= instantUpTo && k < steps.length; k++) {
      // instant placement is synchronous (placeStep calls onDone inline)
      (function (idx) {
        placeStep(steps[idx], false, function () {
          stepIndex = idx;
          marksEarned += steps[idx].marks;
        });
      })(k);
    }
    if (stepIndex === steps.length - 1) {
      completed = true;
      placeTotalBlock();
    }
    updateChrome();
    // The page geometry is fixed but its HEIGHT is not: a cut with fewer steps
    // makes a shorter notebook, and without this the mobile scale compensation
    // keeps the previous cut's margin and leaves a gap under the Next button.
    fitNotebook();
    if (animateLast && targetIndex < steps.length) advance();
  }

  function goToIndex(i) {
    if (i === stepIndex + 1 && !revealing) { advance(); return; }
    renderUpTo(i, true);
  }

  // ═══ events ═══════════════════════════════════════════════════════════════

  notebook.addEventListener('click', advance);
  btnNext.addEventListener('click', advance);
  $('btnRestart').addEventListener('click', function () { renderUpTo(-1, false); });
  $('btnPrint').addEventListener('click', function () {
    if (!completed) renderUpTo(steps.length - 1, false);
    window.print();
  });
  $('catSearch').addEventListener('input', function () {
    catFilter.search = this.value.trim().toLowerCase();
    renderCatalog();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === ' ' || e.key === 'ArrowRight') {
      // never steal the spacebar from the catalog search box
      if (e.target === document.body && currentView === 'notebook') { e.preventDefault(); advance(); }
    }
  });

  // mobile: scale the fixed-geometry notebook, never reflow it
  function fitNotebook() {
    var col = $('notebookCol');
    var avail = col.clientWidth;
    var fit = Math.min(1, avail / 820);
    notebook.style.transform = fit < 1 ? 'scale(' + fit + ')' : '';
    // scaled element keeps its layout height; compensate so the Next button hugs it
    var natural = notebook.scrollHeight;
    notebook.style.marginBottom = fit < 1 ? (-(natural * (1 - fit))) + 'px' : '';
  }
  window.addEventListener('resize', fitNotebook);

  // ═══ test yourself (overlay) — DORMANT (founder, 2026-08-23) ═════════
  // The "Test myself" entry is removed for now: #btnTest in shell.html lost its
  // nb-only class, so the view sweep never un-hides it and this whole surface
  // is unreachable. The code stays for when the founder brings the self-check
  // back. Completion is two stages now: Understand (every step revealed) →
  // Revise ("Mark revised ✓" on a later day) — see Plan.green/learned.
  // ═════════════════════════════════════════════
  // Three ways to be checked, all converging on renderCheck(): tick it yourself,
  // a photo/PDF of what the student wrote, or saying the steps aloud. The photo
  // and mic paths appear only when their endpoint is configured; the self-check
  // needs no server, so this panel always offers something that works.
  //
  // NO CLOCK HERE (founder, 2026-08-20). The student writes on paper FIRST and
  // opens this panel afterwards, so a stopwatch started on open measures time
  // spent in a dialog, not time spent on the answer. The exam expectation is
  // stated once, calmly, in the header chip (see the chips block above).

  /** 5.5 stays 5.5; 6.0 shows as 6. */
  function fmtMarks(n) { return Number.isInteger(n) ? String(n) : n.toFixed(1); }

  function openTest() {
    $('testOverlay').hidden = false;
    $('testChoose').hidden = false;
    $('recallResult').hidden = true;
    $('recallResult').innerHTML = '';
    $('btnPhoto').classList.remove('busy');
    $('btnMic').classList.remove('busy');
  }

  function closeTest() {
    if (rec.active) stopRecording();
    $('testOverlay').hidden = true;
    // A touched self-check becomes history (the exam-eve view reads it), and the
    // FIRST completed check ever is the moment Vidi offers the rename.
    if (lastSelfCheck && lastSelfCheck.touched) {
      Vidi.recordCheck(lastSelfCheck.qid, lastSelfCheck.score, lastSelfCheck.total);
      Vidi.log('self_check', { qid: lastSelfCheck.qid, score: lastSelfCheck.score, total: lastSelfCheck.total });
      // A completed self-check IS the Practice stage. A second one on a LATER
      // day than the practice tick counts as the revision (auto-tick + manual
      // override — founder, 2026-08-22).
      var st = Vidi.stageFor(lastSelfCheck.qid);
      if (!st.p) {
        Vidi.setStage(lastSelfCheck.qid, 'p', true);
      } else if (!st.r && st.p < Vidi.todayStr()) {
        Vidi.setStage(lastSelfCheck.qid, 'r', true);
      }
      VidiPanel.onStageTick();
      var offer = !Vidi.renameOffered();
      lastSelfCheck = null;
      VidiPanel.onCheckClosed(offer);
    } else {
      lastSelfCheck = null;
    }
  }

  // ═══ spoken-recall check ═════════════════════════════════════════════════
  // Progressive enhancement: with no endpoint configured this whole block does
  // nothing, the card stays hidden, and the page makes zero network calls.

  var API_BASE = (window.PM_API_BASE || '').trim().replace(/\/$/, '');
  var RECALL_ENDPOINT = API_BASE ? API_BASE + '/recall-check' : '';
  var PHOTO_ENDPOINT = API_BASE ? API_BASE + '/photo-check' : '';
  var MAX_RECORD_MS = 90000;   // the only hard bound on the dominant (STT) cost
  var MIN_RECORD_MS = 4000;    // below this we never upload — an accidental tap costs nothing
  var SILENCE_RMS = 0.005;     // below this for the whole take = nothing was said

  var rec = { active: false, ctx: null, stream: null, proc: null, chunks: [], startedAt: 0,
              timer: null, peak: 0 };

  /** Ported from feat/voice-professor-generalize VoiceProfessorClient.tsx L143-193.
   *  Sarvam STT rejects webm/opus (MediaRecorder's default) — so we capture raw
   *  Float32 PCM and write a 16 kHz mono 16-bit RIFF header by hand. */
  function encodeWav(chunks, inputRate) {
    var total = 0, i, j;
    for (i = 0; i < chunks.length; i++) total += chunks[i].length;
    var flat = new Float32Array(total), off = 0;
    for (i = 0; i < chunks.length; i++) { flat.set(chunks[i], off); off += chunks[i].length; }

    var outRate = 16000;
    var ratio = inputRate > outRate ? inputRate / outRate : 1;
    var outLen = Math.floor(flat.length / ratio) || flat.length;
    var samples = new Float32Array(outLen);
    for (i = 0; i < outLen; i++) {
      var start = Math.floor(i * ratio);
      var end = Math.min(flat.length, Math.floor((i + 1) * ratio) || start + 1);
      var sum = 0, n = 0;
      for (j = start; j < end; j++) { sum += flat[j]; n++; }
      samples[i] = n ? sum / n : (flat[start] || 0);
    }

    var buffer = new ArrayBuffer(44 + samples.length * 2);
    var view = new DataView(buffer);
    function writeStr(o, s) { for (var k = 0; k < s.length; k++) view.setUint8(o + k, s.charCodeAt(k)); }
    writeStr(0, 'RIFF'); view.setUint32(4, 36 + samples.length * 2, true); writeStr(8, 'WAVE');
    writeStr(12, 'fmt '); view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); view.setUint16(22, 1, true);
    view.setUint32(24, outRate, true); view.setUint32(28, outRate * 2, true);
    view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    writeStr(36, 'data'); view.setUint32(40, samples.length * 2, true);
    var p = 44;
    for (i = 0; i < samples.length; i++) {
      var s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(p, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      p += 2;
    }
    return new Blob([buffer], { type: 'audio/wav' });
  }

  function micLabel(t) { $('micLabel').textContent = t; }

  function teardownRecorder() {
    try { if (rec.proc) rec.proc.disconnect(); } catch (e) {}
    try { if (rec.stream) rec.stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
    try { if (rec.ctx && rec.ctx.state !== 'closed') rec.ctx.close(); } catch (e) {}
    if (rec.timer) clearInterval(rec.timer);
    rec.active = false; rec.ctx = null; rec.stream = null; rec.proc = null; rec.timer = null;
  }

  function startRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showRecallMessage('This browser cannot record audio. Try Chrome.'); return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      var ctx = new Ctx();
      var source = ctx.createMediaStreamSource(stream);
      var proc = ctx.createScriptProcessor(4096, 1, 1);
      var sink = ctx.createGain(); sink.gain.value = 0;   // silent sink: fires without echo

      rec = { active: true, ctx: ctx, stream: stream, proc: proc, chunks: [],
              startedAt: Date.now(), timer: null, peak: 0 };

      proc.onaudioprocess = function (e) {
        var d = e.inputBuffer.getChannelData(0);
        rec.chunks.push(new Float32Array(d));
        var sum = 0;
        for (var i = 0; i < d.length; i++) sum += d[i] * d[i];
        rec.peak = Math.max(rec.peak, Math.sqrt(sum / d.length));
      };
      source.connect(proc); proc.connect(sink); sink.connect(ctx.destination);

      $('btnMic').classList.add('recording');
      micLabel('Stop and check');
      $('recallTimer').hidden = false;
      $('recallResult').hidden = true;
      rec.timer = setInterval(function () {
        var s = Math.floor((Date.now() - rec.startedAt) / 1000);
        $('recallTimer').textContent = s + ' seconds — up to 90';
        if (Date.now() - rec.startedAt >= MAX_RECORD_MS) stopRecording();
      }, 250);
    }).catch(function (err) {
      var name = err && err.name;
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        showRecallMessage('The microphone is blocked. Allow it in your browser settings and try again.');
      } else if (name === 'NotFoundError') {
        showRecallMessage('No microphone was found on this device.');
      } else {
        showRecallMessage('Could not start the microphone. Try again.');
      }
    });
  }

  function stopRecording() {
    if (!rec.active) return;
    var elapsed = Date.now() - rec.startedAt;
    var chunks = rec.chunks;
    var rate = rec.ctx ? rec.ctx.sampleRate : 48000;
    var peak = rec.peak;
    teardownRecorder();
    $('btnMic').classList.remove('recording');
    $('recallTimer').hidden = true;
    micLabel('Tap to speak');

    // client-side gate: never pay for an accidental tap or a silent room
    if (elapsed < MIN_RECORD_MS || peak < SILENCE_RMS || !chunks.length) {
      renderNotEnough();
      return;
    }

    var wav = encodeWav(chunks, rate);
    $('btnMic').disabled = true;
    micLabel('Checking…');
    var form = new FormData();
    form.append('audio', wav, 'audio.wav');
    form.append('question_id', question.question_id);

    fetch(RECALL_ENDPOINT, { method: 'POST', body: form })
      .then(function (r) { return r.json().then(function (b) { return { ok: r.ok, status: r.status, body: b }; }); })
      .then(function (res) {
        $('btnMic').disabled = false; micLabel('Tap to speak again');
        if (!res.ok) {
          if (res.status === 503) { $('btnMic').hidden = true; $('recallIntro').hidden = true; return; }
          showRecallMessage('Could not check that recording. Nothing has been marked wrong.');
          return;
        }
        renderCheck(res.body, 'mic');
      })
      .catch(function () {
        $('btnMic').disabled = false; micLabel('Tap to speak');
        showRecallMessage('Could not reach the checker. Your answer book still works — nothing has been marked wrong.');
      });
  }

  // ── rendering ─────────────────────────────────────────────────────────────

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function showRecallMessage(msg) {
    var box = $('recallResult');
    box.hidden = false;
    box.innerHTML = '';
    box.appendChild(el('p', 'recall-empty', msg));
  }

  function renderNotEnough() {
    var box = $('recallResult');
    box.hidden = false;
    box.innerHTML = '';
    box.appendChild(el('p', 'recall-empty', 'We did not hear enough to check.'));
    box.appendChild(el('p', 'recall-caveat',
      'Tap the mic and say the steps in order, starting with the statement of the law. ' +
      'You can speak in English, in Telugu, or in both.'));
  }

  /** Transcript with every verified quote highlighted; overlapping spans merged. */
  function transcriptWithHighlights(text, steps) {
    var spans = steps
      .filter(function (s) { return s.evidence_start != null && s.evidence_end != null; })
      .map(function (s) { return [s.evidence_start, s.evidence_end]; })
      .sort(function (a, b) { return a[0] - b[0]; });
    var merged = [];
    spans.forEach(function (sp) {
      var last = merged[merged.length - 1];
      if (last && sp[0] <= last[1]) last[1] = Math.max(last[1], sp[1]);
      else merged.push([sp[0], sp[1]]);
    });
    var wrap = el('div', 'recall-transcript');
    var at = 0;
    merged.forEach(function (sp) {
      if (sp[0] > at) wrap.appendChild(document.createTextNode(text.slice(at, sp[0])));
      wrap.appendChild(el('mark', null, text.slice(sp[0], sp[1])));
      at = sp[1];
    });
    if (at < text.length) wrap.appendChild(document.createTextNode(text.slice(at)));
    return wrap;
  }

  function stepById(id) {
    for (var i = 0; i < steps.length; i++) if (steps[i].id === id) return steps[i];
    return null;
  }

  /** What the answer actually says for a step — shown on a miss, so the miss teaches. */
  function stepSummary(id) {
    var s = stepById(id);
    if (!s) return '';
    if (s.kind === 'diagram') return 'a labelled figure';
    var out = [];
    (s.lines || []).forEach(function (raw) {
      var spec = typeof raw === 'string' ? { text: raw } : raw;
      if (spec.style === 'eq' || spec.style === 'boxed') out.push(spec.text);
    });
    if (!out.length) {
      // no equations in this step — fall back to prose, but never the "Heading:" line
      (s.lines || []).forEach(function (raw) {
        var spec = typeof raw === 'string' ? { text: raw, style: 'normal' } : raw;
        if (spec.style !== 'heading' && out.length < 2) out.push(spec.text);
      });
    }
    return out.slice(0, 2).join('   ');
  }

  function marksLabel(n) { return n === 1 ? '1 mark' : n + ' marks'; }

  /**
   * ONE renderer for both paths. The mic path arrives already graded against the
   * transcript; the photo path arrives as PROPOSALS the student confirms, because
   * a misread of handwriting must never become a wrong accusation. Confirming is
   * what turns a proposal into a mark.
   */
  function renderCheck(res, source) {
    var box = $('recallResult');
    $('testChoose').hidden = true;
    box.hidden = false;
    box.innerHTML = '';

    if (res.outcome === 'not_enough_heard') { renderNotEnough(); return; }
    if (res.outcome === 'nothing_readable') {
      box.appendChild(el('p', 'recall-empty', 'We could not read that page.'));
      box.appendChild(el('p', 'recall-caveat',
        'Nothing has been marked wrong. Try a straighter photo in better light, or upload a PDF.'));
      box.appendChild(retryBtn());
      return;
    }
    if (res.outcome === 'check_failed') {
      showRecallMessage('We could not check that. Nothing has been marked wrong.');
      return;
    }
    if (res.outcome === 'not_this_answer') {
      box.appendChild(el('p', 'recall-empty', source === 'photo'
        ? 'That page does not look like this answer.'
        : 'What you said does not look like this answer.'));
      box.appendChild(el('p', 'recall-caveat', 'Nothing has been marked wrong.'));
      box.appendChild(retryBtn());
      return;
    }

    // 'photo' and 'self' both end in a tick-list where only ticks count. They
    // differ in ONE thing: whether a machine read the page. In 'photo' the ticks
    // start from the model's proposal (one tap in the common case) and a row can
    // honestly say what was seen. In 'self' nothing was read, so every row starts
    // unticked and no row may claim anything about the page.
    var confirmMode = source === 'photo' || source === 'self';
    var readMode = source === 'photo';
    var confirmed = {};
    res.steps.forEach(function (s) { confirmed[s.step_id] = s.bucket === 'covered'; });

    function total() {
      return res.steps.reduce(function (a, s) {
        return a + (confirmed[s.step_id] ? s.marks : 0);
      }, 0);
    }

    var head = el('div', 'recall-score', '');
    box.appendChild(head);
    // Vidi's verdict — updates live with every tick. Only the self-check writes
    // history (photo is endpoint-gated and grades server-side).
    var verdictEl = confirmMode ? el('div', 'vidi-verdict', '') : null;
    var refreshCount = 0;
    // In readMode the lead line below already says "tick what you wrote", so the
    // caveat only has to carry the RULE. Saying both in full reads as nagging.
    box.appendChild(el('p', 'recall-caveat', confirmMode
      ? 'Only what you tick is counted.'
      : 'This is an estimate from what you said out loud. In the exam the marks come from what you write on the paper.'));

    if (verdictEl) box.appendChild(verdictEl);

    function refresh() {
      head.textContent = (confirmMode ? 'Confirmed ' : 'About ') +
        fmtMarks(total()) + ' out of ' + res.marks_total + ' marks.';
      if (redoBox) redoBox.replaceWith(redoBox = redoList(res, confirmed));
      refreshCount++;
      if (verdictEl) {
        var vMissed = res.steps.filter(function (s) { return !confirmed[s.step_id] && s.marks > 0; });
        var vTotal = total();
        verdictEl.textContent = !vMissed.length
          ? (Vidi.getName() + ': Full marks — ' + fmtMarks(vTotal) + ' out of ' + res.marks_total +
             '. Write it once more tomorrow so you do not forget it.')
          : (Vidi.getName() + ': ' + fmtMarks(vTotal) + ' out of ' + res.marks_total +
             ' so far. Not ticked yet: ' +
             vMissed.map(function (s) { return s.label; }).join(' · ') + '.');
      }
      if (source === 'self') {
        lastSelfCheck = { qid: question.question_id, score: total(),
                          total: res.marks_total, touched: refreshCount > 1 };
      }
    }

    if (res.thin_transcript) {
      box.appendChild(el('p', 'recall-caveat',
        'That was a very short recording. The check below may not be complete.'));
    }
    if (!confirmMode && res.transcript) {
      box.appendChild(el('div', 'recall-lead', 'What we heard'));
      box.appendChild(transcriptWithHighlights(res.transcript, res.steps));
      box.appendChild(el('p', 'recall-caveat',
        'Speech to text is not perfect. If a word came out wrong, that is the microphone, not you.'));
    }

    if (confirmMode) {
      box.appendChild(el('div', 'recall-lead', readMode
        ? 'We read your page. Tick what you wrote.'
        : 'Look at your page and tick what you wrote.'));
      var list = el('div', 'recall-group');
      res.steps.forEach(function (s) {
        var row = el('label', 'confirm-row');
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = confirmed[s.step_id];
        row.classList.toggle('on', cb.checked);
        cb.addEventListener('change', function () {
          confirmed[s.step_id] = cb.checked;
          row.classList.toggle('on', cb.checked);
          refresh();
        });
        var txt = el('span', 'confirm-text');
        txt.appendChild(el('span', 'confirm-label', s.label));
        if (s.marks > 0) txt.appendChild(el('span', 'confirm-marks', marksLabel(s.marks)));
        if (s.evidence) txt.appendChild(el('span', 'confirm-found', 'We saw: ' + s.evidence));
        else if (readMode && s.bucket !== 'covered') {
          txt.appendChild(el('span', 'confirm-found', 'We did not find this on the page.'));
        }
        row.appendChild(cb);
        row.appendChild(txt);
        list.appendChild(row);
      });
      box.appendChild(list);
    } else {
      ['covered', 'missed', 'unsure'].forEach(function (key) {
        var rows = res.steps.filter(function (s) { return s.bucket === key; });
        if (!rows.length) return;
        var wrap = el('div', 'recall-group');
        wrap.appendChild(el('h4', null,
          key === 'covered' ? 'What you covered'
            : key === 'missed' ? 'You did not say these'
            : 'We are not sure about these'));
        rows.forEach(function (s) { wrap.appendChild(resultRow(s, key, confirmed, refresh)); });
        box.appendChild(wrap);
      });
    }

    var redoBox = redoList(res, confirmed);
    box.appendChild(redoBox);
    refresh();
    if (res.order_note) box.appendChild(el('p', 'recall-note', res.order_note));
    box.appendChild(retryBtn());
  }

  function retryBtn() {
    var b = el('button', 'btn btn-assess', 'Test myself again');
    b.type = 'button';
    b.addEventListener('click', function () { openTest(); });
    return b;
  }

  function resultRow(s, key, confirmed, refresh) {
    var item = el('div', 'recall-item ' + key);
    var head = el('div', 'ri-head');
    head.appendChild(el('span', 'ri-mark', key === 'covered' ? '✓' : key === 'missed' ? '✗' : '?'));
    head.appendChild(el('span', 'ri-label', s.label));
    if (s.marks > 0) head.appendChild(el('span', 'ri-marks', marksLabel(s.marks)));
    item.appendChild(head);

    if (key === 'covered' && s.evidence) {
      item.appendChild(el('div', 'ri-said', 'You said: "' + s.evidence + '"'));
      if (s.confidence < 0.5) {
        item.appendChild(el('div', 'ri-hint', 'This one was hard to hear. We counted it.'));
      }
    }
    if (key !== 'covered') {
      var summary = stepSummary(s.step_id);
      if (summary) item.appendChild(el('div', 'ri-what', 'In the answer this step is:  ' + summary));
      if (s.credit === 'name_it') {
        item.appendChild(el('div', 'ri-hint', 'Saying this step out loud by name is enough for this mark.'));
      }
      var unsureHint = null;
      if (key === 'unsure') {
        unsureHint = el('div', 'ri-hint',
          'We could not find this clearly in what you said. It is not marked as missed.');
        item.appendChild(unsureHint);
      }
      var actions = el('div', 'recall-actions');
      if (key === 'unsure' && s.marks > 0) {
        var yes = el('button', 'btn', 'I did say this');
        yes.type = 'button';
        yes.addEventListener('click', function () {
          confirmed[s.step_id] = true;
          refresh();
          item.classList.remove('unsure');
          item.classList.add('covered');
          head.firstChild.textContent = '✓';
          if (unsureHint) unsureHint.remove();
          actions.innerHTML = '';
          item.appendChild(el('div', 'ri-hint', 'Counted.'));
        });
        actions.appendChild(yes);
      }
      var write = el('button', 'btn', 'Write this step');
      write.type = 'button';
      write.addEventListener('click', function () {
        closeTest();
        window.PM_ANSWER.goToStep(s.step_id);
      });
      actions.appendChild(write);
      item.appendChild(actions);
    }
    return item;
  }

  /** The authored teaching layer surfaces here: each miss carries its own mistake note. */
  function redoList(res, confirmed) {
    var wrap = el('div', 'ss-redo');
    var misses = res.steps.filter(function (s) {
      return !confirmed[s.step_id] && s.marks > 0;
    });
    if (!misses.length) return wrap;
    wrap.appendChild(el('h4', null, 'Write these again'));
    misses.forEach(function (s) {
      var full = stepById(s.step_id);
      var item = el('div', 'recall-item missed');
      var head = el('div', 'ri-head');
      head.appendChild(el('span', 'ri-mark', '✗'));
      head.appendChild(el('span', 'ri-label', s.label));
      head.appendChild(el('span', 'ri-marks', marksLabel(s.marks)));
      item.appendChild(head);
      if (full && full.common_mistakes && full.common_mistakes.length) {
        item.appendChild(el('div', 'ri-hint', full.common_mistakes[0]));
      }
      if (full && full.why) item.appendChild(el('div', 'ri-what', full.why));
      var actions = el('div', 'recall-actions');
      var write = el('button', 'btn', 'Write this step');
      write.type = 'button';
      write.addEventListener('click', function () {
        closeTest();
        window.PM_ANSWER.goToStep(s.step_id);
      });
      actions.appendChild(write);
      item.appendChild(actions);
      wrap.appendChild(item);
    });
    return wrap;
  }

  // -- photo / PDF -----------------------------------------------------------

  var MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

  function sendPhoto(file) {
    if (file.size > MAX_UPLOAD_BYTES) {
      $('testChoose').hidden = true;
      showRecallMessage('That file is too large. Try a photo instead of a scan, or a smaller PDF.');
      return;
    }
    $('btnPhoto').classList.add('busy');
    $('testChoose').hidden = true;
    showRecallMessage('Reading your page...');
    var form = new FormData();
    form.append('page', file, file.name || 'answer');
    form.append('question_id', question.question_id);
    fetch(PHOTO_ENDPOINT, { method: 'POST', body: form })
      .then(function (r) {
        return r.json().then(function (b) { return { ok: r.ok, status: r.status, body: b }; });
      })
      .then(function (res) {
        if (!res.ok) {
          showRecallMessage(res.status === 503
            ? 'Photo checking is not switched on in this copy.'
            : 'We could not read that page. Nothing has been marked wrong.');
          return;
        }
        renderCheck(res.body, 'photo');
      })
      .catch(function () {
        showRecallMessage('Could not reach the checker. Your answer book still works, and nothing has been marked wrong.');
      });
  }

  // ═══ self-check (no server) ══════════════════════════════════════════════
  // The scoring in renderCheck was ALREADY client-side — it sums authored marks
  // over the ticked steps (see total()). Only the PROPOSAL of which steps are
  // present ever needed a model. Drop the proposal and the same tick-list is a
  // complete, honest check that costs nothing and runs with no key, no billing
  // and no network — so the emailable single-file copy always offers a way to
  // be checked, not just a notice saying checking is off.
  //
  // Every step starts UNTICKED on purpose: this path makes no claim about the
  // page, so it must not pre-award a mark the student did not earn.

  function startSelfCheck() {
    renderCheck({
      outcome: 'checked',
      marks_total: marksTotal,
      steps: steps.map(function (s) {
        return { step_id: s.id, label: s.label, marks: s.marks, bucket: 'missed' };
      })
    }, 'self');
  }

  /**
   * Which checking paths this cut may offer. Re-runs on every cut switch.
   *
   * Photo and mic grade SERVER-side against the question's FULL step list — the
   * endpoints take a question_id and know nothing about cuts. Offering them on a
   * reduced cut would mark a student down for omitting steps that cut deliberately
   * drops. So they appear on the DEFAULT cut only, until the graders are cut-aware.
   * The self-check has no such problem: it scores in the browser from the steps
   * actually on screen, so it works on every cut.
   */
  function initTestPaths() {
    var isDefaultCut = cutIndex === 0;
    var server = question.recall_available && isDefaultCut;

    var any = false;
    if (PHOTO_ENDPOINT && server) { any = true; $('btnPhoto').hidden = false; }
    else $('btnPhoto').hidden = true;

    if (RECALL_ENDPOINT && server) { any = true; $('btnMic').hidden = false; }
    else $('btnMic').hidden = true;

    // Always offered — needs no endpoint, and is why this panel has no empty state.
    $('btnSelf').hidden = false;

    var reduced = !isDefaultCut && (PHOTO_ENDPOINT || RECALL_ENDPOINT) && question.recall_available;
    $('testIntro').textContent = any
      ? 'Write this answer on paper, then tick it yourself, upload it, or say the steps aloud.'
      : reduced
        ? 'Write this answer on paper, then tick off what you wrote. Photo and voice checking read the full ' +
          cuts[0].marks_total + '-mark answer, so they are off for this shorter one.'
        : 'Write this answer on paper, then tick off what you wrote.';
    $('testNone').hidden = true;
  }

  function initTest() {
    $('btnTest').addEventListener('click', openTest);
    $('btnCloseTest').addEventListener('click', closeTest);
    $('testOverlay').addEventListener('click', function (e) {
      if (e.target === $('testOverlay')) closeTest();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !$('testOverlay').hidden) closeTest();
    });

    // Listeners bind ONCE; visibility is what initTestPaths() re-decides. Binding
    // inside the re-runnable part would stack a duplicate handler per cut switch.
    $('btnSelf').addEventListener('click', startSelfCheck);
    $('btnPhoto').addEventListener('click', function () { $('photoInput').click(); });
    $('photoInput').addEventListener('change', function () {
      if (this.files && this.files[0]) sendPhoto(this.files[0]);
      this.value = '';
    });
    $('btnMic').addEventListener('click', function () {
      if (rec.active) stopRecording(); else startRecording();
    });

    initTestPaths();
  }


  // ═══ Vidi — the student's assistant ═══════════════════════════════════════
  // The bank is the brain; Vidi is the voice (docs/ANSWER_BOOK_VIDI_DESIGN.md).
  // Everything here is deterministic and offline unless PM_VIDI_BASE is set:
  // the greeting, the chips, the triage strip, the exam-eve view and the check
  // verdict render from PM_QUESTIONS/PM_UNITS + localStorage. Only the free-
  // text ask row and the telemetry flush touch the network, and both exist
  // only in a build that was given a chat base (npm run build:answers:hosted).

  var VIDI_BASE = (window.PM_VIDI_BASE || '').trim().replace(/\/$/, '');
  var lastSelfCheck = null;

  // Announced by Vidi whenever stored study data changes. Sync replaces it at
  // init; with no sync endpoint it stays a no-op forever, which is what keeps
  // the offline build free of even a dormant timer.
  var syncTouch = function () {};

  var Vidi = (function () {
    var mem = {};                       // fallback when localStorage is blocked
    function lsGet(k) {
      try { var v = localStorage.getItem(k); return v === null ? (mem[k] || null) : v; }
      catch (e) { return mem[k] || null; }
    }
    function lsSet(k, v) { mem[k] = v; try { localStorage.setItem(k, v); } catch (e) {} }

    // The name is display data, never an identifier — no uniqueness anywhere.
    // The blocklist is a light substring check: a screenshot travels with the brand.
    var BLOCK = ['fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'whore',
      'slut', 'porn', 'rape', 'nude', 'chutiya', 'chutia', 'madarchod', 'bhenchod',
      'behenchod', 'randi', 'lauda', 'lavda', 'lund', 'gandu', 'gaand', 'harami',
      'lanja', 'pooku', 'puku', 'modda', 'dengu', 'denge', 'gudda', 'erri',
      'లంజ', 'పూకు', 'మొడ్డ', 'దెంగ', 'గుద్ద'];
    function normName(n) { return String(n || '').replace(/\s+/g, ' ').trim().slice(0, 20); }
    function nameOk(n) {
      var l = n.toLowerCase();
      if (!l) return false;
      for (var i = 0; i < BLOCK.length; i++) if (l.indexOf(BLOCK[i]) >= 0) return false;
      return true;
    }

    var name = normName(lsGet('pm_vidi_name') || '') || 'Vidi';
    if (!nameOk(name)) name = 'Vidi';

    var history = {};
    try { history = JSON.parse(lsGet('pm_vidi_history') || '{}') || {}; } catch (e) { history = {}; }

    // ── planner storage ─────────────────────────────────────────────────────
    // Stage ticks are DATE STRINGS, not epoch ms: the planner's whole clock is
    // todayStr(), which honours the test-only pm_today_override key — so a tick
    // and the day it happened on always agree, in tests and in life.
    var stages = {};
    try { stages = JSON.parse(lsGet('pm_stage_v1') || '{}') || {}; } catch (e) { stages = {}; }

    function todayStr() {
      var o = lsGet('pm_today_override');
      if (o && /^\d{4}-\d{2}-\d{2}$/.test(o)) return o;
      var d = new Date();
      return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) +
        '-' + ('0' + d.getDate()).slice(-2);
    }

    var session = lsGet('pm_vidi_session');
    if (!session) {
      session = 'ab_' + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
      lsSet('pm_vidi_session', session);
    }

    // Telemetry — fire-and-forget; silently dropped with no base (offline gate).
    var evq = [];
    function log(type, data) {
      if (!VIDI_BASE) return;
      var e = { t: type, at: Date.now() };
      if (data) for (var k in data) if (Object.prototype.hasOwnProperty.call(data, k)) e[k] = data[k];
      evq.push(e);
      if (evq.length >= 10) flush();
    }
    function flush() {
      if (!VIDI_BASE || !evq.length) return;
      var batch = evq.splice(0, evq.length);
      try {
        fetch(VIDI_BASE, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'events', session_id: session, events: batch })
        }).catch(function () {});
      } catch (e) {}
    }
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') flush();
    });

    return {
      session: session,
      getName: function () { return name; },
      setName: function (n) {
        var v = normName(n);
        if (!nameOk(v)) return false;
        name = v; lsSet('pm_vidi_name', v); return true;
      },
      renameOffered: function () { return lsGet('pm_vidi_rename_done') === '1'; },
      markRenameOffered: function () { lsSet('pm_vidi_rename_done', '1'); },
      recordCheck: function (qid, score, total) {
        var h = history[qid];
        var best = (h && h.total === total) ? Math.max(h.best, score) : score;
        history[qid] = { best: best, total: total, at: Date.now() };
        lsSet('pm_vidi_history', JSON.stringify(history));
      },
      checkFor: function (qid) { return history[qid] || null; },
      /** Window state {open, x, y} — position + open/minimized, per device. */
      getWin: function () { try { return JSON.parse(lsGet('pm_vidi_win') || 'null'); } catch (e) { return null; } },
      setWin: function (w) { lsSet('pm_vidi_win', JSON.stringify(w)); },
      // ── the study plan (per device, like every other Vidi key) ────────────
      todayStr: todayStr,
      getPlan: function () { try { return JSON.parse(lsGet('pm_plan_v1') || 'null'); } catch (e) { return null; } },
      setPlan: function (p) {
        // saved_at is what lets two devices agree on WHICH plan is current
        // (the plan is one blob, so it is last-write-wins — unlike the stage
        // ticks, which merge). Stamped here so every write is comparable.
        if (p && typeof p === 'object') p.saved_at = new Date().toISOString();
        lsSet('pm_plan_v1', JSON.stringify(p));
        syncTouch();
      },
      /** The Viditra intro: shown until answered, but never nags past 2 shows. */
      introDone: function () { return lsGet('pm_intro_done') === '1'; },
      markIntroDone: function () { lsSet('pm_intro_done', '1'); },
      introSeen: function () {
        var n = parseInt(lsGet('pm_intro_seen') || '0', 10) + 1;
        lsSet('pm_intro_seen', String(n));
        return n;
      },
      /** Understand / Practice / Revise per question: '' = not done, else the
          date string of the day it happened. First tick wins; untick clears. */
      /** Every question that carries any stage tick — the plan-less revision
          queue walks this (there is no plan.learnDay to walk without a plan). */
      stageIds: function () { return Object.keys(stages); },
      stageFor: function (qid) {
        var s = stages[qid];
        return { u: (s && s.u) || '', p: (s && s.p) || '', r: (s && s.r) || '' };
      },
      setStage: function (qid, k, on) {
        var s = stages[qid] || { u: '', p: '', r: '' };
        if (on && s[k]) return;                    // first tick wins
        s[k] = on ? todayStr() : '';
        stages[qid] = s;
        lsSet('pm_stage_v1', JSON.stringify(stages));
        syncTouch();
      },
      /** The raw tick map, for the sync push. */
      allStages: function () { return stages; },
      /** Store a plan EXACTLY as given — no saved_at re-stamp. Only sync uses
          this, to adopt another device's plan without making it look newer
          than the device it came from. */
      storePlanRaw: function (p) { lsSet('pm_plan_v1', JSON.stringify(p)); },
      /** Merge ticks that came back from another device.

          The SAME first-tick-wins rule as setStage, but applied to the remote
          DATE instead of today: the earliest date either device saw is the
          truth. That makes the merge commutative and idempotent, so two
          devices converge no matter which syncs first and a replayed response
          changes nothing. Returns true when anything actually moved, so the
          caller only repaints on a real change. */
      mergeStages: function (rows) {
        if (!rows || !rows.length) return false;
        var changed = false;
        for (var i = 0; i < rows.length; i++) {
          var row = rows[i];
          var qid = row && row.q;
          if (!qid) continue;
          var s = stages[qid] || { u: '', p: '', r: '' };
          var keys = ['u', 'r'], j;
          for (j = 0; j < keys.length; j++) {
            var k = keys[j], remote = row[k] || '';
            if (!remote) continue;
            if (!s[k] || remote < s[k]) { s[k] = remote; changed = true; }
          }
          stages[qid] = s;
        }
        if (changed) lsSet('pm_stage_v1', JSON.stringify(stages));
        return changed;
      },
      log: log,
      flush: flush
    };
  })();

  // ═══ The study plan — deterministic scheduling over the bank ══════════════
  // The bank is the brain: every number here is computed from PM_UNITS /
  // PM_QUESTIONS + localStorage. No model is ever asked to plan. A question's
  // study cost is its authored expected_time_min: learn (understand + practice)
  // books 2× on its learn day, revision books ½× on the NEXT day — that spacing
  // is the founder's "learn two today, revise them tomorrow" rule.
  var Plan = (function () {

    function parseDay(s) {
      var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
      return Date.UTC(+m[1], +m[2] - 1, +m[3]);
    }
    function diffDays(a, b) { return Math.round((parseDay(a) - parseDay(b)) / 86400000); }

    var QT_RANK = { LAQ: 3, SAQ: 2, VSAQ: 1 };
    var QT_WORDS = { LAQ: 'long answers', SAQ: 'short answers', VSAQ: 'very short answers' };
    /** ['SAQ','VSAQ'] → 'short answers and very short answers'. */
    function scopeWords(scope) {
      var out = [];
      for (var i = 0; i < scope.length; i++) out.push(QT_WORDS[scope[i]]);
      return out.join(' and ');
    }

    /** Every distinct question in the chosen chapters, in crammer priority:
        stars first, LAQ before SAQ before VSAQ, asked before predicted.
        scope = a qtype list ('I only need SAQs and VSAQs'); null = every type. */
    function itemsFor(unitNums, scope) {
      var seen = {}, items = [];
      for (var u = 0; u < UNITS.length; u++) {
        // unitNums holds subject-qualified keys ('physics-2') — bare numbers
        // collide across subjects (physics Unit 3 vs maths Unit 3 Matrices).
        if (unitNums.indexOf(unitKey(UNITS[u])) < 0) continue;
        var qs = UNITS[u].questions;
        for (var i = 0; i < qs.length; i++) {
          var e = qs[i];
          if (!e.question_id || seen[e.question_id]) continue;
          seen[e.question_id] = true;
          var q = questions[qIndexById[e.question_id]];
          if (!q) continue;
          if (scope && scope.indexOf(q.qtype) < 0) continue;
          items.push({
            qid: e.question_id, cut: e.cut || null, stars: e.stars || 0,
            qtype: q.qtype, mins: q.expected_time_min,
            ref: e.section + ' ' + e.number, text: e.text,
            unit: UNITS[u].number, predicted: e.source === 'enumerated'
          });
        }
      }
      items.sort(function (a, b) {
        if (b.stars !== a.stars) return b.stars - a.stars;
        if (QT_RANK[b.qtype] !== QT_RANK[a.qtype]) return QT_RANK[b.qtype] - QT_RANK[a.qtype];
        if (a.predicted !== b.predicted) return a.predicted ? 1 : -1;
        if (a.unit !== b.unit) return a.unit - b.unit;
        return 0;
      });
      return items;
    }

    function itemInfo(qid) {
      var q = questions[qIndexById[qid]];
      if (!q) return null;
      return { qid: qid, qtype: q.qtype, mins: q.expected_time_min,
               text: q.question_text, unit: q.unit.number };
    }

    /** The scheduler. Day 1 = startDate; the last plan day is exam-eve. The
        final ~15% of days are a full-revision block (weakest first, the
        exam-eve logic). Items that do not fit fall off the BOTTOM of the
        priority list into `optional` — and the plan says so, honestly. */
    function build(examDate, unitNums, minsPerDay, startDate, itemsOverride, scope) {
      var D = diffDays(examDate, startDate);
      if (D < 1) return null;
      var R = Math.max(1, Math.ceil(D * 0.15));
      if (R >= D) R = D > 1 ? 1 : 0;
      var L = D - R;
      var queue = (itemsOverride || itemsFor(unitNums, scope)).slice();

      // ── CRUNCH MODE (founder, 2026-08-23) ─────────────────────────────────
      // When the time left cannot fit the work — the student who ignored a
      // 45-day plan and opens the book with one week to go — the priority
      // FLIPS from stars-first to marks-first: long answers, then short
      // answers, carry the paper; the very short answers move to the back and
      // mostly land in `optional` ("do them on exam-eve"). The revision block
      // shrinks to one day so learning days survive.
      var demand = 0;
      for (var di = 0; di < queue.length; di++) demand += Math.ceil(queue[di].mins * 2.5);
      var crunch = demand > minsPerDay * L * 1.15;
      if (crunch) {
        if (D > 1) { R = 1; L = D - R; }
        queue.sort(function (a, b) {
          var av = a.qtype === 'VSAQ' ? 1 : 0, bv = b.qtype === 'VSAQ' ? 1 : 0;
          if (av !== bv) return av - bv;                     // VSAQs last, whatever their stars
          if (QT_RANK[b.qtype] !== QT_RANK[a.qtype]) return QT_RANK[b.qtype] - QT_RANK[a.qtype];
          if (b.stars !== a.stars) return b.stars - a.stars;
          if (a.predicted !== b.predicted) return a.predicted ? 1 : -1;
          return a.unit - b.unit;
        });
      }

      var learnDay = {}, byDay = [], reviseNext = [];
      for (var day = 1; day <= L; day++) {
        var budget = minsPerDay;
        var row = { learn: [], revise: [] };
        for (var r = 0; r < reviseNext.length; r++) {
          budget -= Math.ceil(reviseNext[r].mins / 2);
          row.revise.push(reviseNext[r].qid);
        }
        reviseNext = [];
        while (queue.length && queue[0].mins * 2 <= budget) {
          var nx = queue.shift();
          budget -= nx.mins * 2;
          row.learn.push(nx.qid);
          learnDay[nx.qid] = day;
          reviseNext.push(nx);
        }
        byDay.push(row);
      }
      return {
        v: 1, start: startDate, examDate: examDate,
        units: unitNums.slice(), minsPerDay: minsPerDay,
        scope: scope || null,
        days: byDay, learnDay: learnDay,
        optional: queue.map(function (x) { return x.qid; }),
        revBlockStart: L + 1, totalDays: D,
        crunch: crunch,
        implemented: false, lastNudgeDay: '', archived: false
      };
    }

    function dayN(plan, today) { return diffDays(today, plan.start) + 1; }
    function daysLeft(plan, today) { return diffDays(plan.examDate, today); }

    // Two stages since 2026-08-23 (founder): the p tick is vestigial — the
    // self-check that set it is dormant. Understand alone completes learning;
    // green = understood + revised.
    function green(qid) {
      var s = Vidi.stageFor(qid);
      return !!(s.u && s.r);
    }
    function learned(qid) {
      var s = Vidi.stageFor(qid);
      return !!s.u;
    }

    /** The plan-less revision queue (founder, 2026-08-23): anything understood
        on an EARLIER day and not yet revised, whether or not a plan exists.
        Guarded by qIndexById so a stale stage for a removed question is inert. */
    function dueWithoutPlan(today) {
      var ids = Vidi.stageIds(), out = [];
      for (var i = 0; i < ids.length; i++) {
        var s = Vidi.stageFor(ids[i]);
        if (s.u && !s.r && s.u < today && qIndexById[ids[i]] !== undefined) out.push(ids[i]);
      }
      return out;
    }

    /** Today's work, catch-up included: learns scheduled up to today and not
        yet learned; revisions = anything learned on an EARLIER day and not yet
        revised. In the final block everything unfinished revises, weakest
        self-check first. */
    function todays(plan, today) {
      var n = dayN(plan, today);
      var out = { day: n, learn: [], revise: [], finalBlock: n >= plan.revBlockStart };
      var qid;
      for (qid in plan.learnDay) {
        if (!Object.prototype.hasOwnProperty.call(plan.learnDay, qid)) continue;
        if (plan.learnDay[qid] <= Math.min(n, plan.revBlockStart - 1) && !learned(qid)) {
          out.learn.push(qid);
        }
        var s = Vidi.stageFor(qid);
        if (s.u && !s.r && s.u < today) out.revise.push(qid);
      }
      if (out.finalBlock) {
        // weakest first: lowest self-check ratio, then anything not green
        var rest = [];
        for (qid in plan.learnDay) {
          if (!Object.prototype.hasOwnProperty.call(plan.learnDay, qid)) continue;
          if (green(qid)) continue;
          if (out.learn.indexOf(qid) >= 0 || out.revise.indexOf(qid) >= 0) continue;
          rest.push(qid);
        }
        rest.sort(function (a, b) {
          var ha = Vidi.checkFor(a), hb = Vidi.checkFor(b);
          var ra = ha && ha.total ? ha.best / ha.total : 1.01;
          var rb = hb && hb.total ? hb.best / hb.total : 1.01;
          return ra - rb;
        });
        out.revise = out.revise.concat(rest);
      }
      // keep the scheduler's priority order for learns
      out.learn.sort(function (a, b) { return plan.learnDay[a] - plan.learnDay[b]; });
      return out;
    }

    function progress(plan) {
      var total = 0, done = 0, learnedN = 0, qid;
      for (qid in plan.learnDay) {
        if (!Object.prototype.hasOwnProperty.call(plan.learnDay, qid)) continue;
        total++;
        if (green(qid)) done++;
        if (learned(qid)) learnedN++;
      }
      return { total: total, done: done, learned: learnedN };
    }

    /** Behind = at least one full planned day of learning has slipped. */
    function behindBy(plan, today) {
      var n = Math.min(dayN(plan, today), plan.revBlockStart - 1);
      var expected = 0;
      for (var d = 0; d < n - 1 && d < plan.days.length; d++) expected += plan.days[d].learn.length;
      var p = progress(plan);
      var perDay = Math.max(1, Math.ceil(expected / Math.max(1, n - 1)));
      var gap = expected - p.learned;
      return gap >= perDay ? gap : 0;
    }

    /** A fresh schedule over what is NOT yet green, from today, same pace. */
    function replan(plan, today) {
      var remaining = [];
      var all = itemsFor(plan.units, plan.scope || null);
      for (var i = 0; i < all.length; i++) {
        var inPlan = Object.prototype.hasOwnProperty.call(plan.learnDay, all[i].qid);
        if (inPlan && !green(all[i].qid)) remaining.push(all[i]);
      }
      return build(plan.examDate, plan.units, plan.minsPerDay, today, remaining, plan.scope || null);
    }

    /** A fresh schedule from today with a NEW qtype scope — everything in the
        chosen chapters and the new scope that is not yet green. Widening the
        scope brings questions in; narrowing drops the finished-elsewhere types.
        Null = nothing left to plan (the caller says so, honestly). */
    function rescope(plan, today, scope) {
      var remaining = [];
      var all = itemsFor(plan.units, scope);
      for (var i = 0; i < all.length; i++) {
        if (!green(all[i].qid)) remaining.push(all[i]);
      }
      if (!remaining.length) return null;
      return build(plan.examDate, plan.units, plan.minsPerDay, today, remaining, scope);
    }

    /** A compact factual block for the hosted model — read, never generated. */
    function modelStatus(qid) {
      var plan = Vidi.getPlan();
      if (!plan || !plan.implemented || plan.archived) return null;
      var today = Vidi.todayStr();
      var p = progress(plan);
      var t = todays(plan, today);
      var lines = 'exam on ' + plan.examDate + ', ' + daysLeft(plan, today) +
        ' days left; finished ' + p.done + ' of ' + p.total + ' planned questions' +
        '; today: learn ' + t.learn.length + ', revise ' + t.revise.length;
      if (plan.crunch) {
        lines += '; time is SHORT so the plan does long and short answers first, very short answers on exam-eve';
      }
      if (plan.scope && plan.scope.length) {
        lines += '; the plan covers only ' + scopeWords(plan.scope) + ' — the student chose to skip the other types';
      }
      if (qid && Object.prototype.hasOwnProperty.call(plan.learnDay, qid)) {
        var s = Vidi.stageFor(qid);
        lines += '; THIS question is in the plan (understood ' + (s.u ? 'yes' : 'no') +
          ', revised ' + (s.r ? 'yes' : 'no') + ')';
      }
      return lines;
    }

    return {
      itemsFor: itemsFor, itemInfo: itemInfo, build: build, replan: replan,
      rescope: rescope, scopeWords: scopeWords,
      todays: todays, progress: progress, behindBy: behindBy,
      dayN: dayN, daysLeft: daysLeft, diffDays: diffDays,
      green: green, learned: learned, modelStatus: modelStatus,
      dueWithoutPlan: dueWithoutPlan
    };
  })();

  // ═══ Sync — the same progress on the student's other device ════════════
  // Anonymous by design: identity is a random UUID minted here and kept in
  // localStorage (`pm_device_id`). No login, no account, no PII — the founder's
  // journey is "open a WhatsApp link and start reading".
  //
  // OFFLINE FIRST, ALWAYS. localStorage stays the source of truth and every
  // feature works with the network down; sync is an accelerator, never a
  // dependency. With no PM_SYNC_BASE the whole module is inert — no timer, no
  // device id minted, not one request — so the file:// build and every gate
  // that asserts zero network are untouched by construction.
  //
  // One POST does both directions: we send what we have, the server merges and
  // returns the merged truth (see ab_sync in the migration). Stage ticks merge
  // by earliest-date-wins, so the call is idempotent and order-independent — a
  // retry after a dropped connection costs nothing and can never lose a tick.
  var Sync = (function () {
    var BASE = (window.PM_SYNC_BASE || '').trim();
    var PUSH_DEBOUNCE_MS = 2500;
    var timer = null, inFlight = false, again = false;

    function deviceId() {
      var id = null;
      try { id = localStorage.getItem('pm_device_id'); } catch (e) {}
      if (id && /^[0-9a-f-]{36}$/i.test(id)) return id;
      id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
          });
      try { localStorage.setItem('pm_device_id', id); } catch (e) {}
      return id;
    }

    /** Only ticks worth sending: an empty pair carries no information. */
    function rows() {
      var all = Vidi.allStages(), out = [], qid;
      for (qid in all) {
        if (!Object.prototype.hasOwnProperty.call(all, qid)) continue;
        var s = all[qid] || {};
        if (!s.u && !s.r) continue;
        out.push({ q: qid, u: s.u || '', r: s.r || '' });
      }
      return out;
    }

    function push() {
      if (!BASE || inFlight) { again = again || !!BASE; return; }
      inFlight = true;
      var plan = Vidi.getPlan();
      // A plan with no saved_at predates sync entirely, so no other device can
      // hold a competing copy — stamping it now is safe, and without a stamp
      // the server cannot tell it from a stale push and would ignore it.
      if (plan && !plan.saved_at) { plan.saved_at = new Date().toISOString(); Vidi.storePlanRaw(plan); }
      var body = {
        device_id: deviceId(),
        stages: rows(),
        plan: plan || null,
        plan_saved_at: (plan && plan.saved_at) || null
      };
      var done = function () {
        inFlight = false;
        if (again) { again = false; schedule(); }
      };
      try {
        fetch(BASE, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }).then(function (r) { return r.ok ? r.json() : null; })
          .then(function (out) { if (out && out.ok) adopt(out); done(); })
          .catch(done);          // offline is normal, never an error to show
      } catch (e) { done(); }
    }

    /** Take what the server merged. Ticks merge; the plan is last-write-wins. */
    function adopt(out) {
      var changed = Vidi.mergeStages(out.stages || []);
      var mine = Vidi.getPlan();
      var theirs = out.plan;
      if (theirs && typeof theirs === 'object') {
        var t = out.plan_saved_at || theirs.saved_at || '';
        var m = (mine && mine.saved_at) || '';
        if (t && (!m || t > m)) {
          theirs.saved_at = t;
          // Written straight to storage: Vidi.setPlan would re-stamp saved_at
          // with NOW and the adopted plan would then out-rank the very device
          // it came from, ping-ponging the two forever.
          Vidi.storePlanRaw(theirs);
          changed = true;
        }
      }
      if (changed) VidiPanel.onSynced();
    }

    function schedule() {
      if (!BASE) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () { timer = null; push(); }, PUSH_DEBOUNCE_MS);
    }

    return {
      deviceId: deviceId,
      init: function () {
        if (!BASE) return;                 // inert: no id, no timer, no request
        syncTouch = schedule;
        push();                            // the boot pull doubles as the first push
        window.addEventListener('pagehide', function () {
          if (timer) { clearTimeout(timer); timer = null; }
          push();
        });
      }
    };
  })();


  // ═══ Gate — the chapter gate of the GATED build (P3, 2026-08-23) ════════
  // In the gated build a question ships as metadata plus a boot-safe skeleton
  // (steps as {id, marks} only) with `gated: true`; the written answer lives
  // server-side in ab_content and leaves only for an entitled device. Every
  // device gets ONE free chapter, claimed by an EXPLICIT tap on the sheet —
  // never spent by a plain open (founder decision).
  //
  // With no PM_CONTENT_BASE (every full build) this module is INERT: no call,
  // no sheet, no lock chips — the same guarantee Sync makes.
  //
  // Unlocked bundles merge into `questions` IN MEMORY only. A new session
  // re-fetches — deliberate for now: a 550 KB bundle is localStorage-quota
  // roulette, and the fetch is one fast call.
  var Gate = (function () {
    var BASE = (window.PM_CONTENT_BASE || '').trim();
    var unlockedUnits = {};            // unit_key -> true
    var hasAll = false;
    var listLoaded = false;            // lock chips wait for the truth (no flicker)
    var pendingUnlock = null;          // where the student was headed before paying
    var freeAvailable = null;
    var priceInfo = null;              // what THIS device pays (server-decided)
    var paidUntil = null;
    var PAY_BASE = (window.PM_PAY_BASE || '').trim();

    function keyOfQ(q) { return (q.subject || 'physics') + '-' + q.unit.number; }

    function post(body, cb) {
      body.device_id = Sync.deviceId();
      try {
        fetch(BASE, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }).then(function (r) { return r.ok ? r.json() : null; })
          .then(function (out) { cb(out || null); })
          .catch(function () { cb(null); });
      } catch (e) { cb(null); }
    }

    function adoptStanding(out) {
      if (!out) return;
      if (typeof out.free_available === 'boolean') freeAvailable = out.free_available;
      if (typeof out.paid_until !== 'undefined') paidUntil = out.paid_until;
      if (out.sku) priceInfo = out.sku;
    }

    /** The offer line. The price ALWAYS comes from the server (ab_price_for) —
        the client never names a number, so a founding student and a later one
        each see their own truth without the page knowing the rule. */
    function offerLine() {
      if (!priceInfo || !priceInfo.price_inr) return 'Unlocking every chapter is coming soon.';
      var p = '₹' + priceInfo.price_inr + ' for ' + priceInfo.period_days + ' days';
      if (priceInfo.founding_locked) {
        return 'Unlock every chapter again — ' + p + ', your founding price.';
      }
      if (priceInfo.founding) {
        var left = priceInfo.founding_slots_left;
        return 'Unlock every chapter — ' + p + '. That is the founding price'
          + (typeof left === 'number' && left > 0 ? ' (' + left + ' places left)' : '')
          + '; it later costs ₹' + priceInfo.list_price_inr + '. Once you join at this price, it stays yours.';
      }
      return 'Unlock every chapter — ' + p + '.';
    }

    function payable() { return !!(PAY_BASE && priceInfo && priceInfo.price_inr); }

    /** Ask the server for a payment link for THIS device and hand the student
        over to Razorpay. The device id rides the payment, so the webhook can
        unlock this very phone seconds after the UPI confirmation. */
    function startPayment(i, cutKey) {
      pendingUnlock = { i: i, cutKey: cutKey };
      sheet('Opening the payment page…', []);
      var body = { device_id: Sync.deviceId() };
      try {
        fetch(PAY_BASE, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }).then(function (r) { return r.ok ? r.json() : null; })
          .then(function (out) {
            if (out && out.ok && out.url) {
              // Same tab: the callback_url brings them back to the book, and a
              // popup would be eaten by a phone browser's blocker.
              location.href = out.url;
              return;
            }
            sheet('Could not open the payment page just now. Please try again in a moment.',
              [{ label: 'Try again', primary: true, fn: function () { showLockFlow(i, cutKey); } }, backBtn()]);
          })
          .catch(function () {
            sheet('Could not reach the payment page. Check your connection and try again.',
              [{ label: 'Try again', primary: true, fn: function () { showLockFlow(i, cutKey); } }, backBtn()]);
          });
      } catch (e) { /* nothing to do — the sheet already says what happened */ }
    }

    /** Fold a fetched bundle into the live question list. */
    function mergeBundle(bundle) {
      if (!bundle || !bundle.questions || !bundle.questions.length) return false;
      var got = false;
      for (var i = 0; i < bundle.questions.length; i++) {
        var fq = bundle.questions[i];
        var idx = qIndexById[fq.question_id];
        if (idx === undefined) continue;
        delete fq.gated;
        questions[idx] = fq;
        got = true;
      }
      if (bundle.unit_key) unlockedUnits[bundle.unit_key] = true;
      return got;
    }

    // ── the sheet ───────────────────────────────────────────────────────────
    function sheet(text, buttons) {
      $('lockText').textContent = text;
      var row = $('lockRow');
      row.innerHTML = '';
      for (var i = 0; i < buttons.length; i++) {
        (function (b) {
          var el2 = document.createElement('button');
          el2.type = 'button';
          el2.className = 'vw-btn' + (b.primary ? ' primary' : '');
          el2.textContent = b.label;
          el2.addEventListener('click', function () {
            if (el2.disabled) return;
            var all = row.querySelectorAll('button');
            for (var j = 0; j < all.length; j++) all[j].disabled = true;
            b.fn();
          });
          row.appendChild(el2);
        })(buttons[i]);
      }
      $('lockOverlay').hidden = false;
    }
    function hideSheet() { $('lockOverlay').hidden = true; }
    function backBtn() {
      return { label: 'Back to all questions', fn: function () { hideSheet(); location.hash = '#/'; } };
    }

    function open(i, cutKey, bundle) {
      if (!mergeBundle(bundle)) {
        sheet('Something went wrong while opening this chapter. Try again.',
          [{ label: 'Try again', primary: true, fn: function () { showLockFlow(i, cutKey); } }, backBtn()]);
        return;
      }
      hideSheet();
      if (currentView === 'catalog') renderCatalog();
      loadQuestion(i, cutKey);
    }

    function showLocked(i, cutKey, k) {
      var buttons = [];
      var text;
      if (freeAvailable) {
        text = 'This chapter is locked. Every student gets ONE full chapter free — do you want this one as your free chapter?';
        buttons.push({ label: 'Read this chapter free', primary: true, fn: function () { claimFree(i, cutKey, k); } });
        // The paid option sits BESIDE the free one: a student who already knows
        // they want the whole book should not have to spend the gift first.
        if (payable()) {
          buttons.push({ label: 'Unlock every chapter — ₹' + priceInfo.price_inr, fn: function () { startPayment(i, cutKey); } });
        }
      } else {
        text = 'This chapter is locked. You have already used your free chapter. ' + offerLine();
        if (payable()) {
          buttons.push({ label: 'Unlock every chapter — ₹' + priceInfo.price_inr, primary: true, fn: function () { startPayment(i, cutKey); } });
        }
      }
      buttons.push(backBtn());
      sheet(text, buttons);
    }

    function claimFree(i, cutKey, k) {
      sheet('Opening your free chapter…', []);
      post({ unit_key: k, claim_free: true }, function (out) {
        adoptStanding(out);
        if (out && out.ok && out.bundle) { open(i, cutKey, out.bundle); return; }
        if (out && out.locked) { showLocked(i, cutKey, k); return; }   // slot was already spent
        showError(i, cutKey);
      });
    }

    function showError(i, cutKey) {
      sheet('Could not reach the server. Check your connection and try again.',
        [{ label: 'Try again', primary: true, fn: function () { showLockFlow(i, cutKey); } }, backBtn()]);
    }

    function showLockFlow(i, cutKey) {
      var q = questions[i];
      if (!BASE || !q) { location.hash = '#/'; return; }
      var k = keyOfQ(q);
      sheet('Opening this chapter…', []);
      post({ unit_key: k }, function (out) {
        adoptStanding(out);
        if (out && out.ok && out.bundle) { open(i, cutKey, out.bundle); return; }
        if (out && out.locked) { showLocked(i, cutKey, k); return; }
        showError(i, cutKey);
      });
    }

    return {
      showLockFlow: showLockFlow,
      /** True only when the LIST has answered and says this unit is locked —
          before that the catalog shows no lock cue rather than a wrong one. */
      locked: function (k) {
        if (!BASE || !listLoaded || hasAll) return false;
        return !unlockedUnits[k];
      },
      init: function () {
        if (!BASE) return;               // inert in every full build
        post({ list: true }, function (out) {
          if (!out || !out.ok) return;   // no list = no chips; opens still work
          adoptStanding(out);
          var u = out.unlocked || [];
          for (var i = 0; i < u.length; i++) {
            if (u[i] === 'all') hasAll = true; else unlockedUnits[u[i]] = true;
          }
          listLoaded = true;
          if (currentView === 'catalog') renderCatalog();
          // Coming back from a successful payment: the pass is live, so drop the
          // student straight into the chapter they were trying to open.
          if (hasAll && pendingUnlock) {
            var pu = pendingUnlock; pendingUnlock = null;
            showLockFlow(pu.i, pu.cutKey);
          }
        });
      }
    };
  })();

  var VidiPanel = (function () {
    var gen = 0;                        // guards late timers across question switches
    var online = true;
    var recentMsgs = [];

    function threadEl() { return $('vidiThread'); }

    function syncName() {
      var els = document.querySelectorAll('.vidi-name');
      for (var i = 0; i < els.length; i++) els[i].textContent = Vidi.getName();
    }

    /** Bubbles render with textContent, so a stray markdown mark would appear on
        screen as a literal star or hash. The persona forbids markdown; this is the
        belt-and-braces strip, because a model slip must never reach a student. */
    function plain(text) {
      return String(text == null ? '' : text)
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        // The italic span must be FLANKED by non-space, the way markdown is really
        // written (*word*, never * word *). Without that guard this rule ate the
        // multiplication signs out of a numerical: "v = 3 * 4 * 5" came back as
        // "v = 3  4  5" — silently wrong arithmetic in front of a student. Found by
        // mutation test 2026-08-22; covered in __tests__/vidiSeam.test.ts.
        .replace(/(^|\s)\*(\S|\S[^*\n]*\S)\*(?=\s|$|[.,!?])/g, '$1$2')
        .replace(/`{1,3}([^`]*)`{1,3}/g, '$1')
        .replace(/^\s{0,3}#{1,6}\s+/gm, '')
        .replace(/^\s{0,3}[-*+]\s+/gm, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    }

    function bubble(text, who) {
      var m = el('div', 'vidi-msg ' + (who || 'tutor'), plain(text));
      threadEl().appendChild(m);
      threadEl().scrollTop = threadEl().scrollHeight;
      return m;
    }

    /** Tutor bubble with a short typing beat first. extraDelay staggers a second
        bubble so two messages land in order, like a person typing twice. */
    function say(text, extraDelay) {
      var g = gen;
      var m = el('div', 'vidi-msg tutor vidi-typing', '· · ·');
      var hold = extraDelay || 0;
      m.hidden = hold > 0;
      threadEl().appendChild(m);
      threadEl().scrollTop = threadEl().scrollHeight;
      markUnread();
      if (hold > 0) {
        setTimeout(function () {
          if (g !== gen) return;
          m.hidden = false;
          threadEl().scrollTop = threadEl().scrollHeight;
        }, hold);
      }
      setTimeout(function () {
        if (g !== gen) return;
        m.classList.remove('vidi-typing');
        m.textContent = text;
        threadEl().scrollTop = threadEl().scrollHeight;
      }, hold + Math.min(900, 250 + text.length * 3));
      return m;
    }

    function objKeys(o) {
      var ks = [];
      for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ks.push(k);
      return ks;
    }

    /** The manifest entry behind the question+cut on screen (stars/source live there). */
    function manifestEntry() {
      var fallback = null;
      for (var u = 0; u < UNITS.length; u++) {
        var qs = UNITS[u].questions;
        for (var i = 0; i < qs.length; i++) {
          var e = qs[i];
          if (e.question_id !== question.question_id) continue;
          if (!fallback) fallback = e;
          var hasCuts = question.cuts && question.cuts.length;
          var entryCutKey = e.cut || (hasCuts ? question.cuts[0].key : null);
          if (!hasCuts || entryCutKey === cut.key) return e;
        }
      }
      return fallback;
    }

    function starsLine(e) {
      if (!e) return null;
      if (e.stars === 3) return 'This is a 3-star question — it is asked very often.';
      if (e.stars === 2) return 'This is a 2-star question — it has been asked more than once.';
      if (e.stars === 1) return 'This is a 1-star question.';
      return null;
    }

    /** The per-question greeting is about the STUDENT'S plan, never the bank
        (founder, 2026-08-22): no stars, no asked-years, no insider line here —
        the chips still answer all of that on demand. Without a plan, only a
        revision-due question greets (founder, 2026-08-23) — the rest open
        silently. */
    function greet() {
      var today = Vidi.todayStr();
      var qid = question.question_id;
      var s = Vidi.stageFor(qid);
      var plan = Vidi.getPlan();
      var planned = plan && plan.implemented && !plan.archived &&
        Plan.daysLeft(plan, today) >= 0 &&
        Object.prototype.hasOwnProperty.call(plan.learnDay, qid);
      if (!planned) {
        if (s.u && !s.r && s.u < today) {
          say('This one is up for revision. Go through it once more, then tap "Mark revised" below — that is what makes it stick.');
        }
        return;
      }
      var t = Plan.todays(plan, today);
      var li = t.learn.indexOf(qid);
      if (s.u && !s.r && t.revise.indexOf(qid) >= 0) {
        say('This one is up for revision today. Go through it once more, then tap "Mark revised" below — that is what makes it stick.');
      } else if (li >= 0) {
        say('This one is on today’s list — ' + (li + 1) + ' of ' + t.learn.length +
          '. Read every step. Tomorrow I will ask you to revise it.');
      } else if (Plan.green(qid)) {
        say('You have finished this one — understood and revised. It will come back in the final revision days.');
      }
    }

    // ═══ the onboarding conversation — Viditra first, then the plan ═════════
    // Chat-guided, click by click: date → chapters → hours → plan → implement.
    // Widgets are tutor bubbles that hold controls (.vidi-widget, never
    // .vidi-chip — the chip gates count #vidiChips only). All deterministic.

    var ob = { active: false, step: '', date: '', units: [], mins: 0, scope: null, draft: null };

    function widget(build) {
      var w = el('div', 'vidi-msg tutor vidi-widget');
      build(w);
      threadEl().appendChild(w);
      threadEl().scrollTop = threadEl().scrollHeight;
      return w;
    }
    function wBtn(label, primary, fn) {
      var b = el('button', 'vw-btn' + (primary ? ' primary' : ''), label);
      b.type = 'button';
      b.addEventListener('click', function () {
        if (b.disabled) return;
        // A used widget goes quiet: every control in it freezes, so an old
        // bubble can never replay a step of the conversation. A handler that
        // re-asks (failed validation) renders a FRESH widget instead.
        var w = b.parentNode;
        while (w && w !== document.body && (' ' + w.className + ' ').indexOf(' vidi-widget ') < 0) w = w.parentNode;
        if (w && w !== document.body) {
          var cs = w.querySelectorAll('button, input');
          for (var i = 0; i < cs.length; i++) cs[i].disabled = true;
        }
        bubble(label, 'student');
        fn();
      });
      return b;
    }

    function startIntro() {
      say('Hi, I am ' + Vidi.getName() + ' — welcome to Viditra.');
      // Subject-neutral: the book has held physics, chemistry AND mathematics
      // since 2026-08-23, and this line greets a student on any of them.
      say('This book holds the questions your board exam can ask, each with the answer the examiner wants, revealed step by step. I can also plan your whole preparation — day by day, revision included.', 700);
      var g = gen;
      setTimeout(function () {
        if (g !== gen) return;
        widget(function (w) {
          w.appendChild(document.createTextNode('Shall we plan your exam preparation, or jump straight in?'));
          var row = el('div', 'vw-row');
          row.appendChild(wBtn('Plan my first-term exam', true, function () {
            Vidi.markIntroDone(); startOnboarding();
          }));
          row.appendChild(wBtn('Start learning now', false, function () {
            Vidi.markIntroDone();
            say('Great — open any question and start. Each answer writes itself step by step, the way the examiner wants it. When you move on from a question I will ask how it went; anything you understood comes back tomorrow for one revision. That is what makes it stick.');
          }));
          w.appendChild(row);
        });
      }, 1800);
      if (Vidi.introSeen() >= 2) Vidi.markIntroDone();   // never nag past 2 shows
    }

    function startOnboarding() {
      ob = { active: true, step: 'date', date: '', units: [], mins: 0, scope: null, draft: null };
      askDate();
    }

    function askDate() {
      ob.step = 'date';
      say('When is your exam?');
      widget(function (w) {
        var inp = document.createElement('input');
        inp.type = 'date';
        var t = Vidi.todayStr();
        inp.min = t;
        inp.value = ob.date || '';
        var row = el('div', 'vw-row');
        row.appendChild(inp);
        row.appendChild(wBtn('Set date', true, function () {
          var v = inp.value;
          if (!v || Plan.diffDays(v, Vidi.todayStr()) < 1) {
            say('Pick a date after today — the plan needs at least one day.');
            askDate();
            return;
          }
          ob.date = v;
          bubble('My exam is on ' + v, 'student');
          askUnits();
        }));
        w.appendChild(row);
      });
    }

    function askUnits() {
      ob.step = 'units';
      say('Which chapters are in this exam? Tick every one.');
      widget(function (w) {
        var boxes = [];
        for (var i = 0; i < UNITS.length; i++) {
          (function (u) {
            var lab = el('label', 'vw-check');
            var cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.value = unitKey(u);
            if (ob.units.indexOf(unitKey(u)) >= 0) cb.checked = true;
            lab.appendChild(cb);
            lab.appendChild(document.createTextNode(
              u.number + '. ' + u.name + ' (' + u.questions.length + ' questions)'));
            w.appendChild(lab);
            boxes.push(cb);
          })(UNITS[i]);
        }
        var row = el('div', 'vw-row');
        row.appendChild(wBtn('These chapters →', true, function () {
          var picked = [];
          for (var b = 0; b < boxes.length; b++) if (boxes[b].checked) picked.push(boxes[b].value);
          if (!picked.length) { say('Tick at least one chapter.'); askUnits(); return; }
          ob.units = picked;
          askScope();
        }));
        w.appendChild(row);
      });
    }

    // ── the qtype scope — the founder's mid-prep student (2026-08-23) ───────
    // "I finished all long answers elsewhere — plan only SAQs and VSAQs."
    // A deterministic plan dimension, never the model's: all three ticked =
    // null scope = everything, so the default student never notices the step.
    var SCOPE_OPTS = [['LAQ', 'Long answers (8 marks)'], ['SAQ', 'Short answers (4 marks)'], ['VSAQ', 'Very short answers (2 marks)']];

    function scopeBoxes(w, current) {
      var boxes = [];
      for (var i = 0; i < SCOPE_OPTS.length; i++) {
        (function (key, label) {
          var lab = el('label', 'vw-check');
          var cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.className = 'vw-scope-box';
          cb.value = key;
          cb.checked = !current || current.indexOf(key) >= 0;
          lab.appendChild(cb);
          lab.appendChild(document.createTextNode(label));
          w.appendChild(lab);
          boxes.push(cb);
        })(SCOPE_OPTS[i][0], SCOPE_OPTS[i][1]);
      }
      return boxes;
    }
    /** null = every type ticked (no filter); [] = nothing ticked (invalid). */
    function pickedScope(boxes) {
      var picked = [];
      for (var b = 0; b < boxes.length; b++) if (boxes[b].checked) picked.push(boxes[b].value);
      return picked.length === SCOPE_OPTS.length ? null : picked;
    }

    function askScope() {
      ob.step = 'scope';
      say('Which of these do you still need to prepare? Tick what to keep.');
      widget(function (w) {
        var boxes = scopeBoxes(w, ob.scope);
        var row = el('div', 'vw-row');
        row.appendChild(wBtn('These types →', true, function () {
          var sc = pickedScope(boxes);
          if (sc && !sc.length) { say('Tick at least one type.'); askScope(); return; }
          ob.scope = sc;
          analyze();
        }));
        w.appendChild(row);
      });
    }

    function analyze() {
      ob.step = 'analyze';
      var items = Plan.itemsFor(ob.units, ob.scope);
      var n = { LAQ: 0, SAQ: 0, VSAQ: 0 }, mins = 0;
      for (var i = 0; i < items.length; i++) {
        n[items[i].qtype]++;
        mins += Math.ceil(items[i].mins * 2.5);
      }
      var hours = Math.round(mins / 30) / 2;      // half-hour precision
      var D = Plan.diffDays(ob.date, Vidi.todayStr());
      if (!ob.scope) {
        say('That is ' + D + ' day' + (D === 1 ? '' : 's') + ' away. Those chapters hold ' +
          n.LAQ + ' long answers, ' + n.SAQ + ' short answers and ' + n.VSAQ +
          ' very short answers — about ' + hours + ' hours of work including revision.');
      } else {
        // Scoped: count only what the student keeps, and say what is left out.
        var parts = [], skipped = [], allT = ['LAQ', 'SAQ', 'VSAQ'];
        for (var t = 0; t < allT.length; t++) {
          if (ob.scope.indexOf(allT[t]) >= 0) parts.push(n[allT[t]] + ' ' + Plan.scopeWords([allT[t]]));
          else skipped.push(allT[t]);
        }
        var list = parts.length > 1 ? parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1] : parts[0];
        say('That is ' + D + ' day' + (D === 1 ? '' : 's') + ' away. You are keeping ' + list +
          ' — about ' + hours + ' hours of work including revision.');
        say('The plan skips ' + Plan.scopeWords(skipped) + ' because you did not tick them.', 400);
      }
      say('Let us turn that into a day-by-day plan.', 700);
      var g = gen;
      setTimeout(function () {
        if (g !== gen) return;
        widget(function (w) {
          var row = el('div', 'vw-row');
          row.appendChild(wBtn('Generate my plan', true, askHours));
          w.appendChild(row);
        });
      }, 1500);
    }

    function askHours() {
      ob.step = 'hours';
      say('How long will you study each day?');
      widget(function (w) {
        var row = el('div', 'vw-row');
        var opts = [[30, '30 min'], [60, '1 hour'], [90, '1½ hours'], [120, '2 hours']];
        for (var i = 0; i < opts.length; i++) {
          (function (m, label) {
            row.appendChild(wBtn(label, false, function () { ob.mins = m; preview(); }));
          })(opts[i][0], opts[i][1]);
        }
        w.appendChild(row);
      });
    }

    function preview() {
      ob.step = 'preview';
      var plan = Plan.build(ob.date, ob.units, ob.mins, Vidi.todayStr(), null, ob.scope);
      if (!plan) { askDate(); return; }
      ob.draft = plan;
      var total = 0; for (var q in plan.learnDay) if (Object.prototype.hasOwnProperty.call(plan.learnDay, q)) total++;
      say('Here is your plan — ' + plan.totalDays + ' days, ' + total + ' questions, revision built in.');
      widget(function (w) {
        w.appendChild(document.createTextNode(plan.totalDays + ' days · ' +
          (plan.minsPerDay >= 60 ? (plan.minsPerDay / 60) + ' hour' + (plan.minsPerDay > 60 ? 's' : '') : plan.minsPerDay + ' min') + ' a day'));
        var box = el('div', 'vw-plan');
        var show = Math.min(4, plan.days.length);
        for (var d = 0; d < show; d++) {
          var row = el('div', 'vw-day');
          row.appendChild(el('span', 'vwd-n', 'Day ' + (d + 1)));
          var parts = [];
          if (plan.days[d].revise.length) parts.push('revise ' + plan.days[d].revise.length);
          if (plan.days[d].learn.length) parts.push('learn ' + plan.days[d].learn.length);
          row.appendChild(el('span', '', parts.join(' · ') || 'catch-up'));
          box.appendChild(row);
        }
        if (plan.days.length > show) {
          var dots = el('div', 'vw-day');
          dots.appendChild(el('span', 'vwd-n', '…'));
          box.appendChild(dots);
        }
        var rb = el('div', 'vw-day');
        rb.appendChild(el('span', 'vwd-n', 'Day ' + plan.revBlockStart + '–' + plan.totalDays));
        rb.appendChild(el('span', '', 'full revision, weakest first'));
        box.appendChild(rb);
        w.appendChild(box);
        if (plan.crunch) {
          // The founder's crunch strategy, said out loud: with little time,
          // long and short answers score the marks; very short answers wait.
          w.appendChild(el('div', 'vw-warn', 'Time is short, so this plan puts long answers and short answers first — they carry the marks.' +
            (plan.optional.length ? ' ' + plan.optional.length + ' questions, mostly very short answers, are left for exam-eve — do not start with them.' : '')));
        } else if (plan.optional.length) {
          w.appendChild(el('div', 'vw-warn', 'At this pace ' + plan.optional.length +
            ' lower-priority questions do not fit — they are optional. The most-asked set fits.'));
        }
        var row2 = el('div', 'vw-row');
        row2.appendChild(wBtn('Implement this plan', true, implementPlan));
        row2.appendChild(wBtn('Change hours', false, askHours));
        w.appendChild(row2);
      });
    }

    function implementPlan() {
      var plan = ob.draft;
      if (!plan) return;
      plan.implemented = true;
      plan.lastNudgeDay = Vidi.todayStr();
      Vidi.setPlan(plan);
      ob = { active: false, step: '', date: '', units: [], mins: 0, scope: null, draft: null };
      Vidi.log('plan_implemented', { days: plan.totalDays, mins: plan.minsPerDay, units: plan.units.join(','), scope: (plan.scope || []).join(',') || 'all' });
      say('Done — ' + Plan.daysLeft(plan, Vidi.todayStr()) + ' days on the clock. Here is today:');
      renderTodayCard(plan);
      updatePlanStrip();
      renderVidiChips();
      if (currentView === 'catalog') renderCatalog();
    }

    function resumeOnboarding() {
      if (ob.step === 'date') askDate();
      else if (ob.step === 'units') askUnits();
      else if (ob.step === 'scope') askScope();
      else if (ob.step === 'analyze' || ob.step === 'hours') askHours();
      else if (ob.step === 'preview') preview();
      else startOnboarding();
    }

    /** Today's work as tappable rows with the stage marks. */
    function renderTodayCard(plan) {
      var today = Vidi.todayStr();
      var t = Plan.todays(plan, today);
      widget(function (w) {
        var any = false;
        var mk = function (qid, what) {
          var info = Plan.itemInfo(qid);
          if (!info) return;
          any = true;
          var a = document.createElement('a');
          a.className = 'vw-item';
          a.href = '#/q/' + encodeURIComponent(qid);
          a.appendChild(uprMark(qid));
          a.appendChild(el('span', '', info.text.length > 46 ? info.text.slice(0, 44) + '…' : info.text));
          a.appendChild(el('span', 'vwi-what', info.qtype + ' · ' + what));
          w.appendChild(a);
        };
        var i;
        for (i = 0; i < t.revise.length && i < 5; i++) mk(t.revise[i], 'revise');
        for (i = 0; i < t.learn.length && i < 6; i++) mk(t.learn[i], 'learn');
        if (!any) w.appendChild(document.createTextNode(
          t.finalBlock ? 'Everything is revised — you are ready.' : 'Nothing due today — you are ahead.'));
      });
    }

    /** Stage badge (founder, 2026-08-23): yellow tick = understood, revision
        pending; green tick = understood + revised, done. Circle = untouched. */
    function uprMark(qid) {
      var s = Vidi.stageFor(qid);
      if (s.u && s.r) return el('span', 'upr g', '✓');
      if (s.u) return el('span', 'upr y', '✓');
      return el('span', 'upr', '○');
    }

    /** The countdown strip above the thread — outside it, so question switches
        never wipe it. */
    function updatePlanStrip() {
      var strip = $('vidiPlanStrip');
      var plan = Vidi.getPlan();
      if (!plan || !plan.implemented || plan.archived) { strip.hidden = true; return; }
      var today = Vidi.todayStr();
      var left = Plan.daysLeft(plan, today);
      if (left < 0) { strip.hidden = true; return; }
      var p = Plan.progress(plan);
      strip.innerHTML = '';
      strip.appendChild(document.createTextNode(
        'Day ' + Math.min(Plan.dayN(plan, today), plan.totalDays) + ' of ' + plan.totalDays +
        ' · ' + (left === 0 ? 'exam tomorrow' : left + ' days left') +
        ' · done ' + p.done + ' of ' + p.total));
      var behind = Plan.behindBy(plan, today);
      if (behind) strip.appendChild(el('span', 'vps-late', ' · behind by ' + behind));
      strip.hidden = false;
    }

    /** "Change my plan" — two honest paths: start over (full onboarding), or
        keep everything and change WHICH question types the plan covers (the
        founder's mid-prep student, 2026-08-23: "I finished all long answers
        elsewhere"). Either way nothing changes until the student accepts. */
    function changePlanWidget() {
      var plan = Vidi.getPlan();
      if (!plan || !plan.implemented || plan.archived) { startOnboarding(); return; }
      widget(function (w) {
        w.appendChild(document.createTextNode('Change what? Your progress ticks are kept either way.'));
        var row = el('div', 'vw-row');
        row.appendChild(wBtn('Change question types', true, function () { askScopeChange(plan); }));
        row.appendChild(wBtn('Start over', false, startOnboarding));
        w.appendChild(row);
      });
    }

    function askScopeChange(plan) {
      say('Which of these do you still need to prepare? Tick what to keep.');
      widget(function (w) {
        var boxes = scopeBoxes(w, plan.scope);
        var row = el('div', 'vw-row');
        row.appendChild(wBtn('Re-plan with these →', true, function () {
          var sc = pickedScope(boxes);
          if (sc && !sc.length) { say('Tick at least one type.'); askScopeChange(plan); return; }
          var today = Vidi.todayStr();
          var draft = Plan.rescope(plan, today, sc);
          if (!draft) {
            say('Everything in those types is already done — there is nothing left to plan. The old plan stands.');
            return;
          }
          var total = 0; for (var q in draft.learnDay) if (Object.prototype.hasOwnProperty.call(draft.learnDay, q)) total++;
          say('Here is the new plan — ' + draft.totalDays + ' days, ' + total + ' questions' +
            (sc ? ', only ' + Plan.scopeWords(sc) : '') + '. Nothing changes until you accept it.');
          widget(function (w2) {
            var r2 = el('div', 'vw-row');
            r2.appendChild(wBtn('Use this plan', true, function () {
              draft.implemented = true;
              draft.lastNudgeDay = Vidi.todayStr();
              Vidi.setPlan(draft);
              Vidi.log('plan_rescoped', { scope: (sc || []).join(',') || 'all' });
              say('Updated. Here is today:');
              renderTodayCard(draft);
              updatePlanStrip();
            }));
            r2.appendChild(wBtn('Keep the old plan', false, function () {
              say('Keeping it. Nothing changed.');
            }));
            w2.appendChild(r2);
          });
        }));
        w.appendChild(row);
      });
    }

    /** The once-a-day check-in: progress, pace, and — when the pace shows the
        plan cannot finish — a proposed re-plan the student must accept. */
    function planCheckin(plan) {
      var today = Vidi.todayStr();
      if (plan.lastNudgeDay === today) return;
      plan.lastNudgeDay = today;
      Vidi.setPlan(plan);
      var left = Plan.daysLeft(plan, today);
      if (left < 0) {
        plan.archived = true;
        Vidi.setPlan(plan);
        say('Your exam day has come — all the best. When the next exam is announced, I can plan for it too.');
        updatePlanStrip();
        return;
      }
      var p = Plan.progress(plan);
      var behind = Plan.behindBy(plan, today);
      if (!behind) {
        var t = Plan.todays(plan, today);
        say('You are on schedule — ' + p.done + ' of ' + p.total + ' done, ' +
          (left === 0 ? 'exam tomorrow.' : left + ' days left.') +
          (t.revise.length ? ' Revise ' + t.revise.length + ' first, then learn ' + t.learn.length + '.' :
            (t.learn.length ? ' Today: learn ' + t.learn.length + '.' : '')), 600);
        return;
      }
      say('You planned more than you are finishing — ' + behind +
        ' questions have slipped, and at this pace the old plan will not cover everything.', 600);
      var draft = Plan.replan(plan, today);
      if (!draft) return;
      var g = gen;
      setTimeout(function () {
        if (g !== gen) return;
        say('I have made a new plan for the ' + (left === 0 ? 'last day' : left + ' days left') +
          (draft.crunch
            ? '. In this time the long answers and short answers are what score — they come first, and the very short answers wait for exam-eve.'
            : (draft.optional.length ? ' — the most-asked core stays, ' + draft.optional.length + ' lower-priority questions become optional.' : '.')));
        widget(function (w) {
          var row = el('div', 'vw-row');
          row.appendChild(wBtn('Use this plan', true, function () {
            draft.implemented = true;
            draft.lastNudgeDay = Vidi.todayStr();
            Vidi.setPlan(draft);
            say('Updated. Here is today:');
            renderTodayCard(draft);
            updatePlanStrip();
          }));
          row.appendChild(wBtn('Keep the old plan', false, function () {
            say('Keeping it. The slipped questions join today’s list until they are done.');
          }));
          w.appendChild(row);
        });
      }, 1400);
    }

    /** The window's content when opened from the CATALOG — no question context,
        so the conversation is about the student, not a question. */
    function renderHome() {
      gen++;
      threadEl().innerHTML = '';
      recentMsgs = [];
      // The free-text field exists in hosted builds on the catalog too — the
      // founder's "there is no chat field" report, 2026-08-23: renderHome never
      // set the row, so the home conversation had no input even when hosted.
      $('vidiAskRow').hidden = !VIDI_BASE || !online;
      var chips = $('vidiChips');
      chips.innerHTML = '';
      var plan = Vidi.getPlan();
      if (ob.active) { resumeOnboarding(); return; }
      if (!Vidi.introDone()) { startIntro(); return; }
      if (plan && plan.implemented && !plan.archived) {
        updatePlanStrip();
        planCheckin(plan);
        // the check-in may have just archived the plan (exam day passed)
        plan = Vidi.getPlan();
        if (!plan || plan.archived) {
          chips.appendChild(chipBtn('Plan my next exam', startOnboarding));
          return;
        }
        renderTodayCard(plan);
        chips.appendChild(chipBtn('Show today’s plan', function () { renderTodayCard(Vidi.getPlan()); }));
        chips.appendChild(chipBtn('Change my plan', changePlanWidget));
        return;
      }
      // No plan — but revision still runs (founder, 2026-08-23): anything
      // understood on an earlier day queues here before anything new.
      var due = Plan.dueWithoutPlan(Vidi.todayStr());
      if (due.length) {
        say('Before anything new: ' + due.length +
          (due.length === 1 ? ' question' : ' questions') + ' you understood earlier ' +
          (due.length === 1 ? 'is' : 'are') + ' due for revision. Go through each once more — that is what makes it stick.');
        widget(function (w) {
          for (var i = 0; i < due.length && i < 6; i++) (function (qid) {
            var info = Plan.itemInfo(qid);
            if (!info) return;
            var a = document.createElement('a');
            a.className = 'vw-item';
            a.href = '#/q/' + encodeURIComponent(qid);
            a.appendChild(uprMark(qid));
            a.appendChild(el('span', '', info.text.length > 46 ? info.text.slice(0, 44) + '…' : info.text));
            a.appendChild(el('span', 'vwi-what', info.qtype + ' · revise'));
            w.appendChild(a);
          })(due[i]);
        });
        chips.appendChild(chipBtn('Plan my exam prep', startOnboarding));
        return;
      }
      say('Want me to plan your exam preparation? Tell me the date and the chapters, and I will build a day-by-day plan with revision.');
      chips.appendChild(chipBtn('Plan my exam prep', startOnboarding));
    }

    function currentStep() {
      if (stepIndex >= 0 && steps[stepIndex]) return steps[stepIndex];
      return steps[0] || null;
    }

    function chipBtn(label, fn) {
      var b = el('button', 'vidi-chip', label);
      b.type = 'button';
      // A tapped suggestion becomes the student's own message, then Vidi answers —
      // the conversation reads back like a real chat, not a control panel.
      b.addEventListener('click', function () {
        bubble(label, 'student');
        fn();
      });
      return b;
    }

    function renderVidiChips() {
      var row = $('vidiChips');
      row.innerHTML = '';
      row.appendChild(chipBtn('Will this come?', chipCome));
      row.appendChild(chipBtn('Why this step?', chipWhy));
      var s = currentStep();
      if (s && s.memory_tip) row.appendChild(chipBtn('How to remember?', chipTip));
      row.appendChild(chipBtn('How much to write?', chipHowMuch));
      // Planner chips are APPENDED, never prepended: the offline gate clicks the
      // FIRST chip and expects the deterministic bank answer.
      var plan = Vidi.getPlan();
      var qid = question.question_id;
      var inPlan = plan && plan.implemented && !plan.archived &&
          Object.prototype.hasOwnProperty.call(plan.learnDay, qid);
      var st = Vidi.stageFor(qid);
      // Plan questions revise any time after Understand; plan-less ones only
      // once a day has passed (founder, 2026-08-23 — learn today, revise
      // tomorrow holds even without a plan).
      if (st.u && !st.r && (inPlan || st.u < Vidi.todayStr())) {
        row.appendChild(chipBtn('Mark revised ✓', function () {
          Vidi.setStage(qid, 'r', true);
          Vidi.log('stage', { qid: qid, k: 'r' });
          say('Revised and done — full green tick.' + (inPlan ? ' ' + progressLine() : ''));
          updatePlanStrip();
          renderVidiChips();
          // The FIRST finished revision is the rename moment now that the
          // self-check is dormant (it used to ride the first completed check).
          if (!Vidi.renameOffered()) offerRename();
        }));
      }
      if (plan && plan.implemented && !plan.archived) {
        row.appendChild(chipBtn('Change my plan', changePlanWidget));
      }
      if (!plan || !plan.implemented || plan.archived) {
        row.appendChild(chipBtn('Want a study plan?', function () {
          Vidi.markIntroDone();
          startOnboarding();
        }));
      }
    }

    function progressLine() {
      var plan = Vidi.getPlan();
      if (!plan || !plan.implemented) return '';
      var p = Plan.progress(plan);
      return p.done + ' of ' + p.total + ' finished.';
    }

    function chipCome() {
      Vidi.log('chip', { chip: 'come', qid: question.question_id });
      var e = manifestEntry();
      var parts = [];
      var st = starsLine(e);
      if (st) parts.push(st);
      if (e && e.source === 'enumerated') {
        parts.push('No paper has asked it yet. It fills a gap in the chapter, so it can appear.');
      } else {
        var asked = askedLine(question);
        if (asked) parts.push(asked + '.');
      }
      if (!parts.length) parts.push('There is no exam record for this one yet.');
      parts.push('Learn the 3-star questions of this chapter first.');
      say(parts.join(' '));
    }

    function chipWhy() {
      Vidi.log('chip', { chip: 'why', qid: question.question_id,
        step: stepIndex >= 0 ? steps[stepIndex].id : null });
      if (stepIndex < 0) {
        say('Tap the page to write the first step. Then ask me again and I will explain the step you are on.');
        return;
      }
      var s = steps[stepIndex];
      var parts = ['Step "' + s.label + '":'];
      parts.push(s.why || 'this step is a required part of the full answer.');
      if (s.common_mistakes && s.common_mistakes.length) parts.push('Common mistake: ' + s.common_mistakes[0]);
      say(parts.join(' '));
    }

    function chipTip() {
      var s = currentStep();
      Vidi.log('chip', { chip: 'tip', qid: question.question_id, step: s ? s.id : null });
      if (!s || !s.memory_tip) { say('No memory tip for this step yet.'); return; }
      say('To remember "' + s.label + '": ' + s.memory_tip);
    }

    function chipHowMuch() {
      Vidi.log('chip', { chip: 'howmuch', qid: question.question_id });
      var rows = [];
      for (var i = 0; i < cut.mark_split.length; i++) {
        rows.push(cut.mark_split[i].label + ' — ' + cut.mark_split[i].marks + 'M');
      }
      say('This answer is ' + marksTotal + ' marks. The split: ' + rows.join(' · ') +
        '. Plan about ' + cut.expected_time_min + ' minutes for it.');
    }

    // ── free-text ask (exists only when the build has a chat base) ──────────

    /** What the model sees when the student asks from the CATALOG: the page
        itself, byte-stable so the prefix cache still hits in home mode. */
    function buildHomeContext() {
      var out = ['THE STUDENT IS ON THE CATALOG PAGE — no question is open on screen.',
        'The book’s chapters:'];
      for (var i = 0; i < UNITS.length; i++) {
        out.push('- ' + UNITS[i].number + '. ' + UNITS[i].name +
          ' (' + UNITS[i].questions.length + ' questions)');
      }
      out.push('If they ask about one specific question, ask them to open it from the catalog so you can see it.');
      return out.join('\n');
    }

    function friendlyOffline() {
      online = false;
      $('vidiAskRow').hidden = true;
      say('I cannot answer questions right now. Everything else in the book still works.');
    }

    function postAsk(body, retriesLeft) {
      return fetch(VIDI_BASE + '/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }).then(function (r) {
        return r.json().then(function (b) { return { ok: r.ok, body: b }; });
      }).catch(function (err) {
        if (retriesLeft > 0) {
          return new Promise(function (resolve) { setTimeout(resolve, 800); })
            .then(function () { return postAsk(body, retriesLeft - 1); });
        }
        throw err;
      });
    }

    /** Byte-stable per question+cut, so the model's prompt-prefix cache hits. */
    function buildVidiContext() {
      var out = [];
      out.push('QUESTION: ' + (cut.question_text || question.question_text));
      out.push('SECTION: ' + cut.paper_section + ' · ' + cut.qtype + ' · ' + marksTotal +
        ' marks · about ' + cut.expected_time_min + ' minutes');
      if (question.chapter) out.push('CHAPTER: ' + question.chapter);
      var e = manifestEntry();
      // Say what the rank MEANS, both ways. The old line emitted a bare "STARS: 0" on a
      // sourced card and "STARS: 0 · predicted, not asked yet" on an enumerated one, and
      // four independent graders caught the model reading those as two different
      // rankings — "the book predicts it IS likely to be asked" on one card and "predicts
      // it is not asked often" on another, from the same underlying 0. The second half
      // fixes a separate contradiction they all hit: cards carrying STARS 0 alongside
      // five Asked years. Stars are the book's rank; the Asked line is exam history; the
      // context never said they were independent.
      // Compute the Asked line FIRST: the rank gloss may only point at it when
      // it exists. Measured 2026-08-25 -- only 7 of 204 chemistry cards carry
      // one, and an earlier version of this gloss told the model to read a line
      // that was absent on the other 197. Four graders reported the dangling
      // pointer; every reply had to improvise the absence.
      var asked = askedLine(question);
      if (e) {
        out.push(e.source === 'enumerated'
          ? 'STARS: ' + e.stars + ' — this question is PREDICTED: the source book does not ask it, so it carries no frequency rank and no exam history. Do not tell the student it is frequently asked, and do not say the book ranked it.'
          : 'STARS: ' + e.stars + ' of 3 — the source book’s frequency rank (3 = asked very often, 0 = the book gives it no star). Frequency rank and exam history are separate facts: report each only from the line that states it.'
          + (asked ? ' An Asked line below gives this question’s exam history.'
                   : ' No Asked line is given for this question, so the book records no exam years for it — say that plainly rather than concluding it was never asked.'));
      }
      if (asked) out.push(asked);
      var split = [];
      for (var i = 0; i < cut.mark_split.length; i++) {
        split.push(cut.mark_split[i].label + ' ' + cut.mark_split[i].marks + 'M');
      }
      out.push('MARK SPLIT: ' + split.join(' · '));
      // Every split in the bank is the source book's claim until a Telangana IPE
      // teacher confirms it (verification.needs_teacher_verification is true on
      // all 157). The model must be able to say so when asked instead of
      // presenting the split as a board-issued rubric; the persona governs WHEN.
      // An enumerated question is NOT in the source book, so the book cannot
      // have printed a mark split for it. Saying otherwise launders an authored
      // split as a sourced one -- four graders in four slices named this the
      // highest-value defect in the round-2 corpus, because this is the sentence
      // that licenses a reply to say "the book gives 1 mark for ...".
      if (question.verification && question.verification.needs_teacher_verification) {
        out.push(e && e.source === 'enumerated'
          ? 'VERIFICATION: this question is predicted, so this mark split was authored for it, not copied from the source book, and no board teacher has confirmed it. Never call it the book’s split.'
          : 'VERIFICATION: this mark split is the source book’s, not yet confirmed by a board teacher.');
      }
      // One examiner-insight sentence. It already opens the deterministic
      // greeting; the model was never given it, so it could not build on it.
      if (question.insider_note) out.push('INSIDER POINT: ' + question.insider_note);
      // The same answer at its OTHER authored lengths — without this the model
      // invents a 4-mark scheme the moment a student asks (found in a real chat).
      if (question.cuts && question.cuts.length > 1) {
        out.push('OTHER LENGTHS OF THIS SAME ANSWER (also in the bank — the student can open them from the catalog):');
        for (var c2 = 0; c2 < question.cuts.length; c2++) {
          var oc = question.cuts[c2];
          if (oc.key === cut.key) continue;
          var os = [];
          for (var m2 = 0; m2 < oc.mark_split.length; m2++) {
            os.push(oc.mark_split[m2].label + ' ' + oc.mark_split[m2].marks + 'M');
          }
          out.push('- ' + oc.label + ' (' + oc.qtype + ', ' + oc.marks_total + 'M): split ' +
            os.join(' · ') + '; it keeps ONLY these steps: ' + objKeys(oc.steps).join(', '));
        }
      }
      // The chapter's 3-star set — the #1 follow-up question a crammer asks.
      // Say SOME. The cap of 6 silently drops 3-star questions in the bigger
      // chapters, and graders caught replies quoting this list to a student as the
      // complete set ("the book lists disproportionation and comproportionation as
      // the 3-star ones") while two 3-star SAQs in that very chapter were invisible
      // to it. A partial list presented as whole is a wrong answer, not a short one.
      var mates = chapterMates(question, 6);
      if (mates.length) {
        out.push('SOME OF THIS CHAPTER\u2019S OTHER MOST-ASKED (3-star) QUESTIONS (a partial list, never present it as the complete set): ' + mates.join(' | '));
      }
      out.push('THE MODEL ANSWER, step by step:');
      for (var k = 0; k < steps.length; k++) {
        var s = steps[k];
        out.push(String(k + 1) + '. [' + s.id + '] ' + s.label + ' — ' + s.marks + 'M');
        if (s.kind === 'diagram') {
          // Naming the labels lets the model answer "what goes in the figure?"
          // from the bank instead of guessing a plausible diagram.
          var figLabels = [];
          if (s.figure && s.figure.elements) {
            for (var fe = 0; fe < s.figure.elements.length; fe++) {
              var elx = s.figure.elements[fe];
              if (elx.type === 'label' && elx.text) figLabels.push(elx.text);
            }
          }
          out.push('   WRITE: a labelled figure' +
            (figLabels.length ? ', labelled: ' + figLabels.join(' · ') : ''));
        } else if (s.lines) {
          var lt = [];
          for (var j = 0; j < s.lines.length; j++) {
            var spec = typeof s.lines[j] === 'string' ? { text: s.lines[j] } : s.lines[j];
            lt.push(spec.text);
          }
          out.push('   WRITE: ' + lt.join(' / '));
        }
        // Which mark-split row this step earns. Authored on all 405 marked steps
        // and never sent before — it is the bank's own step→mark mapping, and a
        // missing mark fact is what made the model invent a split in a real chat.
        if (s.mark_note) out.push('   EARNS THE MARK FOR: ' + s.mark_note);
        if (s.why) out.push('   WHY: ' + s.why);
        if (s.common_mistakes && s.common_mistakes.length) out.push('   MISTAKES: ' + s.common_mistakes.join(' | '));
        if (s.memory_tip) out.push('   REMEMBER: ' + s.memory_tip);
        if (s.margin_note) out.push('   NOTE: ' + s.margin_note);
      }
      return out.join('\n');
    }

    function vidiAsk() {
      if (!VIDI_BASE || !online) return;
      var input = $('vidiInput');
      var txt = String(input.value || '').replace(/\s+/g, ' ').trim();
      if (!txt) return;
      input.value = '';
      bubble(txt, 'student');
      recentMsgs.push({ role: 'student', text: txt });
      if (recentMsgs.length > 12) recentMsgs = recentMsgs.slice(-12);
      var g = gen;
      var typing = el('div', 'vidi-msg tutor vidi-typing', '· · ·');
      threadEl().appendChild(typing);
      threadEl().scrollTop = threadEl().scrollHeight;
      // On the CATALOG there is no question on screen — the module globals
      // still hold PM_QUESTIONS[0] as a boot fallback, and grounding the model
      // in a question the student cannot see would be worse than saying so.
      // Home mode sends the catalog itself as the context.
      var home = currentView !== 'notebook';
      var body = {
        session_id: Vidi.session,
        question_id: home ? 'home' : question.question_id,
        unit: home ? 0 : question.unit.number,
        cut_key: home ? 'home' : cut.key,
        step_id: (!home && stepIndex >= 0) ? steps[stepIndex].id : null,
        question: txt,
        recent_messages: recentMsgs.slice(-6),
        // NOT in tutor_context: that string is byte-stable per question+cut so
        // the model's prompt-prefix cache hits; plan facts change daily, so
        // they ride the per-request situation block server-side instead.
        plan_status: Plan.modelStatus(home ? null : question.question_id) || undefined,
        tutor_context: home ? buildHomeContext() : buildVidiContext()
      };
      postAsk(body, 1).then(function (res) {
        if (g !== gen) return;
        typing.remove();
        var reply = res.ok && res.body && res.body.reply
          ? plain(res.body.reply)
          : 'I cannot answer that right now. The book still works — keep going.';
        bubble(reply, 'tutor');
        recentMsgs.push({ role: 'tutor', text: reply });
      }).catch(function () {
        if (g !== gen) return;
        typing.remove();
        friendlyOffline();
      });
    }

    // ── the window: open/minimize + drag + persistence ──────────────────────
    // The window is a body-level fixed element (never inside the rail), so the
    // nb-only sweep in showView cannot manage it — syncView does, per view.

    var winOpen = false;

    function winEl() { return $('pm-assistant-slot'); }

    function saveWin(patch) {
      var w = Vidi.getWin() || {};
      if (patch) for (var k in patch) if (Object.prototype.hasOwnProperty.call(patch, k)) w[k] = patch[k];
      w.open = winOpen ? 1 : 0;
      Vidi.setWin(w);
    }

    /** Re-apply a dragged position, clamped so the header can never leave reach. */
    function applyStoredPos() {
      var w = Vidi.getWin();
      var el2 = winEl();
      if (w && typeof w.x === 'number' && typeof w.y === 'number') {
        el2.style.left = Math.max(6, Math.min(w.x, window.innerWidth - 90)) + 'px';
        el2.style.top = Math.max(6, Math.min(w.y, window.innerHeight - 60)) + 'px';
        el2.style.right = 'auto'; el2.style.bottom = 'auto';
      }
    }

    /** ≥1180px the window docks as the third column and the notebook view yields
        margin — the class drives that CSS, and the page column must re-fit since
        no real resize event fires on a class toggle. */
    function syncDock() {
      document.body.classList.toggle('vidi-docked', winOpen && currentView === 'notebook');
      fitNotebook();
    }

    function openWin() {
      winOpen = true;
      winEl().hidden = false;
      $('vidiFab').hidden = true;
      $('vidiFab').classList.remove('vf-unread');
      applyStoredPos();
      var t = threadEl(); t.scrollTop = t.scrollHeight;
      saveWin(null);
      syncDock();
    }

    function minWin() {
      winOpen = false;
      winEl().hidden = true;
      // the pill returns wherever the window itself lives (notebook + catalog)
      if (currentView === 'notebook' || currentView === 'catalog') $('vidiFab').hidden = false;
      saveWin(null);
      syncDock();
    }

    /** showView calls this. The window lives in the notebook AND the catalog —
        the catalog is where the study-plan conversation happens (the planner,
        2026-08-22). Exam-eve stays chrome-free. */
    function syncView(nb) {
      var here = nb || currentView === 'catalog';
      if (!here) { winEl().hidden = true; $('vidiFab').hidden = true; syncDock(); return; }
      if (winOpen) { winEl().hidden = false; $('vidiFab').hidden = true; }
      else { winEl().hidden = true; $('vidiFab').hidden = false; }
      syncDock();
    }

    function markUnread() {
      if (!winOpen) $('vidiFab').classList.add('vf-unread');
    }

    /** Dictation into the ask field — on-device SpeechRecognition, en-IN pinned
        (Rule 30i), auto-sends on a final result. This is INPUT only: grading by
        voice (the recall check) is a separate, deliberately unbuilt rung. */
    function initMic() {
      var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      var btn = $('vidiMic');
      if (!SR) { btn.hidden = true; return; }
      var rec = null;
      var active = false;
      btn.addEventListener('click', function () {
        if (active) { try { rec.stop(); } catch (e) {} return; }
        rec = new SR();
        rec.lang = 'en-IN';
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        active = true;
        btn.classList.add('rec');
        rec.onresult = function (ev) {
          var t = ev.results && ev.results[0] && ev.results[0][0] ? ev.results[0][0].transcript : '';
          if (t) { $('vidiInput').value = t; vidiAsk(); }
        };
        rec.onend = function () { active = false; btn.classList.remove('rec'); };
        rec.onerror = function () { active = false; btn.classList.remove('rec'); };
        try { rec.start(); } catch (e) { active = false; btn.classList.remove('rec'); }
      });
    }

    /** Drag by the header (desktop only — the phone sheet ignores position). */
    function initDrag() {
      var head = $('vidiHead');
      var sx = 0, sy = 0, ox = 0, oy = 0, dragging = false;
      head.addEventListener('pointerdown', function (e) {
        if (e.target && e.target.id === 'vidiClose') return;
        if (window.innerWidth <= 720) return;        // sheet: no drag
        if (window.innerWidth >= 1180) return;       // docked column: no drag
        var r = winEl().getBoundingClientRect();
        dragging = true; sx = e.clientX; sy = e.clientY; ox = r.left; oy = r.top;
        try { head.setPointerCapture(e.pointerId); } catch (err) {}
        e.preventDefault();
      });
      head.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var el2 = winEl();
        var x = Math.max(6, Math.min(ox + e.clientX - sx, window.innerWidth - el2.offsetWidth - 6));
        var y = Math.max(6, Math.min(oy + e.clientY - sy, window.innerHeight - 52));
        el2.style.left = x + 'px'; el2.style.top = y + 'px';
        el2.style.right = 'auto'; el2.style.bottom = 'auto';
      });
      head.addEventListener('pointerup', function () {
        if (!dragging) return;
        dragging = false;
        var r = winEl().getBoundingClientRect();
        saveWin({ x: Math.round(r.left), y: Math.round(r.top) });
      });
    }

    // ── rename — offered ONCE, after the first completed self-check ─────────

    function offerRename() {
      Vidi.markRenameOffered();
      $('vidiRename').hidden = false;
      $('vidiRenameNote').textContent = 'You can give me your own name if you want. Type a name, or keep Vidi.';
      say('Good work finishing this one. You can give me your own name if you want — see the box below.');
      Vidi.log('rename_offered', {});
    }

    function saveRename() {
      var v = $('vidiNameInput').value;
      if (Vidi.setName(v)) {
        $('vidiRename').hidden = true;
        syncName();
        say('Done. From now on I am ' + Vidi.getName() + '.');
        Vidi.log('rename', { name: Vidi.getName() });
      } else {
        $('vidiRenameNote').textContent = 'That name will not work here. Please pick a different one.';
      }
    }

    function keepRename() {
      $('vidiRename').hidden = true;
      Vidi.log('rename_kept', {});
    }

    return {
      /** Another device's progress just landed. Repaint what is on screen —
          never a bubble: a student who did not ask for a sync should not be
          interrupted by one. */
      onSynced: function () {
        updatePlanStrip();
        if (currentView === 'catalog') renderCatalog();
        else if (currentView === 'notebook') renderVidiChips();
      },
      syncName: syncName,
      onQuestion: function () {
        gen++;
        threadEl().innerHTML = '';
        recentMsgs = [];
        $('vidiAskRow').hidden = !VIDI_BASE || !online;
        updatePlanStrip();
        if (ob.active) {
          resumeOnboarding();                    // mid-onboarding navigation
        } else if (!Vidi.introDone()) {
          startIntro();                          // first experience = Viditra, never stars
        } else {
          var plan = Vidi.getPlan();
          if (plan && plan.implemented && !plan.archived) planCheckin(plan);
          greet();                               // plan-aware; silent without a plan
        }
        renderVidiChips();
        // First question ever on this device: open the window once so the
        // student MEETS Vidi. After that, respect what they chose.
        var w = Vidi.getWin();
        if (!w || w.open) openWin(); else minWin();
        Vidi.log('open_q', { qid: question.question_id, cut: cut.key });
      },
      /** View change (catalog / exam-eve). Keeps the strip current, and on the
          catalog pulses the pill until the intro has been seen. */
      onView: function (v) {
        updatePlanStrip();
        if (v === 'catalog' && !Vidi.introDone()) markUnread();
      },
      /** The fab on the CATALOG opens the home conversation (plan status /
          onboarding). On the notebook it re-opens the question thread as-is. */
      openHome: function () {
        openWin();
        if (currentView !== 'notebook') renderHome();
      },
      /** Called after a stage auto-tick so visible progress stays current. */
      onStageTick: function () {
        updatePlanStrip();
        renderVidiChips();
      },
      onStep: function () { renderVidiChips(); },
      // Read-only. The shakedown harness used to re-implement this builder in
      // TypeScript and had drifted from it on seven axes (cut projection, cut
      // mark_split, cut-aware stars, the other-cuts skip…), so it was probing the
      // model with grounding text no student ever sees. One builder, exposed.
      buildContext: buildVidiContext,
      onCheckClosed: function (offer) { if (offer) { openWin(); offerRename(); } },
      openWin: openWin,
      minWin: minWin,
      syncView: syncView,
      initDrag: initDrag,
      initMic: initMic,
      ask: vidiAsk,
      saveRename: saveRename,
      keepRename: keepRename
    };
  })();

  /** Vidi's chapter triage — shown only when ONE chapter is filtered and no
      search is active. Own link classes: the card-count and search gates must
      never see these as cards. */
  function renderTriage() {
    var box = $('vidiTriage');
    if (catFilter.unit === 'ALL' || catFilter.search) { box.hidden = true; return; }
    var u = null;
    for (var i = 0; i < UNITS.length; i++) if (unitKey(UNITS[i]) === catFilter.unit) u = UNITS[i];
    if (!u) { box.hidden = true; return; }
    var picks = [];
    for (var st = 3; st >= 2 && picks.length < 5; st--) {
      for (var k = 0; k < u.questions.length && picks.length < 5; k++) {
        var e = u.questions[k];
        if (e.question_id && e.stars === st) picks.push(e);
      }
    }
    if (!picks.length) { box.hidden = true; return; }
    box.innerHTML = '';
    var head = el('div', 'vt-head');
    head.appendChild(el('span', 'vidi-dot'));
    head.appendChild(el('span', 'vidi-name', Vidi.getName()));
    box.appendChild(head);
    box.appendChild(el('div', 'vt-lead', 'Start with these — they are asked most often in this chapter:'));
    var links = el('div', 'vidi-tri-links');
    for (var p = 0; p < picks.length; p++) {
      var pe = picks[p];
      var a = document.createElement('a');
      a.className = 'vidi-tri-link';
      a.setAttribute('href', '#/q/' + encodeURIComponent(pe.question_id) +
        (pe.cut ? '/' + encodeURIComponent(pe.cut) : ''));
      a.textContent = pe.section + ' ' + pe.number + ' — ' + pe.text + ' ';
      a.appendChild(el('span', 'vt-m', '(' + new Array(pe.stars + 1).join('★') + ')'));
      links.appendChild(a);
    }
    box.appendChild(links);
    var eve = document.createElement('a');
    eve.className = 'vidi-eve-link';
    eve.setAttribute('href', '#/exam-eve/' + unitKey(u));
    eve.textContent = 'Exam soon? Open the 15-minute list →';
    box.appendChild(eve);
    box.hidden = false;
  }

  /** #/exam-eve/<unit> — the 15-minute list: weakest self-checks first, then the
      most-asked questions of the chapter. Deterministic; history from localStorage. */
  function showExamEve(unitRef) {
    // unitRef: 'physics-4' (subject-qualified) or a bare '4' from a historic
    // link — the bare form takes the FIRST unit with that number (= physics,
    // which is what every pre-merge link meant).
    var u = null;
    for (var i = 0; i < UNITS.length; i++) {
      var cand = UNITS[i];
      if (String(unitRef) === unitKey(cand) || String(cand.number) === String(unitRef)) { u = cand; break; }
    }
    if (!u) { location.hash = '#/'; return; }
    showView('exam-eve');
    $('eveTitle').textContent = 'Unit ' + u.number + ' — ' + u.name;
    $('eveSub').textContent = Vidi.getName() + ' picked these. About 15 minutes: weakest first, then the most-asked.';
    var body = $('eveBody');
    body.innerHTML = '';

    var weak = [];
    for (var k = 0; k < u.questions.length; k++) {
      var e = u.questions[k];
      if (!e.question_id) continue;
      var h = Vidi.checkFor(e.question_id);
      if (h && h.total > 0 && h.best < h.total) weak.push({ e: e, r: h.best / h.total, h: h });
    }
    weak.sort(function (a, b) { return a.r - b.r; });
    weak = weak.slice(0, 3);

    var inWeak = {};
    for (var w = 0; w < weak.length; w++) inWeak[weak[w].e.ref] = true;
    var most = [];
    for (var st = 3; st >= 2; st--) {
      for (var m = 0; m < u.questions.length; m++) {
        if (most.length >= 7 - weak.length) break;
        var me = u.questions[m];
        if (me.question_id && !inWeak[me.ref] && me.stars === st) most.push(me);
      }
    }

    if (weak.length) {
      var g1 = el('div', 'eve-group');
      g1.appendChild(el('h3', null, 'Check these again'));
      for (var a = 0; a < weak.length; a++) g1.appendChild(eveCard(weak[a].e, weak[a].h));
      body.appendChild(g1);
    }
    if (most.length) {
      var g2 = el('div', 'eve-group');
      g2.appendChild(el('h3', null, 'The most-asked questions'));
      for (var b = 0; b < most.length; b++) g2.appendChild(eveCard(most[b], null));
      body.appendChild(g2);
    }
    if (!weak.length && !most.length) {
      body.appendChild(el('p', 'eve-empty',
        'Nothing to list yet. Open questions from the catalog and check yourself — your weakest ones will appear here.'));
    }
    Vidi.log('exam_eve', { unit: unitKey(u) });
  }

  function eveCard(e, h) {
    var a = document.createElement('a');
    a.className = 'eve-card';
    a.setAttribute('href', '#/q/' + encodeURIComponent(e.question_id) +
      (e.cut ? '/' + encodeURIComponent(e.cut) : ''));
    var main = el('div', 'ev-main');
    var top = el('div', 'ev-top');
    top.appendChild(el('span', 'ev-ref', e.section + ' ' + e.number));
    if (e.stars > 0) top.appendChild(el('span', 'ev-stars', new Array(e.stars + 1).join('★')));
    if (h) top.appendChild(el('span', 'ev-score', 'Your check: ' + fmtMarks(h.best) + ' of ' + h.total));
    main.appendChild(top);
    main.appendChild(el('div', 'ev-text', e.text));
    a.appendChild(main);
    return a;
  }

  function initVidi() {
    VidiPanel.syncName();
    VidiPanel.initDrag();
    VidiPanel.initMic();
    $('vidiFab').addEventListener('click', VidiPanel.openHome);
    $('vidiClose').addEventListener('click', VidiPanel.minWin);
    $('vidiSend').addEventListener('click', VidiPanel.ask);
    $('vidiInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') VidiPanel.ask();
    });
    $('vidiNameSave').addEventListener('click', VidiPanel.saveRename);
    $('vidiNameKeep').addEventListener('click', VidiPanel.keepRename);
    document.addEventListener('pm:step-revealed', VidiPanel.onStep);
    window.addEventListener('pagehide', Vidi.flush);
  }

  // ═══ AI assistant seam (read-only; see docs/patterns/answer_book.md) ══════

  window.PM_ANSWER = Object.freeze({
    version: 1,
    // A GETTER, not a captured value. `question` is reassigned by
    // switchQuestion, and a plain property froze the boot-time question — so
    // after a switch this seam kept describing the previous one. Object.freeze
    // stops the accessor being redefined; it does not stop it being read.
    get question() { return question; },
    get questionIds() { return questions.map(function (q) { return q.question_id; }); },
    getState: function () {
      return {
        stepIndex: stepIndex,
        stepId: stepIndex >= 0 ? steps[stepIndex].id : null,
        marksEarned: marksEarned,
        marksTotal: marksTotal,
        pageCount: pageBodies.length,
        // Which length is on screen. Anything reading marksTotal needs this to
        // know what it is a total OF.
        cutKey: cut.key,
        cutIndex: cutIndex,
        stepIds: steps.map(function (s) { return s.id; })
      };
    },
    /** The cuts this question offers, for a caller that wants to switch. */
    listCuts: function () {
      return cuts.map(function (c, i) {
        return { key: c.key, label: c.label, qtype: c.qtype,
                 marks_total: c.marks_total, active: i === cutIndex };
      });
    },
    setCut: function (key) {
      for (var i = 0; i < cuts.length; i++) {
        if (cuts[i].key === key) { switchCut(i); return true; }
      }
      return false;
    },
    /** Route to a question (optionally a specific cut) through the hash, so the
        URL stays truthful. Loads synchronously; the hash is synced after. */
    openQuestion: function (id, cutKey) {
      if (qIndexById[id] === undefined) return false;
      showView('notebook');
      loadQuestion(qIndexById[id], cutKey || null);
      syncHash();
      return true;
    },
    /** Back to the catalog view. */
    openCatalog: function () { location.hash = '#/'; showCatalog(); },
    goToStep: function (stepId) {
      for (var i = 0; i < steps.length; i++) {
        if (steps[i].id === stepId) { renderUpTo(i, true); return true; }
      }
      return false;
    },
    revealNext: advance,
    revealAll: function () { renderUpTo(steps.length - 1, false); },
    /** The exact ANSWER FACTS string the model is grounded in for the question and
        cut currently on screen. Read-only, and the reason it exists: the offline
        shakedown must probe with the SAME grounding a student's chat sends, and a
        second implementation of it had already drifted. */
    vidiContext: function () { return VidiPanel.buildContext(); }
  });

  // ═══ boot — behind the web-font gate (measuring in fallback `cursive`
  //     breaks every frozen height when Kalam swaps in) ══════════════════════
  // EVERYTHING waits for the gate, catalog included: a deep link (#/q/<id>)
  // routes straight into the notebook, which measures — so routing before the
  // fonts settle would freeze wrong heights on exactly the shareable path.

  $('boardLabel').textContent = question.board_label;
  var fontLoad = (document.fonts && document.fonts.load)
    ? Promise.all([document.fonts.load('26px Kalam'), document.fonts.load('700 26px Kalam')])
    : Promise.resolve();
  Promise.race([
    fontLoad.then(function () { return document.fonts.ready; }),
    new Promise(function (r) { setTimeout(r, 2500); })
  ]).then(function () {
    initTest();
    initVidi();
    Sync.init();
    Gate.init();
    route();
    window.addEventListener('hashchange', route);
  });
})();
