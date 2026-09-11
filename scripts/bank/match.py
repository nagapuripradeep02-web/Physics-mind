"""The match probe: does a photo of a bank question find its bank entry, and does a photo of a
question NOT in the bank (or a numbers-changed twin of one) stay unmatched?

    python scripts/bank/match.py fingerprint            # signature + simhash + embeddings (restatement AND verbatim) -> _fingerprints.jsonl
    python scripts/bank/match.py negatives              # the negative set: EAPCET p1-02 PYQs, other-chapter PYQs, the same book's Level-2 page bands Level 1, 50 twins
    python scripts/bank/match.py probe [--real DIR]     # synthetic photos of every crop (+ real phone photos) -> transcribe -> match -> report
    python scripts/bank/match.py report

Hit rule: numeric-signature equality first, then similarity >= tau; tau is set from the negatives
and the twins, never from the hits. The lexical arm is a Python port of eapcet-app/js/58_match.js
(weighted token cosine, numeric tokens x2), so the app's current matcher is measured against the
embedding on the same queries.
"""
import os, io, re, sys, json, math, random, argparse, collections

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import _lib as L      # noqa: E402
import ingest         # noqa: E402
import solve as S     # noqa: E402

FP = os.path.join(L.BANK, "_fingerprints.jsonl")
NEG = os.path.join(L.EVIDENCE, "negatives")
PROBE = os.path.join(L.EVIDENCE, "probe")
RESULTS = os.path.join(PROBE, "results.jsonl")
CORPUS_BANK = os.path.join(L.ROOT, "eapcet", "bank", "physics_v1.json")
REPORT = os.path.join(L.ROOT, "docs", "reports", "bank")


# ---------------------------------------------------------------- lexical arm (58_match.js port)
def weight(w):
    return 2 if w[0].isdigit() else 1


def lexical(q, d):
    tq, td = L.tokens(q), L.tokens(d)
    if len(tq) < 3:
        return 0.0, 0, 0
    nq = L.norm_text(q)
    if len(nq) >= 12 and nq in L.norm_text(d):
        return 1.0, len(tq), sum(1 for w in tq if w[0].isdigit())
    sq, sd = set(tq), set(td)
    shared = sq & sd
    num = sum(weight(w) for w in shared)
    den = math.sqrt(sum(weight(w) for w in sq) * sum(weight(w) for w in sd)) or 1
    return num / den, len(shared), sum(1 for w in shared if w[0].isdigit())


def simhash(text):
    v = [0] * 64
    for w in L.tokens(text):
        h = int(L.sha256(w)[:16], 16)
        for i in range(64):
            v[i] += 1 if (h >> i) & 1 else -1
    return sum((1 << i) for i in range(64) if v[i] > 0)


def hamming(a, b):
    return bin(a ^ b).count("1")


def cosine(a, b):
    num = sum(x * y for x, y in zip(a, b))
    da = math.sqrt(sum(x * x for x in a)) or 1
    db = math.sqrt(sum(y * y for y in b)) or 1
    return num / (da * db)


# ---------------------------------------------------------------- fingerprint
def bank_rows():
    tr = S.transcripts()
    RS = S.done_ids("restate")
    rows = []
    for wid in sorted(tr):
        rt = RS.get(wid)
        if not rt or not rt.get("question_text"):
            continue
        t = tr[wid]
        rest = S.restatement_text(rt, with_figure=False)
        verb = t["question_text"] + " " + " ".join(o.get("text", "") for o in t.get("options") or [])
        rows.append({"id": wid, "restatement": rest, "verbatim": verb})
    return rows


