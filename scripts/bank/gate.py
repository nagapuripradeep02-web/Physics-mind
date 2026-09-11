"""The bank's mechanical gate. Built and proven BEFORE any API call is spent.

    python scripts/bank/gate.py selftest            # the comparator against fixtures/answers_equal.json ($0)
    python scripts/bank/gate.py selftest --judges   # + the equivalence judge and the syllabus judge against their plants
    python scripts/bank/gate.py run [--baseline | --freeze-baseline]     # gate every item (stage 3+; see run())

Why a new comparator instead of importing gate_solutions.check(): that rule compares an author's
value against the text of the OPTION they chose, so it only ever has to be self-consistent - the
option index is the real check. The bank has subjective and numerical items with no option index,
so the value comparison carries the whole weight, and the imported rule was verified (2026-09-11) to
hold four holes there: bare powers of ten (10⁻¹¹ ≡ 10¹¹), unit blindness (12.5 m/s ≡ 12.5 km/h),
multi-term ratios (1:2:3 ≡ 1:2:5) and substring passes (π/4 in 3π/4). Those four are the first
rows of the fixture, and a comparator that passes any of them is not believed.
"""
import os, io, re, sys, json, math, random, argparse, collections

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import _lib as L  # noqa: E402

FIX = os.path.join(L.HERE, "fixtures")

# ---------------------------------------------------------------- units (kinematics needs ~20)
_U = {}
def _u(dim, factor, *spellings):
    for s in spellings:
        _U[s] = (dim, factor)
_u("L", 1, "m", "metre", "meter", "metres", "meters")
_u("L", 0.01, "cm"); _u("L", 1e-3, "mm"); _u("L", 1e3, "km")
_u("T", 1, "s", "sec", "second", "seconds"); _u("T", 60, "min", "minute", "minutes"); _u("T", 3600, "h", "hr", "hour", "hours")
_u("V", 1, "m/s", "ms^-1", "m/sec", "metre/second", "m/second")
_u("V", 1 / 3.6, "km/h", "kmh^-1", "km/hr", "kmph", "km/hour")
_u("V", 0.01, "cm/s", "cms^-1"); _u("V", 1e-3, "mm/s")
_u("V", 1 / 60, "m/min", "mmin^-1"); _u("V", 1e3 / 60, "km/min", "kmmin^-1"); _u("V", 0.01 / 60, "cm/min")
_u("A", 1 / 3600, "m/min^2", "mmin^-2"); _u("A", 1e3 / 3600, "km/min^2", "kmmin^-2")
_u("A", 1, "m/s^2", "ms^-2", "m/s/s", "m/sec^2")
_u("A", 0.01, "cm/s^2", "cms^-2"); _u("A", 1e3 / 3600 ** 2, "km/h^2", "kmh^-2")
_u("ANG", 1, "rad", "radian", "radians"); _u("ANG", math.pi / 180, "°", "deg", "degree", "degrees")
_u("W", 1, "rad/s", "rads^-1"); _u("W", 2 * math.pi, "rev/s", "rps"); _u("W", 2 * math.pi / 60, "rpm", "rev/min")
_u("F", 1, "n", "newton", "newtons"); _u("E", 1, "j", "joule", "joules")
_u("M", 1, "kg"); _u("FREQ", 1, "hz")

_SUPTR = str.maketrans("⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺", "0123456789-+")
_SUBTR = str.maketrans("₀₁₂₃₄₅₆₇₈₉", "0123456789")


def unit_canon(u):
    u = (u or "").strip().lower().replace(" ", "").replace("·", "").replace("−", "-").replace("–", "-")
    u = re.sub(r"([⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+)", lambda m: "^" + m.group(1).translate(_SUPTR), u)
    u = u.replace("^-1", "^-1").replace("**", "^")
    u = u.rstrip(".")
    if u in _U:
        return u
    # a/b^n written as a b^-n
    m = re.fullmatch(r"([a-z°]+)/([a-z]+)\^?(\d)?", u)
    if m and u in _U:
        return u
    return u if u in _U else None


