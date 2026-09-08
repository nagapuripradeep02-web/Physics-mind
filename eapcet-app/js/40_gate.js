/* Gate — what this device may open, what it pays, and the way to pay. Copied
 * in shape from answer-book/notebook.js (Gate) with the finder's boundary:
 * the run and the diagnosis are free on every chapter; the worked solutions,
 * the mistakes, the sibling retry and the chat are one paid plan ('all').
 *
 * Inert without EP_STATE_BASE (the standing rides the sync reply): locked()
 * is false, nothing is fetched, and the fix screen says the build has no
 * solutions — never a lock wall in the offline build.
 *
 * The page never holds a solution byte for a locked device: Screens asks
 * Gate.locked() before it asks Sync.bundle(), and the server refuses the
 * bundle to a locked device anyway. */
var Gate = (function () {
  var STATE_BASE = (window.EP_STATE_BASE || '').trim();
  var PAY_BASE = (window.EP_PAY_BASE || '').trim();
  var standing = null;                   // the server's last word: {unlocked, paid_until, signed_in, devices, sku}
  var pendingUnlock = null;              // where the student was headed before paying: '#/physics/<key>/fix/<qid>'
  var poll = null;

  function adopt(out) {
    if (!out || typeof out.unlocked !== 'boolean') return;
    var was = standing && standing.unlocked;
    standing = out;
    if (!out.unlocked && typeof Sync !== 'undefined') Sync.forget();
    if (out.unlocked && !was && pendingUnlock) {
      // Coming back from a successful payment: the plan is live, so drop the
      // student straight into the solution they were trying to open.
      var to = pendingUnlock; pendingUnlock = null;
      Track.log('unlock_seen', {});
      stopPoll();
      location.hash = to;
    }
  }

  function on() { return !!STATE_BASE; }
  function known() { return !!standing; }
  function locked() { return on() && !(standing && standing.unlocked); }
  function price() { return standing && standing.sku && standing.sku.price_inr ? standing.sku : null; }
  function payable() { return !!(PAY_BASE && price()); }
  function paidUntil() { return standing ? standing.paid_until : null; }

  /** Ask the server again. cb(true) once it has answered. */
  function refresh(cb) {
    if (!on()) { cb && cb(false); return; }
    Sync.standing(function (out) { adopt(out); cb && cb(!!out); });
  }

  /** After Razorpay returns, the webhook may land a few seconds after the
      page does. Ask every 5 s for 2 minutes; the first unlocked answer routes. */
  function startPoll() {
    stopPoll();
    var n = 0;
    poll = setInterval(function () {
      n++;
      if (n > 24 || (standing && standing.unlocked)) { stopPoll(); return; }
      refresh();
    }, 5000);
  }
  function stopPoll() { if (poll) { clearInterval(poll); poll = null; } }

  /** Ask the server for a payment link for THIS device and hand the student
      over to Razorpay. The device id rides the payment, so the webhook can
      unlock this very phone seconds after the UPI confirmation. */
  function startPayment(returnTo, onFail) {
    if (!payable()) { onFail && onFail(); return; }
    pendingUnlock = returnTo || null;
    Store.set('ep_pending_unlock', pendingUnlock || '');
    Track.log('pay_start', { signed_in: Auth.signedIn() });
    Track.flush();
    var body = { device_id: Sync.deviceId() };
    if (Auth.signedIn()) body.access_token = Auth.token();
    try {
      fetch(PAY_BASE, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }).then(function (r) { return r.ok ? r.json() : null; })
        .then(function (out) {
          if (out && out.ok && out.url) { location.href = out.url; return; }
          onFail && onFail();
        })
        .catch(function () { onFail && onFail(); });
    } catch (e) { onFail && onFail(); }
  }

  return {
    on: on, known: known, locked: locked, price: price, payable: payable, paidUntil: paidUntil,
    standing: function () { return standing; },
    refresh: refresh, startPayment: startPayment, startPoll: startPoll,
    init: function () {
      if (!on()) return;
      Sync.onStanding(adopt);
      // A payment return lands on the page with the pending route in storage
      // and the standing not yet known: poll until the webhook has landed.
      var pu = Store.get('ep_pending_unlock');
      if (pu) {
        pendingUnlock = pu;
        Store.set('ep_pending_unlock', '');
        Track.log('pay_return', {});
        startPoll();
      }
    }
  };
})();