def cmd_fingerprint(a):
    """--probe: every restated item, both embeddings, keyed by work id (the probe's comparison set, evidence only).
    Default: the SERVED file - released items only, keyed by bank id, our restatement's signature/simhash/tokens/
    embedding plus the source's numeric multiset for the numbers gate; no source words, no source embedding
    (the probe measured +1.7 points top-1 for it, under the 5-point rule fixed in advance)."""
    rows = bank_rows()
    if getattr(a, "probe", False):
        print("fingerprint (probe set): %d items" % len(rows))
        er = L.gemini_embed([r["restatement"] for r in rows])
        ev = L.gemini_embed([r["verbatim"] for r in rows])
        out = os.path.join(L.EVIDENCE, "_fingerprints_probe.jsonl")
        if os.path.exists(out):
            os.remove(out)
        for r, e1, e2 in zip(rows, er, ev):
            L.jsonl_append(out, {"id": r["id"], "signature": L.numeric_signature(r["restatement"]), "signature_verbatim": L.numeric_signature(r["verbatim"]),
                                 "simhash": simhash(r["restatement"]), "simhash_verbatim": simhash(r["verbatim"]),
                                 "tokens": L.tokens(r["restatement"]), "tokens_verbatim": L.tokens(r["verbatim"]),
                                 "emb_restatement": [round(x, 6) for x in e1], "emb_verbatim": [round(x, 6) for x in e2]})
        print("-> %s" % out)
        return
    rel = L.load(os.path.join(L.BANK, "release.json")) or sys.exit("no release yet")
    RS = S.done_ids("restate")
    by_bid = {}
    for wid, rt in RS.items():
        if rt.get("question_text"):
            by_bid["bk_phy_kin_" + S.restatement_sha(rt)[:8]] = wid
    served = [(it["id"], by_bid[it["id"]]) for it in rel["items"] if it["id"] in by_bid]
    rows = {r["id"]: r for r in rows}
    er = L.gemini_embed([rows[wid]["restatement"] for _, wid in served])
    if os.path.exists(FP):
        os.remove(FP)
    for (bid, wid), e1 in zip(served, er):
        r = rows[wid]
        L.jsonl_append(FP, {"id": bid, "signature": L.numeric_signature(r["restatement"]), "signature_source": L.numeric_signature(r["verbatim"]),
                            "simhash": simhash(r["restatement"]), "tokens": L.tokens(r["restatement"]),
                            "emb_restatement": [round(x, 6) for x in e1]})
    print("fingerprint (served): %d released items -> %s" % (len(served), FP))


# ---------------------------------------------------------------- negatives
def render_text_photo(text, path, seed):
    """A typeset-then-photographed rendering of a question that exists only as text (PYQs, twins)."""
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
    try:
        font = ImageFont.truetype("C:/Windows/Fonts/times.ttf", 22)
    except OSError:
        font = ImageFont.load_default()
    words, lines, cur = text.split(), [], ""
    for w in words:
        if len(cur) + len(w) > 78:
            lines.append(cur); cur = w
        else:
            cur = (cur + " " + w).strip()
    lines.append(cur)
    img = Image.new("RGB", (1100, 40 + 30 * len(lines)), (252, 250, 245))
    d = ImageDraw.Draw(img)
    for i, ln in enumerate(lines):
        d.text((40, 20 + 30 * i), ln, fill=(20, 20, 20), font=font)
    img = photo_effect(img, seed)
    img.save(path, quality=82)


def photo_effect(img, seed):
    from PIL import Image, ImageFilter
    bg = Image.new("RGB", img.size, (238, 232, 220))
    img = Image.blend(img.convert("RGB"), bg, 0.12)
    img = img.rotate(random.Random(seed).uniform(-1.2, 1.2), resample=Image.BICUBIC, expand=True, fillcolor=(225, 220, 210))
    return img.filter(ImageFilter.GaussianBlur(0.4))


