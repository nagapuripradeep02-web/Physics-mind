# IPE Maths-1B — source analysis + paper blueprint

> Part-0 for the second mathematics paper, done 2026-08-23 on `feat/ipe-mathematics-answerbook`,
> the same desk that authored Maths-1A. Companion to `docs/patterns/answer_book.md` (schema +
> mechanisms, subject-neutral), `docs/IPE_MATHS_1A_SOURCE.md` (the first paper) and
> `docs/MATHS_1B_START_HERE.md` (the handoff that opened this work).

## The source

`Ipe maths-1B (bullet baby).pdf` — **"JUNIOR INTER MATHS-1B, Baby Bullet-Q"**, Sri Publishers,
Machilipatnam. **127 pages**, and like the 1A scan it has **no text layer at all** (0 characters
on every page sampled), so every fact below was read from rendered page images.

Same publisher, same series and the same organising principle as the 1A book: a **question bank
organised by mark cut**, giving question text, star rank, printed appearance years and
occasionally a printed mark split — never its prose (Rule 41/30i: the book's "BABY CHAT" boxes
are personified and part Telugu).

- **Book page = scan page + 1** (scan `p052.png` = book p.53). Verified at the Index (scan p005 =
  book p.6) and again at the Locus chapter header (scan p052 = book p.53). Same offset as 1A.
- On this Mac, `pdftotext`/`pdftoppm`/`mutool` are all absent and the Read tool's PDF path fails
  on a scan. **PyMuPDF renders it with no Homebrew**: `pip3 install pymupdf`, then
  `fitz.open(pdf)[i].get_pixmap(dpi=110).save(...)`. 110 dpi gives ~740×1200 and is legible.
  (1A used a JXA/PDFKit script; PyMuPDF is simpler and is what this paper used.)

## The paper blueprint

**Maths-1B = 24 questions, 75 marks, 3 hours** — the same shape as Maths-1A: Section A Q1-Q10
VSAQ ×2 all compulsory, Section B Q11-Q17 SAQ ×4 any 5, Section C Q18-Q24 LAQ ×7 any 5.

The book prints an **IPE BLUE PRINT** (book p.3) mapping every chapter to its marks. Transcribed:

| # | Chapter | VSAQ (2m) | SAQ (4m) | LAQ (7m) | Total |
|---|---|---|---|---|---|
| 1 | Locus | — | 4 | — | 4 |
| 2 | Transformation of Axes | — | 4 | — | 4 |
| 3 | The Straight Line | 2+2 | 4 | 7 | 15 |
| 4 | Pair of Straight Lines | — | — | 7+7 | 14 |
| 5 | 3D-Coordinates | 2 | — | — | 2 |
| 6 | D.C's & D.R's | — | — | 7 | 7 |
| 7 | The Plane | 2 | — | — | 2 |
| 8 | Limits & Continuity | 2+2 | 4 | — | 8 |
| 9 | Differentiation | 2+2 | 4 | 7 | 15 |
| 10.1 | Errors and Approximations | 1 | — | — | 2 |
| 10.2 | Tangents and Normals | — | 4 | 7 | 11 |
| 10.3 | Rate Measure | — | 4 | — | 4 |
| 10.4 | Mean Value Theorems | 2 | — | — | 2 |
| 10.5 | Maxima and Minima | — | — | 7 | 7 |
| | **IPE Weightage** | **10×2=20** | **5×4=20** | **5×7=35** | **75** |

The book's own caveat, printed under the table and worth carrying: *"The Blue print is prepared
according to the 'Model Question Paper' issued by B.I.E. … at times, the public question paper
gets slight deviation from the above given Blue Print."* So 1B's topic-by-question-number map is
**weaker than 1A's** — where 1A could say "Q19 is always Mathematical Induction", 1B's blueprint
is the model paper's, not a guarantee.

**Two structural differences from Maths-1A worth knowing before authoring:**

