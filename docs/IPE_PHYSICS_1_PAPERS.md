# The Telangana Physics Paper-I corpus — and what diffing the bank against it found

Companion to `docs/patterns/answer_book.md` (the doctrine) and `answer-book/papers/README.md` (the
file format). This is the narrative of the first time the physics bank was diffed, question by
question, against real board papers.

## Why it exists

`docs/patterns/answer_book.md` has carried this instruction since the Unit-8 run:

> **Back-testing the archetype set is not back-testing the output.** When a real paper is in the
> corpus, diff the sweep's authored list against that paper question by question. "Everything asked
> falls inside the grid" is a statement about the grid; it says nothing about what you actually wrote.

There was no corpus. One AP paper existed as a PDF in a Downloads folder, twelve `appearances[]`
entries and a fifteen-line prose summary. Nothing a script could check, nothing a later session
could re-read.

On 2026-08-26 the founder supplied seven TS Inter I-Year Physics Paper-I papers — March **2016,
2017, 2019, 2020, 2023, 2024, 2025**. They are now transcribed into `answer-book/papers/`, 147
printed questions across 154 answerable slots.

## What the diff found

**Before this session, the bank held no Telangana exam provenance at all.** 184 of 198 physics cards
had `appearances: []`. Not one appearance anywhere in the book carried `board: "ts_ipe"` — the only
boarded entries were twelve AP-2026 tags, and seven bare years (2004–2012) on two cards, lifted from
the Sri Chaitanya Fastrack's printed lists. The Fastrack's frequency data is a 2015 compilation, so
the bank's newest Telangana signal was eleven years stale.

The seven papers changed that in three ways.

### 1. The units that existed were in good shape

Of the 48 distinct questions falling in units 2–9, **40 already had a card**. The eight that did not
were two conceptual gaps and six numericals:

| Missing | Unit | Asked |
|---|---|---|
| Pendulum clocks go fast in winter and slow in summer | 8 | **2017, 2019, 2023** |
| Why is it easier to skate on snow | 5 | 2017 |
| Mean speed over three equal thirds at 10, 20, 60 kmph | 3 | 2016 |
| Scalar and vector products of two given vectors | 4 | 2020 |
| Machine gun power | 6 | 2024, 2025 |
| Pump power, lift only | 6 | 2019 |
| Pump power, lift and eject | 6 | 2016, 2020 |
| Spring, m = 2 kg, k = 200 Nm⁻¹, find T | 8 | 2019 |

The winter/summer pendulum is the sharpest of them: a 4-mark Section-B question asked in **three of
seven papers** with nothing in the bank answering it. `ts_ipe_p1_osc_pendulum_clock_mountain` looks
close and is a different question — altitude, not thermal expansion.

### 2. Six of the fourteen chapters did not exist

Units **1, 10, 11, 12, 13 and 14** were absent from `units.json` entirely, and they carry roughly
half of every paper's marks. Ranked by how often these seven papers examine them:

| Unit | Slots | Notable |
|---|---|---|
| 12 Thermal Properties of Matter | 17 | The largest single hole |
| 11 Mechanical Properties of Fluids | 14 | Three excess-pressure questions with **different** formulas |
| 14 Kinetic Theory | 14 | "When does a real gas behave like an ideal gas?" in **5 of 7 papers** |
| 1 Physical World | 7 | |
| 10 Mechanical Properties of Solids | 7 | Wire under increasing load in 4 of 7 |
| 13 Thermodynamics | 7 | Only two questions — but **every paper asks one of them at 8 marks** |

Unit 13 is the highest value per card in the book: two long answers cover a guaranteed eight marks
on every paper in the corpus.

### 3. The deferred PROBLEMS decision had been made without this evidence

On 2026-08-20 practice numericals were deferred because "a practice problem belongs to no paper
section and carries no mark scheme." True of the books' practice sections. But **five of these seven
papers print a numerical inside a Section-C question**, sharing the eight marks with the derivation.
A prior session had noted deferred problems were "2-for-2 on being examined"; against this corpus it
is six papers out of seven. The founder lifted the deferral for paper-attested numericals on
2026-08-26, and the six are now authored as standalone 4-mark cards — the length a student practises
them at, and a shape the bank already had (`ts_ipe_p1_rot_flywheel_torque_numerical`).

