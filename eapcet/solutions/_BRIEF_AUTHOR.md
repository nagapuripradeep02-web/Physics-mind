# Authoring brief — worked solutions for TG EAPCET physics questions

You write the worked solution for each of ~15 real past-exam physics questions from ONE chapter.
Your dispatch names your SLICE file. Everything else is here.

Input:   the slice file named in your dispatch, under `eapcet/solutions/_slices/`
Output:  `C:\Tutor\physics-mind-eapcet-corpus\eapcet\solutions\<question_id>.json` — one file per question
Refusal: `C:\Tutor\physics-mind-eapcet-corpus\eapcet\solutions\_refusals\<question_id>.json` — instead of a solution

**Write each file immediately after you finish that question, before starting the next one,
and before your final reply.** Agents that wrote everything at the end have lost all of it to
a session cap. A file on disk is the only deliverable that counts.

## You do not have the answer, and you must not go looking for it

Your slice carries the question, the four options, the chapter and the year. It carries no
answer. There are files in this repository that hold the official key. **Do not open
`eapcet/bank/`, `eapcet/keys/`, `eapcet/pool/`, or any other agent's solution file.**

Your solution is only worth having because it is independent. It will be checked against the
official key by a machine after you finish. If you could see the key, that check would be a
rubber stamp; because you cannot, it is a real test — of you, and of the key, which this
corpus has already caught being wrong four times. Where you and the key disagree, a human
looks. That is the whole design.

## Method, per question

1. Read the question and the four options. Solve it with your own working.
2. **Compute every number with python** (plain arithmetic or sympy). Quote the number you
   computed, to the precision the options need. Never do the arithmetic in your head. A pure
   recall question (the range of the weak force) has no number to compute; say so in one line
   of your reply and move on. Name every scratch file with your agent label
   (`W02-A-p1-04_q091.py`): the scratchpad is shared with the other agents of your wave, and
   a generic name gets overwritten mid-run.
3. Pick the option whose text equals your result. Then write the file.
4. If your result equals **no** option, do not pick the nearest one. Write a refusal file
   naming the value you reached. One exception, for numerical questions whose data is
   rounded by the exam itself (g = 9, π = 3, a density to one figure): when your computed
   value ROUNDS to one printed option and the next-nearest option is at least twice as far
   away, that option is the answer — state the computed value and the rounding in the last
   step ("v = 0.53 mm/s, which rounds to 0.5 mm/s") and put the option's printed text in
   `final_answer.value`. A value that sits between two options is still a refusal. A forced match is worse than a refusal: it puts a wrong
   solution in front of a student with a confident face on it.
5. If **two** options are both consistent with your result (a unit ambiguity, a sign
   convention the question leaves open), write a refusal that names both.
6. If the text says "as shown", "the figure", "the given circuit", or otherwise cannot be
   solved without a drawing you do not have, write a refusal with reason `figure_needed`. Every
   question in your slice was selected as needing no figure; a refusal here is a finding about
   the selection, not a failure of yours.
7. Every solution you write must carry `"confidence": "sure"`. If you cannot honestly say that,
   it is a refusal, not a solution. There is no `"medium"`.

## The solution file — exact shape

```json
{
 "schema": "eapcet_solution_v1",
 "question_id": "tg_eapcet_2023_20230512_fn_q087",
 "approach": "Velocity is the time derivative of displacement, and the work done equals the change in kinetic energy.",
 "steps": [
  {"text": "Differentiate the displacement to get the velocity.",
   "equation": "v = ds/dt = d(t³/3)/dt = t²"},
  {"text": "Find the velocity at the start and at the end of the two seconds.",
   "equation": "at t = 0, v = 0; at t = 2 s, v = 4 m s⁻¹"},
  {"text": "The work done by the force equals the gain in kinetic energy.",
   "equation": "W = ½mv² − 0 = ½ × 3 × 4² = 24 J",
   "why_this_step": "The work-energy theorem holds for the net force, and here the given force is the only one doing work."}
 ],
 "final_answer": {"option": 4, "value": "24 J"},
 "confidence": "sure",
 "common_mistakes": [
  {"option": 1, "text": "Taking the force at t = 2 s as constant over the whole motion and multiplying it by the displacement gives 12 N × 8/3 m = 32 J."},
  {"option": null, "text": "Leaving out the half in ½mv², which gives 48 J."}
 ],
 "concept_tags": ["work-energy theorem", "velocity from displacement"],
 "difficulty": "easy",
 "mistake_type_hint": "application",
 "authored_by": {"model": "sonnet", "wave": 1, "agent": "W01-A-p1-05", "at": "2026-09-09T10:00:00+05:30"}
}
```

A second example, a conceptual one:

```json
{
 "schema": "eapcet_solution_v1",
 "question_id": "tg_eapcet_2022_20220718_an_q096",
 "approach": "A hole in a sheet expands exactly like the metal that would fill it, so its diameter grows by the same fraction as any length.",
 "steps": [
  {"text": "Write the change in temperature.",
   "equation": "ΔT = 230 − 30 = 200 K"},
  {"text": "Apply linear expansion to the diameter, treating the hole as if it were a disc of the same metal.",
   "equation": "d′ = d(1 + αΔT) = 5 × (1 + 2×10⁻⁵ × 200)",
   "why_this_step": "Every length in the sheet, including the edge of the empty circle, scales by the same factor."},
  {"text": "Evaluate.",
   "equation": "d′ = 5 × 1.004 = 5.02 cm"}
 ],
 "final_answer": {"option": 2, "value": "5.02 cm"},
 "confidence": "sure",
 "common_mistakes": [
  {"option": null, "text": "Expecting the hole to shrink because the metal around it expands inward. Every length scales up, so the hole grows."},
  {"option": 4, "text": "Using 2αΔT, the area coefficient, on a diameter gives 5.04 cm."}
 ],
 "concept_tags": ["thermal expansion", "expansion of a hole"],
 "difficulty": "easy",
 "mistake_type_hint": "concept",
 "authored_by": {"model": "sonnet", "wave": 1, "agent": "W01-A-p1-11", "at": "2026-09-09T10:00:00+05:30"}
}
```