1. **Unit 10 is a composite — but ships as ONE unit.** The syllabus unit "Applications of
   Derivatives" carries five sub-chapters (10.1 Errors, 10.2 Tangents & Normals, 10.3 Rate Measure,
   10.4 Mean Value Theorems, 10.5 Maxima & Minima) that the book treats as separate chapters with
   separate mark cuts. **Founder decision 2026-08-23: they become a single catalog unit**, because
   unit numbers are syllabus numbers everywhere else in this manifest. It will be the largest unit
   on the paper at 26 marks, spanning all three sections.
2. **Pair of Straight Lines holds two Section-C slots** (7+7), exactly as Matrices does on 1A.

The book also prints an **"IPE 24 QF"** formula sheet (book pp.4-5) — 24 blocks of question
formulae. It is a revision aid, not an inventory, and is not a source for question text.

## The Index — chapter inventory and page ranges

From book p.6, the book is cut into three sections by mark, then three appendices:

**LAQ chapters (7 marks) — chapters 1-6, book pp.14-51**

| Ch | Chapter | Marks | Pages | Stars |
|---|---|---|---|---|
| 1 | The Straight Line | 7 | 14-18 | ★★★ |
| 2 | Pair of Straight Lines | 7+7 | 19-26 | ★★★ |
| 3 | D.C's & D.R's | 7 | 27-31 | ★★★ |
| 4 | Differentiation | 7 | 32-37 | ★★★ |
| 5 | Tangents & Normals | 7 | 38-45 | ★★★ |
| 6 | Maxima & Minima | 7 | 46-51 | ★★ |

**SAQ chapters (4 marks) — chapters 7-13, book pp.53-77**

| Ch | Chapter | Marks | Pages | Stars |
|---|---|---|---|---|
| 7 | Locus | 4 | 53-56 | ★★★ |
| 8 | Transformation of Axes | 4 | 57-60 | ★★★ |
| 9 | The Straight Line | 4 | 61-64 | ★★★ |
| 10 | Limits & Continuity | 4 | 65-67 | ★★★ |
| 11 | Differentiation | 4 | 68-71 | ★★★ |
| 12 | Tangents & Normals | 4 | 72-75 | ★★★ |
| 13 | Rate Measure | 4 | 76-77 | ★★ |

**VSAQ chapters (2 marks) — chapters 14-20, book pp.79-103**

| Ch | Chapter | Marks | Pages |
|---|---|---|---|
| 14 | The Straight Line | 2+2 | 79-82 |
| 15 | 3-D Coordinates | 2 | 83-84 |
| 16 | The Plane | 2 | 85-86 |
| 17 | Limits & Continuity | 2+2 | 87-92 |
| 18 | Differentiation | 2+2 | 93-99 |
| 19 | Errors & Approximations | 2 | 100-102 |
| 20 | Mean Value Theorems | 2 | 103 |

**Appendices:** Star Questions Plus pp.104-108 · Bullet Model Paper pp.109-123 ·
5 Model Guess Papers pp.124-128.

## Star Questions Plus — surveyed up front, folded in per unit

**Answers 181-196, book pp.104-108 — sixteen questions.** Boundary walked: book p.109 is the Bullet
Model Paper. The bank is organised by chapter but sits **after every numbered chapter**, so it is
**not part of any chapter's own inventory**.

**Founder decision 2026-08-23: fold each unit's share in AS THAT UNIT IS BUILT**, rather than late.
On 1A this bank was discovered at the end and added 34 questions to a book of 216; surveying it
first means no unit is ever declared complete and then reopened.

| Answers | Chapter heading | Unit | Count |
|---|---|---|---|
| 181 | Transformation of Axes | 2 | 1 |
| 182-184 | Straight Lines | 3 | 3 |
| 185, 186 | Pair of Lines | 4 | 2 |
| 187, 188 | 3D Geometry | 5 | 2 |
| 189, 190 | Limits | 8 | 2 |
| 191-195 | Derivatives | 9 | 5 |
| 196 | Rate Measure | 10 | 1 |

