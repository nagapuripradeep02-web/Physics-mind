# Routes audit brief — checking the types and routes written for verified solutions

You audit routes sidecars written by another agent: a type on every listed mistake, a route
phrase for each mistake that is a route, and the right route of the question — usually ~15 from
ONE chapter, sometimes a handful of small slices from several chapters. Your dispatch names your
slice file or files. Everything else is here.

Input:   the slice file named in your dispatch, under `eapcet/solutions/_audit_slices/` (`…_routes.json`)
Output:  `C:\Tutor\physics-mind-eapcet-corpus\eapcet\solutions\_audit_routes\<audit_file>` — one file
         per item, named EXACTLY by the item's `audit_file` field

**Write each file immediately after you finish that item, before starting the next one.**
Agents that wrote everything at the end have lost all of it to a session cap.

## What you see, and what you must not go looking for

Each item carries the question, its four options, the year, the verified solution's content
(`approach`, `steps`, `final_answer`, `common_mistakes`, `concept_tags`, `difficulty`,
`mistake_type_hint`) and the sidecar under `routes`: `right_route` and a `mistakes` list of
`{index, type, route}` where `index` points into the solution's `common_mistakes`. This audit is
sighted by design — the solution is already verified against the key — but you do not see the
key file, the gate's verdict, or who wrote the routes. **Do not open `eapcet/bank/`,
`eapcet/keys/`, `eapcet/pool/`, `eapcet/solutions/_gate/`, `eapcet/solutions/_routes/`, any
solution file, or any other agent's audit.**

**Some items in your slice carry a deliberate error, planted to measure you.** You are not told
which. An auditor that passes a planted error has shown that its passes mean nothing, and every
verdict it wrote is discarded. Read every item as if it were the planted one.

## What a route is, so you can judge one

The student who got the question wrong is shown a menu — the right route, the routes of the
mistakes that are routes, and "I guessed" — all in the first person, all in one voice, and
asked which way they went. Their tap is checked against the option they picked. So a route is
what a student would say they did before they know it was wrong. A route that gives the
wording away ("I wrongly…", "I forgot…"), or gives the answer away (a number of two or more
digits, the value of an option), or describes something other than its own mistake, breaks the
measurement — that is what you are here to catch.

## Method — in this order, per item

1. **Read the solution first**: the steps (the right route is the earliest step the wrong
   routes do not share — usually step 1), then every
   `common_mistakes` entry. Decide for yourself, before reading the sidecar, what type each
   entry is and what the right route is. Write these down in a scratch file named with your
   agent label (`W01-V-p1-02_types.txt` — the scratchpad is shared, a generic name gets
   overwritten).
2. **Then read the sidecar against your reading.** Per `mistakes` entry:
   - `type` by the definitions — `concept`: the physics belief behind the entry is wrong;
     `application`: the concept is known but applied to the wrong quantity, interval, body or
     frame; `calculation`: the route was right and a number, sign, unit or algebra step went
     wrong (an entry that compounds a wrong formula with a later skipped step is typed by its
     FIRST departure from the right route: the wrong formula makes it `concept` or
     `application`, never `calculation`); `careless`: the question or options were misread; `distractor`: the solution's
     entry is flagged `"distractor": true` (no method reaches that option) — the machine
     forces this pairing, so your question there is only whether the flag itself is honest. A
     `route` must be present exactly when the type is `concept` or `application`; the machine
     has already checked that, so your question is whether the type itself is right.
   - `route` describes THIS entry's `text` — the same error, in the student's voice — and no
     other error, and not the correct method.
   - **In a STRICT chapter (your dispatch says so; today p1-02)** a route is also in student
     words: at most nine, none of "evaluated / integrated the / differentiated the / reversal /
     expression". The machine rejects those; you judge the rest — a phrase a Class-11 student
     would not say about their own working ("I applied the kinematic relation") is WEAK, and
     a phrase that needs the solution to be understood is WEAK.
3. **Then `right_route`.** It must be the earliest step of the solution that the wrong routes
   do not share, in the student's voice — usually step 1, never a generic "I used the
   formula". Where the step-1 reading and the separation reading pull apart, separation wins:
   a `right_route` naming a step every listed mistake also starts with is WRONG, because the
   right solver and the wrong ones would all tap it. `null` is right only for a
   theory or recall question that has no working; on a question with steps that compute, a
   `null` is a finding.
4. **Then the menu as a whole.** Read the right route and the wrong routes together as the
   student would: same voice, same confidence, no route marked as wrong by its wording, no two
   routes a student could not tell apart, no number of two or more digits, no phrase that names
   an option's value. A route that spells out the value an option prints ("I got 2", "I took
   the ratio as 4/9") hands the student an answer at the moment of tapping: WRONG, and a
   `fix` is required.

## Grades

- **HARMFUL** — the diagnosis would be wrong for a student who tells the truth: a wrong route
  phrase that actually describes the correct method (a student who worked it right taps it and
  is told they went wrong); a `right_route` that describes a wrong method; a route that names
  the answer.
- **WRONG** — the label is false: a wrong `type`; a `route` that does not describe its own
  entry; a `right_route` that is a later step or a different method than step 1; a `null`
  `right_route` on a question that has working; wording that marks a route as the wrong one
  ("I wrongly", "I forgot").
- **WEAK** — quality: register (idiom, metaphor, personification, "simply"); a vague route ("I
  used the wrong formula"); two routes too alike to tell apart; a route a student would not say
  in those words.

## Traps

- The solution's `common_mistakes` entry may itself be imperfect; that is not the routes
  author's defect. Grade the type and the route against the entry as written, and put a defect
  in the entry itself into `solution_defect` — it is collected separately and changes no
  verdict.
- A type is a judgement at the boundary (application vs concept on "used the whole time
  instead of the interval"). Disagree only when the definition clearly puts it elsewhere, and
  say which definition; a boundary case you would have typed differently is WEAK at most.
- Before proposing replacement wording, run the phrase tests on it: first person, at most
  twelve words (NINE whitespace tokens in a STRICT chapter — apply the stricter limit to every
  fix you propose), no number of two or more digits, no idiom. A fix that fails them is worse
  than no fix.

## Output — one file per item, exact shape

```json
{
 "question_id": "tg_eapcet_2021_20210804_an_q083",
 "item_sha": "copied from the item",
 "findings": [
  {"grade": "wrong",
   "field": "mistakes[0].type",
   "quote": "the exact offending value or phrase, verbatim",
   "note": "why it is wrong for this question, one or two sentences",
   "fix": "replacement value or phrase you have checked, or null"}
 ],
 "verdict": "wrong",
 "solution_defect": "a defect in the SOLUTION's mistake entries, or null",
 "notes": "anything else: a boundary you decided, what you checked and did not file, or null",
 "audited_by": {"model": "opus", "wave": 1, "agent": "<the agent label in your dispatch>", "at": "<ISO-8601, +05:30>"}
}
```

- `field` names one field of the sidecar: `right_route`, `mistakes[0].type`, `mistakes[1].route`.
  One finding per defective field.
- `verdict` is the worst grade among the findings: `harmful` > `wrong` > `weak` > `ok`.
  **`ok` requires zero findings.**
- Copy `wave` and `agent` from your dispatch. `item_sha` is copied from the item; the file name
  is the item's `audit_file`, exactly.

## Reply

Reply with only: items audited (count), verdict counts (ok / weak / wrong / harmful), any item
you graded harmful (id and why, one line), and any point where this brief seems wrong. Do not
paste JSON. Do not edit any sidecar or solution file.
