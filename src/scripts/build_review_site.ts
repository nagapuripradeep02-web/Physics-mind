/**
 * build:review — turn a hand-authored field_3d diamond into a self-contained,
 * static "review site" page that plays the FULL guided lesson (3D scene +
 * browser Web-Speech narration + state progression) with NO backend, so it can
 * be hosted on any free static host (Netlify Drop / Cloudflare Pages) and the
 * link sent to an external reviewer.
 *
 * It writes, per concept, into ./review-site/<concept_id>/ :
 *   - sim.html      the assembled, self-contained field_3d scene
 *                   (assembleField3DHtml — CDN Three.js/KaTeX, no Supabase)
 *   - index.html    a vanilla continuous lesson player (iframe + narration +
 *                   state badge + pace controls). Narration is the PARENT
 *                   page's speechSynthesis (the iframe never speaks); per-
 *                   sentence glow/math/hand/freeze are postMessaged to the
 *                   iframe exactly like the admin _TtsPlayButton harness.
 *   - meta.json     {concept_id, concept_name} for the catalog.
 * and (re)writes ./review-site/index.html — the catalog of all built sims.
 *
 * Rule 18-safe: deterministic assembly from the concept JSON, no LLM call.
 *
 * Usage:
 *   npx tsx src/scripts/build_review_site.ts <concept_id>
 *   (no env needed — nothing talks to Supabase)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { assembleField3DHtml, type Field3DConfig } from '@/lib/renderers/field_3d_renderer';

// ── Types (subset of the concept JSON we read) ───────────────────────────────

type TtsSentenceJson = {
    text_en?: string;
    glow?: string | string[] | null;
    math_show?: string | null;
    math_persist?: boolean;
    hand_phase?: 'v' | 'b' | 'f' | null;
    freeze_proton?: boolean;
};

type ConceptJson = {
    concept_id?: string;
    concept_name?: string;
    default_flow?: string[];
    field_3d_config?: Field3DConfig;
    epic_l_path?: {
        state_count?: number;
        states?: Record<
            string,
            {
                title?: string;
                advance_mode?: string;
                duration?: number;
                teacher_script?: { tts_sentences?: TtsSentenceJson[] };
            }
        >;
    };
};

type ReviewSentence = {
    text: string;
    glow: string | string[] | null;
    math_show: string | null;
    math_persist: boolean;
    hand_phase: 'v' | 'b' | 'f' | null;
    freeze_proton: boolean;
};

type ReviewState = {
    id: string;
    title: string;
    advance_mode: string;
    duration: number;
    sentences: ReviewSentence[];
};

// ── Paths ────────────────────────────────────────────────────────────────────

const ROOT = process.cwd();
const CONCEPTS_DIR = join(ROOT, 'src', 'data', 'concepts');
const OUT_DIR = join(ROOT, 'review-site');

// ── Helpers ──────────────────────────────────────────────────────────────────

function stateNumber(id: string): number {
    const m = /STATE_(\d+)/.exec(id);
    return m ? parseInt(m[1], 10) : 9999;
}

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/** JSON for safe embedding inside an inline <script> (no </script> break). */
function embedJson(value: unknown): string {
    // Escape <, U+2028 and U+2029 so the JSON is safe inside an inline <script>.
    const BS = String.fromCharCode(92);
    return JSON.stringify(value).replace(/[<\u2028\u2029]/g, (c) =>
        BS + 'u' + ('000' + c.charCodeAt(0).toString(16)).slice(-4));
}

function loadConcept(conceptId: string): ConceptJson {
    const path = join(CONCEPTS_DIR, `${conceptId}.json`);
    if (!existsSync(path)) {
        throw new Error(`Concept JSON not found: ${path}`);
    }
    return JSON.parse(readFileSync(path, 'utf-8')) as ConceptJson;
}

