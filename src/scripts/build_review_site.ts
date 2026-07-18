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
 *                   state badge + pace controls). Narration is PRE-GENERATED
 *                   Sarvam audio clips (EN/HI/TE) played from ./audio/ via a
 *                   single <audio> element, sequenced on the state clock (no
 *                   browser speechSynthesis); per-sentence glow/math/hand/freeze
 *                   are postMessaged to the iframe. Run `npm run tts:generate
 *                   <id>` first to produce the clips + audio_manifest.json.
 *   - meta.json     {concept_id, concept_name} for the catalog.
 * and (re)writes ./review-site/index.html — the catalog of all built sims.
 *
 * Rule 18-safe: deterministic assembly from the concept JSON, no LLM call.
 *
 * Usage:
 *   npx tsx src/scripts/build_review_site.ts <concept_id>
 *   (no env needed — nothing talks to Supabase)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, copyFileSync, cpSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import { assembleField3DHtml, type Field3DConfig } from '@/lib/renderers/field_3d_renderer';
import {
    assembleParticleFieldHtml,
    type ParticleFieldAuthoredConfig,
} from '@/lib/renderers/particle_field_renderer';
import {
    pilotHeadTags,
    isPilotConcept,
    listPilotConceptIds,
    chapterTitle,
    writeRootAssets,
    CLASS12_CHAPTER_NAMES,
} from './pilot_site_assets';

// ── Types (subset of the concept JSON we read) ───────────────────────────────

type TtsSentenceJson = {
    id?: string;
    text_en?: string;
    text_hi?: string;
    text_te?: string;
    glow?: string | string[] | null;
    math_show?: string | null;
    math_persist?: boolean;
    hand_phase?: 'v' | 'b' | 'f' | null;
    freeze_proton?: boolean;
    // Binds a scenario one-shot (e.g. 'current_flip' | 'glyph_toggle' |
    // 'velocity_compass' | 'split_switch' | 'camera_orbit' | 'f_appear') to this
    // sentence: the player posts SET_CUE_TIME with this sentence's start so the
    // renderer fires the event on the narrated beat instead of a hardcoded *_at_ms.
    scenario_cue?: string | null;
};

type ConceptJson = {
    concept_id?: string;
    concept_name?: string;
    chapter?: number;
    section?: string;
    class_level?: number;
    default_flow?: string[];
    field_3d_config?: Field3DConfig;
    particle_field_config?: ParticleFieldAuthoredConfig;
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

type AudioMeta = { available: boolean; duration_ms: number; file: string };

type ReviewSentence = {
    id: string;
    text_en: string;
    text_hi: string;
    text_te: string;
    audio: { en: AudioMeta; hi: AudioMeta; te: AudioMeta };
    glow: string | string[] | null;
    math_show: string | null;
    math_persist: boolean;
    hand_phase: 'v' | 'b' | 'f' | null;
    freeze_proton: boolean;
    scenario_cue: string | null;
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
const REVIEW_STATUS_PATH = join(ROOT, 'src', 'data', 'review_status.json');

// ── Vendored libraries (classroom reliability, 2026-07-11) ───────────────────
// The renderer templates emit absolute CDN URLs — THE EYE (page.route intercepts
// only the two panel paths) and the admin srcDoc pages rely on them, so the
// templates stay untouched. But a school's flaky/filtered wifi must never blank
// a live class: the static review/pilot site rewrites the tags to a shared
// ../vendor/ copy at build time and ships the files alongside the sims.
// Versions: three r128 (=0.128.0, the last UMD build with a global THREE) and
// p5 1.9.4 pinned exactly to the CDN tags; KaTeX vendors the installed 0.16.33
// (CDN tag says 0.16.9 — same 0.16.x line, conscious upgrade). KaTeX's CSS
// references fonts/ relative to itself, so vendor/fonts/ ships with it.
const VENDOR_SWAPS: Array<[cdn: string, local: string]> = [
    ['https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css', '../vendor/katex.min.css'],
    ['https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js', '../vendor/katex.min.js'],
    ['https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', '../vendor/three.min.js'],
    ['https://cdn.jsdelivr.net/npm/p5@1.9.4/lib/p5.min.js', '../vendor/p5.min.js'],
];

function vendorizeSimHtml(html: string): string {
    let out = html;
    for (const [cdn, local] of VENDOR_SWAPS) out = out.split(cdn).join(local);
    // Drop crossorigin="anonymous" from the now-local tags: it's meaningless
    // same-origin over HTTP, and under file:// (origin 'null') it forces a
    // CORS check that ALWAYS fails — blank canvas on a locally-opened export.
    out = out.replace(/(<(?:link|script)[^>]*\.\.\/vendor\/[^>]*?) crossorigin="anonymous"/g, '$1');
    return out;
}

function writeVendorAssets(): void {
    const vendorDir = join(OUT_DIR, 'vendor');
    mkdirSync(vendorDir, { recursive: true });
    const nm = join(ROOT, 'node_modules');
    copyFileSync(join(nm, 'three', 'build', 'three.min.js'), join(vendorDir, 'three.min.js'));
    copyFileSync(join(nm, 'katex', 'dist', 'katex.min.js'), join(vendorDir, 'katex.min.js'));
    copyFileSync(join(nm, 'katex', 'dist', 'katex.min.css'), join(vendorDir, 'katex.min.css'));
    cpSync(join(nm, 'katex', 'dist', 'fonts'), join(vendorDir, 'fonts'), { recursive: true });
    copyFileSync(join(nm, 'p5', 'lib', 'p5.min.js'), join(vendorDir, 'p5.min.js'));
    // driver.js (v1.3.1, MIT) powers the first-login onboarding tour. Checked into
    // the repo (assets/vendor/driver/), not node_modules, so it self-hosts without
    // adding an npm dependency — same wifi-safe reasoning as three/katex/p5.
    const driverSrc = join(ROOT, 'assets', 'vendor', 'driver');
    copyFileSync(join(driverSrc, 'driver.js.iife.js'), join(vendorDir, 'driver.js.iife.js'));
    copyFileSync(join(driverSrc, 'driver.css'), join(vendorDir, 'driver.css'));
    // supabase-js (2.45.4 UMD, checked into assets/vendor/supabase/) gates every
    // pilot page at login — a jsdelivr outage must not lock teachers out mid-class.
    copyFileSync(join(ROOT, 'assets', 'vendor', 'supabase', 'supabase.min.js'),
        join(vendorDir, 'supabase.min.js'));
    // The tour's per-step narration clips (assets/onboarding-audio/, rendered once by
    // build_onboarding_audio.ts) are copied into review-site/onboarding/ every build so
    // they survive a rebuild + deploy without re-hitting Sarvam. Tour is silent-tolerant
    // if the folder is absent.
    const audioSrc = join(ROOT, 'assets', 'onboarding-audio');
    if (existsSync(audioSrc)) {
        cpSync(audioSrc, join(OUT_DIR, 'onboarding'), { recursive: true });
    }
    // Brand wordmark font for the intro sting (the intro itself is an inline SVG +
    // Web-Audio animation in the catalog page — no video asset; see playIntro()).
    const brandFontSrc = join(ROOT, 'assets', 'brand', 'space-grotesk-latin.woff2');
    if (existsSync(brandFontSrc)) {
        copyFileSync(brandFontSrc, join(OUT_DIR, 'space-grotesk-latin.woff2'));
    }
    console.log('✅ Vendored three/katex(+fonts)/p5/driver/supabase (+ onboarding audio + brand font) → review-site/');
}

// ── Review-tracking manifest (who reviewed what, + her recorded videos) ───────
// Single source of truth the founder edits after each review; drives the catalog
// badges + video links. Missing/malformed file → every sim simply shows
// "Not yet reviewed" (the builder never fails on it).

type ReviewVideo = { label?: string; url?: string };
type ReviewStatusEntry = {
    reviewed?: boolean;
    reviewer?: string;
    reviewed_date?: string;
    videos?: ReviewVideo[];
};
type ReviewStatusMap = Record<string, ReviewStatusEntry>;

function loadReviewStatus(): ReviewStatusMap {
    if (!existsSync(REVIEW_STATUS_PATH)) return {};
    try {
        return JSON.parse(readFileSync(REVIEW_STATUS_PATH, 'utf-8')) as ReviewStatusMap;
    } catch {
        console.warn(`   ⚠ could not parse ${REVIEW_STATUS_PATH} — catalog will show all sims as unreviewed`);
        return {};
    }
}

// ── Stored-audio manifest (emitted by generate_tts_audio.ts) ─────────────────
// Maps "<sentenceId>_<lang>" → clip metadata. Missing/malformed → {} (the player
// falls back to silent narration; captions + clock still work).

type AudioClip = {
    id: string;
    lang: string;
    file: string;
    duration_ms: number;
    chars: number;
    available: boolean;
    /** sha1 of the text the clip was voiced from (newer manifests). */
    text_hash?: string;
};

function loadAudioManifest(conceptId: string): Record<string, AudioClip> {
    const p = join(OUT_DIR, conceptId, 'audio_manifest.json');
    if (!existsSync(p)) return {};
    try {
        const m = JSON.parse(readFileSync(p, 'utf-8')) as { clips?: Record<string, AudioClip> };
        return m.clips ?? {};
    } catch {
        console.warn(`   ⚠ could not parse ${p} — narration will be silent`);
        return {};
    }
}

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

// ── The brand-moment handshake (founder 2026-07-17) ───────────────────────────────────────────
// The Viditra sting + "{Name}'s Class" is an ARRIVAL moment: it belongs to a login / fresh open /
// explicit reload, and must NEVER replay when a teacher simply presses Back out of a sim — that
// reads as the app restarting mid-lesson.
//
// WHY NOT Navigation Timing: the obvious discriminator is nav type === 'back_forward'. Measured in
// Chrome (2026-07-17) it is NOT reliable here — a real Back out of a sim reports 'navigate' (and
// via CDP sometimes 'reload'), so the gate would never fire and the bug would survive. These two
// sessionStorage markers are a deterministic handshake between the two pages instead: no
// dependence on nav type, on bfcache, or on the browser at all. Both are read-once-then-cleared,
// and every access is try/catch'd — if storage throws, each page degrades toward the calmer screen
// (catalog keeps its brand moment; the sim curtain stays quiet), never toward a stuck curtain.
/** Stamped by a sim page on load; the catalog reads+clears it → "she came back, don't re-brand". */
const PM_FROM_SIM_KEY = 'pm_from_sim';
/** Stamped by the catalog's card click; the sim reads+clears it → "this is a real open, brand it". */
const PM_BRAND_OPEN_KEY = 'pm_brand_open';

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

function extractStates(
    json: ConceptJson,
    clips: Record<string, AudioClip>,
    staleClipIds?: string[],
): ReviewState[] {
    const states = json.epic_l_path?.states ?? {};
    // A clip is wired ONLY if it was voiced from the sentence text now in the
    // JSON (text_hash match; older manifests fall back to char-length equality).
    // A stale clip — sentence rewritten under the same id, e.g. the Ch.4
    // Socratic→straightforward retrofit — plays the OLD narration under the NEW
    // caption + choreography, which is strictly worse than silence. Mute it and
    // report it so `npm run tts:generate <id>` gets re-run.
    const audioFor = (sid: string, lang: 'en' | 'hi' | 'te', currentText: string): AudioMeta => {
        const c = clips[sid + '_' + lang];
        if (c?.available !== true) return { available: false, duration_ms: 0, file: '' };
        const fresh = c.text_hash != null
            ? c.text_hash === createHash('sha1').update(currentText, 'utf8').digest('hex')
            : c.chars === currentText.length;
        if (!fresh) {
            staleClipIds?.push(sid + '_' + lang);
            return { available: false, duration_ms: 0, file: '' };
        }
        return { available: true, duration_ms: c.duration_ms ?? 0, file: c.file ?? '' };
    };
    return Object.keys(states)
        .sort((a, b) => stateNumber(a) - stateNumber(b))
        .map((id) => {
            const st = states[id];
            const sentences: ReviewSentence[] = (st.teacher_script?.tts_sentences ?? [])
                .map((s) => {
                    const sid = s.id ?? '';
                    return {
                        id: sid,
                        text_en: s.text_en ?? '',
                        text_hi: s.text_hi ?? '',
                        text_te: s.text_te ?? '',
                        audio: {
                            en: audioFor(sid, 'en', (s.text_en ?? '').trim()),
                            hi: audioFor(sid, 'hi', (s.text_hi ?? '').trim()),
                            te: audioFor(sid, 'te', (s.text_te ?? '').trim()),
                        },
                        glow: s.glow ?? null,
                        math_show: s.math_show ?? null,
                        math_persist: s.math_persist === true,
                        hand_phase: s.hand_phase ?? null,
                        freeze_proton: s.freeze_proton === true,
                        scenario_cue: s.scenario_cue ?? null,
                    };
                })
                .filter((s) => s.text_en.length > 0);
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
    // Header status pill — reflects the review-tracking manifest (Teacher-Verified vs awaiting review).
    const review = loadReviewStatus()[conceptId];
    const statusPill =
        review?.reviewed === true
            ? `<div class="verified"><svg viewBox="0 0 24 24" fill="none"><path d="M12 2.5l2.2 1.6 2.7-.2.9 2.6 2.2 1.6-.9 2.6.9 2.6-2.2 1.6-.9 2.6-2.7-.2L12 21.5l-2.2-1.6-2.7.2-.9-2.6L4 15.9l.9-2.6L4 10.7l2.2-1.6.9-2.6 2.7.2z" fill="rgba(203,104,67,.2)" stroke="rgba(203,104,67,.6)" stroke-width="1.1"/><path d="M8.6 12l2.1 2.1 4.6-4.6" stroke="#E3A07F" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg> Teacher-Verified${review?.reviewer ? ' &middot; ' + escapeHtml(review.reviewer) : ''}</div>`
            : '';   // professor-facing: an internal "awaiting review" pill would read as "unfinished"
    return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(conceptName)} — Viditra</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
${pilotHeadTags(1)}
<style>
  :root{
    /* warm-dark surfaces (the student-product standard theme) */
    --bg:#1C1B19; --surface:#262523; --surface-2:#302E2B; --surface-3:#3A3835; --sim:#100E0B;
    /* terracotta accent (the standard) */
    --clay:#CB6843; --clay-deep:#B0552F; --clay-soft:#E3A07F; --clay-wash:rgba(203,104,67,.15);
    --sage:#74B594;                 /* calm status green / drop-target */
    /* ink + hairlines */
    --ink:#ECE9E2; --ink-dim:#A8A299; --ink-faint:#726C63;
    --line:rgba(245,240,230,.10); --line-2:rgba(245,240,230,.055);
    --red:#E06A52;                  /* warm-tuned pause/stop */
    --radius:14px;
    --font-disp:"Fraunces",Georgia,"Times New Roman",serif;
    --font-ui:"Inter",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
    --lift:0 1px 0 rgba(255,255,255,.03) inset, 0 12px 30px -18px rgba(0,0,0,.7);
    /* legacy aliases — repointed so existing var() references inherit the warm palette */
    --panel:var(--surface); --amber:var(--clay); --green:var(--clay); --muted:var(--ink-dim);
  }
  * { box-sizing: border-box; }
  html, body { margin:0; padding:0; height:100%; background:var(--bg); color:var(--ink);
               font-family: var(--font-ui); -webkit-font-smoothing:antialiased; }
  /* a barely-there warm glow so the dark page isn't flat (matches the student product) */
  body::before { content:""; position:fixed; inset:0; z-index:0; pointer-events:none;
    background:
      radial-gradient(46% 38% at 100% 0%, rgba(203,104,67,.07), transparent 60%),
      radial-gradient(40% 32% at 0% 100%, rgba(116,181,148,.04), transparent 60%); }
  #app { position:relative; z-index:1; display:flex; flex-direction:row; height:100vh; }
  /* ── vertical state rail (replaces next/prev — Rule 25d) ── */
  #rail { flex:0 0 200px; width:200px; display:flex; flex-direction:column;
          border-right:1px solid var(--line); background:var(--surface); min-height:0; }
  #railhead { padding:14px 14px 10px; border-bottom:1px solid var(--line); }
  #railhead .rt { font-size:10.5px; font-weight:600; color:var(--ink-faint);
                  letter-spacing:.18em; text-transform:uppercase; }
  #railhead .rbtns { margin-top:9px; display:flex; gap:6px; }
  button.mini { font-size:11px; padding:5px 9px; }
  button.mini.save { background:var(--clay); color:#fff; border-color:transparent; }
  button.mini.save:hover { background:var(--clay-deep); }
  button.mini.save.saved { background:var(--surface-2); color:var(--sage); border-color:rgba(116,181,148,.4); }
  button.mini.save.dirty::after { content:"\\2022"; margin-left:5px; color:#fff; }
  #cards { flex:0 1 auto; overflow-y:auto; padding:6px 6px; }
  /* Hidden (N) section — hidden states leave the main list and tuck here */
  #hiddenWrap { flex:0 0 auto; }
  .hidhead { display:flex; align-items:center; gap:7px; padding:8px 14px; cursor:pointer;
             font-size:11px; font-weight:600; letter-spacing:.04em; text-transform:uppercase;
             color:var(--ink-faint); border-top:1px solid var(--line); user-select:none; }
  .hidhead:hover { color:var(--clay-soft); background:var(--surface-2); }
  .hidrow { display:flex; align-items:center; gap:9px; padding:7px 12px 7px 14px; opacity:.55;
            border-bottom:1px solid var(--line-2); }
  .hidrow .ttl { flex:1 1 auto; min-width:0; font-size:12px; color:var(--ink-dim);
                 white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  /* per-row ⋮ menu popover */
  #rowMenu { position:fixed; z-index:50; display:none; min-width:120px; padding:5px;
             background:var(--surface-2); border:1px solid var(--line); border-radius:10px;
             box-shadow:0 12px 30px -10px rgba(0,0,0,.7); }
  #rowMenu.open { display:block; }
  #rowMenu button { display:block; width:100%; text-align:left; font-size:12px; font-weight:500;
             padding:7px 10px; border:0; border-radius:7px; background:none; color:var(--ink); cursor:pointer; }
  #rowMenu button:hover { background:var(--clay-wash); color:var(--clay-soft); }
  /* flat, minimal one-line rows (matches the student product's lesson list) */
  .card { position:relative; display:flex; align-items:center; gap:11px;
          padding:9px 12px 9px 14px; cursor:pointer;
          border-bottom:1px solid var(--line-2); transition:background .16s ease; }
  .card:last-child { border-bottom:0; }
  .card:hover { background:var(--surface-2); }
  .card:hover .grip { opacity:1; }
  .card.active { background:var(--clay-wash); border-bottom-color:transparent; }
  .card.active::before { content:""; position:absolute; left:0; top:7px; bottom:7px; width:3px;
                         border-radius:3px; background:var(--clay); }
  .card.dragging { opacity:0.45; }
  .card.dragover { box-shadow: inset 0 2px 0 var(--clay); }
  .card .num { flex:0 0 18px; font-family:var(--font-disp); font-weight:600;
               color:var(--ink-faint); font-size:14px; text-align:center; }
  .card.active .num { color:var(--clay-soft); }
  .card .ttl { flex:1 1 auto; min-width:0; font-size:12.5px; line-height:1.45; color:var(--ink-dim);
               white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .card.active .ttl { color:var(--ink); font-weight:500; }
  /* ⋮ menu button (per row: state actions Rename / Hide / Unhide) */
  .card .grip, .hidrow .grip { flex:none; margin-left:2px; border:0; background:none; color:var(--ink-faint);
                font-size:15px; line-height:1; cursor:pointer; padding:2px 5px; border-radius:6px;
                opacity:0; transition:opacity .16s ease; }
  .card:hover .grip, .card.active .grip, .hidrow .grip { opacity:1; }
  .card .grip:hover, .hidrow .grip:hover { color:var(--clay-soft); background:var(--clay-wash); }
  .card .ttl input, .hidrow .ttl input { width:100%; padding:2px 6px; border-radius:6px; border:1px solid rgba(203,104,67,.55);
               background:var(--surface-3); color:var(--ink); font-size:12.5px; font-family:var(--font-ui); outline:none; }
  #main { flex:1 1 auto; display:flex; flex-direction:column; min-width:0; min-height:0; }
  /* full-screen wraps THIS (not just #stage) so the caption strip + collapsible
     scrubber/footer panel + header stay reachable/consistent — header is the one
     thing deliberately left OUTSIDE #fsScope, so it never shows in full screen. */
  #fsScope { flex:1 1 auto; display:flex; flex-direction:column; min-width:0; min-height:0; }
  header { padding:5px 14px; border-bottom:1px solid var(--line); }
  .brandbar { display:flex; align-items:center; gap:11px; }
  .logo { display:flex; align-items:center; gap:9px; flex:none; }
  .mark { width:26px; height:26px; border-radius:8px; background:var(--clay); flex:none;
          display:grid; place-items:center; box-shadow:0 6px 18px -6px rgba(203,104,67,.55); }
  .mark svg { width:16px; height:16px; }
  .wordmark b { font-family:var(--font-disp); font-weight:600; font-size:13px; letter-spacing:-.01em;
                color:var(--ink); display:block; line-height:1; }
  .wordmark span { font-family:var(--font-ui); font-size:7.5px; letter-spacing:.2em;
                   text-transform:uppercase; color:var(--ink-faint); margin-top:3px; display:block; }
  .vrule { width:1px; height:20px; background:var(--line); flex:none; }
  header h1.concept { font-family:var(--font-disp); font-style:italic; font-size:13px; font-weight:500;
                      color:var(--ink); margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .hd-right { margin-left:auto; display:flex; align-items:center; gap:13px; flex:none; }
  .verified { display:flex; align-items:center; gap:7px; padding:6px 13px 6px 9px; border-radius:999px;
              font-size:10.5px; letter-spacing:.04em; font-weight:600; text-transform:uppercase; white-space:nowrap;
              color:var(--clay-soft); background:var(--clay-wash); border:1px solid rgba(203,104,67,.3); }
  .verified svg { width:14px; height:14px; }
  .verified.pending { color:var(--ink-dim); background:rgba(245,240,230,.04); border-color:var(--line); }
  .verified .dot { width:7px; height:7px; border-radius:50%; background:var(--sage);
                   box-shadow:0 0 8px rgba(116,181,148,.6); }
  #stage { position:relative; flex:1 1 auto; min-height:0; background:var(--sim); }
  /* ── brand surfaces: persistent watermark + load-masking card (Rule 34d: corner reserved, never collides) ── */
  #pmWm{position:absolute;left:12px;bottom:10px;z-index:6;pointer-events:none;
        font:500 10.5px var(--font-ui);letter-spacing:.05em;color:rgba(236,233,226,.32);}
  #pmWm b{font-weight:600;color:rgba(227,160,127,.55);}
  /* Full-viewport brand curtain: covers rail/header/footer too, so the whole teaching UI
     is revealed together by ONE smooth fade (blocks clicks while opaque; 99994 = above the
     feedback pill/overlay 99990-1, below the tour overlay 99999). */
  #pmLoad{position:fixed;inset:0;z-index:99994;display:grid;place-items:center;background:var(--bg);
        opacity:1;transition:opacity .8s ease;}
  #pmLoad.gone{opacity:0;pointer-events:none;}
  /* Reload / back into a sim is NOT a new arrival: the curtain still masks the booting scene, but
     shows nothing (no mark, no name) and lifts on SIM_READY with no brand hold — see pmBrandOpen. */
  #pmLoad.quiet .plc{display:none;}
  #pmLoad .plc{text-align:center;display:grid;place-items:center;gap:14px;}
  #pmLoad .mark{width:72px;height:72px;border-radius:20px;background:var(--clay);display:grid;place-items:center;
        box-shadow:0 12px 36px -8px rgba(203,104,67,.6);}
  #pmLoad .mark svg{width:42px;height:42px;}
  #pmLoad .nm{font-family:var(--font-disp);font-size:clamp(34px,5.5vw,52px);font-weight:600;color:var(--ink);line-height:1.05;}
  #pmLoad .pw{font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:var(--ink-faint);}
  #pmLoad .pw b{color:var(--clay-soft);font-weight:600;}
  #stage::after { content:""; position:absolute; inset:0; pointer-events:none; z-index:3; border-radius:0;
                  box-shadow: inset 0 0 0 1px var(--line), inset 0 0 70px rgba(0,0,0,.4); }
  #fsScope:fullscreen { background:var(--sim); }
  #fsScope:fullscreen #stage::after { box-shadow:none; }
  #sim { width:100%; height:100%; border:0; display:block; }
  /* fullscreen-the-sim + clean-mode buttons — top-right glass cluster, mirrors #simPenBar (top-left) */
  #fsTopControls { position:absolute; top:10px; right:10px; z-index:9; display:flex; align-items:center; gap:8px; }
  .fsGlassBtn { display:flex; align-items:center; gap:6px;
           background:rgba(16,14,11,0.82); backdrop-filter:blur(6px); padding:6px 11px; border-radius:10px;
           border:1px solid var(--line); box-shadow:0 2px 10px rgba(0,0,0,0.4);
           color:var(--ink-dim); font-size:12px; font-weight:600; cursor:pointer; user-select:none;
           transition:color .15s ease, border-color .15s ease, background .15s ease; }
  .fsGlassBtn:hover { color:var(--clay-soft); border-color:rgba(203,104,67,.4); }
  #fsCleanBtn.on { background:var(--clay-wash); color:var(--clay-soft); border-color:rgba(203,104,67,.4); }
  /* Next/Prev state chevrons + readout — full-screen only (§4, gated by #fsScope.pm-fs, not
     the :fullscreen pseudo-class, since these live inside #stage, a descendant of the
     fullscreen root, not the root itself). */
  .fsChevron, #fsCleanBtn, #fsStateReadout { display:none; }
  #fsScope.pm-fs .fsChevron { display:flex; }
  #fsScope.pm-fs #fsCleanBtn, #fsScope.pm-fs #fsStateReadout { display:flex; }
  .fsChevron { position:absolute; top:50%; transform:translateY(-50%); z-index:9;
               width:48px; height:48px; border-radius:50%; align-items:center; justify-content:center;
               font-size:24px; line-height:1; background:rgba(16,14,11,.82); backdrop-filter:blur(6px);
               border:1px solid var(--line); color:var(--ink-dim); cursor:pointer; padding:0;
               transition:opacity .3s ease, color .15s ease, border-color .15s ease; }
  .fsChevron:hover { color:var(--clay-soft); border-color:rgba(203,104,67,.4); }
  .fsChevron:disabled { opacity:.35; pointer-events:none; }
  .fsChevron-left { left:14px; }
  .fsChevron-right { right:14px; }
  #fsStateReadout { position:absolute; top:54px; left:50%; transform:translateX(-50%); z-index:9;
                     background:rgba(16,14,11,.82); backdrop-filter:blur(6px); border:1px solid var(--line);
                     border-radius:999px; padding:5px 14px; font-size:11.5px; font-weight:600;
                     color:var(--ink-dim); pointer-events:none; letter-spacing:.03em; }
  /* idle auto-fade (§6) — chrome dims after a few seconds of no pointer activity, restores on movement */
  .fsChevron, #fsBtn, #simPenBar { transition: opacity .3s ease, color .15s ease, border-color .15s ease, background .15s ease; }
  #fsScope.pm-idle .fsChevron, #fsScope.pm-idle #fsBtn, #fsScope.pm-idle #simPenBar { opacity:.28; }
  #fsScope.pm-idle .fsChevron:hover, #fsScope.pm-idle #fsBtn:hover, #fsScope.pm-idle #simPenBar:hover { opacity:1; }
  /* Subtitle strip BELOW the canvas (de-clutter 2026-07-10) — narration prose never
     covers the sim; the strip collapses when subtitles are toggled off. */
  #capStrip { flex:0 0 auto; background:var(--surface); border-top:1px solid var(--line);
              padding:7px 16px; text-align:center; }
  #capStrip.cc-off { display:none; }
  #caption { color:var(--ink); font-size:15px; line-height:1.4; min-height:1.35em;
             max-width:900px; margin:0 auto; text-align:center; pointer-events:none; }
  #caption.cc-off { display:none; }   /* subtitles toggled off (independent of mute) */
  /* clean mode (§5) — independent of .cc-off; hides the wrapper's prose subtitle strip.
     The on-canvas caption/formula/HUD/sliders inside the iframe are hidden separately
     via postMessage → body.pm-clean in field_3d_renderer.ts. */
  #capStrip.pm-clean-hide { display:none; }
  #paused { position:absolute; bottom:14px; left:50%; transform:translateX(-50%);
            display:none; background:var(--red); color:#fff;
            padding:7px 18px; border-radius:999px; font-size:14px; font-weight:600;
            z-index:6; pointer-events:none; box-shadow:0 8px 24px -8px rgba(0,0,0,0.6); }
  #tapcue { position:absolute; top:14px; left:50%; transform:translateX(-50%);
            display:none; opacity:0; transition:opacity 0.6s ease;
            background:rgba(16,14,11,0.8); backdrop-filter:blur(6px); color:var(--clay-soft);
            padding:6px 16px; border:1px solid var(--line);
            border-radius:999px; font-size:13px; font-weight:600; z-index:7;
            pointer-events:none; box-shadow:0 2px 10px rgba(0,0,0,0.4); }
  /* collapse handle for the whole bottom control band (scrubbar + footer) */
  #ctlToggle { flex:0 0 auto; display:flex; align-items:center; justify-content:center; height:15px;
               border-top:1px solid var(--line); background:var(--surface-2); color:var(--ink-faint);
               cursor:pointer; font-size:11px; line-height:1; user-select:none;
               transition:color .15s ease, background .15s ease; }
  #ctlToggle:hover { color:var(--clay-soft); background:var(--surface-3); }
  #scrubbar { flex:0 0 auto; display:flex; align-items:center; gap:12px; padding:4px 14px;
              border-top:1px solid var(--line); background:var(--surface); }
  #scrubbar.collapsed, footer.collapsed { display:none; }
  #scrub { flex:1 1 auto; width:auto; }
  #scrubtime { font-size:11px; color:var(--ink-dim); font-variant-numeric:tabular-nums;
               min-width:74px; text-align:right; }
  footer { flex:0 0 auto; padding:5px 14px 7px; border-top:1px solid var(--line); background:var(--surface); }
  #statelabel { font-family:var(--font-disp); font-size:11px; font-weight:600; color:var(--clay-soft);
                margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .controls { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  button { font:inherit; font-family:var(--font-ui); font-size:11.5px; font-weight:600;
           border:1px solid var(--line); border-radius:9px;
           padding:5px 10px; cursor:pointer; background:var(--surface-2); color:var(--ink);
           transition:background .15s ease, border-color .15s ease; }
  button:hover { background:var(--surface-3); }
  button.primary { background:var(--clay); color:#fff; border-color:transparent; box-shadow:var(--lift); }
  button.primary:hover { background:var(--clay-deep); }
  button.primary.playing { background:var(--red); }
  button.on { background:var(--clay-wash); color:var(--clay-soft); border-color:rgba(203,104,67,.4); }
  button:disabled { opacity:0.4; cursor:default; }
  .spacer { flex:1 1 auto; }
  label.ctl { font-size:11px; color:var(--ink-dim); display:inline-flex; align-items:center; gap:6px; }
  /* custom range (scrubber + speed) — warm track, clay thumb */
  input[type=range] { width:120px; vertical-align:middle; -webkit-appearance:none; appearance:none;
                      height:5px; border-radius:999px; background:var(--surface-3); cursor:pointer; }
  #scrub { height:8px; cursor:grab; }
  #scrub:active { cursor:grabbing; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:15px; height:15px;
                      border-radius:50%; background:var(--clay); border:2px solid var(--bg);
                      box-shadow:0 1px 4px rgba(0,0,0,.5); transition:width .1s ease, height .1s ease; }
  #scrub::-webkit-slider-thumb { width:17px; height:17px; }
  #scrub:hover::-webkit-slider-thumb, #scrub:active::-webkit-slider-thumb { width:19px; height:19px; }
  input[type=range]::-moz-range-thumb { width:14px; height:14px; border-radius:50%; background:var(--clay);
                      border:2px solid var(--bg); box-shadow:0 1px 4px rgba(0,0,0,.5); }
  #scrub::-moz-range-thumb { width:17px; height:17px; }
  input[type=range]::-moz-range-track { height:5px; border-radius:999px; background:var(--surface-3); }
  #scrub::-moz-range-track { height:8px; }

  /* ── Whiteboard + unified pen (teaching surface) ── */
  #rail { transition: flex-basis .14s ease, width .14s ease; }
  #rail.collapsed { flex:0 0 0 !important; width:0 !important; border-right:0; }
  #railToggle { flex:0 0 14px; width:14px; display:flex; align-items:center; justify-content:center;
                background:var(--surface); border-right:1px solid var(--line); color:var(--ink-dim);
                cursor:col-resize; font-size:13px; user-select:none; touch-action:none; }
  #railToggle:hover { color:var(--clay-soft); background:var(--surface-2); }
  #railToggle:active { background:rgba(203,104,67,.35); }
  #boardToggle { flex:0 0 14px; width:14px; display:flex; align-items:center; justify-content:center;
                 background:var(--surface); border-left:1px solid var(--line); color:var(--ink-dim);
                 cursor:pointer; font-size:13px; user-select:none; }
  #boardToggle:hover { color:var(--clay-soft); background:var(--surface-2); }
  #main.hidden { display:none; }
  /* wider invisible grab zone around the 6px visual bar → easier, smoother drag */
  #divider { position:relative; flex:0 0 6px; width:6px; cursor:col-resize; background:var(--line);
             align-self:stretch; touch-action:none; }
  #divider::before { content:""; position:absolute; top:0; bottom:0; left:-6px; right:-6px; }
  #divider:hover { background:rgba(203,104,67,.4); }
  #divider:active { background:rgba(203,104,67,.65); }
  #divider.hidden { display:none; }
  #boardCol { flex:0 0 480px; min-width:0; display:flex; flex-direction:column;
              background:var(--bg); border-left:1px solid var(--line); }
  #boardCol.hidden { display:none; }
  #boardToolbar { flex:0 0 auto; display:flex; align-items:center; gap:4px; flex-wrap:wrap;
                  padding:4px 7px; background:var(--surface); border-bottom:1px solid var(--line); }
  #boardToolbar .grp { display:inline-flex; align-items:center; gap:4px; padding-right:6px;
                       margin-right:2px; border-right:1px solid var(--line); }
  #boardToolbar .grp:last-child { border-right:0; }
  #boardScroll { flex:1 1 auto; position:relative; overflow-y:scroll; overflow-x:hidden;
                 overscroll-behavior:contain; background:#ffffff; }
  #boardScroll.dark { background:#16110C; }
  #wbCanvas { display:block; position:sticky; top:0; left:0; width:100%; height:100%;
              touch-action:pan-y; z-index:2; }
  #wbSpacer { width:1px; height:1px; pointer-events:none; }
  #simOverlay { position:absolute; inset:0; z-index:4; touch-action:none; }
  #simPenBar { position:absolute; top:10px; left:10px; z-index:9; display:flex; gap:6px;
               background:rgba(16,14,11,0.82); backdrop-filter:blur(6px); padding:5px 6px; border-radius:10px;
               border:1px solid var(--line); box-shadow:0 2px 10px rgba(0,0,0,0.4); }
  #simPenBar .seg { display:inline-flex; border:1px solid var(--line); border-radius:7px; overflow:hidden; }
  #simPenBar .seg .pmbtn { border-radius:0; border:0; }
  #stage.sim-draw #simOverlay { box-shadow: inset 0 0 0 2px rgba(203,104,67,0.55); cursor: crosshair; }
  #stage.sim-draw #paused { display:none !important; }
  .pmbtn { font:inherit; font-family:var(--font-ui); font-size:11px; font-weight:600;
           border:1px solid var(--line); border-radius:7px;
           padding:4px 7px; cursor:pointer; background:var(--surface-2); color:var(--ink); }
  .pmbtn:hover { background:var(--surface-3); }
  .pmbtn.on { background:var(--clay-wash); color:var(--clay-soft); border-color:rgba(203,104,67,.4); }
  .swatch { width:18px; height:18px; border-radius:50%; border:2px solid var(--line);
            cursor:pointer; padding:0; }
  .swatch.sel { border-color:var(--clay); box-shadow:0 0 0 1px var(--clay); }
  #wbColor { width:24px; height:22px; padding:0; border:1px solid var(--line); border-radius:6px;
             background:none; cursor:pointer; }
  body.dragging { user-select:none; cursor:col-resize; }
  body.dragging iframe { pointer-events:none; }