_UNIT_TOKEN = r"(?:°|[a-zA-Z]{1,7})(?:\^?[⁻\-]?[\d⁰¹²³⁴⁵⁶⁷⁸⁹]{1,2})?"
# at most three unit tokens at the very end - an unbounded (...)+ here backtracked exponentially on prose answers
_UNIT_TAIL = re.compile(r"((?:[ /·]{0,3}" + _UNIT_TOKEN + r"){1,3})[ ]*\.?[ ]*$")


def split_unit(s):
    """'20 m s⁻¹' -> ('20', 'ms^-1'); '√(2gh)' -> ('√(2gh)', None). Only a KNOWN unit is split off."""
    s = (s or "").strip()
    if len(s) > 60 or len(re.findall(r"[A-Za-z]{3,}", s)) > 3:
        return s, None                      # a sentence carries no trailing unit worth the search
    m = _UNIT_TAIL.search(s)
    if not m:
        return s, None
    tail = m.group(1)
    toks = re.findall(r"[ /·]{0,3}" + _UNIT_TOKEN, tail)
    for i in range(len(toks)):
        cand = "".join(toks[i:])
        cu = unit_canon(cand)
        if cu:
            head = s[:m.start(1)] + "".join(toks[:i])
            return head.strip(), cu
    return s, None


# ---------------------------------------------------------------- expressions via sympy
import sympy  # noqa: E402
from sympy.parsing.sympy_parser import (parse_expr, standard_transformations,  # noqa: E402
                                        implicit_multiplication_application, convert_xor)
_TRANS = standard_transformations + (implicit_multiplication_application, convert_xor)
_GREEK = {"π": "pi", "θ": "theta", "ω": "omega", "α": "alpha", "β": "beta", "μ": "mu", "Δ": "delta_",
          "λ": "lambda_", "φ": "phi", "ε": "epsilon", "ρ": "rho", "σ": "sigma", "τ": "tau", "γ": "gamma"}
_FRACS = {"½": "(1/2)", "¼": "(1/4)", "¾": "(3/4)", "⅓": "(1/3)", "⅔": "(2/3)", "⅛": "(1/8)"}
_SAFE = re.compile(r"^[0-9a-zA-Z_+\-*/^().,\s]*$")


def to_sympy_src(s):
    s = L.latex_to_unicode(s)
    s = s.replace("−", "-").replace("–", "-").replace("×", "*").replace("·", "*").replace("÷", "/").replace("x10", "*10")
    for k, v in _FRACS.items():
        s = s.replace(k, v)
    for k, v in _GREEK.items():
        s = s.replace(k, v)
    s = re.sub(r"\b(sin|cos|tan)\s*(?:⁻¹|\^\s*\(?-1\)?)", r"a\1", s)          # sin⁻¹(0.4) -> asin(0.4)
    s = re.sub(r"\barc(sin|cos|tan)\b", r"a\1", s)
    s = re.sub(r"([⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+)", lambda m: "^(" + m.group(1).translate(_SUPTR) + ")", s)
    s = re.sub(r"([a-zA-Z])([₀₁₂₃₄₅₆₇₈₉]+)", lambda m: m.group(1) + "_" + m.group(2).translate(_SUBTR), s)
    s = re.sub(r"(_\d+)(?=[a-zA-Z(])", r"\1 ", s)
    s = re.sub(r"(?<![a-zA-Z_\d])([a-zA-Z])(\d+)(?![\d.])", r"\1_\2", s)       # u0 -> u_0 (never u*0)
    s = s.replace("√", "sqrt")
    s = re.sub(r"sqrt(?!\()\s*([0-9a-zA-Z_.]+)", r"sqrt(\1)", s)
    s = re.sub(r"/(?!\()([0-9.]*[a-zA-Z_][a-zA-Z_0-9]*)", r"/(\1)", s)          # v²/2g -> v²/(2g)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def parse(s):
    src = to_sympy_src(s)
    if not src or not _SAFE.match(src) or len(src) > 120:
        return None
    # implicit multiplication turns a sentence into a product of hundreds of symbols and never returns
    if len([w for w in re.findall(r"[A-Za-z_]{4,}", src) if w.lower() not in _FUNCS]) > 2:
        return None
    try:
        e = parse_expr(src, transformations=_TRANS, evaluate=True)
    except Exception:  # noqa
        return None
    return e if isinstance(e, sympy.Basic) else None      # "False" parses to a Python bool


