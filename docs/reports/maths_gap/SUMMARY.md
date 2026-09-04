# Maths 1A/1B — coverage against the Sri Chaitanya FAST TRACK book (2026-27 edition)

Measured 2026-08-31 by diffing all 22 chapter index files under `answer-book/sources/`
against `answer-book/units.json`, chapter by chapter, matching on the MATHEMATICS rather
than on wording (both sides are restated in house language, so string comparison finds
nothing). Per-chapter detail is in the sibling files in this directory.

**This regenerates the eight diff reports that `docs/MATHS_1AB_GAP_START_HERE.md:41` said
lived only in a previous session and were not on disk.**

## The totals

| | Book questions | MATCHED | MISSING | PARTIAL | ELSEWHERE | our EXTRA cards |
|---|---|---|---|---|---|---|
| Maths 1A | 506 | 249 | **245** | 5 | 7 | 55 |
| Maths 1B | 358 | 289 | **63** | 6 | 0 | 17 |
| **Both** | **864** | **538** | **308** | **11** | **7** | **72** |

Our bank holds 613 cards (1A 301, 1B 312). Every chapter of the 2026-27 syllabus exists
and is answered; the gap is depth inside chapters, never a missing chapter.

**The recorded figure of 310 missing is confirmed at 308.** The two-question delta is in
1A Matrices (37 here, 38 recorded) and 1A Trigonometric Ratios (57 here, 58 recorded).

## Per chapter

| Chapter | Book Qs | Our cards | MISSING | Note |
|---|---|---|---|---|
| 1A u8 Trigonometric Ratios & Transformations | 92 | 53 | **57** | largest gap in either paper; ~30 of them are prove-this-identity VSAQ drills |
| 1A u2 Functions | 82 | 26 | **49** | and we hold ZERO SAQ cards here — see below |
| 1B u3 The Straight Line | 83 | 44 | **42** | whole archetypes absent (side-of-a-line, concurrent families, L1+lambda*L2) |
| 1A u7 Product of Vectors | 63 | 32 | **40** | parallelepiped volume, triple-product identities, concurrency proofs all absent |
| 1A u5 Matrices | 83 | 55 | **37** | 7 pure-definition VSAQs absent; rank on a rectangular matrix uncovered |
| 1A u6 Addition of Vectors | 34 | 21 | 16 | |
| 1A u12 Properties of Triangles | 32 | 23 | 15 | |
| 1A u10 Inverse Trigonometric Functions | 17 | 10 | 9 | |
| 1A u9 Trigonometric Equations | 14 | 10 | 8 | NOT retired by the 2026-27 change — in scope |
| 1A u4 Mathematical Induction | 15 | 10 | 7 | |
| 1A u11 Hyperbolic Functions | 14 | 10 | 7 | |
| 1B u4 Pair of Straight Lines | 21 | 15 | 7 | |
| 1B u1 Locus | 13 | 12 | 5 | our 4 extra cards are the ellipse/hyperbola loci the book never asks |
| 1B u7 The Plane | 13 | 11 | 5 | all 3 extra cards duplicate methods we already cover |
| 1B u5 3D-Coordinates | 11 | 10 | 3 | both missing centroid questions are 3-star |
| 1B u6 D.C's & D.R's | 7 | 7 | 1 | equal counts, still a 3-star 8-mark gap |
| 1A u1 Sets and Relations | 35 | 26 | **0** | the 35-vs-26 is the book's own split numbering, verified |
| 1A u3 Sequences and Series | 25 | 25 | **0** | verified question by question |
| 1B u2 Transformation of Axes | 6 | 9 | **0** | complete, with surplus |
| 1B u8 Limits and Continuity | 43 | 43 | **0** | clean 1:1 |
| 1B u9 Differentiation | 72 | 72 | **0** | clean 1:1, all 72 stems read against the book |
| 1B u10 Applications of Derivatives | 89 | 89 | **0** | clean 1:1 |

The pattern: **Maths 1B's calculus half is complete because it was authored directly
against this book; almost everything else predates the book and is thin against it.**

## Things worth acting on that are not just counts

1. **1A Functions has no SAQ card at all** — and the book's own MODEL PAPER-IA asks a
   Functions SAQ at Q11. `npm run backtest:maths` reports this as its single THIN row.
   The natural first card is the book's `saq2` (verify (gof)^-1 = f^-1 o g^-1).
2. **11 PARTIAL cards** answer only part of what the book asks. These are cheaper to fix
   than new cards and are already half-written. Detail in the per-chapter files; the
   recorded list of five scope gaps was an undercount.
3. **72 EXTRA cards** have no book counterpart. Most are legitimate (they came from the
   older Baby Bullet-Q source), but in 1B u7 The Plane all three are second copies of a
   method already covered while five different constructions have no card — duplication
   sitting next to a gap.
4. **Nothing here is authored from the books' model papers**, per the founder decision of
   2026-08-31: a coaching publisher's model paper is weaker evidence than its chapter list.
