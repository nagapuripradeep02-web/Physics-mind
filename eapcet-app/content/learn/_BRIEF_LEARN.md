# Learn pack brief — writing one topic of lessons for the EAPCET Physics app

You write ONE topic of "Learn and practice" lessons for Motion in a Straight Line (chapter key
`p1-02`, first-year physics, Telangana EAPCET). A lesson is one idea a student reads in a minute,
checks with one belief question, then applies on three basic questions. These are NOT exam
questions: small numbers, one step of thinking, no tricks, no simulations, no pictures.

Your dispatch names your topic, its subtopics and the output file. Write the file as soon as it
is complete, before your final reply. Read nothing else: no bank, no pool, no solution files.
Write every question yourself; never reuse a past-paper question you remember.

## Output: one JSON file, one topic object

```json
{
  "key": "uniform_acceleration",
  "title": "Uniform acceleration",
  "subtopics": [
    {
      "key": "nth_second",
      "title": "Distance in the nth second",
      "shapes": ["nth_second_distance"],
      "concept": {
        "lines": ["5 to 8 short lines, one idea each, plain English, ≤ 160 characters"],
        "formula": { "text": "Sₙ = u + a(2n − 1)/2", "meaning": "one line: what each symbol is, ≤ 120 characters" },
        "example": {
          "given": "u = 2 m/s, a = 2 m/s². Distance in the 3rd second?",
          "steps": [ { "text": "Put n = 3 in the formula.", "equation": "S₃ = 2 + 2(2×3 − 1)/2" },
                     { "text": "Work it out.", "equation": "S₃ = 2 + 5 = 7 m" } ],
          "answer": "7 m"
        }
      },
      "check": {
        "stem": "One question about the idea, no numbers. ≤ 300 characters.",
        "options": ["2 to 4 short statements", "…"],
        "answer": 2,
        "why_right": "one line, ≤ 200 characters",
        "why_wrong": { "1": "one line for EVERY wrong option, keyed by its number" }
      },
      "apply": [
        { "variants": [ { "id": "lq_p1-02_nth_second_01", "stem": "…", "options": ["…", "…", "…", "…"], "answer": 3,
                          "difficulty": 1,
                          "routes": [ { "id": "r",  "text": "I put n into the nth second formula" },
                                      { "id": "m0", "text": "I found the total distance in n seconds", "type": "concept", "option": 1,
                                        "fix": "2 or 3 lines: what went wrong and the step that fixes it, ≤ 240 characters" },
                                      { "id": "m1", "text": "…", "type": "calculation", "option": 2, "fix": "…" },
                                      { "id": "m2", "text": "…", "type": "application", "option": 4, "fix": "…" } ] } ] },
        { "variants": [ { "…": "difficulty 2" } ] },
        { "variants": [ { "…": "difficulty 3" } ] }
      ]
    }
  ]
}
```

Keys: `key` is `[a-z0-9_]`, ≤ 50 characters, exactly the subtopic keys your dispatch names.
`shapes` are exactly the shape keys your dispatch names. Question ids are
`lq_p1-02_<subtopic_key>_<two digits>`, unique. One variant per apply slot is enough; write a
second only when it costs you nothing. Use the field names above and no others.

## Rules the machine checks (a file that fails is rejected)

1. **Plain English (Rule 41).** Basic literal words a Class-11 student with textbook English
   understands. No idioms, no metaphors, no personification ("the ball wants"), no "simply",
   "obviously", "just", "the trick is". Physics words are fine: velocity, acceleration, displacement.
2. **Every wrong option has a route.** Each question has exactly one `"r"` route and one `m` route
   per wrong option (`option` = that option's number, never the answer). Types: `concept` (the
   physics belief is wrong), `application` (right physics, wrong use of it on this question),
   `calculation` (right method, wrong arithmetic or algebra), `careless` (misread or sign slip).
3. **Route phrases** are what the student would say they DID, before knowing it was wrong: start
   with "I ", at most twelve words, no number of two or more digits (write "the given speed",
   not "20"), not equal to any option or concept line, all different within a question. Never a
   verdict word ("I wrongly", "I forgot", "by mistake") and never a hindsight verb ("I dropped",
   "I skipped", "I left out", "I missed", "I swapped": a student does not know that at the
   time). Never "X, not Y" or "X instead of Y" or "X rather than Y" naming the right quantity
   or method beside the wrong one: write only what the student did. Test every wrong route
   against the right answer's working: if a student who got it right could honestly say it too
   (for example "I found the total time" when the right working finds the total time and
   halves it), the route is HARMFUL; rewrite it. Make the named mistake yourself and confirm it
   gives exactly the option it points at.
4. **Difficulty rises** 1 → 2 → 3 across the three slots: slot 1 is the formula used once with
   the numbers given; slot 2 needs one conversion or one rearrangement; slot 3 needs two steps.
   All three stay basic: integers or simple decimals, g = 10 m/s², SI units written as m, m/s,
   m/s², s.
5. **Options** are four short strings (≤ 80 characters), one correct, the wrong three each
   reachable by its named mistake. Vary which option number is correct across questions.
6. **Concept card**: 5 to 8 lines, each one idea; the formula in Unicode math (superscripts ², ³,
   subscripts ₁ ₂ ₙ, the minus sign −, ×, no LaTeX, no markdown); one worked example with
   small numbers in 2 to 4 steps ending in an answer line. No pictures, no "imagine a ball".
7. **Check it** asks about the belief, with no numbers in the stem; 2 to 4 statement options;
   `why_wrong` has a line for every wrong option.
8. **Never claim readiness.** No "exam ready", "master", "you will score". A lesson says what it
   is: one idea and three basic questions.
9. Sizes: stems ≤ 300 characters, lines ≤ 160, fixes ≤ 240, meaning ≤ 120, formula ≤ 80.

## Method

For each subtopic: write the concept card first, then the check, then the three questions in
order of difficulty. For each question, solve it yourself, then write the three wrong answers by
actually making each named mistake, so the option and its route agree. Read the whole file once
as a student would before you finish.

Reply with only: the file written, the subtopics written, questions per subtopic, and any rule
you could not satisfy (say which and why). Do not paste JSON.
