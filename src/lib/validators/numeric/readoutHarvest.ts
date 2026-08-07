/**
 * THE CALCULATOR — the readable surface.
 *
 * Concept JSONs almost never declare their readouts (`readouts` appears in
 * 10/146 files, `probe_points` in 1), so what a teacher can READ must be
 * discovered from the live page. Three channels cover it:
 *
 *   A. DOM overlays — field_3d's ~51 `*_readout` panels + `.pm_hud` statics +
 *      dynamic inline `position:fixed` panels; particle_field's `#pm-readout`
 *      (with per-value spans like `#pm-ro-r`) and `#pm-sv-<var>` slider labels.
 *
 *   B. A `CanvasRenderingContext2D.prototype.fillText` hook — the ONLY handle on
 *      p5-drawn instruments (ammeter/voltmeter/graph text: ~101 `text()` calls in
 *      particle_field_renderer.ts, all bottoming out in fillText). Kept in two
 *      buffers: `all` (never cleared — catches labels painted once at creation)
 *      and `win` (cleared per harvest — catches per-frame HUD repaints).
 *
 *   C. Three.js sprite `_pmText` — field_3d label sprites. `pmCreateAutoLabel`
 *      and `updateLabelSpriteText` retain the drawn string
 *      (field_3d_renderer.ts:4394, :4483); `createLabelSprite` does not, which is
 *      exactly the gap channel B closes.
 *
 * Not a channel: `window.PM_*`. field_3d exposes 328 of them but they are the
 * INPUTS — recomputing from them would re-derive what the renderer already did
 * and prove nothing.
 *
 * No renderer file is modified. Everything here is injected from the outside.
 */

export type ReadingSource = 'dom' | 'canvas' | 'sprite';

export interface Reading {
    /** Displayed symbol, e.g. "Φ", "R_eff", "Q/V", "m₁". */
    symbol: string;
    value: number;
    /** Everything after the number, e.g. "Wb", "nC per volt", "" . */
    unit: string;
    /** First whitespace-delimited unit token — what unit comparison uses. */
    unitToken: string;
    /** Digits after the decimal point AS DISPLAYED — drives rounding tolerance. */
    decimals: number;
    /** The chunk the reading was parsed out of, for evidence strings. */
    raw: string;
    source: ReadingSource;
    /** Element id / canvas id / sprite id. */
    where: string;
}

export interface RawHarvest {
    dom: { where: string; text: string }[];
    canvasAll: { where: string; text: string; inDom: boolean }[];
    canvasWin: { where: string; text: string; inDom: boolean }[];
    sprites: { where: string; text: string }[];
    simTimeMs: number | null;
    currentState: string | null;
    err?: string;
}

/**
 * Installed via `page.addInitScript` BEFORE any renderer script runs, so the
 * fillText hook is in place for creation-time draws and the THREE wrapper sees
 * the renderer's first Scene.
 */
