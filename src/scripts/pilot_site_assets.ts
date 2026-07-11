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
 *   - pm-feedback.js   floating "Feedback" pill + mini modal on every gated
 *                      page → direct insert into the pilot_feedback table
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
 * to every browser; all protection is row-level security on pilot_events and
 * pilot_feedback: authenticated insert-own-only, no select).
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
        `<script src="${p}pm-feedback.js" defer></script>`,
    ].join('\n');
}

// ── Pilot allowlist (curated: Rule-31 reconstructed + baseline-locked + visually complete) ──
// Founder-curated. This is the SINGLE place to edit when the concept set changes
// — swap in the founder's finalized list here; the build target and the catalog
// filter both read it. NOT baseline-lock auto-detection (that let 5 imperfect sims
// in): a concept qualifies only if it is straightforward/contextual-controls
// (Rule 31, zero wait_for_answer/narrative_socratic/pause_after_ms), baseline-locked,
// and THE EYE passes against the current renderer.
//
// AUDIO DOCTRINE (founder 2026-07-11 — supersedes the old "EN+Telugu audio complete"
// gate): the sim is a silent visual (Rule 24 — TTS off by default; the teacher
// narrates). Narration audio is therefore ON-DEMAND, not a catalog gate: author the
// Telugu TEXT always (cheap, keeps portability), render English audio when narration
// matters for the pilot, render Telugu audio only on genuine teacher/market demand.
// A concept ships to the catalog on its (complete, baseline-locked) VISUALS; a missing
// audio manifest = silent narration, which is the default anyway. (Amends Rule 30f.)
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
    'gauss_law_sheet',
    'gauss_law_solid_sphere',
    // Ch.4 — Moving Charges & Magnetism
    'magnetic_force_moving_charge',
    'magnetic_force_direction_right_hand_rule',
    'magnetic_force_perpendicular_no_work',
    'parallel_currents_force',
    'force_on_current_carrying_wire',
    // Ch.6 — Electromagnetic Induction
    'faraday_law_induction',
    'motional_emf',
    'ac_generator',
    'eddy_currents',
    'inductance',
    // Ch.3 — Current Electricity (added 2026-07-11; NCERT §3 order)
    // All 7 Rule-31 + baseline-locked; THE EYE clean on current renderer (resistivity
    // renders correctly — its 2 borderline H2 diffs are a stale 640×360 baseline
    // pending a founder visual:approve re-baseline, not a defect). Audio per the
    // on-demand doctrine above: electrical_power_in_resistor + internal_resistance +
    // drift_velocity have English audio; the other 4 ship silent-but-complete until
    // narration is rendered on demand.
    'drift_velocity',
    'ohms_law',
    'resistivity',
    'combination_of_resistors',
    'emf_definition',
    'internal_resistance',
    'electrical_power_in_resistor',
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
    return `// Generated by build:review — login gate + session + PROFILE gate for the teacher pilot.
// Page classes via <html data-pm-page>: 'login'/'join' = public; 'welcome' = session, no
// profile needed; 'expired' = session, no expiry redirect; else full gate (session +
// profile + unexpired trial). PM.authReady resolves AFTER the profile check, so pages
// can read window.PM_PROFILE / window.PM_TRIAL_END inside .then().
// Fail-open on CDN/network failure: a broken CDN must never block a live classroom.
(function () {
  // DEV EXEMPTION: on localhost the founder is authoring/testing — no login gate,
  // and pm-telemetry drops events (so dev clicks never pollute pilot_events).
  // Production (any non-localhost host: app.viditra.co, workers.dev preview) is gated + tracked as normal.
  var IS_DEV = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  window.PM_DEV = IS_DEV;
  window.PM_PROFILE = null;
  window.PM_TRIAL_END = 0;
  var PAGE = document.documentElement.getAttribute('data-pm-page') || '';
  var IS_PUBLIC = PAGE === 'login' || PAGE === 'join';
  if (!IS_PUBLIC && !IS_DEV) document.documentElement.style.visibility = 'hidden';
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
  function pass() { reveal(); readyResolve(user); }

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
      if (IS_PUBLIC) { reveal(); readyResolve(null); return; }
      location.replace(toLogin()); return;
    }
    token = session.access_token; user = session.user;
    var meta = user && user.user_metadata ? user.user_metadata : {};
    if (!IS_PUBLIC && meta.must_change_password) {
      location.replace('/login.html?next=' + encodeURIComponent(location.pathname) + '#change');
      return;
    }
    if (IS_PUBLIC) { pass(); return; }                 // login/join with a session: page script redirects
    if (meta.role === 'founder' || meta.staff === true) { pass(); return; }   // staff: no profile needed

    // ── Profile gate: no profile -> welcome.html; expired trial -> expired.html.
    // Fail-open on any error (classroom availability wins over the gate).
    client.from('teacher_profiles').select('*').maybeSingle().then(function (pr) {
      if (pr && pr.error) { try { console.warn('[pm-auth] profile check failed — fail-open.'); } catch (e) {} pass(); return; }
      var p = pr ? pr.data : null;
      if (!p) {
        if (PAGE === 'welcome') { pass(); return; }     // the setup page itself
        location.replace('/welcome.html'); return;
      }
      window.PM_PROFILE = p;
      var end = 0;
      try { end = new Date(p.trial_started_at).getTime() + (p.trial_days || 14) * 86400000; } catch (e) { end = 0; }
      window.PM_TRIAL_END = end;
      if (end && Date.now() > end) {
        if (PAGE === 'expired') { pass(); return; }
        location.replace('/expired.html'); return;
      }
      if (PAGE === 'welcome' || PAGE === 'expired') { location.replace('/'); return; }   // nothing to do here
      pass();
    }, function () { try { console.warn('[pm-auth] profile check failed — fail-open.'); } catch (e) {} pass(); });
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

function pmFeedbackJs(): string {
    return `// Generated by build:review — teacher feedback widget. Injects a floating