</style>
</head>
<body>
<div id="app">
  <aside id="rail">
    <div id="railhead">
      <div class="rt">STATES</div>
      <div class="rbtns">
        <button id="saveLayoutBtn" class="mini save">&#10003; Save</button>
        <button id="defaultOrderBtn" class="mini">&#8635; Default</button>
      </div>
    </div>
    <div id="cards"></div>
    <div id="hiddenWrap"></div>
  </aside>
  <div id="railToggle" title="Show/hide the state rail">&#9776;</div>
  <div id="main">
    <header>
      <div class="brandbar">
        <div class="logo">
          <div class="mark"><svg viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="12" rx="9.6" ry="4" stroke="#fff" stroke-width="1.5" transform="rotate(45 12 12)"/><ellipse cx="12" cy="12" rx="9.6" ry="4" stroke="#fff" stroke-width="1.5" transform="rotate(135 12 12)"/><circle cx="18.79" cy="18.79" r="1.5" fill="#fff"/><circle cx="5.21" cy="5.21" r="1.5" fill="#fff"/><circle cx="12" cy="12" r="2.3" fill="#fff"/></svg></div>
          <div class="wordmark"><b>Viditra</b><span>Teacher Edition</span></div>
        </div>
        <div class="vrule"></div>
        <h1 class="concept">${escapeHtml(conceptName)}</h1>
        <div class="hd-right">${statusPill}</div>
      </div>
    </header>
    <div id="fsScope">
    <div id="stage">
      <iframe id="sim" src="sim.html" title="sim" allow="autoplay"></iframe>
      <div id="pmWm">powered by <b>Viditra</b></div>
      <div id="pmLoad"><div class="plc">
        <div class="mark"><svg viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="12" rx="9.6" ry="4" stroke="#fff" stroke-width="1.5" transform="rotate(45 12 12)"/><ellipse cx="12" cy="12" rx="9.6" ry="4" stroke="#fff" stroke-width="1.5" transform="rotate(135 12 12)"/><circle cx="18.79" cy="18.79" r="1.5" fill="#fff"/><circle cx="5.21" cy="5.21" r="1.5" fill="#fff"/><circle cx="12" cy="12" r="2.3" fill="#fff"/></svg></div>
        <span class="nm" id="pmLoadName">Viditra</span><span class="pw">powered by <b>Viditra</b></span>
      </div></div>
      <canvas id="simOverlay"></canvas>
      <div id="simPenBar">
        <span class="seg">
          <button id="simMoveBtn" class="pmbtn on" title="Move the 3D sim — drag to rotate, scroll to zoom">&#9995; Move</button>
          <button id="simDrawBtn" class="pmbtn" title="Draw on the sim — freezes the view so it can't move while you annotate">&#9999; Draw</button>
        </span>
        <button id="simClearBtn" class="pmbtn" title="Clear sim annotations">Clear</button>
      </div>
      <div id="fsTopControls">
        <div id="fsCleanBtn" class="fsGlassBtn" title="Clean mode — hide on-canvas labels/sliders">&#10022; Clean</div>
        <div id="fsBtn" class="fsGlassBtn" title="Full screen the simulation (Esc to exit)"><span id="fsIcon">&#9974;</span> Full screen</div>
      </div>
      <button id="fsPrevBtn" class="fsChevron fsChevron-left" title="Previous state (← / Page Up)">&#8249;</button>
      <button id="fsNextBtn" class="fsChevron fsChevron-right" title="Next state (→ / Page Down)">&#8250;</button>
      <div id="fsStateReadout"></div>
      <div id="paused">&#9208; Paused — tap to resume</div>
      <div id="tapcue">&#9208; Tap the sim anytime to pause</div>
    </div>
    <div id="capStrip"><div id="caption"></div></div>
    <div id="ctlToggle" title="Hide / show the controls (more room for the simulation)">&#9662;</div>
    <div id="scrubbar">
      <input id="scrub" type="range" min="0" max="1000" step="1" value="0">
      <span id="scrubtime">0.0 / 0.0s</span>
    </div>
    <footer>
      <div id="statelabel">Loading…</div>
      <div class="controls">
        <button id="playBtn" class="primary">&#9654; Play state</button>
        <button id="replayBtn">&#128257; Replay</button>
        <button id="muteBtn">&#128263; Muted</button>
        <button id="ccBtn" title="Show / hide subtitles">Subtitles</button>
        <div class="spacer"></div>
        <label class="ctl">Speed <input id="rate" type="range" min="0.7" max="1.1" step="0.05" value="0.9"></label>
        <label class="ctl"><input id="auto" type="checkbox"> Auto-advance</label>
        <span id="counter" class="ctl"></span>
      </div>
    </footer>
    </div>
  </div>
  <div id="divider" class="hidden"></div>
  <aside id="boardCol" class="hidden">
    <div id="boardToolbar">
      <span class="grp">
        <button id="wbPenBtn" class="pmbtn on" data-tool="pen" title="Pen">&#9999; Pen</button>
        <button id="wbHiBtn" class="pmbtn" data-tool="highlighter" title="Highlighter">&#128396; Hi</button>
        <button id="wbEraseBtn" class="pmbtn" data-tool="eraser" title="Eraser (drag over a stroke to remove it)">&#9003; Erase</button>
      </span>
      <span class="grp" id="wbSwatches"></span>
      <span class="grp">
        <input id="wbColor" type="color" value="#111111" title="Custom colour">
      </span>
      <span class="grp">
        <button class="pmbtn" data-size="2" title="Thin">S</button>
        <button class="pmbtn on" data-size="3" title="Medium">M</button>
        <button class="pmbtn" data-size="6" title="Thick">L</button>
      </span>
      <span class="grp">
        <button id="wbUndoBtn" class="pmbtn" title="Undo (Ctrl+Z)">&#8634; Undo</button>
        <button id="wbRedoBtn" class="pmbtn" title="Redo (Ctrl+Shift+Z)">&#8635; Redo</button>
        <button id="wbClearBtn" class="pmbtn" title="Clear the whiteboard">Clear</button>
      </span>
      <span class="grp">
        <button id="wbThemeBtn" class="pmbtn" title="Switch the page between white and dark">&#9680; Page</button>
      </span>
    </div>
    <div id="boardScroll">
      <canvas id="wbCanvas"></canvas>
      <div id="wbSpacer"></div>
    </div>
  </aside>
  <div id="boardToggle" title="Show/hide the whiteboard">&#8249;</div>
