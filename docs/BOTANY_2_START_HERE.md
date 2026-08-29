# Botany-II (Sr. Botany) — start here

Audience: whoever maintains Botany-II, opens the next PAPER, or reuses its tooling.
Companions: `docs/ZOOLOGY_START_HERE.md` (the phased-figure contract), `docs/BOTANY_START_HERE.md`
(Botany-I, the junior paper), `docs/patterns/answer_book.md` (the doctrine).

## 1. First move

```
git fetch origin && git merge origin/master
npm install
npm run build:answers      # note the file/entry counts BEFORE touching anything
```

This desk was based on **`origin/feat/ipe-answerbook-zoology`**, not on master, because the phased
"watch it drawn" figure engine (`pause` elements, `pace_figures.ts`, `check_figure_pace.ts`,
`pathLength.ts`) lives only on that branch. Master's figures still run at 200–770 units/second,
which is the rushing the founder named. **If zoology has merged by the time you read this, base on
master instead and this paragraph is history.**

## 2. Subject enablement — what `botany_2` needed

`botany_2` is now whitelisted everywhere. For the record, a NEW paper needs all of:

| # | File | What |
|---|---|---|
| 1 | `src/scripts/build_answer_book.ts` `SUBJECTS` | build-blocking |
| 2 | `src/schemas/answerBook.ts` `subject` enum | build-blocking |
| 3 | `answer-book/notebook.js` `subjectWord` | **the silent one** — it fell through to `'physics'`, so every Botany-II card would have read *"The physics and the method are checked."* Now matched on the `botany` PREFIX, so a third botany paper cannot fall through either |
| 4 | `answer-book/notebook.js` `SUBJ_LABEL` | catalog chip |
| 5 | `answer-book/notebook.js` meta-chip map | per-question chip |

Both botany papers are now labelled **Botany-I** and **Botany-II**, the same disambiguation
Maths-1A/1B already uses. The three e2e fleet-sweep budgets were raised 1.8M → 2.4M ms. **Raise
them when the book grows; never trim the sweep or its waits to fit.**

**One PAPER = one subject value.** Unit numbers namespace per subject, so `botany_2` units 1–14
cannot collide with `botany` units 1–13.

## 3. The source

**"Sr. Botany — My Baby Bullet-Q"** (Sri Publishers, STAR-Q Pass Track), 66 pages.
**PDF page == BOOK page** — no offset, unlike the junior zoology book. The scan carries a
"Vamsi biology" watermark, which is not book content. Pages 10, 14, 16 and 18 are photographed at
a slant and their right edges are cropped; reconstructed words are marked on the transcript.

Organised **by SECTION, not by unit** — the book renumbers its chapters as VSAQ/SAQ/LAQ chapters,
so one blueprint unit is scattered over up to three page ranges:

| Section | Book pages | Globals |
|---|---|---|
| Blueprint · index · hit lists | 2–8 | — |
| LAQ chapters 1–3 | 10–19 | 1–6 |
| SAQ chapters 4–12 | 21–36 | 7–48 |
| VSAQ chapters 13–21 | 38–49 | 49–150 |
| **Star Questions Plus** | 50–53 | 151–168 |
| Bullet Model Paper · 5 Guess Papers | 54–64 | — |

Exam shape: 60 marks — Section A 10×2 VSAQ (all compulsory), B 6 of 8 SAQ ×4, C 2 of 3 LAQ ×8.

### Facts measured in this book, not assumed
- **No per-question star ranks.** The ★★ / ★★★ marks sit on CHAPTER headers, never on questions,
  exactly as in the junior zoology book. `stars` is **0** on every entry. Do not invent a rank.
- **`appearances[]` IS authored** — this book cites years per question: `[TS 19]`, `[AP 15,17,20]`,
  and a bare `[MAR-14]` (pre-bifurcation) becomes `{year: 2014}` with no board.
- **Only THREE chapters source an LAQ**: Respiration (globals 1, 2), Biotechnology Principles
  (3, 4) and Strategies for Enhancement (5, 6). Six LAQs in the whole book. **Author no 8-mark form
  where no book sources one.**
- **Star Questions Plus is part of the asked bank** — the guess papers set them (MP-4 Section B
  cites P 52(166); MP-5 Section A cites P 50(156)), so they are authored into their owning units.
- **The Bullet Model Paper and the five Guess Papers are NEVER authored.** They restate bank
  answers and exist only as the back-test corpus (§5).
