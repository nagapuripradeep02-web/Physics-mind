/* Solutions — the doubt desk: a chat panel where a student brings a problem
 * of their own, as a photo (camera or gallery) or typed.
 *
 * With EP_SOLVE_BASE set (the hosted and preview builds), "Solve it" and
 * "Explain each step" send the photo ONCE to ep-solve, which reads the
 * question, solves it (one model for a text question, two in parallel for a
 * drawn one) and returns the working as an answer sheet: lines of
 * mathematics, each with its LaTeX and a plain-text twin. The card shows the
 * answer, the lines typeset (83_tex.js; plain text until KaTeX arrives or if
 * it never does), a quiet footer saying how the answer was checked, and a
 * small "wrong answer? tell us" link. Nothing about which model answered is
 * shown (founder, 2026-09-11). When the two workings disagree the card says
 * "Not sure", gives no answer and shows both workings. The image is never
 * stored anywhere.
 *
 * With EP_REVIEW_BASE set as well, "I tried, here is my work" (85_review.js)
 * asks for the student's final answer, then a photo of the working. The
 * question is solved first, with no card shown (an answer checked once is
 * confirmed a second way; a "not sure" answer ends in an honest card and no
 * working is sent). Then the working photo goes ONCE to ep-review, which
 * reads it and returns a verdict: correct, one line to fix, or not sure.
 * Three attempts, then the full solution. Without EP_REVIEW_BASE the chip is
 * not offered and nothing else here changes.
 *
 * Without EP_SOLVE_BASE nothing is sent: the photo is shown back from an
 * object URL, the three original chips show and the flow ends in the
 * not-available card, exactly as before. A typed question is matched on the
 * phone (58_match.js) against the public pool and opens the existing fix
 * page, which is gated exactly as it is from a result.
 *
 * Every bubble here is deterministic and carries no AI tag. The bubbles use
 * their own classes (.ep-sol-*), never the run's or the chat's, because the
 * e2e suite reads those unscoped. Leaving the view clears the thread, the
 * timers and every object URL. */
