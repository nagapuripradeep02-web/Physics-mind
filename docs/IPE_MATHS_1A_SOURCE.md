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
5. **Products are written with the middle dot** (`1·2·3`, `3·5⁽²ⁿ⁺¹⁾`), not the book's period
   (`1.2.3`, `3.5^(2n+1)`). Both characters are in Kalam; the period reads as a decimal to a
   student who has not met the convention, and `3.5` is genuinely ambiguous. The exam paper uses
   the period, so this is a deliberate clarification, not a transcription.
   **SETTLED — founder decision 2026-08-21: the middle dot stands, on student clarity.** No longer
   an open teacher question; do not revert it to the book's period in any future unit.
6. **Star rank in the LAQ section is the CHAPTER's**, not the question's — this book stars chapters
   there, unlike the physics Fastrack which starred every question. Do not imply per-question rank.
7. **Where the book prints a per-step mark split — CORRECTED 2026-08-21 (Unit 3).**
   The original note here read "the book prints a split on its LAQ and SAQ pages but NOT on its
   VSAQ pages". That was drawn from the Functions VSAQ pages (book pp.79-81) and is **FALSE in
   general**: the Matrices VSAQ chapter prints `[1 mark]` tags on book p.82, against answers 100
   and 101. The accurate statement is that the book prints a split **inconsistently, page by page**,
   and the pattern tracks the PAGE LAYOUT rather than the section: a question set alone on a full
   page usually carries margin tags, and a question set two-to-a-page in two columns almost never
   does, because the columns take the margin the tags would occupy. That explains every gap found
   so far — the two determinant LAQs on p.24 (a "Tick Boxes" widget in the margin), all four
   Cramer answers on pp.27-28, all four Gauss-Jordan on pp.33-34, and the whole Functions VSAQ run.
   **Consequence for authoring:** never assume from the section. Look at the page. Where no split
   is printed, infer it from the nearest printed split of the same shape and say so in
   `verification.note` — never present an inferred split as sourced.

## What Kalam can and cannot draw (measured 2026-08-21)

Which characters the handwriting font actually contains decides whether a line can stay plain
Unicode or has to be typeset. Measured by comparing each glyph's advance width in Kalam against
a font known to lack it — equal widths mean both fell back.

- **In Kalam** (draw in the hand): `² ³ ⁴ ⁻ ¹ ⁿ ᵏ ⁽ ⁾ ⁺ ₂ · × … − ⇒ √ ∞`
- **Falls back** to a system face: `∈ ∪ ∴ ∵ ∀ ˣ ₐ`

