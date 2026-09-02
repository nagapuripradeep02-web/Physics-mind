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

**SECOND PRINTED SOURCE FOR THE 8-MARK LAQ — CONFIRMED 2026-08-30.** The 7→8 re-cut had rested on
one document. It now rests on two independent ones. The Sri Chaitanya *FAST TRACK IPE for Jr.
Students* **Mathematics-IB**, typeset for this syllabus, prints the mark on its chapter banners:

- ch.6 `DIRECTION COSINES AND DIRECTION RATIOS` — **`8 Marks`** directly above `Long Answer Questions :`
- ch.3 `THE STRAIGHT LINE` — **`8M + 2×2M = 12M`** · ch.9 `DIFFERENTIATION` — **`8M + 4M + 2 × 2M = 16M`**

**No `7 Marks` banner appears anywhere in the volume.** Both volumes also close with a model paper of
the same shape our `PAPER_PATTERNS` already encodes — `MODEL PAPER-IA` and `MODEL PAPER-IB` each run
**10 VSAQ · 8 SAQ · 3 LAQ** (21 questions). The 1A volume prints no marks number at all, so it
corroborates the *shape* but not the number; the number comes from 1B.

That book independently confirms the two NEW 1A chapters as well — it opens at `1. SETS & RELATIONS`
and carries `3. SEQUENCES & SERIES`, both **completely unstarred**, which is what a freshly typeset
chapter with no exam-frequency history looks like. Provenance, and the rules governing our use of
that book, are in `docs/ORIGINALITY_MATHS.md`.
### Chemistry — VERIFIED 2026-09-02 (the three cut chapters are named)
Source: the Sri Chaitanya **"IPE STUDY MATERIAL for Jr. Students"**, 2026-27 edition, chemistry
volume — founder's scan `DocScanner (4).pdf` (134 pages, sha256
`18e8d6fc6831f1e9faf11a19450559f6fb9a0c6d55982c187943449f71f26a33`), every chapter banner read.
The same edition's physics volume (`DocScanner (3).pdf`, 142 pages, sha256
`1abe7da6d4846e9e09d6cb7b588db8404a6268dc196f1d4128deefea6a37c016`) confirms the physics map in
§2 above chapter for chapter, and prints **Unit 14 as 15 VSAQ only** (no SAQ, no LAQ). A coaching
compilation is not the board circular, but it follows the board's chapter list, and it is the
first complete 2026-27 chemistry list in hand; confirm against the Telugu Akademi Contents page
when a textbook arrives (§4).

**Ten chapters, not thirteen.** Old → new:

