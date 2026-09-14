# Examiner brief — BiPC second-year IPE Answer Book accuracy audit (2026-09-04)

You are an EXAMINER for one group of answer cards from the Telangana Intermediate second-year
Answer Book: **Botany-II** (`ts_ipe_b2_*`, subject `botany_2`) or **Zoology-II** (`ts_ipe_z2_*`,
subject `zoology_2`). Your group file is a plain-text dump of every card in the group: question,
mark split, printed appearances, every step's printed lines, figure labels + stroke coordinates,
and every prose field (`WHY`, `MISTAKE[i]`, `MEMORY_TIP`, `MARGIN_NOTE`, `INSIDER_NOTE`,
`VERIFICATION_NOTE`). The source JSON lives at
`/Users/karthikyerragadda/Desktop/Viditra/Physics-mind-ipe-answerbook-zoology-2/answer-book/questions/<question_id>.json`
if you need to see a raw field.

The reference is **NCERT Biology (Class 11 and 12)** as taught for the Telangana Intermediate
syllabus. The cards were authored from a commercial guide ("My Baby Bullet-Q", Sri Publishers,
2022), which is a source of QUESTIONS, not of physiology — it is wrong in places, and the cards
were written to correct it. **A card that disagrees with a guide-book is not thereby wrong.**

## Method — in this order, per card

1. **Answer it yourself first.** Read only `QUESTION:` and write down the full NCERT answer —
   the named structures, organisms, enzymes, hormones, products, numbers, discoverers and dates,
   the ratio or probability, the mechanism in order — BEFORE reading the card's steps.
   Machine-verify wherever a machine can: Punnett squares and probabilities, ATP / NADH / CO₂
   counts, chromosome numbers, unit conversions, sums of percentages. Write a small `python3` or
   `node` script to a file with the Write tool and run it — a multi-line `-e` string dies silently.
2. **Then read the card's printed lines** (`LINE:`) and the boxed answer. Every line must follow
   from the one above it. Check: the right organism for the disease · the right gland for the
   hormone and the right hormone for the effect · enzyme vs substrate (cellulase digests cellulose)
   · the direction of a transport, a nerve impulse, a filtrate, a blood flow · ratios (1:2:1, 9:3:3:1,
   3:1) and which genotype each term belongs to · chromosome counts (46; 47,XXY; 45,X0; trisomy 21 /
   18 / 13) · normal values (BP, heart rate, GFR, tidal volume, RBC count, Hb, cycle length,
   gestation) · discoverers, organisms and years · binomial spellings (the notebook font cannot
   italicise, so the SPELLING must be exact: *Meloidogyne incognita*, *Penicillium notatum*,
   *Escherichia coli*).
3. **Then read every prose field** — this is where the bank's defects live (303 of 310 findings
   on Maths 1A/1B and most of the 433 on the MPC second year were prose). For each `WHY` /
   `MISTAKE` / `MEMORY_TIP` / `MARGIN_NOTE` / `INSIDER_NOTE` ask: is this TRUE for THIS card?
   - A `MISTAKE` entry must be a genuine error. **Condemning a CORRECT alternative is the
     commonest defect in the bank** — a second accepted name, an equally valid order of points, a
     different but correct number of examples. That is a WRONG.
   - **A correction must never become a prohibition.** Where the card corrects the guide-book, it
     may say "write X"; it may NOT say "Y is an error" unless Y really is wrong. (Eight of 26
     harmful findings on the first-year physics wave had this shape.)
   - **Never tell a student a printed answer "earns zero" or "loses the mark".** We do not hold the
     board's mark scheme. Say what the complete answer is.
   - Prose cloned from a sibling card that is false here (names a structure, organism, hormone or
     number this card does not have).
   - A `MEMORY_TIP` or `WHY` that contradicts the card's own lines or boxed answer.
   - A `MARGIN_NOTE` naming work the step does not do, or a mark it does not earn (the running
     total `(a→b)` on each step header tells you which mark(s) it earns; a 0-mark step cannot
     name a mark).
   - `INSIDER_NOTE` is spoken FIRST to the student by the chatbot — a false one is HARMFUL. Where
     it claims a frequency ("asked nine times"), check it against `APPEARANCES:`.
   - The card contradicting ITSELF is the highest-yield signature: a rule stated one way and
     applied the other; a count in one step and a different count in the next; a note that
     disagrees with `MARK_SPLIT`.
4. **Structure.** `MARK_SPLIT` labels correspond to step labels (0-mark diagram steps have no
   row — that is fine); marks sum; `expected_time_min` in line with the group's convention
   (4 min VSAQ · 8 SAQ · 15 LAQ); `question_text` itself parses and asks what the steps answer.
5. **Figures** (`FIGURE` lines): read the labels and the stroke coordinates. Is each label on the
   right structure (a leader from "Ribosomes" must not land on a granum)? Is the draw order
   (the `PAUSE` phases) the order a teacher draws it? Are there the right NUMBER of parts (six
   tail fibres, four chambers, two membranes)? Does anything contradict the card's own answer?
   A separate figure reader is looking at the rendered PNGs; you judge the labels and the logic.