The fallback set is all *geometric* mathematical symbols, which is why the existing questions
read fine — a handwritten `∈` is geometric anyway. The consequence that matters: **superscript
towers like `49ᵏ⁺¹` and `3·5⁽²ⁿ⁺¹⁾` need no KaTeX**, which is why all of Unit 2 is plain Unicode.
Subscript *letters* (`ₙ`, `ₐ`) are NOT available, so write "nth term" in words rather than `Tₙ`,
and reach for a typeset line only for capital-letter subscripts and matrices.

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
3. **ALL TEN MATHS-1A UNITS COMPLETE — 250 entries** (216 chapter questions + the 34-question
   Star Questions Plus backfill).
   **Unit 10 (Properties of Triangles) — COMPLETE at 23 of 23**: 11 LAQ (book pp.43-49) + 9 SAQ
   (pp.75-77) + 3 from the separate Star Questions Plus bank (p.111). With Q17 (SAQ) and Q24 (LAQ)
   it is one of only TWO units holding two slots on the paper — Matrices is the other. Its LAQ answer
   32 carries a fully printed 1×7 split, the only printed split in that chapter. Answers 33, 34.1 and
   34.2 are the book's "Super Twin Baby Questions": three runs of the same four moves, where 34.2
   differs only by a minus sign that carries all the way to a SINE half-angle where the other two end
   in a cosine. The chapter-table on book p.50 independently CONFIRMED every SAQ boundary walked in
   Units 3-10, which is a useful cross-check on the whole scoping method.

   ✅ **THE STAR QUESTIONS PLUS BANK IS FOLDED IN — COMPLETE (founder decision 2026-08-22).** The bank
   (book pp.98-111, answers 142-180, 39 questions) is organised by chapter but sits after all the
   numbered chapters, so it belongs to no chapter's own inventory. All 39 are now accounted for:
   **3** went into Unit 10 when that unit was built (178-180), **34** are backfilled into Units 1-9,
   and **2 are SKIPPED as genuine duplicates** of questions already authored — answer 155 repeats
   Unit 4's VSAQ 113.1 with the same TS 17 tag, and answer 166 repeats Unit 6's LAQ answer 29.
   Distribution of the 34: Unit 1 → 142,143 · Unit 2 → 144,145 · Unit 3 → 146-154 · Unit 4 → 157 ·
   Unit 5 → 156,158-162 · Unit 6 → 163-165,167-174 · Unit 7 → 175,176 · Unit 8 → 177 · Unit 9 → none
   (the bank has no hyperbolic-functions questions at all).

   **SECTION CLASSIFICATION IS OURS, NOT THE BOOK'S**, and every backfilled file says so in its
   verification note. The bank's page headings name the CHAPTER, never the mark cut — the sole
   exception is p.98, which reads "FUNCTIONS LAQ". Two headings LOOK like section markers and are not:
   p.100 reads "MATRICES-VSAQ" and p.102 reads plain "MATRICES", yet the p.102 run holds answers 151
   and 152, which are plainly VSAQ shapes, while the p.100 run spills onto p.101 and swallows answer
   150 — a full 3×3 inverse, which is Section-B work on the real paper. **They are chapter banners,
   not section markers**, and answer 150 is the one place where we deliberately overrule the banner;
   that overrule is written into its own verification note so a reviewing teacher sees both readings.
   Everywhere else the question is classed by its own length and shape against the unit's existing
   chapters, except where the unit itself fixes the section: Units 2 (LAQ-only), 7 (SAQ-only) and 8
   (SAQ-only) admit no other answer, so those five questions carry no inference at all.

   **MARK SPLITS ARE OURS THROUGHOUT** — the bank prints no [N Marks] tags anywhere, unlike the
   numbered chapters, which print a handful. The shapes used follow the splits the book DOES print
   elsewhere: 1+1 for a 2-mark VSAQ (answers 100, 101 on p.82), 1+1+1+1 or 1+2+1 for a 4-mark SAQ
   (answers 58, 59 on p.63 and 61 on p.64), and a granular split for a 7-mark LAQ (answer 32 on p.44).

   Every one of the 34 was re-read against a fresh render of book pp.98-110 before authoring, rather
   than authored from the survey notes — the bank is dense with near-identical trigonometric identities
   and the survey pass was a selection pass, not a transcription pass.

   **Unit 9 (Hyperbolic Functions) — COMPLETE at 10 of 10, VSAQ ONLY, book pp.96-97.** The paper gives
   it a single slot, Q10, and the book has no hyperbolic LAQ chapter (LAQ chapters 1-6) and no SAQ
   chapter (SAQ chapters 7-13). Three families: the logarithmic forms of the inverse functions
   (137.x, 138.x), one ratio given then the double angles (139.x), and proofs worked straight from the
   exponential DEFINITIONS (140.x, 141.x). The recurring trap the answers name explicitly is that the
   hyperbolic identities differ from their circular twins by a sign — cosh²x − sinh²x = 1 has a MINUS
   where sin² + cos² has a plus, and cosh 2x = cosh²x + sinh²x has a PLUS where cos 2x has a minus.

   ⚠ **[SUPERSEDED 2026-08-22 — the bank is now folded in; see the ✅ block above.]** VSAQ chapter 19
   is the last chapter, and walking to its boundary at book p.98 turned up **"STAR QUESTIONS PLUS"** —
   a separate bank of extra questions organised by chapter, running from p.98 to just before the
   Bullet Model Paper. It was flagged here as a founder call rather than an omission, because folding
   it in would add questions to units already recorded COMPLETE. The founder called it: fold it in.
   The per-unit completion counts in this document therefore now mean "complete against the numbered
   chapters PLUS the bank", and the two are still distinguishable — every backfilled file names the
   bank and its answer number in its verification note.

   **Unit 8 (Inverse Trigonometric Functions) — COMPLETE at 9 of 9, SAQ ONLY, book pp.72-74.** The same
   shape as Unit 7: the paper gives it a single slot, Q16, and the book has no Inverse Trig LAQ chapter
   (LAQ chapters 1-6) and no VSAQ chapter (VSAQ chapters 14-19). Five families in nine questions —
   name-the-angle plus a compound formula (74.x, 75), chaining the Tan⁻¹ addition formula (76.x), the
   doubled-Tan⁻¹ conversion (77), evaluating both sides independently (78.x), and one fully general
   proof with no numbers at all (79). Answer 77 carries the ONLY printed split in the chapter, 1+1+1+1.
   PRESENTATION CHOICE recorded in every file: the book draws a small right triangle beside each answer
   that needs a second ratio (sinα = 4/5 ⇒ cosα = 3/5). Those are authored as the one-line algebraic
   step instead, with the triangle route named in the margin note — it keeps the nine consistent and
   avoids three near-identical figures where the algebra is a single line.

   **Unit 7 (Trigonometric Equations) — COMPLETE at 8 of 8, SAQ ONLY, book pp.68-71.** The paper gives
   it a single slot, Q15, with no Section-A and no Section-C appearance — and the book agrees: there is
   no Trigonometric Equations LAQ chapter (its LAQ chapters are 1-6) and no VSAQ chapter (its VSAQ
   chapters are 14-19). The mirror of Unit 2, which is LAQ-only. The eight are FOUR MATCHED PAIRS, one
   pair per page, and each pair is a different method rather than a different set of numbers:
   70.x solves a sinθ + b cosθ = c by dividing by √(a²+b²); 71.x reduces to a quadratic in ONE ratio
   (and 71.1 rejects a root because |sinθ| ≤ 1, which is a marked step, not an aside); 72.x pairs terms
   with a sum-to-product formula (and 72.2 adds an INTERVAL, so its answer is a finite list, not a
   general solution); 73.x never solves anything at all — it forms a quadratic and reads the sum and
   product of its roots off the coefficients.

   **Unit 6 (Trigonometric Ratios upto Transformations) — COMPLETE at 42 of 42**: 8 LAQ (book
   pp.39-42) + 10 SAQ (pp.65-67) + 24 VSAQ (pp.92-95). The second-largest unit after Matrices, and
   the one with the most slots on the paper: Q8 and Q9 (VSAQ), Q14 (SAQ) and Q23 (LAQ), where Q23
   is ALWAYS a transformation identity. All eight LAQs are ONE method — state the angle condition,
   pair two terms with a sum-to-product formula, use the condition to convert, factor, finish with
   a product formula — and four of them sit as TWINS on facing halves of a page, each pair differing
   by a single sign or a single choice of double-angle form. The VSAQ chapter is grouped by the book
   itself: periods, then maxima and minima, then evaluations, then identities; its header note
   ("Writing Formula itself gets you 1 Mark in these Questions") is why the first step of every VSAQ
   answer here IS the formula.

   **Unit 5 (Product of Vectors) — COMPLETE at 26 of 26**: 7 LAQ (book pp.35-38) + 7 SAQ (pp.62-64)
   + 12 VSAQ (pp.89-91). The first maths unit to carry ALL THREE sections — Q7 (VSAQ), Q13 (SAQ)
   and Q22 (LAQ) — and the first since Matrices whose chapters print mark splits: answer 23 on
   p.37 (1+1+1+1+1+2), answers 58 and 59 on p.63 (1+1+1+1), answer 61 on p.64 (1+2+1). The two
   skew-line distance questions (23, 24) share the printed split, one sourced and one applied from
   its neighbour. The cube-diagonal proof (answer 62) is the unit's second figure and the second
   maths question in the book to be argued from a picture. Note the book titles the LAQ chapter
   "Product of Vectors" while its own hit list on p.7 calls the same chapter "Vector Algebra" —
   the chapter pages are what was followed.

   **Unit 4 (Addition of Vectors) — COMPLETE at 20 of 20**: 10 SAQ (book pp.57-61) + 10 VSAQ (pp.87-88).
   **It has NO LAQ**, and that is not an omission: the paper gives Addition of Vectors Q5, Q6 (VSAQ) and
   Q12 (SAQ) but no Section-C slot, and the book has no Addition-of-Vectors LAQ chapter either — the
   mirror image of Unit 2, which is LAQ-only. Four of the SAQs are one coplanarity method over different
   vectors (scalar triple product = 0) and a fifth runs it backwards to solve for λ. The hexagon proof
   (answer 51) is the first MATHEMATICS question in the book to carry a figure: it is proved from the
   picture rather than from components, and the two substitutions it turns on (AE = BD, AF = CD) cannot
   be seen without one.

   ⚠ **A SCOPING LESSON, recorded because it cost a correction.** Unit 3's SAQ chapter was first scoped
   from the book's "TOP 40 SAQ" hit list (book p.9) and recorded as answers 40-45 over pp.51-55. That
   list is a **SELECTION, not an inventory**: the chapter actually runs to answer 47 on p.56, and two
   questions were missed until the walk to the Addition of Vectors chapter boundary for Unit 4 turned
   them up. Unit 3's LAQ pass was unaffected because it read every page pp.22-34 rather than the list.
   **The rule this fixes: scope a chapter by walking to its BOUNDARY — read the page after the one you
   think is the last — never from a hit list.** The hit lists are the priority signal (stars, SSP pages,
   appearance years); the chapter pages are the inventory. Unit 3 is now 46 of 46, and Unit 4 was scoped
   by boundary-walking from the start (pp.56 and 62 were both read to confirm where the chapter ends).

   **Units 1, 2 and 3.**
   **Unit 3 (Matrices) — COMPLETE at 46 of 46, book pp.22-34, 51-56, 82-86** (corrected from 44 over pp.51-55; see the scoping lesson above). The largest unit on the
   paper: two Section-C slots (Q20, Q21), one Section-B slot (Q11) and TWO Section-A slots (Q3, Q4),
   so 22 of the 75 marks. 17 LAQ (four families: six determinant proofs, four Cramer, three matrix
   inversion, four Gauss-Jordan) + 11 SAQ + 18 VSAQ. Two Gauss-Jordan answers do not fit the family
   skeleton and are authored as a matched pair: 20.3 has an INFINITE solution set and 20.4 has NO
   solution, and the only thing separating them is whether the constant beside the row of zeros is
   itself zero. This is the unit that made typeset lines (`render: "katex"`) load-bearing — 195 lines
   across the book, up from 2 — and twice a printed source line was too wide for the 624px page body
   and had to be restated rather than transcribed (LAQ answer 13 on p.23, SAQ answer 40 on p.51);
   both files record the change.

   **Unit 2 (Mathematical Induction) — 8 of 8, book pp.16-21, LAQ ONLY.** The book has no induction
   SAQ or VSAQ chapter and the paper has no induction question outside Section C, where it is
   always Q19 — the single most predictable 7 marks on the paper. All eight share ONE skeleton,
   and the book prints the split `1+1+1+3+1` against exactly the five moves (nth term · S(1) ·
   assume S(k) · S(k+1) · P.M.I), which is the unit's teaching point. Two caveats: the split is
   printed on questions 5, 6, 8 and 10 but NOT on 7, 9 and 11, where the same split is applied by
   inference from the same chapter; and question laq8 is the book's **practice question**, posed
   with no worked solution, so both its answer and its split are ours — flagged in its own file.

   ~~**Coverage of Unit 1 is partial.**~~ **CLOSED 2026-08-21 — Unit 1 is COMPLETE at 24 of 24**:
   4 LAQ (book pp.14-15) + 20 VSAQ (book pp.79-81, of which p.81 is ★★★ SSP 81, "the most
   dominating domain page"). Functions has **no SAQ** — not in this book, and not on the paper,
   whose Section B is Q11-Q17 and contains no Functions question. So 24 entries is the whole unit,
   not a staging post.
4. **Plain-text identity notation is `I_A`/`I_B`** in chrome fields (question_text,
   manifest text, mark_split labels) — the chrome is Inter, not the hand, and the
   underscore is the unambiguous plain-text convention. Real subscripts appear on the
   notebook page via KaTeX.