</div>
<script>
  var STATES = ${statesJson};
  var CONCEPT = ${nameJson};

  var STATE_COUNT = STATES.length;
  var CONCEPT_ID = ${idJson};
  var DEFAULT_ORDER = ${orderJson};

  // ── Pilot analytics bridge (pm-telemetry.js) ──
  // pmt() is safe even when telemetry is absent/blocked — never throws into the player.
  window.PM_CONCEPT_ID = CONCEPT_ID;
  window.PM_STATE_ID = null;
  function pmt(type, payload) { try { if (window.PM && PM.track) PM.track(type, payload || {}); } catch (e) {} }

  // Reveal-timeline pacing (Rule 26: reveals ride the state clock, not TTS). Tunable.
  var WPM = 150;             // words/min at rate 1.0 — controls how fast reveals advance
  var MIN_SENTENCE_MS = 1400;   // floor so a short sentence still holds a readable beat
  var GAP_MS = 280;         // breathing gap between sentences
  var LOOP_MS = 90;         // reveal-loop cadence (ms)

  var iframe = document.getElementById('sim');
  var statelabel = document.getElementById('statelabel');
  var caption = document.getElementById('caption');
  var playBtn = document.getElementById('playBtn');
  var replayBtn = document.getElementById('replayBtn');
  var muteBtn = document.getElementById('muteBtn');
  var ccBtn = document.getElementById('ccBtn');
  var defaultOrderBtn = document.getElementById('defaultOrderBtn');
  var cardsEl = document.getElementById('cards');
  var hiddenWrapEl = document.getElementById('hiddenWrap');
  var hiddenExpanded = false;
  var rateEl = document.getElementById('rate');
  var autoEl = document.getElementById('auto');
  var counter = document.getElementById('counter');
  var pausedBadge = document.getElementById('paused');
  var tapCue = document.getElementById('tapcue');
  var scrubEl = document.getElementById('scrub');
  var scrubTime = document.getElementById('scrubtime');
  var tapCueDone = false;
  var tapCueTimer = null;

  // ── Brand curtain: full-screen "{Name}'s Class · powered by Viditra" masks the whole UI while
  //    the sim boots. Held min 2.8s (the brand moment), gone on SIM_READY, 4s failsafe; the .8s
  //    opacity fade IS the reveal — rail/header/sim all appear together. ──
  //    ONLY on a real open, though — a card click from the catalog, which stamps pm_brand_open.
  //    A reload, or a back into a sim she is already teaching, is not a new arrival: she wants her
  //    sim back, not a 2.8s title card. There the curtain goes 'quiet' (no mark, no name, no hold)
  //    and lifts the instant SIM_READY lands, but STILL masks the boot so a half-built Three.js
  //    scene is never on screen. Read the marker once then clear it, so the next reload of this
  //    same sim is correctly quiet; and stamp pm_from_sim so that when she leaves via Back, the
  //    catalog knows she is returning and skips its own intro (founder 2026-07-17). ──
  var pmBrandOpen = false;
  try {
    pmBrandOpen = sessionStorage.getItem('${PM_BRAND_OPEN_KEY}') === '1';
    sessionStorage.removeItem('${PM_BRAND_OPEN_KEY}');
    sessionStorage.setItem('${PM_FROM_SIM_KEY}', '1');
  } catch (e) {}
  var pmLoadEl = document.getElementById('pmLoad');
  var pmLoadT0 = Date.now();
  if (!pmBrandOpen && pmLoadEl) pmLoadEl.classList.add('quiet');
  // Pre-fill the tutor's name from pm-auth's cache (written on any earlier gated page, e.g. the
  // catalog) so the curtain reads "{Name}'s Class" from the FIRST frame — the PM.authReady swap
  // below stays as the fresh-truth confirmation for first-ever visits.
  if (pmBrandOpen) try {
    var pmNmCache = localStorage.getItem('pm_name_cache');
    if (pmNmCache) document.getElementById('pmLoadName').textContent = pmNmCache + '’s Class';
  } catch (e) {}
  function pmLoadDone() {
    if (!pmLoadEl) return;
    var pmLoadElGone = pmLoadEl; pmLoadEl = null;
    var pmLoadWait = pmBrandOpen ? Math.max(0, 2800 - (Date.now() - pmLoadT0)) : 0;
    setTimeout(function () {
      pmLoadElGone.classList.add('gone');   // add, never assign — 'quiet' must survive the fade
      setTimeout(function () { if (pmLoadElGone.parentNode) pmLoadElGone.parentNode.removeChild(pmLoadElGone); }, 900);
    }, pmLoadWait);
  }
  setTimeout(pmLoadDone, 4000);
  if (pmBrandOpen && window.PM && PM.authReady) PM.authReady.then(function () {
    try { if (window.PM_PROFILE && PM_PROFILE.display_name) document.getElementById('pmLoadName').textContent = PM_PROFILE.display_name + '’s Class'; } catch (e) {}
  });

  // ── Teacher layout (order + hides + renames), EXPLICIT SAVE (Rule 25d) ──
  // One consolidated store. Changes apply live but persist only on Save (or a
  // Default-order reset, which persists immediately). So a teacher previews
  // freely; only what he Saves survives a reload — forever, until re-Saved/reset.
  var LS_LAYOUT = 'pm_layout_' + CONCEPT_ID;
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
  var order = DEFAULT_ORDER.slice();   // position → STATES index
  var hiddenStates = {};               // { stateIndex: 1 }
  var stateNames = {};                 // { stateIndex: "custom title" }
  var dirty = false;                   // unsaved changes present?
  function loadLayout() {
    try {
      var d = JSON.parse(localStorage.getItem(LS_LAYOUT) || 'null');
      if (d) {
        if (validOrder(d.order)) order = d.order.slice();
        if (d.hidden && typeof d.hidden === 'object') hiddenStates = d.hidden;
        if (d.names && typeof d.names === 'object') stateNames = d.names;
      }
    } catch (e) {}
  }
  function saveLayout() {
    try { localStorage.setItem(LS_LAYOUT, JSON.stringify({ order: order, hidden: hiddenStates, names: stateNames })); } catch (e) {}
    pushLayoutRemote();
    dirty = false; updateSaveBtn(true);
  }
  function markDirty() { dirty = true; updateSaveBtn(false); }

  // ── Per-account layout sync (teacher_layouts) — Supabase is the source of truth
  // across devices; localStorage stays the fast cache + offline/dev fallback.
  // Fail-open always: a failed cloud call never blocks or breaks the classroom.
  var railTouched = false;   // teacher interacted → never yank the rail under them
  function pushLayoutRemote() {
    try {
      if (window.PM_DEV || !window.PM_CONFIG || !(window.PM && PM.auth)) return;
      var tok = PM.auth.token && PM.auth.token();
      if (!tok) return;
      fetch(PM_CONFIG.supabaseUrl + '/rest/v1/teacher_layouts?on_conflict=professor_id,concept_id', {
        method: 'POST',
        headers: {
          'apikey': PM_CONFIG.supabaseAnonKey, 'Authorization': 'Bearer ' + tok,
          'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify({ concept_id: CONCEPT_ID, layout: { order: order, hidden: hiddenStates, names: stateNames }, updated_at: new Date().toISOString() })
      }).then(function (r) { if (!r.ok) { try { console.warn('[layout] cloud save failed — kept on this device.'); } catch (e) {} } },
              function () { try { console.warn('[layout] cloud save failed — kept on this device.'); } catch (e) {} });
    } catch (e) {}
  }
  function pullLayoutRemote() {
    if (window.PM_DEV || !window.PM_CONFIG || !(window.PM && PM.authReady)) return;
    PM.authReady.then(function (u) {
      if (!u) return;
      var tok = PM.auth.token && PM.auth.token();
      if (!tok) return;
      fetch(PM_CONFIG.supabaseUrl + '/rest/v1/teacher_layouts?select=layout&concept_id=eq.' + encodeURIComponent(CONCEPT_ID), {
        headers: { 'apikey': PM_CONFIG.supabaseAnonKey, 'Authorization': 'Bearer ' + tok }
      }).then(function (r) { return r.ok ? r.json() : null; }).then(function (rows) {
        if (!rows || !rows.length || !rows[0].layout) return;
        if (dirty || railTouched) return;   // they're already working — this device's view wins for now
        var d = rows[0].layout;
        var same = JSON.stringify([d.order, d.hidden, d.names]) ===
                   JSON.stringify([order, hiddenStates, stateNames]);
        if (same) return;
        if (validOrder(d.order)) order = d.order.slice();
        hiddenStates = (d.hidden && typeof d.hidden === 'object') ? d.hidden : {};
        stateNames = (d.names && typeof d.names === 'object') ? d.names : {};
        try { localStorage.setItem(LS_LAYOUT, JSON.stringify({ order: order, hidden: hiddenStates, names: stateNames })); } catch (e) {}
        dirty = false;
        buildRail();
        goToState(0, false);
      }).catch(function () {});
    });
  }
  loadLayout();
  pullLayoutRemote();
  var idx = 0;                       // position within the order array
  function cur() { return STATES[order[idx]]; }
  function isHidden(si) { return hiddenStates[si] === 1; }
  function stateTitle(si) { return stateNames[si] || STATES[si].title; }
  // Next/prev visible order-position (skips hidden states); -1 if none.
  function nextVisible(pos, dir) { for (var p = pos + dir; p >= 0 && p < order.length; p += dir) { if (!isHidden(order[p])) return p; } return -1; }

  var muted = (function () { try { var m = localStorage.getItem(LS_MUTE); return m === null ? true : m === '1'; } catch (e) { return true; } })();
  // ── Subtitles (caption box) on/off — teacher-wide preference, independent of mute ──
  var LS_CC = 'pm_cc';
  var subsOn = (function () { try { return localStorage.getItem(LS_CC) !== '0'; } catch (e) { return true; } })();

  // ── Language: ENGLISH ONLY (founder 2026-07-17 — Rule 30i; supersedes the EN/HI/TE picker) ──
  //    Deliberately a pinned constant, NOT read back from pm_lang_<concept>: a teacher who once
  //    chose తెలుగు still has that value in her localStorage, and with the picker gone she could
  //    never switch back — she'd be stranded on Telugu captions forever. text_hi/text_te stay in
  //    the data (dormant, a future-market seed); nothing reads them.
  var lang = 'en';
  function sentText(s) { return s.text_en || ''; }
  // True if any stored clip exists → the rate slider can't re-pace baked audio.
  var HAS_AUDIO = (function () {
    for (var a = 0; a < STATES.length; a++) {
      var ss = STATES[a].sentences || [];
      for (var b = 0; b < ss.length; b++) {
        var au = ss[b].audio;
        if (au && (au.en.available || au.hi.available || au.te.available)) return true;
      }
    }
    return false;
  })();
  function applyMuteUI() {
    if (muted) { muteBtn.innerHTML = '&#128263; Muted'; muteBtn.classList.remove('on'); }
    else { muteBtn.innerHTML = '&#128266; Narration on'; muteBtn.classList.add('on'); }
  }

  var frozen = false;
  var simReady = false;
  var playing = false;        // play-intent: timeline should advance whenever not frozen
  var audioEl = new Audio();  // single reused element for stored narration clips → overlap impossible
  audioEl.preload = 'auto';
  audioEl.addEventListener('error', function () { /* missing/blocked clip → silent; never blocks the clock */ });
  var pendingRoll = null;     // state id we asked to render and want to roll on STATE_REACHED
  var scrubbing = false;
  // ── Clock-driven reveal timeline (Rule 26) ──
  var timeline = [];          // [{ start, end, si }] state-local ms, rebuilt per state entry
  var timelineTotal = 0;      // ms; end of the last sentence — drives scrubEl.max + end-detect
  var curSi = -1;             // sentence index whose reveals are currently applied
  var spokenSi = -1;          // sentence index whose utterance was last started (audio dedupe)
  var loopHandle = null;      // setInterval handle for the reveal loop
  var ended = false;          // end-latch + transition suppression while the clock is stale
  var dragFrom = -1;
  var simSurface = null;             // sim-overlay annotation surface (set up after the player)
  var boardSurface = null;           // whiteboard surface (set up after the player)

  // Narration is pre-generated Sarvam audio clips (no browser speechSynthesis).
  // Stop = pause + rewind the single shared element so the next clip can't overlap.
  function stopAudio() { try { audioEl.pause(); audioEl.currentTime = 0; } catch (e) {} }

  function post(msg) { if (iframe.contentWindow) iframe.contentWindow.postMessage(msg, '*'); }
  function sendState(id) { post({ type: 'SET_STATE', state: id }); }
  function sendGlow(t) { post({ type: 'SET_GLOW', target: (t == null ? null : t) }); }
  function sendMath(e, p) { post({ type: 'SET_MATH', expression: (e == null ? null : e), persist: p === true }); }
  function sendHand(p) { post({ type: 'SET_HAND_PHASE', phase: (p == null ? null : p) }); }
  function sendFreeze(f) { post({ type: 'SET_FREEZE_PROTON', frozen: f === true }); }
  function sendReset() { post({ type: 'RESET_TRAJECTORY' }); }
  function sendReplay() { post({ type: 'REPLAY_ANIMATIONS' }); }
  function clearSync() { sendGlow(null); sendHand(null); sendFreeze(false); }

  // ════════════════════════════════════════════════════════════════════════
  //  CLOCK-DRIVEN REVEAL TIMELINE (Rule 26)
  //  Reveals (glow / hand / freeze / math + caption) ride the state's own clock
  //  (iframe PM_simTimeMs), never TTS events. Audio is a passenger: each sentence
  //  is spoken when the clock enters its window. So the visual is identical with
  //  sound on or off; MUTE silences audio only; PAUSE/SCRUB/RESUME stay coherent
  //  because the sim clock already freezes / jumps / resets for us.
  // ════════════════════════════════════════════════════════════════════════
  // Estimate a sentence's spoken length from its character count (chars/word ~5.5)
  // scaled by the TTS rate, so the same rate paces reveals AND audio. Char-based
  // on purpose: a /\\s+/ regex would be mangled by the outer template literal.
  function estSentenceMs(text) {
    var chars = (text || '').length;
    var rate = parseFloat(rateEl.value) || 0.9;
    var words = chars / 5.5;
    var ms = (words / (WPM * rate)) * 60000;
    return Math.max(MIN_SENTENCE_MS, Math.round(ms));
  }
  // Use the real stored-clip length when available so reveals lock to the actual
  // spoken audio; fall back to the character estimate when a clip is missing.
  function sentDurMs(s) {
    var a = s.audio && s.audio[lang];
    if (a && a.available && a.duration_ms > 0) return a.duration_ms;
    return estSentenceMs(sentText(s));
  }
  function computeTimeline() {
    var st = cur();
    var sents = st.sentences || [];
    timeline = [];
    var t = 0;
    for (var i = 0; i < sents.length; i++) {
      var dur = sentDurMs(sents[i]);
      timeline.push({ start: t, end: t + dur, si: i });
      t = t + dur + GAP_MS;
    }
    timelineTotal = timeline.length > 0
      ? timeline[timeline.length - 1].end
      : Math.max(1, Math.round((st.duration || 12) * 1000));
    scrubEl.max = String(Math.max(1, timelineTotal));
  }
  // Bind each scenario one-shot to the sentence that narrates it: post that
  // sentence's window START (state-local ms, already per-language because
  // computeTimeline paced it from the audio-clip durations) so the renderer fires
  // the flip / glyph / compass / split-switch / camera-orbit / F-appear on the
  // narrated beat instead of a hardcoded *_at_ms. MUST be sent AFTER SET_STATE
  // (which resets the renderer's overrides) — postMessage FIFO guarantees order.
  // THE EYE never calls this, so its deterministic *_at_ms capture is unaffected.
  function sendCueTimes() {
    var sents = cur().sentences || [];
    for (var i = 0; i < timeline.length; i++) {
      var s = sents[timeline[i].si];
      if (s && s.scenario_cue) post({ type: 'SET_CUE_TIME', cue: s.scenario_cue, at_ms: timeline[i].start });
    }
  }
  // Sentence index whose [start,end) window holds state-local ms t. Clamp: before
  // the first → 0, after the last → last. -1 only when the state has no sentences.
  function activeSiAt(t) {
    if (timeline.length === 0) return -1;
    if (t < timeline[0].start) return 0;
    var held = timeline[0].si;   // most recent sentence that has STARTED
    for (var i = 0; i < timeline.length; i++) {
      if (t >= timeline[i].start) held = timeline[i].si;
      if (t >= timeline[i].start && t < timeline[i].end) return timeline[i].si;
    }
    // Inside a breathing gap (or past the end) → HOLD the just-finished sentence.
    // (Returning the LAST sentence here was the boundary "wrong-statement" bug.)
    return held;
  }
  // Paint one sentence's reveals + caption. Idempotent on curSi, so postMessages
  // fire only at sentence boundaries, not every tick. The next sentence overwrites
  // the previous reveals (a sentence with glow:null actively clears — intended).
  function applyReveal(si) {
    if (si === curSi) return;
    curSi = si;
    if (si < 0) { caption.textContent = ''; clearSync(); sendMath(null, false); return; }
    var s = cur().sentences[si];
    sendGlow(s.glow);
    sendHand(s.hand_phase);
    sendFreeze(s.freeze_proton);
    if (s.math_show) { sendMath(s.math_show, s.math_persist); }
    else if (!s.math_persist) { sendMath(null, false); }
    // Subtitle track is independent of audio mute: it follows the CC toggle (subsOn),
    // so a muted teacher can still read the narration. The #caption element is shown/
    // hidden by the cc-off class (applySubs); we just keep its text current here.
    caption.textContent = sentText(s);
  }
  // Play the active sentence's stored clip if audio is allowed. No onended chaining
  // — the clock advances reveals (Rule 26); audio is a passenger. The single shared
  // audioEl + stopAudio() before each play() makes overlap structurally impossible,
  // so there is no cancel()/speak() race. A missing/blocked clip just stays silent.
  function playCurrent() {
    if (muted || !playing || frozen || curSi < 0) return;
    if (curSi === spokenSi) return;
    var s = cur().sentences[curSi];
    spokenSi = curSi;                       // mark spoken even if the clip is missing → no retry loop
    var a = s.audio && s.audio[lang];
    if (!a || !a.available || !a.file) return;   // silent for this sentence in this language
    stopAudio();
    audioEl.src = './' + a.file;             // manifest path, e.g. ./audio/s1_1_en.mp3 (format-agnostic)
    var p = audioEl.play();
    if (p && p.catch) p.catch(function () { /* autoplay-blocked / 404 → never block the clock */ });
  }
  // Renderer never signals end-of-timeline, so detect it here. Auto-advance is
  // mute-independent (Rule 26c); the last state holds its final frame.
  function onTimelineEnd() {
    ended = true;
    // Auto-advance skips teacher-hidden states (explicit clicks still open them).
    var nextPos = idx + 1;
    while (nextPos < order.length && isHidden(order[nextPos])) nextPos++;
    if (autoEl.checked && nextPos < order.length) {
      goToState(nextPos, playing);
    } else if (cur() && cur().advance_mode === 'interaction_complete') {
      // Explore/sandbox state: never auto-freeze. Let the clock free-run so the
      // motion loops forever (the renderer's bead phase wraps % 1) and slider
      // drags drive live continuous motion — a teacher can still Pause manually
      // (the Pause button calls freeze()). Nothing left to reveal here, so keep
      // playing and do NOT pin the clock. (founder 2026-07-12: the last state must
      // run continuously, not stop after its narration ends.)
    } else {
      playing = false; setPlayBtnUI(false);
      try { stopAudio(); } catch (e) {}
      post({ type: 'SET_TIME_FREEZE', at_ms: timelineTotal });   // hold a clean final frame
      frozen = true;
    }
  }
  // The single always-on loop: read the sim clock, paint the matching reveal,
  // ride audio along, and keep the scrubber display in sync.
  function revealTick() {
    if (!simReady) return;
    var t = readSimTimeMs();
    if (timelineTotal > 0 && t >= timelineTotal) {
      if (!ended) onTimelineEnd();
      if (!scrubbing) { scrubEl.value = String(timelineTotal); updateScrubLabel(timelineTotal); }
      return;
    }
    ended = false;
    var si = activeSiAt(t);
    if (si !== curSi) { applyReveal(si); spokenSi = -1; }
    playCurrent();
    if (!scrubbing && !frozen) {
      scrubEl.value = String(t);
      updateScrubLabel(parseInt(scrubEl.value, 10) || 0);
    }
  }
  function startLoop() { if (loopHandle == null) loopHandle = setInterval(revealTick, LOOP_MS); }
  function stopLoop() { if (loopHandle != null) { clearInterval(loopHandle); loopHandle = null; } }
  // Roll the current state from the top: reset clock, replay one-shots, un-pin, play.
  function rollTimeline() {
    computeTimeline();
    sendCueTimes();                            // re-pace cue times to the (possibly re-timed) timeline
    curSi = -1; spokenSi = -1; ended = true;   // suppress end-detect until the clock resets
    sendReset();
    sendReplay();
    post({ type: 'SET_TIME_FREEZE', frozen: false });
    frozen = false; pausedBadge.style.display = 'none';
    scrubbing = false;
    playing = true; setPlayBtnUI(true);
    applyReveal(activeSiAt(0));
    playCurrent();
  }

  // ── Freeze-frame (teacher pause) ──────────────────────────────────────────
  // Tap the sim / spacebar / footer Pause pins the CURRENT frame so a teacher
  // can explain over a still picture (and still drag-rotate it). SET_STATE
  // auto-releases the pin in the renderer, so changing state clears it.
  function readSimTimeMs() { try { return iframe.contentWindow.PM_simTimeMs || 0; } catch (e) { return 0; } }
  function freeze() {
    if (frozen) return;
    frozen = true;
    pmt('pause', { at_ms: readSimTimeMs() });
    retireTapCue();                     // they discovered pause — stop hinting
    post({ type: 'SET_TIME_FREEZE', at_ms: readSimTimeMs() });   // pin clock → reveals hold (Rule 26b)
    try { stopAudio(); } catch (e) {}        // audio stops; play-intent survives
    spokenSi = -1;                      // so resume re-speaks the current sentence
    setPlayBtnUI(false);
    pausedBadge.style.display = 'block';
  }
  function unfreeze() {
    if (!frozen) return;
    frozen = false;
    pmt('resume', { at_ms: readSimTimeMs() });
    post({ type: 'SET_TIME_FREEZE', frozen: false });   // clock resumes from where it was pinned
    pausedBadge.style.display = 'none';
    playing = true;                     // resume (or tap-to-play an idle frame)
    setPlayBtnUI(true);
    spokenSi = -1;
    playCurrent();                     // re-voice current sentence now (audio gated on mute inside)
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

  // Button glyph ONLY — never touches play-intent (freeze() shows Play while intent persists).
  function setPlayBtnUI(showPause) {
    if (showPause) { playBtn.innerHTML = '&#9209; Pause'; playBtn.classList.add('playing'); }
    else { playBtn.innerHTML = '&#9654; Play state'; playBtn.classList.remove('playing'); }
  }

  // ── Rail (clickable + drag-reorderable state cards) ──
  // ── Save button state ──
  var saveBtn = document.getElementById('saveLayoutBtn');
  var saveFlashT = null;
  function updateSaveBtn(justSaved) {
    if (!saveBtn) return;
    if (saveFlashT) { clearTimeout(saveFlashT); saveFlashT = null; }
    if (justSaved) {
      saveBtn.className = 'mini save saved'; saveBtn.innerHTML = '&#10003; Saved';
      saveFlashT = setTimeout(function () { saveBtn.className = 'mini save'; saveBtn.innerHTML = '&#10003; Save'; }, 1600);
    } else if (dirty) {
      saveBtn.className = 'mini save dirty'; saveBtn.innerHTML = '&#10003; Save';
    } else {
      saveBtn.className = 'mini save'; saveBtn.innerHTML = '&#10003; Save';
    }
  }

  // ── Per-row ⋮ menu (Rename / Hide / Unhide) ──
  var rowMenu = document.createElement('div'); rowMenu.id = 'rowMenu'; document.body.appendChild(rowMenu);
  function closeRowMenu() { rowMenu.classList.remove('open'); rowMenu.innerHTML = ''; }
  document.addEventListener('click', function (e) { if (!rowMenu.contains(e.target)) closeRowMenu(); }, true);
  window.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeRowMenu(); });
  function openRowMenu(si, anchorEl) {
    rowMenu.innerHTML = '';
    var s = STATES[si], hid = isHidden(si);
    var mkBtn = function (label, fn) { var b = document.createElement('button'); b.textContent = label; b.addEventListener('click', function (ev) { ev.stopPropagation(); closeRowMenu(); fn(); }); rowMenu.appendChild(b); };
    mkBtn('Rename', function () { startRename(si); });
    mkBtn(hid ? 'Unhide' : 'Hide', function () { setHidden(si, !hid); });
    var r = anchorEl.getBoundingClientRect();
    rowMenu.classList.add('open');
    var mw = rowMenu.offsetWidth || 130, mh = rowMenu.offsetHeight || 70;
    var left = Math.min(r.left, document.documentElement.clientWidth - mw - 6);
    var top = Math.min(r.bottom + 4, document.documentElement.clientHeight - mh - 6);
    rowMenu.style.left = Math.max(6, left) + 'px'; rowMenu.style.top = Math.max(6, top) + 'px';
  }

  function setHidden(si, hide) {
    if (hide) { hiddenStates[si] = 1; pmt('state_hide', { state_id: STATES[si].id, title: stateTitle(si) }); }
    else { delete hiddenStates[si]; pmt('state_unhide', { state_id: STATES[si].id, title: stateTitle(si) }); }
    // If we just hid the state currently being viewed, jump to the next visible one.
    if (hide && order[idx] === si) { var nx = nextVisible(idx, 1); if (nx < 0) nx = nextVisible(idx, -1); if (nx >= 0) idx = nx; }
    markDirty(); buildRail(); updateBadge();
  }

  // Rename a state by STATES index (menu action + dblclick shortcut share this).
  function startRename(si) {
    var ttl = document.querySelector('[data-ttl="' + si + '"]');
    if (!ttl || ttl.querySelector('input')) return;
    var card = ttl.parentElement;
    var old = stateTitle(si);
    var inp = document.createElement('input');
    inp.type = 'text'; inp.value = old; inp.maxLength = 80;
    if (card) card.setAttribute('draggable', 'false');
    ttl.textContent = ''; ttl.appendChild(inp);
    inp.focus(); inp.select();
    var done = false;
    function commit(cancel) {
      if (done) return; done = true;
      var next = cancel ? old : (inp.value || '').trim();
      if (!next || next === STATES[si].title) delete stateNames[si]; else stateNames[si] = next;
      if (!cancel && next !== old) { pmt('state_rename', { state_id: STATES[si].id, from: old, to: next || STATES[si].title }); markDirty(); }
      buildRail(); updateBadge();
    }
    inp.addEventListener('click', function (e2) { e2.stopPropagation(); });
    inp.addEventListener('keydown', function (e2) {
      if (e2.key === 'Enter') { e2.preventDefault(); commit(false); }
      else if (e2.key === 'Escape') { e2.preventDefault(); commit(true); }
      e2.stopPropagation();
    });
    inp.addEventListener('blur', function () { commit(false); });
  }

  function buildRail() {
    cardsEl.innerHTML = '';
    var hiddenIdxs = [];
    var visNum = 0;
    for (var p = 0; p < order.length; p++) {
      var si0 = order[p];
      if (isHidden(si0)) { hiddenIdxs.push({ si: si0, pos: p }); continue; }
      visNum++;
      (function (pos, si, num) {
        var card = document.createElement('div');
        card.className = 'card' + (pos === idx ? ' active' : '');
        card.setAttribute('draggable', 'true');
        card.title = stateTitle(si);
        var numEl = document.createElement('span'); numEl.className = 'num'; numEl.textContent = String(num);
        var ttl = document.createElement('span'); ttl.className = 'ttl'; ttl.textContent = stateTitle(si); ttl.setAttribute('data-ttl', String(si));
        var grip = document.createElement('button'); grip.className = 'grip'; grip.innerHTML = '&#8942;'; grip.title = 'State options — rename or hide';
        card.appendChild(numEl); card.appendChild(ttl); card.appendChild(grip);
        grip.addEventListener('click', function (ev) { ev.stopPropagation(); openRowMenu(si, grip); });
        ttl.addEventListener('dblclick', function (ev) { ev.stopPropagation(); startRename(si); });
        card.addEventListener('click', function () { railTouched = true; pause(); goToState(pos, false); });
        card.addEventListener('dragstart', function (e) { dragFrom = pos; card.classList.add('dragging'); try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(pos)); } catch (_) {} });
        card.addEventListener('dragend', function () { card.classList.remove('dragging'); clearDragOver(); dragFrom = -1; });
        card.addEventListener('dragover', function (e) { e.preventDefault(); card.classList.add('dragover'); });
        card.addEventListener('dragleave', function () { card.classList.remove('dragover'); });
        card.addEventListener('drop', function (e) { e.preventDefault(); card.classList.remove('dragover'); reorder(dragFrom, pos); });
        cardsEl.appendChild(card);
      })(p, si0, visNum);
    }
    buildHidden(hiddenIdxs);
  }

  function buildHidden(hiddenIdxs) {
    hiddenWrapEl.innerHTML = '';
    if (!hiddenIdxs.length) return;
    var head = document.createElement('div'); head.className = 'hidhead';
    head.innerHTML = (hiddenExpanded ? '&#9662;' : '&#9656;') + ' Hidden (' + hiddenIdxs.length + ')';
    head.addEventListener('click', function () { hiddenExpanded = !hiddenExpanded; buildRail(); });
    hiddenWrapEl.appendChild(head);
    if (!hiddenExpanded) return;
    for (var i = 0; i < hiddenIdxs.length; i++) {
      (function (si) {
        var row = document.createElement('div'); row.className = 'hidrow';
        var ttl = document.createElement('span'); ttl.className = 'ttl'; ttl.textContent = stateTitle(si); ttl.setAttribute('data-ttl', String(si));
        var grip = document.createElement('button'); grip.className = 'grip'; grip.innerHTML = '&#8942;'; grip.title = 'State options — rename or unhide';
        row.appendChild(ttl); row.appendChild(grip);
        grip.addEventListener('click', function (ev) { ev.stopPropagation(); openRowMenu(si, grip); });
        ttl.addEventListener('dblclick', function (ev) { ev.stopPropagation(); startRename(si); });
        hiddenWrapEl.appendChild(row);
      })(hiddenIdxs[i].si);
    }
  }

  function clearDragOver() { var c = cardsEl.querySelectorAll('.card.dragover'); for (var i = 0; i < c.length; i++) c[i].classList.remove('dragover'); }
  function reorder(from, to) {
    if (from < 0 || from === to) return;
    var keep = order[idx];
    var moved = order.splice(from, 1)[0];
    order.splice(to, 0, moved);
    idx = order.indexOf(keep);          // keep viewing the same state after reorder
    pmt('state_reorder', { state_id: STATES[moved].id, from: from, to: to, order: order.slice() });
    markDirty();
    buildRail();
    updateBadge();
  }
  function resetOrder() {
    var keep = order[idx];
    order = DEFAULT_ORDER.slice();
    idx = order.indexOf(keep); if (idx < 0) idx = 0;
    // "Default order" is the teacher's full reset: order + hidden + renames — and it PERSISTS immediately.
    var hadHides = false, hadNames = false, k;
    for (k in hiddenStates) { hadHides = true; break; }
    for (k in stateNames) { hadNames = true; break; }
    hiddenStates = {}; stateNames = {}; hiddenExpanded = false;
    pmt('order_reset', { cleared_hides: hadHides, cleared_renames: hadNames });
    saveLayout();     // durable reset
    buildRail();
    updateBadge();
  }

  function updateBadge() {
    var st = cur();
    statelabel.textContent = 'STATE ' + (idx + 1) + ' / ' + order.length + '  —  ' + stateTitle(order[idx]);
    counter.textContent = (idx + 1) + ' / ' + order.length;
    var cards = cardsEl.querySelectorAll('.card');
    for (var i = 0; i < cards.length; i++) cards[i].classList.toggle('active', i === idx);
    // scrubEl.max is owned by computeTimeline() (the choreography length, not authored duration).
    updateFsNav();   // keep the full-screen chevrons/readout (§4) in sync with every state change
  }

  // Move to the given order-position. autoRoll = start the timeline on entry (reveals always
  // play once rolled; audio follows mute). Else: idle on the opening frame until Play (Rule 26).
  function goToState(pos, autoRoll) {
    idx = Math.max(0, Math.min(order.length - 1, pos));
    window.PM_STATE_ID = cur().id;
    pmt('state_open', { state_id: cur().id, pos: idx, auto: autoRoll === true });
    if (frozen) { frozen = false; pausedBadge.style.display = 'none'; }  // SET_STATE releases the pin
    try { stopAudio(); } catch (e) {}
    caption.textContent = '';
    curSi = -1; spokenSi = -1; ended = true;   // suppress end-detect until the new clock is fresh
    clearSync();
    sendMath(null, false);
    if (simSurface) { simSurface.clear(); if (simDrawMode) setSimDraw(false); }   // annotations belong to the frame being left; new state is rotatable again
    scrubEl.value = '0';
    computeTimeline();
    updateBadge();
    sendState(cur().id);
    sendCueTimes();               // after SET_STATE (which resets the renderer's cue overrides)
    if (autoRoll) {
      pendingRoll = cur().id;
      var want = cur().id;
      setTimeout(function () { if (pendingRoll === want) { pendingRoll = null; rollTimeline(); } }, 400);
    } else {
      pendingRoll = null;
      playing = false; setPlayBtnUI(false);
      post({ type: 'SET_TIME_FREEZE', at_ms: 0 });   // hold the opening frame until Play
      frozen = true;
      applyReveal(activeSiAt(0));                     // show the opening beat (not blank)
    }
  }

  function play() {
    pmt('play', {});
    rollTimeline();   // unpins + rolls the current state from the top; this click unlocks Web Speech
    showTapCue();
  }
  // Minimal "stop before navigating" — goToState handles clearing reveals.
  function pause() {
    playing = false;
    try { stopAudio(); } catch (e) {}
    setPlayBtnUI(false);
  }

  playBtn.addEventListener('click', function () {
    railTouched = true;
    if (playing && !frozen) { freeze(); }            // playing → pause-hold
    else if (frozen && playing) { unfreeze(); }      // paused mid-play → resume
    else { play(); }                                 // idle / ended → roll from top
  });
  replayBtn.addEventListener('click', function () { pmt('replay', {}); pause(); goToState(idx, true); });
  defaultOrderBtn.addEventListener('click', resetOrder);
  saveBtn.addEventListener('click', function () { saveLayout(); pmt('layout_save', {}); });
  // Subtitles: show/hide the caption box (independent of audio mute — a muted teacher
  // can still read along). Teacher-wide preference (LS_CC).
  function applySubs() {
    if (caption) caption.classList.toggle('cc-off', !subsOn);
    var capStripEl = document.getElementById('capStrip');
    if (capStripEl) capStripEl.classList.toggle('cc-off', !subsOn);   // reclaim the strip's pixels
    if (ccBtn) { ccBtn.classList.toggle('on', subsOn); ccBtn.textContent = subsOn ? 'Subtitles' : 'Subtitles off'; }
  }
  if (ccBtn) ccBtn.addEventListener('click', function () {
    subsOn = !subsOn;
    try { localStorage.setItem(LS_CC, subsOn ? '1' : '0'); } catch (e) {}
    pmt('subtitles_toggle', { on: subsOn });
    applySubs();
  });
  // Rule 26a: MUTE is audio ONLY — never pauses the clock, reveals, or play-intent.
  muteBtn.addEventListener('click', function () {
    muted = !muted;
    pmt(muted ? 'mute' : 'unmute', {});
    try { localStorage.setItem(LS_MUTE, muted ? '1' : '0'); } catch (e) {}
    if (muted) { try { stopAudio(); } catch (e) {} }
    else { spokenSi = -1; playCurrent(); }
    applyMuteUI();
  });
  // (No language switch — the product is English-only, Rule 30i. The old EN/HI/TE picker + its
  //  re-pace/caption-swap handler are gone; lang is pinned above.)

  // ── Scrubber: drag to jump within the current state's timeline ──
  // rAF-throttle the jump so a fast drag doesn't spam the iframe → smooth scrubbing.
  var scrubRaf = 0, scrubPending = 0;
  scrubEl.addEventListener('input', function () {
    scrubbing = true;
    var ms = parseInt(scrubEl.value, 10) || 0;
    scrubPending = ms;
    frozen = true;
    updateScrubLabel(ms);                          // label updates every input (cheap)
    if (scrubRaf) return;
    scrubRaf = requestAnimationFrame(function () {
      scrubRaf = 0;
      try { stopAudio(); } catch (e) {}
      post({ type: 'SET_TIME_JUMP', at_ms: scrubPending });   // one jump per frame
      curSi = -1; applyReveal(activeSiAt(scrubPending));
    });
  });
  // Release: SET_TIME_JUMP holds, so if we were playing we must un-pin to resume.
  scrubEl.addEventListener('change', function () {
    scrubbing = false;
    pmt('scrub', { to_ms: parseInt(scrubEl.value, 10) || 0 });
    if (playing) {
      post({ type: 'SET_TIME_FREEZE', frozen: false });
      frozen = false;
      spokenSi = -1; playCurrent();
    }
    // not playing → stay pinned on the scrubbed frame.
  });
  function updateScrubLabel(ms) {
    var mx = parseInt(scrubEl.max, 10) || 1000;
    scrubTime.textContent = (ms / 1000).toFixed(1) + ' / ' + (mx / 1000).toFixed(1) + 's';
  }
  // Rate change re-paces the current state's reveal windows.
  rateEl.addEventListener('change', function () { pmt('speed_change', { rate: rateEl.value }); if (simReady) { computeTimeline(); sendCueTimes(); } });
  autoEl.addEventListener('change', function () { pmt('auto_advance', { on: autoEl.checked }); });

  // ── In-sim interaction capture (pilot analytics) ──
  // The sim iframe is same-origin, so one delegated capture-phase listener on its
  // document sees EVERY slider release + button press in every scenario — no
  // per-scenario wiring in the renderer. isTrusted filters out choreography-driven
  // (programmatic) value changes so only real teacher touches are recorded.
  function attachSimCapture() {
    try {
      var doc = iframe.contentWindow.document;
      if (!doc || doc.getAttribute && doc.documentElement.getAttribute('data-pm-captured')) return;
      doc.documentElement.setAttribute('data-pm-captured', '1');
      doc.addEventListener('change', function (ev) {
        var el = ev.target;
        if (!ev.isTrusted || !el) return;
        if (el.type === 'range') pmt('slider_change', { slider: el.id || el.name || 'unnamed', value: el.value });
        else if (el.tagName === 'SELECT') pmt('sim_select', { control: el.id || el.name || 'unnamed', value: el.value });
      }, true);
      doc.addEventListener('click', function (ev) {
        var el = ev.target;
        if (!ev.isTrusted || !el || !el.closest) return;
        var btn = el.closest('button');
        if (btn) pmt('sim_button', { button: btn.id || (btn.textContent || '').trim().slice(0, 40) });
      }, true);
      // Camera settle: after a real orbit/zoom gesture, record where the
      // teacher left the camera (renderer exposes window.PM_camera live).
      // Choreography moves the camera without DOM events, so it never fires.
      var camTimer = null, lastCam = null;
      try { var c0 = iframe.contentWindow.PM_camera; if (c0) lastCam = { t: c0.theta, p: c0.phi, r: c0.radius }; } catch (e2) {}
      function camSettle() {
        camTimer = null;
        try {
          var c = iframe.contentWindow.PM_camera;
          if (!c) return;
          if (lastCam && Math.abs(c.theta - lastCam.t) < 0.02 && Math.abs(c.phi - lastCam.p) < 0.02 && Math.abs(c.radius - lastCam.r) < 0.05) return;
          lastCam = { t: c.theta, p: c.phi, r: c.radius };
          pmt('camera_settle', { theta: Math.round(c.theta * 100) / 100, phi: Math.round(c.phi * 100) / 100, radius: Math.round(c.radius * 100) / 100 });
        } catch (e3) {}
      }
      function camPoke(ev) { if (!ev.isTrusted) return; if (camTimer) clearTimeout(camTimer); camTimer = setTimeout(camSettle, 900); }
      doc.addEventListener('pointerup', camPoke, true);
      doc.addEventListener('touchend', camPoke, true);
      doc.addEventListener('wheel', camPoke, { capture: true, passive: true });
    } catch (e) { /* cross-origin or not ready — never break playback */ }
  }

  var simErrCount = 0;
  window.addEventListener('message', function (e) {
    var t = e.data && e.data.type;
    if (t === 'SIM_READY') {
      simReady = true;
      pmt('sim_ready', { states: STATE_COUNT });
      attachSimCapture();
      // Baked audio can't be re-paced by the slider — disable it when clips exist.
      if (HAS_AUDIO && rateEl) { rateEl.disabled = true; rateEl.title = 'Pacing follows the recorded narration'; }
      buildRail();
      applyMuteUI();
      startLoop();
      pmLoadDone();
      goToState(0, false);   // open the first state on its opening frame; Play to roll
    } else if (t === 'STATE_REACHED') {
      pmt('state_reached', { state_id: e.data.state });
      if (pendingRoll && e.data.state === pendingRoll) {
        pendingRoll = null;
        rollTimeline();
      }
    } else if (t === 'PARAM_UPDATE') {
      // Explorer scenarios announce param changes explicitly (e.g. ac_generator).
      pmt('slider_change', { slider: e.data.param || 'param', value: e.data.value, explorer: e.data.explorer_id || null });
    } else if (t === 'CANVAS_TAP') {
      toggleFreeze();
    } else if (t === 'SIM_ERROR') {
      // Relayed by the error hook inside sim.html. Re-slice here too: any
      // window can postMessage, so never trust payload sizes from outside.
      if (simErrCount < 10) {
        simErrCount++;
        pmt('sim_error', {
          message: String(e.data.message || '').slice(0, 300),
          source: String(e.data.source || '').slice(0, 200),
          lineno: e.data.lineno || 0
        });
      }
    }
  });

  // Reliability watchdog: a sim that never says SIM_READY is a broken class.
  // Log-only — playback behavior is unchanged.
  setTimeout(function () { if (!simReady) pmt('sim_error', { kind: 'ready_timeout', after_ms: 15000 }); }, 15000);

  // Spacebar toggles freeze; arrow keys (or PageUp/PageDown — most classroom wireless
  // presenter clickers send Page keys, not arrows, §6) step the (possibly reordered) sequence.
  window.addEventListener('keydown', function (e) {
    armIdle();
    if (e.code === 'Space' || e.key === ' ') { e.preventDefault(); toggleFreeze(); }
    else if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); var nR = nextVisible(idx, 1); if (nR >= 0) { pause(); goToState(nR, false); } }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); var nL = nextVisible(idx, -1); if (nL >= 0) { pause(); goToState(nL, false); } }
  });

  // ════════════════════════════════════════════════════════════════════════
  //  WHITEBOARD + UNIFIED PEN  (one pen, two surfaces: sim overlay + board)
  //  Vanilla Canvas2D + Pointer Events. No deps. Strokes are vectors so the
  //  whiteboard scrolls endlessly and undo/redraw stay cheap.
  // ════════════════════════════════════════════════════════════════════════
  var TOOL = { tool: 'pen', color: '#111111', size: 3 };
  var COLOR_LIGHT = '#111111', COLOR_DARK = '#f5f5f5';
  var isDefaultColor = true;          // true until the teacher deliberately picks a colour
  var lastSurface = null;             // surface that received the last stroke (for undo/redo)

  function pmDist(a, b) { var dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); }
  function pmDistToSeg(p, a, b) {
    var dx = b.x - a.x, dy = b.y - a.y;
    var len2 = dx * dx + dy * dy;
    if (len2 === 0) return pmDist(p, a);
    var t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    return pmDist(p, { x: a.x + t * dx, y: a.y + t * dy });
  }

  function makeSurface(canvas, opts) {
    opts = opts || {};
    var scrolls = !!opts.scrolls;
    var ctx = canvas.getContext('2d');
    var strokes = [];
    var ops = [];          // undo stack of { type:'add'|'erase'|'clear', ... }
    var redo = [];
    var scrollOffset = 0;
    var dpr = 1, cssW = 1, cssH = 1;
    var drawing = false, erasing = false, drawPid = null;
    var curStroke = null, eraseHits = [];
    var bgIsDark = false;
    var saveTimer = null;

    function bboxOf(pts) {
      var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        if (p.x < minX) minX = p.x; if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x; if (p.y > maxY) maxY = p.y;
      }
      return { minX: minX, minY: minY, maxX: maxX, maxY: maxY };
    }
    function styleFor(s) {
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (s.tool === 'highlighter') { ctx.globalAlpha = 0.32; ctx.strokeStyle = s.color; ctx.lineWidth = s.size * 4; }
      else { ctx.globalAlpha = 1; ctx.strokeStyle = s.color; ctx.lineWidth = s.size; }
    }
    function paint(s) {
      if (!s.points.length) return;
      styleFor(s);
      ctx.beginPath();
      var p0 = s.points[0];
      ctx.moveTo(p0.x, p0.y - scrollOffset);
      if (s.points.length === 1) ctx.lineTo(p0.x + 0.05, p0.y - scrollOffset);
      else for (var i = 1; i < s.points.length; i++) ctx.lineTo(s.points[i].x, s.points[i].y - scrollOffset);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    function render() {
      ctx.clearRect(0, 0, cssW, cssH);
      var top = scrollOffset, bot = scrollOffset + cssH;
      for (var i = 0; i < strokes.length; i++) {
        var b = strokes[i].bbox;
        if (b.maxY < top || b.minY > bot) continue;
        paint(strokes[i]);
      }
    }
    function contentBottom() { var mb = 0; for (var i = 0; i < strokes.length; i++) { if (strokes[i].bbox.maxY > mb) mb = strokes[i].bbox.maxY; } return mb; }
    function growSpacer() {
      if (!opts.spacerEl || !opts.scrollEl) return;
      var need = Math.max(contentBottom() + cssH, opts.scrollEl.scrollTop + cssH * 1.5);
      opts.spacerEl.style.height = Math.round(need) + 'px';
    }
    function resize() {
      // A <canvas> is a replaced element: CSS inset:0 does NOT stretch it, so we
      // must set its CSS box explicitly. Board → its scroll container; sim overlay
      // → its parent (#stage), so it covers the full sim (not a tiny default box).
      var sizeEl = opts.scrollEl || canvas.parentElement;
      if (sizeEl) { canvas.style.width = sizeEl.clientWidth + 'px'; canvas.style.height = sizeEl.clientHeight + 'px'; }
      var rect = canvas.getBoundingClientRect();
      cssW = Math.max(1, Math.round(rect.width));
      cssH = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      growSpacer();
      render();
    }
    function toLocal(e) {
      var rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top + scrollOffset };
    }
    function hitStroke(s, pt, r) {
      var rad = r / 2 + s.size / 2 + 3, b = s.bbox;
      if (pt.x < b.minX - rad || pt.x > b.maxX + rad || pt.y < b.minY - rad || pt.y > b.maxY + rad) return false;
      if (s.points.length === 1) return pmDist(pt, s.points[0]) <= rad;
      for (var i = 0; i < s.points.length - 1; i++) if (pmDistToSeg(pt, s.points[i], s.points[i + 1]) <= rad) return true;
      return false;
    }
    function eraseAt(pt) {
      var changed = false;
      for (var i = strokes.length - 1; i >= 0; i--) {
        if (hitStroke(strokes[i], pt, TOOL.size)) { eraseHits.push(strokes.splice(i, 1)[0]); changed = true; }
      }
      if (changed) render();
    }

    function onDown(e) {
      if (scrolls && e.pointerType === 'touch') return;     // finger scrolls the board; pen/mouse draw
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (opts.onActivate) opts.onActivate();
      drawPid = e.pointerId;
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      var pt = toLocal(e);
      if (TOOL.tool === 'eraser') { erasing = true; eraseHits = []; eraseAt(pt); e.preventDefault(); return; }
      drawing = true;
      curStroke = { tool: TOOL.tool, color: TOOL.color, size: TOOL.size, points: [pt] };
      e.preventDefault();
    }
    function onMove(e) {
      if (e.pointerId !== drawPid) return;
      if (erasing) { eraseAt(toLocal(e)); e.preventDefault(); return; }
      if (!drawing || !curStroke) return;
      e.preventDefault();
      var pt = toLocal(e), last = curStroke.points[curStroke.points.length - 1];
      if (Math.abs(pt.x - last.x) < 1.2 && Math.abs(pt.y - last.y) < 1.2) return;
      curStroke.points.push(pt);
      if (curStroke.tool === 'highlighter') { render(); paint(curStroke); }   // single pass — no double-darkening
      else { styleFor(curStroke); ctx.beginPath(); ctx.moveTo(last.x, last.y - scrollOffset); ctx.lineTo(pt.x, pt.y - scrollOffset); ctx.stroke(); ctx.globalAlpha = 1; }
    }
    function onUp(e) {
      if (e.pointerId !== drawPid) return;
      drawPid = null;
      if (erasing) { erasing = false; if (eraseHits.length) { ops.push({ type: 'erase', strokes: eraseHits.slice() }); redo.length = 0; persist(); } eraseHits = []; return; }
      if (!drawing || !curStroke) return;
      drawing = false;
      if (curStroke.points.length) {
        curStroke.bbox = bboxOf(curStroke.points);
        strokes.push(curStroke);
        ops.push({ type: 'add', stroke: curStroke });
        redo.length = 0;
        growSpacer(); persist(); render();
        if (opts.onStroke) { try { opts.onStroke(curStroke); } catch (e2) {} }
      }
      curStroke = null;
    }
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', function (e) { if (e.pointerId === drawPid) { drawPid = null; drawing = false; erasing = false; curStroke = null; render(); } });
    canvas.addEventListener('touchmove', function (ev) { if (drawing || erasing) ev.preventDefault(); }, { passive: false });

    function undo() {
      var op = ops.pop(); if (!op) return;
      if (op.type === 'add') { var k = strokes.indexOf(op.stroke); if (k >= 0) strokes.splice(k, 1); }
      else if (op.type === 'erase' || op.type === 'clear') { for (var i = 0; i < op.strokes.length; i++) strokes.push(op.strokes[i]); }
      redo.push(op); growSpacer(); persist(); render();
    }
    function redoOp() {
      var op = redo.pop(); if (!op) return;
      if (op.type === 'add') { strokes.push(op.stroke); }
      else if (op.type === 'erase') { for (var i = 0; i < op.strokes.length; i++) { var k = strokes.indexOf(op.strokes[i]); if (k >= 0) strokes.splice(k, 1); } }
      else if (op.type === 'clear') { strokes.length = 0; }
      ops.push(op); growSpacer(); persist(); render();
    }
    function clear() {
      if (!strokes.length) return;
      ops.push({ type: 'clear', strokes: strokes.slice() });
      strokes.length = 0; redo.length = 0;
      growSpacer(); persist(); render();
    }
    function setScroll(v) { scrollOffset = v; render(); growSpacer(); }
    function setDark(d) { bgIsDark = d; if (opts.scrollEl) opts.scrollEl.classList.toggle('dark', d); render(); }

    function persist() {
      if (!opts.persistKey) return;
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(function () {
        try { localStorage.setItem(opts.persistKey, JSON.stringify({ v: 1, strokes: strokes.slice(0, 5000), theme: bgIsDark ? 'dark' : 'light' })); } catch (e) {}
      }, 500);
    }
    function restore() {
      if (!opts.persistKey) return null;
      try {
        var raw = localStorage.getItem(opts.persistKey);
        if (!raw) return null;
        var d = JSON.parse(raw);
        if (d && d.strokes) {
          strokes = d.strokes;
          for (var i = 0; i < strokes.length; i++) if (!strokes[i].bbox) strokes[i].bbox = bboxOf(strokes[i].points);
        }
        return d || null;
      } catch (e) { return null; }
    }

    return {
      resize: resize, render: render, undo: undo, redo: redoOp, clear: clear,
      setScroll: setScroll, setDark: setDark, isDark: function () { return bgIsDark; },
      restore: restore, count: function () { return strokes.length; }
    };
  }

  // ── Layout: rail | railToggle | main(sim) | divider | boardCol ──────────────
  // Floors are tiny (not the old 772) so the teacher can drag freely — "no hurdle".
  var DIV_W = 6, TOG_W = 14, BTOG_W = 14, SIM_MIN = 220, BOARD_MIN = 140, RAIL_MIN = 44;
  var railWidth = 200, boardOpen = false, railCollapsed = false, layoutMode = 'both',
      boardWidth = 480, controlsCollapsed = false;

  var railEl = document.getElementById('rail');
  var railToggleEl = document.getElementById('railToggle');
  var boardToggleEl = document.getElementById('boardToggle');
  var mainEl = document.getElementById('main');
  var dividerEl = document.getElementById('divider');
  var boardColEl = document.getElementById('boardCol');
  var boardScrollEl = document.getElementById('boardScroll');
  var wbCanvasEl = document.getElementById('wbCanvas');
  var wbSpacerEl = document.getElementById('wbSpacer');
  var simOverlayEl = document.getElementById('simOverlay');
  var wbBtn = boardToggleEl;   // the slim right-edge tab opens/collapses the whiteboard

  var LS_WBUI = 'pm_wbui_' + CONCEPT_ID;
  function loadWbUI() {
    try {
      var d = JSON.parse(localStorage.getItem(LS_WBUI) || 'null');
      if (d) {
        if (typeof d.boardWidth === 'number') boardWidth = d.boardWidth;
        if (typeof d.railWidth === 'number') railWidth = d.railWidth;
        if (typeof d.railCollapsed === 'boolean') railCollapsed = d.railCollapsed;
        if (typeof d.controlsCollapsed === 'boolean') controlsCollapsed = d.controlsCollapsed;
      }
    } catch (e) {}
  }
  function saveWbUI() { try { localStorage.setItem(LS_WBUI, JSON.stringify({ boardWidth: boardWidth, railWidth: railWidth, railCollapsed: railCollapsed, controlsCollapsed: controlsCollapsed })); } catch (e) {} }

  // Two states only now (Sim/Both/Board buttons removed): board OPEN = rail | sim |
  // divider | board; board CLOSED = rail | sim(full). Widths are free-drag with tiny
  // floors so nothing snaps back. Persisted widths are re-clamped to the viewport.
  function applyLayout() {
    railEl.classList.toggle('collapsed', railCollapsed);
    if (railToggleEl) railToggleEl.innerHTML = railCollapsed ? '›' : '‹';
    if (boardToggleEl) boardToggleEl.innerHTML = boardOpen ? '›' : '‹';
    // rail width (when not collapsed)
    if (!railCollapsed) {
      var vw = document.documentElement.clientWidth;
      railWidth = Math.max(RAIL_MIN, Math.min(railWidth, vw - TOG_W - 120));
      railEl.style.flex = '0 0 ' + railWidth + 'px'; railEl.style.width = railWidth + 'px';
    }
    var railW = railCollapsed ? 0 : railWidth;
    if (!boardOpen) {
      dividerEl.classList.add('hidden'); boardColEl.classList.add('hidden'); mainEl.classList.remove('hidden');
      mainEl.style.flex = '1 1 auto'; mainEl.style.width = '';
    } else {
      mainEl.classList.remove('hidden'); boardColEl.classList.remove('hidden'); dividerEl.classList.remove('hidden');
      var avail = document.documentElement.clientWidth - railW - TOG_W - BTOG_W - DIV_W;
      var maxBoard = Math.max(BOARD_MIN, avail - SIM_MIN);
      var bw = Math.max(BOARD_MIN, Math.min(boardWidth, maxBoard));
      boardWidth = bw;
      var mw = Math.max(SIM_MIN, avail - bw);
      mainEl.style.flex = '0 0 ' + mw + 'px'; mainEl.style.width = mw + 'px';
      boardColEl.style.flex = '0 0 ' + bw + 'px'; boardColEl.style.width = bw + 'px';
    }
    requestAnimationFrame(function () { if (boardSurface) boardSurface.resize(); if (simSurface) simSurface.resize(); });
  }

  function setBoardOpen(open) {
    boardOpen = open;
    if (open && document.documentElement.clientWidth < 1100) railCollapsed = true;
    wbBtn.classList.toggle('on', open);
    applyLayout(); saveWbUI();
  }

  wbBtn.addEventListener('click', function () { setBoardOpen(!boardOpen); pmt('whiteboard_toggle', { open: boardOpen }); });

  // ── Rail handle: DRAG to resize the state rail, CLICK (barely moved) to collapse ──
  var railDrag = false, railStartX = 0, railStartW = 0, railMoved = false, railWasCol = false;
  railToggleEl.addEventListener('pointerdown', function (e) {
    railDrag = true; railMoved = false; railWasCol = railCollapsed;
    railStartX = e.clientX; railStartW = railCollapsed ? 0 : railWidth;
    railEl.style.transition = 'none';   // instant pointer tracking (restore on up → collapse still animates)
    try { railToggleEl.setPointerCapture(e.pointerId); } catch (_) {}
    document.body.classList.add('dragging'); e.preventDefault();
  });
  railToggleEl.addEventListener('pointermove', function (e) {
    if (!railDrag) return;
    if (!railMoved && Math.abs(e.clientX - railStartX) > 3) { railMoved = true; if (railCollapsed) railCollapsed = false; }
    if (railMoved) { railWidth = Math.max(RAIL_MIN, railStartW + (e.clientX - railStartX)); applyLayout(); }
  });
  railToggleEl.addEventListener('pointerup', function (e) {
    if (!railDrag) return;
    railDrag = false; try { railToggleEl.releasePointerCapture(e.pointerId); } catch (_) {}
    document.body.classList.remove('dragging');
    railEl.style.transition = '';   // restore the collapse animation for click-toggles
    if (!railMoved) { railCollapsed = !railWasCol; pmt('rail_toggle', { collapsed: railCollapsed }); applyLayout(); }
    saveWbUI();
  });

  // ── Sim | Whiteboard divider: free drag (tiny floors, no snap-back) ──
  var dragging = false, dragStartX = 0, dragStartBW = 0;
  dividerEl.addEventListener('pointerdown', function (e) { dragging = true; dragStartX = e.clientX; dragStartBW = boardWidth; try { dividerEl.setPointerCapture(e.pointerId); } catch (_) {} document.body.classList.add('dragging'); e.preventDefault(); });
  dividerEl.addEventListener('pointermove', function (e) { if (!dragging) return; boardWidth = dragStartBW + (dragStartX - e.clientX); applyLayout(); });
  dividerEl.addEventListener('pointerup', function (e) { if (!dragging) return; dragging = false; try { dividerEl.releasePointerCapture(e.pointerId); } catch (_) {} document.body.classList.remove('dragging'); saveWbUI(); });

  // ── Collapse the whole bottom control band (scrubbar + footer) for max sim ──
  var scrubbarEl = document.getElementById('scrubbar');
  var footerEl = document.querySelector('footer');
  var ctlToggleEl = document.getElementById('ctlToggle');
  function applyControls() {
    scrubbarEl.classList.toggle('collapsed', controlsCollapsed);
    if (footerEl) footerEl.classList.toggle('collapsed', controlsCollapsed);
    ctlToggleEl.innerHTML = controlsCollapsed ? '\\u25B4' : '\\u25BE';   // ▴ up (open) / ▾ down (close)
    ctlToggleEl.title = controlsCollapsed ? 'Show the controls' : 'Hide the controls (more room for the simulation)';
    requestAnimationFrame(function () { if (simSurface) simSurface.resize(); });
  }
  ctlToggleEl.addEventListener('click', function () { controlsCollapsed = !controlsCollapsed; pmt('controls_toggle', { collapsed: controlsCollapsed }); applyControls(); saveWbUI(); });

  // ── Full-screen the simulation ──
  // Full screen wraps #fsScope (stage + caption strip + collapsible scrubber/footer),
  // NOT just #stage, so the whole control band stays reachable in full screen instead of
  // being structurally outside the fullscreen subtree. #main's <header> is deliberately
  // left OUTSIDE #fsScope — it never shows in full screen (§3 of the design spec).
  var fsScopeEl = document.getElementById('fsScope');
  var fsBtn = document.getElementById('fsBtn');
  var fsIcon = document.getElementById('fsIcon');
  var fsCleanBtn = document.getElementById('fsCleanBtn');
  var fsPrevBtn = document.getElementById('fsPrevBtn');
  var fsNextBtn = document.getElementById('fsNextBtn');
  var fsStateReadout = document.getElementById('fsStateReadout');
  function inFullscreen() { return document.fullscreenElement || document.webkitFullscreenElement; }
  fsBtn.addEventListener('click', function () {
    pmt('fullscreen_toggle', { on: !inFullscreen() });
    if (!inFullscreen()) {
      if (fsScopeEl.requestFullscreen) fsScopeEl.requestFullscreen();
      else if (fsScopeEl.webkitRequestFullscreen) fsScopeEl.webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
  });

  // ── Next/Prev state chevrons (full-screen only, §4) — reuse the same nextVisible/
  // goToState the state-rail cards and ArrowLeft/ArrowRight already use, so a teacher's
  // saved reorder/hide layout (LS_LAYOUT) is respected identically everywhere.
  function updateFsNav() {
    if (!fsPrevBtn) return;
    fsPrevBtn.disabled = nextVisible(idx, -1) < 0;
    fsNextBtn.disabled = nextVisible(idx, 1) < 0;
    if (fsStateReadout) fsStateReadout.textContent = 'STATE ' + (idx + 1) + ' / ' + order.length;
  }
  fsPrevBtn.addEventListener('click', function () { armIdle(); var n = nextVisible(idx, -1); if (n >= 0) { pause(); goToState(n, false); } });
  fsNextBtn.addEventListener('click', function () { armIdle(); var n = nextVisible(idx, 1); if (n >= 0) { pause(); goToState(n, false); } });

  // ── Clean mode (§5) — strips the on-canvas caption/formula/HUD/sliders to a bare scene.
  // Independent of the #ctlToggle panel. Never persisted: onFsChange resets it to off on
  // every full-screen entry AND exit (founder decision, 2026-07-10).
  var cleanMode = false;
  function sendCleanMode(on) { post({ type: 'SET_CLEAN_MODE', on: on === true }); }
  function setCleanMode(on) {
    cleanMode = on === true;
    var capStripEl = document.getElementById('capStrip');
    if (capStripEl) capStripEl.classList.toggle('pm-clean-hide', cleanMode);
    if (fsCleanBtn) fsCleanBtn.classList.toggle('on', cleanMode);
    sendCleanMode(cleanMode);
  }
  fsCleanBtn.addEventListener('click', function () { pmt('clean_mode_toggle', { on: !cleanMode }); setCleanMode(!cleanMode); });

  // ── Idle auto-fade (§6) — chevrons/#fsBtn/#simPenBar dim after a few seconds of no
  // pointer activity on the wrapper; any movement restores them. Known accepted gap:
  // pointer movement INSIDE the #sim iframe doesn't bubble to this document (cross-frame
  // events don't cross), so resting the mouse over the sim itself (without touching a
  // control) won't reset the timer — deliberate interaction (chevrons/pen-bar/keys) does.
  var IDLE_MS = 3000, idleTimer = null;
  function armIdle() {
    if (idleTimer) clearTimeout(idleTimer);
    fsScopeEl.classList.remove('pm-idle');
    if (!inFullscreen()) return;
    idleTimer = setTimeout(function () { fsScopeEl.classList.add('pm-idle'); }, IDLE_MS);
  }
  function resetIdleTimer() {
    if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
    fsScopeEl.classList.remove('pm-idle');
    if (inFullscreen()) armIdle();
  }
  fsScopeEl.addEventListener('pointermove', armIdle);
  fsScopeEl.addEventListener('pointerdown', armIdle);
  fsScopeEl.addEventListener('touchstart', armIdle, { passive: true });

  function onFsChange() {
    var on = !!inFullscreen();
    fsScopeEl.classList.toggle('pm-fs', on);
    if (fsIcon) fsIcon.innerHTML = on ? '\\u2715' : '\\u26F6';   // ✕ exit / ⛶ enter
    fsBtn.childNodes[fsBtn.childNodes.length - 1].nodeValue = on ? ' Exit full screen' : ' Full screen';
    if (on) { controlsCollapsed = true; applyControls(); }   // full screen always opens minimal (§7) — not saveWbUI()'d
    setCleanMode(false);   // resets on both entry AND exit (founder decision, 2026-07-10)
    resetIdleTimer();
    updateFsNav();
    requestAnimationFrame(function () { if (simSurface) simSurface.resize(); });
  }
  document.addEventListener('fullscreenchange', onFsChange);
  document.addEventListener('webkitfullscreenchange', onFsChange);

  // ── Surfaces ────────────────────────────────────────────────────────────────
  loadWbUI();
  simSurface = makeSurface(simOverlayEl, { scrolls: false, onActivate: function () { lastSurface = simSurface; },
    onStroke: function (s) { pmt('pen_stroke', { surface: 'sim', at_ms: readSimTimeMs(), tool: s.tool, points: s.points.length }); } });
  boardSurface = makeSurface(wbCanvasEl, { scrolls: true, scrollEl: boardScrollEl, spacerEl: wbSpacerEl, persistKey: 'pm_wb_' + CONCEPT_ID, onActivate: function () { lastSurface = boardSurface; },
    onStroke: function (s) { pmt('pen_stroke', { surface: 'board', at_ms: readSimTimeMs(), tool: s.tool, points: s.points.length }); } });
  lastSurface = boardSurface;
  var restored = boardSurface.restore();
  boardScrollEl.addEventListener('scroll', function () { boardSurface.setScroll(boardScrollEl.scrollTop); });
  simOverlayEl.style.pointerEvents = 'none';   // start in Interact mode (sim draggable)
  try { new ResizeObserver(function () { if (simSurface) simSurface.resize(); }).observe(document.getElementById('stage')); } catch (e) {}
  window.addEventListener('resize', function () { applyLayout(); });

  // ── Pen toolbar (shared by both surfaces via TOOL) ───────────────────────────
  var SWATCHES = ['#111111', '#EF5350', '#FCD34D', '#66BB6A', '#5B8DEF', '#f5f5f5'];
  var swatchWrap = document.getElementById('wbSwatches');
  var colorInput = document.getElementById('wbColor');
  function refreshSwatchSel() {
    var els = swatchWrap.querySelectorAll('.swatch');
    for (var i = 0; i < els.length; i++) els[i].classList.toggle('sel', els[i].getAttribute('data-color') === TOOL.color);
    colorInput.value = (/^#[0-9a-fA-F]{6}$/.test(TOOL.color)) ? TOOL.color : '#111111';
  }
  for (var ci = 0; ci < SWATCHES.length; ci++) {
    (function (col) {
      var b = document.createElement('button');
      b.className = 'swatch'; b.setAttribute('data-color', col); b.style.background = col;
      b.title = col;
      b.addEventListener('click', function () { TOOL.color = col; isDefaultColor = false; refreshSwatchSel(); });
      swatchWrap.appendChild(b);
    })(SWATCHES[ci]);
  }
  colorInput.addEventListener('input', function () { TOOL.color = colorInput.value; isDefaultColor = false; refreshSwatchSel(); });

  function setTool(t) {
    TOOL.tool = t;
    document.getElementById('wbPenBtn').classList.toggle('on', t === 'pen');
    document.getElementById('wbHiBtn').classList.toggle('on', t === 'highlighter');
    document.getElementById('wbEraseBtn').classList.toggle('on', t === 'eraser');
  }
  document.getElementById('wbPenBtn').addEventListener('click', function () { setTool('pen'); });
  document.getElementById('wbHiBtn').addEventListener('click', function () { setTool('highlighter'); });
  document.getElementById('wbEraseBtn').addEventListener('click', function () { setTool('eraser'); });

  var sizeBtns = document.querySelectorAll('#boardToolbar [data-size]');
  for (var si = 0; si < sizeBtns.length; si++) {
    (function (btn) {
      btn.addEventListener('click', function () {
        TOOL.size = parseFloat(btn.getAttribute('data-size')) || 3;
        for (var j = 0; j < sizeBtns.length; j++) sizeBtns[j].classList.toggle('on', sizeBtns[j] === btn);
      });
    })(sizeBtns[si]);
  }

  document.getElementById('wbUndoBtn').addEventListener('click', function () { (lastSurface || boardSurface).undo(); });
  document.getElementById('wbRedoBtn').addEventListener('click', function () { (lastSurface || boardSurface).redo(); });
  document.getElementById('wbClearBtn').addEventListener('click', function () { boardSurface.clear(); });
  document.getElementById('wbThemeBtn').addEventListener('click', function () {
    var dark = !boardSurface.isDark();
    boardSurface.setDark(dark);
    if (isDefaultColor) { TOOL.color = dark ? COLOR_DARK : COLOR_LIGHT; refreshSwatchSel(); }
    saveWbUI();
  });

  // ── Sim Draw / Interact toggle (scoped to the sim only) ──────────────────────
  // The pen is shared, but the two surfaces have opposite backgrounds: the board
  // is a white page (black ink reads best) while the sim is a dark 3D scene
  // (black ink is invisible). So while the teacher hasn't deliberately chosen a
  // colour, the default flips to a bright ink on the sim and back to page-contrast
  // ink on the board. A colour they DID pick is kept on both.
  var simDrawMode = false;
  var SIM_DEFAULT_COLOR = '#EF5350';   // red — visible on the dark sim, distinct from the blue field + amber v
  var stageEl = document.getElementById('stage');
  var simMoveBtn = document.getElementById('simMoveBtn');
  var simDrawBtn = document.getElementById('simDrawBtn');
  function boardDefaultColor() { return boardSurface.isDark() ? COLOR_DARK : COLOR_LIGHT; }
  function setSimDraw(on) {
    simDrawMode = on;
    simOverlayEl.style.pointerEvents = on ? 'auto' : 'none';   // auto = overlay captures the pen, sim can't be dragged
    stageEl.classList.toggle('sim-draw', on);                   // red border + crosshair + "sim locked" banner
    simDrawBtn.classList.toggle('on', on);
    simMoveBtn.classList.toggle('on', !on);
    if (isDefaultColor) { TOOL.color = on ? SIM_DEFAULT_COLOR : boardDefaultColor(); refreshSwatchSel(); }
    if (on) { lastSurface = simSurface; freeze(); }             // annotate a still frame (Rule 26b path)
  }
  simDrawBtn.addEventListener('click', function () { pmt('pen_used', { surface: 'sim' }); setSimDraw(true); });
  simMoveBtn.addEventListener('click', function () { setSimDraw(false); });
  document.getElementById('simClearBtn').addEventListener('click', function () { simSurface.clear(); });

  // Restore saved page theme + apply default colour for it
  if (restored && restored.theme === 'dark') { boardSurface.setDark(true); if (isDefaultColor) TOOL.color = COLOR_DARK; }
  refreshSwatchSel();

  // Ctrl+Z / Ctrl+Shift+Z (toolbar buttons cover the case where the iframe has focus)
  window.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) { e.preventDefault(); if (e.shiftKey) (lastSurface || boardSurface).redo(); else (lastSurface || boardSurface).undo(); }
    else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) { e.preventDefault(); (lastSurface || boardSurface).redo(); }
  });

  // Debug hook for verification (no effect on UX)
  window.PM_wb_count = function () { return { board: boardSurface.count(), sim: simSurface.count(), simDraw: simDrawMode, boardOpen: boardOpen }; };

  applyLayout();
  applyControls();

  // Initial paint (rail + mute) in case SIM_READY already fired before this ran.
  buildRail();
  applyMuteUI();
  applySubs();
  updateSaveBtn(false);
  startLoop();
  if (iframe.contentWindow) { post({ type: 'PING' }); }
