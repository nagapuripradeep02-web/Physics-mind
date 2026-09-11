# Audit brief — worked solutions for the projectile-motion bank

You audit worked solutions written by another agent who never saw the printed answer. Your dispatch
names your slice file. Everything else is here.

Input:   the slice file named in your dispatch, under `bank/physics/projectile/_audit_slices/`
Output:  `C:\Tutor\physics-mind-eapcet-corpus\bank\physics\projectile\_audit\<audit_file>` — one file per
         item, named EXACTLY by the item's `audit_file` field

**Write each file immediately after you finish that item, before starting the next one.**

## What you see, and what you must not go looking for

Each item carries the question AS THE BANK WILL SERVE IT (our own wording), its options if any, and
the solution's content: `approach`, `steps`, `final_answer`, `common_mistakes`, `concept_tags`,
`difficulty`, `mistake_type_hint`. You do not see the printed answer, the machine gate's verdict, or
who wrote it. **Do not open anything under `pdfs/books/`, `_solutions/`, `_gate/`, or any other
agent's audit.** Your answer must be your own; it is an independent reading of an answer the source
book itself may have printed wrongly.

**Some items in your slice carry a deliberate error, planted to measure you.** You are not told
which. The planted kinds are: a wrong final answer with the last line rewritten to reach it; a number
in a middle line doubled; and — new for this bank — **a question whose text was altered so the
solution no longer solves the problem printed** (one given quantity changed, or a condition such as
"from rest" removed). An auditor that passes a planted error has shown that its passes mean nothing,
and every verdict it wrote is discarded. Read every item as if it were the planted one.

## Method — in this order, per item

1. **Solve it yourself first.** Every slice comes with a `.questions.json` twin holding ONLY the
   questions and options. Open that first, solve every item, write your answers to a scratch file
   named with your agent label, and only then open the full slice. Compute every number with python
   (write the script to a file and run it). Your answer goes into the output as `auditor_option`
   (1–4 or null) and `auditor_value`.
2. **Then read the steps, line by line.** Every `equation` must follow from the one above it: signs,
   which quantity is squared, which is halved, the direction convention, the value of g used. A line
   that is false is a finding even when the final answer comes out right.
3. **Then check that the solution solves THIS question.** Every given quantity the solution uses must
   appear in the question as served, with the same value; every condition the solution assumes
   ("from rest", "uniform acceleration", "upward positive") must be stated or standard. A solution
   that uses a number the question does not give, or ignores one it does, is HARMFUL on `final_answer`.
4. **Then read every prose field.** `approach`, each `text`, each `why_this_step`, each
   `common_mistakes.text`. Ask of each: is this TRUE for THIS question? A `common_mistakes` entry
   must be a genuine error a student makes here; **condemning a correct alternative method is the
   commonest defect** — that is a WRONG. An entry whose stated cause cannot produce the number its
   text names is WRONG. One finding per defective FIELD.
5. **Plain language.** Every reader-facing string must be literal textbook English: no idioms, no
   metaphors, no personification of forces or formulas, no "simply / obviously / just", no markdown.
   File as WEAK. Any mention of a book, author, page or example number is WRONG.

## Grades

- **HARMFUL** — wrong physics a student would copy and lose the mark for: a wrong final answer, a
  false printed equation, a wrong formula, a solution to a different problem than the one served, a
  `common_mistakes` entry that condemns the correct method.
- **WRONG** — incorrect but not exam-costing: a false reason in `why_this_step`, an `approach` that
  misexplains, a mistake entry pointing at the wrong option, a wrong unit in a line whose number is right.
- **WEAK** — quality: register, a step with neither content nor equation, duplicated prose, a vague
  mistake entry, an off `difficulty`, `mistake_type_hint` or `concept_tags` entry.

## Traps that produced false findings before

- A different valid method from yours is not wrong. Check its lines on their own terms.
- g = 10 m s⁻² and g = 9.8 m s⁻² are both used; the question or options tell you which. Not a
  finding unless only the other value fits. When nothing fixes g, a solution that states its choice
  (or gives both values) is fine; record the choice in `notes`.
- An empty `common_mistakes` list is not a finding.
- Before proposing replacement wording, check it against THIS question. A fix that is itself wrong
  is worse than no finding.
- Do not grade the question. If it is defective, say so in `question_defect` and grade the solution
  on how it handled that. When the served text and its figure description conflict, a solution that
  follows one of them WITHOUT saying so is WRONG on the step that picks; one that names the conflict
  and its choice is not a finding.
- Assertion–reason items carry the standard four options (1 both true and the Reason explains; 2 both
  true, no explanation; 3 Assertion true, Reason false; 4 Assertion false, Reason true); `auditor_option`
  is that number.

## Output — one file per item, exact shape

```json
{
 "question_id": "prj_3f9a1c02",
 "item_sha": "copied from the item",
 "auditor_option": null,
 "auditor_value": "25 m",
 "findings": [
  {"grade": "wrong", "field": "common_mistakes[0].text", "quote": "the exact offending text, verbatim",
   "note": "why it is wrong for this question, one or two sentences", "fix": "checked replacement wording, or null"}
 ],
 "verdict": "wrong",
 "question_defect": null,
 "notes": null,
 "audited_by": {"model": "opus", "wave": 1, "agent": "<the agent label in your dispatch>", "at": "<ISO-8601, +05:30>"}
}
```

- `verdict` is the worst grade among the findings: `harmful` > `wrong` > `weak` > `ok`. **`ok`
  requires zero findings AND your answer equal to the solution's.** If your answer differs from the
  solution's, that is a HARMFUL finding on `final_answer` — write it even if unsure who is right.
- Copy `wave` and `agent` from your dispatch. `item_sha` is copied from the item; the file name is the
  item's `audit_file`, exactly.

## Reply

Reply with only: items audited (count), verdict counts (ok / weak / wrong / harmful), any item where
your answer differed from the solution's (id, yours, theirs), and any point where this brief seems
wrong. Do not paste JSON. Do not edit any solution file.
