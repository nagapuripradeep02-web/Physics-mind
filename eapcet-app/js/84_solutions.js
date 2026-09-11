/* Solutions — the doubt desk: a chat panel where a student brings a problem
 * of their own, as a photo (camera or gallery) or typed.
 *
 * With EP_SOLVE_BASE set (the hosted and preview builds), "show me the
 * solution" and "I am stuck" send the photo ONCE to ep-solve, which reads the
 * question, solves it (one model for a text question, two in parallel for a
 * drawn one) and returns an answer with a label decided by code: checked two
 * ways / checked once / not sure. The page prints the label, the working,
 * both workings when not sure, which models answered, and a "this answer
 * looks wrong" tap. The image is never stored anywhere. "I tried, here is my
 * work" (the reviewer) is not built yet and still ends in the honest
 * not-available card.
 *
 * Without EP_SOLVE_BASE nothing is sent: the photo is shown back from an
 * object URL and the flow ends in the not-available card, exactly as before.
 * A typed question is matched on the phone (58_match.js) against the public
 * pool and opens the existing fix page, which is gated exactly as it is from
 * a result; the same match runs on the solver's transcript, so a past-paper
 * question is also pointed at its verified fix page.
 *
 * Every bubble here is deterministic and carries no AI tag except the answer
 * card, which names the models that produced it. The bubbles use their own
 * classes (.ep-sol-*), never the run's or the chat's, because the e2e suite
 * reads those unscoped. Leaving the view clears the thread, the timers and
 * every object URL. */