</script>
</body></html>
`;
}

// ── Catalog page ─────────────────────────────────────────────────────────────

function rebuildCatalog(): void {
    // Professor-facing pilot catalog: ONLY founder-approved (baseline-locked)
    // concepts are listed, grouped by NCERT chapter, with client-side search.
    type Entry = { id: string; name: string; chapter: number | null; section: string | null; classLevel: number | null };
    const entries: Entry[] = [];
    if (existsSync(OUT_DIR)) {
        for (const dirent of readdirSync(OUT_DIR, { withFileTypes: true })) {
            if (!dirent.isDirectory()) continue;
            const metaPath = join(OUT_DIR, dirent.name, 'meta.json');
            if (!existsSync(metaPath)) continue;
            if (!isPilotConcept(ROOT, dirent.name)) continue;   // founder-approved only
            try {
                const meta = JSON.parse(readFileSync(metaPath, 'utf-8')) as {
                    concept_id?: string;
                    concept_name?: string;
                    chapter?: number | null;
                    section?: string | null;
                    class_level?: number | null;
                };
                entries.push({
                    id: dirent.name,
                    name: meta.concept_name ?? dirent.name,
                    chapter: typeof meta.chapter === 'number' ? meta.chapter : null,
                    section: typeof meta.section === 'string' ? meta.section : null,
                    classLevel: typeof meta.class_level === 'number' ? meta.class_level : null,
                });
            } catch {
                entries.push({ id: dirent.name, name: dirent.name, chapter: null, section: null, classLevel: null });
            }
        }
    }

    // Sort within a chapter by NCERT section ("1.16" → [1,16]), then name.
    const sectionKey = (s: string | null): number[] =>
        (s ?? '').split('.').map((p) => parseInt(p, 10)).map((n) => (Number.isFinite(n) ? n : 0));
    const bySection = (a: Entry, b: Entry): number => {
        const ka = sectionKey(a.section), kb = sectionKey(b.section);
        for (let i = 0; i < Math.max(ka.length, kb.length); i++) {
            const d = (ka[i] ?? 0) - (kb[i] ?? 0);
            if (d !== 0) return d;
        }
        return a.name.localeCompare(b.name);
    };

    // Group by (class_level, chapter); un-tagged concepts land in "Other" at the end.
    const groups = new Map<string, { title: string; sortKey: number; items: Entry[] }>();
    for (const e of entries) {
        const key = `${e.classLevel ?? 99}::${e.chapter ?? 999}`;
        if (!groups.has(key)) {
            groups.set(key, {
                title: chapterTitle(e.chapter ?? undefined, e.classLevel ?? undefined),
                sortKey: (e.classLevel ?? 99) * 1000 + (e.chapter ?? 999),
                items: [],
            });
        }
        groups.get(key)!.items.push(e);
    }
    const ordered = [...groups.values()].sort((a, b) => a.sortKey - b.sortKey);

    const chapterBlocks = ordered
        .map((g) => {
            const cards = g.items
                .sort(bySection)
                .map(
                    (e) => `    <a class="card" data-search="${escapeHtml(`${e.name} ${e.id} ${g.title}`.toLowerCase())}" data-concept="${escapeHtml(e.id)}" href="./${encodeURIComponent(e.id)}/">
      <span class="t">${escapeHtml(e.name)}</span>
      <span class="arrow">&#8594;</span>
    </a>`,
                )
                .join('\n');
            return `  <section class="chapter">
    <h2>${escapeHtml(g.title)}<span class="count">${g.items.length}</span></h2>
