# Reader brief — transcript, restatement and givens for the projectile-motion bank

You read ~12 cropped page images of physics items (Class 11, projectile motion). For each one you
write THREE things into ONE file: the item exactly as printed, then the same item in OUR words, then
the given data of both versions. You never solve anything. Your dispatch names your SLICE file.

Input:   the slice file named in your dispatch (under `pdfs/books/.../projectile/_slices/`); each
         item names its `crop` image, an optional `context_crop` (a "Directions" block shared by
         several items) and its `out` path
Output:  the `out` path of each item — one JSON file per item, written immediately after that item

**Write each file the moment you finish that item, before starting the next one.** Agents that wrote
everything at the end lost it all to a session cap. A file on disk is the only deliverable that counts.

## What you may open

The `crop` and `context_crop` paths named in your slice, and nothing else under `pdfs/`. Never open
`key.json`, `hints.json`, `transcripts.jsonl`, `items_manifest.json`, the page images, or any other
agent's file. You do not need the answers and you must not look for them.

## Part 1 — the transcript, exactly as printed

Open the crop with the Read tool. The item begins at the numbered label near the top of the image
(the word Example followed by a number such as N.M, or a bare `12.`). Ignore anything above that label (it belongs to the previous item) and ignore
theory paragraphs, section headings, page headers and page numbers, any watermark or web address
printed across the page, and any further numbered item that appears after it. Copy the book's wording
without solving, correcting or adding anything.

- All mathematics in Unicode characters: superscripts ² ³ ⁻¹, √, π, ½, −, ×, °, θ, Δ, α, β, vectors
  as î ĵ k̂. Never LaTeX, never ASCII maths (`^2`, `sqrt`, `deg`, `x10^-5`).
- `options`: the printed (a)–(d) options as `{"label": "(a)", "text": "..."}`, else `[]`.
- `parts`: the sub-part LABELS present, e.g. `["a", "b", "c"]`, else `[]`. The parts' text stays inside
  `question_text` as printed ("(a) ... (b) ...").
- `figure`: `{"present": true, "description": "what the drawing shows, in words a solver could work from",
  "values_read": ["every number or label readable on the figure, with its meaning"]}` or `{"present": false}`.
- Worked examples (`worked_example: true` in the slice): copy the printed solution into `printed_solution`
  (Unicode maths; the last lines matter most) and write `printed_final` = the final result the printed
  solution reaches, every part of a multi-part answer as `"(a) ..., (b) ..."`. For exercises both are `""`.
- `printed_answer`: an "Ans." line printed inside the crop for an exercise, else `""`.
- Assertion–reason items: `question_text` = `"Assertion: ... Reason: ..."`, `options` = `[]` (the four
  standard statements are implied by the Directions block), `format` = `"assertion_reason"`.
- `format`: `mcq_single` (options (a)–(d)) · `assertion_reason` · `numerical` (one value asked, no
  options) · `subjective` (several parts, or a derivation, "find", "show", "prove") · `conceptual`
  (true/false, "is it possible", explain in words).
- `truncated`: true if the item is visibly cut off at the top or bottom. `extra_items_visible`: true
  if a second numbered item shows in the image (transcribe only the first).

## Part 2 — the restatement, in our words

Rewrite the problem as a fresh problem statement for a student. A machine compares it with your
transcript and REJECTS it if any run of 12 words is shared, if the edit distance with numbers masked is
under 0.4, or if any number the original states is missing. So:

- Keep EVERY given quantity with its exact value and unit, every condition, and the exact question
  asked. Do not add data the original does not state (if you must assume g = 10 m/s² say so only when
  the original says so).
- Change the sentence structure and the vocabulary substantially; do not keep any run of five or more
  words from the original. Plain literal English a Class-11 student reads without a dictionary — no
  idioms, no metaphors. Unicode maths as above.
- `question_text` = the stem only. `parts` = a list of the lettered parts' TEXT in our words, one string
  per part, in order (`["Find the time to reach the ground.", "Find the speed on landing."]`), else `[]`.
- `options`: the same labels in the same order; keep option texts unchanged where they are pure
  numbers or formulas, reword them where they are prose.
- `conditions`: every physical condition the problem states or relies on, as short phrases
  (`"projected from ground level"`, `"air resistance neglected"`, `"g = 10 m/s²"`, `"lands at the same height"`).
- `figure_description`: our own description of the figure with every value on it, so the problem can be
  solved from text alone; `""` if there is no figure. `figure_required`: true only if the problem cannot
  be stated in words with all its data (a curve that must be read by eye).
- Assertion–reason: keep the form `"Assertion: ... Reason: ..."`, both sentences reworded.
- Never mention any book, author, edition, page, chapter number, figure number or example number.

## Part 3 — the givens, of each text separately

For the ORIGINAL transcript and then for YOUR restatement, list what that text states:
`{"givens": [{"quantity": "<what>", "value": "<number>", "unit": "<unit or ''>"}], "conditions": ["<short phrase>"], "asked": "<what is asked, 5–10 words>"}`.
Every number in the statement counts, options excluded. Do it honestly for each text on its own — the
gate compares the two lists to check that nothing was dropped or invented.

## The file — exact shape

```json
{
 "label_seen": "12.",
 "kind": "exercise",
 "format": "mcq_single",
 "question_text": "A ball is projected ... (as printed)",
 "options": [{"label": "(a)", "text": "2 s"}, {"label": "(b)", "text": "5 s"}, {"label": "(c)", "text": "7 s"}, {"label": "(d)", "text": "9 s"}],
 "parts": [],
 "figure": {"present": false},
 "printed_solution": "",
 "printed_answer": "",
 "printed_final": "",
 "truncated": false,
 "extra_items_visible": false,
 "restatement": {
  "question_text": "From the top of a 70 m tower a ball is thrown at 50 m/s, 30° above the horizontal. Taking g = 10 m/s², after how many seconds does it reach the ground?",
  "options": [{"label": "(a)", "text": "2 s"}, {"label": "(b)", "text": "5 s"}, {"label": "(c)", "text": "7 s"}, {"label": "(d)", "text": "9 s"}],
  "parts": [],
  "conditions": ["thrown from a tower of height 70 m", "g = 10 m/s²", "air resistance neglected"],
  "figure_description": "",
  "figure_required": false
 },
 "givens_original": {"givens": [{"quantity": "initial speed", "value": "50", "unit": "m/s"}, {"quantity": "angle above horizontal", "value": "30", "unit": "°"}, {"quantity": "tower height", "value": "70", "unit": "m"}, {"quantity": "g", "value": "10", "unit": "m/s²"}], "conditions": ["projected upwards from the tower top"], "asked": "time to reach the ground"},
 "givens_restatement": {"givens": [...same extraction on your text...], "conditions": [...], "asked": "..."}
}
```

`kind` is `"worked_example"` or `"exercise"` (the slice tells you). No other top-level key.

## Reply

Reply with only one line per item: label, format, figure Y/N, truncated Y/N, and any doubt (an
unreadable symbol, a value you could not read from the figure). Do not paste JSON. If the brief is
wrong somewhere, say so — every file inherits the brief.
