/**
 * pilot_site_assets — the professor-pilot layer of the review site.
 *
 * Emits the shared root assets that build_review_site.ts injects into every
 * page (catalog + per-concept players):
 *   - pm-config.js     window.PM_CONFIG (pilot Supabase URL + anon key)
 *   - pm-auth.js       login gate: no session → /login.html; forced password
 *                      change on first login; exposes PM.auth for telemetry
 *   - pm-telemetry.js  PM.track(type, payload) → batched inserts into the
 *                      pilot_events table (10s flush + keepalive on pagehide)
 *   - login.html       email/password sign-in + change-password panel
 *
 * Also owns the PILOT allowlist (which concepts professors see): a concept is
 * pilot-approved iff visual_baselines/<id>/baselines.json exists — i.e. the
 * founder ran `npm run visual:approve` on it. No hand-kept list to rot.
 *
 * Data isolation: this is the DEDICATED pilot Supabase project
 * (physicsmind-pilot / jqbnmltsupnnbuvqgkix), NOT the dev/authoring project —
 * professor accounts + analytics never share a database with the cache tables
 * the authoring loop wipes. The anon key below is public-by-design (it ships
 * to every browser; all protection is row-level security on pilot_events:
 * authenticated insert-own-only, no select).
 */

import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// ── Pilot Supabase project (production data; NOT the dev project) ────────────

export const PILOT_SUPABASE_URL = 'https://jqbnmltsupnnbuvqgkix.supabase.co';
export const PILOT_SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxYm5tbHRzdXBubmJ1dnFna2l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNzA4NjEsImV4cCI6MjA5ODg0Njg2MX0.W_ha8YQoYdXh9SZmZ2XrqmyTyv6O3RGoZ64aUS6uPeM';

// Pinned UMD build (window.supabase.createClient) — same CDN pattern as the
// renderer's Three.js/KaTeX. Pinned so a CDN-side major bump can't break login.
const SUPABASE_JS_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js';

/** <head> tags every gated page carries (player + catalog). `depth` = how many
 *  directories deep the page lives (0 = root catalog, 1 = /<concept>/). */
export function pilotHeadTags(depth: number): string {
    const p = depth === 0 ? './' : '../';
    return [
        `<script src="${p}pm-config.js"></script>`,
        `<script src="${SUPABASE_JS_CDN}"></script>`,
        `<script src="${p}pm-auth.js"></script>`,
        `<script src="${p}pm-telemetry.js"></script>`,
    ].join('\n');
}

// ── Pilot allowlist (curated: Rule-31 reconstructed AND EN+Telugu audio complete) ──
// Founder-curated 2026-07-05 from two read-only audits (Rule-31 markers + EN/TE
// audio freshness). This is the SINGLE place to edit when the concept set changes
// — swap in the founder's finalized list here; the build target and the catalog
// filter both read it. NOT baseline-lock auto-detection (that let 5 imperfect sims
// in): a concept qualifies only if it is straightforward/contextual-controls
// (Rule 31, zero wait_for_answer/narrative_socratic/pause_after_ms) AND every
// sentence is voiced fresh in both English and Telugu.
export const PILOT_CONCEPTS: string[] = [
    // Ch.1 — Electric Charges & Fields
    'coulombs_law',
    'electric_field_point_charge',
    'force_on_charge_in_field',
    'electric_field_dipole',
    'charge_distribution',
    'electric_flux',
    'gauss_law',
    'gauss_law_sphere',
    'gauss_law_line',
    // Ch.4 — Moving Charges & Magnetism
    'magnetic_force_moving_charge',
    'magnetic_force_direction_right_hand_rule',
    'magnetic_force_perpendicular_no_work',
    'parallel_currents_force',
    'force_on_current_carrying_wire',
    // Ch.6 — Electromagnetic Induction
    'motional_emf',
    'ac_generator',
    'eddy_currents',
    'inductance',
];

const PILOT_SET = new Set(PILOT_CONCEPTS);

export function isPilotConcept(_root: string, conceptId: string): boolean {
    return PILOT_SET.has(conceptId);
}

