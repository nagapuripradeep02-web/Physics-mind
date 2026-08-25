# Zoology Answer Book — shared unit-agent brief

You are authoring ONE unit of the **Telangana IPE Junior Zoology** answer book — a
student-facing board-exam answer-writing guide. Each card shows one exam question and
the model answer, revealed step by step, with the mark split in the margin. Zoology is
the most DIAGRAM-heavy subject in the book, and the founder's headline requirement is
that every diagram is drawn slowly, in named steps, so a student can watch and learn
HOW to draw it. Read §6 twice.

**Desk (work here, nowhere else):** `C:\Tutor\physics-mind-ipe-zoology`

---

## 1. The source — read it yourself, every time

PDF: `C:\Users\PRADEEEP\.claude\uploads\40aee229-2ba0-40be-831f-912f984d9e01\81d99f21-698416741ZoologyBabyBulletInterJunior.pdf`
(78 PDF pages; **book page = PDF page + 1**. Read with the Read tool's `pages` parameter,
max 20 per request.)

**This book is organized BY SECTION, not by unit.** Your unit's material is scattered over
up to four places — your dispatch names every PDF page range:
- its **LAQ chapter** (book pp.10–28) — only units 6, 7 and 8 have one;
- its **SAQ chapter** (book pp.30–47) — every unit has one;
- its **VSAQ chapter** (book pp.49–62) — every unit except 7 (Periplaneta) has one;
- its entries in **Star Questions Plus** (book pp.63–68) — extra asked VSAQs/SAQs filed under
  unit headings; they ARE part of the asked bank. Scan all six pages for your unit's heading.

**Read one page BEYOND each end of every range** — chapters start and end mid-page, and a
previous session lost two SAQs by trusting a hit list instead of walking to the boundary.
Transcribe EVERY question in your ranges. Do NOT author the Bullet Model Paper (pp.69–74) or
the five Guess Papers (pp.75–79): they restate bank answers; the orchestrator uses them as a
back-test against your cards.

**The book numbers questions GLOBALLY** (LAQ 1–12, then SAQ 13–…, VSAQ …–172, Star Q 173–190+).
Keep that number: it is what the hit lists and guess papers cite as "P 32(18)".

**The hit lists are NOT the inventory — the chapters are.** Proven on this book: the "TOP 10+ LAQ"
list skips global qno 5, and Guess Paper 5 shows what it is — *"Describe the life cycle of
Wuchereria bancrofti with a neat diagram"* (book p.18), a real 8-mark LAQ in Biology in Human
Welfare. Walk your chapter's PAGES and author every question printed there, then use the hit
lists only as a cross-check.

**Never copy the book's prose into a card.** Take the QUESTION TEXT (verbatim-ish, cleaned of
scan noise and grammar errors) and the FACTS. Write the answer yourself in clean exam English.
The book's Telugu asides, smiley boxes and "Super Hit Q" mnemonics are marketing — never
transcribed.

### The book is wrong sometimes
When the book is wrong (NCERT / standard zoology disagrees), **write the card CORRECTLY** and
record the book's position in that step's `why` field — never silently follow it, never
silently fix it. Flag every such case in your unit report.

---

## 2. Zoology-specific facts (differ from botany)

- `subject`: **`"zoology"`** · `board`: `"ts_ipe"` · `board_label`: `"Telangana — Board of Intermediate Education"`
- `year_cycle`: `"first_year"` · `class_label`: `"Intermediate I Year (Class 11)"`
- **Units (blueprint I–VIII) — number, name, abbreviation:**
  1 Diversity of Living World `dlw` · 2 Structural Organisation in Animals `so` ·
  3 Animal Diversity-I `ad1` · 4 Animal Diversity-II `ad2` · 5 Locomotion and Reproduction `lr` ·
  6 Biology in Human Welfare `bhw` · 7 Periplaneta americana `pa` · 8 Ecology and Environment `ee`.
  Unit name in files and fragment: `"<Name> (Zoology)"`.
