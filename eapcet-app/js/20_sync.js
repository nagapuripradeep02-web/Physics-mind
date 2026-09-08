/* Sync — the device id, the debounced push of ep_state_v1 to ep-state, and the
 * one-chapter solution bundle an entitled device pulls into memory. Copied
 * from answer-book/notebook.js (Sync) with EP_ names and the finder's shapes.
 *
 * Inert without EP_STATE_BASE: no id minted, no timer, no request — the
 * offline build makes zero requests and the e2e suite asserts it.
 *
 * ONE ROUND TRIP, BOTH DIRECTIONS. The page posts every chapter it holds; the
 * server merges (a finished run never changes, retries are unique on their
 * client timestamp, the streak is recomputed) and the merged truth comes back
 * with this device's standing. A retry after a dropped connection is free. */
var Sync = (function () {
  var BASE = (window.EP_STATE_BASE || '').trim();
  var PUSH_DEBOUNCE_MS = 2500;
  var timer = null, inFlight = false, again = false;
  var onStanding = null;                 // Gate listens here
  var bundles = {};                      // chapter_key -> {qid: {solution, grounding}} — MEMORY only

  function deviceId() {
    var id = Store.get('ep_device_id');
    if (id && /^[0-9a-f-]{36}$/i.test(id)) return id;
    id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = Math.random() * 16 | 0;
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    Store.set('ep_device_id', id);
    return id;
  }

  function post(body, cb) {
    body.device_id = deviceId();
    if (typeof Auth !== 'undefined' && Auth.signedIn()) body.access_token = Auth.token();
    try {
      fetch(BASE, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }).then(function (r) { return r.ok ? r.json() : null; })
        .then(function (out) { cb(out || null); })
        .catch(function () { cb(null); });        // offline is normal, never an error to show
    } catch (e) { cb(null); }
  }

  function push() {
    if (!BASE || inFlight) { again = again || !!BASE; return; }
    inFlight = true;
    var body = {
      action: 'sync',
      chapters: Run.all().chapters,
      // null = this browser never said; true/false = #/notastudent[/off].
      internal: Track.internalClaim()
    };
    post(body, function (out) {
      if (out && out.ok) {
        if (out.chapters) Run.adopt(out.chapters);
        if (out.standing && onStanding) onStanding(out.standing);
      }
      inFlight = false;
      if (again) { again = false; schedule(); }
    });
  }

  function schedule() {
    if (!BASE) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () { timer = null; push(); }, PUSH_DEBOUNCE_MS);
  }

  /** This device's standing alone (after a payment, or a cold open of #/unlock). */
  function standing(cb) {
    if (!BASE) { cb(null); return; }
    post({ action: 'standing' }, cb);
  }

  /** One chapter's verified solutions, entitled devices only. Kept in memory
      for the session — never in localStorage, so a locked device that once was
      entitled holds no solution byte after its plan lapses. */
  function bundle(chapterKey, cb) {
    if (!BASE) { cb(null); return; }
    if (bundles[chapterKey]) { cb({ ok: true, unlocked: true, solutions: bundles[chapterKey] }); return; }
    post({ action: 'bundle', chapter_key: chapterKey }, function (out) {
      if (out && out.ok && out.unlocked && out.solutions) bundles[chapterKey] = out.solutions;
      cb(out);
    });
  }
  function forget() { bundles = {}; }

  return {
    deviceId: deviceId,
    touch: schedule,
    standing: standing,
    bundle: bundle,
    forget: forget,
    on: function () { return !!BASE; },
    onStanding: function (fn) { onStanding = fn; },
    init: function () {
      if (!BASE) return;                 // inert: no id, no timer, no request
      push();                            // the boot pull doubles as the first push
      window.addEventListener('pagehide', function () {
        if (timer) { clearTimeout(timer); timer = null; }
        push();
      });
    }
  };
})();