// "Feedback" pill + mini modal on every gated page (catalog + players) and
// inserts submissions DIRECTLY into pilot_feedback (professor_id stamped
// server-side via auth.uid() default; RLS authenticated insert-own-only).
// Deliberate act -> sent immediately with visible success/failure, unlike the
// passive batched pm-telemetry queue. Dev localhost: console-logged, never sent.
// v2: per-state "About" targeting on player pages (reads window.STATES + the
// teacher's own pm_layout_* order/renames; state_id = the selection, null =
// whole sim; current_state_id = auto-captured state on screen) + Web Speech API
// dictation into the text box (en-IN/te-IN/hi-IN, auto-restart on Chrome's
// silence cutoff, 3-min hard cap, mic hidden when the API is unsupported).
(function () {
  if (document.documentElement.getAttribute('data-pm-page') === 'login') return;   // no widget pre-auth
  var IS_DEV = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

  var CSS = [
    '#pmFbPill{position:fixed;right:16px;bottom:16px;z-index:99990;display:flex;align-items:center;gap:7px;',
    '  padding:9px 15px;border:1px solid rgba(203,104,67,.45);border-radius:999px;cursor:pointer;',
    '  background:#262523;color:#E3A07F;font:600 13px "Inter",system-ui,sans-serif;',
    '  box-shadow:0 8px 24px -10px rgba(0,0,0,.7);opacity:.82;transition:opacity .15s ease,background .15s ease;}',
    '#pmFbPill:hover{opacity:1;background:#302E2B;}',
    '#pmFbOverlay{position:fixed;inset:0;z-index:99991;display:none;place-items:center;background:rgba(0,0,0,.45);}',
    '#pmFbOverlay.open{display:grid;}',
    '#pmFbCard{width:min(92vw,380px);background:#262523;color:#ECE9E2;border:1px solid rgba(245,240,230,.12);',
    '  border-radius:16px;padding:20px 20px 16px;box-shadow:0 24px 60px -30px rgba(0,0,0,.85);',
    '  font-family:"Inter",system-ui,sans-serif;}',
    '#pmFbCard h2{margin:0 0 12px;font-size:15px;font-weight:600;font-family:"Fraunces",Georgia,serif;}',
    '#pmFbChips{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;}',
    '.pmFbChip{flex:1 1 auto;min-width:70px;padding:8px 6px;border-radius:10px;cursor:pointer;text-align:center;',
    '  border:1px solid rgba(245,240,230,.12);background:#302E2B;color:#A8A299;font:500 12px inherit;',
    '  font-family:inherit;transition:border-color .12s ease,color .12s ease;}',
    '.pmFbChip:hover{border-color:rgba(203,104,67,.5);}',
    '.pmFbChip.on{border-color:#CB6843;color:#ECE9E2;background:rgba(203,104,67,.16);}',
    '.pmFbChip .fbe{display:block;font-size:17px;margin-bottom:2px;}',
    '#pmFbText{width:100%;box-sizing:border-box;min-height:74px;resize:vertical;padding:10px 12px;border-radius:10px;',
    '  border:1px solid rgba(245,240,230,.12);background:#302E2B;color:#ECE9E2;font:400 13px/1.5 inherit;',
    '  font-family:inherit;outline:none;}',
    '#pmFbText:focus{border-color:rgba(203,104,67,.55);}',
    '#pmFbAboutRow{display:flex;align-items:center;gap:8px;margin-bottom:10px;}',
    '#pmFbAboutRow label{flex:none;font-size:12px;font-weight:600;color:#A8A299;}',
    '#pmFbState{flex:1 1 auto;min-width:0;padding:7px 9px;border-radius:9px;border:1px solid rgba(245,240,230,.12);',
    '  background:#302E2B;color:#ECE9E2;font:500 12.5px inherit;font-family:inherit;outline:none;}',
    '#pmFbState:focus{border-color:rgba(203,104,67,.55);}',
    '#pmFbMicRow{display:flex;align-items:center;gap:8px;margin-top:10px;flex-wrap:wrap;}',
    '#pmFbMic{display:inline-flex;align-items:center;gap:6px;padding:8px 13px;border-radius:999px;cursor:pointer;',
    '  border:1px solid rgba(245,240,230,.14);background:#302E2B;color:#ECE9E2;font:600 12.5px inherit;',
    '  font-family:inherit;transition:border-color .15s ease,background .15s ease;}',
    '#pmFbMic:hover{border-color:rgba(203,104,67,.5);}',
    '#pmFbMic.on{background:rgba(224,106,82,.14);border-color:#E06A52;color:#F3C9BE;animation:pmFbPulse 1.3s ease-in-out infinite;}',
    '@keyframes pmFbPulse{0%,100%{box-shadow:0 0 0 0 rgba(224,106,82,.35);}50%{box-shadow:0 0 0 7px rgba(224,106,82,0);}}',
    '#pmFbSttLang{padding:7px 8px;border-radius:9px;border:1px solid rgba(245,240,230,.12);background:#302E2B;',
    '  color:#A8A299;font:500 12px inherit;font-family:inherit;outline:none;}',
    '#pmFbInterim{flex:1 1 100%;min-height:15px;font-size:12px;line-height:1.4;color:#726C63;font-style:italic;}',
    '#pmFbErr{display:none;margin-top:10px;padding:8px 11px;border-radius:9px;font-size:12.5px;line-height:1.45;',
    '  color:#F3C9BE;background:rgba(224,106,82,.12);border:1px solid rgba(224,106,82,.4);}',
    '#pmFbBtns{display:flex;justify-content:flex-end;gap:9px;margin-top:14px;}',
    '#pmFbBtns button{padding:9px 16px;border-radius:9px;font:600 13px inherit;font-family:inherit;cursor:pointer;}',
    '#pmFbCancel{border:1px solid rgba(245,240,230,.14);background:none;color:#A8A299;}',
    '#pmFbCancel:hover{color:#ECE9E2;}',
    '#pmFbSend{border:0;background:#CB6843;color:#fff;}',
    '#pmFbSend:hover{background:#B0552F;}',
    '#pmFbSend:disabled{opacity:.45;cursor:default;}',
    '#pmFbThanks{display:none;text-align:center;padding:18px 4px 12px;font-size:14px;color:#d3efdd;}',
    '.pmFbFoot{color:#E3A07F !important;border-color:rgba(203,104,67,.4) !important;white-space:nowrap;}',
    '@media (max-width:760px){#pmFbPill{right:10px;bottom:64px;padding:8px 12px;}}'
  ].join('\\n');

  var MOODS = [
    ['confusing', '\\uD83D\\uDE15', 'Confusing'],
    ['okay',      '\\uD83D\\uDE42', 'Okay'],
    ['great',     '\\uD83D\\uDE00', 'Great'],
    ['broken',    '\\uD83D\\uDC1E', 'Broken']
  ];
  var PLACEHOLDER = 'Tell us more\\u2026 (optional)';
  var PLACEHOLDER_BROKEN = 'What went wrong? Which state?';

  var mood = null, sending = false;

  function sessionId() {
    try { return sessionStorage.getItem('pm_session_id') || null; } catch (e) { return null; }
  }

  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // "About" select options — the teacher's own saved order + renamed titles
  // (pm_layout_<id>: {order, hidden, names}), falling back to authored order.
  // Hidden states stay listed: feedback may be exactly about why one was hidden.
  function stateOptionsHtml() {
    var sts = window.STATES;
    if (!sts || !sts.length) return null;
    var order = null, names = {};
    try {
      var d = JSON.parse(localStorage.getItem('pm_layout_' + window.PM_CONCEPT_ID) || 'null');
      if (d) {
        if (d.order && d.order.length === sts.length) order = d.order;
        if (d.names && typeof d.names === 'object') names = d.names;
      }
    } catch (e) {}
    var html = '<option value="">Whole simulation</option>';
    for (var p = 0; p < sts.length; p++) {
      var si = order ? order[p] : p;
      var st = (typeof si === 'number') ? sts[si] : null;
      if (!st) { si = p; st = sts[p]; }
      html += '<option value="' + escHtml(st.id) + '">' + (p + 1) + ' \\u00B7 ' +
        escHtml(names[si] || st.title || st.id) + '</option>';
    }
    return html;
  }

  // ── Speech-to-text (Web Speech API — Chrome/Edge; mic hidden elsewhere) ──
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var STT_MAX_MS = 180000;   // hard cap per arming so a forgotten mic can't run away

  function sttStartLang() {
    try {
      var saved = localStorage.getItem('pm_fb_stt_lang');
      if (saved === 'en-IN' || saved === 'te-IN' || saved === 'hi-IN') return saved;
      var l = localStorage.getItem('pm_lang_' + window.PM_CONCEPT_ID);
      if (l === 'te') return 'te-IN';
      if (l === 'hi') return 'hi-IN';
    } catch (e) {}
    return 'en-IN';
  }

  function build() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var pill = document.createElement('button');
    pill.type = 'button';
    pill.innerHTML = '\\uD83D\\uDCAC Feedback';
    pill.title = 'Tell us how this is working for you';
    // Player pages: sit natively in the footer transport (a floating pill would
    // cover the auto-advance/counter controls and the sim in full screen).
    // Catalog (no footer transport): floating bottom-right pill.
    var foot = document.querySelector('footer .controls');
    if (foot) { pill.className = 'pmFbFoot'; foot.appendChild(pill); }
    else { pill.id = 'pmFbPill'; document.body.appendChild(pill); }

    var overlay = document.createElement('div');
    overlay.id = 'pmFbOverlay';
    var chipsHtml = '';
    for (var i = 0; i < MOODS.length; i++) {
      chipsHtml += '<button type="button" class="pmFbChip" data-mood="' + MOODS[i][0] + '">' +
        '<span class="fbe">' + MOODS[i][1] + '</span>' + MOODS[i][2] + '</button>';
    }
    var aboutRow = stateOptionsHtml()
      ? '<div id="pmFbAboutRow"><label for="pmFbState">About</label><select id="pmFbState"></select></div>'
      : '';
    var micRow = SR
      ? '<div id="pmFbMicRow">' +
          '<button type="button" id="pmFbMic" title="Speak your feedback instead of typing">\\uD83C\\uDFA4 Speak</button>' +
          '<select id="pmFbSttLang" title="Speech language">' +
            '<option value="en-IN">English</option>' +
            '<option value="te-IN">\\u0C24\\u0C46\\u0C32\\u0C41\\u0C17\\u0C41</option>' +
            '<option value="hi-IN">\\u0939\\u093F\\u0902\\u0926\\u0940</option>' +
          '</select>' +
          '<span id="pmFbInterim"></span>' +
        '</div>'
      : '';
    overlay.innerHTML =
      '<div id="pmFbCard" role="dialog" aria-label="Send feedback">' +
        '<div id="pmFbForm">' +
          '<h2>How is this working for you?</h2>' +
          '<div id="pmFbChips">' + chipsHtml + '</div>' +
          aboutRow +
          '<textarea id="pmFbText" maxlength="2000" placeholder="' + PLACEHOLDER + '"></textarea>' +
          micRow +
          '<div id="pmFbErr"></div>' +
          '<div id="pmFbBtns">' +
            '<button type="button" id="pmFbCancel">Cancel</button>' +
            '<button type="button" id="pmFbSend" disabled>Send \\u25B8</button>' +
          '</div>' +
        '</div>' +
        '<div id="pmFbThanks">Thanks \\u2014 we read every note \\u2713</div>' +
      '</div>';
    document.body.appendChild(overlay);

    var text = overlay.querySelector('#pmFbText');
    var send = overlay.querySelector('#pmFbSend');
    var err = overlay.querySelector('#pmFbErr');
    var form = overlay.querySelector('#pmFbForm');
    var thanks = overlay.querySelector('#pmFbThanks');
    var chips = overlay.querySelectorAll('.pmFbChip');
    var stateSel = overlay.querySelector('#pmFbState');
    var micBtn = overlay.querySelector('#pmFbMic');
    var sttLang = overlay.querySelector('#pmFbSttLang');
    var interim = overlay.querySelector('#pmFbInterim');

    function refresh() {
      send.disabled = sending || (!mood && !text.value.replace(/\\s/g, ''));
      text.placeholder = mood === 'broken' ? PLACEHOLDER_BROKEN : PLACEHOLDER;
    }
    function open() {
      if (stateSel) {
        // Rebuild every open — the teacher may have reordered/renamed states
        // in the rail since the page loaded.
        var opts = stateOptionsHtml();
        if (opts) stateSel.innerHTML = opts;
        stateSel.value = '';
      }
      overlay.className = 'open';
      form.style.display = '';
      thanks.style.display = 'none';
      err.style.display = 'none';
      refresh();
    }
    function close() { stopStt(); overlay.className = ''; }

    pill.addEventListener('click', open);
    overlay.querySelector('#pmFbCancel').addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.className === 'open') close();
    });

    for (var j = 0; j < chips.length; j++) {
      chips[j].addEventListener('click', function () {
        var m = this.getAttribute('data-mood');
        mood = (mood === m) ? null : m;   // tap again to unselect
        for (var k = 0; k < chips.length; k++) {
          chips[k].className = 'pmFbChip' + (chips[k].getAttribute('data-mood') === mood ? ' on' : '');
        }
        refresh();
      });
    }
    text.addEventListener('input', refresh);

    // ── Dictation: finals append into the editable textarea; the current
    // hypothesis shows greyed underneath. Chrome ends recognition on silence,
    // so onend re-arms a fresh instance while the mic stays on (capped).
    var rec = null, micOn = false, armedAt = 0;
    function appendFinal(t) {
      t = t.replace(/^\\s+|\\s+$/g, '');
      if (!t) return;
      text.value = (text.value.replace(/\\s+$/g, '') + ' ' + t).replace(/^\\s+/g, '').slice(0, 2000);
      refresh();
    }
    function setMicUi() {
      if (!micBtn) return;
      micBtn.className = micOn ? 'on' : '';
      micBtn.innerHTML = micOn ? '\\u25CF Listening \\u2014 tap to stop' : '\\uD83C\\uDFA4 Speak';
      if (!micOn && interim) interim.textContent = '';
    }
    function stopStt() {
      micOn = false;
      if (rec) { try { rec.stop(); } catch (e) {} }
      setMicUi();
    }
    function startStt() {
      if (!SR) return;
      micOn = true;
      armedAt = Date.now();
      err.style.display = 'none';
      runStt();
      setMicUi();
    }
    function runStt() {
      var r = new SR();
      rec = r;
      r.lang = sttLang ? sttLang.value : 'en-IN';
      r.continuous = true;
      r.interimResults = true;
      r.onresult = function (ev) {
        var hyp = '';
        for (var k = ev.resultIndex; k < ev.results.length; k++) {
          var res = ev.results[k];
          if (res.isFinal) appendFinal(res[0].transcript);
          else hyp += res[0].transcript;
        }
        if (interim) interim.textContent = hyp;
      };
      r.onerror = function (ev) {
        var code = (ev && ev.error) || 'unknown';
        if (code === 'no-speech') {
          if (interim) interim.textContent = 'Didn\\u2019t catch that \\u2014 keep speaking, or tap the mic to stop.';
          return;   // onend fires next and re-arms while the mic is on
        }
        if (code === 'aborted') return;   // our own stop/restart
        stopStt();
        if (code === 'not-allowed' || code === 'service-not-allowed') failed('Microphone blocked \\u2014 allow it from the mic/lock icon in the address bar, then try again.');
        else if (code === 'audio-capture') failed('No microphone found on this device.');
        else if (code === 'network') failed('Speech needs an internet connection \\u2014 you can type instead.');
        else failed('Speech input stopped \\u2014 you can type instead.');
      };
      r.onend = function () {
        if (rec !== r) return;   // superseded by a newer instance
        if (micOn && Date.now() - armedAt < STT_MAX_MS) {
          setTimeout(function () { if (micOn && rec === r) runStt(); }, 120);
        } else if (micOn) {
          stopStt();
        }
      };
      try { r.start(); } catch (e) { stopStt(); }
    }
    if (micBtn) {
      try { sttLang.value = sttStartLang(); } catch (e) {}
      micBtn.addEventListener('click', function () { if (micOn) stopStt(); else startStt(); });
      sttLang.addEventListener('change', function () {
        try { localStorage.setItem('pm_fb_stt_lang', sttLang.value); } catch (e) {}
        if (micOn) { stopStt(); startStt(); }   // restart in the new language
      });
      window.addEventListener('pagehide', stopStt);
    }

    function succeeded() {
      sending = false;
      mood = null;
      text.value = '';
      for (var k = 0; k < chips.length; k++) chips[k].className = 'pmFbChip';
      form.style.display = 'none';
      thanks.style.display = 'block';
      setTimeout(close, 1200);
    }
    function failed(msg) {
      sending = false;
      err.textContent = msg;
      err.style.display = 'block';
      refresh();
    }

    send.addEventListener('click', function () {
      if (sending) return;
      stopStt();
      var body = text.value.replace(/^\\s+|\\s+$/g, '').slice(0, 2000);
      if (!mood && !body) return;
      var row = {
        session_id: sessionId(),
        concept_id: (typeof window.PM_CONCEPT_ID === 'string' ? window.PM_CONCEPT_ID : null),
        state_id: (stateSel && stateSel.value) ? stateSel.value : null,   // teacher's pick; null = whole sim
        current_state_id: (typeof window.PM_STATE_ID === 'string' ? window.PM_STATE_ID : null),
        page: (typeof window.PM_CONCEPT_ID === 'string' ? 'player' : 'catalog'),
        mood: mood,
        text: body || null,
        client_ts: new Date().toISOString()
      };
      if (IS_DEV) {
        try { console.debug('[pm-feedback dev, NOT sent]', row); } catch (e) {}
        succeeded();
        return;
      }
      var tok = window.PM && PM.auth && PM.auth.token && PM.auth.token();
      if (!tok || !window.PM_CONFIG) { failed('Could not send \\u2014 please sign in again and retry.'); return; }
      sending = true;
      refresh();
      fetch(PM_CONFIG.supabaseUrl + '/rest/v1/pilot_feedback', {
        method: 'POST',
        headers: {
          'apikey': PM_CONFIG.supabaseAnonKey,
          'Authorization': 'Bearer ' + tok,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(row)
      }).then(function (r) {
        if (r.ok) succeeded();
        else failed('Couldn\\u2019t send \\u2014 check the connection and try again.');
      }, function () {
        failed('Couldn\\u2019t send \\u2014 check the connection and try again.');
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
`;
}

function loginHtml(): string {
    return `<!DOCTYPE html>
<html lang="en" data-pm-page="login"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sign in — Viditra</title>
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
  button.gbtn{width:100%;display:flex;align-items:center;justify-content:center;gap:9px;padding:11px;
        border:1px solid var(--line);border-radius:10px;background:var(--surface-2);color:var(--ink);
        font-size:14px;font-weight:600;font-family:var(--font-ui);cursor:pointer;transition:border-color .15s ease;}
  button.gbtn:hover{border-color:rgba(203,104,67,.5);}
  .or{display:flex;align-items:center;gap:10px;margin:16px 0 2px;color:var(--ink-faint);font-size:11px;}
  .or::before,.or::after{content:"";flex:1;height:1px;background:var(--line);}
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
    <div class="brand"><b>Viditra</b><span>Teacher Edition</span></div>
  </div>

  <div id="signinPanel">
    <h1>Sign in</h1>
    <p class="sub">Continue with Google, or use the email and password you were given.</p>
    <button class="gbtn" id="googleBtn" type="button">
      <svg viewBox="0 0 48 48" width="17" height="17" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.2 5.2C40.7 35.6 44 30.3 44 24c0-1.2-.1-2.3-.4-3.5z"/></svg>
      Continue with Google
    </button>
    <div class="or"><span>or with a password</span></div>
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

  document.getElementById('googleBtn').addEventListener('click', function () {
    clearMsg();
    var c = client();
    if (!c) { showErr('Could not load the sign-in service. Check the internet connection and reload.'); return; }
    var back = location.origin + '/login.html' + (location.search || '');
    c.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: back } }).then(function (res) {
      if (res && res.error) showErr('Google sign-in failed: ' + res.error.message);
    }, function () { showErr('Network error — please try again.'); });
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

// ── join.html — the PUBLIC "Start your free trial" landing ──────────────────
// The single URL every website CTA and WhatsApp message points at (no invite
// codes, no per-teacher links — founder decision 2026-07-11). Google-first;
// the password link exists for the two legacy pilot-professor accounts.
function joinHtml(): string {
    return `<!DOCTYPE html>
<html lang="en" data-pm-page="join"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Start your free trial — Viditra</title>
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
  p.sub{color:var(--ink-dim);font-size:13px;margin:0 0 16px;line-height:1.5;}
  ul.perk{list-style:none;margin:0 0 20px;padding:0;color:var(--ink-dim);font-size:13px;line-height:2;}
  ul.perk li::before{content:"\\2713";color:var(--sage);font-weight:700;margin-right:9px;}
  button.gbtn{width:100%;display:flex;align-items:center;justify-content:center;gap:9px;padding:11px;
        border:1px solid var(--line);border-radius:10px;background:var(--surface-2);color:var(--ink);
        font-size:14px;font-weight:600;font-family:var(--font-ui);cursor:pointer;transition:border-color .15s ease;}
  button.gbtn:hover{border-color:rgba(203,104,67,.5);}
  a.alt{display:block;text-align:center;margin-top:16px;color:var(--ink-dim);font-size:12.5px;text-decoration:none;}
  a.alt:hover{color:var(--clay-soft);}
  .err{display:none;margin-top:14px;padding:10px 13px;border-radius:10px;font-size:13px;line-height:1.45;
       color:#F3C9BE;background:rgba(224,106,82,.12);border:1px solid rgba(224,106,82,.4);}
</style>
</head>
<body>
<div class="wrap"><div class="card">
  <div class="masthead">
    <div class="mark"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="2.3" fill="#fff"/><ellipse cx="12" cy="12" rx="9.6" ry="4" stroke="#fff" stroke-width="1.5"/><ellipse cx="12" cy="12" rx="9.6" ry="4" stroke="#fff" stroke-width="1.5" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9.6" ry="4" stroke="#fff" stroke-width="1.5" transform="rotate(120 12 12)"/></svg></div>
    <div class="brand"><b>Viditra</b><span>Teacher Edition</span></div>
  </div>

  <h1>Start your free trial</h1>
  <p class="sub">Interactive 3D physics simulations you teach with — your own space, ready in under a minute.</p>
  <ul class="perk">
    <li>Two weeks free &mdash; the full simulation library</li>
    <li>No card, no commitment</li>
    <li>Everything you customize is saved to your account</li>
  </ul>
  <button class="gbtn" id="googleBtn" type="button">
    <svg viewBox="0 0 48 48" width="17" height="17" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.2 5.2C40.7 35.6 44 30.3 44 24c0-1.2-.1-2.3-.4-3.5z"/></svg>
    Continue with Google
  </button>
  <a class="alt" id="pwLink" href="/login.html">I already have an email &amp; password account</a>
  <div class="err" id="errBox"></div>
</div></div>

<script>
(function () {
  var errBox = document.getElementById('errBox');
  function showErr(m) { errBox.textContent = m; errBox.style.display = 'block'; }
  // Already signed in (tapped the link again)? The gate routes them to catalog/welcome/expired.
  PM.authReady.then(function (u) { if (u) location.replace('/'); });
  document.getElementById('googleBtn').addEventListener('click', function () {
    var c = PM.auth && PM.auth.client && PM.auth.client();
    if (!c) { showErr('Could not load the sign-in service. Check the internet connection and reload.'); return; }
    c.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + '/welcome.html' } })
      .then(function (res) { if (res && res.error) showErr('Google sign-in failed: ' + res.error.message); },
            function () { showErr('Network error — please try again.'); });
  });
})();
</script>
</body></html>
`;
}

/** Write the shared root assets into the review-site output dir. */
export function writeRootAssets(outDir: string): void {
    writeFileSync(join(outDir, 'pm-config.js'), pmConfigJs(), 'utf-8');
    writeFileSync(join(outDir, 'pm-auth.js'), pmAuthJs(), 'utf-8');
    writeFileSync(join(outDir, 'pm-telemetry.js'), pmTelemetryJs(), 'utf-8');
    writeFileSync(join(outDir, 'pm-feedback.js'), pmFeedbackJs(), 'utf-8');
    writeFileSync(join(outDir, 'login.html'), loginHtml(), 'utf-8');
    writeFileSync(join(outDir, 'join.html'), joinHtml(), 'utf-8');
    console.log('   pilot: pm-config.js, pm-auth.js, pm-telemetry.js, pm-feedback.js, login.html, join.html → review-site/');
}
