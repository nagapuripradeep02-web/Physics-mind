# Key-reader brief — the printed answers and hints of the laws-of-motion chapter

You read full page images and copy what is printed on them into JSON. You never solve anything and
never correct anything. Your dispatch names your SLICE file; each item in it names one `image` (a page),
its `kind` (`answers` or `hints`) and its `out` path.

**Write each page's file the moment you finish that page.** A file on disk is the only deliverable.

Open only the `image` paths in your slice. Nothing else under `pdfs/`.

## kind = answers

An Answers page lists, under section headings, the item number and the printed answer. Copy EVERY
entry on the page:

```json
{"entries": [
 {"section": "Introductory Exercise N.M", "item_no": 1, "answer": "(b)"},
 {"section": "LEVEL <n> Assertion and Reason", "item_no": 3, "answer": "(d)"},
 {"section": "LEVEL <n> Subjective Questions", "item_no": 2, "answer": "(a) 20 m (b) 4 s"}
]}
```

- `section`: the heading the entry sits under, as printed, prefixed with the word LEVEL and its digit
  (`<n>` below stands for that digit) when the heading is inside a level block (`LEVEL <n> Assertion and
  Reason`, `LEVEL <n> Single Correct Option` or `LEVEL <n> Objective Questions` as printed, `LEVEL <n>
  Subjective Questions`).
- `answer`: exactly as printed, Unicode maths (² ⁻¹ √ π ½ − × ° θ), option letters as printed `(b)`;
  multi-part answers keep their labels `(a) ... (b) ...`; a words answer stays words (`True`, `See the hints`).
- Copy the entries of every level block on the page, not only the first; do not skip anything.

## kind = hints

A Hints & Solutions page prints short worked hints in TWO columns. Read the left column top to bottom,
then the right column. For EVERY numbered entry on the page:

```json
{"entries": [
 {"section": "Introductory Exercise N.M", "item_no": 4, "final_value": "10 m/s at 45° below horizontal", "method": "Resolve velocity into components at t = 2 s"},
 {"section": "LEVEL <n> Subjective Questions", "item_no": 7, "final_value": "(a) 2 s (b) 20 m", "method": "Time of flight from vertical motion, then horizontal range"}
]}
```

- `section`: the nearest heading above the entry (copy it; the sequence of item numbers is what the
  machine trusts, so an entry whose heading you are unsure of is still worth copying).
- `final_value`: the final result the printed working reaches (a value with unit, an option letter, or a
  short statement; every part of a multi-part answer); `""` if the hint reaches no final value.
- `method`: one line naming the method the printed hint uses. Do not solve anything yourself.
- An entry that continues from the previous page or into the next one: copy what is on this page.

Ignore page headers, page numbers and any watermark or web address printed across the page.

## Reply

Reply with one line per page: page number, kind, number of entries, and any entry you could not read.
Do not paste JSON.