**Units 1, 6 and 7 receive nothing** — the bank holds no Locus, D.C's & D.R's or Plane question. So
Locus is genuinely finished at 12.

⚠ **Section classification for a bank question is OURS, not the book's.** Its headings name the
CHAPTER, never the mark cut, and the bank prints no `[N Marks]` tags anywhere. Each backfilled file
says so in its own verification note. The VSAQ hit list also points into these pages (VSAQ 25/26 at
p.107), which confirms the bank carries questions of more than one length.

**Note the chapter/unit mismatch:** 20 book chapters map to 14 blueprint rows and 10 syllabus
units. Unit numbers in `units.json` are **syllabus/paper** numbers, never the book's chapter
numbers — same rule as 1A.

## The hit lists — priority signal, never inventory

The book prints three: **TOP 40 LAQ** (pp.7-8), **TOP 35 SAQ** (pp.9-10), **TOP 60 VSAQ**
(pp.11-12). Each row gives the question, its stars and an `Ans-Page` pointer of the form
`P 53(42.1)` — book page 53, answer number 42.1.

**These are SELECTIONS, not inventories.** This is the single most expensive lesson of 1A: Unit
3's SAQ chapter was scoped from the "TOP 40 SAQ" list, recorded as 9 questions, and was actually
11 — the two missed ones surfaced only when a later chapter boundary was walked. The rule that
fixed it applies unchanged here: **scope a chapter by walking to its BOUNDARY — read the page
after the one you think is the last — never from a hit list.** The hit lists are the priority
signal; the chapter pages are the inventory.

Locus proves the rule again on its first use: the SAQ hit list names **6** Locus questions;
the chapter itself holds **12**.

## Mark splits

The 1B book prints splits **more often than 1A did**, and prints them in the right margin as
`1 Mark` / `2 Marks` tags rather than as a `1+1+1+1` header. Where a tag is printed, the split is
**sourced**; everywhere else it is ours and each file says so.

The Locus chapter prints its split on **two** of its twelve answers (44 and 46, both `1 + 1 +
2`), and both times against the same three moves:

| Printed tag | The move it sits beside |
|---|---|
| 1 Mark | writing the given condition in distance form |
| 1 Mark | substituting the coordinates into it |
| 2 Marks | simplifying to the equation of the locus |

That is the shape every Locus answer in this book takes, so **the whole unit's split is patterned
on the book's own printed one** rather than inferred from another chapter. The same page-layout
rule found on 1A explains the gaps: answers 44, 46 and 48 sit **alone** on a page and carry margin
tags; the paired answers (42.1/42.2, 43.1/43.2, 45.1/45.2, 47.1/47.2) are set **two to a page in
two columns**, which takes the margin those tags would occupy.

## Figures in the source — the complete sweep (2026-08-24)

Every one of the book's 127 scan pages was rendered and read for printed figures, so this list is
an **inventory, not a selection**. The same sweep was run on 1A; see `IPE_MATHS_1A_SOURCE.md`,
which also records the method and its one known failure mode.

**Fifteen answers in Maths-1B carry a printed figure — 1B is the drawing paper, 1A is not.**