function extractStates(json: ConceptJson): ReviewState[] {
    const states = json.epic_l_path?.states ?? {};
    return Object.keys(states)
        .sort((a, b) => stateNumber(a) - stateNumber(b))
        .map((id) => {
            const st = states[id];
            const sentences: ReviewSentence[] = (st.teacher_script?.tts_sentences ?? [])
                .map((s) => ({
                    text: s.text_en ?? '',
                    glow: s.glow ?? null,
                    math_show: s.math_show ?? null,
                    math_persist: s.math_persist === true,
                    hand_phase: s.hand_phase ?? null,
                    freeze_proton: s.freeze_proton === true,
                }))
                .filter((s) => s.text.length > 0);
            return {
                id,
                title: st.title ?? id,
                advance_mode: st.advance_mode ?? 'manual_click',
                duration: typeof st.duration === 'number' ? st.duration : 12,
                sentences,
            };
        });
}

// ── Per-concept review page (vanilla player) ─────────────────────────────────
// IMPORTANT: the inline <script> below uses NO backticks and NO `${` so it can
// live inside this outer template literal. Only the marked injection points use
// `${ }`.

function renderConceptPage(
    conceptName: string,
    conceptId: string,
    states: ReviewState[],
    defaultFlow: string[] | undefined,
): string {
    const statesJson = embedJson(states);
    const nameJson = embedJson(conceptName);
    const idJson = embedJson(conceptId);
    // Canonical default order = the reviewer's recommended flow if present
    // (mapped to STATES indices), else the authored STATE_N sequence (Rule 25d).
    const idToIndex = new Map(states.map((s, i) => [s.id, i] as const));
    const fromFlow = (defaultFlow ?? [])
        .map((sid) => idToIndex.get(sid))
        .filter((n): n is number => typeof n === 'number');
    const canonicalOrder =
        fromFlow.length === states.length ? fromFlow : states.map((_, i) => i);
    const orderJson = embedJson(canonicalOrder);
    return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(conceptName)} — PhysicsMind review</title>
