# Zoology — start here

Audience: whoever authors the next zoology chapter, opens **Zoology-II**, or maintains the phased
figure machinery. Companions: `docs/BOTANY_START_HERE.md`, `docs/CHEMISTRY_START_HERE.md`,
`docs/MATHS_1B_START_HERE.md` (the playbook for a new PAPER), `docs/patterns/answer_book.md`
(the doctrine). The per-unit authoring contract handed to every agent is
`answer-book/tools/zoology_wip/BRIEF.md` — read that before authoring anything.

## 1. First move

```
git fetch origin && git merge origin/master
npm install
npm run build:answers      # note the file/entry counts BEFORE touching anything
```
The one real accident on this track came from a desk working off an old snapshot. Base a new desk
on **`origin/master`**, never on a local `master` (the main repo's can be weeks stale), and
**immediately `git push -u origin <branch>`**: `git worktree add -b X origin/master` sets the
upstream to *origin/master*, so the auto-push hook fails rc=128 and a bare `git push` would target
master.

## 2. Subject enablement — what zoology needed

`zoology` is now whitelisted everywhere. For the record, a NEW subject needs all of:

| # | File | What |
|---|---|---|
| 1 | `src/scripts/build_answer_book.ts` `SUBJECTS` | build-blocking |
| 2 | `src/schemas/answerBook.ts` `subject` enum | build-blocking |
| 3 | `answer-book/notebook.js` `subjectWord` (~L179) | **the silent one** — falls through to `'physics'`, so every card would read *"The physics and the method are checked."* No gate catches it |
| 4 | `answer-book/notebook.js` `SUBJ_LABEL` (~L349) | catalog chip |
| 5 | `answer-book/notebook.js` meta-chip map (~L121) | per-question chip |

Then raise the three fleet-sweep budgets in `e2e/answer_book.spec.ts` and grep every
student-facing string for the previous subject's NAME — the catalog eyebrow and Vidi's onboarding
line were hardcoded to "Physics" for months. **One PAPER = one subject value**: Zoology-II will
need its own (`zoology_2`); unit numbers namespace per subject.

## 3. The source book

"Junior Inter Zoology Made Easy — **Baby Bullet-Q**" (Sri Publishers), 78 PDF pages / 80 book
pages. **book page = PDF page + 1.**

**It is organised BY SECTION, not by unit** — this is the thing that changes orchestration. One
blueprint unit is scattered over up to four page ranges, so dispatch is **one agent per UNIT
reading disjoint ranges**, never one per book chapter. Ranges are tabulated in
`answer-book/tools/zoology_wip/DISPATCH_RANGES.md`.

| Section | Book pages |
|---|---|
| Blueprint + IPE trends | 2–3 |
| Hit lists (Top 11 LAQ / 30 SAQ / 52 VSAQ) | 5–8 |
| LAQ chapters 1–3 (units 6, 7, 8 only) | 10–28 |
| SAQ chapters 4–11 (all eight units) | 30–47 |
| VSAQ chapters 12–18 (all but unit 7) | 49–62 |
| **Star Questions Plus** — extra ASKED VSAQ/SAQ per unit | 63–68 |
| Bullet Model Paper · 5 Guess Papers | 69–79 |

Exam shape: 60 marks — Section A 10×2 VSAQ (all compulsory), B 6 of 8 SAQ ×4, C 2 of 3 LAQ ×8.
Unit 7 (Periplaneta) has **no VSAQ chapter**; LAQ chapters exist **only** for units 6, 7, 8.

### Source facts that differ from botany
- **`appearances[]` IS authored** — this book cites years per question: `[TS M-19]` →
  `{year:2019, board:'ts_ipe'}`, `[AP M-15,18]` → two `ap_ipe` entries, a bare `[IPE-14]`
  (pre-bifurcation) → `{year:2014}` with no board.
- **`stars: 0` everywhere.** Stars here are CHAPTER-level (★★★ on section headers, "SSP" page
  markers), never per question. Do not invent a per-question rank.
- **Star Questions Plus is part of the asked bank** — author it into the owning units.
- **The Bullet Model Paper and the five Guess Papers are NEVER authored.** They restate bank
  answers and exist only as the back-test corpus (§5).

## 4. THE HIT LISTS ARE NOT THE INVENTORY — the chapters are

Proven twice in one book:
1. The "TOP 10+ LAQ" list **skips global qno 5**. LAQ answer pages run 10, 12, 14, 16, **18**, 19,
   21, 23, 25–28 — book p.18 is *"Describe the life cycle of Wuchereria bancrofti"*, a real 8-mark
   LAQ, confirmed by Guess Paper 5. **Unit 6 has FIVE LAQs.**
2. Unit 2's rows promised 15 VSAQ / 4 SAQ; the printed chapters hold **16 / 6** — the
   multipolar-neuron and glandular-epithelium SAQs (book p.34) appear in no list at all.

**Walk from the question that CLOSES the previous chapter to the one that OPENS the next**, and
record both boundary questions as evidence. Transcribing the back-test corpus BEFORE authoring is
what surfaced (1) — do that first on any future subject.

## 5. The back-test — zoology's substitute for the impossible checks

The **two-book union check and a real board-paper back-test are both structurally impossible**:
the TSBIE Basic Learning Material in hand is physics-only, and no zoology board paper is in the
corpus. Recorded in every card's `verification.note`, in the `units.json` comment, and here —
**never let a later session read "not checked" as "checked and clean."**

What this book *does* have is its own cross-reference web: 259 citations of the form
`P <page>(<qno>)` across the three hit lists, the Bullet Model Paper and the five guess papers,
transcribed to `answer-book/tools/zoology_wip/backtest_refs.json`.

```
npm run backtest:zoology -- --refs answer-book/tools/zoology_wip/backtest_refs.json
```
Every citation must resolve to an authored card (fuzzy text match plus the printed global number).
An unresolved citation is a question the book asks and we do not answer.

## 6. Figures — the phased "watch it drawn" contract

The founder's requirement: **a student must watch each diagram being drawn, in named steps, and be
able to copy it. Never rushed.** Zoology is the first subject built this way.

### The mechanism
A figure's `elements[]` may contain `{type:'pause', id, caption}`. The player stops there, shows
the caption on ONE reserved 32px rule, and waits for a tap; a tap mid-phase completes only the
CURRENT phase. A figure with no pauses behaves exactly as before. The instant path (revealAll,
print, reduced-motion, rail jump) draws everything with no caption. Schema rules: a pause is never
last, never adjacent to another, and one at index 0 (a caption-only marker for phase 1, which does
not wait) must carry a caption.

### Pacing is AUTHORING-TIME, never runtime
`ms` stays the single source of truth, so print and reduced-motion can never disagree with it, and
the 96 legacy figures are never silently retimed.

```
npx tsx src/scripts/pace_figures.ts --prefix ts_ipe_z1 --write   # fills ms from path length
npm run check:figure-pace -- ts_ipe_z1                           # 40-160 u/s, strict for ts_ipe_z1
```
Authors write the path and the phases and leave `"ms": 0`; the pacer fills timing at **70 figure
units per second** (clamped 300–4500 ms; labels 450 ms). The gate also **requires phases on any
figure with ≥16 drawn elements**. For scale: the pre-existing 96 figures measure **200–770 u/s** —
that is the rushing this work exists to fix.

**No single stroke longer than ~650 units.** The 4.5 s cap would otherwise push it past the
160 u/s ceiling and fail. Split long outlines — which is how a student draws anyway.

### Authoring a figure
Import `answer-book/tools/zoology_wip/figlib.py` — do not re-invent it. It carries
`stroke/label/pause/leader/mirror`, `finger()` for finger-like processes, `scallop()`, and
`label_w()` backed by **real measured Kalam widths** (`label_widths.json`; merge additively, never
overwrite — several unit agents extend it). Phases go in the order a student draws: outline →
internal structures group by group → **leader lines and labels last**. Captions ≤64 chars,
`"Step N — <what to draw>"`, plain English.

### Diagram marks follow the ASKED question
Only a question that says *"draw a neat labelled diagram of …"* carries diagram marks. Everywhere
else the figure is a study drawing: `marks: 0`, **no `mark_note`** (the schema forbids one at zero
marks), the whole split on the written steps, and say so in `margin_note`.

### RENDER EVERY FIGURE AND LOOK — the gates cannot see a wrong shape
```
python answer-book/tools/render_figures.py ts_ipe_z1_<abbr>     # per-phase cumulative gallery
node answer-book/tools/shot_gallery.mjs <that gallery.html>      # one PNG per figure
```
The e2e gates catch label OVERLAP and clipped construction lines, and **no gate ever watches a
figure animate** (both sweeps take the instant path). Everything below passed every automated gate
and was caught only by looking:

- `scallop()` used SVG arc **sweep-flag 0**, bowing every arc inward and spiking each vertex —
  hepatic caecae and salivary acini rendered as starbursts (the founder's first complaint).
- Leader lines struck through their own labels: the generators assumed 6.8 units/char where real
  Kalam at 17px runs **6.7–9.8**. Widths are measured now.
- A lake's floating leaf crossed the littoral/limnetic divider, reading as a limnetic plant.
- "0.1 kJ" clipped off the apex of the energy pyramid; stratification dots sat ON their dividers.
- Chemistry's precedent: a `dz²` label off-canvas and a ring that read as the wrong orbital.

### Zoology shapes an automated gate will never check
Entamoeba cyst is **round with FOUR nuclei** (trophozoite irregular with a cart-wheel nucleus;
precystic oval) · Plasmodium **signet-ring** = vacuole pushing the nucleus aside; sporozoite
**sickle-shaped** · Ascaris **male short with a curved posterior**, female long and straight with
the genital pore a third from the anterior · cockroach gut = crop **before** gizzard, hepatic
caecae at the midgut's start, Malpighian tubules at the midgut–hindgut junction · **13** heart
chambers · **10 pairs** of spiracles (2 thoracic + 8 abdominal) · ommatidium in light-path order
with the rhabdom **inside** the retinular ring · flagellum T.S. **9 doublets + 2 singlets** ·
transverse (Paramecium) vs longitudinal (Euglena) fission planes must look genuinely different ·
frog heart = two atria + **ONE** ventricle · ratite sternum **without a keel** · food-chain arrows
point **FROM the eaten TO the eater** · Haversian lamellae are **concentric rings** · cardiac
fibres branch with **one** central nucleus and intercalated discs.

## 7. Orchestration

One agent per unit, each reading its own PDF pages (never a prior transcription), writing **only**
its own question files plus a manifest FRAGMENT to `<scratch>/zoology/unit_<NN>.json` and a figure
phase table. **Agents never touch `units.json`** — parallel writes collide. The orchestrator merges
alone, sequentially:

```
python answer-book/tools/merge_units.py --subject zoology --prefix ts_ipe_z1 \
    --suffix "(Zoology)" --fragments <scratch>/zoology --stars-zero [--write]
```
It validates fragment shape, both manifest directions, cross-bank id collisions, per-file
subject/unit agreement, and **refuses to write unless `units.json` round-trips byte-identically**,
so it can only ever touch this subject's units. Dry run by default.

Order agents cards-first (VSAQ/SAQ text → LAQ text → figures): an early run was killed by API
credit exhaustion after building tooling but before writing a single card, and completed cards are
what survives an interruption.

## 8. Verify chain

```
npm run build:answers → npx tsc --noEmit → npx vitest run → npm run smoke:answers
npm run check:figure-pace -- ts_ipe_z1
npm run backtest:zoology -- --refs answer-book/tools/zoology_wip/backtest_refs.json
node answer-book/tools/measure_wrap.mjs ts_ipe_z1     # one line = one ruled row
python answer-book/tools/render_figures.py ...        # then LOOK at every figure
```
Wrap-rate baselines: physics 0.1% · botany 1.3% · chemistry 4.1%. Reflow an outlier at word
boundaries, mechanically, without changing words; never split a `boxed` line. **Never deploy** —
`npm run deploy:answers` is the founder's call alone (Rule 17).

## 9. Ids and conventions

`ts_ipe_z1_<abbr>_<slug>.json`, filename == `question_id` (build gate), ids permanent. `z1` =
Zoology paper 1. Abbrs: `dlw` Diversity of Living World · `so` Structural Organisation · `ad1`
Animal Diversity-I · `ad2` Animal Diversity-II · `lr` Locomotion and Reproduction · `bhw` Biology
in Human Welfare · `pa` Periplaneta americana · `ee` Ecology and Environment. Unit names carry the
`(Zoology)` suffix. `ref`/`number` in the manifest are the book's **global** question numbers (what
the hit lists and guess papers cite). Every card ships `needs_teacher_verification: true`.

## 10. This book is wrong sometimes — write the card correctly, record the book

Never silently follow, never silently fix: put the book's printed position in that step's `why` or
the card's `verification.note`. Found so far: BOD expanded "Biological" (it is Biochemical) ·
optimum body temperature printed 98.4°F for 37°C (37°C is 98.6°F) · noise listed among *air*
pollutants · Volkmann's canals said to reach only the marrow cavity · cartilage lacunae said to
hold chondroblasts (they hold chondrocytes) · glandular epithelium called a covering rather than
the secretory part · ostia count (book 12 pairs, other texts 13) · which spiracles open during
inspiration. Where the book prints only a labelled figure and no written answer (SAQ 50/51/52),
the prose is authored from the book's own LAQ facts and its printed labels — stated on each card.
