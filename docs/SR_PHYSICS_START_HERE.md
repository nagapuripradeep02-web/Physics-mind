# Senior Inter Physics (Physics-II) — start here

> The IPE Answer Book's first SECOND-YEAR paper, opened 2026-08-28 on branch
> `feat/ipe-answerbook-sr-physics`. Read this before authoring a single card.
> Companions: `docs/patterns/answer_book.md` (schema + mechanisms),
> `docs/BOTANY_START_HERE.md` §4 (the per-chapter recipe),
> `docs/MATHS_1B_START_HERE.md` §2 (the "same subject, second paper" precedent).

## 1. What this paper is

Telangana Intermediate **second year**, Physics Paper-II. A second-year student sitting
**March 2027** writes the paper that has not changed: **60 marks, 3 hours, 21 questions** —
Section A 10 x 2 (all compulsory) · Section B any 6 of 8 x 4 · Section C any 2 of 3 x 8.

The 2026-27 TGBIE reform is **first year only**; second year switches in 2027-28
(`docs/SYLLABUS_2026_27.md` §1). So the shape is the same `ABC_60` every other subject in this
bank uses, and nothing about the 2026-27 first-year revision applies here.

**Practical marks sit outside the written paper** and are recorded as a claim, not a fact: the
second-year practical was 30 marks under the old scheme, and the reform's "15 marks, each year"
wording may or may not have reached second year by March 2027. Every TGBIE host serves its
syllabus PDFs as 403 behind an F5 WAF, so this is unverified. It changes no card's marks.

## 2. Subject registration — `physics_2`, and why not "physics units 15-30"

**One PAPER = one subject value.** Physics-II is `physics_2`, the same rule that made Maths-1B
`mathematics_1b`. This is load-bearing, not cosmetic: `notebook.js` `LEGACY_PHYSICS_KEYS` remaps
exact `physics-N` unit keys for the 2026-27 first-year renumbering, so second-year chapters filed
under `physics` would be **silently remapped onto first-year units**. `physics_2-N` passes through
untouched.

Wired on this branch (grep `physics_2` to see them all):

| Site | File |
|---|---|
| zod `subject` enum | `src/schemas/answerBook.ts` |
| `SUBJECTS` | `src/scripts/build_answer_book.ts` |
| `STREAMS.mpc_2` + `TRACKS.mpc.second_year.stream` | `src/scripts/build_answer_book.ts` |
| `SUBJ_LABEL` + `subjectWord` | `answer-book/notebook.js` |
| Vidi id-to-subject ladder + WORD/LABEL/TERMS | `src/scripts/answerbook_vidi_server.ts` **and** `supabase/functions/answerbook-vidi-chat/index.ts` — kept **byte-identical**; re-diff after touching either |
| og card copy `LABELS.mpc_2` | `src/scripts/build_og_card.ts` |
| the year, emitted not hardcoded | `window.PM_YEAR` from `STREAMS[stream].year`, read by the catalog eyebrow |

**The door.** `TRACKS` is the group-by-year chooser; a year cell is live only when its `stream`
equals the stream being built, and the build **fails unless exactly one cell is live**. Building
`--stream=mpc_2` therefore lights MPC to Second year and nothing else.

**A hazard for whoever merges this.** Another desk carries an uncommitted `PAPER_PATTERNS` table
whose marks gate reads `if (want !== undefined)`, and `paperMarksFor` returns `undefined` for an
unregistered subject. A missing `physics_2` row does **not** fail the build — it switches the marks
gate **off** for every Physics-II card. Whoever merges second must add the row in the same commit:

```ts
physics_2: { label: 'Physics II', total: 60,
             internal: { marks: 30, kind: 'practical' },   // 30 vs 15: see §1, unverified
             sections: ABC_60, wef: '2026-27 (second year — the reform reaches it in 2027-28)' },
```

Do **not** build a second marks table on this branch (Rule 40a).

