"""Ingest one book chapter into gitignored evidence: page renders, text-layer item markers, crops,
a contact sheet, vision transcripts, the printed key and hints, and a coverage check.

    python scripts/bank/ingest.py render       # pages -> pdfs/books/<book>/<chapter>/pages/pNNNN.png ($0)
    python scripts/bank/ingest.py locate       # text-layer markers + census -> items_manifest.json ($0)
    python scripts/bank/ingest.py crop         # marker-to-marker crops -> crops/<label>.png ($0)
    python scripts/bank/ingest.py sheet        # contact sheets for eyeballing -> crops/_sheet_NN.png ($0)
    python scripts/bank/ingest.py transcribe [--only LABEL...]   # Gemini per crop -> transcripts.jsonl (resumable)
    python scripts/bank/ingest.py key          # Answers pages, two readers -> key.json ; hints pages -> hints.json
    python scripts/bank/ingest.py check        # coverage gate: expected / found / missing / duplicate per tier

The text layer LOCATES; it never transcribes (its maths is exploded across lines). Crops are cut
from text-layer anchors with scripts/eapcet/crop_questions.crop(), never from model-reported
boxes. Every output lives under pdfs/ (gitignored) beside the founder's own PDF.
"""
import os, io, re, sys, json, argparse, collections
import pymupdf

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import _lib as L  # noqa: E402
from crop_questions import crop as crop_span  # noqa: E402  (scripts/eapcet on sys.path via _lib)

# chapter geometry (PDF page numbers, 1-based) comes from the gitignored source.json of the chapter:
# body = examples, intro exercises, Level 1, Level 2; hints_start = the chapter's heading in Hints & Solutions
if not L.GEOM:
    sys.exit("no geometry for chapter %s in %s/source.json" % (L.CHAPTER, L.EVIDENCE))
BODY = tuple(L.GEOM["body"])
LEVEL1 = tuple(L.GEOM["level1"])
ANSWERS = tuple(L.GEOM["answers"])
HINTS_START = L.GEOM["hints_start"]
DPI = 200
MANIFEST = os.path.join(L.EVIDENCE, "items_manifest.json")
TRANSCRIPTS = os.path.join(L.EVIDENCE, "transcripts.jsonl")
KEY = os.path.join(L.EVIDENCE, "key.json")
HINTS = os.path.join(L.EVIDENCE, "hints.json")

RX_EXAMPLE = re.compile(r"^\s*V?\s*Example\s+(\d+(?:\.\d+)?)\b")
RX_IE = re.compile(r"^\s*INTRODUCTORY\s+EXERCISE\s+(\d+\.\d+)", re.I)
RX_SECTION = re.compile(r"^\s*(\d\.\d{1,2})\s+[A-Z][A-Za-z]")          # "6.4 Uniformly Accelerated Motion"
RX_ENDBLOCK = re.compile(r"^\s*Final Touch Points\s*$", re.I)    # a chapter-end summary list numbered like questions
RX_LEVEL = re.compile(r"^\s*LEVEL\s*([12])\s*$", re.I)
RX_SUB = re.compile(r"^\s*(Assertion and Reason|Objective Questions|Single Correct Option|Subjective Questions|"
                    r"More than One Correct Options?|Comprehension Based Questions|Match the Columns)\s*$", re.I)
RX_ITEM = re.compile(r"^\s*(\d{1,2})\.\s+\S")
RX_ANSWERS = re.compile(r"^\s*Answers\s*$")
RX_DIRECTIONS = re.compile(r"^\s*Directions\b")
SUBCODE = {"assertion and reason": "AR", "objective questions": "SC", "single correct option": "SC",
           "subjective questions": "SUB", "more than one correct option": "MC", "more than one correct options": "MC",
           "comprehension based questions": "CB", "match the columns": "MT"}
LEFT_MARGIN_PT = 120       # item numbers sit at x≈85-96 pt; sub-parts (a)/(b) at ≈104 are a different regex; prose deeper


def doc():
    return pymupdf.open(L.PDF)