| Book p. | Answer | Question | Figure | Answer-book file |
|---|---|---|---|---|
| 15 | 2.1 | Orthocentre of (−5,−7), (13,2), (−5,6) | △ with two altitudes meeting at O | `ts_ipe_m1b_sl_orthocentre_minus5_minus7_13_2_minus5_6` ✅ |
| 15 | 2.2 | Orthocentre of (−2,−1), (6,−1), (2,5) | △ with two altitudes meeting at O | `ts_ipe_m1b_sl_orthocentre_minus2_minus1_6_minus1_2_5` ✅ |
| 16 | 3 | Orthocentre from the three side equations | △ with sides numbered (1)(2)(3) | `ts_ipe_m1b_sl_orthocentre_from_sides_x_y_10` ✅ |
| 17 | 4 | Circumcentre from the three side equations | △ with sides numbered | `ts_ipe_m1b_sl_circumcentre_from_sides_x_y_2` ✅ |
| 18 | 5.1 | Foot of the perpendicular (proof) | P, the line ax+by+c=0 and the foot Q | `ts_ipe_m1b_sl_foot_of_perpendicular_proof` ✅ |
| 18 | 5.2 | Image of a point (proof) | P, the line, the foot R and the image Q | `ts_ipe_m1b_sl_image_of_point_proof` ✅ |
| 20 | 7 | Area of the △ formed by a pair of lines and lx+my+n=0 | the two lines through O and the cutting line, A and B | `ts_ipe_m1b_pl_area_triangle_proof` ✅ |
| 30 | 19 | Angle between two diagonals of a cube | cube on the axes, O A B C L M N P | `ts_ipe_m1b_dc_angle_between_cube_diagonals` ✅ |
| 31 | 20 | A ray and the four diagonals of a cube | same cube | `ts_ipe_m1b_dc_four_diagonals_cos_squares` ✅ |
| 48 | 38 | Cylinder of maximum curved surface in a sphere | sphere with the inscribed cylinder, h, r, R | — Unit 10 not authored yet |
| 49 | 39 | Open box from a 30×80 sheet | rectangle with the four corner squares of side x | — Unit 10 not authored yet |
| 50 | 40 | Window: rectangle surmounted by a semicircle | the window, x and 2r marked | — Unit 10 not authored yet |
| 51 | 41 | Wire cut into a square and a circle | the cut segment x \| l−x, the square of side y, the circle of radius r | — Unit 10 not authored yet |
| 53 | 42.3 | Locus: (2,3) and (−1,5) subtend a right angle at P | △APB, right angle at P | `ts_ipe_m1b_loc_right_angle_2_3_minus1_5` ✅ |
| 83 | 98 | Fourth vertex of a parallelogram | parallelogram ABCD with both diagonals | `ts_ipe_m1b_td_fourth_vertex_parallelogram` ✅ |

**Four of the fifteen are waiting on a unit, not on a drawing.** Book pp.48-51 are the Maxima &
Minima chapter, which belongs to Unit 10 (Applications of Derivatives) — the composite unit that
is not authored yet. Every one of those four is a **word problem whose figure IS the modelling
step**, so all four should ship with one when the unit is built; that is the strongest single
argument for authoring Unit 10 with figures from the first pass rather than adding them later.

**Six figures in the repo are OURS, not the book's**, and the distinction matters because it is
easy to lose. The book draws the orthocentre triangle on answers 2.1, 2.2 and 3, and the
circumcentre triangle only on answer 4 — but a previous pass generalised both across their whole
families, so five circumcentre files and five orthocentre files carry one. That is a defensible
call (the figure is the same picture with different numbers) and it is left standing; it is
recorded here so a later reader does not read those ten figures back as evidence of what the book
prints. **Locus was deliberately NOT generalised the same way**: answers 42.1 and 42.2 pose the
identical right-angle condition in the two columns above 42.3 and the book draws neither, so only
42.3 carries a figure and its `verification.note` says so.

**Where the figures are NOT.** Transformation of Axes, Limits & Continuity, Differentiation,
Tangents & Normals, Rate Measure, Errors & Approximations and Mean Value Theorems carry **no
figure at all**, in any of their chapters. The Bullet Model Paper reprints the orthocentre
triangle on book p.117 and introduces nothing new; the five Guess Papers are question-only.

## Unit 1 — Locus (book pp.53-56, SAQ only)

**COMPLETE at 12 of 12.** Boundary walked: book p.57 is the Transformation of Axes chapter header.

The blueprint gives Locus **one Section-B slot and nothing else** — no VSAQ, no LAQ — and the book
agrees: there is no Locus LAQ chapter (LAQ chapters are 1-6) and no Locus VSAQ chapter (VSAQ
chapters are 14-20). It is an **SAQ-only unit**, the 1B counterpart of 1A's Units 7 and 8.