- **`stars`: always `0`.** This book ranks CHAPTERS (★★★ on section headers, "SSP" pages), never
  individual questions. Do not invent a per-question rank.
- **`appearances`: AUTHOR THEM.** This book cites years per question — `[TS M-19]`, `[AP M-15,18]`,
  `[TS May-17,19,22]`, `[IPE-14]`. Shape: `{ "year": 2019, "board": "ts_ipe" }` /
  `{ "year": 2018, "board": "ap_ipe" }`; a bare `[IPE-14]` (pre-bifurcation) → `{ "year": 2014 }`
  with no board. Two-digit years are 20xx. Month (M/May) is not stored.
- **`verification.status`: `"unverified"`, `needs_teacher_verification: true` on EVERY card**, with
  a note that says: only one source book is held (no TSBIE Basic Learning Material for zoology —
  the one on hand is physics-only — and no zoology board paper in the corpus), so the two-book
  union check is impossible; the book's own model/guess papers are the only back-test.
- **LAQ sections exist ONLY in units 6, 7 and 8.** If your unit has no LONG ANSWER chapter,
  author **no 8-mark form**. Section-C-grade content elsewhere goes in your report, never a card.
- Unit 7 (Periplaneta) has **no VSAQ chapter** — the blueprint gives it SAQ + LAQ only.

### Marks / section conventions (copy exactly)
| qtype | marks_total | paper_section | expected_time_min | steps |
|---|---|---|---|---|
| VSAQ | 2 | `Section A` | 4 | 2–3 |
| SAQ | 4 | `Section B` | 8 | 2–5 |
| LAQ | 8 | `Section C` | 15 | 5–7 |

`page_header` pattern (copy the exact dash characters from the template file):
`["Section A — Very Short Answer Question", "<Unit Name> · 2 marks"]`
(SAQ → `"Section B — Short Answer Question"`, LAQ → `"Section C — Long Answer Question"`.)

---

## 3. File contract

**Read these templates first, end to end:**
- a shipped card WITH a figure: `answer-book/questions/ts_ipe_b1_srf_embryo_sac_parts.json`
- a shipped LAQ: `answer-book/questions/ts_ipe_b1_haf_laq_ts_dicot_stem.json`

Schema (the build hard-fails on any violation): `src/schemas/answerBook.ts`

### Where you write
1. **Question files** → `answer-book/questions/ts_ipe_z1_<abbr>_<slug>.json`
   - `z1` = Zoology paper 1. `<abbr>` is YOUR unit's abbreviation. `<slug>` = short
     lowercase_underscore description. **Filename MUST equal `question_id`** (build gate). Ids are
     permanent — choose them carefully. Use `laq_` in the slug of every 8-mark card.
2. **Manifest fragment** → `<SCRATCH>/zoology/unit_<NN>.json` (path in your dispatch).
   **Do NOT touch `answer-book/units.json`** — the orchestrator merges it alone.
3. **Figure phase table** → `<SCRATCH>/zoology/figures_<abbr>.md`: one row per figure —
   question_id, figure id, phase captions in order, element count, estimated seconds (from the
   pacer output), and what you checked by eye.

### Manifest fragment shape
```json
{
  "number": 7,
  "name": "Periplaneta americana (Zoology)",
  "subject": "zoology",
  "questions": [
    { "ref": "saq50", "section": "SAQ", "number": 50, "stars": 0,
      "text": "Draw a neat labelled diagram of the mouthparts of cockroach.",
      "question_id": "ts_ipe_z1_pa_mouthparts_diagram" }
  ]
}
```
`ref` = `vsaq<N>` / `saq<N>` / `laq<N>` where **N is the book's GLOBAL question number** (the
one printed beside the question, cited by the hit lists as "P 45(50)"). `number` = the same N.
Order the array VSAQ → SAQ → LAQ, ascending N. **Every question you transcribe gets a manifest
entry AND a question file** — the build fails in both directions.

---

## 4. The authoring bar (build-enforced — a gap fails the build)

