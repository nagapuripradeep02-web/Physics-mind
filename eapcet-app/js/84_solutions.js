/* Solutions — the doubt desk: a chat panel where a student brings a problem
 * of their own, as a photo (camera or gallery) or typed.
 *
 * This version reads no photo. The photo is shown back from an object URL,
 * never read into memory beyond the preview, never posted anywhere; the
 * photo flow ends in an honest "not available yet" card. A typed question is
 * matched on the phone (58_match.js) against the public pool and opens the
 * existing fix page, which is gated exactly as it is from a result.
 *
 * Every bubble here is deterministic and carries no AI tag. The bubbles use
 * their own classes (.ep-sol-*), never the run's or the chat's, because the
 * e2e suite reads those unscoped. Leaving the view clears the thread and
 * revokes every object URL. */
var Solutions = (function () {
  var ui = Screens.ui;
  var MAX_BYTES = 15 * 1024 * 1024;
  var thread, chips, input, sendBtn, camera, gallery;
  var ctx = null;          // { ck, stage: 'start' | 'want' | 'work' | 'na' }
  var urls = [];

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

  function greet() {
    say(STR.sol_hello);
    if (ctx.ck) { var ch = Data.chapter(ctx.ck); if (ch) say(STR.sol_from(ch.name)); }
    photoChips();
  }

  // ── the photo: shown back, never sent ──────────────────────────────────
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
    wrap.appendChild(el('div', 'ep-photo-cap', STR.sol_photo_caption));
    var row = el('div', 'ep-photo-row');
    row.appendChild(ui.button('btn', STR.sol_retake, function () { (kind === 'gallery' ? gallery : camera).click(); }));
    row.appendChild(ui.button('btn', STR.sol_remove, function () {
      if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
      ctx.stage = 'start';
      say(STR.sol_hello);
      photoChips();
    }));
    wrap.appendChild(row);
    img.onload = function () {
      thread.appendChild(wrap);
      wrap.scrollIntoView({ block: 'end' });
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
      chip(STR.sol_chip_stuck, 'stuck', function () { say(STR.sol_chip_stuck, 'student'); notAvailable(); }),
      chip(STR.sol_chip_solution, 'solution', function () { say(STR.sol_chip_solution, 'student'); notAvailable(); say(STR.sol_type_hint); input.focus(); })
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
  function ask(text) {
    text = String(text || '').trim().slice(0, 500);
    if (!text) return;
    say(text, 'student');
    var r = Match.find(text, candidates(), ctx.ck);
    Track.log('sol_ask', { chars: text.length, hits: r.hits.length, top: r.hits.length ? Math.round(r.hits[0].score * 100) / 100 : null, few: r.few });
    if (r.few) { say(STR.sol_more_words); return; }
    if (!r.hits.length) { say(STR.sol_no_match); photoChips([weaknessChip()]); return; }
    say(STR.sol_match_q);
    for (var i = 0; i < r.hits.length; i++) (function (hit, rank) {
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
    })(r.hits[i], i + 1);
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
    ctx = { ck: ck || null, stage: 'start' };
    sendBtn.onclick = function () { var t = input.value; input.value = ''; ask(t); };
    input.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); sendBtn.onclick(); } };
    camera.onchange = function () { var f = camera.files && camera.files[0]; camera.value = ''; onFile('camera', f); };
    gallery.onchange = function () { var f = gallery.files && gallery.files[0]; gallery.value = ''; onFile('gallery', f); };
    Track.log('sol_open', { chapter: ck || null });
    greet();
  }

  ui.onLeave('solutionsView', function () { revoke(); ctx = null; });

  return { show: show };
})();