${cards}
  </section>`;
        })
        .join('\n');

    // Chapter options for the profile panel's "teaching next" select (mirrors welcome.html).
    const profileChapterOptions = Object.entries(CLASS12_CHAPTER_NAMES)
        .map(([n, name]) => `<option value="Ch.${n} ${name}">Ch.${n} — ${name}</option>`)
        .join('');

    const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Viditra — Simulation Library</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
${pilotHeadTags(0)}
<style>
  :root{ --bg:#1C1B19; --surface:#262523; --surface-2:#302E2B; --clay:#CB6843; --clay-soft:#E3A07F;
         --clay-wash:rgba(203,104,67,.15); --sage:#74B594; --ink:#ECE9E2; --ink-dim:#A8A299; --ink-faint:#726C63;
         --line:rgba(245,240,230,.10); --clay-deep:#B0532E; --red:#E06A52;
         --font-disp:"Fraunces",Georgia,"Times New Roman",serif; --font-ui:"Inter",system-ui,-apple-system,sans-serif; }
  *{box-sizing:border-box;}
  html,body{margin:0;min-height:100%;background:var(--bg);color:var(--ink);font-family:var(--font-ui);-webkit-font-smoothing:antialiased;}
  body::before{content:"";position:fixed;inset:0;z-index:0;pointer-events:none;
    background:radial-gradient(46% 38% at 100% 0%, rgba(203,104,67,.07), transparent 60%),
               radial-gradient(40% 32% at 0% 100%, rgba(116,181,148,.04), transparent 60%);}
  .wrap{position:relative;z-index:1;max-width:780px;margin:0 auto;padding:34px 20px 60px;}
  .masthead{display:flex;align-items:center;gap:12px;}
  .masthead .mark{width:38px;height:38px;border-radius:11px;background:var(--clay);flex:none;
        display:grid;place-items:center;box-shadow:0 6px 18px -6px rgba(203,104,67,.55);}
  .masthead .mark svg{width:22px;height:22px;}
  .brand b{font-family:var(--font-disp);font-weight:600;font-size:18px;letter-spacing:-.01em;color:var(--ink);display:block;line-height:1;}
  .brand span{font-size:8.5px;letter-spacing:.22em;text-transform:uppercase;color:var(--ink-faint);margin-top:4px;display:block;}
  .who{position:relative;margin-left:auto;display:flex;align-items:center;gap:12px;font-size:12.5px;color:var(--ink-dim);}
  .who button{border:1px solid var(--line);background:none;color:var(--ink-dim);font-size:12px;padding:6px 13px;
        border-radius:9px;cursor:pointer;font-family:var(--font-ui);transition:border-color .15s ease,color .15s ease;}
  .who button:hover{border-color:rgba(203,104,67,.5);color:var(--clay-soft);}
  h1{font-family:var(--font-disp);font-size:22px;font-weight:600;color:var(--ink);margin:26px 0 4px;}
  p.sub{color:var(--ink-dim);font-size:13px;margin:0 0 20px;}
  #search{width:100%;padding:12px 15px;border-radius:12px;border:1px solid var(--line);background:var(--surface);
        color:var(--ink);font-size:14px;font-family:var(--font-ui);outline:none;margin-bottom:26px;}
  #search:focus{border-color:rgba(203,104,67,.5);}
  #search::placeholder{color:var(--ink-faint);}
  .chapter{margin-bottom:26px;}
  .chapter h2{font-family:var(--font-disp);font-size:15px;font-weight:600;color:var(--clay-soft);margin:0 0 10px;
        display:flex;align-items:center;gap:9px;}
  .chapter h2 .count{font-family:var(--font-ui);font-size:11px;font-weight:600;color:var(--ink-faint);
        border:1px solid var(--line);border-radius:999px;padding:2px 9px;}
  .card{display:flex;align-items:center;gap:10px;padding:13px 17px;margin-bottom:9px;background:var(--surface);
        border:1px solid var(--line);border-radius:13px;text-decoration:none;color:var(--ink);
        transition:border-color .16s ease, background .16s ease;}
  .card:hover{border-color:rgba(203,104,67,.4);background:var(--surface-2);}
  .card .t{font-family:var(--font-disp);font-size:15.5px;font-weight:600;flex:1 1 auto;}
  .card .arrow{color:var(--ink-faint);font-size:15px;transition:color .16s ease, transform .16s ease;}
  .card:hover .arrow{color:var(--clay-soft);transform:translateX(3px);}
  .empty{color:var(--ink-dim);font-size:14px;}
  #noresults{display:none;color:var(--ink-dim);font-size:14px;padding:8px 2px;}
  #earlyNote{display:flex;align-items:center;gap:11px;padding:11px 15px;margin:0 0 18px;
        background:var(--clay-wash);border:1px solid rgba(203,104,67,.35);border-radius:12px;}
  #earlyNote .txt{flex:1 1 auto;font-size:12.5px;line-height:1.5;color:var(--ink-dim);}
  #earlyNote .txt b{color:var(--clay-soft);font-weight:600;}
  #earlyNote button{flex:none;border:none;background:none;color:var(--ink-faint);font-size:17px;line-height:1;
        padding:2px 6px;cursor:pointer;border-radius:7px;transition:color .15s ease;}
  #earlyNote button:hover{color:var(--clay-soft);}
  .who .chip{font-size:11px;font-weight:600;color:var(--clay-soft);border:1px solid rgba(203,104,67,.4);
        border-radius:999px;padding:3px 10px;background:var(--clay-wash);}
  /* default OFF via display:none (an author rule beats the hidden attribute regardless of
     specificity, so relying on it alone would show this immediately at parse time and race
     its own fade against the auth-gate reveal delay). JS adds .show at the exact moment the
     profile is confirmed, which is what actually starts the clock. */
  #pmSplash{position:fixed;inset:0;z-index:99995;display:none;place-items:center;background:var(--bg);}
  #pmSplash.show{display:grid;animation:pmSplashFade 2.1s ease forwards;}
  #pmSplash .sc{text-align:center;display:grid;place-items:center;gap:14px;}
  #pmSplash .mark{width:56px;height:56px;border-radius:16px;background:var(--clay);display:grid;place-items:center;
        box-shadow:0 10px 30px -8px rgba(203,104,67,.6);}
  #pmSplash .mark svg{width:32px;height:32px;}
  #pmSplash .nm{font-family:var(--font-disp);font-size:26px;font-weight:600;color:var(--ink);}
  #pmSplash .pw{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-faint);}
  #pmSplash .pw b{color:var(--clay-soft);font-weight:600;}
  /* ── First-login brand intro (4s silent video, once ever; above the splash) ── */
  @font-face{font-family:'Space Grotesk';font-style:normal;font-weight:300 700;font-display:swap;
    src:url('./space-grotesk-latin.woff2') format('woff2');}
  #pmIntro{position:fixed;inset:0;z-index:99996;display:none;background:#1C1B19;opacity:1;transition:opacity .5s ease;}
  #pmIntro.show{display:block;}
  #pmIntro.gone{display:block;opacity:0;pointer-events:none;}   /* keep display so the .5s fade actually runs */
  #pmIntroStage{position:absolute;inset:0;}
  #pmIntroStage svg{width:100%;height:100%;display:block;}
  #pmIntroSound{position:absolute;left:18px;bottom:16px;width:38px;height:38px;border-radius:19px;cursor:pointer;
    border:1px solid var(--line);background:rgba(0,0,0,.35);color:var(--ink-dim);display:grid;place-items:center;}
  #pmIntroSound:hover{color:var(--ink);border-color:rgba(203,104,67,.5);}
  #pmIntroSound.blocked{animation:pmSndPulse 2s ease-in-out infinite;}
  @keyframes pmSndPulse{0%,100%{box-shadow:0 0 0 0 rgba(203,104,67,0);}
    50%{box-shadow:0 0 0 8px rgba(203,104,67,.18);border-color:rgba(203,104,67,.6);}}
  #pmIntroSkip{position:absolute;right:18px;bottom:16px;border:1px solid var(--line);background:rgba(0,0,0,.35);
        color:var(--ink-dim);font:600 12px var(--font-ui);padding:6px 15px;border-radius:9px;cursor:pointer;
        transition:color .15s ease,border-color .15s ease;}
  #pmIntroSkip:hover{color:var(--ink);border-color:rgba(203,104,67,.5);}
  /* ── Account menu — Claude-style dropdown (click your avatar) ── */
  #pmTourLink{display:none !important;}   /* folded into the account menu (still clicked programmatically) */
  #pmAcct{display:inline-flex;align-items:center;gap:9px;border:1px solid var(--line);background:var(--surface);
        color:var(--ink);cursor:pointer;padding:5px 10px 5px 5px;border-radius:12px;font-family:var(--font-ui);
        transition:border-color .15s ease,background .15s ease;}
  #pmAcct:hover{border-color:rgba(203,104,67,.45);background:var(--surface-2);}
  #pmAcct .pmAvatar{width:30px;height:30px;flex:none;border-radius:9px;background:var(--clay);color:#fff;
        font-family:var(--font-disp);font-weight:600;font-size:15px;line-height:1;display:grid;place-items:center;
        box-shadow:0 4px 12px -5px rgba(203,104,67,.7);}
  #pmAcct .pmAcctText{display:flex;flex-direction:column;align-items:flex-start;gap:1px;line-height:1.15;text-align:left;}
  #pmAcct .pmAcctName{font-size:12.5px;font-weight:600;color:var(--ink);max-width:160px;overflow:hidden;
        text-overflow:ellipsis;white-space:nowrap;}
  #pmAcct .pmAcctSub{font-size:10.5px;font-weight:500;color:var(--clay-soft);}
  #pmAcct .pmAcctCh{font-size:9px;color:var(--ink-faint);transition:transform .15s ease;}
  #pmAcct[aria-expanded="true"] .pmAcctCh{transform:rotate(180deg);}
  #pmAcct.nomenu{cursor:default;}
  #pmAcct.nomenu:hover{border-color:var(--line);background:var(--surface);}
  #pmAcct.nomenu .pmAcctCh{display:none;}
  #pmAcctMenu{position:absolute;right:0;top:calc(100% + 8px);z-index:9999;width:272px;max-width:calc(100vw - 24px);
        background:var(--surface);border:1px solid var(--line);border-radius:15px;padding:6px;
        box-shadow:0 24px 55px -26px rgba(0,0,0,.9),0 6px 16px -10px rgba(0,0,0,.7);
        opacity:0;transform:translateY(-6px) scale(.98);transform-origin:top right;pointer-events:none;
        transition:opacity .14s ease,transform .14s ease;}
  #pmAcctMenu.open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}
  #pmAcctMenu .pmMenuEmail{padding:9px 11px 8px;font-size:11.5px;color:var(--ink-faint);
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  #pmAcctMenu .pmMenuGroup{padding:4px 0;border-top:1px solid var(--line);}
  #pmAcctMenu .pmMenuRow{display:flex;align-items:center;gap:11px;width:100%;box-sizing:border-box;border:0;
        background:none;color:var(--ink);font:500 13px var(--font-ui);text-align:left;text-decoration:none;
        padding:9px 11px;border-radius:9px;cursor:pointer;transition:background .12s ease,color .12s ease;}
  #pmAcctMenu .pmMenuRow:hover{background:var(--surface-2);color:var(--clay-soft);}
  #pmAcctMenu .pmMenuRow .pmIco{width:16px;height:16px;flex:none;opacity:.8;}
  #pmAcctMenu .pmMenuRow.pmDanger:hover{background:rgba(224,106,82,.12);color:var(--red);}
  @media (prefers-reduced-motion: reduce){ #pmAcctMenu{transition:none;} #pmAcct .pmAcctCh{transition:none;} }
  #pmProfOvl{position:fixed;inset:0;z-index:99992;display:none;place-items:center;background:rgba(0,0,0,.5);padding:20px;}
  #pmProfOvl.open{display:grid;}
  #pmProfCard{width:min(94vw,430px);background:var(--surface);color:var(--ink);border:1px solid var(--line);
        border-radius:16px;padding:24px 24px 20px;box-shadow:0 24px 60px -30px rgba(0,0,0,.85);font-family:var(--font-ui);}
  #pmProfCard h2{margin:0 0 3px;font-family:var(--font-disp);font-size:18px;font-weight:600;}
  #pmProfCard .psub{margin:0 0 16px;font-size:12.5px;color:var(--ink-dim);}
  #pmProfCard label{display:block;font-size:11.5px;font-weight:600;color:var(--ink-dim);margin:13px 0 6px;letter-spacing:.02em;}
  #pmProfCard input,#pmProfCard select{width:100%;box-sizing:border-box;padding:10px 12px;border-radius:10px;
        border:1px solid var(--line);background:var(--surface-2);color:var(--ink);font-size:13.5px;font-family:var(--font-ui);outline:none;}
  #pmProfCard input:focus,#pmProfCard select:focus{border-color:rgba(203,104,67,.55);}
  .pTrial{margin:15px 0 4px;padding:9px 12px;border-radius:10px;background:var(--clay-wash);
        border:1px solid rgba(203,104,67,.3);font-size:12.5px;color:var(--clay-soft);font-weight:600;}
  .pRow{display:flex;gap:9px;margin-top:16px;}
  .pRow button{flex:1 1 auto;padding:10px;border-radius:10px;font:600 13px var(--font-ui);cursor:pointer;}
  #pmProfSave{border:0;background:var(--clay);color:#fff;}
  #pmProfSave:hover{background:var(--clay-deep);}
  #pmProfSave:disabled{opacity:.5;cursor:default;}
  #pmProfCancel{border:1px solid var(--line);background:none;color:var(--ink-dim);}
  #pmProfCancel:hover{color:var(--ink);}
  .pLinks{display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding-top:14px;border-top:1px solid var(--line);}
  .pLinks button{border:0;background:none;font:inherit;font-size:12.5px;cursor:pointer;padding:4px 2px;font-family:var(--font-ui);}
  #pmProfTour{color:var(--clay-soft);}
  #pmProfTour:hover{text-decoration:underline;}
  #pmProfSignOut{color:var(--ink-faint);}
  #pmProfSignOut:hover{color:var(--red);}
  #pmProfErr{display:none;margin-top:12px;padding:8px 11px;border-radius:9px;font-size:12px;
        color:#F3C9BE;background:rgba(224,106,82,.12);border:1px solid rgba(224,106,82,.4);}
  #pmProfOk{display:none;margin-top:12px;padding:8px 11px;border-radius:9px;font-size:12px;
        color:#d3efdd;background:rgba(116,181,148,.12);border:1px solid rgba(116,181,148,.4);}
  @keyframes pmSplashFade{0%{opacity:0;}12%{opacity:1;}78%{opacity:1;}100%{opacity:0;visibility:hidden;}}
</style>
</head>
<body>
<!-- Boot curtain — first paint is this flat brand-dark layer, so the catalog never
     flashes before the intro. playIntro() drops it as the sting starts; every
     no-brand-moment path (dev, no profile, errors) dismisses it; and an inline 8s
     failsafe below guarantees nobody is ever trapped even if the main script dies. -->
<div id="pmBoot"></div>
<style>
  #pmBoot{position:fixed;inset:0;z-index:99997;background:#1C1B19;opacity:1;transition:opacity .6s ease;}
  #pmBoot.gone{opacity:0;pointer-events:none;}
  #pmBootHint{position:absolute;left:50%;bottom:14%;transform:translateX(-50%);
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:12px;
    letter-spacing:.16em;text-transform:uppercase;color:rgba(245,239,232,.5);
    opacity:0;animation:pmHintIn .9s ease .6s forwards;pointer-events:none;}
  @keyframes pmHintIn{to{opacity:1;}}
</style>
<script>
  // Is this an ARRIVAL? Decided here — inline, right after #pmBoot, BEFORE first paint — so that
  // coming back out of a sim the dark curtain never even paints and she lands straight on her
  // catalog. A sim page stamps pm_from_sim on load; finding it means she is RETURNING, not
  // arriving. Read once, then clear, so the very next reload brands normally again. Any other
  // entry (login redirect, fresh open, reload) has no marker → the brand moment plays.
  window.__pmSkipBrand = false;
  try {
    window.__pmSkipBrand = sessionStorage.getItem('${PM_FROM_SIM_KEY}') === '1';
    sessionStorage.removeItem('${PM_FROM_SIM_KEY}');
  } catch (e) {}
  // bfcache restore: this document never re-executes, so nothing above runs and no brand replays —
  // but the marker would go stale and swallow the NEXT real reload's brand moment. Clearing it on
  // every pageshow (the one event bfcache does fire) keeps the handshake honest either way.
  window.addEventListener('pageshow', function () {
    try { sessionStorage.removeItem('${PM_FROM_SIM_KEY}'); } catch (e) {}
  });
  if (window.__pmSkipBrand) {
    var b0 = document.getElementById('pmBoot');
    if (b0 && b0.parentNode) b0.parentNode.removeChild(b0);
  }
  window.__pmBootKill = setTimeout(function () {
    var b = document.getElementById('pmBoot');
    if (b) { b.className = 'gone'; setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 700); }
  }, 8000);
</script>
<div class="wrap">
  <div class="masthead">
    <div class="mark"><svg viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="12" rx="9.6" ry="4" stroke="#fff" stroke-width="1.5" transform="rotate(45 12 12)"/><ellipse cx="12" cy="12" rx="9.6" ry="4" stroke="#fff" stroke-width="1.5" transform="rotate(135 12 12)"/><circle cx="18.79" cy="18.79" r="1.5" fill="#fff"/><circle cx="5.21" cy="5.21" r="1.5" fill="#fff"/><circle cx="12" cy="12" r="2.3" fill="#fff"/></svg></div>
    <div class="brand"><b>Viditra</b><span>Teacher Edition</span></div>
    <div class="who">
      <button id="pmAcct" type="button" aria-haspopup="menu" aria-expanded="false" hidden>
        <span class="pmAvatar" id="pmAcctAvatar" aria-hidden="true"></span>
        <span class="pmAcctText"><span class="pmAcctName" id="pmAcctName"></span><span class="pmAcctSub" id="pmAcctSub" hidden></span></span>
        <span class="pmAcctCh" aria-hidden="true">&#9662;</span>
      </button>
      <div id="pmAcctMenu" role="menu" aria-label="Your account">
        <div class="pmMenuEmail" id="pmAcctEmail" hidden></div>
        <div class="pmMenuGroup">
          <button class="pmMenuRow" id="pmMenuProfile" type="button" role="menuitem" hidden><svg class="pmIco" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H8a1.65 1.65 0 0 0 1-1.51V2a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V8a1.65 1.65 0 0 0 1.51 1H22a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>My profile &amp; settings</button>
          <button class="pmMenuRow" id="pmMenuTour" type="button" role="menuitem"><svg class="pmIco" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>Replay guided tour</button>
          <a class="pmMenuRow" id="pmMenuHelp" href="mailto:pradeep@viditra.co" role="menuitem"><svg class="pmIco" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>Get help</a>
        </div>
        <div class="pmMenuGroup">
          <a class="pmMenuRow" id="pmMenuPlans" href="https://viditra.co/#pricing" target="_blank" rel="noopener" role="menuitem"><svg class="pmIco" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c.4 3.8 1.2 4.6 5 5-3.8.4-4.6 1.2-5 5-.4-3.8-1.2-4.6-5-5 3.8-.4 4.6-1.2 5-5z"/></svg>View plans</a>
        </div>
        <div class="pmMenuGroup">
          <button class="pmMenuRow pmDanger" id="pmMenuSignOut" type="button" role="menuitem"><svg class="pmIco" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>Sign out</button>
        </div>
      </div>
    </div>
  </div>
  <h1 id="catTitle">Simulation Library</h1>
  <p class="sub">Class 12 Physics &middot; ${entries.length} simulation${entries.length === 1 ? '' : 's'} &middot; open one and teach with it.</p>
  <div id="earlyNote" hidden>
    <span class="txt"><b>Early access</b> &mdash; new simulations are added regularly, and your feedback shapes what we build next.</span>
    <button id="earlyNoteX" title="Dismiss" aria-label="Dismiss">&times;</button>
  </div>
  <input id="search" type="search" placeholder="Search simulations… (e.g. flux, magnetic force, Gauss)" autocomplete="off">
  <div id="noresults">No simulations match that search.</div>
${chapterBlocks || '  <p class="empty">No simulations published yet.</p>'}
</div>
<div id="pmSplash" hidden><div class="sc">
  <div class="mark"><svg viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="12" rx="9.6" ry="4" stroke="#fff" stroke-width="1.5" transform="rotate(45 12 12)"/><ellipse cx="12" cy="12" rx="9.6" ry="4" stroke="#fff" stroke-width="1.5" transform="rotate(135 12 12)"/><circle cx="18.79" cy="18.79" r="1.5" fill="#fff"/><circle cx="5.21" cy="5.21" r="1.5" fill="#fff"/><circle cx="12" cy="12" r="2.3" fill="#fff"/></svg></div>
  <div class="nm" id="pmSplashName"></div>
  <div class="pw">powered by <b>Viditra</b></div>
</div></div>
<div id="pmIntro" hidden>
  <div id="pmIntroStage"></div>
  <button id="pmIntroSound" type="button" aria-label="Toggle sound"></button>
  <button id="pmIntroSkip" type="button">Skip &rsaquo;</button>
</div>
<div id="pmProfOvl"><div id="pmProfCard" role="dialog" aria-modal="true" aria-label="My profile">
  <h2>My profile</h2>
  <p class="psub">This is your teaching space. Update it anytime.</p>
  <label for="pfName">Your name (as your students know you)</label>
  <input id="pfName" type="text" maxlength="80">
  <label for="pfSchool">School / institute</label>
  <input id="pfSchool" type="text" maxlength="120">
  <label for="pfTeaches">What you teach</label>
  <input id="pfTeaches" type="text" maxlength="120" placeholder="e.g. Class 12 Physics · JEE/NEET">
  <label for="pfChapter">Teaching next</label>
  <select id="pfChapter"><option value="">Choose…</option>${profileChapterOptions}<option value="Other">Other / Class 11</option></select>
  <div class="pTrial" id="pfTrial"></div>
  <div id="pmProfErr"></div>
  <div id="pmProfOk"></div>
  <div class="pRow">
    <button id="pmProfCancel" type="button">Cancel</button>
    <button id="pmProfSave" type="button">Save changes</button>
  </div>
  <div class="pLinks">
    <button id="pmProfTour" type="button">&#65311; Replay tour</button>
    <button id="pmProfSignOut" type="button">Sign out</button>
  </div>
</div></div>
<script>
(function () {
  window.PM_CONCEPT_ID = null;
  function pmt(type, payload) { try { if (window.PM && PM.track) PM.track(type, payload || {}); } catch (e) {} }
  pmt('catalog_open', { returning: !!window.__pmSkipBrand });   // true = came back out of a sim, not a fresh arrival
  // Early-access note: shows until dismissed once, then never again (per browser).
  try {
    var noteEl = document.getElementById('earlyNote');
    if (noteEl && !localStorage.getItem('pm_early_note_dismissed')) {
      noteEl.hidden = false;
      document.getElementById('earlyNoteX').addEventListener('click', function () {
        noteEl.hidden = true;
        try { localStorage.setItem('pm_early_note_dismissed', '1'); } catch (e2) {}
        pmt('early_note_dismiss', {});
      });
    }
  } catch (e) {}
  // ── Account trigger (avatar + name + trial) ──
  function acctInitial(name, email) {
    var s = (name || email || '').replace(/^\\s+/, '');
    return s ? s.charAt(0).toUpperCase() : '•';
  }
  function setAcct(o) {
    var a = document.getElementById('pmAcct'); if (!a) return;
    var nm = document.getElementById('pmAcctName'); if (nm) nm.textContent = o.name || '';
    var sub = document.getElementById('pmAcctSub'); if (sub) { sub.textContent = o.sub || ''; sub.hidden = !o.sub; }
    var av = document.getElementById('pmAcctAvatar'); if (av) av.textContent = o.avatar || acctInitial(o.name, o.email);
    var em = document.getElementById('pmAcctEmail'); if (em) { em.textContent = o.email || ''; em.hidden = !o.email; }
    var pr = document.getElementById('pmMenuProfile'); if (pr) pr.hidden = !o.showProfile;
    if (o.menu === false) a.classList.add('nomenu'); else a.classList.remove('nomenu');
    a.hidden = false;
  }
  if (window.PM_DEV) {
    setAcct({ name: 'Local preview', sub: 'dev — no login, no tracking', avatar: '•', menu: false, showProfile: false });
    pmBootDismiss();   // dev preview: no brand moment, reveal immediately
  } else if (window.PM && PM.authReady) PM.authReady.then(function (u) {
    var p = window.PM_PROFILE;
    var m = (u && u.user_metadata) || {};
    var staff = m.role === 'founder' || m.staff === true;
    var hasProfile = !!(p && p.display_name);
    var name = (hasProfile && p.display_name) || m.display_name || (u && u.email) || 'Teacher';
    var email = (u && u.email) || '';
    var sub = '';
    if (hasProfile && window.PM_TRIAL_END) {
      var days = Math.max(0, Math.ceil((window.PM_TRIAL_END - Date.now()) / 86400000));
      sub = 'Trial · ' + days + ' day' + (days === 1 ? '' : 's') + ' left';
    } else if (staff) { sub = 'Staff · not tracked'; }
    setAcct({ name: name, sub: sub, email: email, menu: true, showProfile: hasProfile });
    // ── The hero surface: her name on her product (profile-gated; dev/staff see the generic title) ──
    var brandMomentStarted = false;
    if (hasProfile) {
      try { document.getElementById('catTitle').textContent = p.display_name + '’s Class'; } catch (e) {}
      try {
        // Brand moment — a SEQUENCE on every ARRIVAL (founder 2026-07-12, scoped 2026-07-17):
        // the Viditra intro sting plays FIRST, then the personalized "{Name}'s Class" splash
        // crossfades in. Fires on login / fresh open / reload of the catalog, but NOT on a back
        // traversal out of a sim (__pmSkipBrand, set pre-paint above) — she never left. Two
        // guards: the per-page-load window flag stops a double-fire if authReady resolves twice
        // in one load; __pmSkipBrand stops the replay-on-Back.
        if (!window.__pmBrandMomentPlayed && !window.__pmSkipBrand) {
          window.__pmBrandMomentPlayed = true;
          brandMomentStarted = true;
          var splashName = p.display_name + '’s Class';
          playIntro(function () { showSplash(splashName); });
        }
      } catch (e) {}
    }
    if (!brandMomentStarted) pmBootDismiss();   // no intro on this path — reveal the catalog
  }, function () { pmBootDismiss(); });          // auth failed — never leave the curtain up
  else pmBootDismiss();                          // no auth layer at all — plain static build

  // ── Boot-curtain dismissal — used by every path that does NOT play the intro.
  //    (playIntro drops the curtain itself once the sting is rendering underneath.)
  function pmBootDismiss() {
    try { clearTimeout(window.__pmBootKill); } catch (e) {}
    var b = document.getElementById('pmBoot');
    if (b) { b.className = 'gone'; setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 700); }
  }

  // ── Brand intro (~4s Viditra sting). Plays on every page load (see the
  //    __pmBrandMomentPlayed per-load guard above), then hands off to the splash; click /
  //    Skip / end / a 6s failsafe all dismiss it; autoplay-block falls through gracefully
  //    so a teacher is never stuck behind a frozen curtain. ──
  // ── The "{Name}'s Class · powered by Viditra" splash — plays AFTER the intro. ──
  function showSplash(name) {
    var sp = document.getElementById('pmSplash');
    if (!sp) return;
    var nmEl = document.getElementById('pmSplashName');
    if (nmEl) nmEl.textContent = name;
    sp.className = 'show';   // starts the 2.1s fade NOW — not at page-parse time
    setTimeout(function () { if (sp.parentNode) sp.parentNode.removeChild(sp); }, 2300);
    pmt('splash_shown', {});
  }

  // ── Intro engine — native SVG + Web-Audio port of the brand artifact
  //    ("Viditra Intro (standalone).html"). No video file, no audio file: the scene is
  //    drawn per-frame into #pmIntroStage and every sound is synthesized (warm bells as
  //    the orbits draw on, a water-drop bloop at the nucleus pop, whoosh + cushioned
  //    landing for the clay tile, an airy swish on the slide). Formulas follow the
  //    artifact, with its documented intent RESTORED where its own clamp bug had lost it:
  //    the three orbits draw themselves on over 0.15–1.5s (electrons riding each arc tip,
  //    then blending into the orbital spin) instead of popping in fully formed
  //    (premium pass, founder 2026-07-12). Full-bleed: the scene covers the viewport via
  //    preserveAspectRatio slice on landscape screens (meet on portrait/extreme ratios).
  //    Browsers gate audio on a user gesture: with none yet the sting starts silent, ANY
  //    first click/keypress unlocks it mid-play, and the speaker toggle (bottom-left,
  //    pref persisted) pulses as the affordance while blocked.
  var pmIntroAudio = {
    ctx: null, bus: null, master: null,
    muted: (function () { try { return localStorage.getItem('viditra-intro-muted') === '1'; } catch (e) { return false; } })(),
    ensure: function () {
      if (this.muted) return false;
      if (!this.ctx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return false;
        this.ctx = new AC();
        this.bus = this.ctx.createGain();
        this.master = this.ctx.createGain();
        this.master.gain.value = 1.15;   // the artifact's 0.85 was inaudibly soft on laptop speakers
        var conv = this.ctx.createConvolver();      // short, subtle room — no audible echo tail
        conv.buffer = this.impulse(1.2, 4.5);
        var wet = this.ctx.createGain(); wet.gain.value = 0.22;
        var dry = this.ctx.createGain(); dry.gain.value = 0.85;
        var lp = this.ctx.createBiquadFilter();     // gentle top-end rolloff — keeps everything soft
        lp.type = 'lowpass'; lp.frequency.value = 1800; lp.Q.value = 0.3;
        var warm = this.ctx.createBiquadFilter();   // low-shelf warmth boost
        warm.type = 'lowshelf'; warm.frequency.value = 300; warm.gain.value = 4;
        this.bus.connect(dry); dry.connect(lp);
        this.bus.connect(conv); conv.connect(wet); wet.connect(lp);
        lp.connect(warm); warm.connect(this.master);
        this.master.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx.state === 'running';
    },
    ensureAsync: function (cb) {
      // Like ensure(), but answers the blocked-vs-running question reliably: a suspended
      // context's resume() promise stays PENDING until a user gesture arrives, so race it
      // against a short timer. cb(true) → audio will be audible right now.
      if (this.muted) { cb(false); return; }
      this.ensure();
      var c = this.ctx;
      if (!c) { cb(false); return; }
      if (c.state === 'running') { cb(true); return; }
      var settled = false;
      function settle(ok) { if (settled) return; settled = true; cb(ok); }
      try { c.resume().then(function () { settle(true); }, function () { settle(false); }); }
      catch (e) { settle(false); }
      setTimeout(function () { settle(c.state === 'running'); }, 150);
    },
    impulse: function (seconds, decay) {
      var rate = this.ctx.sampleRate, len = rate * seconds;
      var buf = this.ctx.createBuffer(2, len, rate);
      for (var c = 0; c < 2; c++) {
        var d = buf.getChannelData(c);
        for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
      return buf;
    },
    tone: function (o) {
      var c = this.ctx, now = c.currentTime + (o.t0 || 0);
      var attack = o.attack || 0.01, hold = o.hold || 0, release = o.release || 0.4, vol = o.vol || 0.1;
      var osc = c.createOscillator();
      osc.type = o.type || 'sine';
      osc.frequency.setValueAtTime(o.freq, now);
      if (o.glideTo) osc.frequency.exponentialRampToValueAtTime(o.glideTo, now + attack + hold + release);
      var g = c.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(vol, now + attack);
      if (hold) g.gain.setValueAtTime(vol, now + attack + hold);
      g.gain.exponentialRampToValueAtTime(0.0001, now + attack + hold + release);
      var p = c.createStereoPanner ? c.createStereoPanner() : null;
      osc.connect(g);
      if (p) { p.pan.value = o.pan || 0; g.connect(p); p.connect(this.bus); } else g.connect(this.bus);
      osc.start(now); osc.stop(now + attack + hold + release + 0.1);
    },
    noise: function (o) {
      var c = this.ctx, now = c.currentTime + (o.t0 || 0), dur = o.dur || 0.3;
      var len = c.sampleRate * dur;
      var buf = c.createBuffer(1, len, c.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      var src = c.createBufferSource(); src.buffer = buf;
      var f = c.createBiquadFilter(); f.type = 'lowpass';
      f.frequency.setValueAtTime(o.from || 3000, now);
      f.frequency.exponentialRampToValueAtTime(o.to || 400, now + dur);
      var g = c.createGain();
      g.gain.setValueAtTime(o.vol || 0.06, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      src.connect(f); f.connect(g); g.connect(this.bus);
      src.start(now); src.stop(now + dur);
    },
    bell: function (freq, o) {
      // felt-piano softness: slow attack, warm sub-octave body, soft fifth shimmer
      o = o || {};
      var vol = o.vol || 0.12, release = o.release || 1.6, t0 = o.t0 || 0, pan = o.pan || 0;
      this.tone({ freq: freq, type: 'sine', t0: t0, attack: 0.12, release: release, vol: vol, pan: pan });
      this.tone({ freq: freq / 2, type: 'sine', t0: t0, attack: 0.15, release: release * 0.8, vol: vol * 0.35, pan: pan });
      this.tone({ freq: freq * 1.5, type: 'sine', t0: t0 + 0.02, attack: 0.18, release: release * 0.5, vol: vol * 0.1, pan: pan });
    },
    fadeOut: function () {
      if (this.ctx && this.master) this.master.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.08);
    },
    restore: function () {
      if (this.ctx && this.master) this.master.gain.setValueAtTime(1.15, this.ctx.currentTime);
    },
    cueOrbit: function (i) {
      if (!this.ensure()) return;
      var notes = [220, 277.18, 329.63];  // A3 C#4 E4 — A major, an octave down for warmth
      this.bell(notes[i], { vol: 0.055, release: 2.2, pan: (i - 1) * 0.25 });
      if (i === 0) {
        // warm sustained pad under the opening — A2 + E3 + sub, breathing in slowly
        this.tone({ freq: 110, attack: 1.4, hold: 1.2, release: 1.8, vol: 0.045 });
        this.tone({ freq: 164.8, attack: 1.6, hold: 1.2, release: 1.8, vol: 0.028 });
        this.tone({ freq: 55, attack: 1.8, hold: 1.2, release: 2.0, vol: 0.03 });
      }
    },
    cueNucleus: function () {
      if (!this.ensure()) return;
      // soft water drop: rounded bloop — upward gliding sine + warm A4 ripple body
      this.tone({ freq: 320, glideTo: 620, type: 'sine', attack: 0.02, release: 0.22, vol: 0.18 });
      this.tone({ freq: 440, type: 'sine', attack: 0.05, release: 1.4, vol: 0.11 });
    },
    cueTileWhoosh: function () {
      if (!this.ensure()) return;
      this.noise({ dur: 0.4, from: 700, to: 1500, vol: 0.018 });  // rising approach
    },
    cueTileLand: function () {
      if (!this.ensure()) return;
      this.tone({ freq: 100, glideTo: 62, type: 'sine', attack: 0.05, release: 0.7, vol: 0.075 });  // cushioned landing
      this.noise({ dur: 0.3, from: 900, to: 150, vol: 0.015 });   // settle breath
      this.bell(220, { t0: 0.05, vol: 0.035, release: 2.0 });
    },
    cueSlide: function () {
      if (!this.ensure()) return;
      this.noise({ dur: 0.7, from: 400, to: 1100, vol: 0.012 });  // airy swish as the mark glides left
    }
  };

  var pmIvE = {
    clamp01: function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; },
    outBack: function (p) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); },
    outCubic: function (p) { return --p * p * p + 1; },
    inOutCubic: function (p) { return p < 0.5 ? 4 * p * p * p : (p - 1) * (2 * p - 2) * (2 * p - 2) + 1; },
    outQuad: function (p) { return p * (2 - p); },
    anim: function (from, to, start, end, ease, t) {
      if (t <= start) return from;
      if (t >= end) return to;
      var p = (t - start) / (end - start);
      return from + (to - from) * (ease ? ease(p) : p);
    },
    interp: function (t, xs, ys, ease) {
      if (t <= xs[0]) return ys[0];
      if (t >= xs[xs.length - 1]) return ys[ys.length - 1];
      for (var i = 0; i < xs.length - 1; i++) {
        if (t >= xs[i] && t <= xs[i + 1]) {
          var span = xs[i + 1] - xs[i];
          var p = span === 0 ? 0 : (t - xs[i]) / span;
          return ys[i] + (ys[i + 1] - ys[i]) * (ease ? ease(p) : p);
        }
      }
      return ys[ys.length - 1];
    }
  };

  function pmSvgEl(name, attrs, parent) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', name);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  }

  // Build the 1920x1080 scene once; pmIntroRender() then drives it per frame.
  function pmIntroBuild(stage) {
    // Full-bleed: cover the viewport (center-crop) on landscape screens — the composition
    // is center-safe, so cropping edges is fine and there is never a visible pillarbox
    // seam. On portrait / extreme ratios fall back to contain, where cover would crop
    // the wordmark itself.
    var ar = (window.innerWidth || 1920) / (window.innerHeight || 1080);
    var fit = (ar >= 1.05 && ar <= 2.9) ? 'xMidYMid slice' : 'xMidYMid meet';
    var svg = pmSvgEl('svg', { viewBox: '0 0 1920 1080', preserveAspectRatio: fit });
    var defs = pmSvgEl('defs', {}, svg);
    var clay = pmSvgEl('linearGradient', { id: 'pmIvClay', x1: '0', y1: '0', x2: '.35', y2: '1' }, defs);
    pmSvgEl('stop', { offset: '0', 'stop-color': '#E08A5E' }, clay);
    pmSvgEl('stop', { offset: '.55', 'stop-color': '#C86540' }, clay);
    pmSvgEl('stop', { offset: '1', 'stop-color': '#AC5230' }, clay);
    var vign = pmSvgEl('radialGradient', { id: 'pmIvVign', cx: '0.5', cy: '0.5', r: '0.75' }, defs);
    pmSvgEl('stop', { offset: '0.5', 'stop-color': '#000', 'stop-opacity': '0' }, vign);
    pmSvgEl('stop', { offset: '1', 'stop-color': '#000', 'stop-opacity': '0.45' }, vign);
    var halo = pmSvgEl('radialGradient', { id: 'pmIvHaloG', cx: '0.5', cy: '0.5', r: '0.5' }, defs);
    pmSvgEl('stop', { offset: '0', 'stop-color': '#C86540', 'stop-opacity': '0.22' }, halo);
    pmSvgEl('stop', { offset: '1', 'stop-color': '#C86540', 'stop-opacity': '0' }, halo);
    var clip = pmSvgEl('clipPath', { id: 'pmIvWordClip' }, defs);
    var clipRect = pmSvgEl('rect', { x: 0, y: 380, width: 0, height: 320 }, clip);

    // ambient dust — 26 deterministic motes drifting slowly down
    var dust = [];
    var dustG = pmSvgEl('g', {}, svg);
    for (var i = 0; i < 26; i++) {
      var seed = i * 137.508;
      var el = pmSvgEl('circle', {
        cx: (seed * 7.13) % 1920, cy: 0,
        r: 1.2 + (i % 3) * 0.8,
        fill: '#E08A5E', opacity: 0.06 + (i % 4) * 0.03
      }, dustG);
      dust.push({ el: el, y0: (seed * 3.77) % 1080, spd: 6 + (i % 5) * 3 });
    }

    var haloC = pmSvgEl('circle', { cx: 960, cy: 540, r: 620, fill: 'url(#pmIvHaloG)' }, svg);
    // drift is a constant 1.012 in the approved export — bake it into the root transform
    var root = pmSvgEl('g', { transform: 'translate(960 540) scale(1.012) translate(-960 -540)' }, svg);
    var pulse = pmSvgEl('circle', { cx: 960, cy: 540, fill: 'none', stroke: '#E08A5E', opacity: 0 }, root);

    var tile = pmSvgEl('g', { opacity: 0 }, root);
    var tileRx = 460 * 29 / 128;
    pmSvgEl('rect', { x: -230, y: -230, width: 460, height: 460, rx: tileRx, fill: 'url(#pmIvClay)' }, tile);
    pmSvgEl('rect', { x: -230, y: -230, width: 460, height: 230, rx: tileRx, fill: '#FFFFFF', opacity: 0.05 }, tile);

    var atom = pmSvgEl('g', {}, root);
    var orbits = [], electrons = [];
    // Two-shell atom — the de-Reacted mark: orbits 90° apart (45°/135°), two
    // electrons resting antipodally on the 45° shell (matches the static logo).
    var pmIvAngles = [45, 135];
    for (var o = 0; o < pmIvAngles.length; o++) {
      orbits.push(pmSvgEl('ellipse', {
        transform: 'rotate(' + pmIvAngles[o] + ')',
        fill: 'none', stroke: '#FFFFFF', 'stroke-linecap': 'round'
      }, atom));
    }
    for (var e = 0; e < pmIvAngles.length; e++) {
      var g = pmSvgEl('g', { opacity: 0 }, atom);
      var core = pmSvgEl('circle', { fill: '#FFDCC8' }, g);
      var glow = pmSvgEl('circle', { fill: '#E08A5E', opacity: 0.35 }, g);
      electrons.push({ g: g, core: core, glow: glow });
    }
    var nuc = pmSvgEl('circle', { fill: '#FFFFFF', r: 0 }, atom);

    var word = pmSvgEl('text', {
      x: 1260, y: 602, opacity: 0,
      'font-family': "'Space Grotesk', Helvetica, sans-serif",
      'font-weight': 600, 'font-size': 182,
      fill: '#F5EFE8', 'letter-spacing': '-5',
      'clip-path': 'url(#pmIvWordClip)'
    }, root);
    word.textContent = 'Viditra';

    pmSvgEl('rect', { width: 1920, height: 1080, fill: 'url(#pmIvVign)', 'pointer-events': 'none' }, svg);
    stage.appendChild(svg);
    return { dust: dust, halo: haloC, pulse: pulse, tile: tile, atom: atom, orbits: orbits, electrons: electrons, nuc: nuc, word: word, clipRect: clipRect };
  }

  function pmIntroRender(R, t) {
    var E = pmIvE;
    var nucP = E.anim(0, 1, 1.1, 1.5, E.outBack, t);
    var pulseP = E.anim(0, 1, 1.15, 1.9, E.outCubic, t);
    var tileP = E.anim(0, 1, 1.6, 2.25, E.outBack, t);
    var tileFade = E.anim(0, 1, 1.6, 1.85, E.outQuad, t);
    var slideP = E.anim(0, 1, 2.35, 3.05, E.inOutCubic, t);
    var wordP = E.anim(0, 1, 2.55, 3.3, E.outCubic, t);
    var settled = 460 / 128;   // exact logo proportion inside the tile
    var atomScale = E.interp(t, [0, 1.6, 2.25], [7.2, 7.2, settled], E.inOutCubic);
    var sw = E.interp(t, [0, 1.6, 2.25], [7, 7, 4.6 * settled], E.inOutCubic);
    var electronOp = E.interp(t, [0, 0.25], [0, 1], null);   // fade in, then stay — the new mark keeps its electrons
    var markX = 960 - 330 * slideP;

    for (var i = 0; i < R.dust.length; i++) {
      var d = R.dust[i];
      d.el.setAttribute('cy', (d.y0 + t * d.spd) % 1080);
    }
    R.halo.setAttribute('cx', markX);

    if (pulseP > 0 && pulseP < 1) {
      R.pulse.setAttribute('cx', markX);
      R.pulse.setAttribute('r', 20 + pulseP * 300);
      R.pulse.setAttribute('stroke-width', 3 * (1 - pulseP));
      R.pulse.setAttribute('opacity', 0.6 * (1 - pulseP));
    } else {
      R.pulse.setAttribute('opacity', 0);
    }

    R.tile.setAttribute('opacity', tileFade);
    R.tile.setAttribute('transform',
      'translate(' + markX + ' 540) scale(' + (0.6 + 0.4 * tileP) + ') rotate(' + ((1 - tileP) * -8) + ')');

    R.atom.setAttribute('transform', 'translate(' + markX + ' 540)');
    var a = 34 * atomScale, b = 12.6 * atomScale;
    // ellipse perimeter (Ramanujan) — for the dash-based draw-on
    var per = Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));
    for (var e = 0; e < 2; e++) {
      // Draw-on: orbit e starts at 0.15 + e*0.18 and completes at 1.5s (staggered
      // starts, shared finish). The two electrons ride the 45° shell antipodally and
      // settle onto its tips at 1.5s — the resolved mark IS the static logo.
      var s0 = 0.15 + e * 0.18;
      var p = E.clamp01((t - s0) / (1.5 - s0));
      var eased = E.inOutCubic(p);
      var orb = R.orbits[e];
      orb.setAttribute('rx', a);
      orb.setAttribute('ry', b);
      orb.setAttribute('stroke-width', sw);
      orb.setAttribute('opacity', p > 0 ? 1 : 0);
      if (eased < 1) {
        orb.setAttribute('stroke-dasharray', per);
        orb.setAttribute('stroke-dashoffset', per * (1 - eased));
      } else {
        orb.setAttribute('stroke-dasharray', 'none');
        orb.setAttribute('stroke-dashoffset', 0);
      }
      // Electron rides its draw-on to the tip (ang -> 2π), then holds there; the
      // e*π offset makes the pair antipodal, and rot pins both to the 45° shell.
      var ang = eased * Math.PI * 2 + e * Math.PI;
      var x0 = a * Math.cos(ang), y0 = b * Math.sin(ang);
      var rot = (45 * Math.PI) / 180;
      var ex = x0 * Math.cos(rot) - y0 * Math.sin(rot);
      var ey = x0 * Math.sin(rot) + y0 * Math.cos(rot);
      var el = R.electrons[e];
      el.g.setAttribute('opacity', electronOp * (p > 0.02 ? 1 : 0));
      el.core.setAttribute('cx', ex); el.core.setAttribute('cy', ey); el.core.setAttribute('r', sw * 1.7);
      el.glow.setAttribute('cx', ex); el.glow.setAttribute('cy', ey); el.glow.setAttribute('r', sw * 4);
      el.glow.setAttribute('opacity', t < 2.1 ? 0.35 : 0);
    }
    R.nuc.setAttribute('r', nucP * 6.2 * atomScale);

    // wordmark — wipe reveal left to right
    var wordX = markX + 300;
    var reveal = E.outCubic(E.clamp01(wordP));
    R.word.setAttribute('x', wordX);
    R.word.setAttribute('opacity', E.outQuad(E.clamp01(wordP)));
    R.word.setAttribute('transform', 'translate(' + ((1 - reveal) * 40) + ' 0)');
    R.clipRect.setAttribute('x', wordX - 10);
    R.clipRect.setAttribute('width', reveal * 720);
  }

  function playIntro(onDone) {
    var ov = document.getElementById('pmIntro');
    var stage = document.getElementById('pmIntroStage');
    if (!ov || !stage || !window.requestAnimationFrame) { pmBootDismiss(); if (onDone) onDone(); return; }
    // reduced-motion preference: skip the sting, go straight to the gentle splash fade
    try {
      if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) { pmBootDismiss(); if (onDone) onDone(); return; }
    } catch (e) {}
    var R;
    try { R = pmIntroBuild(stage); pmIntroRender(R, 0); } catch (e) { pmBootDismiss(); if (onDone) onDone(); return; }
    // ── Sound gate (founder 2026-07-12: a reload must not run a silent sting). Login
    //    navigations carry the user's click, so audio is already allowed → begin at once.
    //    A plain reload carries NO gesture and Chrome hard-blocks audio until one lands —
    //    so hold the boot curtain with a "click anywhere to begin" hint; the first
    //    click/keypress starts the sting WITH sound from its first bell. A 3s fallback
    //    begins silently — the curtain never blocks teaching. Muted-pref users skip the
    //    wait entirely (they chose silence). ──
    var begun = false;
    function beginOnGesture() { beginSting(true); }
    function beginSting(viaGesture) {
      if (begun) return; begun = true;
      window.removeEventListener('pointerdown', beginOnGesture, true);
      window.removeEventListener('keydown', beginOnGesture, true);
      var hint = document.getElementById('pmBootHint');
      if (hint && hint.parentNode) hint.parentNode.removeChild(hint);
      if (viaGesture) pmIntroAudio.ensure();   // resume INSIDE the gesture → audible run
      runSting();
    }
    pmIntroAudio.ensureAsync(function (soundOk) {
      if (begun) return;
      if (soundOk || pmIntroAudio.muted) { beginSting(false); return; }
      var b = document.getElementById('pmBoot');
      if (b && !document.getElementById('pmBootHint')) {
        var hint = document.createElement('div');
        hint.id = 'pmBootHint';
        hint.textContent = 'Click anywhere to begin';
        b.appendChild(hint);
      }
      window.addEventListener('pointerdown', beginOnGesture, true);
      window.addEventListener('keydown', beginOnGesture, true);
      setTimeout(function () { beginSting(false); }, 3000);
    });
    function runSting() {
    ov.className = 'show';
    pmBootDismiss();   // the boot curtain crossfades out over the sting already rendering beneath
    // sound cues, fired on a tight forward crossing (a rAF stall skips a cue, never bursts them)
    var CUES = [
      [0.15, 'cueOrbit', 0], [0.31, 'cueOrbit', 1], [0.47, 'cueOrbit', 2],
      [1.10, 'cueNucleus'], [1.60, 'cueTileWhoosh'], [1.78, 'cueTileLand'], [2.35, 'cueSlide']
    ];
    var fired = {};
    var done = false, raf = null, t0 = null;
    function finish() {
      if (done) return; done = true;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('pointerdown', unlock, true);
      window.removeEventListener('keydown', unlock, true);
      pmIntroAudio.fadeOut();
      if (onDone) onDone();   // hand off to the splash NOW so it crossfades in UNDER the
      ov.className = 'gone';  // fading intro (splash z-index sits just below) — no blank gap.
      setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 550);
    }
    function frame(ts) {
      if (done) return;
      if (t0 === null) t0 = ts;
      var t = (ts - t0) / 1000;
      if (t >= 4) { pmIntroRender(R, 4); finish(); return; }
      pmIntroRender(R, t);
      for (var i = 0; i < CUES.length; i++) {
        if (!fired[i] && t >= CUES[i][0] && t - CUES[i][0] < 0.2) {
          fired[i] = 1;
          try { pmIntroAudio[CUES[i][1]](CUES[i][2]); } catch (e) {}
        }
      }
      raf = requestAnimationFrame(frame);
    }
    ov.addEventListener('click', finish);   // Skip button clicks bubble here too
    setTimeout(finish, 6000);   // failsafe: never trap the teacher behind the curtain
    // Speaker toggle — also the audio-unlock affordance when the browser blocked autoplay
    var snd = document.getElementById('pmIntroSound');
    function sndIcon() {
      if (!snd) return;
      snd.innerHTML = pmIntroAudio.muted
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none"/><line x1="16" y1="9" x2="22" y2="15"/><line x1="22" y1="9" x2="16" y2="15"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
    }
    function sndStateUI() {
      if (!snd) return;
      sndIcon();
      // pulse the toggle while the browser is still blocking audio — the click affordance
      var blocked = !pmIntroAudio.muted && (!pmIntroAudio.ctx || pmIntroAudio.ctx.state !== 'running');
      if (blocked) snd.classList.add('blocked'); else snd.classList.remove('blocked');
    }
    if (snd) {
      snd.addEventListener('click', function (e) {
        e.stopPropagation();   // the toggle must never skip the intro
        pmIntroAudio.muted = !pmIntroAudio.muted;
        try { localStorage.setItem('viditra-intro-muted', pmIntroAudio.muted ? '1' : '0'); } catch (e2) {}
        if (pmIntroAudio.muted) { pmIntroAudio.fadeOut(); }
        else { pmIntroAudio.restore(); pmIntroAudio.ensure(); }
        sndStateUI();
        setTimeout(sndStateUI, 200);   // ctx.resume() is async — re-check once it settles
      });
    }
    // ANY first interaction (click / key) is the gesture browsers need — unlock mid-play
    var unlock = function () { pmIntroAudio.ensure(); setTimeout(sndStateUI, 200); };
    window.addEventListener('pointerdown', unlock, true);
    window.addEventListener('keydown', unlock, true);
    pmIntroAudio.ensure();   // starts sound now if the browser already allows it
    sndStateUI();
    raf = requestAnimationFrame(frame);
    pmt('intro_shown', {});
    }   // end runSting
  }

  // ── Account dropdown menu (Claude-style) ──
  (function () {
    var btn = document.getElementById('pmAcct');
    var menu = document.getElementById('pmAcctMenu');
    if (!btn || !menu) return;
    function closeMenu() {
      menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false');
    }
    function openMenu() { menu.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); pmt('acct_menu_open', {}); }
    btn.addEventListener('click', function (e) {
      if (btn.classList.contains('nomenu')) return;
      e.stopPropagation();
      if (menu.classList.contains('open')) closeMenu(); else openMenu();
    });
    document.addEventListener('click', function (e) {
      if (menu.classList.contains('open') && !menu.contains(e.target) && !btn.contains(e.target)) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu();
    });
    var rProfile = document.getElementById('pmMenuProfile');
    if (rProfile) rProfile.addEventListener('click', function () { closeMenu(); openProfile(); });
    var rTour = document.getElementById('pmMenuTour');
    if (rTour) rTour.addEventListener('click', function () {
      closeMenu();
      var link = document.getElementById('pmTourLink'); if (link) link.click();
    });
    var rPlans = document.getElementById('pmMenuPlans');
    if (rPlans) rPlans.addEventListener('click', function () { pmt('view_plans', {}); closeMenu(); });
    var rHelp = document.getElementById('pmMenuHelp');
    if (rHelp) rHelp.addEventListener('click', function () { pmt('get_help', {}); closeMenu(); });
    var rOut = document.getElementById('pmMenuSignOut');
    if (rOut) rOut.addEventListener('click', function () { pmt('logout', {}); if (window.PM && PM.auth) PM.auth.signOut(); });
  })();

  // ── Wave 1: profile / settings panel (view + edit your own teacher_profiles row) ──
  // RLS allows a teacher to update ONLY their own row (profiles_update_own), so the
  // client writes directly; fail-loud on error, never silently drop an edit.
  var profOvl = document.getElementById('pmProfOvl');
  var profSaving = false;
  function profEl(id) { return document.getElementById(id); }
  function openProfile() {
    var p = window.PM_PROFILE; if (!p) return;
    profEl('pfName').value = p.display_name || '';
    profEl('pfSchool').value = p.school || '';
    profEl('pfTeaches').value = p.teaches || '';
    profEl('pfChapter').value = p.next_chapter || '';
    var t = profEl('pfTrial');
    if (window.PM_TRIAL_END) {
      var days = Math.max(0, Math.ceil((window.PM_TRIAL_END - Date.now()) / 86400000));
      t.textContent = 'Free trial · ' + days + ' day' + (days === 1 ? '' : 's') + ' left';
      t.style.display = '';
    } else { t.style.display = 'none'; }
    profEl('pmProfErr').style.display = 'none';
    profEl('pmProfOk').style.display = 'none';
    profOvl.className = 'open';
    pmt('profile_open', {});
  }
  function closeProfile() { profOvl.className = ''; }
  if (profOvl) {
    profEl('pmProfCancel').addEventListener('click', closeProfile);
    profOvl.addEventListener('click', function (e) { if (e.target === profOvl) closeProfile(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && profOvl.className === 'open') closeProfile(); });
    profEl('pmProfSignOut').addEventListener('click', function () {
      pmt('logout', {}); if (window.PM && PM.auth) PM.auth.signOut();
    });
    profEl('pmProfTour').addEventListener('click', function () {
      // Reuse pm-tour.js's own launcher (injected as #pmTourLink) so there's one source of truth.
      var link = document.getElementById('pmTourLink');
      if (link) { link.click(); } else { closeProfile(); }
    });
    profEl('pmProfSave').addEventListener('click', function () {
      if (profSaving) return;
      var name = profEl('pfName').value.replace(/^\\s+|\\s+$/g, '');
      var err = profEl('pmProfErr'), ok = profEl('pmProfOk');
      err.style.display = 'none'; ok.style.display = 'none';
      if (!name) { err.textContent = 'Please enter your name.'; err.style.display = 'block'; return; }
      var p = window.PM_PROFILE;
      var c = (window.PM && PM.auth && PM.auth.client) ? PM.auth.client() : null;
      if (!p || !c) { err.textContent = 'Could not reach the service — please reload and try again.'; err.style.display = 'block'; return; }
      var patch = {
        display_name: name,
        school: profEl('pfSchool').value.replace(/^\\s+|\\s+$/g, '') || null,
        teaches: profEl('pfTeaches').value.replace(/^\\s+|\\s+$/g, '') || null,
        next_chapter: profEl('pfChapter').value || null
      };
      profSaving = true; var btn = profEl('pmProfSave'); btn.disabled = true; btn.textContent = 'Saving…';
      c.from('teacher_profiles').update(patch).eq('professor_id', p.professor_id).then(function (res) {
        profSaving = false; btn.disabled = false; btn.textContent = 'Save changes';
        if (res && res.error) { err.textContent = 'Could not save: ' + res.error.message; err.style.display = 'block'; return; }
        // Reflect the change everywhere the name shows, without a reload.
        window.PM_PROFILE = { professor_id: p.professor_id, display_name: patch.display_name,
          school: patch.school, teaches: patch.teaches, next_chapter: patch.next_chapter,
          trial_started_at: p.trial_started_at, trial_days: p.trial_days };
        try { document.getElementById('catTitle').textContent = patch.display_name + '’s Class'; } catch (e) {}
        try {
          var nm2 = document.getElementById('pmAcctName');
          if (nm2) nm2.textContent = patch.display_name;
          var av2 = document.getElementById('pmAcctAvatar');
          if (av2) av2.textContent = (patch.display_name || '').replace(/^\\s+/, '').charAt(0).toUpperCase() || '•';
        } catch (e) {}
        pmt('profile_saved', {});
        ok.textContent = 'Saved \\u2713'; ok.style.display = 'block';
        setTimeout(closeProfile, 800);
      }, function () {
        profSaving = false; btn.disabled = false; btn.textContent = 'Save changes';
        err.textContent = 'Network error — please try again.'; err.style.display = 'block';
      });
    });
  }

  // Search: filter cards; hide emptied chapters; debounce the analytics event.
  var input = document.getElementById('search');
  var noRes = document.getElementById('noresults');
  var searchTimer = null;
  input.addEventListener('input', function () {
    var q = input.value.trim().toLowerCase();
    var shown = 0;
    var cards = document.querySelectorAll('.card');
    for (var i = 0; i < cards.length; i++) {
      var hit = !q || (cards[i].getAttribute('data-search') || '').indexOf(q) >= 0;
      cards[i].style.display = hit ? '' : 'none';
      if (hit) shown++;
    }
    var chapters = document.querySelectorAll('.chapter');
    for (var c = 0; c < chapters.length; c++) {
      var any = chapters[c].querySelector('.card:not([style*="none"])');
      chapters[c].style.display = any ? '' : 'none';
    }
    noRes.style.display = shown === 0 ? 'block' : 'none';
    if (searchTimer) clearTimeout(searchTimer);
    if (q) searchTimer = setTimeout(function () { pmt('search', { query: q, results: shown }); }, 900);
  });
  // Which sim did they open (fires before navigation; telemetry flushes on pagehide).
  document.addEventListener('click', function (ev) {
    var card = ev.target && ev.target.closest ? ev.target.closest('.card') : null;
    if (!card) return;
    pmt('concept_open', { concept_id: card.getAttribute('data-concept') });
    // Deliberately opening a sim from the catalog IS an arrival — the one case that earns the
    // "{Name}'s Class" curtain over there. A reload or a back INTO a sim never sets this, so the
    // curtain stays quiet and she gets her sim back immediately.
    try { sessionStorage.setItem('${PM_BRAND_OPEN_KEY}', '1'); } catch (e) {}
  });
})();
</script>
</body></html>
`;
    writeFileSync(join(OUT_DIR, 'index.html'), html, 'utf-8');
    console.log(`   catalog: review-site/index.html (${entries.length} pilot sim${entries.length === 1 ? '' : 's'} across ${ordered.length} chapter${ordered.length === 1 ? '' : 's'})`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

/** Build the per-concept review files (sim.html + player + meta.json). Caller refreshes the catalog. */
function buildOne(conceptId: string): void {
    const json = loadConcept(conceptId);
    if (!json.field_3d_config && !json.particle_field_config) {
        console.error(
            `✖ ${conceptId}: no field_3d_config or particle_field_config block — ` +
            `only field_3d and particle_field diamonds are supported.`,
        );
        process.exit(1);
    }
    const conceptName = json.concept_name ?? conceptId;
    const audioClips = loadAudioManifest(conceptId);
    if (Object.keys(audioClips).length === 0) {
        console.warn(`   ⚠ ${conceptId}: no audio_manifest.json — run "npm run tts:generate ${conceptId}" first; narration will be silent.`);
    }
    const staleClipIds: string[] = [];
    const states = extractStates(json, audioClips, staleClipIds);
    if (staleClipIds.length > 0) {
        console.warn(
            `   ⚠ ${conceptId}: ${staleClipIds.length} STALE audio clip(s) muted — sentence text changed since they were voiced ` +
            `(${staleClipIds.slice(0, 6).join(', ')}${staleClipIds.length > 6 ? ', …' : ''}). ` +
            `Run "npm run tts:generate ${conceptId}" to re-voice them.`,
        );
    }
    if (states.length === 0) {
        console.error(`✖ ${conceptId}: no epic_l_path states with narration found.`);
        process.exit(1);
    }
    const missing = states.filter((s) => s.sentences.length === 0).map((s) => s.id);
    if (missing.length > 0) {
        console.warn(`   ⚠ ${conceptId}: states with no narration (will show silently): ${missing.join(', ')}`);
    }

    const conceptDir = join(OUT_DIR, conceptId);
    mkdirSync(conceptDir, { recursive: true });

    // 1) the self-contained scene (field_3d = Three.js diamonds; particle_field = 2D p5 diamonds)
    const simHtml = vendorizeSimHtml(
        json.field_3d_config
            ? assembleField3DHtml(json.field_3d_config)
            : assembleParticleFieldHtml(json.particle_field_config as ParticleFieldAuthoredConfig),
    );
    writeFileSync(join(conceptDir, 'sim.html'), simHtml, 'utf-8');

    // 2) the player page
    writeFileSync(
        join(conceptDir, 'index.html'),
        renderConceptPage(conceptName, conceptId, states, json.default_flow),
        'utf-8',
    );

    // 3) meta for the catalog (chapter/section/class_level drive the pilot catalog grouping)
    writeFileSync(
        join(conceptDir, 'meta.json'),
        JSON.stringify(
            {
                concept_id: conceptId,
                concept_name: conceptName,
                chapter: json.chapter ?? null,
                section: json.section ?? null,
                class_level: json.class_level ?? null,
            },
            null,
            2,
        ),
        'utf-8',
    );

    console.log(`✅ Built review page for ${conceptId} (${states.length} states) → review-site/${conceptId}/`);
}

function main(): void {
    const arg = (process.argv[2] ?? '').trim();

    if (!arg) {
        console.error('Usage:');
        console.error('  npx tsx src/scripts/build_review_site.ts <concept_id>   build one sim + refresh catalog');
        console.error('  npx tsx src/scripts/build_review_site.ts --pilot        rebuild every founder-approved (baseline-locked) sim — the professor deploy set');
        console.error('  npx tsx src/scripts/build_review_site.ts --all          rebuild every sim in review_status.json');
        console.error('  npx tsx src/scripts/build_review_site.ts --catalog      refresh catalog only (badges/videos)');
        process.exit(1);
    }

    // Every mode that (re)builds sims needs the shared vendor/ dir in place —
    // sim.html references ../vendor/{three,katex,p5} instead of the CDNs.
    if (arg !== '--catalog') writeVendorAssets();

    // --catalog: just regenerate the landing page from existing folders + review_status.json
    if (arg === '--catalog') {
        writeRootAssets(OUT_DIR);
        rebuildCatalog();
        console.log(`\nCatalog refreshed from src/data/review_status.json.`);
        return;
    }

    // --pilot: rebuild the professor deploy set — every baseline-locked concept
    // (visual_baselines/<id>/baselines.json = founder ran visual:approve).
    if (arg === '--pilot') {
        const ids = listPilotConceptIds(ROOT);
        if (ids.length === 0) {
            console.error('✖ --pilot: no baseline-locked concepts found in visual_baselines/.');
            process.exit(1);
        }
        console.log(`Building ${ids.length} pilot sim${ids.length === 1 ? '' : 's'} (curated PILOT_CONCEPTS) …\n`);
        for (const id of ids) buildOne(id);
        writeRootAssets(OUT_DIR);
        rebuildCatalog();
        console.log(`\nNext: npm run serve:review  →  http://localhost:8080/`);
        console.log(`(or npm run deploy:review to push review-site/ to Netlify)\n`);
        return;
    }

    // --all: build every concept listed in the review-status manifest
    if (arg === '--all') {
        const ids = Object.keys(loadReviewStatus());
        if (ids.length === 0) {
            console.error('✖ --all: src/data/review_status.json has no concepts. Add entries first.');
            process.exit(1);
        }
        console.log(`Building ${ids.length} sim${ids.length === 1 ? '' : 's'} from review_status.json …\n`);
        for (const id of ids) buildOne(id);
        writeRootAssets(OUT_DIR);
        rebuildCatalog();
        console.log(`\nNext: npm run serve:review  →  http://localhost:8080/`);
        console.log(`(or npm run deploy:review to push review-site/ to Netlify)\n`);
        return;
    }

    // single concept
    buildOne(arg);
    writeRootAssets(OUT_DIR);
    rebuildCatalog();
    console.log(`\nNext: npm run serve:review  →  http://localhost:8080/${arg}/`);
    console.log(`(or npm run deploy:review to push review-site/ to Netlify)\n`);
}

main();
