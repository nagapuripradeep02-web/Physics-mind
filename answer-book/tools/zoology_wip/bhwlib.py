"""Shared card builder for Unit 6 — Biology in Human Welfare (Zoology).

Wraps every authored paragraph at 48 characters on word boundaries, so no
line ever exceeds the ~52-character ruled row.  Emits one question file per
card into answer-book/questions/.
"""
import json, io, os, textwrap

QDIR = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                    '..', '..', 'questions'))

UNIT = {"number": 6, "name": "Biology in Human Welfare (Zoology)"}
CHAPTER = "Biology in Human Welfare"

SECTION = {"VSAQ": ("Section A", "Section A — Very Short Answer Question", 2, 4),
           "SAQ": ("Section B", "Section B — Short Answer Question", 4, 8),
           "LAQ": ("Section C", "Section C — Long Answer Question", 8, 15)}

NOTE_BASE = (
    "Sourced from the Sri Chaitanya Junior Fastrack zoology section "
    "(book p.{page}, {ref}). Zoology holds only ONE source book — the TSBIE "
    "Basic Learning Material in hand covers physics only, and no zoology "
    "board paper is in the corpus — so the two-book union check and the "
    "back-test are both structurally impossible for this card; 'not checked' "
    "does NOT mean 'checked and clean'. The mark split is a claim until a "
    "Telangana IPE teacher confirms it."
)

WIDTH = 48
_long = []


def T(*paras):
    """Wrap authored paragraphs into ruled lines."""
    out = []
    for p in paras:
        for ln in textwrap.wrap(p, WIDTH):
            if len(ln) > 52:
                _long.append(ln)
            out.append(ln)
    return out


def B(boxed, *paras):
    if len(boxed) > 52:
        _long.append(boxed)
    return [{"text": boxed, "style": "boxed"}] + T(*paras)


def step(id_, kind, label, marks, lines=None, figure=None, mark_note=None,
         why=None, cm=None, tip=None, margin=None):
    st = {"id": id_, "kind": kind, "label": label, "marks": marks}
    if marks > 0:
        assert mark_note, id_
        st["mark_note"] = mark_note
    if kind == "diagram":
        st["figure"] = figure or STUB(id_)
    else:
        st["lines"] = lines
    st["why"] = why
    st["common_mistakes"] = cm
    st["memory_tip"] = tip
    st["margin_note"] = margin
    for k in ("why", "common_mistakes", "memory_tip", "margin_note"):
        assert st[k], (id_, k)
    assert len(st["common_mistakes"]) <= 3, id_
    return st


def STUB(sid):
    return {"id": "STUB_" + sid, "width": 520, "height": 320,
            "elements": [{"type": "pause", "id": "p1", "caption": "Step 1 — placeholder"},
                         {"type": "stroke", "id": "s", "d": "M 10 10 L 20 20", "ms": 300}]}


def appear(spec):
    """'ts:2019 ap:2015 2014' -> appearances list."""
    out = []
    for tok in spec.split():
        if ':' in tok:
            b, y = tok.split(':')
            out.append({"year": int(y), "board": "ts_ipe" if b == "ts" else "ap_ipe"})
        else:
            out.append({"year": int(tok)})
    return out


def card(qid, qtype, page, ref, qtext, appearances, mark_split, steps,
         insider, note_extra=""):
    sec, header, marks, mins = SECTION[qtype]
    tot = sum(s["marks"] for s in steps)
    assert tot == marks, (qid, tot, marks)
    assert sum(m["marks"] for m in mark_split) == marks, (qid, "split")
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
        "paper_section": sec,
        "expected_time_min": mins,
        "question_text": qtext,
        "appearances": appear(appearances),
        "mark_split": mark_split,
        "verification": {
            "status": "unverified",
            "needs_teacher_verification": True,
            "note": NOTE_BASE.format(page=page, ref=ref) + (" " + note_extra if note_extra else ""),
        },
        "answer": {
            "page_header": [header, f"{CHAPTER} · {marks} marks"],
            "steps": steps,
        },
        "insider_note": insider,
    }
    path = os.path.join(QDIR, qid + ".json")
    io.open(path, 'w', encoding='utf-8').write(json.dumps(q, indent=2, ensure_ascii=False) + '\n')
    return qid


def report(written):
    print(f"wrote {len(written)} cards")
    if _long:
        print("!! lines over 52 chars:")
        for l in _long:
            print("  ", len(l), l)
    else:
        print("all lines <= 52 chars")
