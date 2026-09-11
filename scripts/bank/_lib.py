"""Shared pieces for the book-derived solutions bank (scripts/bank/*).

Paths, JSON helpers, the model callers, and the normalisers every stage must share. The
normaliser is the one thing that MUST be the same on both sides of every comparison (bank
fingerprint vs photo query, author value vs printed key): a comparison that normalises one side
differently measures the normaliser, not the content.

Imports from scripts/eapcet/gate_solutions.py the functions that are path-free; never its
check(), whose comparison rule has holes for non-MCQ answers (see gate.py).
"""
import os, io, re, sys, json, time, base64, hashlib, datetime, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, "scripts", "eapcet"))
from gate_solutions import (norm_value, num_of, words, idioms_from_ts, idioms_in, MARKDOWN,   # noqa: E402
                            EXTRA_PLACEHOLDER, PERSONIFY, SUP, SUP_MAP)
from check_transcripts import PLACEHOLDER                                                       # noqa: E402

BOOK = "dcp_m1"                      # the evidence folder name; never written into a bank item
CHAPTER = os.environ.get("BANK_CHAPTER", "kinematics")
CFG = json.load(io.open(os.path.join(HERE, "chapters.json"), encoding="utf-8"))[CHAPTER]
PREFIX = CFG["prefix"]              # working ids <prefix>_<sha8>, bank ids bk_phy_<prefix>_<sha8>
BANK = os.path.join(ROOT, "bank", "physics", CHAPTER)
ITEMS = os.path.join(BANK, "items")
GATE = os.path.join(BANK, "_gate")
EVIDENCE = os.path.join(ROOT, "pdfs", "books", BOOK, CHAPTER)      # gitignored (/pdfs/)
PAGES = os.path.join(EVIDENCE, "pages")
CROPS = os.path.join(EVIDENCE, "crops")
WORK = os.path.join(EVIDENCE, "work")
def _source():
    """The source PDF and the chapter's page geometry live only in the gitignored evidence folder
    (source.json) - never in git. BANK_PDF overrides the path."""
    f = os.path.join(EVIDENCE, "source.json")
    src = json.load(open(f, encoding="utf-8")) if os.path.exists(f) else {}
    if os.environ.get("BANK_PDF"):
        src["pdf"] = os.environ["BANK_PDF"]
    return src


SRC = _source()
PDF = SRC.get("pdf")
GEOM = SRC.get("geometry") or {}
ENV_FILES = [os.path.join(ROOT, ".env.local"), r"C:\Tutor\physics-mind\.env.local"]

GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.7-flash")
DEEPSEEK_MODEL = "deepseek-flash"
GEMINI_EMBED = "gemini-embedding-001"


def load(p, default=None):
    try:
        return json.load(io.open(p, encoding="utf-8"))
    except (OSError, ValueError):
        return default


def save(p, obj):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    io.open(p, "w", encoding="utf-8").write(json.dumps(obj, indent=1, ensure_ascii=False))


def now():
    return datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=5, minutes=30))).isoformat(timespec="seconds")


def sha256(s):
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


def transcript_sha(j):
    """The working identity of a transcript: its text, its options and, when a figure carries the data, the values
    read off the figure (three 'as shown in figure' items can share one sentence and differ only in the drawing)."""
    f = j.get("figure") or {}
    fig = (f.get("values_read") or []) + ([f.get("description")] if f.get("description") else []) if f.get("present") else []
    return sha256(j["question_text"] + "|" + json.dumps(j.get("options") or [], ensure_ascii=False)
                  + ("|" + json.dumps(fig, ensure_ascii=False) if fig else ""))


def sha_of(obj, drop=("authored_by",)):
    return sha256(json.dumps({k: v for k, v in obj.items() if k not in drop}, sort_keys=True, ensure_ascii=False))


def env_key(name):
    v = os.environ.get(name)
    if v:
        return v
    for f in ENV_FILES:
        try:
            for line in io.open(f, encoding="utf-8"):
                if line.startswith(name + "="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
        except OSError:
            continue
    sys.exit("no %s in the environment or %s" % (name, ENV_FILES))


def jsonl_read(p):
    rows = []
    if os.path.exists(p):
        for line in io.open(p, encoding="utf-8"):
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def jsonl_append(p, row):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with io.open(p, "a", encoding="utf-8") as f:
        f.write(json.dumps(row, ensure_ascii=False) + "\n")


# ---------------------------------------------------------------- model callers (copied shapes)

def _post(url, body, headers, timeout=600, retries=5):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers=headers)
    last = None
    for attempt in range(retries + 1):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return json.load(r), None
        except urllib.error.HTTPError as e:
            msg = e.read().decode("utf-8", "replace")
            last = "HTTP %d %s" % (e.code, msg[:300].replace("\n", " "))
            if e.code == 429 and "PerDay" in msg:
                return None, "HTTP 429 daily quota"
            if e.code in (429, 500, 502, 503, 504) and attempt < retries:
                time.sleep(12 * (attempt + 1))
                continue
            return None, last
        except Exception as e:  # noqa
            last = repr(e)[:300]
            if attempt < retries:
                time.sleep(10)
                continue
            return None, last
    return None, last