def lines_of(page):
    """(x0, y0, text) per text line, in reading order."""
    out = []
    for b in page.get_text("dict")["blocks"]:
        for ln in b.get("lines", []):
            t = "".join(s["text"] for s in ln["spans"]).strip()
            if t:
                out.append((ln["bbox"][0], ln["bbox"][1], t))
    out.sort(key=lambda r: (round(r[1]), r[0]))
    return out


def slug(label):
    return re.sub(r"[^A-Za-z0-9.]+", "_", label).strip("_")


# ---------------------------------------------------------------- render
def cmd_render(a):
    d = doc()
    os.makedirs(L.PAGES, exist_ok=True)
    end_hints = hints_end(d)
    pages = list(range(BODY[0], ANSWERS[1] + 1)) + list(range(HINTS_START, end_hints + 1))
    n = 0
    for p in pages:
        out = os.path.join(L.PAGES, "p%04d.png" % p)
        if os.path.exists(out):
            continue
        d[p - 1].get_pixmap(dpi=DPI).save(out)
        n += 1
    print("rendered %d new pages (%d total requested) -> %s" % (n, len(pages), L.PAGES))


def hints_end(d):
    """The last hints page of this chapter: the page before the next chapter's heading in the hints section."""
    for p in range(HINTS_START + 1, min(d.page_count, HINTS_START + 60)):
        t = d[p - 1].get_text()
        if re.search(r"^\s*" + re.escape(L.GEOM["hints_end_heading"]).replace(r"\ ", r"\s*") + r"\s*$", t, re.M):
            return p - 1
    return HINTS_START + 12


# ---------------------------------------------------------------- locate
def cmd_locate(a):
    d = doc()
    markers = []        # dicts: label, kind (item|boundary|context), tier, page (1-based), y, text
    state = {"tier": "EX", "ie": None, "level": None, "sub": None, "expect": None, "block": None}
    census = collections.Counter()
    ignored = []
    for p in range(BODY[0], BODY[1] + 1):
        page = d[p - 1]
        for x0, y0, t in lines_of(page):
            m = RX_LEVEL.match(t)
            if m:
                state.update(level=m.group(1), sub=None, expect=None, block="L%s" % m.group(1), tier="L%s" % m.group(1))
                markers.append(dict(label="LEVEL %s" % m.group(1), kind="boundary", page=p, y=y0, text=t))
                continue
            if RX_ANSWERS.match(t) and p >= LEVEL1[0]:
                markers.append(dict(label="ANSWERS", kind="boundary", page=p, y=y0, text=t))
                state.update(block=None)
                continue
            m = RX_SUB.match(t)
            if m and state["level"]:
                code = SUBCODE[m.group(1).lower()]
                state.update(sub=code, expect=1, block="L%s %s" % (state["level"], code))
                markers.append(dict(label="L%s %s HEAD" % (state["level"], code), kind="boundary", page=p, y=y0, text=t))
                continue
            if RX_DIRECTIONS.match(t) and state["block"]:
                markers.append(dict(label=state["block"] + " DIRECTIONS", kind="context", tier=state["tier"], page=p, y=y0, text=t))
                continue
            m = RX_EXAMPLE.match(t)
            if m and not state["level"]:
                lab = "EX " + m.group(1)
                markers.append(dict(label=lab, kind="item", tier="EX", page=p, y=y0, text=t))
                census["EX"] += 1
                state.update(ie=None, expect=None, block="EX")
                continue
            m = RX_IE.match(t)
            if m and not state["level"]:
                # the FIRST occurrence is the exercise; the Answers page repeats the heading
                state.update(ie=m.group(1), expect=1, block="IE " + m.group(1), tier="IE")
                markers.append(dict(label="IE %s HEAD" % m.group(1), kind="boundary", page=p, y=y0, text=t))
                continue
            m = RX_SECTION.match(t)
            if m and not state["level"] and x0 < LEFT_MARGIN_PT:
                markers.append(dict(label="SECTION " + m.group(1), kind="boundary", page=p, y=y0, text=t))
                state.update(ie=None, expect=None, block=None)
                continue
            if RX_ENDBLOCK.match(t) and not state["level"]:
                markers.append(dict(label="END " + t.strip().upper(), kind="boundary", page=p, y=y0, text=t))
                state.update(ie=None, expect=None, block=None)
                continue
            m = RX_ITEM.match(t)
            if m and state["expect"] is not None and state["block"] and x0 < LEFT_MARGIN_PT:
                n = int(m.group(1))
                if n == state["expect"]:
                    lab = "%s Q%d" % (state["block"], n)
                    tier = "IE" if state["block"].startswith("IE") else state["block"].split()[0]
                    markers.append(dict(label=lab, kind="item", tier=tier if tier != "L1" else "L1 " + state["sub"], page=p, y=y0, text=t))
                    census[markers[-1]["tier"]] += 1
                    state["expect"] = n + 1
                else:
                    ignored.append((p, t[:50], "expected %s" % state["expect"]))
    # keep only what is in scope: examples, intro exercises, Level 1 (Level 2 markers stay as boundaries)
    in_scope = [m for m in markers if m["kind"] != "item" or m["tier"] in ("EX", "IE") or m["tier"].startswith("L1 ")]
    L.save(MANIFEST, {"pdf_pages": list(BODY), "dpi": DPI, "markers": in_scope, "census": dict(census),
                      "ignored_numbers": ignored[:40], "located_at": L.now()})
    print("markers: %d (items %d, boundaries %d, context %d)" % (len(in_scope), sum(m["kind"] == "item" for m in in_scope),
                                                                  sum(m["kind"] == "boundary" for m in in_scope),
                                                                  sum(m["kind"] == "context" for m in in_scope)))
    for k, v in sorted(census.items()):
        print("  %-8s %3d" % (k, v))
    if ignored:
        print("  numbered lines ignored (not the expected next item): %d, e.g. %s" % (len(ignored), ignored[:3]))