Every answer in the chapter is the same five-line method — *take P(x,y) · write the given
condition · substitute the distances · simplify · state the locus* — over five different
conditions:

| Family | Answers | Condition | Locus produced |
|---|---|---|---|
| Right angle at P | 42.1, 42.2, 42.3 | ∠APB = 90° ⇒ PA² + PB² = AB² | a circle |
| Fixed area | 43.1, 43.2 | area of △PAB = k | a **pair** of parallel lines |
| Weighted squares | 44 | PA² + PB² = 2PC² | a straight line |
| Sum of distances | 45.1, 45.2 | PA + PB = k | an ellipse |
| Ratio / difference | 46, 47.1, 47.2, 48 | PA:PB = m:n, or \|PA − PB\| = k | a circle or a hyperbola |

Two properties of the chapter shaped the authoring:

- **The fixed-area family does not produce one locus.** 43.1 and 43.2 both end in a *product of
  two linear factors* — the absolute value opens to ±, and both branches are part of the answer.
  They are the chapter's only answers that are not a single curve, and the commonest error in the
  family is dropping one branch. (The 1A precedent is the Gauss-Jordan pair 20.3/20.4, whose
  closing argument likewise differed from its family.)
- **`render: "katex"` is used in exactly one place** — the 2×2 determinant of the area formula in
  43.1 and 43.2. Every other line in the unit is honest one-line Unicode and stays `plain`.

Appearance years are dense in this chapter (43.1 alone is printed `AP 17,19,22` and
`TS 15,17,19,22`), which is what the ★★★ chapter rank reflects.

## Conventions carried from 1A

- Id prefix **`ts_ipe_m1b_<chapter>_<slug>`**; Locus uses the chapter tag `loc`.
- `subject: "mathematics_1b"` in both the question files and the `units.json` units —
  Maths-1A owns `"mathematics"` and its own Unit 1, so the two papers cannot share a value.
  The build fails on a duplicate `subject-number` key.
- `year_cycle: "first_year"`, `class_label: "Intermediate I Year (Class 11)"` — 1B is a
  first-year paper, same as 1A.
- `margin_note` on every step, no `memory_tip`, no `insider_note` — the 1A mathematics
  convention, and the build enforces all-or-none per question either way.
- Every file's `verification.note` names the book, the page, the answer number, the printed
  appearance years, and says explicitly whether the mark split is the book's or ours.

## Unit 2 — Transformation of Axes (book pp.57-60 + SQP 181, SAQ only)

**COMPLETE at 9 of 9.** Boundary walked: book p.61 is SAQ chapter 9, The Straight Line.

Same shape as Locus — the Blue Print gives it one Section-B slot and nothing else, and the book has
no Transformation of Axes LAQ chapter (LAQ chapters 1-6) and no VSAQ chapter (VSAQ chapters 14-20).

Two methods, four questions each, plus one general proof:

| Method | Answers | Asked for | Formulas used |
|---|---|---|---|
| Translation | 49.1, 49.2 | the NEW equation | x = X + h, y = Y + k |
| Translation | 50, **SQP 181** | the ORIGINAL equation | X = x − h, Y = y − k |
| Rotation | 51.1, 51.2, 52 | the NEW equation | x = Xcosθ − Ysinθ, y = Ycosθ + Xsinθ |
| Rotation | 53 | the ORIGINAL equation | X = xcosθ + ysinθ, Y = ycosθ − xsinθ |
| Proof | 54 | the angle θ itself | both, kept general |

**The direction of the transformation is the chapter's whole teaching point** — and its commonest
error. Going forward, x is built from X; going back, X is built from x, and under rotation the minus
sign moves from the x-formula to the Y-formula. Every file's `common_mistakes` names that swap.

