# Starting a botany chapter — read this before authoring the first card

> Written 2026-08-24, when botany opened as the Answer Book's **fourth subject** with the
> complete 13-chapter Junior Botany Fastrack. Audience: whoever authors the next botany
> chapter, or opens Zoology. Companion docs: `docs/patterns/answer_book.md` (mechanisms +
> doctrine), `docs/CHEMISTRY_START_HERE.md` (third subject), `docs/MATHS_1B_START_HERE.md`
> (the playbook for a new paper).

## 1. Your first move: pull master. Do NOT skip this.

```bash
git fetch origin
git merge origin/master        # expect: fast-forward or a clean merge
npm install
npm run build:answers          # note the file/entry counts BEFORE you touch anything
```

The one real accident of this track came from a desk working off an old snapshot. Note that
local `master` in the main repo can be weeks stale — **base new desks on `origin/master`**,
which is what the botany desk did.

## 2. Botany was NOT pre-wired — and that is the lesson

Chemistry needed zero engine work because `chemistry` had been whitelisted on day one,
before a single chemistry card existed. **`botany` was in no list**, so opening it required
a small, bounded set of edits. Expect the same for `zoology`.

| Where | Edit made |
|---|---|
| `SUBJECTS` in `src/scripts/build_answer_book.ts` | added `'botany'` — without it the build exits 1 |
| `subject` enum in `src/schemas/answerBook.ts` | added `'botany'` — without it every question file fails zod |
| `SUBJ_LABEL` in `answer-book/notebook.js` | catalog subject chip reads **Botany** (fallback would print raw lowercase) |
| notebook meta-chip map, same file | explicit `botany: 'Botany'` (the fallback capitalises, so this one is cosmetic) |
| **`subjectWord`, same file** | **the one that was silently WRONG**: botany fell through to `'physics'`, so every botany card would have read *"The physics and the method are checked."* |
| three sweep budgets in `e2e/answer_book.spec.ts` | `900_000 → 1_200_000` at ~945 questions. Raise them when the book grows; **never trim the sweep or its waits to fit.** |

Unit identity is `subject-number` everywhere (catalog chips, triage, the exam-eve route and
the study planner). Botany owns units 1–13; the build guard proves there is no collision with
physics 2–9, chemistry 1–7 or maths 1–10 mechanically.

**Zoology will need its own value** (`zoology`). One PAPER = one subject value — the same
rule that made Maths-1B `mathematics_1b` and reserves `chemistry_2` and `physics_2`.

### The Vidi prompt was physics-hardcoded, for every subject
Found while wiring botany: the Vidi PERSONA on `origin/master` said *"preparing for their
**physics** board exam"*, *"keeping **physics** terms in English"*, and *"if the question is
off-topic (not **physics**…)"* — in **both** `src/scripts/answerbook_vidi_server.ts` and the
deployed `supabase/functions/answerbook-vidi-chat/index.ts`. That already mis-steered
chemistry and maths students. Both were made subject-neutral here. The two files are kept
**byte-identical in the PERSONA block** by their own comments — change them together, and
re-check identity after editing.

> A richer subject-KEYED version of this (per-subject term whitelists keyed on the
> `ts_ipe_<paper>_` id prefix) exists on the unmerged `feat/ipe-answerbook` branch. When that
> branch merges, its version supersedes the neutral wording here — teach it `ts_ipe_b1_` and
> a botany term list rather than reverting to a hardcoded subject.

## 3. The source, and the TWO gaps you must keep recording

The only botany source held is the **Sri Chaitanya Junior Botany Fastrack** (Studocu scan),
**book pp.3–37 over 13 chapters**. **PDF page = book page − 1** (PDF p2 = book p3).

Two checks that are standard for physics are **structurally impossible** for botany:

1. **The two-book union check.** The TSBIE Basic Learning Material PDF in hand is
   **physics only**. There is no second botany source.
2. **The back-test against a real paper.** No botany board paper is in the corpus.

Founder decision 2026-08-24 (the same call as chemistry): proceed Fastrack-only and **record
both gaps** rather than wait. They are written into the `units.json` comment and into every
card's `verification.note`. **Do not let a later session mistake "not checked" for "checked
and clean"** — this is the one place the physics discipline cannot be reproduced. Run both
checks the moment a second source or a board paper arrives.

Read the source **directly, every chapter, every time** — never a previous session's
transcription. **Walk each chapter to its boundary**: this book packs two chapters onto one
page repeatedly (ch.3 starts mid-page 5, ch.5 mid-page 9, ch.7 mid-page 17, ch.10 mid-page 26,
ch.12 mid-page 29, ch.13 mid-page 35), so read one page either side of your range.

### What the botany book actually is, measured

- **No star ranks anywhere.** The physics and chemistry Fastracks rank questions `***`/`**`/`*`
  — the botany half does **not**. So `stars` is **0** on every entry and the
  `pyq_frequency` signal simply does not exist for this subject. Do not invent it.
- **No year citations anywhere** → `appearances` is `[]` on every card.
- **A LONG ANSWER section exists in only three chapters: 5, 7 and 12.** Everywhere else the
  book stops at SAQ. **Author no 8-mark form where no book sources one.** Section-C-grade
  content found in other chapters was flagged in the chapter reports for founder review,
  never invented into an LAQ.
- **No PROBLEMS section anywhere** (unlike physics from Unit 6 on), so the physics
  "PROBLEMS deferred" decision does not arise. The few numericals (E. coli generations,
  pollen mother cells, 1024 cells) sit inside VSAQ and ARE the asked bank.
