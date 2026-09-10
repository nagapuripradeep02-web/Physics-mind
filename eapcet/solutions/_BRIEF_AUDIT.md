# Audit brief — worked solutions for TG EAPCET physics questions

You audit worked solutions written by another agent who never saw the official key — usually
~15 from ONE chapter, sometimes a handful of small slices from several chapters. Your dispatch
names your slice file or files. Everything else is here.

Input:   the slice file named in your dispatch, under `eapcet/solutions/_audit_slices/`
Output:  `C:\Tutor\physics-mind-eapcet-corpus\eapcet\solutions\_audit\<audit_file>` — one file
         per item, named EXACTLY by the item's `audit_file` field

**Write each file immediately after you finish that item, before starting the next one.**
Agents that wrote everything at the end have lost all of it to a session cap.

## What you see, and what you must not go looking for

Each item carries the question, its four options, the year, and the solution's content:
`approach`, `steps`, `final_answer`, `common_mistakes`, `concept_tags`, `difficulty`,
`mistake_type_hint`. You do not see the official key, the machine gate's verdict, or who wrote
it. **Do not open `eapcet/bank/`, `eapcet/keys/`, `eapcet/pool/`, `eapcet/solutions/_gate/`,
any solution file, or any other agent's audit.** Your option must be your own; it is the third
independent reading of a key this corpus has already caught being wrong four times.

**Some items in your slice carry a deliberate error, planted to measure you.** You are not told
which. An auditor that passes a planted error has shown that its passes mean nothing, and every
verdict it wrote is discarded. Read every item as if it were the planted one.

## Method — in this order, per item

1. **Solve it yourself first.** Every slice comes with a `.questions.json` twin holding ONLY
   the questions and options. Open that file first, solve every item, write your options and
   values to a scratch file named with your agent label (`W02-U-p1-04_solves.txt` — the
   scratchpad is shared, a generic name gets overwritten), and only then open the full slice.
   Reach your own option and value BEFORE reading the solution's steps. Compute every number with python (write the
   script to a file and run it; a multi-line `-e` string dies silently in this shell). Write
   your option and value down — they go into the output as `auditor_option`, `auditor_value`.
2. **Then read the steps, line by line.** Every `equation` must follow from the one above it:
   signs, powers of ten, units, which quantity is squared, which is halved, radians or degrees,
   the direction convention, the value of g used. A line that is false is a finding even when
   the final answer comes out right — a student copies lines.
3. **Then read every prose field.** `approach`, each `text`, each `why_this_step`, each
   `common_mistakes.text`. Ask of each: is this TRUE for THIS question?
   - A `common_mistakes` entry must be a genuine error a student makes here. **Condemning a
     correct alternative method is the commonest defect in this bank's audits** — a valid
     alternative formula called wrong, an exact value called "rounding". That is a WRONG.
   - An entry whose `option` does not match the number its text says it produces (the text
     computes 32 J, option 1 prints 32 J, but `option` says 3), or whose stated cause cannot
     produce that number at all (a "wrong sign" that gives 10¹⁶ tagged to the 10¹⁰ option).
     An entry with `option: null` is legitimate when its slip lands on no printed option; it is
     a finding only if the text's number does match a printed option after all.
   - **In a STRICT chapter (your dispatch says so; today p1-02)** every wrong option carries an
     entry, so the list has exactly three, and an entry may be marked `"distractor": true`,
     meaning no method reaches that option. Audit a distractor entry the other way round: it
     is WRONG if you can find a plausible student slip that DOES land on that option (the
     author should have described it), and its text must say what the option is not. A
     fabricated slip on a non-distractor entry — a route no student takes, written to fill the
     option — is WRONG: the app would tell a student they made an error nobody makes.
     Prose on an UNFLAGGED entry that reads like a distractor ("no slip reaches…") is audited
     as a distractor entry whose flag is missing: WRONG. Inside a distractor text, grade the
     supporting arithmetic: a near-miss slip whose stated value is false (the text says a slip
     gives 64% and it gives 40%) is WRONG; a text that merely says "nothing lands here"
     without naming the near-miss slips is WEAK; a right label on right arithmetic that reads
     awkwardly is WEAK at most.
   - For options made of statements ("b and d are true"), the entry must account for every
     statement the wrong option asserts; a route that explains one of two is WEAK.
   - A slip that lands on a printed option UP TO SIGN (the route gives −2av², option 4 prints
     2av²) has found the distractor built for it: the entry should name that option, and an
     `option: null` there is WEAK, not a pass.
   - A MISSING mistake — the list is empty, or non-empty but leaves out the paper's obvious
     distractor (R/√3 printed beside the R/√2 answer) — is WEAK when the slip lands on a printed
     option by the rounding rule below, whatever else the list holds. An empty list on its own
     is a choice the author brief allows. For an omission the `quote` is `null` and the `field`
     is the bare array name; never quote a neighbouring entry as if it were the defect.
   - An `equation` holding a short sentence on a pure recall item (the range of a force) is not
     a finding; the field is optional and the text is the content.
   - One finding per defective FIELD: a wrong final value and the step line that produced it
     are two findings with two `field` paths. For a whole-array field write the bare name
     (`common_mistakes`), for one entry the index (`common_mistakes[1].text`).
   - The solution contradicting ITSELF is the highest-yield signature: an approach that names
     one principle and steps that use another; a `why_this_step` that disagrees with its own
     equation; a `final_answer.value` that is not what the last step reached.
   - `mistake_type_hint` and `difficulty` are judgement calls; disagree only when clearly off
     (a one-line recall question marked `hard`), and file it as WEAK.