**The mark split is ours; its DECOMPOSITION is the book's.** No `[N Marks]` tag appears anywhere in
this chapter, but book p.59 prints a boxed **"SOLUTION STEPS"** panel beside answers 52 and 53
giving the method in exactly four moves — take the given equation · write the change-of-axes
formulas · put them in · simplify. All eight chapter answers are cut on those four printed moves at
one mark each. Answer 54 is the exception: the chapter's only fully general proof (the book marks it
"Man of the Match"), it carries no numbers and its four steps are its own.

One transcription note recorded in two files: answers 50 and 53 print their *transformed* equation
in small letters in the question, and restate it in capitals in the first line of the solution. The
files follow the solution, so the two sets of axes stay distinguishable on the notebook page.

## Unit 3 — The Straight Line (three chapters + SQP, all three sections)

**COMPLETE at 44 of 44.** The first 1B unit to occupy **all three sections** of the paper — 2+2 in
Section A, 4 in Section B, 7 in Section C, **15 marks**, tying Differentiation as the highest-scoring
unit. It therefore has three separate chapters in this book, and all three boundaries were walked.

| Chapter | Book pages | Answers | Count | Boundary walked to |
|---|---|---|---|---|
| LAQ ch.1 | 14-18 | 1.1-5.2 + 4 practice | 12 | p.19, Pair of Straight Lines |
| SAQ ch.9 | 61-64 | 55.1-61 + 1 practice | 11 | p.65, Limits & Continuity |
| VSAQ ch.14 | 79-82 | 88.1-96 | 18 | p.83, 3-D Coordinates |
| Star Questions Plus | 104 | 182-184 | 3 | p.109, Bullet Model Paper |

### The five families

**Circumcentre** (equal distances → perpendicular bisectors) and **orthocentre** (altitudes) are each
asked two ways — from the **vertices**, or from the **sides**. The sides form differs only in needing
the vertices manufactured first by solving the lines in pairs. Then the two general **proofs**.

### The two proofs share a skeleton, deliberately

Answers 5.1 (foot of the perpendicular) and 5.2 (image of a point) have **identical first three
steps** — the book prints a note between them reading *"First half of the solution is 'same to
same'"*. They differ only in the closing condition:

- the **foot** lies ON the line → `ah + bk + c = 0` → `r = −(ax₁+by₁+c)/(a²+b²)`
- the **image**'s MIDPOINT lies on the line → `a(x₁+h)/2 + b(y₁+k)/2 + c = 0` → `r = −2(…)/(a²+b²)`

**That midpoint is where the factor 2 comes from.** The two files share step ids and labels for the
same reason 1A's solving-a-system families do.

### Five of the 44 are the book's practice questions

`laq3`, `laq6`, `laq8`, `laq10` and `saq3` are marked **PQ** in the book and posed with **only their
final answer printed** — no worked solution. **The working is ours**, checked against the book's own
printed answer, and each file says so in its verification note. Precedent: Maths-1A Unit 2 `laq8`.

One of them is worth its own note. **Answer 3 PQ's triangle is right angled** — sides `x+y+10=0` and
`x−y−2=0` have slopes −1 and 1. So the orthocentre sits exactly on the right-angled vertex, and one
computed altitude comes out *identical to a given side*. That is correct, not an error. The
observation is ours; the book prints only `(−4,−6)`.

### Mark splits

**The unit's one printed split is SAQ answer 59** (book p.63): `1 + 1 + 2` against slope-to-cos-and-sin
· the parametric point · the two required points. Everything else is ours:

- **LAQ `1+2+2+2`** — follows the book's own printed `Step-1 / Step-2 / Step-3` structure and the
  boxed **"SOLUTION STEPS"** panels on pp.16 and 17.
- **SAQ** — `1+1+2` where the answer's shape matches 59, `1+1+1+1` where it is four equal moves.
  Each file says which and why.
- **VSAQ `1+1`** — matches the printed `1+1` on VSAQ answer 98 (p.83) in the very next chapter.

## Unit 4 — Pair of Straight Lines (book pp.19-26 + SQP, LAQ only)

