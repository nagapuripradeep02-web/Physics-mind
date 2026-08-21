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
      vn.textContent = 'Mark split not yet confirmed by a board teacher. ' +
        'The physics and the method are checked; the exact split is a claim.';
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
    syncHash();
  }

  /** Full question load — the mechanism behind the router. Always re-renders,
      even for the already-active question, so a route can be trusted blindly. */
  function loadQuestion(i, cutKey) {
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
  var catFilter = { qtype: 'ALL', unit: 'ALL', search: '' };

  function showView(v) {
    currentView = v;
    var nb = v === 'notebook';
    $('catalogView').hidden = nb;
    $('notebookView').hidden = !nb;
    $('btnCatalog').hidden = !nb;
    var only = document.querySelectorAll('.nb-only');
    for (var i = 0; i < only.length; i++) only[i].hidden = !nb;
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

  function entryMatches(e, u) {
    if (catFilter.qtype !== 'ALL' && e.section !== catFilter.qtype) return false;
    if (catFilter.unit !== 'ALL' && u.number !== catFilter.unit) return false;
    if (catFilter.search) {
      var blob = (e.section + ' ' + e.section + e.number + ' ' + e.section + ' ' + e.number +
                  ' ' + e.text + ' ' + u.name).toLowerCase();
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
        unitChips.push({ key: u.number, label: u.name, n: u.questions.length });
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
      var SECTIONS = [
        { key: 'LAQ', label: 'Long Answer Questions · 8 marks' },
        { key: 'SAQ', label: 'Short Answer Questions · 4 marks' },
        { key: 'VSAQ', label: 'Very Short Answer Questions · 2 marks' }
      ];
      SECTIONS.forEach(function (sg) {
        var group = visible.filter(function (e) { return e.section === sg.key; });
        if (!group.length) return;

        var sh = document.createElement('h3');
        sh.className = 'cat-subhead';
        sh.textContent = sg.label;
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

  function route() {
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
        if (style === 'boxed') {
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

  function typeLines(block, onDone) {
    var targets = [];                    // {el, text} — el receives the chars
    var lineEls = block.querySelectorAll('.line');
    for (var i = 0; i < lineEls.length; i++) {
      var el = lineEls[i];
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
      targets.forEach(function (t) { t.el.textContent = t.text; });
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
      lineEls[i].style.height = lineEls[i].offsetHeight + 'px';
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

  // ═══ test yourself (overlay) ═════════════════════════════════════════════
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
    // In readMode the lead line below already says "tick what you wrote", so the
    // caveat only has to carry the RULE. Saying both in full reads as nagging.
    box.appendChild(el('p', 'recall-caveat', confirmMode
      ? 'Only what you tick is counted.'
      : 'This is an estimate from what you said out loud. In the exam the marks come from what you write on the paper.'));

    function refresh() {
      head.textContent = (confirmMode ? 'Confirmed ' : 'About ') +
        fmtMarks(total()) + ' out of ' + res.marks_total + ' marks.';
      if (redoBox) redoBox.replaceWith(redoBox = redoList(res, confirmed));
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
    revealAll: function () { renderUpTo(steps.length - 1, false); }
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
    route();
    window.addEventListener('hashchange', route);
  });
})();