export const HARVEST_INIT = `(function () {
  var S = { all: [], win: [], cid: 0 };
  window.__PM_CALC = S;

  // ── channel B: record every string painted to any 2D context ──────────────
  try {
    var proto = CanvasRenderingContext2D.prototype;
    var origFill = proto.fillText;
    proto.fillText = function (text) {
      try {
        var c = this.canvas;
        if (c && !c.__pmCalcId) {
          c.__pmCalcId = 'canvas#' + (++S.cid) + '(' + c.width + 'x' + c.height + ')';
        }
        var rec = {
          text: String(text),
          where: c ? c.__pmCalcId : 'canvas#detached',
          inDom: !!(c && c.isConnected)
        };
        S.all.push(rec);
        S.win.push(rec);
        // Bound both buffers: a long free-run would otherwise grow without limit.
        if (S.all.length > 40000) S.all.splice(0, 20000);
        if (S.win.length > 40000) S.win.splice(0, 20000);
      } catch (e) { /* never let instrumentation break the sim */ }
      return origFill.apply(this, arguments);
    };
  } catch (e) { window.__PM_CALC_HOOK_ERR = String(e && e.message || e); }

  // ── channel C: capture the renderer's own Scene ───────────────────────────
  // r128 assigns render() per INSTANCE, so a prototype hook never fires, and the
  // UMD assigns an EMPTY object first and populates it in the same script — hence
  // the deferred re-wrap. Scene/PerspectiveCamera are ES CLASSES, so .apply()
  // throws; Reflect.construct with the wrapper as newTarget builds a real instance
  // with the real prototype, leaving instanceof and every internal path intact.
  // (Same mechanism proven in _scratch_nlb_mass_label_probe.ts.)
  var _T;
  try {
    Object.defineProperty(window, 'THREE', {
      configurable: true,
      get: function () { return _T; },
      set: function (v) {
        _T = v;
        var wrap = function () {
          try {
            if (window.__PM_CALC_WRAPPED || !v || !v.Scene) return;
            window.__PM_CALC_WRAPPED = true;
            var Sc = v.Scene;
            function WS() {
              var o = Reflect.construct(Sc, arguments, WS);
              if (!window.__PM_CALC_SCENE) window.__PM_CALC_SCENE = o;
              return o;
            }
            WS.prototype = Sc.prototype;
            v.Scene = WS;
          } catch (e) { window.__PM_CALC_THREE_ERR = String(e && e.message || e); }
        };
        wrap();
        Promise.resolve().then(wrap);
      }
    });
  } catch (e) { window.__PM_CALC_THREE_ERR = String(e && e.message || e); }

  // win only: the per-sample window, cleared before each harvest.
  window.__PM_CALC_CLEAR = function () { S.win.length = 0; return true; };
  // BOTH buffers: called on state entry. The cumulative buffer exists to catch
  // strings painted once at creation, but it also retains every earlier state's
  // text — which surfaced as a stale "V2 = 3.0" being reported in a later state
  // and read as a dead slider. State entry is the correct reset point.
  window.__PM_CALC_RESET = function () { S.win.length = 0; S.all.length = 0; return true; };
})()`;

/** Evaluated in the sim frame to pull one snapshot of every channel. */
export const HARVEST_READ = `(function () {
  var S = window.__PM_CALC || { all: [], win: [] };
  var out = { dom: [], canvasAll: S.all.slice(), canvasWin: S.win.slice(), sprites: [],
              simTimeMs: null, currentState: null };
  try {
    out.simTimeMs = (typeof window.PM_simTimeMs === 'number') ? window.PM_simTimeMs : null;
    out.currentState = (typeof window.PM_currentState === 'string') ? window.PM_currentState : null;
  } catch (e) {}

  // ── channel A: DIRECT text nodes of every visible element ─────────────────
  // Direct-only (not innerText) so a container never duplicates its children and
  // per-value spans such as #pm-ro-r stay individually addressable.
  function pmDirectText(el) {
    if (!el) return '';
    var t = '';
    for (var q = 0; q < el.childNodes.length; q++) {
      var nn = el.childNodes[q];
      if (nn.nodeType === 3) t += nn.nodeValue;
    }
    return t.replace(/\\s+/g, ' ').trim();
  }
  function pmVisible(el) {
    if (!el) return false;
    var s = window.getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden') return false;
    if (parseFloat(s.opacity || '1') === 0) return false;
    var b = el.getBoundingClientRect();
    return b.width > 0 && b.height > 0;
  }
  try {
    var els = document.querySelectorAll('body *');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue;
      if (!pmVisible(el)) continue;                   // also catches display:none ancestors
      var direct = pmDirectText(el);
      if (!direct) continue;
      var where = el.id ? ('#' + el.id) : el.tagName.toLowerCase();
      if (!el.id && el.className && typeof el.className === 'string' && el.className.trim()) {
        where += '.' + el.className.trim().split(/\\s+/).join('.');
      }
      out.dom.push({ where: where, text: direct });

      // ── channel B: a symbol and its value living in SIBLING elements ───────
      // The energy panel emits <div class="nlb_en_sym">K</div> immediately
      // before <div class="nlb_en_val">12.5 J</div>. Neither node alone holds a
      // reading — the symbol carries no number and the value carries no symbol —
      // so channel A is structurally BLIND to every panel built that way (the
      // whole SEAM L energy layer, and any future split-cell readout). Compose
      // the adjacent pair into the chip form ("K 12.5 J") that CHIP_RE already
      // understands, rather than teaching the parser a second shape.
      // Deliberately additive: neither node parses to a reading on its own, so
      // this can only ADD readings, never double-count an existing one.
      var bare = direct.length <= 12
              && direct.indexOf('=') < 0
              && !/\\s/.test(direct)
              && !/^[+-]?[0-9.]/.test(direct);
      if (bare) {
        var sib = el.nextElementSibling;
        if (sib && pmVisible(sib)) {
          var sdirect = pmDirectText(sib);
          if (/^[+-]?[0-9]/.test(sdirect)) {
            out.dom.push({ where: where + '+next', text: direct + ' ' + sdirect });
          }
        }
      }
    }
  } catch (e) { out.err = 'dom: ' + String(e && e.message || e); }

  // ── channel C: visible sprite labels that retained their string ───────────
  try {
    var sc = window.__PM_CALC_SCENE;
    if (sc && typeof sc.traverse === 'function') {
      sc.traverse(function (o) {
        if (!o || typeof o._pmText !== 'string' || o._pmText === '') return;
        var p = o, vis = true;
        while (p) { if (p.visible === false) { vis = false; break; } p = p.parent; }
        if (!vis) return;
        var ud = o.userData || {};
        out.sprites.push({ where: 'sprite:' + (ud.id || ud.elementType || o.uuid.slice(0, 8)), text: o._pmText });
      });
    }
  } catch (e) { out.err = (out.err ? out.err + ' | ' : '') + 'sprite: ' + String(e && e.message || e); }

  return out;
})()`;