export function listPilotConceptIds(root: string): string[] {
    // Build only pilot concepts that actually have a concept JSON on disk.
    return PILOT_CONCEPTS.filter((id) => existsSync(join(root, 'src', 'data', 'concepts', `${id}.json`)));
}

// NCERT Class-12 Physics chapter titles (the concept JSONs' `chapter` field is
// NCERT Class-12 numbering — src/lib/conceptCatalog.ts's CHAPTER_NAMES is the
// Class-11 mechanics scheme and must NOT be used here).
export const CLASS12_CHAPTER_NAMES: Record<number, string> = {
    1: 'Electric Charges & Fields',
    2: 'Electrostatic Potential & Capacitance',
    3: 'Current Electricity',
    4: 'Moving Charges & Magnetism',
    5: 'Magnetism & Matter',
    6: 'Electromagnetic Induction',
    7: 'Alternating Current',
    8: 'Electromagnetic Waves',
};

export function chapterTitle(chapter: number | undefined, classLevel: number | undefined): string {
    if (typeof chapter !== 'number') return 'Other';
    const name = classLevel === 12 ? CLASS12_CHAPTER_NAMES[chapter] : undefined;
    return name ? `Chapter ${chapter} — ${name}` : `Chapter ${chapter}`;
}

// ── Root asset emission ──────────────────────────────────────────────────────
// All client JS below is plain ES5-style vanilla (var/concat, no backticks) so
// it stays trivially readable inside these template literals and runs on any
// classroom browser.

function pmConfigJs(): string {
    return `// Generated by build:review — pilot Supabase project (public anon key; RLS enforces).
window.PM_CONFIG = {
  supabaseUrl: '${PILOT_SUPABASE_URL}',
  supabaseAnonKey: '${PILOT_SUPABASE_ANON_KEY}'
};
`;
}

function pmAuthJs(): string {
    return `// Generated by build:review — login gate + session for the professor pilot.
// No session -> /login.html. First login (must_change_password) -> forced change.
// Fail-open on CDN failure: a broken CDN must never block a live classroom.
(function () {
  // DEV EXEMPTION: on localhost the founder is authoring/testing — no login gate,
  // and pm-telemetry drops events (so dev clicks never pollute pilot_events).
  // Production (the Netlify domain) is gated + tracked as normal.
  var IS_DEV = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  window.PM_DEV = IS_DEV;
  var IS_LOGIN = document.documentElement.getAttribute('data-pm-page') === 'login';
  if (!IS_LOGIN && !IS_DEV) document.documentElement.style.visibility = 'hidden';
  function reveal() { document.documentElement.style.visibility = ''; }

  window.PM = window.PM || {};
  var token = null, user = null, client = null;
  var readyResolve;
  PM.authReady = new Promise(function (res) { readyResolve = res; });
  PM.auth = {
    token: function () { return token; },
    user: function () { return user; },
    client: function () { return client; },
    signOut: function () {
      var done = function () { location.href = toLogin(); };
      if (client) client.auth.signOut().then(done, done); else done();
    }
  };

  function toLogin() {
    var next = location.pathname + location.search;
    return '/login.html?next=' + encodeURIComponent(next);
  }

  if (IS_DEV) {
    // Local authoring/testing: open everything directly, no session, no gate.
    try { console.info('[pm-auth] dev host — login gate off, telemetry off.'); } catch (e) {}
    reveal(); readyResolve(null); return;
  }

  if (!window.PM_CONFIG || !window.supabase) {
    // CDN or config failed — classroom availability wins over the gate.
    try { console.warn('[pm-auth] supabase-js unavailable; page shown ungated, telemetry off.'); } catch (e) {}
    reveal(); readyResolve(null); return;
  }

  client = window.supabase.createClient(PM_CONFIG.supabaseUrl, PM_CONFIG.supabaseAnonKey);

  client.auth.onAuthStateChange(function (_ev, session) {
    token = session ? session.access_token : null;
    user = session ? session.user : null;
  });

  client.auth.getSession().then(function (res) {
    var session = res && res.data ? res.data.session : null;
    if (!session) {
      if (IS_LOGIN) { reveal(); readyResolve(null); return; }
      location.replace(toLogin()); return;
    }
    token = session.access_token; user = session.user;
    var meta = user && user.user_metadata ? user.user_metadata : {};
    if (!IS_LOGIN && meta.must_change_password) {
      location.replace('/login.html?next=' + encodeURIComponent(location.pathname) + '#change');
      return;
    }
    reveal();
    readyResolve(user);
  }, function () { reveal(); readyResolve(null); });
})();
`;
}

