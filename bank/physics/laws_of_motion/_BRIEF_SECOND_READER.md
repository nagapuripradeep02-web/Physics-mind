# Second-reader brief — an independent answer to each laws-of-motion item

You are the SECOND READER. For each of ~12 items (Class 11, JEE Main level) you solve the problem
yourself and report only the final result. A machine compares your result with an author's solution
written by a different model and with the printed answer; where readers disagree a human looks. Your
value is your independence — you must not see the author's work or the printed answer, and you must
not go looking for either.

Input:   the slice file named in your dispatch (under `pdfs/books/.../laws_of_motion/_slices/`)
Output:  the `out` path of each item — one small JSON file per item, written immediately after that item

## What you may open

Your slice, and for an exercise item the `crop` image path it names (the printed original; read it for
the figure and to check the transcript). Nothing else under `pdfs/`: never `key.json`, `hints.json`,
`transcripts.jsonl`, and never anything under `bank/physics/laws_of_motion/_solutions/`. Worked examples
come as text only, on purpose — their crop shows the printed solution.

## Method

1. Read the question, its options if any, and the figure description (open the crop for exercises).
   Solve it with your own working. Use only Class 11–12 methods (NCERT plus what JEE Main coaching
   teaches: free-body diagrams, Newton's laws, constraint equations, pseudo force in an accelerating
   frame, friction, equations of motion, vectors, calculus as taught in Class 11–12). Never Lagrangian or Hamiltonian mechanics, Laplace transforms, Jacobians, tensors.
2. **Compute every number with python** (plain arithmetic or sympy); never in your head. Name every
   scratch file with your agent label (`W01-B-lom-03_item.py`); the scratchpad is shared.
3. Report the result:
   - `final_option`: 1–4 = the option whose text equals your result; `0` if no option matches; `null`
     when the item has no options. For an assertion–reason item the options are: (1) both true and
     the reason explains the assertion; (2) both true but the reason does not explain it; (3) assertion
     true, reason false; (4) assertion false, reason true.
   - `final_value`: the result with its unit, every part of a multi-part answer as `"(a) ..., (b) ..."`;
     for a conceptual item the statement; for a "prove/show" item the expression reached. Unicode maths.
   - `method`: one line naming the method.
   - `solvable`: false if the item cannot be solved from what is given (say why in `method`).
4. Do not round to the nearest option: if your value equals no option, report `final_option: 0` and
   your value. One exception: when the data is rounded by the book itself (g = 10, π = 3) and your
   value rounds to one option with the next-nearest at least twice as far, take it.

## The file — exact shape

```json
{"item_id": "lom_3f9a1c02", "final_option": 2, "final_value": "5 s", "method": "Vertical motion with u sin θ upward, s = −70 m, solve the quadratic", "solvable": true}
```

No other key. Never name any book, author, page or example number.

## Reply

Reply with only one line per item: item id, option, value. Do not paste JSON. If the brief is wrong
somewhere, say so.
