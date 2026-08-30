# TGBIE first-year syllabus + pattern, 2026-27 — what changed and what the Answer Book did about it

> Researched 2026-08-28 after a junior lecturer told the founder "this year onwards the Jr Inter
> syllabus changed in all streams, some questions deleted from every chapter, Maths is 60 theory +
> 15 internal". This file is the record: what is VERIFIED (with the source and its date), what is
> still an OPEN CELL, and which repo changes each fact drove. The March 2027 exam is the first exam
> on this syllabus, and it is the exam this book sells for.

## 1. The exam pattern (first year only — second year switches in 2027-28)

Sources: NTV Telugu 14 May 2026 · TV9 Telugu 17 May 2026 · Eenadu 15 May 2026 · Newsmeter 15 May
2026 · Deccan Chronicle 1 Jan 2026 · the Telugu Akademi **Maths 1A 2026-27 textbook**, page
"MODEL QUESTION PAPER w.e.f. 2026-27" (read on Scribd document 1034809761, pp. 5-7; uploader
`pittadharmaraj`; the book carries Contents · Syllabus · Model Question Paper · Mathematical
Activity in its back matter).

| Subject | Old | New 2026-27 | Written paper shape |
|---|---|---|---|
| Physics, Chemistry, Botany, Zoology | 60 theory; practicals only in 2nd year (30) | **60 theory + 15 practical** (external, each year) | **Unchanged**: A 10×2 all · B any 6 of 8 ×4 · C any 2 of 3 ×8 · 21 questions · 3 h. The March 2026 paper ran exactly this. |
| Maths 1A, Maths 1B | **75 written**: A 10×2 · B any 5 of 7 ×4 · C any 5 of 7 ×**7** | **60 written + 15 Activity-Based Learning** per paper | **The Physics shape**: A 10×2 = 20 · B any 6 of 8 ×4 = 24 · C any 2 of 3 ×**8** = 16 · 21 questions · 3 h — printed in the 1A textbook. |
| Languages, humanities, commerce | 100 | 80 + 20 internal | not this product |

What the maths change does to the WEIGHT of a chapter: long answers were 35 of 75 (47%); they are
now 16 of 60 (27%). Short answers 20/75 → 24/60, very short 20/75 → 20/60. A chapter that was
"all LAQ" in the old bank (Mathematical Induction: 10 cards, all Section C) now sits behind a
2-of-3 choice worth 16 marks. The Fastrack star ranks for maths were compiled under the old
weighting; they still say what was ASKED, not what now weighs most (see units.json comment).

**Repo effect (done 2026-08-28):**
- `src/schemas/answerBook.ts` `PAPER_PATTERNS` — the one table; every card's `marks_total` (and
  every cut's) is held to it by the schema, the build emits it as `window.PM_PATTERNS`, the player
  reads its labels and tells Vidi the paper shape.
- 99 maths LAQ cards (65 in 1A, 34 in 1B) re-cut from 7 to 8 marks: `marks_total`, `mark_split`,
  step marks, page header, and any prose that stated a count; `verification.note` records where
  the eighth mark went. Every one still carries `needs_teacher_verification: true`.


## 1b. Second year — Maths 2A keeps the OLD 75-mark paper in 2026-27 (verified 2026-08-29)

The founder asked, on opening Maths 2A, whether the second-year mark scheme had changed for any of
Physics, Chemistry or Mathematics. Two independent sources say the reform above is FIRST YEAR only:

- **Telangana Today, 28 May 2026** — "TG BIE revises intermediate exam pattern to reduce memorisation
  burden": the revision is to "the first-year intermediate public examinations question paper
  pattern" for 2026-27; "the Mathematics I-A and I-B papers will be conducted for a total of 60
  marks each as against 75 marks in the past"; and "except for Physics, Chemistry, Botany and
  Zoology, the theory examination pattern has been revised for all subjects."
  (telanganatoday.com/tg-bie-revises-intermediate-exam-pattern-to-reduce-memorisation-burden)