# ---------------------------------------------------------------- crop
def marker_tuples(markers):
    """crop_questions.crop() wants [(label, page_index0, y)] in document order, and uses the NEXT
    entry as the end of a span - so boundaries ride along in the list and are simply never cropped."""
    return [(m["label"], m["page"] - 1, m["y"]) for m in markers]


def stitch(pixmaps):
    from PIL import Image
    ims = [Image.open(io.BytesIO(px.tobytes("png"))) for px in pixmaps]
    if len(ims) == 1:
        return ims[0]
    w = max(i.width for i in ims)
    h = sum(i.height for i in ims)
    out = Image.new("RGB", (w, h), (255, 255, 255))
    y = 0
    for i in ims:
        out.paste(i, (0, y))
        y += i.height
    return out


def cmd_crop(a):
    man = L.load(MANIFEST) or sys.exit("run locate first")
    d = doc()
    mk = marker_tuples(man["markers"])
    os.makedirs(L.CROPS, exist_ok=True)
    n = 0
    for i, m in enumerate(man["markers"]):
        if m["kind"] not in ("item", "context"):
            continue
        out = os.path.join(L.CROPS, slug(m["label"]) + ".png")
        m["crop"] = os.path.relpath(out, L.EVIDENCE).replace(os.sep, "/")
        if os.path.exists(out) and not a.force:
            continue
        parts = crop_span(d, mk, i, dpi=DPI, pad=8, tail_pages=1)
        img = stitch(parts)
        img.save(out)
        m["crop_parts"] = len(parts)
        n += 1
    L.save(MANIFEST, man)
    print("cropped %d new -> %s" % (n, L.CROPS))