_FUNCS = {"sqrt", "sin", "cos", "tan", "cot", "sec", "log", "ln", "exp", "abs", "pi", "theta", "omega",
          "alpha", "beta", "mu", "delta", "lambda", "phi", "epsilon", "rho", "sigma", "tau", "gamma"}


def looks_like_words(s):
    """A prose answer ('Both downwards', 'False', 'two-dimensional motion'): real words rather than symbols.
    A hyphen between letters is punctuation, not a minus; three or more real words is prose whatever else it holds."""
    real = [w for w in re.findall(r"[A-Za-z]{3,}", s or "") if w.lower() not in _FUNCS]
    if len(real) >= 3:
        return True
    body = split_unit(s)[0]
    real = [w for w in re.findall(r"[A-Za-z]{3,}", body) if w.lower() not in _FUNCS]
    if re.search(r"\d|[+*/^=√×·]|(?<![A-Za-z])-|-(?![A-Za-z])", body):
        return False
    return bool(real)


def expr_equal(A, B):
    try:
        d = sympy.simplify(A - B)
        if d == 0:
            return True
    except Exception:  # noqa
        pass
    syms = sorted((A.free_symbols | B.free_symbols), key=str)
    rng = random.Random(7)
    for _ in range(3):
        sub = {s: rng.uniform(0.5, 3.0) for s in syms}
        try:
            a, b = complex(A.subs(sub).evalf()), complex(B.subs(sub).evalf())
        except Exception:  # noqa
            return False
        if abs(a - b) > 0.01 * max(abs(a), abs(b), 1e-9):
            return False
    return True


def number_of(s):
    """A float for a numeric expression ('2√2', 'π/15', '2×10³', '11/3', '−2/3'), else None."""
    e = parse(s)
    if e is None or e.free_symbols:
        return None
    try:
        v = complex(e.evalf())
    except Exception:  # noqa
        return None
    return v.real if abs(v.imag) < 1e-12 else None


def close(a, b, tol=0.01):
    return abs(a - b) <= tol * max(abs(a), abs(b), 1e-12)


# ---------------------------------------------------------------- the comparator
LETTERS = {"a": 1, "b": 2, "c": 3, "d": 4, "1": 1, "2": 2, "3": 3, "4": 4}
_LABEL = re.compile(r"\(?\b([a-d]|i{1,3}|iv)\)\s*", re.I)


def letter_of(s):
    s = (s or "").strip().lower().strip("()").strip(".")
    return LETTERS.get(s)


def parts_of(s):
    """'(a) 25 m, (b) 5 s' -> {'a': '25 m', 'b': '5 s'} or None. Needs at least two labelled parts."""
    pieces = re.split(r"(?:(?:^|(?<=[,;\s)]))\(([a-d]|i{1,3}|iv)\)|(?:^|(?<=[,;])\s*)([a-d]|i{1,3}|iv)\))\s*", " " + (s or ""))
    if len(pieces) < 4:
        return None
    out = {}
    for i in range(1, len(pieces) - 2, 3):
        lab = (pieces[i] or pieces[i + 1] or "").lower()
        out[lab] = (out.get(lab, "") + " " + pieces[i + 2].strip(" ,;.")).strip()
    return out if len(out) >= 2 else None


def list_of(s):
    if parts_of(s):
        return None
    items = [x.strip() for x in re.split(r",|;|\band\b", s or "") if x.strip()]
    return items if len(items) > 1 else None


def ratio_of(s):
    s = (s or "").strip()
    if ":" not in s and "∶" not in s:
        return None
    terms = [t.strip() for t in re.split(r"[:∶]", s)]
    vals = [number_of(t) for t in terms]
    if any(v is None for v in vals) or vals[0] == 0:
        return None
    return [v / vals[0] for v in vals]