// ─────────────────────────────────────────────────────────────────────────────
// Parsing displayed text into {symbol, value, unit}
// ─────────────────────────────────────────────────────────────────────────────

/** Latin + Greek + subscripts + the few glyphs that appear inside symbols. */
const SYM_CHARS = 'A-Za-z0-9_\\u00B5\\u0370-\\u03FF\\u1D00-\\u1D7F\\u2080-\\u209F\\u2100-\\u214F\\u03A9\\u2126';
const NUMBER_RE = new RegExp('^([+-]?\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?)');
const SYMBOL_TAIL_RE = new RegExp('([' + SYM_CHARS + ']+(?:\\s*/\\s*[' + SYM_CHARS + ']+)?)\\s*$');
/** "N 100", "B 0.50 T" — the space-separated chip form used by acg_readout. */
const CHIP_RE = new RegExp('^([' + SYM_CHARS + ']{1,12})\\s+([+-]?\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?)\\s*(.*)$');

function decimalsOf(numText: string): number {
    const mantissa = numText.split(/[eE]/)[0];
    const dot = mantissa.indexOf('.');
    return dot < 0 ? 0 : mantissa.length - dot - 1;
}

/** Split a blob into the smallest units that can each hold one reading. */
function chunk(text: string): string[] {
    return text
        .split(/[\n\r]+|\s[·|]\s|·|\|/)
        .map((s) => s.trim())
        .filter(Boolean);
}

/**
 * Parse one chunk.
 *
 * `E = V / d = 1200 V/m` → the symbol is what precedes the FIRST `=`; the value
 * follows the LAST `=` that is actually followed by a number. `slope R = 12.5 Ω`
 * → the trailing token of the pre-`=` text wins, so the symbol is `R`.
 */