## 3. The source — and the two checks that are impossible

**One book only:** *FAST TRACK IPE for Sr. Students*, physics section —
`C:\Users\PRADEEEP\Downloads\Telegram Desktop\sr.physics (1).pdf`, 57 phone-scanned pages.
**Printed book page = PDF page + 3** throughout (PDF 1 = p4 ... PDF 57 = p60).

- The **two-book union check is impossible**: the TSBIE Basic Learning Material PDF on hand is
  first-year physics only.
- The **back-test is impossible**: `answer-book/papers/` holds seven **Paper-I** papers and no
  Paper-II paper exists in the corpus.

This is the chemistry/botany/zoology situation, not the physics-I one. **Record both gaps on every
card and in the `units.json` comment.** Never let a later session read "not checked" as "checked
and clean". (`backtest:physics` filters units on `!u.subject`, so `physics_2` units are excluded
automatically and it stays green — that is not evidence of anything.)

**No star ranks.** The junior Fastrack's four-level star rank does not exist in this edition.
`stars: 0` on every entry. The `pyq_frequency` signal is simply absent — do not invent one.

**Six printed exam-year citations in 57 pages**, and that is all: Ch.5 LAQ 1 (2006, 2007-May) ·
Ch.8 VSAQ 10 (Mar 17 TS) · Ch.13 SAQ 5 (Mar, June-2015 TS) · Ch.14 SAQ 14 (June 2015 TS) ·
Ch.14 LAQ 3 (Mar-2015 AP & TS) · Ch.15 SAQ 8 (Mar 17 AP & TS, Mar-2015 AP & TS). Everywhere else
`appearances: []`.

**The scan carries a lecturer's pen.** Ticks on Ch.12 VSAQ 2-7 and on **all eight** Ch.16 VSAQs,
with handwritten corrections to Ch.16 VSAQ 4 and 5. It is the only priority signal the book has;
record it in the unit comment, never as `stars`.

## 4. The inventory (all 57 pages walked)

**Sixteen chapters, not fifteen** — a one-page *16. Communication System* closes the book.

| # | abbr | Chapter | PDF pp | VSAQ | SAQ | LAQ |
|---|---|---|---|---|---|---|
| 1 | `wav` | Waves | 1-6 | 12 | 3 | 8 |
| 2 | `ray` | Ray Optics and Optical Instruments | 6-12 | 12 | 6 | 2 |
| 3 | `wop` | Wave Optics | 13-15 | 4 | 6 | 0 |
| 4 | `ecf` | Electric Charges and Fields | 16-18 | 7 | 6 | 0 |
| 5 | `epc` | Electric Potential and Capacitance | 18-23 | 7 | 9 | 1 |
| 6 | `cur` | Current Electricity | 23-28 | 22 | 0 | 4 |
| 7 | `mcm` | Moving Charges and Magnetism | 29-32 | 8 | 6 | 2 |
| 8 | `mag` | Magnetism and Matter | 33-34 | 11 | 2 | 0 |
| 9 | `emi` | Electromagnetic Induction | 35-36 | 10 | 3 | 0 |
| 10 | `ac` | Alternating Current | 37-38 | 10 | 1 | 0 |
| 11 | `emw` | Electromagnetic Waves | 38-39 | 10 | 1 | 0 |
| 12 | `dnr` | Dual Nature of Radiation and Matter | 39-41 | 8 | 2 | 0 |
| 13 | `atm` | Atoms | 41-45 | 10 | 8 | 0 |
| 14 | `nuc` | Nuclei | 45-51 | 15 | 6 | 5 |
| 15 | `sem` | Semiconductor Electronics | 51-57 | 12 | 8 | 2 |
| 16 | `com` | Communication System | 57 | 8 | 0 | 0 |
| | | **Total** | | **166** | **67** | **24** |

Ids are `ts_ipe_p2_<abbr>_<slug>`, and **the filename must equal `question_id`**.