4. **Plain language.** Every reader-facing string must be literal textbook English: no idioms
   ("the trick is", "nail it"), no metaphors, no personification of forces or formulas, no
   "simply / obviously / just", no markdown. File as WEAK.

## Grades

- **HARMFUL** — wrong physics a student would copy into the exam and lose the mark for: a wrong
  final option, a false printed equation, a wrong formula, a `common_mistakes` entry that
  condemns the correct method (the student then abandons a right answer).
- **WRONG** — incorrect but not exam-costing: a false reason in `why_this_step`, an `approach`
  that misexplains, a mistake entry pointing at the wrong option, a wrong unit in a line whose
  number is right.
- **WEAK** — quality: plain-language register, a step whose text says nothing AND carries no
  equation (`"Evaluate."` beside an equation is fine: the equation is the content), duplicated prose,
  a physically imprecise statement whose numerical consequence is nil on this question (an
  `approach` that omits a 0.1% term the equation keeps), a vague mistake entry that is a generic warning rather than an
  error made on this question, an off `difficulty` or `mistake_type_hint`.

False algebra INSIDE a `common_mistakes` entry (a wrong square root in the text of a mistake) is
WRONG, not HARMFUL: the entry is labelled as the error route, so a student does not copy it as
working. It becomes HARMFUL only when the entry condemns the correct method.

## Traps that produced false findings before

- A solution that uses a different valid method from yours is not wrong. Check its lines on
  their own terms before comparing with your route.
- g = 10 m s⁻² and g = 9.8 m s⁻² are both used in this exam; the options tell you which was
  meant. Not a finding unless the options only fit the other value.
- The value text is compared to the printed option by a machine already; a solution writing
  `"24 J"` where the option prints `"24 joule"` is not your finding.
- Before proposing replacement wording, check it against THIS question. A fix that is itself
  wrong is worse than no finding.
- Do not grade the exam's question. If the question is defective (no option fits your own
  solve), say so in `question_defect` and grade the solution on how it handled that. An option
  that is inconsistent with itself (₁₅Si³¹ pairs Z = 15 with silicon) is a question defect too;
  record it, and it changes no verdict. A
  computed value that only ROUNDS to the printed option (0.53 mm/s against a printed
  0.5 mm/s, with the next option 1.5 mm/s) is a match when the solution says so in its last
  step; it is a finding only if the solution hides the rounding or the next option is close. A
  solution that DECLARES an assumption the stem omits (isobaric, rigid walls) and reaches the
  only option that fits is not a finding; one that imports the assumption silently is WEAK.

## Output — one file per item, exact shape

```json
{
 "question_id": "tg_eapcet_2023_20230512_fn_q087",
 "item_sha": "copied from the item",
 "auditor_option": 4,
 "auditor_value": "24 J",
 "findings": [
  {"grade": "wrong",
   "field": "common_mistakes[0].text",
   "quote": "the exact offending text, verbatim",
   "note": "why it is wrong for this question, one or two sentences",
   "fix": "replacement wording you have checked, or null"}
 ],
 "verdict": "wrong",
 "question_defect": "a defect in the QUESTION itself (options in cm for a product of two lengths; a misprinted unit), or null; several defects go in one string separated by ' | '",
 "notes": "anything else: a convention the exam leaves open, what you checked and did not file, or null",
 "audited_by": {"model": "opus", "wave": 1, "agent": "<the agent label in your dispatch>", "at": "<ISO-8601, +05:30>"}
}
```

- `question_defect` is about the exam's question, never about the solution; it is collected for
  the founder separately and does not change the verdict.

- `field` names one field: `approach`, `steps[2].equation`, `steps[0].why_this_step`,
  `final_answer`, `common_mistakes[1].text`, `difficulty`, `mistake_type_hint`.
- `verdict` is the worst grade among the findings: `harmful` > `wrong` > `weak` > `ok`.
  **`ok` requires zero findings AND `auditor_option` equal to the solution's option.** If your
  option differs from the solution's, that is a HARMFUL finding on `final_answer` — write it,
  even if you are unsure which of you is right; a human decides, and needs both readings.
- Copy `wave` and `agent` from your dispatch. `item_sha` is copied from the item; the file name
  is the item's `audit_file`, exactly.

## Reply

Reply with only: items audited (count), verdict counts (ok / weak / wrong / harmful), any item
where your option differed from the solution's (id, yours, theirs), and any point where this
brief seems wrong. Do not paste JSON. Do not edit any solution file.