def gemini(parts, max_out=8000, json_schema=None, temperature=None, thinking_budget=None):
    """parts: list of {'text': ...} / {'inline_data': {'mime_type','data'}}. Returns {content, usage, ms} or {error}."""
    gen = {"maxOutputTokens": max_out}
    if json_schema is not None:
        gen["responseMimeType"] = "application/json"
        gen["responseSchema"] = json_schema
    if temperature is not None:
        gen["temperature"] = temperature
    if thinking_budget is not None:
        gen["thinkingConfig"] = {"thinkingBudget": thinking_budget}
    body = {"contents": [{"parts": parts}], "generationConfig": gen}
    url = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s" % (GEMINI_MODEL, env_key("GOOGLE_GENERATIVE_AI_API_KEY"))
    t = time.time()
    j, err = _post(url, body, {"Content-Type": "application/json"})
    if err:
        return {"error": err, "ms": int((time.time() - t) * 1000)}
    try:
        c = j["candidates"][0]
    except (KeyError, IndexError):
        return {"error": "no candidates: " + json.dumps(j)[:300], "ms": int((time.time() - t) * 1000)}
    txt = "".join(p.get("text", "") for p in c.get("content", {}).get("parts", []) if not p.get("thought"))
    u = j.get("usageMetadata", {})
    return {"content": txt, "finish": c.get("finishReason"), "ms": int((time.time() - t) * 1000), "model": j.get("modelVersion"),
            "usage": {"prompt_tokens": u.get("promptTokenCount", 0),
                      "completion_tokens": u.get("candidatesTokenCount", 0) + u.get("thoughtsTokenCount", 0),
                      "thoughts": u.get("thoughtsTokenCount", 0)}}


def image_part(path):
    mime = "image/png" if path.lower().endswith(".png") else "image/jpeg"
    return {"inline_data": {"mime_type": mime, "data": base64.b64encode(open(path, "rb").read()).decode()}}


def deepseek(messages, effort="high", max_tokens=8000, json_mode=False, thinking=True):
    """DeepSeek V4.1 Flash chat. messages: [{'role','content'}] (content may be a parts list). Returns {content, reasoning_chars, usage, ms} or {error}."""
    body = {"model": DEEPSEEK_MODEL, "max_tokens": max_tokens, "messages": messages}
    if thinking:
        body["thinking"] = {"type": "enabled"}
        body["reasoning_effort"] = effort
    else:
        body["thinking"] = {"type": "disabled"}
    if json_mode:
        body["response_format"] = {"type": "json_object"}
    t = time.time()
    j, err = _post("https://api.deepseek.com/chat/completions", body,
                   {"Authorization": "Bearer " + env_key("DEEPSEEK_API_KEY"), "Content-Type": "application/json"}, timeout=900, retries=3)
    if err:
        return {"error": err, "ms": int((time.time() - t) * 1000)}
    msg = j["choices"][0]["message"]
    return {"content": msg.get("content") or "", "reasoning_chars": len(msg.get("reasoning_content") or ""),
            "usage": j.get("usage", {}), "finish": j["choices"][0].get("finish_reason"), "model": j.get("model"),
            "ms": int((time.time() - t) * 1000)}


def gemini_embed(texts):
    """gemini-embedding-001, 768 dims (the same model and size as ncert_content). Returns list of vectors or raises."""
    key = env_key("GOOGLE_GENERATIVE_AI_API_KEY")
    out = []
    for i in range(0, len(texts), 50):
        chunk = texts[i:i + 50]
        body = {"requests": [{"model": "models/" + GEMINI_EMBED, "content": {"parts": [{"text": t}]},
                              "outputDimensionality": 768} for t in chunk]}
        url = "https://generativelanguage.googleapis.com/v1beta/models/%s:batchEmbedContents?key=%s" % (GEMINI_EMBED, key)
        j, err = _post(url, body, {"Content-Type": "application/json"})
        if err:
            raise RuntimeError(err)
        out.extend([e["values"] for e in j["embeddings"]])
    return out


def json_of(text):
    """The first JSON object in a model reply, tolerating a ```json fence."""
    if not text:
        return None
    t = text.strip()
    m = re.search(r"```(?:json)?\s*(.*?)```", t, re.S)
    if m:
        t = m.group(1).strip()
    try:
        return json.loads(t)
    except ValueError:
        pass
    a, b = t.find("{"), t.rfind("}")
    if a >= 0 and b > a:
        try:
            return json.loads(t[a:b + 1])
        except ValueError:
            return None
    return None


# ---------------------------------------------------------------- text normalisers