def twin_of(text, seed):
    """Change ONE given quantity (never a zero, never an option letter) - the case that must not hit."""
    rng = random.Random(seed)
    nums = [m for m in re.finditer(r"(?<![\w.])\d+(?:\.\d+)?(?![\w.])", text) if float(m.group(0)) != 0]
    if not nums:
        return None
    m = rng.choice(nums)
    v = m.group(0)
    new = str(int(v) * 2 + 1) if v.isdigit() else "%g" % (float(v) * 1.5)
    return text[:m.start()] + new + text[m.end():]


def cmd_negatives(a):
    os.makedirs(NEG, exist_ok=True)
    rows = []
    bank = L.load(CORPUS_BANK) or sys.exit("no EAPCET bank at %s" % CORPUS_BANK)
    qs = [q for q in bank["questions"] if q.get("transcription_confidence") == "high" and not q.get("needs_figure")]
    KIN = ("Motion in a Straight Line", "Motion in a Plane")
    p102 = [q for q in qs if q.get("chapter") in KIN][:80]
    other = [q for q in qs if q.get("chapter") not in KIN][:150]
    for tag, group in (("pyq_p1-02", p102), ("pyq_other", other)):
        for q in group:
            txt = q["question_en"] + " " + " ".join("(%d) %s" % (i + 1, o) for i, o in enumerate(q.get("options_en") or []))
            path = os.path.join(NEG, "%s_%s.jpg" % (tag, q["id"]))
            if not os.path.exists(path):
                render_text_photo(txt, path, q["id"])
            rows.append({"id": q["id"], "group": tag, "photo": path, "text": txt})
    # the same book's Level-2 pages, cut into three overlapping bands each: same fonts and layout, never in the bank
    from PIL import Image
    nb = 0
    for page in range(210, 222):
        src = os.path.join(L.PAGES, "p%04d.png" % page)
        if not os.path.exists(src):
            continue
        im = Image.open(src).convert("RGB")
        h = im.height
        for k in range(3):
            top = int(h * (0.08 + 0.28 * k)); bot = min(h, int(top + h * 0.34))
            path = os.path.join(NEG, "book_l2_p%04d_%d.jpg" % (page, k))
            if not os.path.exists(path):
                photo_effect(im.crop((0, top, im.width, bot)), "l2%d%d" % (page, k)).save(path, quality=80)
            rows.append({"id": "book_l2_p%04d_%d" % (page, k), "group": "book_l2", "photo": path, "text": ""})
            nb += 1
    # twins of bank items: the restatement with one quantity changed
    RS = S.done_ids("restate")
    tw = 0
    for wid in sorted(RS):
        rt = RS[wid]
        if not rt.get("question_text"):
            continue
        t2 = twin_of(S.restatement_text(rt, with_options=False, with_figure=False), wid)
        if not t2:
            continue
        txt = t2 + " " + " ".join("%s %s" % (o["label"], o["text"]) for o in rt.get("options") or [])
        path = os.path.join(NEG, "twin_%s.jpg" % wid)
        if not os.path.exists(path):
            render_text_photo(txt, path, "twin" + wid)
        rows.append({"id": "twin_" + wid, "group": "twin", "twin_of": wid, "photo": path, "text": txt})
        tw += 1
        if tw >= a.twins:
            break
    L.save(os.path.join(NEG, "_index.json"), rows)
    c = collections.Counter(r["group"] for r in rows)
    print("negatives: %s -> %s" % (dict(c), NEG))


# ---------------------------------------------------------------- probe
READ_SCHEMA = {"type": "OBJECT", "properties": {"question_text": {"type": "STRING"}, "options": {"type": "ARRAY", "items": {"type": "STRING"}}},
               "required": ["question_text", "options"]}
READ_PROMPT = ("Transcribe the physics question in this photo exactly as printed, with its options if any. Unicode maths. "
               "Do not solve it. Return JSON only.")


def transcribe_photo(path):
    r = L.gemini([{"text": READ_PROMPT}, L.image_part(path)], max_out=3000, json_schema=READ_SCHEMA, temperature=0)
    j = L.json_of(r.get("content")) or {}
    return L.latex_to_unicode((j.get("question_text") or "") + " " + " ".join(j.get("options") or [])), r


