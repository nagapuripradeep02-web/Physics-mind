# IPE Maths-2B — source analysis + paper blueprint

> Part-0 for the third second-year paper, done 2026-08-29 on desk
> `C:\Tutor\physics-mind-ipe-answerbook-maths-2b` (branch `feat/ipe-answerbook-maths-2b`).
> Companion to `docs/MATHS_2B_START_HERE.md` (the unit agents' contract),
> `docs/IPE_MATHS_1A_SOURCE.md` / `docs/IPE_MATHS_1B_SOURCE.md` (the same book series, first
> year) and `docs/patterns/answer_book.md` (schema + mechanisms).

## The source

`C:\Users\PRADEEEP\Downloads\Telegram Desktop\DocScanner 01-Nov-2022 5-56 am.pdf` —
**"SENIOR INTER MATHS-2B, My Baby Bullet-Q"**, SRI Publishers, Machilipatnam. **128 pages**, a
phone scan ("DocScanner", November 2022) with no text layer; every fact below was read from the
rendered pages with the Read tool's `pages` parameter.

- **PDF page = printed page over most of the book, but NOT all of it** — printed p.23 is missing
  from the scan and printed p.43 is scanned twice, so PDF 23-42 are printed 24-43. Full map and
  consequences in §"The scan is not the book" below; every page number in this document is the
  PRINTED one.
- Same publisher, series and organising principle as the 1A/1B books: **a question bank
  organised by mark cut**, giving question text, chapter star rank, printed appearance years
  (board-split `TS 16,18` / `AP 16,18`, plus the pre-bifurcation `IPE 14`), Super Scoring Page
  headers, and — on single-column pages — a printed per-step mark split. Never its prose: the
  "I-QUOTES", "BABY CHAT" and "You know!" boxes are personified, part Telugu, and out of scope
  (Rule 41 / Rule 30i).
- The 2022 edition is current for the March 2027 paper: the second-year syllabus and pattern
  are unchanged until 2027-28 (next section).

## The paper — 75 marks, verified, and why that is not the 60 of Maths-1A/1B

**Maths-2B = 24 questions, 75 marks, 3 hours**: Section A Q1-Q10 VSAQ ×2 all compulsory ·
Section B Q11-Q17 SAQ ×4 any 5 of 7 · Section C Q18-Q24 LAQ ×**7** any 5 of 7.

Three sources agree and one of them settles the timing question:

1. **The book's IPE BLUE PRINT (book p.5)** — transcribed below — sums to `10×2=20 · 5×4=20 ·
   5×7=35 = 75`, and every one of its five Guess Papers (pp.118-127) and the Bullet Model Paper
   (pp.103-117) is cut exactly that way.
2. **The 2026-27 reform is first year only.** TV9 Telugu, 17 May 2026, on TGBIE's new evaluation
   system: *"ఈ సంస్కరణలు ఈ ఏడాదికి ఫస్టియర్‌కు మాత్రమే వర్తిస్తాయి. 2027-28 నుంచి సెకండ్‌ ఇయర్‌కీ
   ఇవి అమలవుతాయి"* — these reforms apply only to first year this year; they reach second year from
   2027-28. The 60 written + 15 activity-based-learning maths paper is what reaches second year
   then. (Newsmeter, 15 May 2026, gives the same 60/15 maths figures for the reformed paper.)
3. **The second-year syllabus is unchanged for 2026-27**: careers360's TS Intermediate 2026-27
   syllabus page (updated 30 Jul 2026) still lists Maths-IIB as the same eight chapters.

The one contrary signal found — a Telugu report that "second-year students also get the updated
syllabus" — is about **Andhra Pradesh** (BIEAP switched first year in 2025-26, so its second year
switches in 2026-27; Telangana runs a year behind).

Repo effect: `src/schemas/answerBook.ts` carries `ABC_75` (A 10/10 ×2 · B 5 of 7 ×4 · C 5 of 7
×7) and the row `mathematics_2b: { total: 75, sections: ABC_75, wef: '2026-27' }`, `internal`
omitted (no second-year ABL mark in 2026-27, and the field is student-facing). Negative control
run 2026-08-29: a 2B VSAQ authored at 3 marks fails `check:cards` naming PAPER_PATTERNS; at 2 it
passes. **When the reform reaches second year (2027-28) this paper needs the same 7 → 8 LAQ
re-cut that 1A/1B had on 2026-08-28 — a dated, deliberate change, not this year's.**

### IPE Blue Print of Maths-2B (book p.5)

| # | Chapter | VSAQ (2m) | SAQ (4m) | LAQ (7m) | Total |
|---|---|---|---|---|---|
| 1 | Circle | 2+2 | 4 | 7+7 | 22 |
| 2 | System of Circles | 2 | 4 | — | 6 |
| 3 | Parabola | 2 | — | 7 | 9 |
| 4 | Ellipse | — | 4+4 | — | 8 |
| 5 | Hyperbola | 2 | 4 | — | 6 |
| 6 | Integration | 2+2 | — | 7+7 | 18 |
| 7 | Definite Integrals | 2+2 | 4 | 7 | 15 |
| 8 | Differential Equations | 2 | 4 | 7 | 13 |
| | **IPE Weightage** | **10×2=20** | **5×4=20** | **5×7=35** | **75** |

The book's own caveat, printed under the table: *"The Blue print is prepared according to the
'Model Question Paper' issued by B.I.E. … at times, the public question paper gets slight
deviation from the above given Blue Print."* The "IPE 24 QF" sheet (pp.3-4) fixes topic by
question number: Q1-2 Circle · Q3 System of Circles · Q4 Parabola · Q5 Hyperbola · Q6-7
Integration · Q8-9 Definite Integrals · Q10 D.E. · Q11 Circle · Q12 System · Q13-14 Ellipse ·
Q15 Hyperbola · Q16 Definite Integrals · Q17 D.E. · Q18-19 Circle · Q20 Parabola · Q21-22
Integration · Q23 Definite Integrals · Q24 D.E.

Structural facts that follow: **Ellipse is SAQ-only** (the 2B counterpart of 1B's Locus);
System of Circles and Hyperbola have no Section-C slot; Parabola and Integration have no
Section-B slot. No form was invented where the blueprint has no slot.

## The Index — chapter inventory and page ranges (book p.6)

The book is cut into three sections by mark, then four appendices. 18 book chapters map to the
8 syllabus units above; **unit numbers in `units.json` are the blueprint numbers**, never the
book's chapter numbers (the 1A/1B rule).

**LAQ chapters (7 marks) — chapters 1-5, book pp.14-48** (section table p.13)

| Ch | Chapter | Marks | Pages | Stars | SSP pages |
|---|---|---|---|---|---|
| 1 | Circle | 7+7 | 14-21 | ★★★ | 14, 18, 19 |
| 2 | Parabola | 7 | 22-25 | ★★★ | 22, 23, 25 |
| 3 | Integration | 7+7 | 26-37 | ★★★ | 26, 27, 28, 31, 34 |
| 4 | Definite Integrals | 7 | 38-43 | ★★★ | 38, 42 |
| 5 | Differential Equations | 7 | 44-48 | ★★ | — |

**SAQ chapters (4 marks) — chapters 6-11, book pp.49-75** (section table p.49)

| Ch | Chapter | Marks | Pages | Stars | SSP pages |
|---|---|---|---|---|---|
| 6 | Circle | 4 | 50-53 | ★★ | 50, 53 |
| 7 | System of Circles | 4 | 54-56 | ★★★ | 54, 55 |
| 8 | Ellipse | 4+4 | 57-65 | ★★★ | 57, 58, 59, 60 |
| 9 | Hyperbola | 4 | 66-67 | ★★ | 66 |
| 10 | Definite Integrals | 4 | 68-71 | ★★★ | 68, 69 |
| 11 | Differential Equations | 4 | 72-75 | ★★ | 72, 73 |

**VSAQ chapters (2 marks) — chapters 12-18, book pp.76-95** (section table p.76)

| Ch | Chapter | Marks | Pages | Stars | SSP pages |
|---|---|---|---|---|---|
| 12 | Circle | 2+2 | 77-79 | ★★★ (table) / ★★ (chapter header p.77) | 77, 79 |
| 13 | System of Circles | 2 | 80-81 | ★★ | 80 |
| 14 | Parabola | 2 | 82-83 | ★★★ | 82 |
| 15 | Hyperbola | 2 | 84-85 | ★★★ | 84 |
| 16 | Integration | 2+2 | 86-89 | ★★★ | 86 |
| 17 | Definite Integrals | 2+2 | 90-92 | ★★★ | 90, 92 |
| 18 | Differential Equations | 2 | 93-95 | ★★ | 93 |

**Appendices:** Star Questions Plus pp.96-102 (answers 196-218) · Bullet Model Paper
pp.103-117 · 5 Model Guess Papers pp.118-127 · 5-Steps Revision Programme p.128.

Answers are numbered continuously through the book — LAQ 1 → ~44, SAQ 45 → ~102, VSAQ 103 →
~195, Star Q+ 196 → 218 — with twins as sub-numbers (`1.1`, `1.2`, `45.1`, `103.2`). The manifest
`ref`s are sequential per section per unit (`laq1, laq2, …`); the book's answer number lives in
each card's `verification.note`.

## The hit lists — priority signal, never inventory

The book prints three: **TOP 30+ LAQ** (pp.7-8, 32 rows), **TOP 35 SAQ** (pp.9-10), **TOP 50+
VSAQ** (pp.11-12, 55 rows). Each row gives the question, and an `Ans-Page` pointer of the form
`P 14(1.1)` — book page 14, answer 1.1. The 1A lesson applies unchanged: a chapter scoped from a
hit list was short by two; **scope a chapter by walking to its BOUNDARY — read the page after the
one you think is the last.** Every unit agent reports the boundary pages it read.

## Star rank, appearances, mark splits — how each signal maps

- **Stars are the CHAPTER-SECTION's**, from the three section tables, applied to every entry of
  that chapter-section (1A rule 6). Where a chapter header disagrees with its table (Circle VSAQ:
  table ★★★, header ★★) the table is used and the disagreement recorded.
- **Appearances** are board-split: `TS 16,18` → `{year: 2016, board: "ts_ipe"}` …; `AP 15` →
  `ap_ipe`. A plain `IPE 14` tag is the pre-2014 undivided board, for which the enum has no value —
  recorded in `verification.note` prose (1A rule 2).
- **Mark splits** are sourced only where the page prints margin tags (`1 Mark`, `2 Marks`), which
  this series does on single-column pages and almost never on two-column pages (the columns take
  the margin). Everywhere else the split is ours, patterned on the nearest printed split of the
  same shape in the same chapter, and the card says so. All splits ship
  `needs_teacher_verification: true`.

## Two checks that are impossible for this paper — recorded, not hidden

1. **No two-book union check**: there is no TSBIE second-year BLM on hand.
2. **No board back-test**: `answer-book/papers/` holds first-year physics only. The book's five
   Guess Papers (pp.118-127) are the stand-in corpus — the authored set is diffed against them at
   the end (§ Back-test, below).

Both are stated in every card's `verification.note` and in the `units.json` comment.

## Star Questions Plus — surveyed up front, folded in per unit

Answers 196-218, book pp.96-102, organised by chapter banner ("CIRCLE-LAQ & SAQ", "CIRCLES-VSAQ",
"SYSTEM OF CIRCLES", "PARABOLA-VSAQ", "ELLIPSE", "HYPERBOLA", "DEFINITE INTEGRALS-VSAQ", then three
area questions). Each unit's share is folded in as that unit is built (the 1B rule); **section
classification of a bank question is ours**, by shape, and each such card says so.

## The scan is not the book: a missing page and a doubled one

Found by the 2026-08-29 page survey (every page 13-127 read) and verified on the pages: **printed
p.23 was never scanned and printed p.43 was scanned twice**, and the two defects cancel to 128
pages, so nothing looks amiss from the page count. The map:

| PDF page | Printed page |
|---|---|
| 1-22 | 1-22 |
| **23-42** | **24-43** (request PDF N−1 for printed N) |
| 43 | 43 again (duplicate of PDF 42) |
| 44-128 | 44-128 |

Every page number in this document is the PRINTED one.

Printed p.23 carried Parabola LAQ answers **10** and **11** (and is an SSP page per the p.13
divider). Answer 10 is pinned by Guess Paper 2's pointer "P 23(10)" and by the LAQ hit list to
"parabola through (−1,2), (1,−1), (2,1), axis parallel to the x-axis", and has no worked solution
anywhere in the scan — authored by us using the book's own method for answer 12. Answer 11 is
presumed to be the Bullet Model Paper p.113 item "parabola through (−2,1), (1,2), (−1,3)", which
has no other home in the book; authored from that worked answer. Both cards say so.

## The inventory — 218 answer numbers, 260 distinct questions, plus 11 practice questions

| Section | Ch | Chapter | Printed pp | Answers | Qs | Rank | SSP pages |
|---|---|---|---|---|---|---|---|
| LAQ | 1 | Circle | 14-21 | 1.1 → 8 | 12 | 3 | 14, 18, 19 |
| LAQ | 2 | Parabola | 22-25 | 9 → 15 | 7 | 3 | 22, 23, 25 |
| LAQ | 3 | Integration | 26-37 | 16.1 → 31 | 20 | 3 | 26, 27, 28, 31, 34 |
| LAQ | 4 | Definite Integrals | 38-43 | 32.1 → 38 | 9 | 3 | 38, 42 |
| LAQ | 5 | Differential Equations | 44-48 | 39.1 → 44.2 | 10 | 2 | — |
| SAQ | 6 | Circle | 50-53 | 45.1 → 52 | 10 | 2 | 50, 53 |
| SAQ | 7 | System of Circles | 54-56 | 53.1 → 57.2 | 9 | 3 | 54, 55 |
| SAQ | 8 | Ellipse | 57-65 | 58 → 77 | 20 | 3 | 57, 58, 59, 60 |
| SAQ | 9 | Hyperbola | 66-67 | 78.1 → 81 | 6 | 2 | 66 |
| SAQ | 10 | Definite Integrals | 68-71 | 82 → 91 | 10 | 3 | 68, 69 |
| SAQ | 11 | Differential Equations | 72-75 | 92 → 102 | 11 | 2 | 72, 73 |
| VSAQ | 12 | Circle | 77-79 | 103.1 → 115 | 22 | 3 | 77, 79 |
| VSAQ | 13 | System of Circles | 80-81 | 116.1 → 120 | 9 | 2 | 80 |
| VSAQ | 14 | Parabola | 82-83 | 121.1 → 129 | 11 | 3 | 82 |
| VSAQ | 15 | Hyperbola | 84-85 | 130 → 138 | 9 | 3 | 84 |
| VSAQ | 16 | Integration | 86-89 | 139.1 → 164 | 29 | 3 | 86 |
| VSAQ | 17 | Definite Integrals | 90-92 | 165 → 180.2 | 18 | 3 | 90, 92 |
| VSAQ | 18 | Differential Equations | 93-95 | 181 → 195 | 15 | 2 divider / 3 header | 93 |
| — | — | Star Questions Plus | 96-102 | 196 → 218 | 23 | — | — |
| | | **Total** | | 1 → 218 | **260** | | 35 |

(Rank = the star count on the section divider, which is the source of truth; see §Star rank above.)

No numbering jumps inside the numbered chapters; no chapter starts mid-page; the only out-of-order
run is Star Q+ p.97, where 203 is printed before 202. Sub-heads worth knowing: Integration LAQ is
cut into INTEGRATION-I/II/III/IV and its **II block (answers 19, 20, p.29) carries the book's own
"[to be deleted]" banner** — a syllabus-deletion marker, flagged for the retire mechanism; Ellipse
SAQ has LEVEL-I and LEVEL-II; Definite Integrals SAQ has an AREAS sub-section (89-91).

**Eleven answer-only practice questions** sit under numbered answers (Circle LAQ p.18 twice and
p.19 twice; Integration p.29 twice; Circle SAQ p.53; System of Circles p.56; Definite Integrals
SAQ p.69; Definite Integrals VSAQ p.91 and p.92). They are authored as cards where the unit agent
could derive the worked answer, with the note saying the book prints the answer only. Two of them
get their only worked solution in the Bullet Model Paper (the p.53 conjugate-lines SAQ on p.107;
the p.19 touching-circles LAQ on p.112).

## Star Questions Plus — where each of the 23 went

| Answers | Banner | Unit | Section (ours, by shape) |
|---|---|---|---|
| 196 | CIRCLE-LAQ & SAQ | 1 | LAQ |
| 197, 198 | CIRCLE-LAQ & SAQ | 1 | SAQ |
| 199, 200, 201, 203, 202, 204, 205 | CIRCLES-VSAQ | 1 | VSAQ |
| 206 | SYSTEM OF CIRCLES | 2 | VSAQ |
| 207 | SYSTEM OF CIRCLES | 2 | SAQ |
| 208, 209 | PARABOLA-VSAQ | 3 | VSAQ |
| 210 | ELLIPSE | 4 | SAQ (the unit is SAQ-only) |
| 211 | HYPERBOLA | 5 | SAQ |
| 212, 213, 214, 215 | DEFINITE INTEGRALS-VSAQ | 7 | VSAQ |
| 216, 217, 218 | DEFINITE INTEGRALS-VSAQ | 7 | SAQ (areas) |

**Integration and Differential Equations receive nothing** from this bank.

## The Bullet Model Paper (pp.103-117) — 87 worked items, 5 genuinely new

Organised as Q1-Q24 with several compact worked items per paper slot. 82 of the 87 repeat a
numbered answer or a Star Q+ item. The five new ones are authored as extras, each note naming
"Bullet Model Paper p.N":

| Printed p. | Slot | Question |
|---|---|---|
| 103 | Q1&2 → VSAQ | circle through (3,4) with centre (−3,4) |
| 103 | Q3 → VSAQ | k for the orthogonal pair x²+y²+2by−k=0, x²+y²+2ax+8=0 |
| 103 | Q3 → VSAQ | radical axis of x²+y²−3x−4y+5=0 and 3(x²+y²)−7x+8y−11=0 |
| 107 | Q11 → SAQ | k for x+y−5=0, 2x+ky−8=0 conjugate w.r.t. x²+y²−2x−2y−1=0 (the p.53 practice question's only worked solution) |
| 112 | Q18&19 → LAQ | the touching circles x²+y²−4x−6y−12=0, x²+y²+6x+18y+26=0 (the p.19 practice question's only worked solution) |

The sixth candidate, p.113's parabola through (−2,1), (1,2), (−1,3), is treated as the missing
answer 11.

## Printed figures — the complete sweep (every page 13-127 inspected)

**Seventeen printed figures in the whole book**, and they cluster hard: six of the seven VSAQ
chapters, all three of Integration / Definite Integrals / Differential Equations LAQ, System of
Circles SAQ, Hyperbola SAQ and the five Guess Papers carry none at all.

| Printed p. | Answer | What is drawn | Load-bearing? |
|---|---|---|---|
| 20 | 6 | two circles, direct common tangents meeting at the external centre of similitude | supportive |
| 22 | 9 | the parabola derivation: axes, directrix, Z, A, S(a,0), P, M, N | **yes** |
| 24 | 12 | small parabola, axis parallel to the y-axis (ornament) | no |
| 50 | 46 | circle, chord AB, foot D, right angle | **yes** |
| 51 | 48 | circle, perpendicular p to the tangent, point of contact | **yes** |
| 52 | 49 | circle with the tangent at (3,−1) and its parallel | supportive |
| 52 | 50 | circle, perpendicular p onto x+y−8=0 | supportive |
| 64 | 75 | ellipse, tangent at P meeting the axes at M and N | **yes** |
| 65 | 77 | ellipse, B(0,b), foci S and T, triangle STB | **yes** |
| 71 | 90 | y²=4x and x²=4y, region shaded | **yes** |
| 71 | 91 | y²=4ax and x²=4by, region shaded | **yes** |
| 83 | 126.1 | parabola, vertex (3,−2), focus (3,1) | supportive |
| 83 | 126.2 | parabola, vertex (1,−2), focus (1,−7) | supportive |
| 96 | 196 | circle with centre on the x-axis through two points | supportive |
| 99 | 208 | parabola x²=−4y | supportive |
| 102 | 218 | ellipse, first-quadrant region OAB shaded | **yes** |
| 113 | BMP Q20 | the p.22 derivation figure reprinted small | **yes** |

Printed p.23's figure status is unknown (missing from the scan).

## Printed mark splits — 14 of 260

| Printed p. | Answer | Split |
|---|---|---|
| 16 | 3 | 1+1+2+2+1 (7) |
| 17 | 4 | 1+1+1+4 (7) |
| 22 | 9 | 1+2+1+1+1+1 (7) |
| 51 | 48 | 1+1+1+1 |
| 57 | 58, 59 | 1+1+1+1 |
| 68 | 82, 83 | 1+1+2 |
| 70 | 88 | 1+1+1+1 |
| 72 | 94 | 1+1+1+1 |
| 73 | 95 | 1+1+2 |
| 93 | 181, 182 | 1+1 |
| 94 | 184 | 1+1 |

Every other split is ours, patterned on these shapes — 7-mark splits open "1+1+…" and end in a
heavy final step; 4-mark splits are either 1+1+1+1 (list-of-quantities answers) or 1+1+2 (the
add-and-halve pattern where the integral from 0 to a of f equals the integral of f(a−x)); 2-mark
splits are always 1+1 — and each card says which printed split it followed.

## Year tags

Black badges reading "AP nn" / "TS nn", years comma-listed inside a badge, boards stacked
vertically (answer 110.1 carries four). Range **2014 to 2022**. "IPE 14", the pre-bifurcation
combined paper, appears on exactly four answers — 46, 85, 142, 218 — and is recorded in prose
rather than as data, because the board enum has no value for it. "AP 21" appears only on answers
134 and 193. A substantial minority of answers carry no tag at all.

## Where this book is wrong

Survey findings; each unit agent's findings are appended to its own section below. Every case is
written correctly on the card, with the book's printed claim recorded in that step's `why` and in
`verification.note`.

1. **p.112 (Bullet Model Paper Q18&19)**, the touching circles x²+y²−4x−6y−12=0 and
   x²+y²+6x+18y+26=0: the solution restates the second circle as x²+y²+2x−8y+13=0 and computes
   r₂ = 2 — both lines belong to answer 5.3 on p.19 — then uses r₂ = 8 two lines later. The final
   answers (contact point (1/13, −21/13), common tangent 5x+12y+19=0) are correct, so a student
   following line by line meets a contradiction that never surfaces in the result.
2. **p.69, answer 84**: after the substitution x → π/2 − x, the printed line (2) is identical to
   line (1); the numerator should read cos⁵x. The next step adds (1) and (2) using cos⁵x anyway
   and the answer π/4 is right. Answers 82 and 83 do the same manoeuvre correctly.
3. **p.92, the practice question under answer 176**: the integral of cos⁷x sin²x from 0 to π/2 is
   printed as 8/315 and is **wrong** — the value is **16/315** (the integral of u²(1−u²)³ over
   0 to 1 is 1/3 − 3/5 + 3/7 − 1/9). 8/315 is answer 176's own value, copied from the question
   above it. Tagged AP 22, so it will surface in any back-test.
4. **p.29**: both Integration practice questions carry dead pointers — "P 89(184)" and
   "P 89(185)"; p.89 holds answers 160-164 and 184/185 are differential-equations questions on
   p.94.
5. **Guess-paper pointers**: MP-4 Q7 "P 88(152)" should be p.86 answer 141; MP-2 Q2 "P 69(110.1)"
   is on p.79; MP-3 Q7 "P 87(140.1)" is on p.86.
6. **p.106 (BMP Q10)** prints the order-and-degree question with a minus sign and immediately
   works it with a plus; the VSAQ original (p.93, answer 181) prints plus, so the model paper's
   question is the misprint. Guess Paper 1 Q10 repeats the minus.
7. **p.97**: the Star Q+ run is printed 199, 200, 201, 203, 202, 204, 205.
8. **p.93 against p.76**: Differential Equations VSAQ is ranked two stars on the divider and three
   on the chapter header.
9. **p.22**: "Munch all these Five STAR Q's in PARABOLA" over a chapter holding seven questions.
10. **p.53**: the practice question's pointer "Few More SAQ in Page 96" resolves to nothing — p.96
    holds Star Q+ 196-198.

Flagged for a re-read of the physical book rather than asserted as errors: p.50 answer 45.2 stops
at 2√24 without reducing to 4√6; p.90 answer 166's printed upper limit reads as 1 or 3 in the scan
while the working uses 3; p.28 answer 18.2's final line may have dropped a leading minus on the
csc³x cot x term, or that may be a crop at the page edge.

## Back-test — the five Guess Papers stand in for the missing paper corpus

`answer-book/papers/` holds first-year physics only, so the book's own five Model Guess Papers
(pp.118-127, 120 question slots with "Ans-Page" pointers) are the back-test corpus: every slot
must resolve to an authored card. 116 of the 120 point into the numbered chapters and 4 into Star
Questions Plus (MP-4 Q1 → 199, MP-5 Q2 → 201, MP-5 Q9 → 217, MP-5 Q19 → 196), which is why the
Star Q+ bank is folded in rather than skipped. Three pointers are themselves wrong (§ above) and
one, MP-2 Q20 → "P 23(10)", points at the page missing from the scan.
