# `bank/` — the book-derived solutions bank

Pre-solved, verified worked solutions to standard JEE-Main-level problems, keyed so that a student's
photo of a problem can be answered from here (free, verified) instead of by a fresh model call. The
first chapter is `physics/kinematics/` (pilot, 2026-09-11); the second, `physics/projectile/`, and
the third, `physics/laws_of_motion/`, were built the same day on the Claude Code subscription alone
(no metered API); laws of motion added a figure-checker role for pulley/force figures. Scripts live in
`scripts/bank/` (`BANK_CHAPTER=<name>` selects the chapter; `chapters.json` names them); the reports
that describe each build are in `docs/reports/bank/`.

## What a bank item is

`physics/<chapter>/items/bk_phy_<ch>_<sha8>.json`, schema `bank_item_v1`: **our restatement** of the
question, **our solution** (the `eapcet_solution_v1` block the corpus loop already uses), a
`verification` record, and an `origin.sha` that only the evidence holder can resolve. The id is the
sha of the restatement, never the source's numbering.

What is deliberately NOT in an item, and has no field to be put in: the source book, author, edition,
page, example or exercise number, or the source's wording. A gate greps every string for those.

## Rules

1. **Transcribe from the page image; the text layer only locates.** The text layer's maths is
   exploded across lines; it is used for item anchors and the census, never for content.
2. **The served bank holds our restatement, our solution and a fingerprint.** Verbatim text and
   source identity never enter git. Evidence (page renders, crops, transcripts, the printed key and
   hints, raw model output) lives under the gitignored `pdfs/books/<book>/<chapter>/` beside the
   founder's own PDF, exactly as the PDF itself does.
3. **Readers agree or the item escalates.** The blind author, an independent model reading the crop,
   and the source's printed answer must agree; the printed hint is a fourth reader the gate alone
   sees. An author never sees the key, the hint or the printed solution. Two blind readers agreeing
   against the key is the wrong-key signal, not a defect in the readers. Where the source prints no
   usable answer (a "prove that", a "plot the graph" whose answer is a sketch, a "see the hints"), or
   the second reader could not confirm, the item passes only with a warning and the blind auditor is
   the third reader; the item's `verification` record says which readers actually agreed.
4. **Class 11–12 methods only.** The syllabus judge runs on every solution, and its six plants are
   re-run first on every gate run; a judge that misses a plant is not believed that run.
5. **Every verdict is keyed by content sha.** An edit reverts an item to unverified by construction.
6. **A gate has a self-test with plants it must pass before it is believed** (`gate.py selftest`).
   The comparator fixture opens with the four holes found in the corpus gate's value rule.
7. **One book chapter ≠ one syllabus chapter.** Tag per item from `scripts/eapcet/chapters.py`.
   Level 1 only for JEE Main; Level 2 stays out until the founder says otherwise.
8. **A restatement must be a restatement.** Per item: no 12-word window of English shared with the
   transcript (a given formula survives verbatim and is not prose), normalised edit distance ≥ 0.4 on
   the prose with numbers and maths masked, no given number dropped (a number the restater adds, such
   as "take g = 10", is a warning), the same conditions ("from rest", "uniform") unless the crossed
   re-solve confirms the answer, and a crossed-model re-solve of the restatement alone (DeepSeek; on
   disagreement a second, Gemini) reaching the author's answer. The served question is the main text
   PLUS its lettered parts: every gate and every re-solver reads the whole of it.
9. **A hit is a hit only when the numbers agree.** Before any similarity score the matcher requires
   every number the source question states to appear in the photo (the fingerprint keeps that numeric
   multiset of the source, never its words); a numbers-changed twin of a bank item must never be
   served as "same", while a photo that also caught the item number or the page number still can.

10. **No metered API call without `BANK_ALLOW_API=1`** (founder, 2026-09-11). Every model role —
    reader, key reader, author, second reader, re-solver, judge, syllabus judge, auditor — is a
    planned, dispatched and collected sub-agent (`scripts/bank/roles.py`; `audit.py plan --role X`,
    `solve.py collect --role X`). The gate runs offline and queues undecided pairs for a judge batch.
    Independence then rests on different Claude models per role plus the printed key and the blind
    re-solve of our restatement; the report of each chapter says so.
11. **`scripts/bank/hygiene.py` must exit 0 before a commit**: identity grep, 12-word shingle sweep,
    page numbers, metered-model rows.

## Layout (per chapter)

```
items/                 bank_item_v1 files (the product)
_fingerprints.jsonl    numeric signatures + simhash + embedding per item id (no source words)
_slices/ _audit_input/ _audit/ _gate/ _dispatch.json _escalate.json   the corpus-loop conventions
_BRIEF_AUTHOR.md _BRIEF_AUDIT.md                                          adapted from eapcet/solutions/
release.json           verified items only
```
