/* Track — telemetry, fire-and-forget. Copied from answer-book/notebook.js
 * (the Vidi module's log/flush/requeue, the visibility timer, the error hook)
 * with EP_ names and keys. Silently inert without a base, so the offline build
 * makes zero requests; the e2e suite asserts exactly that. */
var Track = (function () {
  var BASE = (window.EP_CHAT_BASE || '').trim();

  var session = Store.get('ep_session');
  if (!session) {
    session = 'ep_' + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
    Store.set('ep_session', session);
  }

  // One id per TAB, so two tabs are two visits but one device. sessionStorage
  // can throw under file://, so it gets the same care as Store.
  var visit = '';
  try { visit = sessionStorage.getItem('ep_visit') || ''; } catch (e) {}
  if (!visit) {
    visit = 'v_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
    try { sessionStorage.setItem('ep_visit', visit); } catch (e) {}
  }

  // The team opens this app many times a day on their own phones; every one of
  // those visits would count as a student. #/notastudent/<word> writes
  // ep_internal once per browser; the flag rides every batch and every sync.
  function isInternal() { return Store.get('ep_internal') === '1'; }
  /** true = marked team, false = explicitly un-marked, null = never said. */
  function internalClaim() {
    var v = Store.get('ep_internal');
    return v === '1' ? true : (v === '0' ? false : null);
  }

  var evq = [];
  function log(type, data) {
    if (!BASE) return;
    var e = { t: type, at: Date.now() };
    if (data) for (var k in data) if (Object.prototype.hasOwnProperty.call(data, k)) e[k] = data[k];
    evq.push(e);
    if (evq.length >= 10) flush();
  }
  /** Bounded: a dead endpoint must never grow memory for a whole session. */
  function requeue(batch) { evq = batch.concat(evq).slice(-200); }
  function flush() {
    if (!BASE || !evq.length) return;
    var batch = evq.splice(0, evq.length);
    var body = { type: 'events', session_id: session, visit_id: visit, internal: isInternal(), events: batch };
    if ((window.EP_STATE_BASE || '').trim() && typeof Sync !== 'undefined') body.device_id = Sync.deviceId();
    try {
      fetch(BASE, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body), keepalive: true
      }).then(function (r) { if (!r.ok) requeue(batch); })
        .catch(function () { requeue(batch); });
    } catch (e) { requeue(batch); }
  }

  function markInternal(on) {
    Store.set('ep_internal', on ? '1' : '0');
    log('team_mark', { on: !!on });
    flush();
    if (typeof Sync !== 'undefined') Sync.touch();
  }

  // Visible seconds only — a tab left open behind another window is not being
  // used. Every listener returns early without a base.
  var visSec = 0, dwellSeq = 0;
  var visSince = document.visibilityState === 'visible' ? Date.now() : 0;
  function visNow() { return visSec + (visSince ? Math.round((Date.now() - visSince) / 1000) : 0); }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') { visSec = visNow(); visSince = 0; flush(); }
    else if (!visSince) { visSince = Date.now(); }
  });
  setInterval(function () {
    if (!BASE || !visSince) return;
    dwellSeq++;
    log('dwell', { seq: dwellSeq, vis_s: visNow() });
  }, 60000);
  window.addEventListener('pagehide', function () {
    if (BASE) log('page_leave', { after_s: visNow() });
    flush();
  });

  // Errors on a student's phone are invisible to us otherwise. Capped, so a
  // loop cannot bill one batch per frame.
  var errN = 0;
  function onErr(kind, msg, src, line) {
    if (!BASE || errN >= 10) return;
    errN++;
    log('err', { kind: kind, msg: String(msg || '').slice(0, 200), src: String(src || '').slice(0, 120), line: line || 0 });
  }
  window.addEventListener('error', function (ev) {
    if (ev && ev.target && ev.target !== window && !ev.message) {
      onErr('resource', (ev.target.src || ev.target.href || ''), ev.target.tagName || '');
      return;
    }
    onErr('js', ev && ev.message, ev && ev.filename, ev && ev.lineno);
  }, true);
  window.addEventListener('unhandledrejection', function (ev) {
    var r = ev && ev.reason;
    onErr('promise', r && (r.message || String(r)), '', 0);
  });

  return { log: log, flush: flush, isInternal: isInternal, internalClaim: internalClaim,
           markInternal: markInternal, session: function () { return session; }, visit: function () { return visit; } };
})();