def sig_gate(query_sig, bank_sig):
    """Every number the bank item states must appear in the photo. A twin (one number changed) lacks one;
    a photo with extra numbers (the item label, a page number) still passes; a restatement that ADDED a
    number (g = 10) must not block its own item, which is why the bank side is the verbatim signature."""
    return not (collections.Counter(bank_sig) - collections.Counter(query_sig))


def match_all(query, emb, fps):
    sig = L.numeric_signature(query)
    sh = simhash(query)
    out = []
    for f in fps:
        lex, shared, shared_num = lexical(query, " ".join(f["tokens"]))
        lexv, _, _ = lexical(query, " ".join(f["tokens_verbatim"]))
        out.append({"id": f["id"], "lex": round(lex, 4), "lex_verbatim": round(lexv, 4),
                    "cos": round(cosine(emb, f["emb_restatement"]), 4), "cos_verbatim": round(cosine(emb, f["emb_verbatim"]), 4),
                    "sig_equal": sig_gate(sig, f["signature_verbatim"]), "sig_equal_restatement": sig_gate(sig, f["signature"]),
                    "sig_exact": sig == f["signature_verbatim"],
                    "ham": hamming(sh, f["simhash"]), "shared": shared, "shared_num": shared_num})
    return out


def cmd_probe(a):
    fps = L.jsonl_read(os.path.join(L.EVIDENCE, "_fingerprints_probe.jsonl")) or L.jsonl_read(FP) or sys.exit("run fingerprint --probe first")
    os.makedirs(PROBE, exist_ok=True)
    tr = S.transcripts()
    queries = []
    # positives: every bank crop through the photo effect (worked examples: the question half only is not separable -> use full crop)
    from PIL import Image
    for wid in sorted(tr):
        if wid not in {f["id"] for f in fps}:
            continue
        t = tr[wid]
        path = os.path.join(PROBE, "pos_%s.jpg" % wid)
        if not os.path.exists(path):
            im = Image.open(os.path.join(L.EVIDENCE, t["crop"])).convert("RGB")
            if im.height > 1400:
                im = im.crop((0, 0, im.width, 1400))
            photo_effect(im, wid).save(path, quality=80)
        queries.append({"id": wid, "group": "positive", "expect": wid, "photo": path})
    for r in L.load(os.path.join(NEG, "_index.json"), []):
        queries.append({"id": r["id"], "group": r["group"], "expect": None, "photo": r["photo"], "twin_of": r.get("twin_of")})
    if a.real:
        idx = L.load(os.path.join(a.real, "_index.json"), [])
        for r in idx:
            queries.append({"id": "real_" + r["id"], "group": "real", "expect": r.get("expect"), "photo": os.path.join(a.real, r["file"])})
    done = {r["id"] for r in L.jsonl_read(RESULTS)}
    todo = [q for q in queries if q["id"] not in done]
    if a.limit:
        todo = todo[:a.limit]
    print("probe: %d queries, %d done, %d to run" % (len(queries), len(done), len(todo)))
    for q in todo:
        text, r = transcribe_photo(q["photo"])
        if not text.strip():
            L.jsonl_append(RESULTS, {**q, "error": r.get("error") or "empty"})
            continue
        emb = L.gemini_embed([text])[0]
        m = match_all(text, emb, fps)
        top_cos = sorted(m, key=lambda x: -x["cos"])[:3]
        top_lex = sorted(m, key=lambda x: -x["lex"])[:3]
        L.jsonl_append(RESULTS, {**q, "query_text": text[:400], "top_cos": top_cos, "top_lex": top_lex,
                                 "usage": r.get("usage"), "at": L.now()})
        print("  %-28s %-9s cos %.3f->%s%s  lex %.3f->%s" % (q["id"][:28], q["group"], top_cos[0]["cos"], top_cos[0]["id"],
                                                          "*" if top_cos[0]["sig_equal"] else " ", top_lex[0]["lex"], top_lex[0]["id"]))


