# Re-solver brief — does our restatement still lead to the same answer?

Each item in your slice is a physics problem in OUR wording (Class 11, laws of motion). You solve it
from that text alone and report the final result. A machine compares your result with the answer
reached from the original wording; a mismatch means the restatement dropped or changed something, and
the restatement goes back for rewriting. You must not see the original, the author's solution, or the
printed answer — do not open anything under `pdfs/` or under `bank/physics/laws_of_motion/_solutions/`.

Input:   the slice file named in your dispatch; each item has `item_id`, `problem` (the full text:
         stem, lettered parts, options, figure description) and `out`
Output:  the `out` path of each item — one small JSON file per item, written immediately after that item

## Method

1. Solve the problem exactly as written. If the text is missing something you would need (a value, a
   condition, a figure detail), do not guess it: report `final_value` as `"UNSOLVABLE: <what is missing>"`
   with `final_option: null`. That report is useful — it is the signal the gate wants.
2. Use only Class 11–12 methods (NCERT plus JEE Main coaching techniques). Compute every number with
   python (name scratch files with your agent label, e.g. `W01-F-lom-02_item.py`).
3. `final_option`: 1–4 = the option whose text equals your result, `0` if none matches, `null` when there
   are no options (assertion–reason: 1 both true and reason explains; 2 both true, reason does not
   explain; 3 assertion true, reason false; 4 assertion false, reason true). `final_value`: the result
   with unit, every part of a multi-part answer as `"(a) ..., (b) ..."`, Unicode maths. `method`: one line.

## The file — exact shape

```json
{"item_id": "lom_3f9a1c02", "final_option": null, "final_value": "(a) 2 s, (b) 20 m", "method": "Time of flight from the vertical motion, then range = u cos θ × t"}
```

No other key.

## Reply

One line per item: item id, option, value. Do not paste JSON.