def _number_pair(a, b, tol=0.01):
    va, ua = split_unit(a)
    vb, ub = split_unit(b)
    na, nb = number_of(va), number_of(vb)
    if na is None or nb is None:
        return None, "not_numbers"
    if ua and ub:
        if _U[ua][0] != _U[ub][0]:
            return False, "unit_dimension %s vs %s" % (ua, ub)
        return close(na * _U[ua][1], nb * _U[ub][1], tol), "number+unit"
    if (ua and _U[ua][0] == "ANG") or (ub and _U[ub][0] == "ANG"):      # 23.6° vs asin(0.4) (radians)
        fa, fb = (_U[ua][1] if ua else 1), (_U[ub][1] if ub else 1)
        return close(na, nb, tol) or close(na * fa, nb * fb, tol), "number angle"
    return close(na, nb, tol), ("number" if not (ua or ub) else "number unit_missing_one_side")


_APPROX = re.compile(r"^\s*(?:approximately|approx\.?|about|roughly|nearly|almost|≈|~)\s*", re.I)
_APPROX_TAIL = re.compile(r"\s*\((?:approx\.?|approximately)\)\s*$", re.I)
_SYMBOL_EQ = re.compile(r"^\s*[A-Za-zΔθωαβ][A-Za-z₀-₉_′'ₓᵧ]{0,4}(?:\([^()]{0,12}\))?\s*=\s*(?!=)")
_WORDNUM = {"zero": "0", "half": "1/2", "one": "1", "two": "2", "three": "3", "four": "4", "unity": "1"}
_OPPOSITES = [("up", "down"), ("upward", "downward"), ("upwards", "downwards"), ("east", "west"), ("north", "south"),
              ("positive", "negative"), ("clockwise", "anticlockwise"), ("clockwise", "counterclockwise"),
              ("left", "right"), ("upstream", "downstream"), ("forward", "backward"), ("toward", "away"),
              ("increasing", "decreasing"), ("increase", "decrease"), ("above", "below"), ("horizontal", "vertical")]
_CLAUSE_SEP = re.compile(r"\s+[—–-]\s+|,\s|;\s|\s\(|\s(?:because|since|as|so)\s", re.I)


_LEAD_APPROX = {"about", "approximately", "approx", "nearly", "roughly", "almost", "around"}
_YESNO = {"yes": True, "no": False, "true": True, "false": False, "possible": True, "not possible": False, "impossible": False}
_depth = 0
_span_ok = True


def _wordy(tok):
    t = tok.strip(",.;:()").lower()
    return bool(re.fullmatch(r"[a-z][a-z]+", t)) and t not in _FUNCS and t not in _WORDNUM and unit_canon(t) is None


def _math_spans(s):
    """Maximal runs of non-English tokens in a prose answer: 'meet at t = v₀/g + t₀/2 measured from' -> ['t = v₀/g + t₀/2']."""
    runs, cur = [], []
    for tok in s.split():
        if _wordy(tok):
            if cur:
                runs.append(" ".join(cur)); cur = []
        else:
            cur.append(tok)
    if cur:
        runs.append(" ".join(cur))
    out = []
    for r in runs:
        r = r.strip(" ,.;:=")
        if r and re.search(r"[\d=+\-−/√^²³°]|[A-Za-z]", r):
            out.append(r)
    return out


def _forms(s):
    """Candidate readings of one answer string: '25√2 m/s ≈ 35.36 m/s' -> both; 'v = 5 m/s' -> '5 m/s';
    '1287 cm (12.87 m)' -> both; 'speed = 60 s' -> '60 s'; a prose answer -> its first short clause and its
    maths spans (at most two, so a value mentioned in passing cannot stand in for the answer)."""
    s = (s or "").strip()
    out = []
    for piece in re.split(r"\s*≈\s*|\s+or\s+", s):
        piece = _SYMBOL_EQ.sub("", piece).strip()
        piece = _APPROX_TAIL.sub("", piece)
        if not piece:
            continue
        out.append(piece)
        if "=" in piece:
            rhs = piece.rsplit("=", 1)[1].strip(" .")
            if rhs and "=" not in rhs:
                out.append(rhs)
        m = re.fullmatch(r"(.+?)\s*\(([^()]*\d[^()]*)\)\s*\.?", piece)
        if m:
            out.append(m.group(1).strip())
            out.append(m.group(2).strip())
        if looks_like_words(piece):
            head = _CLAUSE_SEP.split(piece, 1)[0].strip(" .")
            if head and head != piece and len(head.split()) <= 4:
                out.append(head)
            spans = _math_spans(piece)
            if _span_ok and len(spans) <= 2:
                for sp in spans:
                    out.append(sp)
                    if "=" in sp:
                        out.append(sp.rsplit("=", 1)[1].strip())
    seen, uniq = set(), []
    for x in out:
        if x and x not in seen:
            seen.add(x); uniq.append(x)
    return uniq or [s]