function pmTelemetryJs(): string {
    return `// Generated by build:review — pilot analytics. PM.track(type, payload) ->
// batched rows in pilot_events (professor_id stamped server-side via auth.uid()).
// Flush: every 10s, when the batch grows, and on pagehide via keepalive fetch.
(function () {
  window.PM = window.PM || {};
  var FLUSH_MS = 10000, DWELL_MS = 30000, MAX_QUEUE = 500, FLUSH_AT = 40;
  var queue = [];
  // DEV EXEMPTION (matches pm-auth): on localhost, events are console-logged
  // only — NEVER sent — so founder testing can't pollute the professor data.
  var IS_DEV = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  // STAFF EXEMPTION: a logged-in founder/staff account (user_metadata.role ===
  // 'founder' or staff === true) is NEVER recorded — so the founder can use the
  // REAL production app, click through everything, and pollute nothing. Only
  // teacher accounts (no flag) write to pilot_events. Resolves async on auth.
  var isStaff = false;
  PM.isStaff = function () { return isStaff; };
  if (window.PM && PM.authReady && PM.authReady.then) {
    PM.authReady.then(function (u) {
      var m = (u && u.user_metadata) ? u.user_metadata : {};
      if (m.role === 'founder' || m.staff === true) {
        isStaff = true;
        queue = [];   // drop anything captured before auth resolved
        try { console.info('[pm-telemetry] founder/staff session — analytics OFF (nothing recorded).'); } catch (e) {}
      }
    });
  }

  function sessionId() {
    try {
      var s = sessionStorage.getItem('pm_session_id');
      if (!s) { s = (crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + '-' + Math.random().toString(16).slice(2); sessionStorage.setItem('pm_session_id', s); }
      return s;
    } catch (e) { return 'no-session-storage'; }
  }
  var SID = sessionId();

  PM.track = function (type, payload) {
    if (!type) return;
    if (IS_DEV || isStaff) {
      try { console.debug('[pm-telemetry ' + (isStaff ? 'founder' : 'dev') + ', NOT sent] ' + type, payload || {}); } catch (e) {}
      return;
    }
    queue.push({
      session_id: SID,
      concept_id: (typeof window.PM_CONCEPT_ID === 'string' ? window.PM_CONCEPT_ID : null),
      state_id: (typeof window.PM_STATE_ID === 'string' ? window.PM_STATE_ID : null),
      event_type: String(type),
      payload: payload || {},
      client_ts: new Date().toISOString()
    });
    if (queue.length > MAX_QUEUE) queue.splice(0, queue.length - MAX_QUEUE);
    if (queue.length >= FLUSH_AT) flush(false);
  };

  // One device/context snapshot per tab session (projector vs laptop vs tablet).
  // Queued pre-auth is fine: flush() holds until a token exists.
  try {
    if (!sessionStorage.getItem('pm_session_info_sent')) {
      sessionStorage.setItem('pm_session_info_sent', '1');
      PM.track('session_info', {
        screen_w: (window.screen && window.screen.width) || 0,
        screen_h: (window.screen && window.screen.height) || 0,
        vp_w: window.innerWidth || 0,
        vp_h: window.innerHeight || 0,
        dpr: window.devicePixelRatio || 1,
        touch: (navigator.maxTouchPoints || 0) > 0,
        lang: navigator.language || '',
        ua: String(navigator.userAgent || '').slice(0, 120)
      });
    }
  } catch (e) {}

  function flush(unloading) {
    if (isStaff) { queue = []; return; }   // founder/staff: never send
    // Re-check at send time too: on login.html authReady resolves null before
    // sign-in, so the async isStaff flag alone can't protect that page.
    try {
      var su = PM.auth && PM.auth.user && PM.auth.user();
      var sm = (su && su.user_metadata) ? su.user_metadata : {};
      if (sm.role === 'founder' || sm.staff === true) { queue = []; return; }
    } catch (e) {}
    if (!queue.length || !window.PM_CONFIG) return;
    var tok = PM.auth && PM.auth.token && PM.auth.token();
    if (!tok) return;                      // hold until authed; RLS rejects anon anyway
    var batch = queue.splice(0, queue.length);
    try {
      fetch(PM_CONFIG.supabaseUrl + '/rest/v1/pilot_events', {
        method: 'POST',
        keepalive: !!unloading,            // survives tab close (64KB cap — batches are tiny)
        headers: {
          'apikey': PM_CONFIG.supabaseAnonKey,
          'Authorization': 'Bearer ' + tok,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(batch)
      }).then(function (r) {
        if (!r.ok) queue = batch.concat(queue);   // re-queue on server error
      }, function () {
        queue = batch.concat(queue);              // re-queue on network error
      });
    } catch (e) { queue = batch.concat(queue); }
  }

  setInterval(function () { flush(false); }, FLUSH_MS);

  // Explicit flush for callers that navigate away immediately (login redirect).
  PM.flushNow = function () { try { flush(true); } catch (e) {} };

  // Dwell heartbeat: proves the tab is actually in front of a class.
  setInterval(function () {
    if (document.visibilityState === 'visible') PM.track('dwell', {});
  }, DWELL_MS);

  window.addEventListener('pagehide', function () { PM.track('page_leave', {}); flush(true); });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') flush(true);
  });

  // Page-level error capture (catalog + player + login). Capped so an error
  // loop can never flood pilot_events; try-caught so telemetry never rethrows.
  var errCount = 0;
  function trackErr(kind, msg, src, line) {
    try {
      if (errCount >= 10) return;
      errCount++;
      PM.track('client_error', {
        kind: kind,
        message: String(msg || '').slice(0, 300),
        source: String(src || '').slice(0, 200),
        lineno: line || 0
      });
    } catch (e) {}
  }
  window.addEventListener('error', function (e) {
    if (e && e.target && e.target !== window && (e.target.src || e.target.href)) {
      trackErr('resource', e.target.src || e.target.href, '', 0);
      return;
    }
    trackErr('js', e && e.message, e && e.filename, e && e.lineno);
  }, true);
  window.addEventListener('unhandledrejection', function (e) {
    var r = e && e.reason;
    trackErr('rejection', (r && r.message) ? r.message : String(r), '', 0);
  });
})();
`;
}

