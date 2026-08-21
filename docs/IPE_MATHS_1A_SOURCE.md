# IPE Maths-1A — source analysis + paper blueprint

> Part-0 for the mathematics Answer Book track, done 2026-08-21 on `feat/ipe-mathematics-answerbook`.
> Companion to `docs/patterns/answer_book.md` (schema + mechanisms, subject-neutral) and
> `answer-book/README.md` (how to build). Physics Part-0 lives in `PROGRESS.md`.

## The source

`Ipe maths-1A (baby bullet).pdf` — **"JUNIOR INTER MATHS-1A, Baby Bullet-Q"**, Sri Publishers,
Machilipatnam. 134 pages, produced by *Adobe Scan for Android*: **there is no text layer**
(268 characters in the entire file, ~2 per page), so every fact below was read from rendered
page images, not extracted.

It is a **question bank organised by mark cut**, not a textbook — the same slot DC Pandey and
the Sri Chaitanya Fastrack occupy for physics: question and priority signal, never prose.

- Book page ≈ scan page **+ 1** (scan p013 = book p.14). Verified at both ends; watch for ±1 drift late in the book.
- Index (book p.6): **LAQ chapters 1-6** (7M) · **SAQ chapters 7-13** (4M) · **VSAQ chapters 14-19** (2M) ·
  Star Questions Plus · Bullet Model Paper · 5 Model Guess Papers · 5-Steps Revision Programme.

### Rendering its pages on macOS

There is no Homebrew on the Mac desk, so `pdftotext`/`pdftoppm` are unavailable and the Read
tool's PDF path fails. macOS ships PDFKit, which renders pages with no install:

```bash
osascript -l JavaScript render.js "<pdf>" "<outDir>" <fromPage> <toPage> 2.0
```

(`render.js` = PDFKit via the JXA ObjC bridge — `doc.pageAtIndex(i)` →
`thumbnailOfSizeForBox` → `NSBitmapImageRep` → PNG. Scale 2.0 gives ~1000×1584, legible.)

## The paper blueprint

**Maths-1A = 24 questions, 75 marks, 3 hours.** From the book's "IPE 24 QF" sheet (book pp.4-5),
cross-checked against the Index and the Bullet Model Paper — all three agree.

| Section | Questions | Each | Answer | Total |
|---|---|---|---|---|
| A — VSAQ | Q1-Q10 | 2M | all 10 compulsory | 20 |
| B — SAQ | Q11-Q17 | 4M | any 5 of 7 | 20 |
| C — LAQ | Q18-Q24 | 7M | any 5 of 7 | 35 |

**This differs from Physics-I** (60 marks, 8-mark LAQs). A maths LAQ is `marks_total: 7`.

**Topic is fixed by question number** — the single most useful fact in this document:

| Q | Topic | | Q | Topic | | Q | Topic |
|---|---|---|---|---|---|---|---|
| 1, 2 | Functions | | 11 | Matrices | | 18 | Functions |
| 3, 4 | Matrices | | 12 | Addition of Vectors | | 19 | Mathematical Induction |
| 5, 6 | Addition of Vectors | | 13 | Product of Vectors | | 20, 21 | Matrices (**two** LAQs) |
| 7 | Product of Vectors | | 14 | Trig Ratios upto Transformations | | 22 | Product of Vectors |
| 8, 9 | Trig Ratios upto Transformations | | 15 | Trigonometric Equations | | 23 | Transformations |
| 10 | Hyperbolic Functions | | 16 | Inverse Trigonometric Functions | | 24 | Properties of Triangles |
| | | | 17 | Properties of Triangles | | | |

Q19 is *always* Mathematical Induction; Q23 is *always* Transformations. This is a stronger
predictability claim than physics could make, and it is the wedge the exam-first strategy needs.

## What this book gives that the physics sources did not

| Signal | Physics sources | Baby Bullet-Q | Maps to |
|---|---|---|---|
| Priority | ★ 4-level stars (Junior Fastrack only) | ★★★ chapter stars **+ `★★★ SSP n ★★★`** Super Scoring Page headers | `units.json` `stars` |
| Appearances | years, board undifferentiated | **board-split**: `TS 17,19` · `AP 16,18` | `appearances[].year` + `.board` |
| **Per-step mark split** | **absent — the reason cuts ship `⚠ split unverified`** | **printed in the margin**: `[3 Marks]`/`[4 Marks]` on a 7M LAQ, `[1 Mark]`×4 on a 4M SAQ | `steps[].marks` |

