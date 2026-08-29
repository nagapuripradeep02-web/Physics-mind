# Physics backfill — bringing Units 4–9 to the full depth bar

Companion docs: `docs/patterns/answer_book.md` (the mechanisms), `docs/CHEMISTRY_START_HERE.md`
(the playbook this one is modelled on), `answer-book/README.md` (the schema).

## 1. Why this exists

Physics Units **2 and 3** were authored after Vidi landed and ship at the full bar: `memory_tip`,
`margin_note` and `insider_note` on every card. Commit `0613f26e` called them *"the first units
born finished rather than added to the enrichment backlog."*

Units **4–9** predate that. Their standing instruction was "optional and sparse, 3-star + LAQ
first" (`src/schemas/answerBook.ts`), and they are exactly at that target — 27–48% tips, 0–67%
margin notes, 3–17% insider notes. Chemistry, authored later against one extra sentence in its
START_HERE, hit **100%**. That sentence is the whole difference, and it is repeated in §3 below.

The cost of the gap is measurable. In a 2,040-reply audit (2026-08-24), the **"How to remember?"
chip does not render at all** on a step with no `memory_tip`, and where the model had to
improvise a mnemonic it produced wrong ones ("a kilometre is a derived unit"). `REMEMBER:`,
`NOTE:` and `INSIDER POINT:` are lines in Vidi's grounding text: absent field, absent line.

## 2. The exact remaining work

| Unit | memory_tip | margin_note | insider_note |
|---|---|---|---|
| 4 Motion in a Plane | 21 cards / 55 strings | 12 / 28 | 15 |
| 5 Laws of Motion | 17 / 43 | 12 / 28 | 16 |
| 6 Work Power Energy | 11 / 28 | 10 / 23 | 8 |
| 7 Rotational Motion | 24 / 57 | 11 / 25 | 21 |
| 8 Oscillations | 12 / 26 | 18 / 49 | 4 |
| 9 Gravitation | 15 / 32 | 27 / 61 | 14 |
| **Total** | **241** | **214** | **78** |

Units 8 and 9 are at **0% margin_note** — the largest single hole, larger than the tips.

## 3. The bar a card must clear

Build-enforced, so this is not advisory:

- `memory_tip` and `margin_note` are **all steps or none** per question — physics now authors
  both on every step of every card. A half-filled question fails `npm run build:answers`.
- `insider_note` on **every card, asked or predicted**. This is where physics departs from
  chemistry: `docs/CHEMISTRY_START_HERE.md` omits it on predicted cards, but physics Units 2–3
  — the finished exemplar — carry one on all 42, predicted included. On a predicted card the
  note simply cannot cite frequency, so it talks about the shape of the marks instead: *"One
  condition, one counter-example. The counter-example is what shows the condition is needed."*
  · *"Two marks means two contrasts. Scalar against vector, and path length against
  straight-line change."*
- **Rule 41 plain language** in every string. The imported word list catches perhaps half — the
  hand scan on Units 2/3 found six the gate missed ("displacement that knows its end points",
  "a slow half that eats more of the clock"). Budget ~1 rewrite per 7 strings and scan by hand.
- Physics vocabulary is not jargon: "centripetal", "resultant", "amplitude", "limiting friction"
  are the plain words. Use the word the formula uses.
- Unicode, never ASCII transcription: θ ω ₁ ² √ × ⁻ · − ≈ ∝. Physics adds **zero** katex lines —
  check the count does not move.
- Do not touch `marks`, `mark_split`, `qtype`, step ids, or anything that moves an arithmetic total.

## 4. House style — `memory_tip`

**One sentence, sometimes two. Median 78 characters.** A retrieval device, never a restatement:
the step's `lines` already say the thing; the tip says how to get it back under exam pressure.
Every good one in the bank uses one of five moves.

1. **Contrast pair, capitalised pivot** — "Accuracy points OUTWARD to the true value. Precision
   points INWARD at the readings themselves."
2. **A concrete number or worked instance** — "3.25 → 3.2 but 3.35 → 3.4. Land on the even digit
   both times." · "Multiply by the power, never raise to it: 3 × 1% = 3%."
3. **Name-is-the-definition hook** — "PARallax + SECond = parsec. The name is the definition."
4. **A physical anchor image** — "Distance is what the odometer reads. It only goes up." ·
   "Rectangle = what u alone would give. Triangle = what a adds on top."
5. **An arithmetic sanity check** — "v_e = √(2gR). The m cancels — a feather and a rocket need
   the same speed."

More from Units 2–3, as the calibration set:
- "Leading zeros only place the point. Trailing zeros were really measured."
- "You cannot add a length to a time. That is the whole principle."
- "One twelfth of a carbon-12 atom. The 12 in the name and the 12 in the fraction are the same 12."
- "No t anywhere. Use it whenever time is not part of the question."
- "Name the SAME force twice: once as GMm/R², once as mg."

Voice is imperative or flat declarative. Never "you should", never "the trick is", never
"remember that" as an opener.

## 5. House style — `insider_note`

**One sentence of marks economics, not physics.** Median ~130 characters. It says what the
template line (stars + asked years) cannot. Four working shapes:

- **Mark arithmetic** — "Seven pairs, two marks. Write them as a list of quantity and unit — a
  missing unit costs the second mark." · "Part b) is 3 of the 8 marks."
- **What the examiner checks first** — "The word NET in the statement is checked."
- **Provenance** — "Both books ask this." · "The two source books disagree on the count." ·
  "Asked in AP March 2026." (A predicted card has no provenance to cite: use one of the other
  three shapes.)
- **The one thing students drop** — "The division step, equation (2) by equation (1), is where
  most students stop — practise that one line." · "Write the minus sign. Some guides omit it."

Do not restate the stars ("this is a 3-star question") — Vidi already has that line.

## 6. House style — `margin_note`

The rail card beside the step. Carries the **mark ordinal and what that mark is actually for**:
"Fourth mark. Column 2 now has (b−a) in both non-zero entries…" is the shape. Shorter than a
`why`; it orients rather than explains.

## 7. Working rhythm

One unit per session, one commit per unit.

```bash
npm run build:answers      # the all-or-none gate + Rule 41; read the per-unit coverage line
npm run vidi:contexts      # record the max chars — the server slices at 10,000
npx tsc --noEmit && npm test
```

Paste the unit's coverage line into the commit body. The build prints
`Unit N: memory_tip xx% · margin_note xx% · insider_note xx%` on every run — that is the progress
meter and it needs no new tooling.

**Watch the context budget.** Every tip and note is grounding text. Before this backfill the
widest physics card (`ts_ipe_p1_mp_projectile_motion`, 8 steps) measured 7,710 chars against the
server's 10,000-char slice. Re-measure after each unit; if a card approaches 9,000 the server
logs a warning, and past 10,000 it silently drops the tail steps.