def cmd_report(a):
    rows = [r for r in L.jsonl_read(RESULTS) if not r.get("error")]
    groups = collections.defaultdict(list)
    for r in rows:
        groups[r["group"]].append(r)
    lines = ["# Match probe — %s\n" % L.now(), "queries: %s\n" % {k: len(v) for k, v in groups.items()}]
    for arm, key in (("embedding (restatement)", "cos"), ("lexical (58_match port)", "lex")):
        lines.append("\n## %s\n" % arm)
        lines.append("| tau | pos top1 hit (sig gate) | pos top1 hit (no gate) | false hits: pyq | false hits: same-book L2 bands | false hits: twin | real photos |")
        lines.append("|---|---|---|---|---|---|---|")
        for tau in (0.5, 0.6, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95):
            def top(r):
                return sorted(r["top_" + key], key=lambda x: -x[key])[0]
            pos = groups.get("positive", [])
            hit_g = sum(1 for r in pos if top(r)["id"] == r["expect"] and top(r)[key] >= tau and top(r)["sig_equal"])
            hit_n = sum(1 for r in pos if top(r)["id"] == r["expect"] and top(r)[key] >= tau)
            fp_pyq = sum(1 for r in groups.get("pyq_p1-02", []) + groups.get("pyq_other", []) if top(r)[key] >= tau and top(r)["sig_equal"])
            fp_l2 = sum(1 for r in groups.get("book_l2", []) if top(r)[key] >= tau and top(r)["sig_equal"])
            fp_twin = sum(1 for r in groups.get("twin", []) if top(r)[key] >= tau and top(r)["sig_equal"])
            fp_twin_nogate = sum(1 for r in groups.get("twin", []) if top(r)[key] >= tau)
            real = groups.get("real", [])
            real_hit = sum(1 for r in real if r.get("expect") and top(r)["id"] == r["expect"] and top(r)[key] >= tau and top(r)["sig_equal"])
            lines.append("| %.2f | %d/%d | %d/%d | %d/%d | %d/%d | %d/%d (no gate %d) | hits %d/%d |" % (
                tau, hit_g, len(pos), hit_n, len(pos), fp_pyq, len(groups.get("pyq_p1-02", [])) + len(groups.get("pyq_other", [])),
                fp_l2, len(groups.get("book_l2", [])),
                fp_twin, len(groups.get("twin", [])), fp_twin_nogate, real_hit, len([r for r in real if r.get("expect")])))
    # verbatim embedding vs restatement embedding, for the keep/drop decision
    pos = groups.get("positive", [])
    if pos:
        v_hit = sum(1 for r in pos if sorted(r["top_cos"], key=lambda x: -x["cos_verbatim"])[0]["id"] == r["expect"])
        r_hit = sum(1 for r in pos if sorted(r["top_cos"], key=lambda x: -x["cos"])[0]["id"] == r["expect"])
        lines.append("\nverbatim-embedding top1 %d/%d vs restatement-embedding top1 %d/%d (within the top-3 by restatement cosine)\n" % (v_hit, len(pos), r_hit, len(pos)))
    os.makedirs(REPORT, exist_ok=True)
    out = os.path.join(REPORT, "match_probe_%s.md" % L.now()[:10])
    io.open(out, "w", encoding="utf-8").write("\n".join(lines))
    print("\n".join(lines))
    print("-> %s" % out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["fingerprint", "negatives", "probe", "report"])
    ap.add_argument("--real")
    ap.add_argument("--limit", type=int)
    ap.add_argument("--twins", type=int, default=50)
    ap.add_argument("--probe", action="store_true")
    a = ap.parse_args()
    globals()["cmd_" + a.cmd](a)


if __name__ == "__main__":
    main()