def _qualifier_split(s):
    """'60 m downstream' -> ('60 m', ['downstream'], False); 'at about 12.31 m' -> ('12.31 m', ['at'], True).
    None if what is left is not a value."""
    s = re.sub(r"\s*\(([A-Za-z][A-Za-z\s\-]*)\)\s*\.?$", r" \1", s).strip()      # '25 m/s (downwards)'
    toks = s.split()
    lead, tail = [], []
    while toks and (_wordy(toks[0]) or (toks[0].lower() in ("a", "an") and len(toks) > 1 and _wordy(toks[1]))):
        lead.append(toks.pop(0).strip(",.;:").lower())
    while toks and _wordy(toks[-1]):
        tail.insert(0, toks.pop().strip(",.;:").lower())
    head = " ".join(toks).strip(" ,.;:")
    approx = bool(set(lead) & _LEAD_APPROX)
    quals = [w for w in lead + tail if w not in _LEAD_APPROX]
    if head and (number_of(split_unit(head)[0]) is not None or head.lower() in _WORDNUM):
        return head, quals, approx
    return None


def _core(s):
    """'5x − 4x² (parabola)' -> ('5x − 4x²', ['parabola']): the maths with its bracketed or trailing words removed."""
    s = re.sub(r"\s*\(([A-Za-z][A-Za-z\s\-]*)\)\s*\.?$", r" \1", s).strip()
    toks = s.split()
    words = []
    longword = lambda t: _wordy(t) and len(t.strip(",.;:()")) >= 3      # 'at' in 'u + at' is a product, not a word
    while toks and longword(toks[-1]):
        words.insert(0, toks.pop().strip(",.;:").lower())
    while toks and longword(toks[0]):
        words.append(toks.pop(0).strip(",.;:").lower())
    return " ".join(toks).strip(" ,.;:"), words


_UNK_UNIT = re.compile(r"^([-−+]?\d+(?:\.\d+)?(?:/\d+)?)\s+([A-Za-z°][A-Za-z²³⁰¹⁴-⁹⁻/·]*(?:\^-?\d)?)$")


def _drop_unknown_unit(s):
    """'-2 m²/s³' -> '-2' when the unit is not in the table: the number still compares, the unit is left to the
    auditor. Only a bare number followed by a unit-shaped token qualifies - 'v²/2g' is an expression."""
    m = _UNK_UNIT.match(s.strip())
    if m and unit_canon(m.group(2)) is None:
        return m.group(1).strip()
    return s


def _contradict(ta, tb):
    sa, sb = {w.rstrip("s") for w in ta}, {w.rstrip("s") for w in tb}
    for x, y in _OPPOSITES:
        if (x in sa and y in sb) or (y in sa and x in sb):
            return True
    return False