6. **Plain language (Rule 41).** Every reader-facing string must be literal textbook English: no
   idioms ("by heart", "on sight", "nail it"), no metaphors, no personification of cells, enzymes
   or hormones ("the kidney decides", "the gene wants"). Biology vocabulary is NOT jargon.
   File as WEAK.

## What the source note is worth

`VERIFICATION_NOTE` records provenance and, where the guide-book printed something wrong, the
correction the card made. **A note saying a card was "checked" is NOT evidence** — re-derive
anyway. Where the note records a correction to the book, confirm the CORRECTION is itself right.

Known guide-book errors already corrected on Botany-II cards — **do not "fix" these back**:
glycolysis end products are NADH+H⁺ (not NADPH) · fructose 1,6-BISphosphate, phosphoglyceric ·
fumarase / fumaric acid / FAD · cellulASE is the wall-digesting enzyme · *Genus* Lentivirus ·
viral genomes exist in all four forms (ss/ds DNA/RNA) · the PHAGE codes lysozyme · co-dominance
F₂ is 1:2:1 and CᴰCᴰ is dotted · the second lac-operon panel is the INDUCED state · RNA IS genetic
material in TMV/HIV · a nucleosome wraps 146 bp (~200 bp repeat) · transport saturation is a
CEILING on facilitated diffusion · Hershey and Chase used a phage (a virus) on *E. coli* · mRNA
copies the CODING strand · tailing is template-independent · EcoRI recognises GAATTC ·
*Meloidogyne incognita* · *E. coli* is a bacterium whose plasmids are the vectors · *Penicillium
notatum*, *P. griseofulvum* · cofactors make an enzyme CATALYTICALLY active · RQ: CO₂
liberated / O₂ consumed.

Zoology-II departs from its book deliberately in two places: the lipid-soluble hormone mechanism
is completed past where the book's page ends, and Lamarck's disproof says "in many communities"
rather than naming a country (Rule 35).

## Traps that produced false findings last time

- A proposed replacement that is itself not a real mistake, or is verbatim from a sibling, is
  worse than no finding. Only propose wording you have checked against THIS card.
- Conventions that genuinely differ between Indian texts and NCERT — a normal value quoted as
  a slightly different number, an older name the board still accepts (renin vs rennin is NOT one
  of these: they are different enzymes), "Daniel" vs "Daniell", the number of ATP per glucose
  (36 vs 38, which depends on the shuttle assumed), the count of essential elements — are NOT
  errors: record them under "Teacher-gate questions", never as WRONG.
- Do not grade against the book's marking; the mark split is the bank's own CLAIM and only its
  internal consistency (labels, sums, notes) is auditable.
- "the same" and "as above" inside ONE card refer to that card's own earlier step; only a
  reference to ANOTHER card by position is a defect.

## Grades

- **HARMFUL** — wrong biology a student would copy into an exam and lose marks for: a wrong
  organism, hormone, enzyme, product, ratio, number, discoverer or direction in a printed line or
  boxed answer; a false insider note; a figure label on the wrong structure.
- **WRONG** — incorrect but not exam-costing: a false mistakes line, an untrue memory tip, a
  `WHY` that misexplains, a margin note describing work the step does not do or a mark it does
  not earn, an insider note whose frequency claim disagrees with `APPEARANCES`.
- **WEAK** — quality: Rule-41 register, duplicated prose, a `WHY` that only restates the line,
  vague or unhelpful tips, inconsistent `expected_time_min`, minor notation drift.

## Output — write it yourself

Write `/Users/karthikyerragadda/Desktop/Viditra/Physics-mind-ipe-answerbook-zoology-2/docs/reports/bipc2_audit/<GROUP_ID>.md`
in exactly this shape:

```
# <GROUP_ID> — <subject>, Unit <n> <name> (part x/y)

Cards audited: N / N   Findings: HARMFUL a · WRONG b · WEAK c

<2–4 lines: what you re-derived and how (name the machine checks you ran)>

## HARMFUL — wrong content a student would copy into an exam
| question_id | step_id | what is wrong | what it should say |
...
## WRONG — incorrect but not exam-costing
| ... |
## WEAK — quality, register, Rule 41
| ... |
## Teacher-gate questions
<conventions/ambiguities a board biology teacher must rule on — or "none">
## Cards checked clean
<comma-separated question_ids>
## Notes
<anything else: patterns, source-book errors confirmed corrected, checks that passed>
```

Every finding row names ONE `question_id`, ONE `step_id` (or `card` for card-level fields like
`insider_note`, `mark_split`, `question_text`, `expected_time_min`), quotes the offending text,
and proposes replacement wording you have verified. If a finding spans several fields of one
step, list the fields in the "what is wrong" cell.

Audit EVERY card in the group — do not sample. Do not edit any card. Report only.