function parseChunk(text: string, source: ReadingSource, where: string): Reading[] {
    const segments = text.split('=');
    if (segments.length > 1) {
        const out: Reading[] = [];
        for (let k = 1; k < segments.length; k++) {
            const after = segments.slice(k).join('=').trimStart();
            const num = NUMBER_RE.exec(after);
            if (!num) continue;                       // this `=` restates a formula

            // The symbol is the trailing identifier of the preceding segment —
            // UNLESS that segment is itself an expression, in which case walk
            // back past the chain. "Series R_eq = 12 Ω i = 0.50 A" yields BOTH
            // R_eq and i; "E = V / d = 1200 V/m" yields E, not d.
            let j = k - 1;
            while (j > 0 && isFormulaRestatement(segments[j])) j--;
            const sym = SYMBOL_TAIL_RE.exec(segments[j].trim());
            if (!sym) continue;

            // The value's unit ends where the next "symbol =" pair begins.
            const rest = after.slice(num[1].length);
            const nextEq = rest.indexOf('=');
            const unitZone = (nextEq < 0 ? rest : rest.slice(0, nextEq).replace(SYMBOL_TAIL_RE, '')).trim();
            out.push({
                symbol: sym[1].replace(/\s+/g, ''),
                value: Number(num[1]),
                unit: unitZone,
                unitToken: unitZone.split(/\s+/)[0] ?? '',
                decimals: decimalsOf(num[1]),
                raw: text,
                source,
                where,
            });
        }
        return out;
    }

    const chip = CHIP_RE.exec(text);
    if (chip) {
        const unit = chip[3].trim();
        return [{
            symbol: chip[1],
            value: Number(chip[2]),
            unit,
            unitToken: unit.split(/\s+/)[0] ?? '',
            decimals: decimalsOf(chip[2]),
            raw: text,
            source,
            where,
        }];
    }
    return [];
}

/** "V / d" restates a formula; "12 Ω i" is a value followed by the next symbol. */
function isFormulaRestatement(segment: string): boolean {
    return /[+\-*/]/.test(segment) && !/\d/.test(segment);
}

/**
 * Turn a raw page harvest into every `symbol = value unit` reading it contains.
 *
 * `keep` restricts the result to symbols the concept declares. Sims paint
 * narration on the canvas, and prose containing an "=" parses as a reading, so
 * without the filter a parametric concept reports `Path=7 m` and `16=25` as
 * physics. Omit it only for parser tests.
 */
export function parseReadings(raw: RawHarvest, keep?: ReadonlySet<string>): Reading[] {
    const out: Reading[] = [];
    const admissible = (r: Reading): boolean => {
        if (!isFinite(r.value)) return false;
        if (/^\d/.test(r.symbol)) return false;       // "16 = 25" is arithmetic prose, not a readout
        return keep ? keep.has(r.symbol) : true;
    };
    const push = (text: string, source: ReadingSource, where: string) => {
        for (const c of chunk(text)) {
            for (const r of parseChunk(c, source, where)) {
                if (admissible(r)) out.push(r);
            }
        }
    };
    for (const d of raw.dom) push(d.text, 'dom', d.where);

    // A p5 sketch repaints its instruments EVERY frame, so one harvest window
    // holds a dozen copies — and while a readout is still settling, several
    // DIFFERENT values. Keeping every distinct one made the run
    // non-deterministic (`combination_of_resistors` reported an extra
    // intermediate `R_eq = 3 Ω` on some runs and not others).
    //
    // Keep the LAST value painted per (canvas, symbol): that is the settled
    // frame, and it is stable across runs.
    const latestPerSymbol = (records: { where: string; text: string }[]): Map<string, Reading> => {
        const m = new Map<string, Reading>();
        for (const c of records) {
            for (const text of chunk(c.text)) {
                for (const r of parseChunk(text, 'canvas', c.where)) {
                    if (admissible(r)) m.set(r.where + ' ' + r.symbol, r);   // last write wins
                }
            }
        }
        return m;
    };
    const canvas = latestPerSymbol(raw.canvasWin);
    // The cumulative buffer only contributes symbols the window never painted --
    // strings drawn once at creation rather than repainted every frame.
    for (const [key, reading] of latestPerSymbol(raw.canvasAll)) {
        if (!canvas.has(key)) canvas.set(key, reading);
    }
    out.push(...canvas.values());

    for (const s of raw.sprites) push(s.text, 'sprite', s.where);
    return out;
}

/**
 * Tolerance for comparing a computed value against a DISPLAYED one:
 * `relPct` of the expected magnitude, but never tighter than half the last
 * displayed decimal place — `Φ = 0.350` cannot be held to better than ±0.0005.
 */
export function toleranceFor(expected: number, decimals: number, relPct = 1): number {
    const rel = Math.abs(expected) * (relPct / 100);
    const roundingFloor = 0.5 * Math.pow(10, -decimals);
    return Math.max(rel, roundingFloor);
}