**COMPLETE at 15 of 15** — 11 worked answers (6-15), 2 of the book's practice questions, and
2 from the Star Questions Plus bank (185, 186). Boundary walked to p.27, D.C's & D.R's.

**Two Section-C slots.** The chapter header reads *"7+7=14 Marks"* and the Blue Print gives it 14,
**all in Section C and nothing in Section A or B** — so LAQ is the only cut this unit admits. That
also fixes the section for its two bank questions, the way 1A's Units 2, 7 and 8 fix their own. It
is the 1B counterpart of 1A's Matrices, the only other unit on either paper with two long slots.

### ⚠ This chapter holds the book's only printed LAQ splits

Both are **homogenisation** answers, and both total 7:

| Answer | Book page | Printed split |
|---|---|---|
| 12 | 24 | `1 + 1 + 2 + 1 + 2` |
| 15 | 26 | `1 + 1 + 1 + 1 + 1 + 2` |

Those two fix the shape for the whole homogenisation run (12-15 plus the two practice questions,
pp.24-26). **Every other split in the unit is ours**, and each file says so — the proofs cannot
borrow the homogenisation shape, so they are cut at the points where their argument turns.

### Two method families

**The six general proofs** (6 angular bisectors · 7 area of the triangle · 8 product of
perpendiculars · 9 the parallel-lines conditions · 10 the pair conditions · bank 185) every one open
the same way: **split the pair into two lines with unknown coefficients and match against the given
equation.** That dictionary between `(a, h, b, g, f, c)` and the two lines is what every later step
spends. Answer 9 is the odd one — a **parallel** pair splits with the *same* `l` and `m` in both
factors, differing only in the constant, and that single choice forces all three of its results.

**Homogenisation** (12-15) combines a curve and a chord into a pair of lines through the origin:
write the chord as `= 1`, multiply the curve's linear terms by it **once** and the constant
**twice**. The result must have no constant and no linear term — that is the check.

Within the run, **only the closing condition varies**:

| Condition asked | Test used | Answers |
|---|---|---|
| perpendicular | coeff x² + coeff y² = 0 | 13.1, 13.2, 14, 15 PQ |
| coincident | h² = ab | 15 |
| the angle itself | cosθ = \|a+b\|/√((a−b)²+(2h)²) | 12 |

Answers **15 and 15 PQ are a matched pair differing by one word** in the question — *coincident*
versus *right angle at the origin*. Identical homogenisation, different closing condition. They sit
on the same page for that reason.

## Unit 5 — 3D-Coordinates (book pp.83-84 + SQP, VSAQ only)

**COMPLETE at 10 of 10** — 7 worked answers (97.1-100.2), 1 practice question, 2 from the Star
Questions Plus bank (187, 188). Boundary walked to p.85, The Plane.

VSAQ-only: the Blue Print gives it 2 marks in Section A and nothing elsewhere, and the book has no
3D LAQ or SAQ chapter. Its header carries the note *"Just 2 Pages - 2 Marks"*.

### ⚠ This unit carries the sourced VSAQ split

**Answer 98 (p.83) is the only tagged answer in the chapter** — printed `1 Mark` against the
midpoint equation and `1 Mark` against the fourth vertex. It fixes the `1+1` shape used across this
unit *and* the one cited from Unit 3's VSAQ chapter, which prints none of its own.

### Three families

- **Centroid conditions** — 97.1 a triangle, 97.2 a **tetrahedron** (divide by 4, not 3), 98 a
  parallelogram via bisecting diagonals. Each gives one independent equation per coordinate.
- **Coordinate-plane section ratios** — 99.1 XZ, 99.2 YZ. A plane is where one coordinate is zero,
  so the ratio is *minus that coordinate of the first point to the second*, and a **negative ratio
  means external division** — a real answer, not an error.
- **Three distances** — 100.1 equilateral, 100.2 + its practice question collinear, bank 187.