The mark-split row retires, for mathematics, the physics blocker *"which SAQ/VSAQ cuts are real —
the mark splits would be invented"*. They are no longer invented. They are still a **coaching
publisher's claim, not a TSBIE document**, so `needs_teacher_verification: true` still ships on
every question (Rule 38g) — the note now names the source and page instead of admitting a guess.

`appearances[].board` is **not this branch's invention** — `feat/ipe-answerbook` added
`board: z.enum(['ts_ipe','ap_ipe']).optional()` for physics in its Session 89, and renders it as an
`Asked: TS … · AP …` chip. Mathematics questions author the tag now; master's schema ignores the
extra key, so the chip lights up when that branch merges, with no re-authoring. (Found by the
Rule 40a `git log --all -S` check — this is exactly the mechanism that check exists to prevent
building twice.)

## Authoring rules specific to this source

1. **Take question text, mark split, star rank and years. Never the prose.** The book's register is
   personified coaching talk — "I'm Super Hit 'Q'", "f for friend, g for good, gof for good friend",
   "BABY CHAT: Matrices are known for Easiest Models" — plus Telugu-script asides. Rule 41 bans that
   register in every reader-facing string; Rule 30i makes the product English-only.
2. **Year tags are 2-digit and DO run past 2019** — corrected 2026-08-21 when book p.81 turned up
   `TS 20,22` and `AP 20`. The earlier "stops at 19" note was drawn from too small a sample; this
   book is not the physics Fastrack, whose frequency data really was frozen at 2014.
   **Pre-bifurcation papers are tagged plain `IPE`** (`IPE 09`, `IPE 13`) — before the 2014 TS/AP
   split there was one Andhra Pradesh board. `appearances[].board` is `ts_ipe | ap_ipe` with no
   value for that era, so those years are recorded in `verification.note` prose rather than as
   data. Worth one enum value (`ipe`) whenever the physics branch next touches that schema.
3. **The book covers TS and AP together.** Our header is `board: "ts_ipe"`; the AP years are extra
   signal, and an AP variant is a header swap over the same portable steps — which is what the
   schema was built for.
4. **`unit.number` = the Maths-1A syllabus unit**, not the book's chapter number: 1 Functions ·
   2 Mathematical Induction · 3 Matrices · 4 Addition of Vectors · 5 Product of Vectors ·
   6 Trigonometric Ratios upto Transformations · 7 Trigonometric Equations · 8 Inverse
   Trigonometric Functions · 9 Hyperbolic Functions · 10 Properties of Triangles.
5. **Star rank in the LAQ section is the CHAPTER's**, not the question's — this book stars chapters
   there, unlike the physics Fastrack which starred every question. Do not imply per-question rank.
6. **The book prints a per-step mark split on its LAQ and SAQ pages but NOT on its VSAQ pages.**
   A VSAQ is 2 marks and the book gives no internal division, so the 1+1 across a VSAQ's two steps
   is OURS, not the source's. Every VSAQ file says so in `verification.note`. This is the one place
   in the mathematics track where a split is authored rather than read.

## Open items — status

1. ~~**The engine cannot draw a matrix.**~~ **RESOLVED 2026-08-21** (founder: use KaTeX).
   Lines opt in with `render: "katex"`, typeset at build time and revealed by a width
   wipe — `docs/patterns/answer_book.md` §Mechanism 3. This also solved the capital-letter
   subscript problem, so the Functions identity LAQs are authored, not blocked. Matrices
   (Q3, Q4, Q11, Q20, Q21) are now unblocked; they were never attempted before the
   mechanism existed.
2. ~~**The catalog has no subject dimension.**~~ **RESOLVED 2026-08-21** (founder: make a
   mathematics dimension). Units carry `subject`; the chip row appears from the second
   subject on. Unit-number collision between a maths Unit 1 and a future physics Unit 1
   is no longer a display problem — the two are filed under different subjects — though
   they would still both read "Unit 1" under *All subjects*.
3. ~~**Coverage of Unit 1 is partial.**~~ **CLOSED 2026-08-21 — Unit 1 is COMPLETE at 24 of 24**:
   4 LAQ (book pp.14-15) + 20 VSAQ (book pp.79-81, of which p.81 is ★★★ SSP 81, "the most
   dominating domain page"). Functions has **no SAQ** — not in this book, and not on the paper,
   whose Section B is Q11-Q17 and contains no Functions question. So 24 entries is the whole unit,
   not a staging post.
4. **Plain-text identity notation is `I_A`/`I_B`** in chrome fields (question_text,
   manifest text, mark_split labels) — the chrome is Inter, not the hand, and the
   underscore is the unambiguous plain-text convention. Real subscripts appear on the
   notebook page via KaTeX.