- **Resonance Colleges, 15 May 2026** — "Telangana Intermediate Board Revamps Question Paper Marks
  Pattern 2026": "The examination framework reforms shall apply to second-year students from 2027-28
  onwards." (resonancecolleges.com/blog/inter-question-paper-revamp)
- Background: **Deccan Chronicle, 28 Apr 2025** — the board's original plan was first year 2025-26 /
  second year 2026-27; the government deferred it a year, which is how both cohorts moved to
  2026-27 / 2027-28.

So a Maths 2A student writing **March 2027** sits the unchanged paper: **A 10×2 = 20 · B any 5 of 7
×4 = 20 · C any 5 of 7 ×7 = 35 → 75 marks**, which is exactly what the source book prints (Baby
Bullet-Q Senior Inter Maths-2A, blueprint p.3 "prepared according to the Model Question Paper issued
by B.I.E.", and all five model papers pp.111–120). Physics-II and Chemistry-II were never revised in
either year, which is why `physics_2` / `chemistry_2` reuse `ABC_60`.

**Repo effect (2026-08-29):** `PAPER_PATTERNS.mathematics_2a` = `ABC_75_MATHS_PRE_REFORM` (VSAQ 2 ·
SAQ 4 · LAQ **7**, total 75, `wef: '2026-27'` = the syllabus year the row DESCRIBES, `internal`
omitted as unsourced). Founder decision: "if same as old for the mathematics, continue for 75 marks
with old marking scheme." When 2A/2B move to the new shape in 2027-28, every 2A LAQ card is re-cut
7 → 8 the way the 99 first-year cards were on 2026-08-28.

## 2. The syllabus (first year, NCERT-aligned, "topics not in JEE/NEET removed")

### Physics — chapter list VERIFIED, sub-topic deletions NOT
Source: careers360 "Telangana Board Class 11 Physics Syllabus 2026-27" (page dated 11 Aug 2026);
Sakshi Education 27 May 2026 for the new chapter's topics.

| New | Chapter | Old |
|---|---|---|
| 1 | **Physical World and Measurement** (merged) | 1 Physical World + 2 Units and Measurements |
| 2 | Motion along a Straight Line | 3 |
| 3 | Motion in a Plane | 4 |
| 4 | Laws of Motion | 5 |
| 5 | Work, Power and Energy | 6 |
| 6 | System of Particles and Rotational Motion | 7 |
| 7 | Oscillations | 8 |
| 8 | Gravitation | 9 |
| 9 | Mechanical Properties of Solids | 10 |
| 10 | Mechanical Properties of Fluids | 11 |
| 11 | Thermal Properties of Matter | 12 |
| 12 | Thermodynamics | 13 |
| 13 | Kinetic Theory | 14 |
| 14 | **Physics of Emerging Technologies** (NEW — AI, robotics, renewable energy, space science, communication technology) | — |

**Repo effect (done 2026-08-28):** units.json and all 243 physics cards renumbered; old unit-2 refs
continue unit 1's numbering (vsaq4 onward); Unit 14 present as five coming-soon placeholders
(`source: "syllabus_2026_27"`). Forwarded `#/exam-eve/` links and saved plans from before this date
carry the old keys — `notebook.js` `LEGACY_UNIT_KEYS` remaps anything without the trailing-year
marker. **The `ab_content.free` row still says `physics-4`** — after the next `content:push` that
key is Laws of Motion; run
`UPDATE ab_content SET free = (unit_key IN ('physics-3','chemistry-3','mathematics-4','mathematics_1b-3'));`
(the push script prints the free rows by name so this cannot be missed).

### Maths 1A — chapter list VERIFIED TWICE, and the sub-topics too
Two independent readings agree line for line: (a) the Telugu Akademi 2026-27 Maths-1A textbook's
own Contents pages (Scribd doc above, pp. 2-4), and (b) a chapter-by-chapter walkthrough of the
official syllabus on screen in *"TS Inter 1st Year Maths 1A & 1B Updated Syllabus 2026-27"*,
Vedantu IPE & EAPCET / Santhosh Sir, published **26 June 2026** (youtu.be/h_tJPDRj3hU) — watched
2026-08-28, frames + captions. **12 chapters in three groups:**

**I. Algebra** — 1 **Sets and Relations (NEW)**: 1.1 sets and their representation · 1.2 the empty
set · 1.3 finite and infinite sets · 1.4 equal sets · 1.5 subsets · 1.6 intervals as subsets of R ·
1.7 Venn diagrams · 1.8 operations on sets · 1.9 complement of a set · 1.10 Cartesian product of
sets · 1.11 relations · 1.12 types of relations · 1.13 equivalence relation. 2 **Functions**: 2.0
ordered pairs · 2.1 types of functions (definitions) · 2.2 inverse functions and theorems · 2.3
real valued functions (domain, range and inverse). 3 **Sequences and Series (NEW)**: 3.1 sequences ·
3.2 series · 3.3 arithmetic progression · 3.4 geometric progression · 3.5 relation between A.M. and
G.M. 4 **Mathematical Induction**: 4.1 principles & theorems · 4.2 applications · 4.3 problems on
divisibility. 5 **Matrices** (5.1-5.7, incl. 5.6 consistency/inconsistency — rank; 5.7 solution of
simultaneous linear equations).
**II. Vector Algebra** — 6 **Addition of Vectors** (6.1-6.8) · 7 **Product of Vectors** (7.1-7.12,
incl. 7.10 scalar triple product; 7.11 vector equation of a plane — different forms, skew lines,
shortest distance, coplanarity; 7.12 vector triple product).
**III. Trigonometry** — 8 **Trigonometric Ratios and Transformations** (8.1 ratios/variation/graphs
and periodicity · 8.2 compound angles · 8.3 multiple and sub-multiple angles · 8.4 sum and product
transformations) · 9 **Trigonometric Equations** (9.1 general solutions — the ONLY sub-topic) ·
10 **Inverse Trigonometric Functions** · 11 **Hyperbolic Functions** (11.1-11.3) · 12 **Properties
of Triangles** (12.1 relation between sides and angles · 12.2 sine/cosine/tangent rules — projection
rules · 12.3 half angle formulae and area · 12.4 incircle and excircles).

**CORRECTION — Trigonometric Equations was NOT removed.** A circular proposed dropping it and some
coverage repeated that (the video's own description still says it went). On screen the chapter is
present as #9, and the teacher says so explicitly: *"they said in that notice that I will remove
this chapter, but it was not removed"* (04:22-04:31). The textbook Contents agrees — ch.9, p.311,
sub-topic 9.1 only. **Do not retire our Trigonometric Equations cards (10 SAQ).**

### Maths 1B — VERIFIED UNCHANGED
**CORRECTION to the earlier reading of Deccan Chronicle (1 Jan 2026)** ("difficult 1B topics removed
and added to 1A to balance both papers"): that describes a proposal, not the shipped book. The same
video states plainly that **1B's syllabus has not changed — "the syllabus that was there before is
the same now"** (05:20-05:28), and walks the on-screen list:
**I. Coordinate Geometry (2D & 3D)** — 0 Prerequisites · 1 Locus · 2 Transformation of Axes ·
3 The Straight Line (3.1-3.11) · 4 Pair of Straight Lines · 5 Introduction to Three Dimensional
Coordinate Geometry · 6 Direction Cosines and Direction Ratios · 7 The Plane.
**II. Calculus** — 8 Limits and Continuity · 9 Differentiation · 10 Applications of Derivatives.
The two NEW 1A chapters are therefore **additions from the NCERT foundation, not transfers out of
1B** — nothing left 1B.

**What this means for the bank — no maths card is retired.** Nothing was deleted from either paper;
the only content change is the two added 1A chapters. The teacher, holding the new book, says the
old book still serves for everything else: *"it doesn't matter if you use the old syllabus book …
there is no real change. Only the chapters that have been added as extras."* So the maths work is
(a) renumber 1A — our 1→2, 2→4, 3→5, 4→6, 5→7, 6→8, 7→9, 8→10, 9→11, 10→12, and rename our
"Trigonometric Ratios upto Transformations" to the book's "Trigonometric Ratios and
Transformations"; (b) add chapters 1 and 3 as coming-soon, then author them; (c) 1B numbering is
ALREADY correct (our 1-7 match) — its gap is unchanged and pre-existing: chapters 8/9/10, the whole
calculus half, plus a ch.0 Prerequisites the paper is unlikely to examine directly.

**The video is silent on the exam pattern** — no marks slide, nothing in the captions about 60/80 or
section structure, despite its description promising it. The 8-mark Section-C finding stands on the
textbook's own printed model paper (§1), which is the stronger source anyway.

### Chemistry — OPEN (names)
"Reduced by around 30 per cent, trimming three chapters" (Telangana Today 26 May 2026). No public
list. NCERT's own rationalisation dropped States of Matter, Hydrogen, s-Block, p-Block and
Environmental Chemistry; our **Unit 4 States of Matter (43 cards, 21% of the chemistry bank)** is
the exposed unit. Nothing retired until the official list is in hand.

### Botany / Zoology — OPEN (names)
"5-10% cut, one or two chapters" (V6 Velugu). careers360's 2026-27 botany list has 12 units and
omits "Modes of Reproduction" (our Botany Unit 6, 10 cards) — unconfirmed. Zoology's 8-unit list
is unchanged there. Zoology lives on the unmerged `feat/ipe-answerbook-zoology` desk.

## 3. Where the official documents are, and why they are not here

The six syllabus PDFs are at `https://tgbienew.cgg.gov.in/scannedPhotos/Circulars/`
(`PHYSICS_I_SYLLABUS.pdf`, `CHEMISTRY_I_SYLLABUS.pdf`, `MATHEMATICS_IA_SYLLABUS.pdf`,
`MATHEMATICS_IB_SYLLABUS.pdf`, `BOTANY_I_SYLLABUS.pdf`, `ZOOLOGY_-I_SYLLABUS.pdf`). Every TGBIE host
(`tgbie.cgg.gov.in`, `tsbie.cgg.gov.in`, `tgbienew.cgg.gov.in`, `bie.telangana.gov.in`) answered
**403 from an F5 WAF** to the fetcher, to curl, and to the founder's own Chrome on 2026-08-28.
The cheapest complete source is the new textbooks themselves: every Telugu Akademi first-year book
prints its **Contents**, its **Syllabus** and its **Model Question Paper w.e.f. 2026-27** in the
back matter — three pages per book, six books.

## 4. OPEN CELLS — the Phase-4 input list (ask the lecturer)

- [ ] Physics textbook: contents page (confirms the Unit-1 merge and Unit 14), syllabus page
      (the per-chapter sub-topic list → what to retire), model paper page (confirms A/B/C).
- [ ] Chemistry textbook: contents (which three chapters went), syllabus, model paper.
- [ ] Maths 1B textbook: contents (what moved to 1A), syllabus, model paper.
- [ ] Maths 1A textbook: syllabus page + the exercise lists of Sets & Relations and Sequences &
      Series (the contents and model paper are already read).
- [ ] Botany + Zoology textbooks: contents, syllabus, model paper.
- [ ] Then, per subject: retire removed chapters/cards (`status: "retired"` in units.json —
      the file stays, the card leaves the catalog, a forwarded link shows the banner), renumber,
      add new chapters as coming-soon, author them from the textbook exercises.

## 5. The retire mechanism (built 2026-08-28, unused until §4)

`answer-book/units.json` entry or unit: `"status": "retired", "retired": { "wef": "2026-27",
"reason": "…plain English…" }`. Both drift checks still see the row; the build then strips it from
`PM_UNITS` (so the catalog, counts, picker, planner, exam-eve, Vidi's chapter lists, the door, the
og card and the gated content bundles never see it) and emits `PM_RETIRED` so `#/q/<id>` still
renders with the banner. `backtest:physics` keeps resolving because the file and the manifest row
both remain.
