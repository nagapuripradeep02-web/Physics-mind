# Authoring brief — worked solutions for the kinematics bank

You write the worked solution for each of ~15 kinematics problems (Class 11, JEE Main level). Your
dispatch names your SLICE file. Everything else is here.

Input:   the slice file named in your dispatch (under `pdfs/books/dcp_m1/kinematics/_slices/`)
Output:  `C:\Tutor\physics-mind-eapcet-corpus\bank\physics\kinematics\_solutions\<item_id>.json` — one file per item
Refusal: `C:\Tutor\physics-mind-eapcet-corpus\bank\physics\kinematics\_solutions\_refusals\<item_id>.json` — instead of a solution

**Write each file immediately after you finish that item, before starting the next one, and before
your final reply.** Agents that wrote everything at the end have lost all of it to a session cap. A
file on disk is the only deliverable that counts.

## You do not have the answer, and you must not go looking for it

Your slice carries the question text, its options if any, a description of its figure with every
value readable on it, and for exercise items the path of a crop image you may open with the Read tool.
It carries no answer. The source prints an answer and a worked hint for every one of these items,
and both are on this disk. **Do not open anything under `pdfs/books/` except the crop path named in
your slice, and never `key.json`, `hints.json`, `transcripts.jsonl`, `items_manifest.json`, or any
other agent's file under `_solutions/`.** Worked examples are given to you as text only, on purpose:
their crop shows the printed solution.

Your solution is only worth having because it is independent. A machine checks it against the
printed answer and against a second independent reading after you finish. Where the readers disagree,
a human looks. That is the whole design.

## Method, per item

1. Read the question, the options if any, and the figure description. Solve it with your own working.
2. **Use only Class 11–12 methods** — the NCERT syllabus plus what JEE Main coaching teaches
   (equations of motion, graphs, relative velocity, vectors, calculus as taught in Class 11–12,
   L'Hôpital, standard approximations). Never Lagrangian or Hamiltonian mechanics, Laplace or Fourier
   transforms, Jacobians, tensors, or any university theorem invoked by name. A machine judge reads
   every solution for this.
3. **Compute every number with python** (plain arithmetic or sympy). Never do the arithmetic in your
   head. Name every scratch file with your agent label (`W01-A-kin-03_item.py`); the scratchpad is
   shared with the other agents of your wave.
4. For an item with options, pick the option whose text equals your result. For an item without
   options, `final_answer.option` is `null` and `final_answer.value` states the result in full with
   its unit — every part of a multi-part answer (`"(a) 25 m, (b) 5 s"`). For an assertion–reason item
   the four options are the standard statements listed in the slice; choose 1–4.
5. If your result equals **no** option, do not pick the nearest one: write a refusal naming the value
   you reached. One exception: when the data is rounded by the book itself (g = 10, π = 3) and your
   value ROUNDS to one option with the next-nearest at least twice as far, take it and say so in the
   last step. Two options both consistent with your result → refusal. A figure description that does
   not let you solve it → refusal with reason `figure_needed`.
6. Every solution you write must carry `"confidence": "sure"`. If you cannot honestly say that, it
   is a refusal. There is no `"medium"`.

## The solution file — exact shape

```json
{
 "schema": "eapcet_solution_v1",
 "question_id": "kin_3f9a1c02",
 "approach": "Distance fallen from rest grows with the square of time, so subtract the distances at the two times.",
 "steps": [
  {"text": "Write the distance fallen from rest as a function of time.", "equation": "d(t) = ½gt²"},
  {"text": "Find the distance at t = 2 s and at t = 3 s.", "equation": "d(2) = 20 m, d(3) = 45 m"},
  {"text": "The distance in the third second is the difference.", "equation": "45 − 20 = 25 m",
   "why_this_step": "The nth-second distance is the total at n seconds minus the total at n − 1."}
 ],
 "final_answer": {"option": null, "value": "25 m"},
 "confidence": "sure",
 "common_mistakes": [
  {"option": null, "text": "Using d = ½gt² with t = 3 s directly gives 45 m, the total distance, not the distance in the third second."},
  {"option": null, "text": "Taking the distance in the third second as 3 × the first-second distance gives 15 m."}
 ],
 "concept_tags": ["free fall", "distance in the nth second"],
 "difficulty": "easy",
 "mistake_type_hint": "application",
 "authored_by": {"model": "sonnet", "wave": 1, "agent": "W01-A-kin-03", "at": "2026-09-11T10:00:00+05:30"}
}
```

Field by field — every one is used by the product or by the gate, and **no other key is allowed**:

- `schema` — exactly `"eapcet_solution_v1"`. `question_id` — the `item_id` from the slice; it is also
  the file name.
- `approach` — one sentence, at most 30 words: the idea that solves it.
- `steps` — 2 to 8 objects, in order. `text` (at most 60 words) says what the step does; `equation`
  (optional) shows it in real Unicode — ½ ² ³ ⁻¹ × − √ π θ Δ °; `why_this_step` (optional) is the
  one line a student sees on tapping "why?". Never ASCII maths (`^2`, `sqrt`, `->`, `deg`, `x10^-5`).
  Derivative and fraction slashes (`ds/dt`, `47/30`) are the textbook's own notation and are fine.
  **The last step states the final answer in full**, every number of a compound answer included; the
  gate reads the last two steps for the final value.
- `final_answer.option` — 1 to 4, or `null` when the item has no options. `final_answer.value` — the
  result as you computed it, with unit, in the same form as the options print it when there are options.
- `confidence` — `"sure"`, or write a refusal instead.
- `common_mistakes` — 0 to 3 objects, each at most 35 words. `option` is the wrong option the mistake
  leads to, or `null` when it lands on no printed option (always `null` for items without options). A
  mistake must be an error a student actually makes on THIS question — **never a valid alternative
  method** — and **you compute every mistake route in python before writing it**: the wrong working
  must produce the number the text names. A route you cannot reproduce is left out, not guessed.
- `concept_tags` — 1 to 4 short strings naming the physics used.
- `difficulty` — `"easy"`, `"medium"` or `"hard"` for a student who has learnt the chapter.
- `mistake_type_hint` — `"concept"`, `"calculation"` or `"application"`.
- `authored_by` — `{"model", "wave", "agent", "at"}`; copy `wave` and `agent` from your dispatch.

The refusal file:

```json
{"question_id": "kin_3f9a1c02",
 "reason": "no_option_matches | two_options_fit | figure_needed | question_contradicts_itself",
 "options_reached": ["my value 3.2 m/s; nearest printed 3.0 m/s"],
 "authored_by": {"model": "sonnet", "wave": 1, "agent": "W01-A-kin-03", "at": "..."}}
```

## Plain English is a rule, stated as a test

Every string in `approach`, `steps` and `common_mistakes` must be plain, literal English a Class-11
student with textbook English reads without asking what a word means. Physics vocabulary is the plain
vocabulary. Not fine: idioms and metaphors ("the trick is", "nail it"); personification (a force does
not "want", a formula does not "know"); filler that sneers ("simply", "obviously", "of course",
"just"); markdown (no `**bold**`, `#`, `-` bullets, backticks). A machine scans for the listed idioms
and for markdown and rejects the file.

Never name the source: no book, author, edition, page or example number anywhere in your text.

## Check the brief, not only your work

If the brief is wrong somewhere — a limit that cannot be met, a rule that fights the physics — say so
in your reply. Every solution inherits the brief.

## Reply

Reply with only: solutions written (count), refusals written (count and their reasons), and any
item id that gave trouble, one line each. Do not paste JSON.
