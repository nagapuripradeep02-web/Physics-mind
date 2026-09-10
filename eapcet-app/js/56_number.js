/* Num — reading a number the way the corpus gate reads one, in the browser.
 *
 * A port of norm_value / num_of in scripts/eapcet/gate_solutions.py (the
 * corpus desk): the same normalisation (− → -, × → x, a ratio 3:4 is the
 * number 3/4, superscripts become ^digits) and the same one-percent
 * tolerance, so the number a student types before the options is matched to
 * an option exactly as the gate matches a solution's value to the key.
 *
 * Pure: no DOM, no storage, no clock. The build script evaluates this file to
 * decide which questions get the number step, and the unit test in
 * src/lib/eapcet/__tests__/number.test.ts runs THIS source. */
var Num = (function () {
  var SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺';
  var SUP_TO = '0123456789-+';
  // a number, with an optional power of ten and an optional plain fraction: 24, 4x10^12, 1/27, 47/30
  var BODY = '[-+]?\\d+(?:\\.\\d+)?(?:x10\\^[-+]?\\d+|e[-+]?\\d+)?(?:\\/\\d+(?:\\.\\d+)?)?';
  var HEAD = new RegExp('^' + BODY);
  // what may follow the number when the whole option IS that number: a unit
  // (letters, a slash, a degree or percent sign) with powers written ^n only
  var UNIT_TAIL = /^(?:[a-zμΩ°%\/\s]|\^[-+]?\d+)*$/;

  function normalise(s) {
    s = String(s == null ? '' : s).trim().toLowerCase();
    s = s.replace(/−/g, '-').replace(/–/g, '-').replace(/×/g, 'x').replace(/·/g, 'x').replace(/÷/g, '/');
    s = s.replace(/:/g, '/').replace(/∶/g, '/');
    var out = '', inSup = false;
    for (var i = 0; i < s.length; i++) {
      var ch = s[i], k = SUP.indexOf(ch);
      if (k >= 0) {
        if (!inSup) out += '^';
        out += SUP_TO[k];
        inSup = true;
      } else {
        out += ch;
        inSup = false;
      }
    }
    return out.replace(/\s+/g, '');
  }

  /** The leading number of a normalised string, or null. */
  function headOf(norm) {
    var m = HEAD.exec(norm);
    if (!m) return null;
    var body = m[0].replace('x10^', 'e');
    var slash = body.indexOf('/');
    var num = slash < 0 ? body : body.slice(0, slash);
    var den = slash < 0 ? null : body.slice(slash + 1);
    var a = parseFloat(num), b = den === null ? 1 : parseFloat(den);
    if (!isFinite(a) || !isFinite(b) || b === 0) return null;
    return { value: a / b, tail: norm.slice(m[0].length) };
  }

  /** What a student typed, as a number: the leading number, whatever follows it. */
  function parse(text) {
    var h = headOf(normalise(text));
    return h ? h.value : null;
  }

  /** An option's printed text as ONE number: the leading number followed by
      nothing but a unit. "2.28 m/s" → 2.28, "16 ms⁻¹" → 16, "3 : 4" → 0.75,
      "5 m/s² and 10 m" → null (two numbers), "−2av³" → -2 with tail "av^3". */
  function optionValue(text) {
    var h = headOf(normalise(text));
    if (!h || !UNIT_TAIL.test(h.tail)) return null;
    return h;
  }

  function close(a, b) { return Math.abs(a - b) <= 0.01 * Math.max(Math.abs(b), 1e-12); }

  /** Whether a question's four options are four distinct numbers in one unit,
      so a student can be asked for the number before seeing them. */
  function answerKind(options) {
    if (!options || options.length !== 4) return 'choice';
    var vals = [], tail = null;
    for (var i = 0; i < 4; i++) {
      var h = optionValue(options[i]);
      if (!h) return 'choice';
      if (tail === null) tail = h.tail; else if (h.tail !== tail) return 'choice';
      vals.push(h.value);
    }
    for (var a = 0; a < 4; a++) for (var b = a + 1; b < 4; b++) if (close(vals[a], vals[b])) return 'choice';
    return 'number';
  }

  /** The 1-based option whose value the typed text equals within one percent, or null. */
  function matchOption(text, options) {
    var v = parse(text);
    if (v === null) return null;
    for (var i = 0; i < (options || []).length; i++) {
      var h = optionValue(options[i]);
      if (h && close(v, h.value)) return i + 1;
    }
    return null;
  }

  return { normalise: normalise, parse: parse, optionValue: optionValue, answerKind: answerKind, matchOption: matchOption };
})();