function loginHtml(): string {
    return `<!DOCTYPE html>
<html lang="en" data-pm-page="login"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sign in — PhysicsMind</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<script src="./pm-config.js"></script>
<script src="${SUPABASE_JS_CDN}"></script>
<script src="./pm-auth.js"></script>
<script src="./pm-telemetry.js"></script>
<style>
  :root{ --bg:#1C1B19; --surface:#262523; --surface-2:#302E2B; --clay:#CB6843; --clay-deep:#B0552F;
         --clay-soft:#E3A07F; --ink:#ECE9E2; --ink-dim:#A8A299; --ink-faint:#726C63;
         --line:rgba(245,240,230,.10); --red:#E06A52; --sage:#74B594;
         --font-disp:"Fraunces",Georgia,serif; --font-ui:"Inter",system-ui,sans-serif; }
  *{box-sizing:border-box;}
  html,body{margin:0;min-height:100%;background:var(--bg);color:var(--ink);font-family:var(--font-ui);-webkit-font-smoothing:antialiased;}
  body::before{content:"";position:fixed;inset:0;pointer-events:none;
    background:radial-gradient(46% 38% at 100% 0%, rgba(203,104,67,.08), transparent 60%),
               radial-gradient(40% 32% at 0% 100%, rgba(116,181,148,.05), transparent 60%);}
  .wrap{position:relative;min-height:100vh;display:grid;place-items:center;padding:24px;}
  .card{width:100%;max-width:400px;background:var(--surface);border:1px solid var(--line);border-radius:18px;
        padding:34px 32px 30px;box-shadow:0 24px 60px -30px rgba(0,0,0,.8);}
  .masthead{display:flex;align-items:center;gap:12px;margin-bottom:26px;}
  .mark{width:40px;height:40px;border-radius:12px;background:var(--clay);flex:none;display:grid;place-items:center;
        box-shadow:0 6px 18px -6px rgba(203,104,67,.55);}
  .mark svg{width:23px;height:23px;}
  .brand b{font-family:var(--font-disp);font-weight:600;font-size:19px;display:block;line-height:1;}
  .brand span{font-size:8.5px;letter-spacing:.22em;text-transform:uppercase;color:var(--ink-faint);margin-top:4px;display:block;}
  h1{font-family:var(--font-disp);font-size:20px;font-weight:600;margin:0 0 4px;}
  p.sub{color:var(--ink-dim);font-size:13px;margin:0 0 22px;line-height:1.5;}
  label{display:block;font-size:12px;font-weight:600;color:var(--ink-dim);margin:14px 0 6px;letter-spacing:.02em;}
  input{width:100%;padding:11px 13px;border-radius:10px;border:1px solid var(--line);background:var(--surface-2);
        color:var(--ink);font-size:14px;font-family:var(--font-ui);outline:none;}
  input:focus{border-color:rgba(203,104,67,.55);}
  button.go{width:100%;margin-top:22px;padding:12px;border:0;border-radius:10px;background:var(--clay);color:#fff;
        font-size:14px;font-weight:600;font-family:var(--font-ui);cursor:pointer;transition:background .15s ease;}
  button.go:hover{background:var(--clay-deep);}
  button.go:disabled{opacity:.55;cursor:default;}
  .err{display:none;margin-top:14px;padding:10px 13px;border-radius:10px;font-size:13px;line-height:1.45;
       color:#F3C9BE;background:rgba(224,106,82,.12);border:1px solid rgba(224,106,82,.4);}
  .ok{display:none;margin-top:14px;padding:10px 13px;border-radius:10px;font-size:13px;
      color:#d3efdd;background:rgba(116,181,148,.12);border:1px solid rgba(116,181,148,.4);}
  #changePanel{display:none;}
  .hint{font-size:11.5px;color:var(--ink-faint);margin-top:6px;}
</style>
</head>
<body>
<div class="wrap"><div class="card">
  <div class="masthead">
    <div class="mark"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="2.3" fill="#fff"/><ellipse cx="12" cy="12" rx="9.6" ry="4" stroke="#fff" stroke-width="1.5"/><ellipse cx="12" cy="12" rx="9.6" ry="4" stroke="#fff" stroke-width="1.5" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9.6" ry="4" stroke="#fff" stroke-width="1.5" transform="rotate(120 12 12)"/></svg></div>
    <div class="brand"><b>PhysicsMind</b><span>Teacher Edition</span></div>
  </div>

  <div id="signinPanel">
    <h1>Sign in</h1>
    <p class="sub">Use the email and password you were given. You can change the password after signing in.</p>
    <form id="signinForm">
      <label for="email">Email</label>
      <input id="email" type="email" autocomplete="username" required>
      <label for="password">Password</label>
      <input id="password" type="password" autocomplete="current-password" required>
      <button class="go" id="signinBtn" type="submit">Sign in</button>
    </form>
  </div>

  <div id="changePanel">
    <h1>Set a new password</h1>
    <p class="sub">Choose your own password. You will use it from now on.</p>
    <form id="changeForm">
      <label for="npw1">New password</label>
      <input id="npw1" type="password" autocomplete="new-password" minlength="8" required>
      <div class="hint">At least 8 characters.</div>
      <label for="npw2">New password (again)</label>
      <input id="npw2" type="password" autocomplete="new-password" minlength="8" required>
      <button class="go" id="changeBtn" type="submit">Save password</button>
    </form>
  </div>

  <div class="err" id="errBox"></div>
  <div class="ok" id="okBox"></div>
</div></div>

<script>
(function () {
  var errBox = document.getElementById('errBox');
  var okBox = document.getElementById('okBox');
  var signinPanel = document.getElementById('signinPanel');
  var changePanel = document.getElementById('changePanel');

  function showErr(m) { errBox.textContent = m; errBox.style.display = 'block'; okBox.style.display = 'none'; }
  function showOk(m) { okBox.textContent = m; okBox.style.display = 'block'; errBox.style.display = 'none'; }
  function clearMsg() { errBox.style.display = 'none'; okBox.style.display = 'none'; }

  function nextUrl() {
    var q = new URLSearchParams(location.search);
    var n = q.get('next') || '/';
    if (n.charAt(0) !== '/' || n.indexOf('//') === 0) n = '/';   // relative-only (no open redirect)
    return n;
  }
  function client() { return PM.auth && PM.auth.client && PM.auth.client(); }
  function mustChange(u) { return !!(u && u.user_metadata && u.user_metadata.must_change_password); }
  function showChange() { signinPanel.style.display = 'none'; changePanel.style.display = 'block'; clearMsg(); }

  // Already signed in? (arrived via the gate's #change redirect, or revisiting)
  PM.authReady.then(function (u) {
    if (u && (mustChange(u) || location.hash.indexOf('change') >= 0)) showChange();
    else if (u) location.replace(nextUrl());
  });

  document.getElementById('signinForm').addEventListener('submit', function (ev) {
    ev.preventDefault(); clearMsg();
    var c = client();
    if (!c) { showErr('Could not load the sign-in service. Check the internet connection and reload.'); return; }
    var btn = document.getElementById('signinBtn'); btn.disabled = true;
    c.auth.signInWithPassword({
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value
    }).then(function (res) {
      btn.disabled = false;
      if (res.error) { showErr('Sign-in failed: ' + res.error.message); return; }
      var u = res.data && res.data.user;
      if (window.PM && PM.track) PM.track('login', {});
      if (window.PM && PM.flushNow) PM.flushNow();   // keepalive fetch survives the redirect
      if (mustChange(u)) showChange();
      else location.replace(nextUrl());
    }, function () { btn.disabled = false; showErr('Network error — please try again.'); });
  });

  document.getElementById('changeForm').addEventListener('submit', function (ev) {
    ev.preventDefault(); clearMsg();
    var p1 = document.getElementById('npw1').value, p2 = document.getElementById('npw2').value;
    if (p1 !== p2) { showErr('The two passwords do not match.'); return; }
    if (p1.length < 8) { showErr('Password must be at least 8 characters.'); return; }
    var c = client();
    if (!c) { showErr('Could not load the sign-in service. Reload and try again.'); return; }
    var btn = document.getElementById('changeBtn'); btn.disabled = true;
    c.auth.updateUser({ password: p1, data: { must_change_password: false } }).then(function (res) {
      btn.disabled = false;
      if (res.error) { showErr('Could not save: ' + res.error.message); return; }
      if (window.PM && PM.track) PM.track('password_changed', {});
      if (window.PM && PM.flushNow) PM.flushNow();
      showOk('Password saved. Taking you to your simulations…');
      setTimeout(function () { location.replace(nextUrl()); }, 900);
    }, function () { btn.disabled = false; showErr('Network error — please try again.'); });
  });
})();
</script>
</body></html>
`;
}

/** Write the four shared root assets into the review-site output dir. */
export function writeRootAssets(outDir: string): void {
    writeFileSync(join(outDir, 'pm-config.js'), pmConfigJs(), 'utf-8');
    writeFileSync(join(outDir, 'pm-auth.js'), pmAuthJs(), 'utf-8');
    writeFileSync(join(outDir, 'pm-telemetry.js'), pmTelemetryJs(), 'utf-8');
    writeFileSync(join(outDir, 'login.html'), loginHtml(), 'utf-8');
    console.log('   pilot: pm-config.js, pm-auth.js, pm-telemetry.js, login.html → review-site/');
}
