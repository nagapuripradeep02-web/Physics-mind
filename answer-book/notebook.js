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

    var noteCard = $('marginNoteCard');
    var next = steps[stepIndex + 1];
    var shown = revealing ? steps[stepIndex + 1] : next;
    if (shown && shown.margin_note) {
      noteCard.hidden = false;
      $('marginNote').textContent = shown.margin_note;
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
  });
})();