def cmd_sheet(a):
    from PIL import Image, ImageDraw
    man = L.load(MANIFEST) or sys.exit("run locate first")
    items = [m for m in man["markers"] if m.get("crop")]
    per, cols, cw = 12, 3, 520
    k = 0
    for s in range(0, len(items), per):
        batch = items[s:s + per]
        tiles = []
        for m in batch:
            im = Image.open(os.path.join(L.EVIDENCE, m["crop"])).convert("RGB")
            r = cw / im.width
            im = im.resize((cw, max(1, int(im.height * r))))
            if im.height > 700:
                im = im.crop((0, 0, cw, 700))
            tiles.append((m["label"], im))
        rows = (len(tiles) + cols - 1) // cols
        rh = [max(t[1].height for t in tiles[r * cols:(r + 1) * cols]) + 28 for r in range(rows)]
        sheet = Image.new("RGB", (cols * (cw + 10), sum(rh) + 10), (235, 235, 235))
        dr = ImageDraw.Draw(sheet)
        y = 5
        for r in range(rows):
            for c in range(cols):
                idx = r * cols + c
                if idx >= len(tiles):
                    break
                lab, im = tiles[idx]
                x = 5 + c * (cw + 10)
                dr.text((x + 4, y + 4), lab, fill=(200, 0, 0))
                sheet.paste(im, (x, y + 24))
            y += rh[r]
        k += 1
        sheet.save(os.path.join(L.CROPS, "_sheet_%02d.png" % k))
    print("contact sheets: %d -> %s/_sheet_NN.png" % (k, L.CROPS))


# ---------------------------------------------------------------- transcribe (Gemini per crop)
TRANSCRIBE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "label_seen": {"type": "STRING", "description": "the item label printed at the top of the image, e.g. 'Example 2.3', '4.', '12.'"},
        "kind": {"type": "STRING", "enum": ["worked_example", "exercise"]},
        "format": {"type": "STRING", "enum": ["mcq_single", "assertion_reason", "subjective", "numerical", "conceptual"]},
        "question_text": {"type": "STRING", "description": "the question exactly as printed, maths in Unicode (², ⁻¹, √, π, ½, −, ×) not LaTeX; for an assertion-reason item write 'Assertion: ... Reason: ...'"},
        "options": {"type": "ARRAY", "items": {"type": "OBJECT", "properties": {"label": {"type": "STRING"}, "text": {"type": "STRING"}}, "required": ["label", "text"]}},
        "parts": {"type": "ARRAY", "items": {"type": "STRING"}, "description": "sub-part labels present, e.g. ['a','b','c'], else empty"},
        "figure": {"type": "OBJECT", "properties": {
            "present": {"type": "BOOLEAN"},
            "description": {"type": "STRING", "description": "what the drawing shows, in words a solver could work from"},
            "values_read": {"type": "ARRAY", "items": {"type": "STRING"}, "description": "every number or label readable on the figure, with its meaning"}},
            "required": ["present"]},
        "printed_solution": {"type": "STRING", "description": "for a worked example: the printed solution text verbatim (Unicode maths); else empty"},
        "printed_answer": {"type": "STRING", "description": "a final answer printed inside this crop (an 'Ans.' line); else empty"},
        "truncated": {"type": "BOOLEAN", "description": "true if the item is visibly cut off at the bottom or top of the image"},
        "extra_items_visible": {"type": "BOOLEAN", "description": "true if a second numbered item is visible in the image"}
    },
    "required": ["label_seen", "kind", "format", "question_text", "options", "figure", "truncated", "extra_items_visible"]
}
TRANSCRIBE_PROMPT = ("Transcribe ONE physics item from this image exactly as printed. The item begins at the numbered label "
                     "near the top of the image (e.g. 'Example 2.3' or '12.'); ignore any lines above that label (they belong to "
                     "the previous item), and ignore any theory paragraphs, headings, page numbers, watermarks or a further numbered "
                     "item that appear after it. Do not solve it, do not correct it, "
                     "do not add anything. Keep the book's wording. Write all mathematics in Unicode characters "
                     "(superscripts ² ³ ⁻¹, √, π, ½, −, ×, °, θ, Δ), never LaTeX. If the item has options (a)–(d), list them. "
                     "If a drawing is present, describe it and list every value readable on it. If a printed solution "
                     "follows the question (a worked example), copy it too. Return JSON only.")