def _scalar_equal(a, b, kind):
    """One reading of each side, no parts/lists: numbers with units, expressions, words."""
    approx = bool(_APPROX.match(a) or _APPROX.match(b))
    a, b = _APPROX.sub("", a).strip(), _APPROX.sub("", b).strip()
    if a.lower() in _WORDNUM:
        a = _WORDNUM[a.lower()]
    if b.lower() in _WORDNUM:
        b = _WORDNUM[b.lower()]
    a, b = _drop_unknown_unit(a), _drop_unknown_unit(b)
    qa, qb = _qualifier_split(a), _qualifier_split(b)
    if qa and qb:
        approx = approx or qa[2] or qb[2]
        if _contradict(qa[1], qb[1]):
            return False, "qualifier_contradiction"
        ok, how = _number_pair(qa[0], qb[0], 0.02 if approx else 0.01)
        if ok is not None:
            return ok, how + (" +qualifier" if (qa[1] or qb[1]) else "")
        a, b = qa[0], qb[0]
    else:
        ca, cb = _core(a), _core(b)
        if ca[0] and cb[0] and (ca[1] or cb[1]) and not (looks_like_words(ca[0]) or looks_like_words(cb[0])):
            if _contradict(ca[1], cb[1]):
                return False, "qualifier_contradiction"
            a, b = ca[0], cb[0]
    ya, yb = a.strip(" .").lower(), b.strip(" .").lower()
    if ya in _YESNO or yb in _YESNO:
        if ya in _YESNO and yb in _YESNO:
            return _YESNO[ya] == _YESNO[yb], "yes_no"
        return None, "yes_no_vs_prose"
    plain = lambda s: bool(re.fullmatch(r"[A-Za-z][A-Za-z\s,\-]*", s))
    wordy = kind == "words" or (kind == "auto" and (looks_like_words(a) or looks_like_words(b) or (plain(a) and plain(b))))
    ok, how = (None, "words") if wordy else _number_pair(a, b, 0.02 if approx else 0.01)
    if ok is not None:
        return ok, how
    ea, eb = (None, None) if wordy else (parse(split_unit(a)[0]), parse(split_unit(b)[0]))
    if ea is not None and eb is not None and (ea.free_symbols or eb.free_symbols):
        ua, ub = split_unit(a)[1], split_unit(b)[1]
        if ua and ub and _U[ua][0] != _U[ub][0]:
            return False, "unit_dimension"
        return expr_equal(ea, eb), "expression"
    if kind in ("words", "auto"):
        ta, tb = _wordseq(a), _wordseq(b)
        if ta == tb:
            return True, "words"
        if not (set(ta) & set(tb)):
            return False, "words_disjoint"
        return None, "words_judge"
    return None, "undecided"


def _wordseq(s):
    """Content words in order, no de-duplication (L.tokens de-duplicates, which made a swapped
    'positive'/'negative' pair look identical)."""
    out = []
    for w in L.norm_text(s).split():
        if w in L.STOP or len(w) < 2:
            continue
        if len(w) > 3 and w.endswith("s") and not w.endswith("ss") and not w[0].isdigit():
            w = w[:-1]
        out.append(w)
    return out


def _single_equal(a, b, kind):
    """Every reading of a against every reading of b: any True wins; all False is False; else undecided."""
    hows, saw_false = [], False
    for x in _forms(a):
        for y in _forms(b):
            ok, how = _scalar_equal(x, y, kind)
            if ok is True:
                return True, how
            if ok is False:
                saw_false = True
            hows.append(how)
    if saw_false and all(h not in ("words_judge", "undecided", "words") for h in hows):
        return False, hows[0]
    return None, hows[0] if hows else "undecided"


def _list_match(la, lb, kind):
    """Order-free: every item of the shorter list must equal some unmatched item of the longer one."""
    short, long_ = (la, lb) if len(la) <= len(lb) else (lb, la)
    used, undecided = set(), False
    for x in short:
        hit = None
        for j, y in enumerate(long_):
            if j in used:
                continue
            ok, how = answers_equal(x, y, kind)
            if ok is True:
                hit = j; break
            if ok is None:
                undecided = True
        if hit is None:
            return None, "list_item_unmatched"          # the judge decides; a labelled multi-value answer is beyond this matcher
        used.add(hit)
    return True, ("list" if len(la) == len(lb) else "list_subset")


def _parts_ex(s):
    """(parts, preamble): the text before the first label, which a key that lost its '(a)' still carries."""
    p = parts_of(s)
    if not p:
        return None, ""
    m = re.search(r"(?:^|[,;\s])\(?([a-d]|i{1,3}|iv)\)", " " + s)
    pre = (" " + s)[:m.start()].strip(" ,;") if m else ""
    return p, pre


def answers_equal(a, b, kind="auto"):
    """(True|False|None, how). None = the comparator cannot decide; hand to the equivalence judge."""
    global _depth, _span_ok
    a, b = (a or "").strip(), (b or "").strip()
    if not a or not b:
        return None, "empty"
    if _depth == 0:
        # a prose answer that mentions three or more values must not match a key through one of them
        _span_ok = len(_math_spans(a)) <= 2 and len(_math_spans(b)) <= 2
    _depth += 1
    try:
        return _answers_equal(a, b, kind)
    finally:
        _depth -= 1


