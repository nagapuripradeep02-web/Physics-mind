# Repair brief — second-year IPE Answer Book (2026-09-02)

You OWN a named list of cards. No other agent will touch those files, so you are free to edit them —
but touch NOTHING outside your list.

## Where your work comes from

Your dispatch names the report files that carry findings for your cards, all in
`C:\Tutor\physics-mind\docs\reports\senior_audit\`. Each report has HARMFUL / WRONG / WEAK tables of
`question_id · step_id · what is wrong · what it should say`, plus figure reports (`FIG-*.md`) with a
verdict column. Read every row for every card you own, in every report named.

The cards themselves are `C:\Tutor\physics-mind\answer-book\questions\<question_id>.json`.

## The rules, learned the hard way on Maths 1A/1B

1. **Use the Edit tool for string-level edits. NEVER re-serialise a card.** These files are CRLF, and
   30 second-year cards are not `JSON.stringify(...,2)` canonical (23 Physics-II cards have no
   trailing newline). A whole-file rewrite corrupts the diff even when the JSON is equivalent.
2. **The auditor's "what it should say" is a suggestion and is wrong about one row in eight.** Check
   every proposal against the card itself and its neighbours in the same unit before applying it. The
   recurring failure is a suggestion that proposes a "mistake" which is not a mistake — the very
   defect this audit exists to find. If a suggestion is wrong, write your own replacement and say so
   in your report.
3. **Sweep the whole step, not one field.** The same false claim usually repeats across `why`,
   `memory_tip`, `common_mistakes`, `margin_note`, and sometimes `insider_note` and the `recall`
   rubric. A `recall.must_convey` / `accept` / `reject` that is wrong silently marks a correct
   student answer wrong, and no gate reads it.
4. **`lines[]` is off limits unless a PRINTED line is itself false.** Re-derive before changing one.
   If a finding wants a `lines[]` change that is not a printed falsehood, put the correction in `why`
   instead and report that you did.
5. **Never change** `marks`, `marks_total`, `question_text`, `question_id`, `paper_section`,
   `qtype`, or any step `id`. A step `label` and its `mark_split` label are a pair — change both or
   neither. If a finding requires changing a forbidden field, DO NOT: list it as "referred out".
6. **Teacher-gate rows are NOT repairs.** Where the audit says a convention needs a board teacher's
   ruling (thiocyanato vs isothiocyanato, Popoff's rule direction, pine oil as collector vs frothing
   agent, German silver composition), leave the chemistry as it stands. You may only make the card
   internally consistent — never assert one side of a live convention dispute.
7. Preserve plain literal English (Rule 41): no idioms, no metaphors, no personification. Subject
   vocabulary is not jargon. Do not use "the trick is", "by heart", "on sight".

## Figures (only if your dispatch says so)

A figure lives on a step with `kind: "diagram"` as `figure.elements[]`, drawn in array order:
`stroke` (`d` = SVG path data), `label` (`x`,`y`,`text`), `pause` (phase break). To move a label,
change its `x`/`y`. To fix geometry, change the path `d`. In an arc command
`A rx ry rot large sweep x y` **only the last pair is a coordinate** — adding to the other numbers
turns a circle into an ellipse. After any figure edit run
`npx tsx src/scripts/check_figure_pace.ts --strict <your prefix>` and report the result.

## Verify before you report

Run, from `C:\Tutor\physics-mind`:

    npx tsx src/scripts/check_cards.ts --prefix <the narrowest prefix covering your cards>

It must exit 0. It is read-only and safe to run while other agents work. Do NOT run
`npm run build:answers` (it writes a shared directory another agent may be reading).

## Report back

Reply with ONLY:
- `applied: N` findings, `declined: N`, `referred out: N`
- every DECLINED finding as one line: `question_id · step_id · why you declined it`
- every REFERRED-OUT finding (needs a forbidden field changed, or a teacher ruling)
- the `check:cards` exit code and card count
Keep it short; the diff is the deliverable.