| New | Chapter | Old | Bank |
|---|---|---|---|
| 1 | Atomic Structure | 1 | chemistry-1 |
| 2 | Classification of Elements and Periodicity in Properties | 2 | chemistry-2 |
| 3 | Chemical Bonding and Molecular Structure | 3 | chemistry-3 (the free chapter — unchanged) |
| — | **States of Matter — REMOVED** | 4 | **retired** as unit 99 (43 rows / 40 files kept; banner on forwarded links) |
| 4 | Stoichiometry | 5 | renumbered (cards' `unit.number` rewritten) |
| 5 | Thermodynamics | 6 | renumbered |
| 6 | Chemical Equilibrium and Acids-Bases | 7 | renumbered |
| — | **Hydrogen and its Compounds — REMOVED** | 8 | never authored |
| 7 | s-Block Elements | 9 | coming-soon (2026-09-02); author from the book's chapter list |
| 8 | p-Block Elements: Group 13 | 10 | coming-soon |
| 9 | p-Block Elements: Group 14 | 11 | coming-soon |
| — | **Environmental Chemistry — REMOVED** | 12 | never authored |
| 10 | General Organic Chemistry | 13 | coming-soon (the largest chapter, 25 scan pages) |

Repo effect (2026-09-02): `units.json` chemistry block reordered to 1–10 + retired 99; 123 chemistry
cards renumbered (`som` 4→99, `st` 5→4, `td` 6→5, `ce` 7→6 — the build's unit-key agreement check
forces it); `notebook.js` `LEGACY_UNIT_KEYS` gained `chemistry-4→99, 5→4, 6→5, 7→6` (an old
States-of-Matter link lands on the catalog, never on Stoichiometry); `push_answer_content.ts` skips
retired units (the build writes no bundle for them); the hosted build's `loadQuestion` shows a
plain "not in the syllabus" sheet for a forwarded retired link instead of the lock flow;
`check:originality` now binds every `source:"chaitanya_fastrack"` row in any subject (R1 stars 0,
R3 boundary sentence). **First real use of the retire mechanism (§5).** The free chapter
`chemistry-3` did not move, so the `ab_content.free` set needs only the physics-3 fix already noted.

**Per-chapter question diff — DONE 2026-09-02.** Every chapter of both scans is indexed into
`answer-book/sources/chaitanya_{p1,c1}_2027_*.json` (24 files, 1,421 entries, internal, stems restated —
ORIGINALITY R6) and diffed unit by unit against the bank on the physics/chemistry, not the wording.
Full report: **`docs/reports/SYLLABUS_2027_GAP_REPORT.md`**; per-chapter classification of every book
question + the EXTRA lists for the retire decision: `docs/reports/syllabus_2027_diff/`. Headline:

| | book entries | matched | re-cuts | **missing (asked sections)** | missing (problems) | predicted rows confirmed | extra rows, topic gone |
|---|---|---|---|---|---|---|---|
| Physics-I (14 ch.) | 635 | 133 | 52 | **311** (VSAQ 188 · SAQ 104 · LAQ 19; Unit 14's 15 VSAQ are inside these) | 130 | 24 | 28 |
| Chemistry-I ch.1–6 | 457 | 118 | 55 | **173** (VSAQ 91 · SAQ 73 · LAQ 9) | 110 | 24 | 19 |
| Chemistry-I ch.7–10 (never authored) | 329 | 0 | — | **230** (VSAQ 113 · SAQ 56 · LAQ 61) | 88 | — | — |
| **total** | **1,421** | 251 | **107** | **714** | **328** | **48** | 47 |

Counts are entries (a printed sub-part = one entry); distinct cards will be fewer after sub-parts and
the book's own duplicates fold into cards with cuts. The thin physics units 9–13 alone carry 154 of the
physics gap; Thermodynamics (chemistry-5) has a new Long Answer section the bank never had. Order of
authoring (founder): physics 14 → physics 9–13 → chemistry 7–10 → remaining gaps/re-cuts/promotions →
PROBLEM cards last.

**THE 47 RETIRE CANDIDATES ARE CLOSED — NOTHING IS RETIRED (founder, 2026-09-02).** The "topic
present?" column measured absence from ONE commercial digest, not removal from the syllabus, and the
bank's own data says so three ways. **28 of the 47 already carry `source: "enumerated"`** and render
as "Predicted — not asked yet" — the new edition not printing them is exactly what that tag already
claims, so there was nothing to change. **11 were asked on real board papers**, two of them on AP 2026
and `ts_ipe_p1_rot_vector_product_properties` four times (TS 2017, 2019, 2025 and AP 2026); retiring
those would delete answers to questions the board still sets, and would drop `backtest:physics` below
its 100%. The remaining **8** had no paper appearance and no predicted label, and four of them
(molarity, normality, mass percent, the laws of chemical combination) are NCERT core this digest
simply stopped printing. Those 8 were **relabelled `source: "enumerated"` with `stars: 0`** — the
honest state, not deletion; the card stays answerable and its four Chaitanya stars leave the R1
exposure count. A further **5 rows carrying real appearances but no `source`** were backfilled
(`ap_2026_paper` / `ts_paper`) so they can never be re-flagged. **A card the current book stops
printing is a PREDICTED card, not a dead one** — demotion is the mirror of the 48 promotions, and
`backtest:physics` failure-mode 8 (a paper-matched card may not be `enumerated`) is the gate that
keeps the two apart. Entry-level retirement stays built and unused; no test covers it.

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

- [x] Physics chapter list — confirmed by the Sri Chaitanya 2026-27 physics volume (2026-09-02);
      the Unit-14 shape is 15 VSAQ. Still open from the textbook: the syllabus page's per-chapter
      sub-topic list (whole-topic retirements inside surviving chapters) and the model paper page.
- [x] Chemistry chapter list — the three cut chapters are States of Matter, Hydrogen and its
      Compounds, Environmental Chemistry (Sri Chaitanya 2026-27 chemistry volume, 2026-09-02).
      Still open from the textbook: Contents (to confirm the order), syllabus sub-topics, model paper.
- [ ] Maths 1B textbook: contents (what moved to 1A), syllabus, model paper.
- [ ] Maths 1A textbook: syllabus page + the exercise lists of Sets & Relations and Sequences &
      Series (the contents and model paper are already read).
- [ ] Botany + Zoology textbooks: contents, syllabus, model paper.
- [ ] Then, per subject: retire removed chapters/cards (`status: "retired"` in units.json —
      the file stays, the card leaves the catalog, a forwarded link shows the banner), renumber,
      add new chapters as coming-soon, author them from the textbook exercises.

## 5. The retire mechanism (built 2026-08-28; first used 2026-09-02 for Chemistry-I States of Matter)

`answer-book/units.json` entry or unit: `"status": "retired", "retired": { "wef": "2026-27",
"reason": "…plain English…" }`. Both drift checks still see the row; the build then strips it from
`PM_UNITS` (so the catalog, counts, picker, planner, exam-eve, Vidi's chapter lists, the door, the
og card and the gated content bundles never see it) and emits `PM_RETIRED` so `#/q/<id>` still
renders with the banner. `backtest:physics` keeps resolving because the file and the manifest row
both remain.
