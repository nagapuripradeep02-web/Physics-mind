"""Shared card builder for zoology unit 8 — Ecology and Environment.
Writes answer-book/questions/ts_ipe_z1_ee_*.json. Run from this directory."""
import json, io, os

QDIR = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                    '..', '..', '..', 'questions'))

UNIT = {"number": 8, "name": "Ecology and Environment (Zoology)"}
CHAPTER = "Ecology and Environment"

BASE_NOTE = (
    "Zoology holds only ONE source book — the TSBIE Basic Learning Material in hand "
    "covers physics only, and no zoology board paper is in the corpus — so the two-book "
    "union check and the back-test are both structurally impossible for this card; "
    "'not checked' does NOT mean 'checked and clean'. The mark split is a claim until a "
    "Telangana IPE teacher confirms it."
)

SEC = {
    "VSAQ": ("Section A", "Section A — Very Short Answer Question", 2, 4),
    "SAQ": ("Section B", "Section B — Short Answer Question", 4, 8),
    "LAQ": ("Section C", "Section C — Long Answer Question", 8, 15),
}

MANIFEST = []

_FIGS = {}
_FP = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'figs_ee.json')
if os.path.exists(_FP):
    _FIGS = json.load(io.open(_FP, encoding='utf-8'))


def getfig(fig_id):
    """The built figure, or a visible placeholder before gen_figs.py has run."""
    if fig_id in _FIGS:
        return _FIGS[fig_id]
    print(f"   (placeholder figure for {fig_id} — run gen_figs.py then rebuild)")
    return {"id": fig_id, "width": 440, "height": 224, "elements": [
        {"type": "pause", "id": "p1", "caption": "Step 1 — placeholder"},
        {"type": "stroke", "id": "todo", "d": "M 20 20 L 420 200", "ms": 1000},
    ]}


def app(*items):
    """(year, board|None) tuples -> appearances[]."""
    out = []
    for y, b in items:
        e = {"year": y}
        if b:
            e["board"] = b
        out.append(e)
    return out


def card(qid, qtype, page, qno, text, appearances, split, steps, insider,
         note_extra="", src_label=None):
    section, header, marks, mins = SEC[qtype]
    src = src_label or f"{qtype} {qno}"
    note = (f"Sourced from the Sri Chaitanya Junior Fastrack zoology section "
            f"(book p.{page}, {src}). " + BASE_NOTE)
    if note_extra:
        note += " " + note_extra
    q = {
        "schema_version": "answer_book_v1",
        "question_id": qid,
        "board": "ts_ipe",
        "board_label": "Telangana — Board of Intermediate Education",
        "subject": "zoology",
        "year_cycle": "first_year",
        "class_label": "Intermediate I Year (Class 11)",
        "unit": UNIT,
        "chapter": CHAPTER,
        "qtype": qtype,
        "marks_total": marks,
        "paper_section": section,
        "expected_time_min": mins,
        "question_text": text,
        "appearances": appearances,
        "mark_split": [{"label": l, "marks": m} for l, m in split],
        "verification": {
            "status": "unverified",
            "needs_teacher_verification": True,
            "note": note,
        },
        "answer": {
            "page_header": [header, f"{CHAPTER} · {marks} marks"],
            "steps": steps,
        },
        "insider_note": insider,
    }
    # ── author-side gates ────────────────────────────────────────────────
    bad = []
    if sum(s["marks"] for s in steps) != marks:
        bad.append(f"steps sum {sum(s['marks'] for s in steps)} != {marks}")
    if sum(m for _, m in split) != marks:
        bad.append(f"split sum != {marks}")
    ids = [s["id"] for s in steps]
    if len(ids) != len(set(ids)):
        bad.append("duplicate step ids")
    for s in steps:
        for f in ("why", "common_mistakes", "memory_tip", "margin_note"):
            if not s.get(f):
                bad.append(f"{s['id']}: missing {f}")
        if s["marks"] > 0 and not s.get("mark_note"):
            bad.append(f"{s['id']}: missing mark_note")
        if s["marks"] == 0 and s.get("mark_note"):
            bad.append(f"{s['id']}: mark_note on a 0-mark step")
        if len(s.get("common_mistakes", [])) > 3:
            bad.append(f"{s['id']}: >3 common_mistakes")
        if s["kind"] == "diagram":
            if not s.get("figure"):
                bad.append(f"{s['id']}: diagram without figure")
        else:
            if not s.get("lines"):
                bad.append(f"{s['id']}: no lines")
            for ln in s.get("lines", []):
                t = ln if isinstance(ln, str) else ln["text"]
                if len(t) > 52:
                    bad.append(f"{s['id']}: line {len(t)} chars: {t!r}")
    if bad:
        for b in bad:
            print(f"!! {qid}: {b}")
    path = os.path.join(QDIR, qid + ".json")
    io.open(path, "w", encoding="utf-8").write(
        json.dumps(q, indent=2, ensure_ascii=False) + "\n")
    MANIFEST.append({"ref": f"{qtype.lower()}{qno}", "section": qtype,
                     "number": qno, "stars": 0, "text": text,
                     "question_id": qid})
    return q


def step(id_, kind, label, marks, mark_note, lines, why, mistakes, tip, margin,
         figure=None):
    s = {"id": id_, "kind": kind, "label": label, "marks": marks}
    if mark_note:
        s["mark_note"] = mark_note
    if figure is not None:
        s["figure"] = figure
    else:
        s["lines"] = lines
    s["why"] = why
    s["common_mistakes"] = mistakes
    s["memory_tip"] = tip
    s["margin_note"] = margin
    return s


def boxed(t):
    return {"text": t, "style": "boxed"}


def dump_manifest(path):
    order = {"VSAQ": 0, "SAQ": 1, "LAQ": 2}
    rows = sorted(MANIFEST, key=lambda r: (order[r["section"]], r["number"]))
    frag = {"number": 8, "name": "Ecology and Environment (Zoology)",
            "subject": "zoology", "questions": rows}
    io.open(path, "w", encoding="utf-8").write(
        json.dumps(frag, indent=2, ensure_ascii=False) + "\n")
    print(f"manifest: {len(rows)} entries -> {path}")