- **Two DRAW questions only**, where the marks sit on the figure and the book prints no written
  answer: global 17 (chloroplast) and global 41 (lac operon). Everywhere else a figure is a study
  drawing: `marks: 0`, no `mark_note`, and the whole split on the written steps.
- **One question is printed TWICE** — globals 146 and 150, same words, same answer, on book p.49.
  ONE card is authored and the repeat is recorded on it.
- **The hit lists are NOT the inventory.** The SAQ hit list skips globals 11, 12, 17, 24, 25, 26,
  32, 35, 37, 38, 39 and 48 — all of them printed questions. Walk every chapter to its boundary.

## 4. The book is wrong in places — write the card correctly, record the book

Never silently follow, never silently fix: the correct answer goes on the card and the book's
printed position goes into that card's `verification.note`. Found in this book:

| Global | The book prints | Correct |
|---|---|---|
| 1 | glycolysis end products include "NADPH+H+" | NADH+H⁺ — and the book's own p.11 chart says so |
| 1 | "Fructose 1,6-biphosphate", "3-phosglyceric acid" | BISphosphate, phosphoglyceric |
| 2 | "Fumerase", "Fumeric acid", "FAD⁺" | fumarase, fumaric acid, FAD |
| 3 | "cellulose" as the wall-digesting enzyme | CELLULASE (cellulose is the substrate) |
| 26 | "Genes: Lentivirus" | Genus |
| 27 | genome "either ssDNA or dsDNA", then plant viruses ssRNA | all four forms exist |
| 30 vs 165 | lysozyme "the HOST enzyme" on p.29, "the VIRAL enzyme" on p.51 | the PHAGE codes it |
| 35 | F₂ co-dominance ratio "1 : 2 : 3", CᴰCᴰ "spotted & dotted" | 1 : 2 : 1, and CᴰCᴰ is DOTTED |
| 41 | BOTH lac operon panels labelled "in absence of inducer" | the second is the INDUCED state |
| 42 | "RNA is non-genetic material" | contradicted by this book's own TMV/HIV answers |
| 44 | nucleosome "about 150 base pairs" | 146 bp wrapped, ~200 bp repeat |
| 60 | "Transport saturation INCREASES facilitated diffusion" | it is a CEILING — that is the whole point |
| 91 | Hershey and Chase worked on "bacteria called bacteriophages" | a phage is a VIRUS; host was E. coli |
| 94 | mRNA given as the TEMPLATE strand with U | mRNA copies the CODING strand |
| 98 | tailing "in a template" | template INDEPENDENT |
| 110 | EcoRI "recognises GAA sites" | GAATTC — the book's own p.16 gets this right |
| 121 | "Meloidegyne incognitia" | Meloidogyne incognita |
| 146/150 | "Escherichia coli: It is a plasmid" | a BACTERIUM; its plasmids are the vectors |
| 148 | "Pencillium notatum", "Pencillin griseoflavus" | Penicillium notatum, P. griseofulvum |
| 156 | cofactor makes the enzyme "catabolically active" | CATALYTICALLY — the book says so 1 question earlier |
| 167 | RQ legend: CO₂ "absorbed", O₂ "liberated" | reversed, and contradicts its own formula two lines up |

**Treat this book as a source of QUESTIONS, not of physiology.**

