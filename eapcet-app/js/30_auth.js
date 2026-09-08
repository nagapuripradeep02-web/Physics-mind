/* Auth — Google sign-in, so a plan follows the STUDENT, not the phone. Copied
 * from answer-book/notebook.js (Auth) with EP_ names and keys; the account
 * chip is gone — the unlock page carries the sign-in control instead.
 *
 * NO SDK. The whole flow is a redirect to Supabase's own /auth/v1/authorize
 * and a token read back off the URL hash — a single-file build with zero
 * dependencies, and it stays that way.
 *
 * ANONYMOUS FIRST. With no EP_AUTH_BASE the module is inert. Even hosted, a
 * student never has to sign in: the run and the diagnosis work signed out.
 * Signing in buys one thing — carrying a paid plan between devices. */
var Auth = (function () {
  var BASE = (window.EP_AUTH_BASE || '').trim();
  // Supabase Auth wants apikey AND the bearer token. Public anon key by design.
  var ANON = (window.EP_AUTH_ANON || '').trim();
  var K_AT = 'ep_at', K_RT = 'ep_rt', K_EMAIL = 'ep_email';

  function g(k) { return Store.get(k) || ''; }
  function s(k, v) { Store.set(k, v); }
  function d(k) { Store.set(k, ''); try { localStorage.removeItem(k); } catch (e) {} }

  function token() { return g(K_AT); }
  function email() { return g(K_EMAIL); }
  function signedIn() { return !!(BASE && token()); }
  function available() { return !!BASE; }

  /** Hand the student to Google. Comes back to this page with the token on
      the hash, which capture() strips before anything else reads the URL. */
  function signIn() {
    if (!BASE) return;
    Track.log('sign_in_start', {});
    Track.flush();
    var back = location.origin + location.pathname;
    location.href = BASE + '/auth/v1/authorize?provider=google&redirect_to=' + encodeURIComponent(back);
  }

  function signOut() {
    // The DEVICE keeps whatever it owns — signing out only forgets the account.
    d(K_AT); d(K_RT); d(K_EMAIL);
  }

  /** Read #access_token=… on the way back from Google. Must run BEFORE the
      router; the tokens are stripped out of the URL immediately so they never
      sit in browser history or get pasted into a WhatsApp group. */
  function capture() {
    var h = location.hash || '';
    if (h.indexOf('access_token=') < 0) return false;
    var p = {};
    h.replace(/^#/, '').split('&').forEach(function (kv) {
      var i = kv.indexOf('=');
      if (i > 0) {
        try { p[decodeURIComponent(kv.slice(0, i))] = decodeURIComponent(kv.slice(i + 1)); }
        catch (e) { /* a malformed pair is simply not a token */ }
      }
    });
    if (!p.access_token) return false;
    s(K_AT, p.access_token);
    Track.log('sign_in_done', {});
    if (p.refresh_token) s(K_RT, p.refresh_token);
    try {
      history.replaceState(null, '', location.pathname + location.search + '#/unlock');
    } catch (e) { location.hash = '#/unlock'; }
    return true;
  }

  /** Who is signed in, for the label on screen. Never fatal — the plan works
      off the token; the email is a courtesy. ONLY an auth rejection forgets the
      token; a 500 or a blip must never sign a paying student out. */
  function loadProfile(cb) {
    if (!signedIn()) { cb && cb(false); return; }
    try {
      fetch(BASE + '/auth/v1/user', { headers: { apikey: ANON, Authorization: 'Bearer ' + token() } })
        .then(function (r) {
          if (r.status === 401 || r.status === 403) { signOut(); return null; }
          return r.ok ? r.json() : null;
        })
        .then(function (u) {
          if (u && u.email) { s(K_EMAIL, u.email); cb && cb(true); return; }
          cb && cb(false);
        })
        .catch(function () { cb && cb(false); });
    } catch (e) { cb && cb(false); }
  }

  return { available: available, signedIn: signedIn, token: token, email: email,
           signIn: signIn, signOut: signOut, capture: capture, loadProfile: loadProfile };
})();