Per step, **every one of these is required**:
- `why` — one line: WHY this step exists, the reasoning that lets a student rebuild the answer
  instead of memorising it. (Also Vidi's grounding text.)
- `common_mistakes` — 1–3 short literal items: where students actually lose this step's marks.
- `mark_note` — a short red-gutter caption, required on every step with `marks > 0`
  (and forbidden when `marks === 0`).

Per question:
- `sum(steps[].marks)` **must equal** `marks_total`, and `sum(mark_split[].marks)` too.
- `memory_tip` and `margin_note` are **all steps or none**. Author BOTH on every card:
  `margin_note` = rail guidance on how much to write; `memory_tip` = a real memory device (an
  order, a contrast, a named anchor), never decoration.
- `insider_note` — one sentence of examiner insight, on every card. For diagram questions say
  which labels carry the marks.
- Step `id` matches `^[a-z0-9_]+$`; `kind` ∈ `text` | `equation` | `diagram` | `boxed_final`.
  `diagram` requires a `figure`; every other kind requires non-empty `lines[]`.
- **One line = one ruled row: author ≤ ~52 characters per line.** Never write a prose paragraph
  as one line (botany's worst chapter wrapped 82% of its lines that way). Break at word
  boundaries into several short lines instead.
- Prefer a `boxed_final` step for the definition/conclusion the examiner looks for.

### `cuts[]` — only when the book genuinely asks the same answer at two lengths
Do not author cuts to look thorough. If the book asks a thing at both 4M and 8M, author ONE
step list and add `cuts` (see schema). `cuts[0]` is the default and must restate the root
header exactly. Hidden steps must leave no dangling reference.

---

## 5. Rule 41 — plain, literal language (zoology is a bad offender)

Every reader-facing string must be basic literal English a Class-11 student with textbook
English understands without asking. Zoology vocabulary is NOT jargon — "schizogony",
"trophozoite", "haemocoel", "ommatidium", "spiracle" are the plain words; use the word the
syllabus uses, and label diagrams with the SAME names the book labels.

**Banned: idioms, metaphors, and personification.** A parasite never *wants*, *decides*, *tries*,
*hides*, *escapes*, *cleverly*, *waits for* a host. Write what happens: "the sporozoites enter
the liver cells", "the cyst wall protects the amoeba from the digestive juice". Standard terms
that name a real event are fine ("the merozoites infect fresh RBCs", "the host's immune
response"). No "nature's way of…", no "the parasite's strategy".

Also banned (mechanical build gate): "nail it", "piece of cake", "ace it", "a breeze",
"hang of it", "in the bag", "crack it", "no sweat", "game changer", "the trick is",
"the whole trick", "you have got this", "you got this", "the formula knows", "physics loves".

**Rule 35 — no country-specific culture** in the answer. Species and place examples from the
syllabus (Naja naja, Hilsa, Western Ghats, Nile perch in Lake Victoria) are zoology content and
are expected. A question's own wording ("snakes found in South India") is kept as asked.

---

## 6. Figures — the founder's headline requirement: drawn slowly, in named steps

Zoology has ~50–60 figures: the three stages of Entamoeba, life-cycle wheels (Entamoeba,
Plasmodium in man and in mosquito, Ascaris, Wuchereria), the Ascaris body, cockroach digestive /
circulatory / respiratory systems, mouthparts, salivary apparatus, ommatidium, tissue and organ
figures, ecosystem figures, plus every "Draw a neat labelled diagram of …" question. Each is
drawn IN PHASES: the player stops at each phase boundary, shows a caption ("Step 2 — the crop
and gizzard"), and waits for the student's tap. **The student watches each stage and copies it.**

Read the doctrine: `docs/patterns/answer_book.md` (the stroke-figure section), then this.

### The format
A `kind: "diagram"` step carries `figure: { id, width, height, elements: [...] }`.
`elements` is an ordered list; **array order IS draw order**. THREE element types:
- `{ "type":"stroke", "id", "d": "<SVG path data>", "ms": 0, "pen?":"pencil", "wipe?":"x"|"y", "w?": <num> }`
- `{ "type":"label", "id", "x", "y", "text", "ms": 0, "em?": true, "sm?": true }`
- `{ "type":"pause", "id", "caption": "Step 2 — internal organs" }` — a PHASE BOUNDARY.

### The workflow (do it in this order, for every figure)
1. Design the phases first: 3–6 named stages in the order a student draws on paper. Phase 1 is
   always the main outline/body. Middle phases add internal structures, one group each. The
   LAST phase is leader lines + labels (a student labels last).
2. Write the elements. **Put `"ms": 0` on every stroke and label** — the pacer fills timing.
   Put a `pause` element at index 0 carrying phase 1's caption (this one does not wait; it just
   names the phase), and a `pause` before each later phase. Captions ≤ 64 chars, plain English,
   pattern `"Step N — <what to draw>"`. Never two pauses in a row; never a pause last.
3. Time it: `npx tsx src/scripts/pace_figures.ts --file answer-book/questions/<id>.json --write`
   (70 figure-units per second, min 300 ms, max 4500 ms per stroke; labels 450 ms). Read the
   printed per-figure seconds. A 40–60 s figure in 4–5 phases is the intended feel.
4. Gate it: `npx tsx src/scripts/check_figure_pace.ts --strict ts_ipe_z1 --only <your prefix>`
   must PASS (no racing stroke; any figure with ≥16 drawn elements has phases).
5. LOOK at it: `python answer-book/tools/render_figures.py <your prefix>` renders every figure,
   and a phased figure ONCE PER PHASE cumulatively — open the HTML it prints, screenshot it with
   Playwright or read it, and check each phase is a coherent, copyable stage and the final
   figure matches the book's labelled structures. The automated gates cannot see a wrong shape.

### Hard rules
0. **No single stroke longer than ~650 figure units.** The pacer caps a stroke at 4.5 s, so a
   longer path would exceed the 160 u/s gate ceiling and FAIL. Split a long outline into 2–4
   strokes (top edge, bottom edge …) — that is also how a student draws it.
1. **Exam-standard simplified line drawings.** Draw what a student can reproduce in 3–5 minutes
   with a pencil: the outline and the labelled structures. Never the book's shaded art. A
   life-cycle wheel = simple stage shapes at computed radial positions + curved arrows, NOT the
   host's organs drawn in the middle (the book's Entamoeba/Plasmodium/Ascaris wheels are too
   elaborate for an exam; draw the stages a student draws, with numbered arrows).
2. **Arrowheads and leader-line tips are SEPARATE short strokes, never `marker-end`.**
3. **Label collision is a build-gate failure.** Leave **≥40 figure units of vertical clearance**
   between any two labels whose horizontal extents overlap. 28 units fails. Keep every label
   fully inside `0..width` / `0..height`.
4. **~7px headroom under an `em` label** (25px Kalam runs `y-20 … y+5`).
5. `height` is a pagination decision — rounded up to a multiple of 32, and a phased figure
   reserves ONE extra 32px rule for the caption automatically. Typical `width` 440–520; height
   200–320. A tall composite (three Entamoeba stages) may go to 352; never past 400.
6. **Compute placements, do not guess.** Use a short python script for anything radial or
   repeated (stages around a cycle, a ring of cells, evenly spaced spiracles, the 9+2 doublets of
   a flagellum) and paste the computed numbers.
7. Label the SAME structures the book labels, with the SAME names. That is what is marked.
8. A diagram step shows ONLY the figure. The "how to draw" narrative lives in the phase captions;
   any explanation text goes in a neighbouring text step.

### Zoology shape correctness (a wrong-shaped figure passes every automated gate)
- **Entamoeba**: trophozoite = irregular outline with a blunt pseudopodium, ectoplasm/endoplasm,
  cart-wheel nucleus, food vacuoles (one with an RBC); precystic = smaller, OVAL, glycogen
  granules + chromatoid bars; cyst = ROUND, thick cyst wall, FOUR nuclei (tetranucleate).
- **Plasmodium in man**: signet-ring stage = a vacuole pushing the nucleus to one side of a
  ring; schizont = round with many merozoites; sporozoite = sickle/spindle-shaped.
- **Plasmodium in mosquito**: gametocytes → exflagellation (male) / fertilization cone (female) →
  zygote → ookinete (elongated) → oocyst on the crop wall → sporozoites → salivary glands.
- **Ascaris**: MALE short with a CURVED posterior end and pineal spicules; FEMALE long with a
  STRAIGHT posterior end and the genital pore about one-third from the anterior end. Mouth
  with three lips; excretory pore ventral near the mouth.
- **Cockroach alimentary canal**: foregut = pharynx → oesophagus → crop (large sac) → gizzard
  (proventriculus, six teeth); midgut short with 6–8 hepatic caecae at its start; Malpighian
  tubules (100–150, drawn as a few) at the midgut–hindgut junction; hindgut = ileum → colon →
  rectum; salivary glands with reservoirs beside the crop.
- **Cockroach circulation**: dorsal, 13-chambered tubular heart; dorsal and ventral diaphragms;
  three sinuses (pericardial, perivisceral, perineural); alary muscles.
- **Cockroach respiration**: 10 pairs of spiracles (2 thoracic + 8 abdominal); tracheae →
  tracheoles.
- **Mouthparts**: labrum, paired mandibles, paired maxillae (galea, lacinia, maxillary palp),
  labium (glossa, paraglossa, labial palp), hypopharynx.
- **Ommatidium**: cornea (corneal lens) → corneagen cells → crystalline cone (cone cells) →
  rhabdom surrounded by retinal cells → basement membrane; pigment cells along the sides.
- **Flagellum T.S.**: 9 peripheral doublets + 2 central singlets (9+2), dynein arms on the A
  tubule, radial spokes, plasma membrane.
- **Paramecium**: slipper-shaped, cilia, oral groove → cytostome → cytopharynx, macronucleus
  and micronucleus, anterior and posterior contractile vacuoles.
- **Cardiac muscle**: branched fibres, single central nucleus, intercalated discs, striations.
- **Multipolar neuron**: cell body with Nissl granules, many dendrites, one axon with myelin
  sheath, nodes of Ranvier, axon terminals.
- **Frog heart**: two atria + one ventricle, sinus venosus (dorsal), truncus arteriosus.
- **Lake ecosystem**: littoral, limnetic, profundal zones; benthic region; producers / consumers /
  decomposers placed where they live.
- **Food chains / energy flow**: arrows point FROM the eaten TO the eater; the pyramid narrows
  upward (10% law).

---

## 7. Cross-bank duplication

The bank already holds 946 questions across physics, chemistry, Maths-1A, Maths-1B and botany.
Before authoring, grep the existing questions for your unit's topics:
`grep -ril "<topic>" answer-book/questions/ | head`
Botany overlaps are likely in units 1 (species, biodiversity, taxonomy hierarchy) and 8
(ecosystem, succession, food chains, greenhouse effect). Author it anyway for zoology (both books
ask it), but RECORD the overlap in your report.

---

## 8. What you return

Do **not** run `npm run build:answers` (the orchestrator does — your files alone fail the
manifest cross-check until merged). Do **not** edit `units.json`, any file under `src/`, any
test, `notebook.js`, or another unit's files. DO run the pacer, the pace gate (`--only` your
prefix) and the gallery renderer on your own figures.

Return a compact report:
1. **Counts**: VSAQ / SAQ / LAQ transcribed (with the book's global numbers you covered, as
   ranges), question files written, figures authored, phases per figure.
2. **Book errors found** and what you wrote instead.
3. **Section-C-grade content** in a unit with no LAQ chapter (for founder review).
4. **Cross-bank duplicates** found.
5. **Figures**: the pacer's seconds per figure, the pace gate result, which figures you rendered
   and eyeballed per phase, and anything you could not verify.
6. **Enumeration gaps**: syllabus topics in your unit the book never asks (RECORD only — do NOT
   author predicted cards this run).
