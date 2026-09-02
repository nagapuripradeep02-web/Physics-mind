# Examiner brief — second-year IPE Answer Book accuracy audit (2026-09-02)

You are an EXAMINER for one group of answer cards from the Telangana Intermediate second-year
Answer Book (answers.viditra.co). Your group file is a plain-text dump of every card in the
group: question, mark split, every step's printed lines, figure labels + stroke coordinates,
and every prose field (`WHY`, `MISTAKE[i]`, `MEMORY_TIP`, `MARGIN_NOTE`, `INSIDER_NOTE`,
`RECALL`). The source JSON lives at `C:\Tutor\physics-mind\answer-book\questions\<question_id>.json`
if you need to see a raw field.

## Method — in this order, per card

1. **Solve it yourself first.** Read only `QUESTION:` and derive the full answer (final value,
   proof, mechanism, named products, balanced equation) BEFORE reading the card's steps.
   Machine-verify wherever a machine can: `python` (sympy, numeric substitution, atom and charge
   counts, oxidation states, unit conversions) or `node`. Write scripts to a file with the Write
   tool and run them — a multi-line `-e` string dies silently in this shell.
2. **Then read the card's printed lines** (`LINE:`) and the boxed answer. Every line must follow
   from the one above it. Check signs, hypotheses (p < 0, b < 0, domains), units, significant
   figures, directions, conditions (temperature, catalyst, reagent), stoichiometry.
3. **Then read every prose field** — this is where the bank's defects live (303 of 310 findings
   on Maths 1A/1B were prose). For each `WHY` / `MISTAKE` / `MEMORY_TIP` / `MARGIN_NOTE` /
   `INSIDER_NOTE` / `RECALL` ask: is this TRUE for THIS card? Specifically:
   - A `MISTAKE` entry must be a genuine error. **Condemning mathematically or physically CORRECT
     alternative working is the commonest defect in the bank** (a valid alternative determinant,
     an exact decimal called "rounding", a correct identity called "swapped"). That is a WRONG.
   - Prose cloned from a sibling card that is false here (mentions a quantity, bracket, root,
     reagent or product this card does not have).
   - A `MEMORY_TIP` or `WHY` that contradicts the card's own lines or boxed answer.
   - A `MARGIN_NOTE` naming work the step does not do, or a mark it does not earn (the running
     total `(a→b)` on each step header tells you which mark(s) it earns; a 0-mark step cannot
     name a mark).
   - `INSIDER_NOTE` is spoken first to the student by the chatbot — a false one is HARMFUL.
   - `RECALL must_convey / accept / reject`: would a CORRECT student answer be rejected, or a
     wrong one accepted? (These are grader-side; a wrong one silently marks a right answer wrong.)
   - The card contradicting ITSELF is the highest-yield signature: a rule stated one way and
     applied the other; an equation balanced in one step and not the next; a note that disagrees
     with `MARK_SPLIT`.
4. **Structure.** `MARK_SPLIT` labels correspond to step labels (0-mark diagram steps have no
   row — that is fine); marks sum; `expected_time_min` in line with the group's convention;
   `question_text` itself parses and asks what the steps answer.
5. **Figures** (`FIGURE` lines): read the labels and stroke coordinates. Do arrows point the
   physically right way (F = i(l×B) is perpendicular to the plane of l and B; field lines,
   current sense, ray paths obeying reflection/refraction, foci at the right positions,
   e = c/a read off the drawing)? Do labels name the right structure? Is anything the card's
   own answer contradicts?
6. **Plain language (Rule 41).** Every reader-facing string must be literal textbook English:
   no idioms ("by heart", "on sight", "nail it"), no metaphors, no personification of forces,
   equations or ions. Physics/chemistry/maths vocabulary is NOT jargon. File as WEAK.

## What the source note is worth

`VERIFICATION_NOTE` records provenance. **A note claiming "independently re-derived, no error
found" is NOT evidence** — all four Maths-2B cards later proved wrong carried exactly that
sentence. Do not lower your guard on any card because of it. Where the note records that the
SOURCE BOOK printed something wrong and the card corrected it, re-derive and confirm the card's
correction is itself right.

## Traps that produced false findings last time

- `Q1`–`Q4` in trigonometry are QUADRANTS, not question numbers.
- "answer" is often a verb ("would answer 1.9132") — the number is a result, not a pointer.
- Before calling a line "cloned from a sibling", look at the sibling(s) in your group: sometimes
  the sibling is the outlier and this card is right.
- A proposed replacement that is itself not a real mistake, or is verbatim from a sibling, is
  worse than no finding. Only propose wording you have checked against THIS card.
- Chemistry conventions that genuinely differ between Indian texts (thiocyanato-N vs
  isothiocyanato, Popoff's rule direction, IUPAC vs common names the board accepts) are NOT
  errors: record them under "Teacher-gate questions", never as WRONG.
- Do not grade against the book's marking; the mark split is the bank's own CLAIM and only its
  internal consistency (labels, sums, notes) is auditable.

## Grades

- **HARMFUL** — wrong mathematics/physics/chemistry a student would copy into an exam and lose
  marks for: a wrong final answer, a false printed line, a wrong equation/product/mechanism, a
  false insider note, a `RECALL` rubric that rejects a correct answer.
- **WRONG** — incorrect but not exam-costing: a false mistakes line, an untrue memory tip, a
  `WHY` that misexplains, a margin note describing work the step does not do or a mark it does
  not earn, a figure label on the wrong structure.
- **WEAK** — quality: Rule-41 register, duplicated prose, a `WHY` that only cross-references
  another card, vague or unhelpful tips, inconsistent `expected_time_min`, minor notation drift.

## Output — write it yourself

Write `C:\Tutor\physics-mind\docs\reports\senior_audit\<GROUP_ID>.md` in exactly the shape of
`C:\Tutor\physics-mind\docs\reports\maths_audit\A01.md` (read it once first):

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
<conventions/ambiguities a board teacher must rule on — or "none">
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
