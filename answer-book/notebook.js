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

  var question = (window.PM_QUESTIONS || [])[0];
  if (!question) { document.body.textContent = 'No question data in this build.'; return; }
  var steps = question.answer.steps;
  var marksTotal = question.marks_total;

  // ── state ─────────────────────────────────────────────────────────────────
  var stepIndex = -1;             // last fully revealed step
  var marksEarned = 0;
  /**
   * 'study' — tap through, with the why/mistake teaching cards in the rail
   * 'exam'  — tap through, no extras (byte-identical to the original behaviour)
   * 'test'  — the notebook starts blank; the student writes on paper or speaks it
   * Every switch routes through renderUpTo() so in-flight typing timers are
   * cancelled — clearing #notebook directly would leave orphan timers that still
   * mutate stepIndex/marksEarned when they fire.
   */
  var mode = 'study';
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

  function renderChrome() {
    $('boardLabel').textContent = question.board_label;

    var meta = $('questionMeta');
    var chips = [
      question.class_label,
      question.subject.charAt(0).toUpperCase() + question.subject.slice(1),
      'Unit ' + question.unit.number + ' · ' + question.unit.name,
      question.paper_section + ' · ' + question.qtype,
      'about ' + question.expected_time_min + ' minutes'
    ];
    chips.forEach(function (c) {
      var el = document.createElement('span');
      el.className = 'chip';
      el.textContent = c;
      meta.appendChild(el);
    });
    var marksChip = document.createElement('span');
    marksChip.className = 'chip chip-marks';
    marksChip.textContent = question.marks_total + ' marks';
    meta.appendChild(marksChip);

    $('questionText').textContent = 'Q. ' + question.question_text;
    $('accTotal').textContent = '/' + marksTotal;

    var split = $('markSplit');
    question.mark_split.forEach(function (row) {
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

    if (question.verification && question.verification.needs_teacher_verification) {
      var vn = $('verifyNote');
      vn.hidden = false;
      vn.textContent = 'Mark split not yet confirmed by a board teacher. ' +
        'The physics and the method are checked; the exact split is a claim.';
    }

    var list = $('stepList');
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

    // Rail teaching layer. `next` is the step the student is about to write, which
    // is the one the guidance should describe.
    var next = steps[stepIndex + 1];
    var teaching = mode === 'study';

    var noteCard = $('marginNoteCard');
    if (next && next.margin_note && mode !== 'test') {
      noteCard.hidden = false;
      $('marginNote').textContent = next.margin_note;
    } else {
      noteCard.hidden = true;
    }

    var whyCard = $('whyCard');
    if (teaching && next && next.why) {
      whyCard.hidden = false;
      $('whyNote').textContent = next.why;
    } else {
      whyCard.hidden = true;
    }

    var mistakeCard = $('mistakeCard');
    var list = $('mistakeList');
    if (teaching && next && next.common_mistakes && next.common_mistakes.length) {
      mistakeCard.hidden = false;
      list.innerHTML = '';
      next.common_mistakes.forEach(function (m) {
        var li = document.createElement('li');
        li.textContent = m;
        list.appendChild(li);
      });
    } else {
      mistakeCard.hidden = true;
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
    question.answer.page_header.forEach(function (t) {
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
    // In test-myself the page stays blank on purpose — the student writes it.
    if (mode === 'test') return;
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
  document.addEventListener('keydown', function (e) {
    if (e.key === ' ' || e.key === 'ArrowRight') {
      if (e.target === document.body) { e.preventDefault(); advance(); }
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

  // ═══ modes ═══════════════════════════════════════════════════════════════

  var MODE_HINT = {
    study: 'Tap through the answer. The rail explains why each step is there and where marks are lost.',
    exam: 'Just the answer and the marks. No explanations.',
    test: 'The page is blank. Write the answer yourself, then check it.'
  };

  var assess = { running: false, startedAt: 0, timer: null, idx: 0, awarded: [], elapsedMs: 0 };

  function setMode(next) {
    if (next === mode) return;
    stopAssessTimer();
    mode = next;
    var btns = $('modeRow').children;
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('active', btns[i].getAttribute('data-mode') === mode);
    }
    $('modeHint').textContent = MODE_HINT[mode];
    $('assessCard').hidden = mode !== 'test';
    $('btnNext').hidden = mode === 'test';
    // The accumulator tracks how much of the notebook has been REVEALED. In test
    // mode the page stays blank, so a "0/8" beside the test score would read as a
    // second, contradictory result.
    $('accCard').hidden = mode === 'test';
    if (mode === 'test') startAssess(); else resetAssessUi();
    renderUpTo(-1, false);           // full teardown: cancels any in-flight timers
  }

  // ── test-myself ───────────────────────────────────────────────────────────

  function fmtClock(ms) {
    var s = Math.floor(ms / 1000);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }
  /** 5.5 stays 5.5; 6.0 shows as 6. */
  function fmtMarks(n) { return Number.isInteger(n) ? String(n) : n.toFixed(1); }

  function stopAssessTimer() {
    if (assess.timer) clearInterval(assess.timer);
    assess.timer = null;
    assess.running = false;
  }

  function resetAssessUi() {
    stopAssessTimer();
    assess.idx = 0; assess.awarded = []; assess.elapsedMs = 0;
    $('assessStart').hidden = false;
    $('selfScore').hidden = true;
    $('selfScore').innerHTML = '';
    $('recallResult').hidden = true;
  }

  function startAssess() {
    resetAssessUi();
    assess.running = true;
    assess.startedAt = Date.now();
    var target = question.expected_time_min;
    function tick() {
      assess.elapsedMs = Date.now() - assess.startedAt;
      $('assessTimer').innerHTML = fmtClock(assess.elapsedMs) +
        '<span class="target">about ' + target + ' minutes in the exam</span>';
    }
    tick();
    assess.timer = setInterval(tick, 1000);
  }

  /** Reveal the model step FIRST, then ask — harder to over-credit yourself. */
  function renderSelfScore() {
    stopAssessTimer();
    $('assessStart').hidden = true;
    var box = $('selfScore');
    box.hidden = false;
    box.innerHTML = '';

    if (assess.idx >= steps.length) { renderSelfScoreTotal(box); return; }
    var step = steps[assess.idx];

    box.appendChild(el('div', 'ss-progress', 'Step ' + (assess.idx + 1) + ' of ' + steps.length));
    box.appendChild(el('div', 'ss-step-label', step.label));
    box.appendChild(el('div', 'ss-marks', step.marks === 0
      ? 'no marks — extra content'
      : marksLabel(step.marks)));

    var model = stepSummary(step.id);
    if (model) box.appendChild(el('div', 'ss-model', model));

    if (step.marks === 0) {
      box.appendChild(el('div', 'ss-ask', 'This one carries no marks.'));
      var skip = el('button', 'btn', 'Next');
      skip.type = 'button';
      skip.addEventListener('click', function () { award(0); });
      var wrapSkip = el('div', 'ss-buttons'); wrapSkip.appendChild(skip);
      box.appendChild(wrapSkip);
      return;
    }

    box.appendChild(el('div', 'ss-ask', 'Did you write this?'));
    var wrap = el('div', 'ss-buttons');
    [['I wrote this', 'got', step.marks],
     ['Partly', 'partly', step.marks / 2],
     ['I missed it', 'missed', 0]].forEach(function (opt) {
      var b = el('button', 'btn ' + opt[1], opt[0]);
      b.type = 'button';
      b.addEventListener('click', function () { award(opt[2], opt[1]); });
      wrap.appendChild(b);
    });
    box.appendChild(wrap);
  }

  function award(marks, verdict) {
    assess.awarded.push({ step: steps[assess.idx], marks: marks, verdict: verdict || 'none' });
    assess.idx++;
    renderSelfScore();
  }

  function renderSelfScoreTotal(box) {
    var total = assess.awarded.reduce(function (a, r) { return a + r.marks; }, 0);
    box.appendChild(el('div', 'ss-total',
      'You would have scored ' + fmtMarks(total) + ' out of ' + marksTotal + '.'));
    box.appendChild(el('div', 'ss-time',
      'You took ' + fmtClock(assess.elapsedMs) + '. In the exam you get about ' +
      question.expected_time_min + ' minutes for ' + marksTotal + ' marks.'));
    box.appendChild(el('p', 'recall-caveat',
      'You marked this yourself. The examiner marks what is written on the paper.'));

    var redo = assess.awarded.filter(function (r) {
      return r.verdict === 'missed' || r.verdict === 'partly';
    });
    if (redo.length) {
      var wrap = el('div', 'ss-redo');
      wrap.appendChild(el('h4', null, 'Write these again'));
      redo.forEach(function (r) {
        var item = el('div', 'recall-item ' + (r.verdict === 'missed' ? 'missed' : 'unsure'));
        var head = el('div', 'ri-head');
        head.appendChild(el('span', 'ri-mark', r.verdict === 'missed' ? '✗' : '~'));
        head.appendChild(el('span', 'ri-label', r.step.label));
        if (r.step.marks > 0) head.appendChild(el('span', 'ri-marks', marksLabel(r.step.marks)));
        item.appendChild(head);
        if (r.step.common_mistakes && r.step.common_mistakes.length) {
          item.appendChild(el('div', 'ri-hint', r.step.common_mistakes[0]));
        }
        var actions = el('div', 'recall-actions');
        var write = el('button', 'btn', 'Write this step');
        write.type = 'button';
        write.addEventListener('click', function () {
          setMode('study');
          window.PM_ANSWER.goToStep(r.step.id);
        });
        actions.appendChild(write);
        item.appendChild(actions);
        wrap.appendChild(item);
      });
      box.appendChild(wrap);
    }

    var again = el('button', 'btn btn-assess', 'Test myself again');
    again.type = 'button';
    again.addEventListener('click', function () { startAssess(); });
    box.appendChild(again);
  }

  function initModes() {
    var row = $('modeRow');
    for (var i = 0; i < row.children.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () { setMode(btn.getAttribute('data-mode')); });
      })(row.children[i]);
    }
    row.children[0].classList.add('active');
    $('modeHint').textContent = MODE_HINT.study;
    $('btnDonePaper').addEventListener('click', function () {
      assess.idx = 0; assess.awarded = [];
      renderSelfScore();
    });
  }

  // ═══ spoken-recall check ═════════════════════════════════════════════════
  // Progressive enhancement: with no endpoint configured this whole block does
  // nothing, the card stays hidden, and the page makes zero network calls.

  var RECALL_ENDPOINT = (window.PM_RECALL_ENDPOINT || '').trim();
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
        renderRecall(res.body);
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

  function renderRecall(res) {
    var box = $('recallResult');
    $('assessStart').hidden = true;     // the mic path takes over the panel
    box.hidden = false;
    box.innerHTML = '';

    if (res.outcome === 'not_enough_heard') { renderNotEnough(); return; }
    if (res.outcome === 'check_failed') {
      showRecallMessage('We could not check that recording. Nothing has been marked wrong.'); return;
    }
    if (res.outcome === 'not_this_answer') {
      box.appendChild(el('p', 'recall-empty', 'What you said does not look like this answer.'));
      box.appendChild(el('p', 'recall-caveat',
        'Nothing has been marked wrong. Tap the mic and say the steps for this question.'));
      return;
    }

    var earned = res.marks_earned;
    var overridden = {};

    function scoreLine() {
      var extra = 0;
      for (var k in overridden) if (overridden[k]) extra += overridden[k];
      return 'About ' + (earned + extra) + ' out of ' + res.marks_total + ' marks.';
    }

    if (res.thin_transcript) {
      box.appendChild(el('p', 'recall-caveat',
        'That was a very short recording. The check below may not be complete.'));
    }
    var score = el('div', 'recall-score', scoreLine());
    box.appendChild(score);
    box.appendChild(el('p', 'recall-caveat',
      'This is an estimate from what you said out loud. In the exam the marks come from what you write on the paper.'));

    box.appendChild(el('div', 'recall-lead', 'What we heard'));
    box.appendChild(transcriptWithHighlights(res.transcript, res.steps));
    box.appendChild(el('p', 'recall-caveat',
      'Speech to text is not perfect. If a word came out wrong, that is the microphone, not you.'));

    var groups = [
      { key: 'covered', title: 'What you covered' },
      { key: 'missed', title: 'You did not say these' },
      { key: 'unsure', title: 'We are not sure about these' }
    ];

    groups.forEach(function (g) {
      var rows = res.steps.filter(function (s) { return s.bucket === g.key; });
      if (!rows.length) return;
      var wrap = el('div', 'recall-group');
      wrap.appendChild(el('h4', null, g.title));
      rows.forEach(function (s) {
        var item = el('div', 'recall-item ' + g.key);
        var head = el('div', 'ri-head');
        head.appendChild(el('span', 'ri-mark', g.key === 'covered' ? '✓' : g.key === 'missed' ? '✗' : '?'));
        head.appendChild(el('span', 'ri-label', s.label));
        if (s.marks > 0) head.appendChild(el('span', 'ri-marks', marksLabel(s.marks)));
        item.appendChild(head);

        if (g.key === 'covered' && s.evidence) {
          item.appendChild(el('div', 'ri-said', 'You said: "' + s.evidence + '"'));
          if (s.confidence < 0.5) item.appendChild(el('div', 'ri-hint', 'This one was hard to hear. We counted it.'));
        }
        if (g.key !== 'covered') {
          var summary = stepSummary(s.step_id);
          if (summary) item.appendChild(el('div', 'ri-what', 'In the answer this step is:  ' + summary));
          if (s.credit === 'name_it') {
            item.appendChild(el('div', 'ri-hint',
              'Saying this step out loud by name is enough for this mark.'));
          }
          var unsureHint = null;
          if (g.key === 'unsure') {
            unsureHint = el('div', 'ri-hint',
              'We could not find this clearly in what you said. It is not marked as missed.');
            item.appendChild(unsureHint);
          }
          var actions = el('div', 'recall-actions');
          if (g.key === 'unsure' && s.marks > 0) {
            var yes = el('button', 'btn', 'I did say this');
            yes.type = 'button';
            yes.addEventListener('click', function () {
              overridden[s.step_id] = s.marks;
              score.textContent = scoreLine();
              item.classList.remove('unsure'); item.classList.add('covered');
              head.firstChild.textContent = '✓';
              if (unsureHint) unsureHint.remove();   // it no longer applies
              actions.innerHTML = '';
              item.appendChild(el('div', 'ri-hint', 'Counted.'));
            });
            actions.appendChild(yes);
          }
          var write = el('button', 'btn', 'Write this step');
          write.type = 'button';
          write.addEventListener('click', function () { window.PM_ANSWER.goToStep(s.step_id); });
          actions.appendChild(write);
          item.appendChild(actions);
        }
        wrap.appendChild(item);
      });
      box.appendChild(wrap);
    });

    var bonus = res.steps.filter(function (s) { return s.bucket === 'covered' && s.marks === 0; });
    if (bonus.length) {
      box.appendChild(el('p', 'recall-note',
        'You also said the extra content at the end. It carries no marks in this question.'));
    }
    if (res.order_note) box.appendChild(el('p', 'recall-note', res.order_note));
  }

  /**
   * The mic is the OPTIONAL half of test-myself. With no endpoint configured the
   * button never appears and the page makes zero network calls — the paper path
   * still works completely.
   */
  function initRecall() {
    if (!RECALL_ENDPOINT) return;                       // no endpoint → no mic, no fetch
    if (!question.recall_available) return;             // no authored rubric → nothing to check
    $('btnMic').hidden = false;
    $('recallIntro').hidden = false;
    $('recallIntro').textContent = question.recall_prompt ||
      'Say the steps you would write for this answer, in order.';
    $('btnMic').addEventListener('click', function () {
      if (rec.active) stopRecording(); else startRecording();
    });
  }

  // ═══ AI assistant seam (read-only; see docs/patterns/answer_book.md) ══════

  window.PM_ANSWER = Object.freeze({
    version: 1,
    question: question,
    getState: function () {
      return {
        stepIndex: stepIndex,
        stepId: stepIndex >= 0 ? steps[stepIndex].id : null,
        marksEarned: marksEarned,
        marksTotal: marksTotal,
        pageCount: pageBodies.length
      };
    },
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

  renderChrome();
  var fontLoad = (document.fonts && document.fonts.load)
    ? Promise.all([document.fonts.load('26px Kalam'), document.fonts.load('700 26px Kalam')])
    : Promise.resolve();
  Promise.race([
    fontLoad.then(function () { return document.fonts.ready; }),
    new Promise(function (r) { setTimeout(r, 2500); })
  ]).then(function () {
    newPage();
    writePageHeader();
    updateChrome();
    fitNotebook();
    initModes();
    initRecall();
  });
})();