def cmd_transcribe(a):
    man = L.load(MANIFEST) or sys.exit("run crop first")
    done = {r["label"]: r for r in L.jsonl_read(TRANSCRIPTS)}
    todo = [m for m in man["markers"] if m["kind"] == "item" and m.get("crop") and (m["label"] not in done or a.force)
            and (not a.only or m["label"] in a.only)]
    print("transcribe: %d items, %d already done" % (len(todo), len(done)))
    cost = 0.0
    for i, m in enumerate(todo):
        ctx = [c for c in man["markers"] if c["kind"] == "context" and c["label"].startswith(m["tier"] if m["tier"].startswith("L1") else "\x00")]
        parts = [{"text": TRANSCRIBE_PROMPT}]
        for c in ctx:
            if c.get("crop"):
                parts.append({"text": "Context block printed above this item (directions shared by several items):"})
                parts.append(L.image_part(os.path.join(L.EVIDENCE, c["crop"])))
        parts.append({"text": "The item:"})
        parts.append(L.image_part(os.path.join(L.EVIDENCE, m["crop"])))
        r = L.gemini(parts, max_out=6000, json_schema=TRANSCRIBE_SCHEMA, temperature=0)
        if "error" in r:
            print("  %-14s ERROR %s" % (m["label"], r["error"][:120]))
            if "daily quota" in r["error"]:
                break
            continue
        j = L.json_of(r["content"]) or {}
        if not j.get("question_text"):
            print("  %-14s EMPTY reply (%s)" % (m["label"], r.get("finish")))
            continue
        for k in ("question_text", "printed_solution", "printed_answer"):
            if j.get(k):
                j[k] = L.latex_to_unicode(j[k])
        for o in j.get("options") or []:
            o["text"] = L.latex_to_unicode(o.get("text", ""))
        row = {"label": m["label"], "tier": m["tier"], "page": m["page"], "crop": m["crop"], **j,
               "sha": L.transcript_sha(j),
               "usage": r.get("usage"), "ms": r.get("ms"), "model": r.get("model"), "at": L.now()}
        L.jsonl_append(TRANSCRIPTS, row)
        u = r.get("usage") or {}
        cost += u.get("prompt_tokens", 0) * 0.75e-6 + u.get("completion_tokens", 0) * 3.75e-6
        print("  %-14s %-16s opts %d fig %s trunc %s  %5d ms" % (m["label"], j.get("format"), len(j.get("options") or []),
                                                                   "Y" if (j.get("figure") or {}).get("present") else "-",
                                                                   "Y" if j.get("truncated") else "-", r.get("ms", 0)))
    print("done; approx cost $%.3f" % cost)


# ---------------------------------------------------------------- key + hints
KEY_SCHEMA = {"type": "OBJECT", "properties": {"entries": {"type": "ARRAY", "items": {"type": "OBJECT", "properties": {
    "section": {"type": "STRING", "description": "the heading the entry sits under, e.g. 'Introductory Exercise 6.3', 'LEVEL 1 Assertion and Reason', 'LEVEL 1 Objective Questions', 'LEVEL 1 Subjective Questions', 'LEVEL 2 ...'"},
    "item_no": {"type": "INTEGER"},
    "answer": {"type": "STRING", "description": "the printed answer verbatim, Unicode maths; for options write the letter as printed e.g. '(b)'; for multi-part answers keep '(a) ... (b) ...'"}},
    "required": ["section", "item_no", "answer"]}}}, "required": ["entries"]}
KEY_PROMPT = ("This is an answers page of a physics textbook chapter. Transcribe EVERY entry: the section heading it belongs "
              "to, the item number, and the printed answer exactly as printed (Unicode maths, never LaTeX). Do not solve, "
              "do not correct. Return JSON only.")
HINT_SCHEMA = {"type": "OBJECT", "properties": {"entries": {"type": "ARRAY", "items": {"type": "OBJECT", "properties": {
    "section": {"type": "STRING", "description": "e.g. 'Introductory Exercise 6.3', 'LEVEL 1 Assertion and Reason', 'LEVEL 1 Objective Questions', 'LEVEL 1 Subjective Questions'; copy the nearest heading"},
    "item_no": {"type": "INTEGER"},
    "final_value": {"type": "STRING", "description": "the final result the printed hint reaches (value with unit, an option letter, or a short statement); empty if the hint reaches none"},
    "method": {"type": "STRING", "description": "one line: the method the printed hint uses"}},
    "required": ["section", "item_no", "final_value", "method"]}}}, "required": ["entries"]}