var Solutions = (function () {
  var ui = Screens.ui;
  var BASE = (window.EP_SOLVE_BASE || '').trim();
  var MAX_BYTES = 15 * 1024 * 1024;        // a file the page will even open
  var MAX_SEND = 1.5 * 1024 * 1024;        // the function's body cap, after downscaling
  var thread, chips, input, sendBtn, camera, gallery;
  var ctx = null;          // { ck, stage: 'start' | 'want' | 'work' | 'na' | 'solving' | 'solved', file }
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
    setChips([chip(STR.sol_chip_camera, 'camera', function () { camera.click(); }),
              chip(STR.sol_chip_gallery, 'gallery', function () { gallery.click(); })].concat(extra || []));
  }
  function revoke() {
    for (var i = 0; i < urls.length; i++) { try { URL.revokeObjectURL(urls[i]); } catch (e) {} }
    urls = [];
  }
  function schedule(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() { for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]); timers = []; }

  function greet() {
    say(STR.sol_hello);
    if (ctx.ck) { var ch = Data.chapter(ctx.ck); if (ch) say(STR.sol_from(ch.name)); }
    photoChips();
  }

  // ── the photo: shown back; sent only when the student asks for a solution ──
  function onFile(kind, file) {
    if (!file) return;
    Track.log('sol_photo', { kind: kind, bytes: file.size, type: file.type || '' });
    if (file.size > MAX_BYTES) { say(STR.sol_too_large(Math.round(file.size / 1048576))); photoChips(); return; }
    var url = URL.createObjectURL(file);
    urls.push(url);
    var img = document.createElement('img');
    img.alt = '';
    var wrap = el('div', 'ep-photo');
    wrap.appendChild(img);
    wrap.appendChild(el('div', 'ep-photo-cap', BASE ? STR.sol_photo_caption_send : STR.sol_photo_caption));
    var row = el('div', 'ep-photo-row');
    row.appendChild(ui.button('btn', STR.sol_retake, function () { (kind === 'gallery' ? gallery : camera).click(); }));
    row.appendChild(ui.button('btn', STR.sol_remove, function () {
      if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
      ctx.stage = 'start';
      ctx.file = null;
      say(STR.sol_hello);
      photoChips();
    }));
    wrap.appendChild(row);
    img.onload = function () {
      thread.appendChild(wrap);
      wrap.scrollIntoView({ block: 'end' });
      ctx.file = file;
      afterPhoto();
    };
    img.onerror = function () { say(STR.sol_bad_file); photoChips(); };
    img.src = url;
  }
  function afterPhoto() {
    if (ctx.stage === 'work') { notAvailable(); return; }
    ctx.stage = 'want';
    say(STR.sol_what);
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
  function locked() {
    ctx.stage = 'want';
    say(STR.sol_locked);
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

  function modelName(id) { return (STR.sol_model_names && STR.sol_model_names[id]) || id || ''; }
  function stepList(list) {
    var ol = el('ol', 'ep-solve-steps');
    list = list || [];
    for (var i = 0; i < list.length; i++) ol.appendChild(el('li', 'ep-solve-step', String(list[i].text || '')));
    return ol;
  }
  function modelsLine(models) {
    var lines = [];
    for (var i = 0; i < (models || []).length; i++) {
      var m = models[i];
      var result = m.error ? STR.sol_model_none : m.option ? STR.sol_model_option(m.option) : m.value ? String(m.value) : STR.sol_model_none;
      lines.push(STR.sol_model_line(modelName(m.model) + (m.effort ? STR.sol_model_effort(m.effort) : ''), result, Math.max(1, Math.round((m.ms || 0) / 1000))));
    }
    return lines;
  }
  /* The answer card: the label first, the answer (none when not sure), the
   * working (both when not sure, each named), which models answered, and the
   * "this answer looks wrong" tap that files a report for a human. */
  function render(b) {
    ctx.stage = 'solved';
    var label = STR.sol_label[b.label] ? b.label : 'once';
    var card = el('div', 'ep-solve ep-solve-' + label);
    card.setAttribute('data-label', label);
    card.setAttribute('data-source', b.source || '');
    card.appendChild(el('div', 'ep-eyebrow', STR.sol_label[label]));
    if (label === 'unsure') {
      card.appendChild(el('p', 'ep-solve-unsure-body', STR.sol_unsure_body));
    } else if (b.option) {
      card.appendChild(el('div', 'ep-solve-answer', STR.sol_answer_option(b.option, b.answer || '')));
    } else if (b.answer) {
      card.appendChild(el('div', 'ep-solve-answer', STR.sol_answer_value(b.answer)));
    }
    if (STR.sol_label_note[label]) card.appendChild(el('p', 'ep-solve-note', STR.sol_label_note[label]));
    if (label === 'unsure') {
      card.appendChild(el('div', 'ep-solve-who', STR.sol_working_of(modelName(b.winner))));
      card.appendChild(stepList(b.working));
      if (b.working_alt && b.working_alt.steps) {
        card.appendChild(el('div', 'ep-solve-who', STR.sol_working_of(modelName(b.working_alt.model))));
        card.appendChild(stepList(b.working_alt.steps));
      }
    } else {
      card.appendChild(stepList(b.working));
    }
    if (b.syllabus === 'beyond') card.appendChild(el('p', 'ep-solve-note', STR.sol_syllabus_note));
    if (b.source === 'cache') card.appendChild(el('p', 'ep-solve-note', STR.sol_from_cache));
    var lines = modelsLine(b.models);
    if (lines.length) card.appendChild(el('p', 'ep-solve-models', STR.sol_models(lines)));
    var row = el('div', 'ep-photo-row');
    var rep = ui.button('btn ep-solve-report', STR.sol_report, function () {
      rep.disabled = true;
      Track.log('sol_report', { fingerprint: String(b.fingerprint || '').slice(0, 12), label: label, option: b.option === undefined ? null : b.option });
      post({ action: 'report', fingerprint: b.fingerprint, option: b.option || null, label: label })
        .then(function () { rep.textContent = STR.sol_reported; })
        .catch(function () { rep.disabled = false; });
    });
    row.appendChild(rep);
    card.appendChild(row);
    thread.appendChild(card);
    card.scrollIntoView({ block: 'end' });
    if (typeof b.reads_left === 'number') say(STR.sol_left(b.reads_left));
    pastPaper(b.question_text);
    photoChips([weaknessChip()]);
  }
  /* The transcript against the public pool: a past-paper question also gets
   * its verified fix page, exactly as a typed question does. */
  function pastPaper(text) {
    if (!text || typeof Match === 'undefined') return;
    var r = Match.find(String(text).slice(0, 500), candidates(), ctx.ck);
    if (r.few || !r.hits.length) return;
    Track.log('sol_past', { hits: r.hits.length, top: Math.round(r.hits[0].score * 100) / 100 });
    say(STR.sol_past);
    matchCards(r.hits.slice(0, 2));
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
    ctx = { ck: ck || null, stage: 'start', file: null };
    sendBtn.onclick = function () { var t = input.value; input.value = ''; ask(t); };
    input.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); sendBtn.onclick(); } };
    camera.onchange = function () { var f = camera.files && camera.files[0]; camera.value = ''; onFile('camera', f); };
    gallery.onchange = function () { var f = gallery.files && gallery.files[0]; gallery.value = ''; onFile('gallery', f); };
    Track.log('sol_open', { chapter: ck || null });
    greet();
  }

  ui.onLeave('solutionsView', function () { revoke(); clearTimers(); ctx = null; });

  return { show: show };
})();