var Solutions = (function () {
  var ui = Screens.ui;
  var BASE = (window.EP_SOLVE_BASE || '').trim();
  // 85_review.js loads after this file: read its base here, call Review.* only at event time.
  var REVIEW = !!BASE && !!(window.EP_REVIEW_BASE || '').trim();
  var MAX_ATTEMPTS = 3;
  var MAX_BYTES = 15 * 1024 * 1024;        // a file the page will even open
  var MAX_SEND = 1.5 * 1024 * 1024;        // the function's body cap, after downscaling
  var thread, chips, input, sendBtn, camera, gallery;
  /* ctx: { ck, stage, file, work, typedFinal, solved, rv, armed }
   *   stage: start | want | final | work | na | solving | solved | reviewing | reviewed | value
   *   file: the question photo (a working photo never lands here); work: the working photo
   *   typedFinal: the final answer the student typed (null = none yet)
   *   solved: the hidden solve reply the working is checked against
   *   rv: { attempt, reviewId, qid, askLine, valueAt } — the review state; attempt is the server's number
   *   armed: the slot the next photo fills after Retake; otherwise the stage decides */
  var ctx = null;
  var urls = [];
  var timers = [];

  function say(text, who) {
    var m = el('div', 'ep-sol-msg ' + (who || 'tutor'));
    m.appendChild(el('div', 'ep-sol-text', text));
    thread.appendChild(m);
    m.scrollIntoView({ block: 'end' });
    return m;
  }
  function setChips(list) { ui.setChips(list, chips); }
  function chip(label, value, fn) {
    return { label: label, value: value, onTap: function () { Track.log('sol_chip', { chip: value, stage: ctx ? ctx.stage : null }); fn(); } };
  }
  function go(hash) { return function () { location.hash = hash; }; }
  function weaknessChip() { return chip(STR.sol_chip_weakness, 'weakness', go('#/physics')); }
  function photoChips(extra) {
    setChips([chip(STR.sol_chip_camera, 'camera', function () { ctx.armed = null; camera.click(); }),
              chip(STR.sol_chip_gallery, 'gallery', function () { ctx.armed = null; gallery.click(); })].concat(extra || []));
  }
  function revoke() {
    for (var i = 0; i < urls.length; i++) { try { URL.revokeObjectURL(urls[i]); } catch (e) {} }
    urls = [];
  }
  function schedule(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() { for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]); timers = []; }
  function freshRv() { return { attempt: 0, reviewId: null, qid: null, askLine: null, valueAt: null }; }
  function resetReview() { ctx.work = null; ctx.typedFinal = null; ctx.solved = null; ctx.rv = freshRv(); }
  function busy() { return ctx.stage === 'solving' || ctx.stage === 'reviewing'; }
  /** Back to the start: a new question, nothing kept from the last one. */
  function restart() {
    resetReview();
    ctx.stage = 'start';
    ctx.file = null;
    ctx.armed = null;
    input.placeholder = STR.sol_placeholder;
    say(STR.sol_hello);
    photoChips();
  }

  function greet() {
    say(STR.sol_hello);
    if (ctx.ck) { var ch = Data.chapter(ctx.ck); if (ch) say(STR.sol_from(ch.name)); }
    photoChips();
  }

  // ── the photo: shown back; sent only when the student asks for a solution ──
  // The slot is decided when the file ARRIVES: the working while the desk is
  // waiting for it (or after Retake on a working photo), else the question.
  function onFile(kind, file) {
    if (!file) return;
    var slot = ctx.armed || (ctx.stage === 'work' ? 'work' : 'file');
    ctx.armed = null;
    Track.log('sol_photo', { kind: kind, bytes: file.size, type: file.type || '', slot: slot });
    if (file.size > MAX_BYTES) { say(STR.sol_too_large(Math.round(file.size / 1048576))); photoChips(); return; }
    var url = URL.createObjectURL(file);
    urls.push(url);
    var img = document.createElement('img');
    img.alt = '';
    var wrap = el('div', 'ep-photo');
    wrap.setAttribute('data-slot', slot);
    wrap.appendChild(img);
    wrap.appendChild(el('div', 'ep-photo-cap', slot === 'work' && REVIEW ? STR.rev_photo_caption : BASE ? STR.sol_photo_caption_send : STR.sol_photo_caption));
    var row = el('div', 'ep-photo-row');
    row.appendChild(ui.button('btn', STR.sol_retake, function () {
      if (busy()) return;
      ctx.armed = slot;                                    // the new photo fills the same slot
      (kind === 'gallery' ? gallery : camera).click();
    }));
    row.appendChild(ui.button('btn', STR.sol_remove, function () {
      if (busy()) return;
      if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
      ctx[slot] = null;
      if (slot === 'work' && REVIEW) { askWork(); return; }
      restart();
    }));
    wrap.appendChild(row);
    img.onload = function () {
      thread.appendChild(wrap);
      wrap.scrollIntoView({ block: 'end' });
      ctx[slot] = file;
      afterPhoto(slot);
    };
    img.onerror = function () { say(STR.sol_bad_file); photoChips(); };
    img.src = url;
  }
  function afterPhoto(slot) {
    if (slot === 'work') {
      ctx.rv.valueAt = null;                               // a new page: a value typed for an old line no longer applies
      if (REVIEW) startReview(); else notAvailable();
      return;
    }
    resetReview();                                         // a new question: the old working, final and answer are gone
    ctx.stage = 'want';
    say(STR.sol_what);
    if (BASE) {
      var list = [];
      if (REVIEW) list.push(chip(STR.sol_chip_tried, 'tried', function () { say(STR.sol_chip_tried, 'student'); tried(); }));
      list.push(chip(STR.sol_chip_solve, 'solution', function () { say(STR.sol_chip_solve, 'student'); solve('solve'); }));
      var explain = chip(STR.sol_chip_explain, 'stuck', function () { say(STR.sol_chip_explain, 'student'); solve('explain'); });
      explain.cls = 'ep-chip-quiet';
      list.push(explain);
      setChips(list);
      return;
    }
    setChips([
      chip(STR.sol_chip_tried, 'tried', function () { say(STR.sol_chip_tried, 'student'); ctx.stage = 'work'; say(STR.sol_work_photo); photoChips(); }),
      chip(STR.sol_chip_stuck, 'stuck', function () { say(STR.sol_chip_stuck, 'student'); solve('explain'); }),
      chip(STR.sol_chip_solution, 'solution', function () { say(STR.sol_chip_solution, 'student'); solve('solve'); })
    ]);
  }
  function notAvailable() {
    Track.log('sol_unavailable', { stage: ctx.stage });
    ctx.stage = 'na';
    var card = el('div', 'ep-na');
    card.appendChild(el('div', 'ep-eyebrow', STR.sol_na_eyebrow));
    card.appendChild(el('div', 'ep-na-title', STR.sol_na_title));
    card.appendChild(el('p', 'ep-na-body', STR.sol_na_body));
    thread.appendChild(card);
    card.scrollIntoView({ block: 'end' });
    setChips([chip(STR.sol_chip_type, 'type', function () { input.focus(); }), weaknessChip(),
              chip(STR.sol_chip_lessons, 'lessons', go('#/physics/learn'))]);
  }

  // ── the solver: one POST to ep-solve, the image dropped on both ends ───────
  function post(body) {
    body.device_id = Sync.deviceId();
    body.session_id = Track.session();
    if (Track.isInternal()) body.internal = true;
    if (typeof Auth !== 'undefined' && Auth.signedIn()) body.access_token = Auth.token();
    return fetch(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().then(function (j) { return { status: r.status, body: j }; }); });
  }
  function locked(text) {
    ctx.stage = 'want';
    say(text || STR.sol_locked);
    var m = el('div', 'ep-sol-msg tutor');
    var a = el('a', 'btn btn-primary ep-sol-unlock', STR.sol_locked_cta);
    a.href = '#/physics/unlock';
    m.appendChild(a);
    thread.appendChild(m);
    m.scrollIntoView({ block: 'end' });
    setChips([weaknessChip()]);
  }
  function solve(kind) {
    if (!BASE) { notAvailable(); if (kind === 'solve') { say(STR.sol_type_hint); input.focus(); } return; }
    var file = ctx.file;
    if (!file) { photoChips(); return; }
    if (typeof Gate !== 'undefined' && Gate.known() && Gate.locked()) { locked(); return; }
    ctx.stage = 'solving';
    setChips([]);
    var wait = say(STR.sol_reading);
    var t0 = Date.now();
    schedule(function () { wait.firstChild.textContent = STR.sol_solving; }, 4000);
    schedule(function () { wait.firstChild.textContent = STR.sol_still; }, 22000);
    function done() { clearTimers(); if (wait.parentNode) wait.parentNode.removeChild(wait); }
    Photo.shrink(file, function (b64, mediaType, bytes) {
      if (!b64) { done(); say(STR.sol_bad_file); photoChips(); return; }
      if (bytes > MAX_SEND) { done(); say(STR.sol_too_large(Math.round(bytes / 1048576))); photoChips(); return; }
      post({ action: 'solve', ask: kind, image: b64, media_type: mediaType })
        .then(function (r) {
          done();
          var b = r.body || {};
          Track.log('sol_solve', { kind: kind, ms: Date.now() - t0, bytes: bytes, locked: !!b.locked, ok: !!b.ok, reason: b.reason || null,
                                   label: b.label || null, source: b.source || null, route: b.route || null, subject: b.subject || null,
                                   option: b.option === undefined ? null : b.option, server_ms: b.ms || null });
          if (b.locked) { if (typeof Gate !== 'undefined') Gate.refresh(); locked(); return; }
          if (!b.ok) { say(STR.sol_reason[b.reason] || STR.sol_down); photoChips([weaknessChip()]); return; }
          render(b);
        })
        .catch(function () { done(); say(STR.sol_down); photoChips([weaknessChip()]); Track.log('sol_solve', { kind: kind, ms: Date.now() - t0, bytes: bytes, failed: true }); });
    });
  }

  /* One line of the answer sheet: plain text now, `data-tex` for KaTeX. */
  function line(l) {
    var d = el('div', 'ep-line' + (l.kind === 'cont' ? ' ep-line-cont' : l.kind === 'note' ? ' ep-line-note' : ''), String(l.text || ''));
    if (l.tex) d.setAttribute('data-tex', String(l.tex));
    return d;
  }
  /* The working as a notebook block. */
  function paper(list) {
    var p = el('div', 'ep-paper');
    list = list || [];
    for (var i = 0; i < list.length; i++) p.appendChild(line(list[i]));
    return p;
  }
  /* The answer card: the answer line, the working as an answer sheet (both
   * workings under "Working A" / "Working B" when not sure, no answer), a
   * note only when the method is beyond Class 12, and a quiet footer: how it
   * was checked, and the "wrong answer? tell us" link that files a report. */
  function render(b) {
    ctx.stage = 'solved';
    var label = STR.sol_label[b.label] ? b.label : 'once';
    var card = el('div', 'ep-solve ep-solve-' + label);
    card.setAttribute('data-label', label);
    card.setAttribute('data-source', b.source || '');
    if (label === 'unsure') {
      card.appendChild(el('div', 'ep-eyebrow', STR.sol_label.unsure));
      card.appendChild(el('p', 'ep-solve-unsure-body', STR.sol_unsure_body));
      card.appendChild(el('div', 'ep-h3', STR.sol_working_a));
      card.appendChild(paper(b.working));
      if (b.working_alt && b.working_alt.steps) {
        card.appendChild(el('div', 'ep-h3', STR.sol_working_b));
        card.appendChild(paper(b.working_alt.steps));
      }
    } else {
      if (b.option || b.answer) {
        var ans = el('div', 'ep-solve-answer');
        ans.appendChild(el('span', 'ep-solve-answer-word', STR.sol_answer_word));
        if (b.option) ans.appendChild(el('span', 'ep-solve-key', STR.option_label(b.option)));
        if (b.answer) {
          var val = el('span', 'ep-solve-val', String(b.answer));
          if (!b.option && b.answer_tex) val.setAttribute('data-tex', String(b.answer_tex));
          ans.appendChild(val);
        }
        card.appendChild(ans);
      }
      card.appendChild(paper(b.working));
    }
    if (b.syllabus === 'beyond') card.appendChild(el('p', 'ep-solve-note', STR.sol_syllabus_note));
    var foot = el('div', 'ep-solve-foot');
    if (STR.sol_mark[label]) foot.appendChild(el('span', 'ep-solve-mark', STR.sol_mark[label]));
    var rep = ui.button('ep-solve-report', STR.sol_report, function () {
      rep.disabled = true;
      Track.log('sol_report', { fingerprint: String(b.fingerprint || '').slice(0, 12), label: label, option: b.option === undefined ? null : b.option });
      post({ action: 'report', fingerprint: b.fingerprint, option: b.option || null, label: label })
        .then(function () { rep.textContent = STR.sol_reported; })
        .catch(function () { rep.disabled = false; });
    });
    foot.appendChild(rep);
    card.appendChild(foot);
    thread.appendChild(card);
    card.scrollIntoView({ block: 'end' });
    if (typeof Tex !== 'undefined') Tex.render(card, function (r) { Track.log('sol_tex', r); });
    photoChips([weaknessChip()]);
  }

  // ── the reviewer: "I tried, here is my work" (85_review.js) ─────────────
  /** The chip. The plan is checked before a byte is read. */
  function tried() {
    if (typeof Gate !== 'undefined' && Gate.known() && Gate.locked()) { locked(STR.rev_locked); return; }
    ctx.stage = 'final';
    say(STR.rev_final_q);
    input.placeholder = STR.rev_final_placeholder;
    input.focus();
    setChips([chip(STR.rev_chip_no_final, 'no_final', function () { say(STR.rev_chip_no_final, 'student'); ctx.typedFinal = null; askWork(); })]);
  }
  /** The box, in the two stages that read it: the final answer, or the value at one line. */
  function typed(text) {
    text = String(text || '').trim().slice(0, 120);
    if (!text) return;
    say(text, 'student');
    if (ctx.stage === 'value') {
      Track.log('rev_value', { line: ctx.rv.askLine, chars: text.length, attempt: ctx.rv.attempt });
      ctx.rv.valueAt = { n: ctx.rv.askLine, value: text };
      review();
      return;
    }
    Track.log('rev_final', { chars: text.length });
    ctx.typedFinal = text;
    askWork();
  }
  function askWork(text) {
    ctx.stage = 'work';
    ctx.armed = null;
    input.placeholder = STR.sol_placeholder;
    say(text || STR.rev_work_photo);
    photoChips();
  }
  /** Downscale a photo for sending; fail(text) on a file the phone cannot send, else ok(b64, mediaType, bytes). */
  function shrinkThen(file, fail, ok) {
    Photo.shrink(file, function (b64, mediaType, bytes) {
      if (!b64) { fail(STR.sol_bad_file); return; }
      if (bytes > MAX_SEND) { fail(STR.sol_too_large(Math.round(bytes / 1048576))); return; }
      ok(b64, mediaType, bytes);
    });
  }
  /* The honest card: the answer is not verified (the two workings disagree,
   * or the reviewer has no reference), so no working is judged against it. */
  function notVerified(why) {
    Track.log('rev_noref', { why: why || null });
    ctx.stage = 'na';
    var card = el('div', 'ep-na ep-na-review');
    card.appendChild(el('div', 'ep-eyebrow', STR.rev_noref_eyebrow));
    card.appendChild(el('div', 'ep-na-title', STR.rev_noref_title));
    card.appendChild(el('p', 'ep-na-body', STR.rev_noref_body));
    thread.appendChild(card);
    card.scrollIntoView({ block: 'end' });
    setChips([chip(STR.sol_chip_solve, 'solution', function () { say(STR.sol_chip_solve, 'student'); solve('solve'); }), weaknessChip()]);
  }
  function merge(a, b) {
    var o = {}, k;
    for (k in a) if (Object.prototype.hasOwnProperty.call(a, k)) o[k] = a[k];
    for (k in b) if (Object.prototype.hasOwnProperty.call(b, k)) o[k] = b[k];
    return o;
  }
  /** The past question the solver's read matches on the phone, when the match is sure. */
  function bankMatch(b) {
    var text = String(b.question_text || '').trim();
    if (!text || typeof Match === 'undefined') return null;
    var r = Match.find(text, candidates(), ctx.ck);
    return r.hits.length && r.hits[0].score >= 0.8 ? r.hits[0].qid : null;
  }
  /* Solve the question with no card shown, so the review has something sure
   * to check against: "checked two ways" is kept; "checked once" is confirmed
   * a second way first; "not sure" (or a confirm that does not settle it)
   * ends in the honest card. cb() runs once ctx.solved is set. */
  function solveHidden(cb) {
    var my = ctx;
    var file = ctx.file;
    if (!file) { restart(); return; }
    ctx.stage = 'solving';
    setChips([]);
    var wait = say(STR.rev_checking_q);
    var t0 = Date.now();
    schedule(function () { wait.firstChild.textContent = STR.rev_still; }, 22000);
    function done() { clearTimers(); if (wait.parentNode) wait.parentNode.removeChild(wait); }
    function fail(text) { done(); say(text); ctx.stage = 'work'; photoChips([weaknessChip()]); }
    function logIt(action, b, ms, failed) {
      Track.log('rev_solve', { action: action, ms: ms, locked: !!(b && b.locked), ok: !!(b && b.ok), reason: (b && b.reason) || null,
                               label: (b && b.label) || null, source: (b && b.source) || null, failed: !!failed });
    }
    function settle(b) {
      ctx.solved = b;
      ctx.rv.qid = bankMatch(b);
      cb();
    }
    shrinkThen(file, fail, function (b64, mediaType) {
      post({ action: 'solve', ask: 'solve', image: b64, media_type: mediaType })
        .then(function (r) {
          if (my !== ctx) return;
          var b = r.body || {};
          logIt('solve', b, Date.now() - t0);
          if (b.locked) { done(); if (typeof Gate !== 'undefined') Gate.refresh(); locked(STR.rev_locked); return; }
          if (!b.ok) { fail(STR.sol_reason[b.reason] || STR.sol_down); return; }
          if (b.label === 'two_ways') { done(); settle(b); return; }
          if (b.label !== 'once') { done(); notVerified(b.label || 'unsure'); return; }
          // checked once: have it checked a second way before any working is judged against it
          var t1 = Date.now();
          post({ action: 'confirm', fingerprint: b.fingerprint })
            .then(function (r2) {
              if (my !== ctx) return;
              done();
              var c = r2.body || {};
              logIt('confirm', c, Date.now() - t1);
              if (c.locked) { if (typeof Gate !== 'undefined') Gate.refresh(); locked(STR.rev_locked); return; }
              if (!c.ok || c.label !== 'two_ways') { notVerified(c.ok ? (c.label || 'unsure') : (c.reason || 'confirm_failed')); return; }
              settle(merge(b, c));
            })
            .catch(function () { if (my !== ctx) return; logIt('confirm', null, Date.now() - t1, true); fail(STR.rev_down); });
        })
        .catch(function () { if (my !== ctx) return; logIt('solve', null, Date.now() - t0, true); fail(STR.sol_down); });
    });
  }
  function startReview() {
    if (ctx.solved) { review(); return; }
    solveHidden(review);
  }
  /* ONE review: the working photo, the fingerprint of the hidden solve, the
   * typed final and the attempt number — never a solve field. A typed value
   * for one unreadable line re-sends the same photo under the SAME attempt. */
  function review() {
    var my = ctx;
    if (typeof Gate !== 'undefined' && Gate.known() && Gate.locked()) { locked(STR.rev_locked); return; }
    var file = ctx.work;
    if (!file || !ctx.solved) { askWork(); return; }
    ctx.stage = 'reviewing';
    input.placeholder = STR.sol_placeholder;
    setChips([]);
    var wait = say(STR.rev_checking_work);
    schedule(function () { wait.firstChild.textContent = STR.rev_still; }, 22000);
    function done() { clearTimers(); if (wait.parentNode) wait.parentNode.removeChild(wait); }
    var valueAt = ctx.rv.valueAt;
    ctx.rv.valueAt = null;                                 // sent once; after a failure the desk asks for a new photo
    shrinkThen(file, function (text) { done(); say(text); ctx.stage = 'work'; photoChips([weaknessChip()]); }, function (b64, mediaType) {
      var body = { action: 'review', fingerprint: my.solved.fingerprint,
                   attempt_no: valueAt ? Math.max(1, my.rv.attempt) : my.rv.attempt + 1, image: b64, media_type: mediaType };
      if (my.typedFinal) body.typed_final = my.typedFinal;
      if (valueAt) body.typed_value_at_line = valueAt;
      Review.start(host(my, done), body);
    });
  }
  /* What Review gets of this desk: the thread and its helpers, the state it
   * may read, and one callback per outcome. `my` is the ctx the request was
   * made under; live() is false once the student has left the view. */
  function host(my, done) {
    return {
      thread: thread, say: say, chip: chip, setChips: setChips, photoChips: photoChips, weaknessChip: weaknessChip, paper: paper,
      ck: my.ck, qid: my.rv.qid, max: MAX_ATTEMPTS,
      attempt: function () { return my.rv.attempt; },
      live: function () { return my === ctx; },
      done: done,
      onLocked: function () { if (typeof Gate !== 'undefined') Gate.refresh(); locked(STR.rev_locked); },
      onFail: function (reason) {
        if (reason === 'no_reference' || reason === 'confirm_first') { notVerified(reason); return; }
        say(STR.rev_reason[reason] || STR.rev_down);
        if (reason === 'cap' || reason === 'quiet') {
          // checking is over for today; the solution already in hand costs nothing to show
          my.stage = 'want';
          setChips([chip(STR.sol_chip_solve, 'solution', function () { say(STR.sol_chip_solve, 'student'); render(my.solved); }), weaknessChip()]);
          return;
        }
        my.stage = 'work';
        photoChips([weaknessChip()]);
      },
      onVerdict: function (b) {
        my.rv.attempt = typeof b.attempt_no === 'number' ? b.attempt_no : my.rv.attempt + 1;
        my.rv.reviewId = b.review_id == null ? null : b.review_id;
        my.rv.askLine = b.ask_line || null;
        my.stage = 'reviewed';
      },
      onNext: function () { askWork(STR.rev_next_photo); },
      onRetake: function () { askWork(); },
      onValue: function (n) { my.stage = 'value'; my.rv.askLine = n; input.placeholder = STR.rev_value_placeholder(n); input.focus(); },
      onSolution: function () { say(STR.rev_solution_now); render(my.solved); },
      onExhausted: function () { say(STR.rev_exhausted); render(my.solved); },
      onRestart: restart
    };
  }

  // ── typed: matched on the phone against the public pool ────────────────
  /** Every verified question of every chapter: the ones a fix page can open. */
  function candidates() {
    var out = [], chs = Data.chapters();
    for (var i = 0; i < chs.length; i++) {
      var ids = chs[i].verified_ids || [];
      for (var k = 0; k < ids.length; k++) { var q = Data.question(ids[k]); if (q) out.push(q); }
    }
    return out;
  }
  function shorten(s, n) {
    s = String(s || '');
    if (s.length <= n) return s;
    var cut = s.slice(0, n);
    var sp = cut.lastIndexOf(' ');
    return (sp > n * 0.6 ? cut.slice(0, sp) : cut) + '…';
  }
  function matchCards(hits) {
    for (var i = 0; i < hits.length; i++) (function (hit, rank) {
      var q = Data.question(hit.qid);
      var ch = Data.chapter(q.chapter_key);
      var label = Data.shapeLabel(ch, Data.shapeKey(q));
      var card = el('div', 'ep-match');
      card.setAttribute('data-qid', q.id);
      card.appendChild(el('div', 'ep-eyebrow', ch.name + (label ? ' · ' + label : '')));
      card.appendChild(el('p', 'ep-match-stem', shorten(q.question_en, 160)));
      var a = el('a', 'btn ep-match-btn', STR.sol_match_yes);
      a.href = '#/physics/' + q.chapter_key + '/fix/' + encodeURIComponent(q.id);
      a.onclick = function () { Track.log('sol_pick', { qid: q.id, rank: rank }); };
      card.appendChild(a);
      thread.appendChild(card);
      card.scrollIntoView({ block: 'end' });
    })(hits[i], i + 1);
  }
  function ask(text) {
    text = String(text || '').trim().slice(0, 500);
    if (!text) return;
    say(text, 'student');
    var r = Match.find(text, candidates(), ctx.ck);
    Track.log('sol_ask', { chars: text.length, hits: r.hits.length, top: r.hits.length ? Math.round(r.hits[0].score * 100) / 100 : null, few: r.few });
    if (r.few) { say(STR.sol_more_words); return; }
    if (!r.hits.length) { say(STR.sol_no_match); photoChips([weaknessChip()]); return; }
    say(STR.sol_match_q);
    matchCards(r.hits);
    setChips([chip(STR.sol_chip_none, 'none', function () { say(STR.sol_chip_none, 'student'); say(STR.sol_none_reply); photoChips([weaknessChip()]); })]);
  }

  function show(ck) {
    ui.showView('solutionsView');
    ui.setBack('#/', STR.back_subjects);
    thread = $('solThread'); chips = $('solChips'); input = $('solInput'); sendBtn = $('solSend');
    camera = $('solCamera'); gallery = $('solGallery');
    $('solTitle').textContent = STR.sol_title;
    input.placeholder = STR.sol_placeholder;
    input.setAttribute('aria-label', STR.sol_title);
    sendBtn.textContent = STR.sol_send;
    ui.clear(thread);
    setChips([]);
    revoke();
    clearTimers();
    ctx = { ck: ck || null, stage: 'start', file: null, work: null, typedFinal: null, solved: null, rv: freshRv(), armed: null };
    sendBtn.onclick = function () {
      var t = input.value; input.value = '';
      if (ctx.stage === 'final' || ctx.stage === 'value') typed(t); else ask(t);
    };
    input.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); sendBtn.onclick(); } };
    camera.onchange = function () { var f = camera.files && camera.files[0]; camera.value = ''; onFile('camera', f); };
    gallery.onchange = function () { var f = gallery.files && gallery.files[0]; gallery.value = ''; onFile('gallery', f); };
    Track.log('sol_open', { chapter: ck || null });
    greet();
  }

  ui.onLeave('solutionsView', function () { revoke(); clearTimers(); ctx = null; });

  return { show: show };
})();