HINT_PROMPT = ("This is a 'Hints & Solutions' page of a physics textbook. For EVERY numbered entry on it, give the section "
               "heading it belongs to, the item number, the final value the printed working reaches, and its method in one "
               "line. Two columns: read the left column top to bottom, then the right. Do not solve anything yourself. Return JSON only.")


def text_layer_key(d):
    """The cheap second reader of the Answers pages: letters and simple values the text layer prints cleanly."""
    out, section = {}, None
    for p in range(ANSWERS[0], ANSWERS[1] + 1):
        # the text layer often prints "1." and its answer as separate lines at the same height: re-join by row
        lines = lines_of(d[p - 1])
        used, rows = [False] * len(lines), []
        for i, (x0, y0, t) in enumerate(lines):
            if used[i]:
                continue
            grp = []
            for j, (x, y, tt) in enumerate(lines):
                if not used[j] and abs(y - y0) <= 4:
                    used[j] = True
                    grp.append((x, tt))
            rows.append(" ".join(tt for x, tt in sorted(grp)))
        for t in rows:
            m = re.match(r"^\s*(Introductory Exercise \d\.\d|LEVEL \d|Assertion and Reason|Objective Questions|Single Correct Option|Subjective Questions|More than One Correct Options?|Comprehension Based Questions|Match the Columns)\s*$", t, re.I)
            if m:
                s = m.group(1)
                section = s if s.lower().startswith(("introductory", "level")) else ((section.split(" ")[0] + " " + section.split(" ")[1] + " " if section and section.upper().startswith("LEVEL") else "") + s)
                continue
            for n, ans in re.findall(r"(\d{1,2})\.\s*(\([a-d]\)|True|False|Yes|No)\b", t):
                out[(section or "?", int(n))] = ans
    return out


def cmd_key(a):
    d = doc()
    entries = []
    for p in range(ANSWERS[0], ANSWERS[1] + 1):
        img = os.path.join(L.PAGES, "p%04d.png" % p)
        if not os.path.exists(img):
            sys.exit("render first (missing %s)" % img)
        r = L.gemini([{"text": KEY_PROMPT}, L.image_part(img)], max_out=8000, json_schema=KEY_SCHEMA, temperature=0)
        j = L.json_of(r.get("content")) or {}
        for e in j.get("entries", []):
            e["answer"] = L.latex_to_unicode(e.get("answer", ""))
            e["page"] = p
            entries.append(e)
        print("  answers page %d: %d entries%s" % (p, len(j.get("entries", [])), "  ERROR " + r["error"] if "error" in r else ""))
    tl = text_layer_key(d)
    disagree = []
    for e in entries:
        k = (e["section"], e["item_no"])
        for (sec, n), ans in tl.items():
            if n == e["item_no"] and sec.lower().replace("level 1 ", "") in e["section"].lower().replace("level 1 ", ""):
                if L.norm_text(ans) not in L.norm_text(e["answer"]):
                    disagree.append({"section": e["section"], "item_no": n, "vision": e["answer"], "text_layer": ans})
    L.save(KEY, {"entries": entries, "text_layer_reader": {"%s|%d" % k: v for k, v in tl.items()}, "disagreements": disagree, "at": L.now()})
    print("key: %d entries, text-layer reader %d, disagreements %d -> %s" % (len(entries), len(tl), len(disagree), KEY))
    for x in disagree[:20]:
        print("   DISAGREE", x)
    # hints
    hints = []
    for p in range(HINTS_START, hints_end(d) + 1):
        img = os.path.join(L.PAGES, "p%04d.png" % p)
        r = L.gemini([{"text": HINT_PROMPT}, L.image_part(img)], max_out=8000, json_schema=HINT_SCHEMA, temperature=0)
        j = L.json_of(r.get("content")) or {}
        for e in j.get("entries", []):
            e["final_value"] = L.latex_to_unicode(e.get("final_value", ""))
            e["page"] = p
            hints.append(e)
        print("  hints page %d: %d entries%s" % (p, len(j.get("entries", [])), "  ERROR " + r["error"] if "error" in r else ""))
    L.save(HINTS, {"entries": hints, "pages": [HINTS_START, hints_end(d)], "at": L.now()})
    print("hints: %d entries -> %s" % (len(hints), HINTS))