That last family computes **the same three pairwise distances every time** and differs only in the
conclusion: all three equal → equilateral; two summing to the third → collinear. The book prints the
note *"Questioning is different but Answering is similar"* beneath them for exactly this reason.

The practice question 100.2 PQ is unusual in printing **no answer at all**, not even a final one, so
its working is entirely ours.

## Unit 6 — D.C's & D.R's (book pp.27-31, LAQ only)

**COMPLETE at 7 of 7** — answers 16.1-20. No practice questions, and **nothing from Star Questions
Plus** (one of the three units, with 1 and 7, that the bank gives nothing). Boundary walked to p.32,
Differentiation. The book's own LAQ table calls this the **easiest** of the six LAQ chapters.

### The five relation questions

Each gives two relations connecting `l, m, n` — one linear, one second-degree. Together they fix
only the **ratio** `l : m : n`, which is all a direction needs. Rearrange the linear one, substitute,
factorise the homogeneous quadratic, and each factor is one line. Then either apply the angle
formula (16.1, 16.2) or normalise to direction **cosines** by dividing by √(sum of squares)
(17.1, 17.2).

### ⚠ Answer 18 is deliberately different — the unit's teaching point

It **never finds either line.** Perpendicularity needs only `l₁l₂ + m₁m₂ + n₁n₂`, and each of those
products is the **product of the roots** (`c/a`) of a quadratic obtained by eliminating one letter.
Two eliminations give all three products as a chain of equal fractions — and the three coefficients
of the given second relation (`2, 3, −5`) turn out to *be* those products up to a common factor,
adding to zero. Solving for the lines would be several times the work.

### The two cube questions

Both open by **choosing coordinates** — one vertex at the origin, three edges along the axes — so
every vertex is a triple of 0's and a's. **The side `a` cancels in both**, which is the check that
the answer cannot depend on the cube's size.

Answer 19 uses two of the four body diagonals. The book prints a contrast worth carrying: the angle
between the diagonals of a **square** is 90°, but for a **cube** it is `Cos⁻¹(1/3)`. Answer 20 uses
all four diagonals, and the four sign patterns `(±a, a, ±a)` are what make the final sum collapse.

**No `[N Marks]` tags anywhere in this chapter**, so every split is ours. The book's printed 7-mark
shapes elsewhere — answers 12 (`1+1+2+1+2`), 15 (`1+1+1+1+1+2`) and 21 (seven 1-mark tags) — show
that both weighted and even cuts are its own at this length.

## Unit 7 — The Plane (book pp.85-86, VSAQ only)

**COMPLETE at 11 of 11** — 9 worked answers (101-107.2) and 2 practice questions. **Nothing from
Star Questions Plus** — the third and last unit (with 1 and 6) the bank gives none. Boundary walked
to p.87, Limits.

Four families, all resting on one fact: **a plane's equation carries its normal direction in its
coefficients.**

| Family | Answers | The move |
|---|---|---|
| Intercept form | 101, 102, 102 PQ | divide by the **constant** so the right side is 1 |
| From given intercepts | 103, 103 PQ | the same thing backwards |
| Normal form | 104 | divide by the **root of the sum of squares** |
| D.C's of the normal | 105 | coefficients are direction ratios; normalise, keep the ± |
| Angle between planes | 106.1, 106.2 | the angle between the two **normals** |
| Parallel plane through a point | 107.1, 107.2 | keep the coefficients, change only the constant |

**The chapter's teaching point is the contrast between what the two forms divide by.** Intercept form
divides by the *constant*, so the denominators become the intercepts. Normal form divides by
*√(a²+b²+c²)*, so the coefficients become direction cosines and the right side becomes the
perpendicular distance from the origin. Confusing the two is the error each file names.

The angle family needs no new machinery at all — two planes lean apart by exactly the angle their
normals make, so it reuses Unit 6's line formula unchanged.

**No `[N Marks]` tags in this chapter**, so its `1+1` splits are ours, following the printed `1+1` on
VSAQ answer 98 (p.83).
