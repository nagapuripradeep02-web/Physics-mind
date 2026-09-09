# Shapes brief — naming what one chapter of TG EAPCET physics asks

You read every question the exam has asked from ONE chapter and name its shapes: the 5 to 12
kinds of question it asks, each with a short label a student will read on their result screen.
Your dispatch names your chapter key. Everything else is here.

Input:   `C:\Tutor\physics-mind-eapcet-corpus\eapcet\pool\_shapes_input\<chapter_key>.json`
Output:  `C:\Tutor\physics-mind-eapcet-corpus\eapcet\pool\_shapes_proposed\<chapter_key>.json`

Write the output file as soon as it is complete, before your final reply. A file on disk is the
only deliverable that counts.

## You do not have the answer, and you must not go looking for it

Your input carries every kept question of the chapter — id, year, stem, four options, and
whether it is in the pool — and nothing else. It carries no answer. **Do not open
`eapcet/bank/`, `eapcet/keys/`, `eapcet/pool/physics_pool_v1.json`, the release file, or any
solution file.** You are naming what is asked, not solving it, and a reader who has seen the
key stops being independent of it.

## What a shape is

A shape is what the exam asks, phrased so a student recognises their own question in it: the
quantity wanted and the situation it is set in. "Distance in a given interval of free fall",
"Average velocity from an x(t) equation", "Assertion and reason on velocity and acceleration".
Two questions have the same shape when a student who can do one can do the other with the
numbers changed. A shape is not a topic ("free fall" is a topic — it holds four shapes here),
not a method ("use v² = u² + 2as" is a route, not a shape), and not a difficulty.

The machine has already grouped stems that are the same question with the numbers changed
(`clusters` in your input). It groups almost nothing in most chapters: the pool was selected to
take one question per shape, so the grouping is yours to do, by reading.

## Method

1. Read every question in the input — the singletons as well as the clusters. The shapes are
   for the whole chapter, not only for the 15 pool questions; the exam re-asks shapes across
   years, and a wave-2 pool will add questions that must land on a shape you named now.
2. Write 5 to 12 shapes. Fewer than 5 means the labels are topics; more than 12 means they are
   questions. Every shape must hold at least one POOL question (`in_pool: true`), or the gate
   refuses it.
3. Assign every pool question to exactly one shape. A pool question that fits no shape goes to
   the chapter's `other` shape, whose label is the chapter name itself — use it when honest,
   never to avoid naming a shape that three questions share.
4. Name every bank question you read into a shape too, in `bank_assignments`, so the founder can
   see that the list covers the exam and not only the pool. A bank question may sit in `other`.

## The output file — exact shape

```json
{
 "chapter_key": "p1-02",
 "chapter": "Motion in a Straight Line",
 "shapes": [
  {"key": "free_fall_interval_distance",
   "label": "Distance in a free-fall interval",
   "definition": "A body falls from rest; the distance or ratio of distances covered in named seconds or intervals."},
  {"key": "position_from_velocity_equation",
   "label": "Position from a velocity equation",
   "definition": "v(t) is given as a polynomial; integrate for position or distance over an interval."},
  {"key": "other",
   "label": "Motion in a Straight Line",
   "definition": "A question of this chapter that fits no shape above."}
 ],
 "assignments": {
  "tg_eapcet_2021_20210804_an_q083": "free_fall_interval_distance",
  "tg_eapcet_2021_20210804_an_q084": "position_from_velocity_equation"
 },
 "bank_assignments": {
  "tg_eapcet_2021_20210805_an_q083": "free_fall_interval_distance"
 },
 "authored_by": {"model": "sonnet", "wave": 1, "agent": "W01-S-p1-02", "at": "2026-09-09T10:00:00+05:30"}
}
```

- `key` — snake_case, unique in the chapter, stable: the app stores results against it.
- `label` — **at most six words**, plain literal English, the student sees it. It is scanned for
  idioms and refused on a hit.
- `definition` — one sentence for the founder and for the next author: what belongs here and
  what does not.
- `assignments` — every pool question id of the chapter, each to one listed key. A missing pool
  question or an unknown key fails the gate. `bank_assignments` covers the rest of the input.
- `authored_by` — `{"model", "wave", "agent", "at"}`; copy `wave` and `agent` from your dispatch.

## Plain English is a rule, stated as a test

A label is read by a Class-11 student with textbook English on the screen that tells them what
they got wrong. Physics vocabulary is the plain vocabulary — "relative velocity", "average
velocity", "free fall" are fine. What is not fine: idioms and metaphors ("catch-up problems",
"the classic chase"), personification, and any word that needs explaining and is not a physics
term. No markdown in any string.

## Check the brief, not only your work

If you think the brief is wrong somewhere — a limit that cannot be met for this chapter, a
definition of shape that fights what the exam actually does — say so in your reply. The brief is
the highest-leverage place for a defect to live, because every chapter inherits it.

## Reply

Reply with only: the chapter key, the number of shapes, each shape's key and label with its
count of pool questions on one line, how many pool questions went to `other`, and any point
where this brief seems wrong. Do not paste JSON.
