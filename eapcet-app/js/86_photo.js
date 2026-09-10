/* Photo — "show me your working": on the fix page of a wrong answer, a photo
 * of the student's page is sent ONCE to ep-photo-read, which returns a
 * tick-list (which verified steps it saw, the final number written, the step
 * where the working leaves the verified one). The student confirms or corrects
 * every line; only then is a photo ROW kept (Run.photo → chapters[ck].photos,
 * synced like a retry). The image is never stored anywhere.
 *
 * Inert without EP_PHOTO_BASE: no block, no input, no request. A locked device
 * gets the plan note and never sends a byte of image. */
var Photo = (function () {
  var BASE = (window.EP_PHOTO_BASE || '').trim();
  var MAX_SIDE = 1600;            // the longer side after downscaling
  var QUALITY = 0.8;              // JPEG quality: a page of working is 200–600 KB
  var MAX_BYTES = 1.5 * 1024 * 1024;
  var MAX_FILE = 25 * 1024 * 1024;

  function on() { return !!BASE; }

  /** Downscale a photo to a JPEG the function accepts; cb(base64, mediaType, bytes) or cb(null). */
  function shrink(file, cb) {
    var url;
    try { url = URL.createObjectURL(file); } catch (e) { cb(null); return; }
    var img = new Image();
    img.onload = function () {
      try {
        var w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
        var scale = Math.min(1, MAX_SIDE / Math.max(w, h, 1));
        var cw = Math.max(1, Math.round(w * scale)), chh = Math.max(1, Math.round(h * scale));
        var canvas = document.createElement('canvas');
        canvas.width = cw; canvas.height = chh;
        var g = canvas.getContext('2d');
        g.fillStyle = '#fff'; g.fillRect(0, 0, cw, chh);       // a PNG with alpha becomes paper, not black
        g.drawImage(img, 0, 0, cw, chh);
        var data = canvas.toDataURL('image/jpeg', QUALITY);
        var b64 = data.slice(data.indexOf(',') + 1);
        URL.revokeObjectURL(url);
        cb(b64, 'image/jpeg', Math.floor(b64.length * 3 / 4));
      } catch (e) { URL.revokeObjectURL(url); cb(null); }
    };
    img.onerror = function () { URL.revokeObjectURL(url); cb(null); };
    img.src = url;
  }

  function post(body) {
    body.device_id = Sync.deviceId();
    body.session_id = Track.session();
    if (Track.isInternal()) body.internal = true;
    if (typeof Auth !== 'undefined' && Auth.signedIn()) body.access_token = Auth.token();
    return fetch(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().then(function (j) { return { status: r.status, body: j }; }); });
  }

  function fileInput(id, capture) {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (capture) input.setAttribute('capture', 'environment');
    input.id = id;
    input.hidden = true;
    return input;
  }

  /* ctx: { chapterKey, q, rec, steps, run_no } — the fix page's question, the
   * run record it was wrong on, the verified steps as shown, and its run. */
  function mount(host, ctx) {
    if (!BASE || !ctx || !ctx.rec || ctx.rec.correct) return null;
    var q = ctx.q, rec = ctx.rec;
    var block = el('section', 'ep-photo-block');
    block.id = 'photoBlock';
    block.appendChild(el('div', 'ep-h3', STR.photo_title));
    block.appendChild(el('p', 'ep-note', STR.photo_intro));
    var camera = fileInput('photoCamera', true), gallery = fileInput('photoGallery', false);
    var row = el('div', 'ep-photo-row');
    var camBtn = button_('btn btn-primary ep-photo-cam', STR.photo_camera, function () { camera.click(); });
    var galBtn = button_('btn ep-photo-gal', STR.photo_gallery, function () { gallery.click(); });
    row.appendChild(camBtn); row.appendChild(galBtn);
    block.appendChild(row);
    block.appendChild(el('p', 'ep-photo-privacy', STR.photo_privacy));
    block.appendChild(camera); block.appendChild(gallery);
    var out = el('div', 'ep-photo-out');
    out.id = 'photoOut';
    block.appendChild(out);
    host.appendChild(block);

    var busy = false;
    function note(text, cls) { clear(out); out.appendChild(el('p', 'ep-note ' + (cls || ''), text)); }
    function onFile(kind, file) {
      if (!file || busy) return;
      Track.log('photo_pick', { qid: q.id, kind: kind, bytes: file.size, type: file.type || '' });
      if (file.size > MAX_FILE) { note(STR.photo_too_large(Math.round(file.size / 1048576))); return; }
      if (Gate.known() && Gate.locked()) { locked(); return; }
      busy = true;
      note(STR.photo_reading, 'ep-photo-wait');
      shrink(file, function (b64, mediaType, bytes) {
        if (!b64) { busy = false; note(STR.photo_bad_file); return; }
        if (bytes > MAX_BYTES) { busy = false; note(STR.photo_too_large(Math.round(bytes / 1048576))); return; }
        var t0 = Date.now();
        post({ action: 'read', question_id: q.id, picked: rec.picked, typed: rec.typed || null, route: rec.route || null,
               image: b64, media_type: mediaType })
          .then(function (r) {
            busy = false;
            var b = r.body || {};
            Track.log('photo_read', { qid: q.id, ms: Date.now() - t0, bytes: bytes, locked: !!b.locked, ok: !!b.ok,
                                      reason: b.reason || null, read_option: b.read_option === undefined ? null : b.read_option, diverges_at: b.diverges_at === undefined ? null : b.diverges_at });
            if (b.locked) { Gate.refresh(); locked(); return; }
            if (!b.ok) { note(STR.photo_reason[b.reason] || STR.photo_down); return; }
            if (b.readable === false) { note(STR.photo_unreadable); return; }
            if (b.on_topic === false) { note(STR.photo_off_topic); return; }
            render(b);
          })
          .catch(function () { busy = false; note(STR.photo_down); Track.log('photo_read', { qid: q.id, ms: Date.now() - t0, bytes: bytes, failed: true }); });
      });
    }
    function locked() {
      clear(out);
      out.appendChild(el('p', 'ep-note', STR.photo_locked));
      var a = el('a', 'btn btn-primary', STR.photo_locked_cta);
      a.href = '#/physics/unlock';
      out.appendChild(a);
    }
    camera.onchange = function () { onFile('camera', camera.files && camera.files[0]); camera.value = ''; };
    gallery.onchange = function () { onFile('gallery', gallery.files && gallery.files[0]); gallery.value = ''; };

    /* The tick-list: one line per verified step, tappable between seen / not
     * seen; the final number read and the option it matches; the step where
     * the working leaves the solution. Confirm keeps the photo row. */
    function render(b) {
      clear(out);
      var steps = ctx.steps || [];
      var list = el('div', 'ep-ticks');
      var states = [];
      for (var i = 0; i < b.steps.length; i++) (function (s, i) {
        states[i] = s.state || (s.found ? 'found' : 'not_found');
        var line = el('div', 'ep-tick');
        line.setAttribute('data-step', String(s.step_index));
        line.setAttribute('data-state', states[i]);
        var head = el('div', 'ep-tick-head');
        var mark = el('span', 'ep-tick-mark', STR.photo_state[states[i]]);
        head.appendChild(mark);
        head.appendChild(el('span', 'ep-tick-step', STR.photo_step(s.step_index, steps[s.step_index - 1] ? steps[s.step_index - 1].text : '')));
        line.appendChild(head);
        if (s.evidence) line.appendChild(el('div', 'ep-tick-ev', STR.photo_saw(s.evidence)));
        var flip = button_('ep-tick-btn', STR.photo_flip, function () {
          states[i] = states[i] === 'found' ? 'not_found' : 'found';
          line.setAttribute('data-state', states[i]);
          mark.textContent = STR.photo_state[states[i]];
          Track.log('photo_flip', { qid: q.id, step: s.step_index, to: states[i] });
        });
        line.appendChild(flip);
        list.appendChild(line);
      })(b.steps[i], i);
      out.appendChild(list);

      var final_ = el('p', 'ep-photo-final');
      final_.id = 'photoFinal';
      if (b.final_value_read) {
        final_.textContent = STR.photo_final(b.final_value_read) + ' ' +
          (b.read_option ? STR.photo_final_option(b.read_option) : STR.photo_final_no_option);
      } else {
        final_.textContent = STR.photo_final_none;
      }
      out.appendChild(final_);
      var div = el('p', 'ep-photo-diverges');
      div.id = 'photoDiverges';
      div.textContent = b.diverges_at ? STR.photo_diverges(b.diverges_at, steps[b.diverges_at - 1] ? steps[b.diverges_at - 1].text : '') : STR.photo_follows;
      out.appendChild(div);
      if (b.note) out.appendChild(el('p', 'ep-note', b.note));

      var actions = el('div', 'ep-photo-row');
      actions.appendChild(button_('btn btn-primary ep-photo-confirm', STR.photo_confirm, function () {
        var evidence = [];
        for (var k = 0; k < b.steps.length; k++) evidence.push({ step: b.steps[k].step_index, found: states[k] === 'found', evidence: b.steps[k].evidence || null, confidence: b.steps[k].confidence });
        var entry = { qid: q.id, run_no: ctx.run_no || null, at: new Date().toISOString(),
                      read_value: b.final_value_read || null, read_option: b.read_option || null,
                      diverges_at: b.diverges_at || null,
                      confidence: b.steps.length ? Math.round(100 * b.steps.reduce(function (a, s) { return a + (s.confidence || 0); }, 0) / b.steps.length) / 100 : null,
                      confirmed: true, evidence: evidence };
        Run.photo(ctx.chapterKey, entry);
        clear(out);
        out.appendChild(el('p', 'ep-note ep-photo-saved', STR.photo_saved));
        var types = (q.option_types || {});
        if (entry.read_option && entry.read_option !== rec.picked && entry.read_option !== q.answer) {
          out.appendChild(el('p', 'ep-note', STR.photo_saved_anchored(entry.read_option, rec.picked)));
        }
        if (entry.read_option && entry.read_option !== q.answer && types[String(entry.read_option)] && types[String(entry.read_option)] !== 'distractor') {
          out.appendChild(el('p', 'ep-note', STR.photo_saved_typed(STR.a_mistake(types[String(entry.read_option)] === 'careless' ? 'calculation' : types[String(entry.read_option)]))));
        }
      }));
      actions.appendChild(button_('btn ep-photo-retake', STR.photo_retake, function () { clear(out); }));
      out.appendChild(actions);
      if (typeof b.reads_left === 'number') out.appendChild(el('p', 'ep-note', STR.photo_left(b.reads_left)));
    }
    return block;
  }

  function button_(cls, label, fn) {
    var b = el('button', cls, label);
    b.type = 'button';
    b.onclick = fn;
    return b;
  }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  return { on: on, mount: mount, shrink: shrink };
})();