Field by field — every one is used by the product or by the gate, and **no other key is allowed**:

- `schema` — exactly `"eapcet_solution_v1"`.
- `question_id` — copied from the slice; it is also the file name.
- `approach` — one sentence, at most 30 words: the idea that solves it. The first thing a
  student who got it wrong will read.
- `steps` — 2 to 8 objects, in order. `text` (at most 60 words) says what this step does;
  `equation` (optional) shows it in real Unicode — ½ ² ³ ⁻¹ × − √ π θ Δ μ °; `why_this_step`
  (optional) is the one line a student sees on tapping "why?". Never ASCII maths ("^2", "sqrt",
  "->", "deg", "x10^-5"). Derivative slashes (`ds/dt`, `dv/dx`) and fraction slashes (`47/30`)
  are fine — they are the textbook's own notation. A variable or fractional exponent has no
  single glyph: write `R^(3/2)` only inside `final_answer.value` when the option prints it
  that way; in a step, say it in words or with a named helper (`let m = t/2T, then 2²ᵐ`).
  **The last step states the final answer in full**, every number of a compound answer
  included ("4 beats produced and 2 heard per second"); the gate reads the last two steps for
  the final value and rejects a solution that reaches it earlier and drifts.
- `final_answer.option` — 1 to 4. `final_answer.value` — the option's text as you computed
  it, for example `"24 J"` or `"4n/(1+n)²"`. The gate compares it against the option's printed
  text, so write the same units and the same form.
- `confidence` — `"sure"`, or write a refusal instead.
- `common_mistakes` — 0 to 3 objects, each at most 35 words. `option` is the wrong option that
  mistake leads a student to, or `null` when it does not land on a printed option. A mistake
  must be an error a student actually makes on THIS question, not a generic warning, and
  **never a valid alternative method** — condemning correct work was the single commonest
  defect in the Answer Book audits. **Compute every mistake route in python before writing
  it**: when the entry names an `option`, the wrong working in its text must land exactly on
  that option's printed value, and the text must describe the error that produces it. The
  wave-1 audits rejected more solutions for a mistake entry that does not reach its option
  than for any other reason. A route you cannot reproduce is left out, not guessed; an entry
  with `option: null` is honest and welcome when the slip lands on no printed option — but a
  slip that lands on a printed option up to SIGN (your route gives −2av², an option prints
  2av²) has found the distractor the examiner built for it, so name that option. For
  options made of statements ("a and c are true"), the entry must account for every
  statement the wrong option asserts, not one of them.
- `concept_tags` — 1 to 4 short strings naming the physics used.
- `difficulty` — `"easy"`, `"medium"` or `"hard"` for a student who has learnt the chapter.
- `mistake_type_hint` — where most students go wrong on it: `"concept"` (they do not know the
  idea), `"calculation"` (they know it and slip), or `"application"` (they know the idea and
  cannot see that it applies).
- `authored_by` — `{"model", "wave", "agent", "at"}`; copy `wave` and `agent` from your dispatch.

The refusal file:

```json
{"question_id": "tg_eapcet_2024_20240509_an_q101",
 "reason": "no_option_matches | two_options_fit | figure_needed | question_contradicts_itself",
 "options_reached": ["my value 3.2 × 10⁻³ m; nearest printed 3.0 × 10⁻³ m"],
 "authored_by": {"model": "sonnet", "wave": 1, "agent": "W01-A-p1-05", "at": "..."}}
```

## Plain English is a rule, stated as a test

Every string in `approach`, `steps` and `common_mistakes` must be plain, literal English that a
Class-11 student with textbook English reads without asking what a word means. Physics
vocabulary is the plain vocabulary — "kinetic energy", "coefficient of restitution", "latent
heat" are fine. What is not fine:

- idioms and metaphors: no "the trick is", "the key is", "nail it", "a breeze", "in the bag";
- personification: a force does not "want" anything, a formula does not "know", energy does
  not "decide"; write what happens;
- filler that sneers: no "simply", "obviously", "of course", "just" (the exam's own phrase
  "just completes the vertical circle" is a technical condition and may be quoted; the ban is
  on conversational filler);
- markdown: no `**bold**`, no `# headings`, no `- bullets`, no backticks. The page prints your
  words exactly as typed.

A machine scans for the listed idioms and for markdown and rejects the file. The rest is
read by a second agent and then by a person.

## Check the brief, not only your work

Compare your first finished solution against the two examples above. If you think the brief
is wrong somewhere — a limit that cannot be met, a rule that fights the physics, an example
with an error in it — say so in your reply. The brief is the highest-leverage place for a
defect to live, because every solution inherits it.

## Reply

Reply with only: solutions written (count), refusals written (count and their reasons), and
any question id that gave trouble, one line each. Do not paste JSON.