**Section shape is per chapter — never assume VSAQ then SAQ then LAQ.** Nine chapters have **no
Long Answer section**; Ch.6 has **no Short Answer section** (22 VSAQ straight into LAQ); Ch.16 is
VSAQ-only. Walk from the question CLOSING the previous chapter to the one OPENING the next.

**Author no 8-mark form where the book has none.** No second book sources one here, so inventing a
Section-C question would be inventing the paper. Where LAQ-grade content sits under SAQ — Ch.13
SAQ 4 is Bohr's postulates plus the orbit radius plus the energy expression, a classic 8-marker —
**say so in your chapter report and leave it as the SAQ the book prints.**

**Ch.14's SAQ numbering jumps 5 to 14.** Follow the book's printed numbers and record the jump.

**PROBLEMS are deferred** (founder, standing since 2026-08-20): the 4 banner-labelled numericals
(Ch.6 x1, Ch.7 x3) are inventoried in the `units.json` comment and **not authored**. The six
numericals printed *under LAQ numbering* with no Problems banner (Ch.1 LAQ 6-8, Ch.6 LAQ 4,
Ch.14 LAQ 4-5) **are** authored, as LAQ, because the book files them in the section the 8-mark
question comes from — flag the invented 8-mark split loudly in `verification.note`.

## 5. The book is wrong in at least ten places

Write every card **correctly** and put the book's position in that step's `why`. The standing rule:
the book teaches what is MARKED, not what is true, and the student needs both.

| Book p | Where | What it prints | The physics |
|---|---|---|---|
| 49 | Ch.14 VSAQ 9 | "In controlled chain reaction, K > 1" | **uncontrolled** has K > 1; controlled has K = 1 |
| 51 | Ch.14 SAQ 5 | nine neutrons from a "**fusion**" reaction | **fission** |
| 54 | Ch.15 VSAQ 1 | pnp / npn transistor symbols **swapped** | the emitter arrow points *in* on pnp, *out* on npn |
| 60 | Ch.16 VSAQ 5 | D and E layers "in the stratosphere", F1 "mesosphere" | D about 60-90 km and E about 90-120 km are mesosphere / lower thermosphere; F1 and F2 are thermosphere. **The lecturer has corrected this in pen.** |
| 60 | Ch.16 VSAQ 7 | "phase modulation **(FM)**" | (PM) |
| 27 | Ch.6 VSAQ 11 | states 200 V, solves at 220 V, gets 484 ohm | 200 V gives 400 ohm; state which supply you used |
| 27 | Ch.6 VSAQ 13 | "l1/l2 = 6/2, so 1.5 **ohm**" | 60/40 is 6/4; a ratio has no unit |
| 36 | Ch.8 VSAQ 7 | "M = n2l x i x da²" | M = NiA = n·i·πa² (π mis-set; a bar-magnet 2l mixed in) |
| 47-48 | Ch.13 VSAQ 9 and 10 | word-for-word duplicates | author once, record the duplication |
| 47 | Ch.13 SAQ 2 | "Lyman series ... which is the visible region" | Lyman is ultraviolet; Balmer is the visible series |

Minor typos not worth a `why` line but worth not copying: "Fataday's law", "wattles" for wattless,
"neclear fussion", "Fision takes place at room temp.", and Ch.1 LAQ 8 printing root-70 as 8.27 (it
is 8.37; the printed 523 Hz is still right).

## 6. Authoring rules that bite on this paper

- **`needs_teacher_verification: true` on every card.** Every mark split is invented, and both
  structural source checks (§3) are impossible. Say both in `verification.note`.
- **Rule 41 plain language** — basic, literal English in every reader-facing string. Physics
  vocabulary is not jargon; idioms, metaphors and personification are banned. Run the register scan
  **after** generation; it has never held at generation time.
- **Unicode maths, never ASCII** — lambda, mu, theta, omega, Phi, epsilon-nought, pi and friends as
  real characters, with U+2212 minus, never a hyphen. No KaTeX unless a line genuinely cannot read
  on one line.