_LATEX = [
    (re.compile(r"\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}"), r"(\1)/(\2)"),
    (re.compile(r"\\dfrac\s*\{([^{}]*)\}\s*\{([^{}]*)\}"), r"(\1)/(\2)"),
    (re.compile(r"\\sqrt\s*\{([^{}]*)\}"), r"√(\1)"),
    (re.compile(r"\\sqrt\s*(\w)"), r"√\1"),
    (re.compile(r"\\vec\s*\{([^{}]*)\}"), r"\1"),
    (re.compile(r"\\hat\s*\{([^{}]*)\}"), r"\1̂"),
    (re.compile(r"\\(?:text|mathrm|mathbf|mbox)\s*\{([^{}]*)\}"), r"\1"),
    (re.compile(r"\\left|\\right|\\,|\\;|\\!|\\ "), ""),
    (re.compile(r"\\times"), "×"), (re.compile(r"\\cdot"), "·"), (re.compile(r"\\pi"), "π"),
    (re.compile(r"\\theta"), "θ"), (re.compile(r"\\alpha"), "α"), (re.compile(r"\\beta"), "β"),
    (re.compile(r"\\omega"), "ω"), (re.compile(r"\\mu"), "μ"), (re.compile(r"\\Delta"), "Δ"),
    (re.compile(r"\\phi"), "φ"), (re.compile(r"\\lambda"), "λ"), (re.compile(r"\\infty"), "∞"),
    (re.compile(r"\\pm"), "±"), (re.compile(r"\\le(?:q)?\b"), "≤"), (re.compile(r"\\ge(?:q)?\b"), "≥"),
    (re.compile(r"\\ne(?:q)?\b"), "≠"), (re.compile(r"\\approx"), "≈"), (re.compile(r"\\to|\\rightarrow"), "→"),
    (re.compile(r"\\circ|\\degree|\^\{\\circ\}|\^\\circ"), "°"),
    (re.compile(r"\$+"), ""),
]
_SUPS = str.maketrans("0123456789-+()", "⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺⁽⁾")
_SUBS = str.maketrans("0123456789", "₀₁₂₃₄₅₆₇₈₉")


def _sup(m):
    body = m.group(1)
    return body.translate(_SUPS) if re.fullmatch(r"[-+]?\d+", body) else "^(" + body + ")"


def latex_to_unicode(s):
    """Deterministic LaTeX → the Unicode the bank prints. Applied to every model transcript before any gate."""
    if not s:
        return s or ""
    for rx, rep in _LATEX:
        s = rx.sub(rep, s)
    s = re.sub(r"\^\{([^{}]*)\}", _sup, s)
    s = re.sub(r"\^([-+]?\d)", lambda m: m.group(1).translate(_SUPS), s)
    s = re.sub(r"_\{(\d+)\}", lambda m: m.group(1).translate(_SUBS), s)
    s = re.sub(r"_(\d)", lambda m: m.group(1).translate(_SUBS), s)
    s = s.replace("{", "").replace("}", "")
    s = s.replace(" - ", " − ").replace("-->", "→")
    return re.sub(r"[ \t]+", " ", s).strip()


ASCII_MATHS = re.compile(r"\^\d|\bsqrt\b|->|\bdeg\b|x10\^|\\frac|\\sqrt|\bm2\b|\bs2\b|\bpi\b", re.I)


def ascii_maths_in(s):
    return sorted(set(m.group(0) for m in ASCII_MATHS.finditer(s or "")))


def norm_text(s):
    """The token normaliser shared by fingerprints and the lexical matcher (mirrors eapcet-app/js/58_match.js)."""
    import unicodedata
    s = (s or "").translate(str.maketrans(SUP + "₀₁₂₃₄₅₆₇₈₉", "0123456789-+0123456789"))
    s = unicodedata.normalize("NFKD", s).lower()
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


STOP = set("the a an of in on at to is are was were be by for with from as and or if then than that this it its "
           "which what when where how find given calculate determine value each also into".split())


def tokens(s):
    out, seen = [], set()
    for w in norm_text(s).split():
        if w in STOP:
            continue
        if len(w) > 3 and w.endswith("s") and not w.endswith("ss") and not w[0].isdigit():
            w = w[:-1]
        if w not in seen:
            seen.add(w)
            out.append(w)
    return out


def numeric_signature(s):
    """The multiset of numbers in a text, normalised - the discriminator between a hit and a numbers-changed twin."""
    # exponents (t², ms⁻¹, 10³) are not givens: strip them; a number may be followed by a letter (2t) or a full stop
    s = re.sub("[" + SUP + "]+", "", (s or "")).replace("−", "-")
    nums = re.findall(r"(?<![\w.])[-]?\d+(?:\.\d+)?(?!\d|\.\d)", s)
    out = []
    for n in nums:
        v = float(n)
        out.append(("%g" % v))
    return sorted(out)