### One thing FLAGGED FOR FOUNDER REVIEW, not decided
Global 168, the Calvin cycle. The LAQ chapter cross-references it (*"For Calvin Cycle 'Q' Refer
P.No: 52(168)"*) and its printed answer runs two pages with a cycle diagram — Section-C-grade
material. But the 2022 blue print gives Photosynthesis 6 marks with **no** Section-C slot, and the
book prints it outside every LAQ chapter. It is authored at **4 marks** and **no 8-mark form is
invented**, the same discipline Botany-I used. If a real paper ever sets it at 8 marks, add a cut.

## 5. The two checks that are structurally impossible, and the one that replaced them

There is ONE source book; the TSBIE Basic Learning Material in hand is **physics only**; and **no
Telangana Botany-II board paper is in the corpus**. So the **two-book union check** and the
**board back-test** are both impossible for this paper. That is recorded in `units.json`, in this
file, and in **every single card's `verification.note`** — because the one thing that must never
happen is a later session reading *"not checked"* as *"checked and clean."* Run both the moment a
second source or a real paper arrives.

What the book *does* have is its own cross-reference web: five Model Guess Papers, each printing an
"Ans-Page Index" citing `P <page>(<global qno>)` — **105 citations**, transcribed to
`answer-book/tools/botany2_wip/backtest_refs.json`.

```
npm run backtest:botany2
```

Every citation must resolve to an authored card whose text matches. An unresolved citation is a
question the book asks and we do not answer. A deliberate wording divergence goes in the script's
`ALLOWED_DIVERGENCE` map **with its reason**, so a NEW mismatch still fails the gate.

## 6. Authoring: the content is Python, the JSON is emitted

167 cards share one header block, one verification preamble and one unit table. Authoring them as
167 hand-written JSON files would repeat that boilerplate 167 times and make a header change a
167-file edit. So the CONTENT is compact Python and the JSON is emitted:

```
answer-book/tools/botany2_wip/
  emit.py          Q(...) and S(...) — the header, the gates, the manifest fragment
  unit_01.py .. unit_14.py     one file per unit; run with --write
  crosslib.py      shared parts for the genetics crosses and flow-chart boxes
  figs_u1.py …     the figures, one module per unit that has any
  valcheck.ts      per-unit zod + build-gate pre-flight, before units.json is touched
  backtest_refs.json   the five guess papers, transcribed
  fragments/       one manifest fragment per unit — the orchestrator merges these
```

**The pipeline, in this order.** The last two steps rewrite the emitted JSON, so re-emitting a unit
means re-running them:

```
python answer-book/tools/botany2_wip/unit_09.py --write      # emit cards + manifest fragment
npx tsx src/scripts/pace_figures.ts --prefix ts_ipe_b2 --write   # fill every stroke's ms
node answer-book/tools/reflow_lines.mjs ts_ipe_b2 --write        # one line = one ruled row
npx tsx answer-book/tools/botany2_wip/valcheck.ts                # pre-flight
python answer-book/tools/merge_units.py --subject botany_2 --prefix ts_ipe_b2 \
    --suffix "(Botany-II)" --fragments answer-book/tools/botany2_wip/fragments --stars-zero --write
```

`merge_units.py` refuses to write unless `units.json` round-trips byte-identically, so it can only
ever touch this subject's units. **Never edit `units.json` by hand.**

### The authoring slip that bit this track three times
Writing `note_extra=` in the MIDDLE of a `Q(...)` or `vs(...)` call, before the positional
`insider` argument. Python rejects it as a `SyntaxError` pointing at the LAST line of the call,
which is nowhere near the problem. `Q()` now type-asserts its positional arguments so the failure
names the question. **Keyword arguments go last.**

## 7. Figures — the phased contract, and what only a render can see

Every figure is phased: `{type:'pause', id, caption}` elements the player stops at, showing the
caption and waiting for a tap. Pacing is **authoring-time**, filled by `pace_figures.ts` at **70
figure units per second** — so print and reduced-motion can never disagree with it.

```
npm run check:figure-pace     # strict for ts_ipe_z1,ts_ipe_b2 — the gate takes a PREFIX LIST now
python answer-book/tools/render_figures.py ts_ipe_b2 --out <dir>
node answer-book/tools/shot_gallery.mjs <dir>/figures_b2.html <dir>/shots
```

**Then LOOK at every phase.** Seventeen figures were built here and **eight defects were found by
rendering them**, every one of which passed `check()`, the pace gate and the build:

- **stomata**: each guard cell drawn 15 units thick around a 33-unit pore, so the pair read as ONE
  cell with a hole in it. A stoma is the other way round.
- **root nodule**: the root was two bare parallel lines that read as a corridor, and the infection
  thread ran straight OUT through the left wall into empty space.
- **chloroplast**: the "Ribosomes" leader landed on a granum stack; "Stromal lamella" merged into another.
- **glycolysis**: the chain arrows were drawn at x=36 while the labels started at x=20, so every
  arrow struck through the compound name beside it.
- **Krebs**: two whole layouts thrown away — outputs floating loose inside the ring, then outputs
  with leaders to their own arcs, which crossed the ring in long diagonals.
- **Krebs leaders**: anchored at the label's OUTER edge, so each side label got its own underline.
- **lac operon**: the repressor-to-operator arrow ran diagonally through its own labels.
- **nucleosome**: two full DNA arcs around a third circle read as three concentric rings.
- **rDNA**: all three captions struck through by the flow arrows.
- **T-even phage**: one tail fibre ran straight down the axis, rendering as the hollow core
  continuing below the base plate.

### Rules learned the hard way
- **Size every lane from MEASURED Kalam widths** (`figlib.label_w`), never from an estimate. A
  7.5 units/char guess is wrong by up to 30%; real Kalam runs 6.7–9.8.
- `check()` rejects any two labels closer than **40 units** vertically when their x ranges overlap.
  In a diagram where everything is centred on one axis, that fixes your vertical rhythm at ~48.
- **No stroke longer than ~650 units.** A 560-wide chloroplast outline measures 672, so both
  membranes are drawn as an upper and a lower sweep — which is how a hand draws them anyway.
- Repeated shapes get a generator, not hand coordinates. The five genetics crosses are one
  `crosslib` call each; hand-placing them produced eleven collisions in a single run.

### Botany-II shapes an automated gate will never check
Guard cells are SUBSTANTIAL and the pore is NARROW; the pore-side wall is THICK, the outer wall
THIN · the infection thread travels INWARD into the cortex · a chloroplast has TWO membranes and
its grana are stacks of separate discs joined by lamellae · glycolysis SPENDS ATP above the divider
and MAKES it below · the Krebs ring runs citric → isocitric → α-KG → succinyl CoA → succinic →
fumaric → malic → oxaloacetic, clockwise, and only TWO CO₂ leave the cycle (the third came from the
link reaction, outside it) · TMV is a ROD with a 4 nm hollow core and a SPIRALLY coiled RNA · a
T-even phage head is HEXAGONAL with SIX pins and SIX fibres, none down the axis · a Punnett square
of four boxes cannot give a ratio summing to six · the lac operon needs BOTH panels or it is not
about regulation · a nucleosome's DNA winds AROUND the octamer ~1.75 times with H1 at the door.

## 8. Verify chain

```
npm run build:answers → npx tsc --noEmit → npx vitest run → npm run smoke:answers
npm run check:figure-pace
npm run backtest:botany2
node answer-book/tools/measure_wrap.mjs ts_ipe_b2      # one line = one ruled row
node answer-book/tools/reflow_lines.mjs ts_ipe_b2      # fixes what it can, mechanically
python answer-book/tools/render_figures.py ...         # then LOOK at every figure
```

Wrap rates: physics 0.1% · Botany-I 1.3% · zoology — · chemistry 4.1% · **Botany-II 0.0%**.
`reflow_lines.mjs` is new here and works on any prefix: it moves trailing WORDS down to the next
line, never changes a word, never splits a `boxed` or `eq` line, and is idempotent. The ten lines
it refused to split were shortened by hand in the sources.

**Never deploy.** `npm run deploy:answers` is the founder's call alone (Rule 17).

## 9. Ids and conventions

`ts_ipe_b2_<abbr>_<slug>.json`, filename == `question_id` (build gate), ids permanent.
`b2` = Botany paper 2. Unit names carry the `(Botany-II)` suffix. `number` in the manifest is the
book's **global** question number — what every hit list and guess paper cites. Every card ships
`needs_teacher_verification: true`.

| # | Unit | abbr | cards | LAQ? |
|---|---|---|---|---|
| 1 | Transport in Plants | `tp` | 20 | no |
| 2 | Mineral Nutrition | `mn` | 7 | no |
| 3 | Enzymes | `en` | 6 | no |
| 4 | Photosynthesis in Higher Plants | `ph` | 13 | no |
| 5 | Respiration in Plants | `rp` | 3 | **yes** |
| 6 | Plant Growth and Development | `pgd` | 10 | no |
| 7 | Bacteria | `ba` | 10 | no |
| 8 | Viruses | `vi` | 8 | no |
| 9 | Principles of Inheritance and Variation | `piv` | 16 | no |
| 10 | Molecular Basis of Inheritance | `mbi` | 23 | no |
| 11 | Biotechnology: Principles and Processes | `bpp` | 13 | **yes** |
| 12 | Biotechnology and its Applications | `bia` | 11 | no |
| 13 | Strategies for Enhancement in Food Production | `sef` | 12 | **yes** |
| 14 | Microbes in Human Welfare | `mhw` | 15 | no |

Units 5, 7 and 14 are small by design: the blue print gives Respiration a single Section-C question
and nothing else, and gives Bacteria and Microbes VSAQ only. The book prints no SAQ or LAQ for
them and **none is invented**.

## 10. What is NOT done

- **No teacher has verified any mark split.** Every card says so.
- **The two impossible checks stay impossible** until a second source or a real board paper arrives.
- **Global 168 (Calvin cycle) is flagged for founder review** — see §4.
- **Nothing is deployed.** `PILOT_CONCEPTS` and `deploy:answers` are untouched.