def _answers_equal(a, b, kind):
    if kind == "letter" or (kind == "auto" and letter_of(a) and letter_of(b) and len(a) <= 3 and len(b) <= 3):
        la, lb = letter_of(a), letter_of(b)
        return (la == lb) if la and lb else None, "letter"
    (pa, pre_a), (pb, pre_b) = _parts_ex(a), _parts_ex(b)
    if pa and pb:
        for p, pre, other in ((pa, pre_a, pb), (pb, pre_b, pa)):
            missing = [k for k in sorted(other) if k not in p and other[k]]
            if pre and missing:
                p[missing[0]] = pre
        keys = {k for k in set(pa) | set(pb) if pa.get(k) or pb.get(k)}     # "(c)" that only introduces (i)/(ii)
        common = sorted(k for k in keys if pa.get(k) and pb.get(k))
        if not common:
            return None, "parts_labels"
        for k in common:
            ok, how = answers_equal(pa[k], pb[k], "auto")
            if ok is not True:
                return ok, "part %s: %s" % (k, how)
        return True, ("parts" if len(common) == len(keys) else "parts_partial")
    if pa or pb:
        multi, single = (pa, b) if pa else (pb, a)
        for k, v in multi.items():
            if v and answers_equal(v, single, "auto")[0] is True:
                return True, "one_part_match %s" % k
        return None, "parts_vs_single"
    ra, rb = ratio_of(a), ratio_of(b)
    if ra and rb:
        if len(ra) != len(rb):
            return False, "ratio_terms"
        return all(close(x, y) for x, y in zip(ra, rb)), "ratio"
    la, lb = list_of(a), list_of(b)
    if la and lb:
        ok, how = _list_match(la, lb, "auto")
        if ok is not None:
            return ok, how
        if any(looks_like_words(x) for x in la + lb):
            return None, how
    elif la or lb:
        items, single = (la, b) if la else (lb, a)
        for x in items:
            if answers_equal(x, single, "auto")[0] is True:
                return True, "one_item_match"
    return _single_equal(a, b, kind)


# ---------------------------------------------------------------- the two model judges
EQUIV_PROMPT = ("Two final answers to the same physics question are given. Decide whether they are the SAME answer. "
                "SAME means: the same value within 1%% rounding in the same or an equivalent unit (55 m/min = 0.92 m/s), "
                "algebraically identical expressions (also when one is an exact form and the other its decimal), the same "
                "statement in other words, or the same physical claim with different symbol names for the same quantities. "
                "Extra explanation, a direction or qualifier stated on one side only, working shown, or one side listing MORE "
                "parts than the other (while every part both give agrees) do NOT make them different. "
                "A different number, a different unit dimension, an opposite sign or direction, or a contradicting physical "
                "claim means NOT the same. "
                "Reply with JSON only: {\"equivalent\": true|false, \"why\": \"<10 words>\"}.\nA: %s\nB: %s")


def equiv_judge(a, b):
    r = L.deepseek([{"role": "user", "content": EQUIV_PROMPT % (a, b)}], thinking=False, json_mode=True, max_tokens=200)
    j = L.json_of(r.get("content")) or {}
    return (j.get("equivalent") if isinstance(j.get("equivalent"), bool) else None), j.get("why") or r.get("error")


SYLLABUS_PROMPT = """You are checking whether a worked solution stays within the Indian Class 11-12 syllabus (NCERT) plus the standard coaching techniques JEE Main and EAPCET expect. Read the solution and list the techniques it USES to reach its answer.

ALLOWED: everything in the NCERT Class 11 and 12 syllabus for physics, chemistry and mathematics, plus the standard coaching techniques these exams expect: L'Hopital's rule, Leibniz rule for differentiating integrals, King's rule / symmetry properties of definite integrals, Feynman-style parameter differentiation, vector methods, dimensional analysis, standard approximations (binomial for small x), determinant/matrix properties up to 3x3, complex numbers as taught in Class 11, standard organic mechanisms and reagents of NCERT, the mole concept, and all shortcut formulas coaching institutes teach.

BEYOND SYLLABUS (flag these): Lagrangian or Hamiltonian mechanics, tensors, Laplace or Fourier transforms, contour integration or residues, matrix exponentials or eigen-decomposition beyond Class 12, multivariable calculus with Jacobians or partial-derivative chain rules, differential equations beyond first-order/simple second-order, group theory, advanced organic reagents or named reactions not in NCERT (e.g. Grubbs, Buchwald, Suzuki, Swern), molecular-orbital arguments beyond NCERT MOT, statistical mechanics, quantum mechanics beyond Bohr/de Broglie/photoelectric, and any university-level theorem invoked by name.

Reply with JSON only: {"techniques": [...], "beyond": ["... with 5-10 words why"], "verdict": "within" | "beyond"}
Mentioning a method in passing without using it is NOT beyond. Be strict about the list above and do not invent flags.

SOLUTION:
"""