<style>
  :root { --bg:#0A0A1A; --panel:#13132b; --ink:#E5E7EB; --muted:#9aa0b4; --amber:#FCD34D; --green:#66BB6A; --red:#EF5350; }
  * { box-sizing: border-box; }
  html, body { margin:0; padding:0; height:100%; background:var(--bg); color:var(--ink);
               font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
  #app { display:flex; flex-direction:row; height:100vh; }
  /* ── vertical state rail (replaces next/prev — Rule 25d) ── */
  #rail { flex:0 0 216px; width:216px; display:flex; flex-direction:column;
          border-right:1px solid #23233f; background:var(--panel); min-height:0; }
  #railhead { padding:10px 12px 8px; border-bottom:1px solid #23233f; }
  #railhead .rt { font-size:12px; font-weight:700; color:var(--amber); letter-spacing:0.03em; }
  #railhead .rh { font-size:11px; color:var(--muted); margin-top:3px; line-height:1.35; }
  #railhead .rbtns { margin-top:8px; }
  button.mini { font-size:11px; padding:5px 9px; }
  #cards { flex:1 1 auto; overflow-y:auto; padding:8px; }
  .card { display:flex; align-items:flex-start; gap:8px; padding:9px 10px; margin-bottom:6px;
          background:#1b1b38; border:1px solid #2a2a4a; border-radius:8px; cursor:pointer; }
  .card:hover { border-color:#3d3d63; }
  .card.active { border-color:var(--amber); background:#26264a; }
  .card.dragging { opacity:0.45; }
  .card.dragover { border-color:var(--green); }
  .card .num { flex:0 0 20px; height:20px; border-radius:50%; background:#34345c; color:#cfd2e6;
               font-size:11px; font-weight:700; display:flex; align-items:center; justify-content:center; }
  .card.active .num { background:var(--amber); color:#0A0A1A; }
  .card .ttl { font-size:12px; line-height:1.3; color:var(--ink); }
  .card .grip { margin-left:auto; color:#54547a; font-size:12px; cursor:grab; }
  #main { flex:1 1 auto; display:flex; flex-direction:column; min-width:0; min-height:0; }
  header { padding:8px 14px; border-bottom:1px solid #23233f; }
  header h1 { font-size:15px; margin:0; color:var(--amber); font-weight:700; }
  header .hint { font-size:12px; color:var(--muted); margin-top:2px; }
  #stage { position:relative; flex:1 1 auto; min-height:0; background:#000; }
  #sim { width:100%; height:100%; border:0; display:block; }
  #caption { position:absolute; left:50%; bottom:12px; transform:translateX(-50%);
             background:rgba(0,0,0,0.78); color:var(--ink); padding:8px 16px;
             border-radius:8px; font-size:15px; line-height:1.4; max-width:86%;
             text-align:center; pointer-events:none; min-height:1.2em; }
  #paused { position:absolute; bottom:14px; left:50%; transform:translateX(-50%);
            display:none; background:rgba(239,83,80,0.94); color:#fff;
            padding:7px 18px; border-radius:20px; font-size:14px; font-weight:700;
            z-index:6; pointer-events:none; box-shadow:0 2px 12px rgba(0,0,0,0.45); }
  #tapcue { position:absolute; top:14px; left:50%; transform:translateX(-50%);
            display:none; opacity:0; transition:opacity 0.6s ease;
            background:rgba(0,0,0,0.72); color:#FFD54F; padding:6px 16px;
            border-radius:18px; font-size:13px; font-weight:600; z-index:7;
            pointer-events:none; box-shadow:0 2px 10px rgba(0,0,0,0.4); }
  #scrubbar { flex:0 0 auto; display:flex; align-items:center; gap:10px; padding:6px 14px;
              border-top:1px solid #23233f; background:#0d0d22; }
  #scrub { flex:1 1 auto; width:auto; }
  #scrubtime { font-size:11px; color:var(--muted); font-variant-numeric:tabular-nums;
               min-width:74px; text-align:right; }
  footer { flex:0 0 auto; padding:8px 14px; border-top:1px solid #23233f; background:var(--panel); }
  #statelabel { font-size:13px; font-weight:600; color:var(--amber); margin-bottom:8px;
                white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .controls { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
  button { font:inherit; font-size:13px; font-weight:700; border:0; border-radius:8px;
           padding:8px 14px; cursor:pointer; background:#3b3b5c; color:#E5E7EB; }
  button.primary { background:var(--green); color:#0A0A1A; }
  button.primary.playing { background:var(--red); }
  button.on { background:var(--green); color:#0A0A1A; }
  button:disabled { opacity:0.4; cursor:default; }
  .spacer { flex:1 1 auto; }
  label.ctl { font-size:12px; color:var(--muted); display:inline-flex; align-items:center; gap:6px; }
  input[type=range] { width:120px; vertical-align:middle; }
</style>
</head>
<body>
<div id="app">
  <aside id="rail">
    <div id="railhead">
      <div class="rt">STATES</div>
      <div class="rh">Open any state, in any order. Drag to reorder for your own teaching flow.</div>
      <div class="rbtns"><button id="defaultOrderBtn" class="mini">&#8635; Default order</button></div>
    </div>
    <div id="cards"></div>
  </aside>
  <div id="main">
    <header>
      <h1>${escapeHtml(conceptName)}</h1>
      <div class="hint">Open any state from the rail. <b>Tap the sim to pause</b> (tap again to resume) · drag to rotate · scroll to zoom. Narration is OFF by default — unmute to hear the script.</div>
    </header>
    <div id="stage">
      <iframe id="sim" src="sim.html" title="sim" allow="autoplay"></iframe>
      <div id="paused">&#9208; Paused — tap to resume</div>
      <div id="tapcue">&#9208; Tap the sim anytime to pause</div>
      <div id="caption"></div>
    </div>
    <div id="scrubbar">
      <input id="scrub" type="range" min="0" max="1000" step="10" value="0">
      <span id="scrubtime">0.0 / 0.0s</span>
    </div>
    <footer>
      <div id="statelabel">Loading…</div>
      <div class="controls">
        <button id="playBtn" class="primary">&#9654; Play state</button>
        <button id="replayBtn">&#128257; Replay</button>
        <button id="muteBtn">&#128263; Muted</button>
        <div class="spacer"></div>
        <label class="ctl">Speed <input id="rate" type="range" min="0.7" max="1.1" step="0.05" value="0.9"></label>
        <label class="ctl"><input id="auto" type="checkbox"> Auto-advance</label>
        <span id="counter" class="ctl"></span>
      </div>
    </footer>
  </div>
</div>
<script>
  var STATES = ${statesJson};
  var CONCEPT = ${nameJson};

  var STATE_COUNT = STATES.length;
  var CONCEPT_ID = ${idJson};
  var DEFAULT_ORDER = ${orderJson};

  var iframe = document.getElementById('sim');
  var statelabel = document.getElementById('statelabel');
  var caption = document.getElementById('caption');
  var playBtn = document.getElementById('playBtn');
  var replayBtn = document.getElementById('replayBtn');
  var muteBtn = document.getElementById('muteBtn');
  var defaultOrderBtn = document.getElementById('defaultOrderBtn');
  var cardsEl = document.getElementById('cards');
  var rateEl = document.getElementById('rate');
  var autoEl = document.getElementById('auto');
  var counter = document.getElementById('counter');
  var pausedBadge = document.getElementById('paused');
  var tapCue = document.getElementById('tapcue');
  var scrubEl = document.getElementById('scrub');
  var scrubTime = document.getElementById('scrubtime');
  var tapCueDone = false;
  var tapCueTimer = null;

  // ── Navigation order (Rule 25d: reorderable, persisted locally) ──
  var LS_ORDER = 'pm_order_' + CONCEPT_ID;
  var LS_MUTE = 'pm_mute_' + CONCEPT_ID;
  function validOrder(a) {
    if (!a || a.length !== STATE_COUNT) return false;
    var seen = {};
    for (var i = 0; i < a.length; i++) {
      var v = a[i];
      if (typeof v !== 'number' || v < 0 || v >= STATE_COUNT || seen[v]) return false;
      seen[v] = 1;
    }
    return true;
  }
  function loadOrder() {
    try { var raw = localStorage.getItem(LS_ORDER); if (raw) { var a = JSON.parse(raw); if (validOrder(a)) return a; } } catch (e) {}
    return DEFAULT_ORDER.slice();
  }
  function persistOrder() { try { localStorage.setItem(LS_ORDER, JSON.stringify(order)); } catch (e) {} }
  var order = loadOrder();
  var idx = 0;                       // position within the order array
  function cur() { return STATES[order[idx]]; }

  var muted = (function () { try { var m = localStorage.getItem(LS_MUTE); return m === null ? true : m === '1'; } catch (e) { return true; } })();
  function applyMuteUI() {
    if (muted) { muteBtn.innerHTML = '&#128263; Muted'; muteBtn.classList.remove('on'); }
    else { muteBtn.innerHTML = '&#128266; Narration on'; muteBtn.classList.add('on'); }
  }

  var frozen = false;
  var simReady = false;
  var playing = false;
  var cancelled = false;
  var voice = null;
  var pendingSpeak = null;   // state id we asked to render and want to narrate on STATE_REACHED
  var speakingSi = 0;        // sentence index currently being spoken
  var resumeSi = -1;         // saved on freeze → resume-where-left-off (Rule 26b)
  var wasPlaying = false;
  var scrubbing = false;
  var dragFrom = -1;

  // Warm the voice list (populates asynchronously on first call in Chrome).
  try { window.speechSynthesis.getVoices(); } catch (e) {}

  function pickVoice() {
    var voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;
    // Prefer ON-DEVICE (local) voices — Chrome's Web Speech produces no audio
    // for Microsoft "Online (Natural)" remote voices.
    var local = voices.filter(function (v) { return v.localService; });
    var pool = local.length > 0 ? local : voices;
    function find(pred) { for (var i = 0; i < pool.length; i++) { if (pred(pool[i])) return pool[i]; } return null; }
    return find(function (v) { return v.lang === 'en-IN'; })
        || find(function (v) { return v.lang === 'en-US'; })
        || find(function (v) { return v.lang && v.lang.indexOf('en') === 0; })
        || pool[0];
  }

  function post(msg) { if (iframe.contentWindow) iframe.contentWindow.postMessage(msg, '*'); }
  function sendState(id) { post({ type: 'SET_STATE', state: id }); }
  function sendGlow(t) { post({ type: 'SET_GLOW', target: (t == null ? null : t) }); }
  function sendMath(e, p) { post({ type: 'SET_MATH', expression: (e == null ? null : e), persist: p === true }); }
  function sendHand(p) { post({ type: 'SET_HAND_PHASE', phase: (p == null ? null : p) }); }
  function sendFreeze(f) { post({ type: 'SET_FREEZE_PROTON', frozen: f === true }); }
  function sendReset() { post({ type: 'RESET_TRAJECTORY' }); }
  function sendReplay() { post({ type: 'REPLAY_ANIMATIONS' }); }
  function clearSync() { sendGlow(null); sendHand(null); sendFreeze(false); }

  // ── Freeze-frame (teacher pause) ──────────────────────────────────────────
  // Tap the sim / spacebar / footer Pause pins the CURRENT frame so a teacher
  // can explain over a still picture (and still drag-rotate it). SET_STATE
  // auto-releases the pin in the renderer, so changing state clears it.
  function readSimTimeMs() { try { return iframe.contentWindow.PM_simTimeMs || 0; } catch (e) { return 0; } }
  function freeze() {
    if (frozen) return;
    frozen = true;
    retireTapCue();                     // they discovered pause — stop hinting
    post({ type: 'SET_TIME_FREEZE', at_ms: readSimTimeMs() });
    resumeSi = speakingSi;              // remember where narration was (Rule 26b)
    wasPlaying = playing;
    cancelled = true;
    window.speechSynthesis.cancel();
    setPlayingUI(false);
    pausedBadge.style.display = 'block';
  }
  function unfreeze() {
    if (!frozen) return;
    frozen = false;
    post({ type: 'SET_TIME_FREEZE', frozen: false });
    pausedBadge.style.display = 'none';
    if (wasPlaying && !muted && resumeSi >= 0) {   // resume narration where it left off
      cancelled = false;
      setPlayingUI(true);
      speakFrom(resumeSi);
    }
    wasPlaying = false; resumeSi = -1;
  }
  function toggleFreeze() { if (frozen) unfreeze(); else freeze(); }

  // First-watch discoverability cue: reviewers/students often don't realise the
  // sim can be paused by tapping it (reviewer Asmi, 2026-06-16 — "I thought I
  // couldn't pause"). Flash a gentle hint over the canvas the first time
  // narration plays, fade it after a few seconds, and retire it for good once
  // they actually pause.
  function showTapCue() {
    if (tapCueDone || !tapCue) return;
    tapCue.style.display = 'block';
    void tapCue.offsetWidth;            // force reflow so the fade-in runs
    tapCue.style.opacity = '1';
    if (tapCueTimer) clearTimeout(tapCueTimer);
    tapCueTimer = setTimeout(function () {
      tapCue.style.opacity = '0';
      setTimeout(function () { if (!tapCueDone) tapCue.style.display = 'none'; }, 600);
    }, 5000);
  }
  function retireTapCue() {
    tapCueDone = true;
    if (tapCueTimer) { clearTimeout(tapCueTimer); tapCueTimer = null; }
    if (tapCue) { tapCue.style.opacity = '0'; tapCue.style.display = 'none'; }
  }

  function setPlayingUI(on) {
    playing = on;
    if (on) { playBtn.innerHTML = '&#9209; Pause'; playBtn.classList.add('playing'); }
    else { playBtn.innerHTML = '&#9654; Play state'; playBtn.classList.remove('playing'); }
  }

  // ── Rail (clickable + drag-reorderable state cards) ──
  function buildRail() {
    cardsEl.innerHTML = '';
    for (var p = 0; p < order.length; p++) {
      (function (pos) {
        var s = STATES[order[pos]];
        var card = document.createElement('div');
        card.className = 'card' + (pos === idx ? ' active' : '');
        card.setAttribute('draggable', 'true');
        var num = document.createElement('span'); num.className = 'num'; num.textContent = String(pos + 1);
        var ttl = document.createElement('span'); ttl.className = 'ttl'; ttl.textContent = s.title;
        var grip = document.createElement('span'); grip.className = 'grip'; grip.innerHTML = '&#8942;';
        card.appendChild(num); card.appendChild(ttl); card.appendChild(grip);
        card.addEventListener('click', function () { pause(); goToState(pos, !muted); });
        card.addEventListener('dragstart', function (e) { dragFrom = pos; card.classList.add('dragging'); try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(pos)); } catch (_) {} });
        card.addEventListener('dragend', function () { card.classList.remove('dragging'); clearDragOver(); dragFrom = -1; });
        card.addEventListener('dragover', function (e) { e.preventDefault(); card.classList.add('dragover'); });
        card.addEventListener('dragleave', function () { card.classList.remove('dragover'); });
        card.addEventListener('drop', function (e) { e.preventDefault(); card.classList.remove('dragover'); reorder(dragFrom, pos); });
        cardsEl.appendChild(card);
      })(p);
    }
  }
  function clearDragOver() { var c = cardsEl.querySelectorAll('.card.dragover'); for (var i = 0; i < c.length; i++) c[i].classList.remove('dragover'); }
  function reorder(from, to) {
    if (from < 0 || from === to) return;
    var keep = order[idx];
    var moved = order.splice(from, 1)[0];
    order.splice(to, 0, moved);
    idx = order.indexOf(keep);          // keep viewing the same state after reorder
    persistOrder();
    buildRail();
    updateBadge();
  }
  function resetOrder() {
    var keep = order[idx];
    order = DEFAULT_ORDER.slice();
    idx = order.indexOf(keep); if (idx < 0) idx = 0;
    persistOrder();
    buildRail();
    updateBadge();
  }

  function updateBadge() {
    var st = cur();
    statelabel.textContent = 'STATE ' + (idx + 1) + ' / ' + order.length + '  —  ' + st.title;
    counter.textContent = (idx + 1) + ' / ' + order.length;
    var cards = cardsEl.querySelectorAll('.card');
    for (var i = 0; i < cards.length; i++) cards[i].classList.toggle('active', i === idx);
    scrubEl.max = String(Math.max(1, Math.round((st.duration || 12) * 1000)));
  }

  // Move to the given order-position. If speak (and not muted), narrate after STATE_REACHED.
  function goToState(pos, speak) {
    idx = Math.max(0, Math.min(order.length - 1, pos));
    cancelled = false;
    if (frozen) { frozen = false; pausedBadge.style.display = 'none'; }  // SET_STATE releases the pin
    window.speechSynthesis.cancel();
    caption.textContent = '';
    clearSync();
    sendMath(null, false);
    scrubEl.value = '0';
    updateBadge();
    speak = speak && !muted;
    pendingSpeak = speak ? cur().id : null;
    sendState(cur().id);
    if (speak) {
      var want = cur().id;
      setTimeout(function () {
        if (pendingSpeak === want) { pendingSpeak = null; beginStateNarration(); }
      }, 400);
    }
  }

  function beginStateNarration() {
    if (muted) return;                  // muted-by-default: animation plays, audio is opt-in
    if (!voice) voice = pickVoice();
    sendReset();
    sendReplay();
    setPlayingUI(true);
    speakFrom(0);
  }

  function speakFrom(si) {
    if (cancelled) return;
    var st = cur();
    speakingSi = si;
    if (si >= st.sentences.length) {
      // Finished this state's narration.
      clearSync();
      setPlayingUI(false);
      caption.textContent = '';
      if (autoEl.checked && !muted && idx < order.length - 1) {
        goToState(idx + 1, true);
      }
      return;
    }
    var s = st.sentences[si];
    var u = new SpeechSynthesisUtterance(s.text);
    u.rate = parseFloat(rateEl.value) || 0.9;
    u.pitch = 1.0;
    if (voice) { u.voice = voice; u.lang = voice.lang; } else { u.lang = 'en-US'; }
    sendGlow(s.glow);
    sendHand(s.hand_phase);
    sendFreeze(s.freeze_proton);
    if (s.math_show) { sendMath(s.math_show, s.math_persist); }
    else if (!s.math_persist) { sendMath(null, false); }
    caption.textContent = s.text;
    u.onend = function () { sendGlow(null); sendHand(null); sendFreeze(false); speakFrom(si + 1); };
    u.onerror = function () { sendGlow(null); sendHand(null); sendFreeze(false); speakFrom(si + 1); };
    window.speechSynthesis.speak(u);
  }

  function play() {
    // The click is the Web-Speech gesture-unlock. Explicit Play narrates the
    // CURRENT state even when muted-by-default (a deliberate "hear the script").
    if (frozen) { frozen = false; post({ type: 'SET_TIME_FREEZE', frozen: false }); pausedBadge.style.display = 'none'; }
    if (!voice) voice = pickVoice();
    cancelled = false;
    wasPlaying = false; resumeSi = -1;
    sendReset();
    sendReplay();
    setPlayingUI(true);
    speakFrom(0);
    showTapCue();
  }
  function pause() {
    cancelled = true;
    window.speechSynthesis.cancel();
    setPlayingUI(false);
    clearSync();
  }

  playBtn.addEventListener('click', function () { if (playing) freeze(); else play(); });
  replayBtn.addEventListener('click', function () { pause(); goToState(idx, !muted); });
  defaultOrderBtn.addEventListener('click', resetOrder);
  muteBtn.addEventListener('click', function () {
    muted = !muted;
    try { localStorage.setItem(LS_MUTE, muted ? '1' : '0'); } catch (e) {}
    if (muted) pause();
    applyMuteUI();
  });

  // ── Scrubber: drag to jump within the current state's timeline ──
  scrubEl.addEventListener('input', function () {
    scrubbing = true;
    var ms = parseInt(scrubEl.value, 10) || 0;
    cancelled = true; window.speechSynthesis.cancel(); setPlayingUI(false);
    frozen = true; wasPlaying = false; resumeSi = -1; pausedBadge.style.display = 'block';
    post({ type: 'SET_TIME_JUMP', at_ms: ms });   // instant jump + hold (both directions)
    updateScrubLabel(ms);
  });
  scrubEl.addEventListener('change', function () { scrubbing = false; });
  function updateScrubLabel(ms) {
    var mx = parseInt(scrubEl.max, 10) || 1000;
    scrubTime.textContent = (ms / 1000).toFixed(1) + ' / ' + (mx / 1000).toFixed(1) + 's';
  }
  setInterval(function () {
    if (!simReady || scrubbing || frozen) return;
    var ms = readSimTimeMs();
    scrubEl.value = String(ms);
    updateScrubLabel(parseInt(scrubEl.value, 10) || 0);
  }, 140);

  window.addEventListener('message', function (e) {
    var t = e.data && e.data.type;
    if (t === 'SIM_READY') {
      simReady = true;
      buildRail();
      applyMuteUI();
      goToState(0, false);   // show first state silently (narration off by default)
    } else if (t === 'STATE_REACHED') {
      if (pendingSpeak && e.data.state === pendingSpeak) {
        pendingSpeak = null;
        beginStateNarration();
      }
    } else if (t === 'CANVAS_TAP') {
      toggleFreeze();
    }
  });

  // Spacebar toggles freeze; arrow keys step the (possibly reordered) sequence.
  window.addEventListener('keydown', function (e) {
    if (e.code === 'Space' || e.key === ' ') { e.preventDefault(); toggleFreeze(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); if (idx < order.length - 1) { pause(); goToState(idx + 1, !muted); } }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); if (idx > 0) { pause(); goToState(idx - 1, !muted); } }
  });

  // Initial paint (rail + mute) in case SIM_READY already fired before this ran.
  buildRail();
  applyMuteUI();
  if (iframe.contentWindow) { post({ type: 'PING' }); }
</script>
</body></html>
`;
}

// ── Catalog page ─────────────────────────────────────────────────────────────

function rebuildCatalog(): void {
    type Entry = { id: string; name: string };
    const entries: Entry[] = [];
    if (existsSync(OUT_DIR)) {
        for (const dirent of readdirSync(OUT_DIR, { withFileTypes: true })) {
            if (!dirent.isDirectory()) continue;
            const metaPath = join(OUT_DIR, dirent.name, 'meta.json');
            if (!existsSync(metaPath)) continue;
            try {
                const meta = JSON.parse(readFileSync(metaPath, 'utf-8')) as { concept_id?: string; concept_name?: string };
                entries.push({ id: dirent.name, name: meta.concept_name ?? dirent.name });
            } catch {
                entries.push({ id: dirent.name, name: dirent.name });
            }
        }
    }
    entries.sort((a, b) => a.name.localeCompare(b.name));
    const cards = entries
        .map(
            (e) =>
                `    <a class="card" href="./${encodeURIComponent(e.id)}/"><span class="t">${escapeHtml(
                    e.name,
                )}</span><span class="id">${escapeHtml(e.id)}</span></a>`,
        )
        .join('\n');
    const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PhysicsMind — simulations for review</title>
<style>
  html,body{margin:0;background:#0A0A1A;color:#E5E7EB;font-family:system-ui,Segoe UI,Roboto,sans-serif;}
  .wrap{max-width:760px;margin:0 auto;padding:28px 18px;}
  h1{font-size:20px;color:#FCD34D;margin:0 0 4px;}
  p.sub{color:#9aa0b4;font-size:13px;margin:0 0 22px;}
  .card{display:flex;flex-direction:column;gap:2px;padding:14px 16px;margin-bottom:10px;
        background:#13132b;border:1px solid #23233f;border-radius:10px;text-decoration:none;color:#E5E7EB;}
  .card:hover{border-color:#FCD34D;}
  .card .t{font-size:15px;font-weight:700;}
  .card .id{font-size:12px;color:#9aa0b4;font-family:ui-monospace,monospace;}
  .empty{color:#9aa0b4;font-size:14px;}
</style>
</head>
<body><div class="wrap">
  <h1>PhysicsMind — simulations for review</h1>
  <p class="sub">Open a simulation, watch it once start-to-finish, then review it state by state.</p>
${cards || '  <p class="empty">No simulations built yet.</p>'}
</div></body></html>
`;
    writeFileSync(join(OUT_DIR, 'index.html'), html, 'utf-8');
    console.log(`   catalog: review-site/index.html (${entries.length} sim${entries.length === 1 ? '' : 's'})`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

function main(): void {
    const conceptId = (process.argv[2] ?? '').trim();
    if (!conceptId) {
        console.error('Usage: npx tsx src/scripts/build_review_site.ts <concept_id>');
        process.exit(1);
    }

    const json = loadConcept(conceptId);
    if (!json.field_3d_config) {
        console.error(`✖ ${conceptId}: no field_3d_config block — only field_3d diamonds are supported.`);
        process.exit(1);
    }
    const conceptName = json.concept_name ?? conceptId;
    const states = extractStates(json);
    if (states.length === 0) {
        console.error(`✖ ${conceptId}: no epic_l_path states with narration found.`);
        process.exit(1);
    }
    const missing = states.filter((s) => s.sentences.length === 0).map((s) => s.id);
    if (missing.length > 0) {
        console.warn(`   ⚠ states with no narration (will show silently): ${missing.join(', ')}`);
    }

    const conceptDir = join(OUT_DIR, conceptId);
    mkdirSync(conceptDir, { recursive: true });

    // 1) the self-contained scene
    const simHtml = assembleField3DHtml(json.field_3d_config);
    writeFileSync(join(conceptDir, 'sim.html'), simHtml, 'utf-8');

    // 2) the player page
    writeFileSync(
        join(conceptDir, 'index.html'),
        renderConceptPage(conceptName, conceptId, states, json.default_flow),
        'utf-8',
    );

    // 3) meta for the catalog
    writeFileSync(
        join(conceptDir, 'meta.json'),
        JSON.stringify({ concept_id: conceptId, concept_name: conceptName }, null, 2),
        'utf-8',
    );

    console.log(`\n✅ Built review page for ${conceptId} (${states.length} states)`);
    console.log(`   review-site/${conceptId}/index.html  + sim.html`);

    // 4) refresh the catalog
    rebuildCatalog();

    console.log(`\nNext: drag the ./review-site folder to https://app.netlify.com/drop`);
    console.log(`then send the reviewer the link …/${conceptId}/\n`);
}

main();
