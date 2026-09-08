/* Core — the few helpers every module uses. No product logic lives here.
 *
 * The app ships as ONE self-contained index.html that must also work from
 * file:// (the founder's phone, the e2e suite), so every module is a classic
 * script concatenated by src/scripts/build_eapcet_app.ts in file-name order:
 * 00_core, 05_strings, 10_track, 50_data, 55_diag, 60_run, 80_screens, 90_boot.
 */
var $ = function (id) { return document.getElementById(id); };

function el(tag, cls, text) {
  var n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined && text !== null) n.textContent = text;
  return n;
}

/* localStorage with an in-memory fallback: a private window, a blocked store
 * or file:// on some phones all throw, and the run must still finish. Copied
 * from answer-book/notebook.js (Vidi.lsGet/lsSet). */
var Store = (function () {
  var mem = {};
  function get(k) {
    try { var v = localStorage.getItem(k); return v === null ? (mem[k] || null) : v; }
    catch (e) { return mem[k] || null; }
  }
  function set(k, v) { mem[k] = v; try { localStorage.setItem(k, v); } catch (e) {} }
  function getJSON(k, dflt) {
    try { var v = JSON.parse(get(k) || ''); return v === null || v === undefined ? dflt : v; }
    catch (e) { return dflt; }
  }
  function setJSON(k, v) { set(k, JSON.stringify(v)); }
  return { get: get, set: set, getJSON: getJSON, setJSON: setJSON };
})();

/* Dates are strings, never epoch ms, so a tick and the day it happened on agree
 * in tests and in life. ep_today_override is test-only. */
function todayStr() {
  var o = Store.get('ep_today_override');
  if (o && /^\d{4}-\d{2}-\d{2}$/.test(o)) return o;
  var d = new Date();
  return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
}

/* FNV-1a, 32-bit: a stable seed from a string, the same on every device. */
function hashStr(s) {
  var h = 0x811c9dc5;
  for (var i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/* mulberry32: a small seeded generator, so a draw can be replayed from its seed. */
function rng(seed) {
  var a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    var t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled(list, random) {
  var a = list.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}
