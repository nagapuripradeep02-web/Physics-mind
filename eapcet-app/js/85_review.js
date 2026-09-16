/* Review — "I tried, here is my work": the verdict on a photo of the
 * student's own working, from ep-review. 84_solutions.js owns the thread and
 * the state (the question photo, the typed final, the hidden solve, the
 * attempt count); this module owns the ONE request and the verdict card.
 *
 * The request carries the solver's fingerprint, the typed final, the attempt
 * number and the working photo — never a solve field, never the question
 * text. The reply is a verdict: CORRECT (the method in one sentence, when the
 * judge named it), ERROR (ONE line of the student's own page, quoted as read,
 * what should be there, the kind of slip) or UNSURE (take the photo again, or
 * type the value at one unreadable line — which keeps the same attempt). The
 * image is dropped on both ends. Nothing about which model judged is shown.
 *
 * Inert without EP_REVIEW_BASE: Solutions never offers the chip. This file
 * loads after 84_solutions.js, which reads the base itself at init and calls
 * Review.* only at event time. */
var Review = (function () {
  var BASE = (window.EP_REVIEW_BASE || '').trim();

  function on() { return !!BASE; }

  function post(body) {
    body.device_id = Sync.deviceId();
    body.session_id = Track.session();
    if (Track.isInternal()) body.internal = true;
    if (typeof Auth !== 'undefined' && Auth.signedIn()) body.access_token = Auth.token();
    return fetch(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().then(function (j) { return { status: r.status, body: j }; }); });
  }

  /* One review. `host` is the desk's view of its thread (84_solutions.js,
   * host()); `body` is the request without the device fields. Every callback
   * is dropped once the student has left the view (host.live()). An attempt
   * advances only on an ok reply, and to the number the server sends. */
  function start(host, body) {
    var t0 = Date.now();
    var attempt = body.attempt_no;
    var clarify = !!body.typed_value_at_line;
    post(body)
      .then(function (r) {
        if (!host.live()) return;
        host.done();
        var b = r.body || {};
        Track.log('rev_review', { attempt: attempt, clarify: clarify, ms: Date.now() - t0, locked: !!b.locked, ok: !!b.ok, reason: b.reason || null,
                                  verdict: b.verdict || null, error_class: b.error_class || null, ask: b.ask || null,
                                  line: b.first_error_line == null ? null : b.first_error_line,
                                  reads_left: typeof b.reads_left === 'number' ? b.reads_left : null,
                                  escalated: !!b.escalated, server_ms: b.ms || null });
        if (b.locked) { host.onLocked(); return; }
        if (!b.ok) { host.onFail(b.reason || 'down'); return; }
        host.onVerdict(b);
        render(host, b);
      })
      .catch(function () {
        if (!host.live()) return;
        host.done();
        Track.log('rev_review', { attempt: attempt, clarify: clarify, ms: Date.now() - t0, failed: true });
        host.onFail('down');
      });
  }

  function kindOf(verdict) { return verdict === 'CORRECT' ? 'correct' : verdict === 'ERROR' ? 'error' : 'unsure'; }

  /* The verdict card. Correct: the title, the method when the judge named
   * it, the final as read and whether it matches the key. One line to fix:
   * the line number (in the .ep-h3, never inside the .ep-line — KaTeX
   * replaces that text), the student's own line flagged, what should be
   * there, the kind of slip. Not sure: what to do next. Then the attempt
   * count and the dispute button. */
  function render(host, b) {
    var v = kindOf(b.verdict);
    var card = el('div', 'ep-review ep-review-' + v);
    card.setAttribute('data-verdict', v);
    card.setAttribute('data-attempt', String(host.attempt()));
    card.setAttribute('data-review-id', b.review_id == null ? '' : String(b.review_id));
    card.appendChild(el('div', 'ep-eyebrow', STR.rev_eyebrow[v]));
    if (v === 'correct') {
      card.appendChild(el('div', 'ep-review-title', STR.rev_correct_title));
      if (b.method) card.appendChild(el('p', 'ep-review-body', STR.rev_method(String(b.method))));
      if (b.final_value_read) card.appendChild(el('p', 'ep-review-body', STR.rev_final_read(String(b.final_value_read))));
      if (b.final_matches_key) card.appendChild(el('p', 'ep-review-body', STR.rev_final_key));
    } else if (v === 'error') {
      var ev = b.evidence_line || null;
      var n = b.first_error_line || (ev && ev.n) || 0;
      card.appendChild(el('div', 'ep-h3', STR.rev_line_n(n)));
      if (ev) {
        var p = host.paper([ev]);
        if (p.firstChild) p.firstChild.className += ' ep-line-flag';
        card.appendChild(p);
      }
      if (b.what_should_be) {
        card.appendChild(el('div', 'ep-h3', STR.rev_should));
        card.appendChild(host.paper([{ text: String(b.what_should_be) }]));
      }
      if (STR.rev_class[b.error_class]) card.appendChild(el('p', 'ep-review-class', STR.rev_class[b.error_class]));
    } else {
      var askValue = b.ask === 'type_value_at_line' && b.ask_line;
      card.appendChild(el('p', 'ep-review-body', askValue ? STR.rev_ask_value(b.ask_line) : STR.rev_ask_retake));
    }
    var foot = el('div', 'ep-review-foot');
    foot.appendChild(el('span', 'ep-review-attempt', STR.rev_attempt(host.attempt(), host.max)));
    if (b.review_id != null) {
      var dis = Screens.ui.button('ep-review-dispute', STR.rev_dispute, function () {
        dis.disabled = true;
        Track.log('rev_dispute', { review_id: b.review_id, verdict: v, attempt: host.attempt() });
        post({ action: 'dispute', review_id: b.review_id })
          .then(function () { dis.textContent = STR.rev_disputed; })
          .catch(function () { dis.disabled = false; });
      });
      foot.appendChild(dis);
    }
    card.appendChild(foot);
    host.thread.appendChild(card);
    card.scrollIntoView({ block: 'end' });
    if (typeof Tex !== 'undefined') Tex.render(card, function (r) { Track.log('rev_tex', r); });
    chips(host, b, v);
  }

  /** The past question the solver's read matched on the phone, when one did. */
  function similar(host) { return host.qid && typeof Data !== 'undefined' ? Data.question(host.qid) : null; }

  /* After the card: correct → a similar question (when the pool has one),
   * another question, Weakness. The last attempt → the full solution. One
   * line to fix → the next photo, or the solution. Not sure → the photo
   * again (or the typed value, with the box armed), or the solution. */
  function chips(host, b, v) {
    if (v === 'correct') {
      var list = [];
      var q = similar(host);
      if (q) list.push(host.chip(STR.rev_chip_similar, 'similar', function () {
        Track.log('rev_similar', { qid: q.id });
        location.hash = '#/physics/' + q.chapter_key + '/fix/' + encodeURIComponent(q.id);
      }));
      list.push(host.chip(STR.rev_chip_another, 'another', function () { host.say(STR.rev_chip_another, 'student'); host.onRestart(); }));
      list.push(host.weaknessChip());
      host.setChips(list);
      return;
    }
    if (host.attempt() >= host.max) { host.onExhausted(); return; }
    var full = host.chip(STR.rev_chip_solution, 'full', function () { host.say(STR.rev_chip_solution, 'student'); host.onSolution(); });
    full.cls = 'ep-chip-quiet';
    if (v === 'error') {
      host.setChips([host.chip(STR.rev_chip_next, 'next', function () { host.say(STR.rev_chip_next, 'student'); host.onNext(); }), full]);
      return;
    }
    if (b.ask === 'type_value_at_line' && b.ask_line) host.onValue(b.ask_line);
    host.setChips([host.chip(STR.rev_chip_retake, 'retake', function () { host.say(STR.rev_chip_retake, 'student'); host.onRetake(); }), full]);
  }

  return { on: on, start: start, render: render };
})();
