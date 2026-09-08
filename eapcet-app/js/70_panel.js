/* Panel — the chat under a worked solution. Deterministic chips for the three
 * questions every student asks; free text goes to ep-vidi-chat, grounded
 * server-side on the open question and its verified solution, and every live
 * reply renders under the tag "AI answer — check it against the worked
 * solution above". Deterministic text carries no tag.
 *
 * Inert without EP_CHAT_BASE: no input row, no chips, no request. */
var Panel = (function () {
  var BASE = (window.EP_CHAT_BASE || '').trim();
  var box, thread, input, sendBtn, chipRow;
  var ctx = null;                        // {chapterKey, qid, picked, probe, weakness, streak, steps}
  var history = [];
  var busy = false;

  function say(text, who, tagged) {
    var wrap = el('div', 'ep-chat-msg ' + (who || 'tutor'));
    if (tagged) wrap.appendChild(el('div', 'ep-ai-tag', STR.chat_ai_tag));
    wrap.appendChild(el('div', 'ep-chat-text', text));
    thread.appendChild(wrap);
    wrap.scrollIntoView({ block: 'nearest' });
    return wrap;
  }

  function postAsk(body, retriesLeft) {
    return fetch(BASE, {
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

  function ask(text) {
    if (!BASE || !ctx || busy) return;
    text = String(text || '').trim().slice(0, 1000);
    if (!text) return;
    busy = true;
    say(text, 'student');
    history.push({ role: 'student', text: text });
    var thinking = say(STR.chat_thinking, 'tutor');
    Track.log('ask', { chars: text.length, qid: ctx.qid });
    var t0 = Date.now();
    var body = {
      question: text, question_id: ctx.qid, device_id: Sync.deviceId(),
      session_id: Track.session(), internal: Track.isInternal() || undefined,
      picked: ctx.picked, probe: ctx.probe, weakness: ctx.weakness, streak: ctx.streak,
      recent_messages: history.slice(-6)
    };
    if (Auth.signedIn()) body.access_token = Auth.token();
    postAsk(body, 1).then(function (r) {
      thread.removeChild(thinking);
      var b = r.body || {};
      var locked = !!b.locked;
      var reply = locked ? STR.lock_title : (b.reply || STR.chat_down);
      say(reply, 'tutor', !locked && !!b.reply);
      if (b.reply) history.push({ role: 'vidi', text: b.reply });
      Track.log('reply', { chars: reply.length, ms: Date.now() - t0, locked: locked });
    }).catch(function () {
      thread.removeChild(thinking);
      say(STR.chat_down, 'tutor');
      Track.log('reply', { chars: 0, ms: Date.now() - t0, locked: false, failed: true });
    }).then(function () { busy = false; });
  }

  function chip(label, onTap) {
    var b = el('button', 'ep-chip', label);
    b.type = 'button';
    b.onclick = function () { Track.log('chip', { chip: label, qid: ctx.qid }); onTap(); };
    chipRow.appendChild(b);
  }

  /** Mount the panel under a rendered solution. `context` names the open
      question and where the student is; `steps` is how many steps the solution
      shows, for the "why this step" chip. */
  function mount(container, context) {
    if (!BASE) return;
    ctx = context;
    history = [];
    box = el('section', 'ep-chat');
    box.appendChild(el('div', 'ep-h3', STR.chat_title));
    thread = el('div', 'ep-chat-thread');
    box.appendChild(thread);
    chipRow = el('div', 'ep-chat-chips');
    chip(STR.chat_chip_idea, function () { ask(STR.chat_ask_idea); });
    if (ctx.picked && ctx.picked !== ctx.key) chip(STR.chat_chip_mistake, function () { ask(STR.chat_ask_mistake); });
    chip(STR.chat_chip_why, function () { ask(STR.chat_ask_why(ctx.steps || 1)); });
    box.appendChild(chipRow);
    var row = el('div', 'ep-chat-row');
    input = el('input', 'ep-chat-input');
    input.type = 'text';
    input.placeholder = STR.chat_placeholder;
    input.maxLength = 1000;
    input.setAttribute('aria-label', STR.chat_title);
    sendBtn = el('button', 'btn btn-primary ep-chat-send', STR.chat_send);
    sendBtn.type = 'button';
    sendBtn.onclick = function () { var t = input.value; input.value = ''; ask(t); };
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); sendBtn.onclick(); } });
    row.appendChild(input);
    row.appendChild(sendBtn);
    box.appendChild(row);
    container.appendChild(box);
  }

  /** The step the student last tapped "why?" on — the chip asks about it. */
  function setStep(n) { if (ctx) ctx.steps = n; }

  return { mount: mount, ask: ask, setStep: setStep, on: function () { return !!BASE; } };
})();