def syllabus_judge(text):
    r = L.deepseek([{"role": "user", "content": SYLLABUS_PROMPT + text[:12000]}], thinking=False, json_mode=True, max_tokens=1200)
    j = L.json_of(r.get("content")) or {}
    return j.get("verdict"), j.get("beyond") or [], r.get("error")


def solution_text(sol):
    lines = [sol.get("approach", "")]
    for st in sol.get("steps", []):
        lines.append(st.get("text", ""))
        if st.get("equation"):
            lines.append("    " + st["equation"])
    fa = sol.get("final_answer") or {}
    lines.append("Final answer: %s" % fa.get("value", ""))
    return "\n".join(lines)


# ---------------------------------------------------------------- selftest
def selftest(with_judges):
    fx = L.load(os.path.join(FIX, "answers_equal.json"))
    bad = 0
    print("%-28s %-28s %-10s %-6s %-6s %s" % ("a", "b", "kind", "want", "got", "how"))
    for p in fx["pairs"]:
        got, how = answers_equal(p["a"], p["b"], p.get("kind", "auto"))
        want = p["expect"]
        ok = (got == want) or (want is None and p.get("judge") and got is None)
        bad += 0 if ok else 1
        print("%-28s %-28s %-10s %-6s %-6s %s%s" % (p["a"][:28], p["b"][:28], p.get("kind", "auto"), want, got, how,
                                                   "" if ok else "   <-- FAIL " + p.get("why", "")))
    print("comparator: %d pairs, %d failures" % (len(fx["pairs"]), bad))
    if with_judges:
        eq = L.load(os.path.join(FIX, "equiv_plants.json"))
        eb = 0
        for p in eq["pairs"]:
            got, why = equiv_judge(p["a"], p["b"])
            ok = got == p["expect"]
            eb += 0 if ok else 1
            print("  equiv-judge %-26s %-26s want %-5s got %-5s %s%s" % (p["a"][:26], p["b"][:26], p["expect"], got, (why or "")[:50], "" if ok else "  <-- FAIL"))
        print("equivalence judge: %d plants, %d failures" % (len(eq["pairs"]), eb))
        sy = L.load(os.path.join(FIX, "syllabus_plants.json"))
        sb = 0
        for p in sy["plants"]:
            verdict, beyond, err = syllabus_judge(p["solution"])
            ok = verdict == p["expect"]
            sb += 0 if ok else 1
            print("  syllabus-judge %-34s want %-7s got %-7s %s%s" % (p["name"][:34], p["expect"], verdict, ("; ".join(beyond) if beyond else (err or ""))[:60], "" if ok else "  <-- FAIL"))
        print("syllabus judge: %d plants, %d failures" % (len(sy["plants"]), sb))
        bad += eb + sb
    if bad:
        print("SELFTEST FAILED (%d)" % bad)
        sys.exit(1)
    print("SELFTEST OK")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["selftest", "run"])
    ap.add_argument("--judges", action="store_true")
    ap.add_argument("--baseline", action="store_true")
    ap.add_argument("--freeze-baseline", action="store_true")
    ap.add_argument("--verbose", action="store_true")
    a = ap.parse_args()
    if a.cmd == "selftest":
        selftest(a.judges)
    else:
        from gate_run import run  # noqa: F401  (stage 3: the item gate lives beside this comparator)
        run(a)


if __name__ == "__main__":
    main()