# ---------------------------------------------------------------- check
def key_section_of(label):
    """'IE 6.3 Q4' -> ('introductory exercise 6.3', 4); 'L1 SC Q12' -> ('level 1 objective', 12)."""
    m = re.match(r"IE (\d\.\d) Q(\d+)", label)
    if m:
        return "introductory exercise " + m.group(1), int(m.group(2))
    m = re.match(r"L1 (AR|SC|SUB) Q(\d+)", label)
    if m:
        return {"AR": "level 1 assertion", "SC": "level 1 objective", "SUB": "level 1 subjective"}[m.group(1)], int(m.group(2))
    return None, None


def find_key(key, label):
    sec, n = key_section_of(label)
    if not sec:
        return None
    for e in key.get("entries", []):
        s = e["section"].lower().replace("single correct option", "objective questions")
        if e["item_no"] == n and all(w in s for w in sec.split()[:2]) and (sec.split()[-1] in s):
            return e["answer"]
    return None


def cmd_check(a):
    man = L.load(MANIFEST) or sys.exit("run locate first")
    tr = {r["label"]: r for r in L.jsonl_read(TRANSCRIPTS)}
    key = L.load(KEY, {"entries": []})
    items = [m for m in man["markers"] if m["kind"] == "item"]
    by_tier = collections.defaultdict(list)
    for m in items:
        by_tier[m["tier"]].append(m["label"])
    problems = collections.defaultdict(list)
    dup = [l for l, c in collections.Counter(m["label"] for m in items).items() if c > 1]
    print("%-10s %8s %8s %8s %8s %8s %8s" % ("tier", "expected", "transcr", "missing", "trunc", "nokey", "ascii"))
    for tier, labels in sorted(by_tier.items()):
        missing = [l for l in labels if l not in tr]
        trunc = [l for l in labels if l in tr and tr[l].get("truncated")]
        nokey = [l for l in labels if tier != "EX" and l in tr and not find_key(key, l)]
        asc = [l for l in labels if l in tr and L.ascii_maths_in(tr[l].get("question_text", "") + " " + " ".join(o.get("text", "") for o in tr[l].get("options") or []))]
        problems["missing"] += missing; problems["truncated"] += trunc; problems["no_key"] += nokey; problems["ascii"] += asc
        print("%-10s %8d %8d %8d %8d %8d %8d" % (tier, len(labels), len(labels) - len(missing), len(missing), len(trunc), len(nokey), len(asc)))
    print("duplicate labels: %d %s" % (len(dup), dup[:5]))
    for k, v in problems.items():
        if v:
            print("  %-10s %d: %s" % (k, len(v), v[:8]))
    extra = [l for l, r in tr.items() if r.get("extra_items_visible")]
    if extra:
        print("  crops showing a second item (check the cut): %d %s" % (len(extra), extra[:8]))
    ok = not problems["missing"] and not dup
    print("COVERAGE", "OK" if ok else "INCOMPLETE")
    return ok


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["render", "locate", "crop", "sheet", "transcribe", "key", "check"])
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--only", nargs="*")
    a = ap.parse_args()
    if a.cmd in ("transcribe", "key") and not os.environ.get("BANK_ALLOW_API"):
        sys.exit("%s would call a paid API. Use audit.py plan --role %s + solve.py collect; set BANK_ALLOW_API=1 to override."
                 % (a.cmd, "reader" if a.cmd == "transcribe" else "keyreader"))
    globals()["cmd_" + a.cmd](a)


if __name__ == "__main__":
    main()
