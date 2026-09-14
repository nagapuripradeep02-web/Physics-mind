# Repair brief — BiPC second-year IPE Answer Book (2026-09-04)

You OWN a named list of cards. No other agent will touch those files, so you are free to edit them —
but touch NOTHING outside your list.

## Where your work comes from

Your dispatch names the report files that carry findings for your cards, all in
`/Users/karthikyerragadda/Desktop/Viditra/Physics-mind-ipe-answerbook-zoology-2/docs/reports/bipc2_audit/`.
Each examiner report (`B2-nn.md`, `Z2-nn.md`) has HARMFUL / WRONG / WEAK tables of
`question_id · step_id · what is wrong · what it should say`; the figure reports (`FIG-B2.md`,
`FIG-Z2.md`) carry a verdict column; the chatbot grading reports (`VIDI-*.md`) list card defects
the model's replies exposed. Read every row for every card you own, in every report named.

The cards themselves are
`/Users/karthikyerragadda/Desktop/Viditra/Physics-mind-ipe-answerbook-zoology-2/answer-book/questions/<question_id>.json`.

## The rules, learned the hard way on four earlier papers

1. **Use the Edit tool for string-level edits. NEVER re-serialise a card.** A whole-file rewrite
   corrupts the diff even when the JSON is equivalent.
2. **The auditor's "what it should say" is a suggestion and is wrong about one row in eight.** Check
   every proposal against NCERT, the card itself and its neighbours in the same unit before applying
   it. The recurring failure is a suggestion that proposes a "mistake" which is not a mistake — the
   very defect this audit exists to find. If a suggestion is wrong, write your own replacement and
   say so in your report.
3. **Sweep the whole step, not one field.** The same false claim usually repeats across `why`,
   `memory_tip`, `common_mistakes`, `margin_note`, and sometimes `insider_note`. Fix every copy.
4. **`lines[]` is off limits unless a PRINTED line is itself false.** Re-derive before changing one.
   If a finding wants a `lines[]` change that is not a printed falsehood, put the correction in `why`
   instead and report that you did. A changed printed line must stay under ~50 characters (one
   ruled row) — check the neighbouring lines' lengths.
5. **Never change** `marks`, `marks_total`, `question_text`, `question_id`, `paper_section`,
   `qtype`, or any step `id`. A step `label` and its `mark_split` label are a pair — change both or
   neither. If a finding requires changing a forbidden field, DO NOT: list it as "referred out".
6. **Teacher-gate rows are NOT repairs.** Where the audit says a convention needs a board teacher's
   ruling (36 vs 38 ATP, a normal value quoted differently by two texts, an older accepted name),
   leave the biology as it stands. You may only make the card internally consistent — never assert
   one side of a live convention dispute.
7. **A correction never becomes a prohibition.** When you correct a claim, say what is right; do not
   add "X is wrong" unless X really is wrong. Never tell a student a printed answer "earns zero".
8. **Binomial names must be spelled exactly** (the notebook font cannot italicise). Check every
   genus and species you touch against NCERT.
9. Preserve plain literal English (Rule 41): no idioms, no metaphors, no personification of cells,
   enzymes, hormones or genes. Subject vocabulary is not jargon.
10. **Never write your changelog into `why`** — it is student-facing and handed to the chatbot.
    Revision history goes in `verification.note` (append one sentence: what changed and why).

## Figures (only if your dispatch says so)

A figure lives on a step with `kind: "diagram"` as `figure.elements[]`, drawn in array order:
`stroke` (`d` = SVG path data, `ms` = its authored draw time), `label` (`x`,`y`,`text`), `pause`
(phase break with `caption`). To move a label, change its `x`/`y` — check it stays ≥40 units clear
vertically of any label whose x-range overlaps. To fix geometry, change the path `d` and keep every
single stroke under ~315 units of length (a longer stroke races the 160 u/s pace ceiling however it
is timed — split it into two pen strokes). In an arc command `A rx ry rot large sweep x y` **only
the last pair is a coordinate**. After any figure edit run

    npx tsx src/scripts/pace_figures.ts --prefix <question_id> --write
    npx tsx src/scripts/check_figure_pace.ts --strict <your prefix>

(`npx tsx` may hang in this sandbox; if it does, use the cached binary
`$(ls -d ~/.npm/_npx/*/node_modules/.bin/tsx | head -1)` with the same arguments) and report the
result.

## Verify before you report

Run, from `/Users/karthikyerragadda/Desktop/Viditra/Physics-mind-ipe-answerbook-zoology-2`:

    $(ls -d ~/.npm/_npx/*/node_modules/.bin/tsx | head -1) src/scripts/check_cards.ts --prefix <the narrowest prefix covering your cards>

It must exit 0. It is read-only and safe to run while other agents work. Do NOT run
`npm run build:answers` (it writes a shared directory another agent may be reading).

## Report back

Reply with ONLY:
- `applied: N` findings, `declined: N`, `referred out: N`
- every DECLINED finding as one line: `question_id · step_id · why you declined it`
- every REFERRED-OUT finding (needs a forbidden field changed, or a teacher ruling)
- the `check_cards` exit code and card count
Keep it short; the diff is the deliverable.
