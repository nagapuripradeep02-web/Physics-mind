# `answer-book/papers/` — real board papers, transcribed

One file per exam paper, `<board>_<paper>_<year>_<month>.json`, schema `ipe_paper_v1`.

This directory exists because of a lesson the track learned the hard way and wrote down in
`docs/patterns/answer_book.md`:

> **Back-testing the archetype set is not back-testing the output.** When a real paper is in the
> corpus, diff the sweep's authored list against that paper question by question. "Everything asked
> falls inside the grid" is a statement about the grid; it says nothing about what you actually wrote.

Until 2026-08-26 there was no corpus to diff against. The AP March-2026 paper lived as twelve
`appearances[]` entries and a fifteen-line prose summary in a markdown doc; the paper itself was a
PDF in a Downloads folder. That is not something a script can check, and it is not something a later
session can re-read. These files are.

## What is in here

Seven Telangana Intermediate I-Year Physics Paper-I papers — March 2016, 2017, 2019, 2020, 2023,
2024, 2025 — transcribed verbatim from the founder's scans on 2026-08-26. 147 question slots.

All seven run the same pattern, which `docs/patterns/answer_book.md` §Board landscape confirms is
unchanged for 2026-27:

| Section | Type | Marks each | Printed | Answer | Total |
|---|---|---|---|---|---|
| A (Q1–10) | VSAQ | 2 | 10 | **all 10** | 20 |
| B (Q11–18) | SAQ | 4 | 8 | any 6 | 24 |
| C (Q19–21) | LAQ | 8 | 3 | any 2 | 16 |

Section A carries no choice, which is why a VSAQ gap is the only kind that cannot be dodged.

## The shape

- `questions[]` — one entry per printed question number. `text` is the whole question as printed.
- `parts[]` — present only when one numbered question prints more than one task. Five of the seven
  papers pair a derivation with a numerical inside a single 8-mark Section-C question, and the
  corpus has to be able to say so without pretending they are two questions.
- **`parts[].marks` is deliberately absent.** These papers print no internal split. Inventing "5 + 3"
  would launder a guess into a fact — the same reason every card in this bank ships
  `needs_teacher_verification: true`.
- `provenance` — the source PDF, when it was transcribed, and from what. `date_confidence` is
  `printed` or `inferred`.

## The one inferred year

`ts_ipe_p1_2023_03.json` carries `date_confidence: "inferred"`. The sheet prints no year anywhere;
2023 comes from the scan's camera timestamp (`2023/3/25 12:34`) and was confirmed by the founder on
2026-08-26. Its `provenance.year_source` says so in full. **Every appearance tagged from that paper
is a claim of the same standing as a mark split** — right or wrong, the audit trail is in the file.

## Rules

1. **Transcribe from the scan, every time.** Never from a previous session's transcription, and never
   from a guide book's reproduction of a paper. This is the standing source rule for the whole track.
2. **Verbatim.** Keep the board's own wording, including its inconsistencies — "Chandrasekhar" in
   2019 and 2025 but "Chandra Sekhar" in 2023, "carburetor" in 2024 but "carburettor" in 2017. Those
   differences are evidence about how the board writes, and normalising them destroys it.
3. **Unicode, never ASCII transcription** — `ms⁻¹`, `10√2`, `60°`, `ω`, `½at²`, `μm`, `−` (U+2212).
   Same rule as the cards.
4. **Never put anything inside `answer-book/questions/`.** `build_answer_book.ts` does a
   non-recursive `readdirSync` there and would try to parse a subdirectory as a card. This directory
   is a sibling for exactly that reason — nothing in the build, the deploy or the e2e suite globs
   `answer-book/**`.

## What reads these files

- `matches.json` — the reviewed corpus→card mapping. The matcher **proposes**; a human confirms every
  row; the tag writer is a pure function of the confirmed file. Nothing is machine-written into it.
- `src/scripts/backtest_ipe_papers.ts` (`npm run backtest:physics`) — re-derives coverage from these
  three sources and fails on a mapping that points at nothing, on a tagged card that lost its tag,
  and on a `ts_ipe` appearance in a corpus year that no row justifies.

A question whose unit is not in `units.json` yet resolves to `unbuilt` and is **reported, not
failed** — an absent unit is a known, counted state, not an error. That report, ranked by how often
each unit is actually examined, is the best input the book has for choosing what to author next.