## The three excess-pressure questions are not paraphrases

Worth recording because a similarity matcher will collapse them and be wrong:

| Question | Surfaces | Excess pressure |
|---|---|---|
| Liquid drop | one | 2T/r |
| Air bubble inside a liquid | one | 2T/r |
| Soap bubble in air | **two** | **4T/r** |

The board asks all three separately. They are three cards.

## The result

**100% of all seven papers is now answerable.** `npm run backtest:physics` re-derives it:

```
TS IPE Physics Paper-I back-test — 7 papers, 154 question slots

  answered by the bank : 154 slots across 85 cards
  gap (unit is built)  :   0 slots
  unbuilt unit         :   0 slots
  coverage             : 100.0%
```

| | before | after |
|---|---|---|
| physics chapters in `units.json` | 8 (units 2–9) | **14 (units 1–14)** |
| physics card files | 198 | **243** |
| physics catalog entries | 204 | **249** |
| cards carrying a Telangana year tag | **0** | **85** |
| such appearances | **0** | **154** |
| depth (`memory_tip`/`margin_note`/`insider_note`) | 100% on 8 units | **100% on all 14** |
| katex lines added by physics | 0 | **0** (unchanged, 278 book-wide) |

45 cards were authored: 8 closing gaps in units that already existed, 37 opening the six that did
not. Every one is `verification.status: "unverified"` with `needs_teacher_verification: true` —
the mark splits are invented and stay claims until a Telangana IPE teacher confirms them.

Two figures were drawn and looked at: the stress–strain curve on
`ts_ipe_p1_sol_wire_under_increasing_load` and the Carnot cycle on
`ts_ipe_p1_thd_carnot_engine_efficiency`. On the second, the two adiabats are measurably steeper
than the two isotherms and the cycle runs clockwise — the physics a gate cannot check.

### A tool fixed on the way

`answer-book/tools/measure_wrap.mjs` was ported here from the zoology desk and **crashed on the
first run**: it iterates `cut.steps` as an array, but the schema keys that Record by step id.
Zoology has no cards with cuts, so the bug had never fired. Fixed. Measured afterwards: **none of
the 45 new cards wraps a line**, and the physics rate is **0.7%** (21 lines, all pre-existing) —
not the 0.1% the tool's own header still claims.

## What is now in the repo

- `answer-book/papers/*.json` — the seven papers, `ipe_paper_v1`, verbatim, with provenance.
- `answer-book/papers/matches.json` — every one of the 154 slots mapped to the card that answers it,
  confirmed by hand. The matcher proposes; nothing here was written by a similarity score.
- `npm run tag:appearances` — writes `{year, q_no, board}` into the cards from that mapping.
  Idempotent, never overwrites, and preserves each file's line endings (18 physics cards are CRLF,
  and a naive writer turns each into a whole-file diff).
- `npm run backtest:physics` — re-derives every claim in `matches.json` from the bank and fails on a
  mapping that resolves to nothing, a card that lost its tag, or a `ts_ipe` tag in a corpus year that
  no row justifies. `--strict` additionally requires the authoring queue to be empty.

## Two things the corpus surfaced that are NOT fixed

1. **`appearances` does not affect ranking anywhere.** `itemsFor()` in `notebook.js` sorts on
   `stars`, then qtype, then whether the entry is `enumerated`. The exam-eve "most-asked" list and
   the study planner never read `appearances`. So a question asked in five of seven papers still
   sorts below a 3-star Fastrack question it beats on real evidence. Making the paper years drive
   the ranking is a founder decision and a separate change.
2. **`source` is unvalidated.** The build checks `ref`, `section`, `stars`, `question_id` and `cut`,
   but never `source`. A typo silently reclassifies a predicted card as asked. This corpus adds a
   fourth value, `ts_paper`, which makes the gap slightly wider.

## The one inferred year

`ts_ipe_p1_2023_03.json` prints no year. 2023 comes from the scan's camera timestamp
(`2023/3/25 12:34`) and was confirmed by the founder. The file carries `date_confidence: "inferred"`
and the full reasoning in `provenance.year_source`; `backtest:physics` prints the caveat on every
run. Every appearance tagged from that paper is a claim of the same standing as a mark split.