- **Figures are the point of this subject** — ~40 of them, far more than any other paper:
  T.S. dicot/monocot stem, root and leaf, the embryo sac, ovule types, pollen-tube entry,
  floral diagrams, cell organelles, the racemose inflorescence schematics.
- **Zero katex by construction.** Botany notation is plain text and Unicode (n, 2n, 3n, Φ-free).

### The book is wrong more often than the physics half was
Every case is written **correctly** on the card with the book's position recorded in that
step's `why` — never silently followed, never silently fixed. Chapter reports list them all.
The clearest: the primary-vs-secondary succession table contradicts itself in one column
("Long time for completion" **and** "It is a fastest process"). Treat this book as a source of
**questions**, not of physiology.

## 4. The per-chapter recipe

1. Read your chapter's PDF pages plus one page either side. Transcribe every VSAQ, SAQ and LAQ.
2. Author one file per question: `answer-book/questions/ts_ipe_b1_<abbr>_<slug>.json`.
   **Filename must equal `question_id`** — build gate.
3. Write a manifest fragment; **never edit `units.json` in parallel** — the orchestrator merges
   fragments sequentially (`scratchpad/botany/merge_units.py` validates both directions plus
   cross-bank id collisions, and round-trips the file byte-identically).
4. Meet the build-enforced bar on every step: `why`, `common_mistakes`, `mark_note` on scoring
   steps; `memory_tip`/`margin_note` all-or-none; marks sum per question and per cut.
5. **Rule 41 in a biology register.** Biology writing slips into personification constantly.
   A plant never *wants* light; a cell never *decides*, *knows* or *tries*; roots do not
   *search*; stomata do not *guard*; a seed does not *wait*. The mechanical build gate only
   catches a short house list of idioms — the register is human-enforced.
6. Sweep against the **whole bank**, not just botany — nothing automatic catches cross-subject
   duplication (Biomolecules ↔ chemistry is the live overlap).
7. Verify: `npm run build:answers` → `npx tsc --noEmit` → `npx vitest run` → `npm run smoke:answers`.
8. **Render every figure and LOOK at it** (§5).
9. **Never deploy.** `npm run deploy:answers` is the founder's call alone.

### Chapter abbreviations (ids are permanent)
| # | Chapter | abbr | LAQ? |
|---|---|---|---|
| 1 | The Living World | `lw` | no |
| 2 | Biological Classification | `bc` | no |
| 3 | Science of Plants | `sp` | no |
| 4 | Plant Kingdom | `pk` | no |
| 5 | Morphology of Flowering Plants | `mfp` | **yes** |
| 6 | Modes of Reproduction | `mr` | no |
| 7 | Sexual Reproduction in Flowering Plants | `srf` | **yes** |
| 8 | Taxonomy of Angiosperms | `ta` | no |
| 9 | The Unit of Life | `ul` | no |
| 10 | Biomolecules | `bm` | no |
| 11 | Cell Cycle and Cell Division | `ccd` | no |
| 12 | Histology and Anatomy of Flowering Plants | `haf` | **yes** |
| 13 | Ecological Adaptations, Succession and Ecological Services | `ea` | no |

## 5. Figures: the automated gate cannot see a wrong shape

The e2e label-collision gate measures rendered bounding boxes and catches **overlap**. It does
**not** catch a wrong shape, an off-canvas label, or a label pointing at the wrong structure.
Chemistry shipped a `dz²` label that ran off the canvas and a ring that read as the wrong
orbital — both passed every gate, and were found only by rendering and looking.

**So render every figure and look at it, every chapter.** `scratchpad/botany/render_figures.py`
builds a one-page gallery of every botany figure and reports estimated out-of-bounds labels.

Mechanics (full doctrine in `docs/patterns/answer_book.md`):
- Array order **is** draw order. Arrowheads are **separate ~120 ms strokes, never `marker-end`**.
- **≥40 figure units of vertical clearance** between labels whose horizontal extents overlap —
  the gate measures the *page-scaled* SVG, so figure-unit gaps shrink on screen while the font
  does not. 28 units fails.
- ~7px headroom under an `em` label (25px Kalam runs `y−20 … y+5`).
- `height` is a **pagination** decision — it is rounded up to a multiple of 32.
- Compute placements with a script for anything radial or repeated. Guessed coordinates are
  how labels collide.
- Draw the **exam** diagram, not the book's shaded art: a student has 3–5 minutes. Show a
  representative sector of cells, never 200 of them.

### Botany shapes an automated gate will never check for you
- **Dicot stem** = vascular bundles in a RING, open (cambium). **Monocot stem** = SCATTERED
  bundles, closed, sclerenchyma sheath, lysigenous cavity. These must look different.
- **Dicot root** = 2–4 xylem patches, exarch, radial. **Monocot root** = polyarch (>6), large pith.
- **Dorsiventral leaf** = palisade above, spongy below, stomata mainly abaxial.
  **Isobilateral leaf** = undifferentiated mesophyll, stomata both surfaces, bulliform cells above.
- **Anatropous** ovule is inverted ~180°; **orthotropous** straight; **campylotropous** bent.
- **Embryo sac** = 7-celled, 8-nucleate: 3 antipodals chalazal, 2 polar nuclei central,
  egg + 2 synergids micropylar.
- **Stomata**: dicot guard cells bean/kidney; monocot dumb-bell.
- **Racemose** = indefinite peduncle, acropetal; **cymose** = peduncle ends in a flower, basipetal.