- **One line = one ruled row.** Measure candidate lines in real Kalam with
  `node answer-book/tools/measure_candidates.mjs` BEFORE authoring, then
  `node answer-book/tools/measure_wrap.mjs ts_ipe_p2` after. A wrapped-but-correct answer beats a
  fitting-but-wrong one — never shorten a line by dropping a word the mark depends on.
- **Figures** (about 60 across the book; Ch.2 and Ch.15 are the densest — ray diagrams, rectifier
  circuits with waveforms, gate symbols with truth tables; Ch.11 and Ch.16 have none):
  - authored stroke lists, array order IS draw order, arrowheads are separate ~120 ms strokes;
  - **phase them** with `{ "type": "pause", "id": ..., "caption": ... }` — a figure of 16 or more
    drawn elements must be drawn in named steps;
  - pace with `npx tsx src/scripts/pace_figures.ts` (about 70 u/s) and gate with
    `npx tsx src/scripts/check_figure_pace.ts --strict ts_ipe_p2` (40-160 u/s);
  - **the renderer draws OUTLINES ONLY — no fills, no occlusion — so "in front of" is
    impossible.** Depth comes from a clear lane or a dashed pencil line behind;
  - **render every figure and LOOK.** The gates catch label collisions; they have never caught a
    clipped label, a wrong shape, or a miscounted structure.
  - Diagram marks follow the ASKED question: only "draw a neat labelled diagram of ..." carries
    diagram marks. Elsewhere `marks: 0` and **no** `mark_note` (the schema forbids one at zero).
- **`cuts[]`** only where the book genuinely asks one question at two lengths.
- Sum rules the build enforces: `sum(steps[].marks) === marks_total`,
  `sum(mark_split[].marks) === marks_total`, unique step ids, filename === `question_id`.

## 7. Orchestration

One agent per chapter, each reading **its own** PDF pages, each writing only its own
`answer-book/questions/ts_ipe_p2_<abbr>_*.json` plus a manifest **fragment** to the scratchpad.
`answer-book/units.json` is merged by the orchestrator **alone, sequentially** — parallel writes
collide, and a `git add <directory>` on a shared desk sweeps other agents' in-flight files. Stage a
NAMED list. Order the work **cards-first**: an interrupted run loses anything that is not a
finished card.

## 8. Verify

```
npx tsc --noEmit
npm run build:answers                                    # the whole bank
npx tsx src/scripts/build_answer_book.ts --stream=mpc_2  # Physics-II alone; the door lights one cell
npx tsx src/scripts/build_answer_book.ts --stream=mpc    # the first-year book must be untouched
npx tsx src/scripts/check_figure_pace.ts --strict ts_ipe_p2
node answer-book/tools/measure_wrap.mjs ts_ipe_p2
npm run check:papers
npm run smoke:answers                                    # ~46 min at 991 questions; expect longer
```

The bank goes 991 to about 1250 (+26%). The three 20-minute sweeps in `e2e/answer_book.spec.ts` —
construction lines, label overlap, and cuts-by-marks — are the ones to re-measure.
**Raise a budget deliberately; never trim a sweep.** A sweep that times out reports as a failure
naming nothing.

Shipping is the founder's: no `deploy:answers`, no `content:push`, no `ab_content` edit here.

## 9. WHERE THIS STOPPED — read before resuming (2026-08-28)

The first authoring run was cut off mid-flight: **13 of the 16 chapter agents were killed by an
API session limit**, not by anything wrong with the work. **145 of 257 cards (56%) are authored and
every one of them passes** `check_p2_cards.ts` — schema, paper shape, mark sums, header, and the
Rule-41 register scan.

**The tree is GREEN, and that cost a rearrangement.** `build_answer_book.ts` hard-fails on an
authored card that no unit lists, so a chapter cannot ship until its manifest fragment exists. Only
three fragments were written before the cut. So:

- **`answer-book/questions/` holds the 29 cards of the three merge-ready chapters** — Wave Optics
  (10), Electromagnetic Waves (11), Communication System (8). These are IN `units.json` and IN the
  built book.
- **`answer-book/wip/p2/cards/` holds the other 116 authored cards**, parked. Nothing scans
  `answer-book/wip/`, so they cannot break the build — and they are in the repo rather than stranded
  on one disk, which is the whole point (a killed run loses whatever is not committed).
- **`answer-book/wip/p2/fragments/` holds the three merged fragments**, kept as the worked example
  of the shape the remaining thirteen need.

| # | abbr | chapter | authored | target | state |
|---|---|---|---|---|---|
| 1 | wav | Waves | 12V 3S 4L | 23 | parked — needs **4 LAQ** (the three numericals + one derivation) |
| 2 | ray | Ray Optics | 5V | 20 | parked — needs 7V 6S 2L |
| 3 | wop | Wave Optics | 4V 6S | 10 | **SHIPPED** |
| 4 | ecf | Electric Charges | 7V 3S | 13 | parked — needs 3S |
| 5 | epc | Potential & Capacitance | 7V 5S | 17 | parked — needs 4S 1L |
| 6 | cur | Current Electricity | 14V | 26 | parked — needs 8V 4L |
| 7 | mcm | Moving Charges | 8V | 16 | parked — needs 6S 2L |
| 8 | mag | Magnetism and Matter | 11V 2S | 13 | parked — **cards complete, fragment missing** |
| 9 | emi | EM Induction | 10V 1S | 13 | parked — needs 2S |
| 10 | ac | Alternating Current | 9V | 11 | parked — needs 1V 1S |
| 11 | emw | EM Waves | 10V 1S | 11 | **SHIPPED** |
| 12 | dnr | Dual Nature | 8V 2S | 10 | parked — **cards complete, fragment missing** |
| 13 | atm | Atoms | 4V | 18 | parked — needs 6V 8S |
| 14 | nuc | Nuclei | 1V | 26 | parked — needs 14V 6S 5L |
| 15 | sem | Semiconductor Electronics | — | 22 | **not started** |
| 16 | com | Communication System | 8V | 8 | **SHIPPED** |

**To resume, per chapter:** finish its missing cards straight into `answer-book/wip/p2/cards/`,
write its fragment to `answer-book/wip/p2/fragments/uNN.json`, then `git mv` that chapter's cards
into `answer-book/questions/` and run
`node answer-book/tools/merge_p2_units.mjs answer-book/wip/p2/fragments --write`. The merge tool
proves it can round-trip `units.json` byte-identically without physics_2 before it writes anything,
so it cannot touch another subject; it also refuses on drift in either direction, so a fragment and
its cards must agree before either lands.

**Two chapters are one step from shipping**: `mag` and `dnr` have every card authored and only need
their manifest fragment. Their fragments were **not** invented from the cards on disk — the `ref`
and `number` must follow the book's printed order, and guessing that is exactly the kind of unearned
claim this bank does not make.

**Two things the run proved, worth keeping:**
- **`ms: 0` is the documented authoring placeholder** that `pace_figures.ts` fills. Nine cards
  looked like 36 schema failures until the pacing step ran — their agents died before reaching it.
  Run `npx tsx src/scripts/pace_figures.ts --prefix ts_ipe_p2 --write` before believing a figure
  error.
- **A blunt Rule-41 word list is worse than none.** Banning "wants" outright produced 12 false hits
  on "the examiner wants the substitution line" — literal, and exactly the plain wording the rule
  asks for — and would have pushed authoring back towards vaguer prose. The scan now fires only
  when the subject is a THING. It still caught the two real hits: a wave crest that "knows nothing
  of the motion", and a table that "wants" an element list. A negative control (injecting "The
  signal wants to reach the receiver") confirms it still bites.
