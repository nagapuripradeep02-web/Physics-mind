# Routes brief — typing the mistakes and phrasing the routes of verified solutions

You read ~15 verified worked solutions from ONE chapter and, for each, write a small sidecar
file: a type for every listed mistake, a route phrase for each mistake that is a route, and the
right route of the question. Your dispatch names your SLICE file. Everything else is here.

Input:   the slice file named in your dispatch, under `eapcet/solutions/_slices/` (`…_routes.json`)
Output:  `C:\Tutor\physics-mind-eapcet-corpus\eapcet\solutions\_routes\<question_id>.json` — one file per question

**Write each file immediately after you finish that question, before starting the next one,
and before your final reply.** Agents that wrote everything at the end have lost all of it to
a session cap. A file on disk is the only deliverable that counts.

## What you see, and what you must not go looking for

This pass is sighted by design: each item in your slice carries the question, its four options,
and the verified solution's content — `approach`, `steps`, `final_answer`, `common_mistakes`,
`concept_tags`, `difficulty`, `mistake_type_hint`. The routes are derived from that solution,
not from solving the question again. You still never see the official key file or the bank.
**Do not open `eapcet/bank/`, `eapcet/keys/`, `eapcet/pool/`, `eapcet/solutions/_gate/`,
`eapcet/solutions/_audit/`, or any solution file.** Everything you need is in the slice.

**Never edit a solution file.** The sidecar refers to the solution's mistakes by index; the
solution itself is verified and frozen.

## What a route is

The student who got the question wrong is shown a short menu: the right route, the routes of
the listed mistakes that are routes, and "I guessed" — all in the first person, all in the same
voice — and asked which way they went. Their tap is checked against the option they picked. So
a route is **what a student would say they did, before they know it was wrong**:

- "I treated the next 8 seconds as a fresh fall from rest"
- "I subtracted the first four seconds from the total by twelve" — the right route

It is not a verdict on the student. A student reading the menu must not be able to tell the
right route from the wrong ones by the wording: never "I forgot", "I wrongly", "by mistake",
"I ignored", and never an "X, not Y" contrast that names the right quantity and disowns it ("I used
the total distance, not the distance in each second" tells the student which is right). State what
was done, as the student would. And test every wrong route against the correct working: if a
student who reached the key could honestly say it too (the key's values often share a property
with a wrong rule — equal steps, a constant ratio, a symmetry), it is not a route to that mistake.

## Method, per question

1. Read the solution. Step 1's `text` and `equation` are the right route's content.
2. For every entry of `common_mistakes`, in order, decide its `type`:
   - `concept` — the physics belief behind the entry is wrong (the hole shrinks when the sheet
     expands; zero velocity means zero acceleration).
   - `application` — the concept is known but applied to the wrong quantity, interval, body or
     frame (the right formula on the wrong time interval; g on the wrong body).
   - `calculation` — the route was right and a number, sign, unit, power of ten or algebra step
     went wrong (dropping the ½; squaring the wrong term).
   - `careless` — the question or the options were misread (distance for displacement; the
     ratio inverted at the last line; the option's unit missed).
   A `concept` or `application` entry IS a route and gets a `route` phrase. A `calculation` or
   `careless` entry means the route was right, so its `route` is `null`.
3. Write each `route` from the entry's `text`: the same error, in the student's voice.
4. Write `right_route`: the approach of step 1 in the student's voice. `null` only for a theory
   or recall question that has no route — one answered by knowing, not by working. When
   `mistake_type_hint` is `calculation` or `application` the question has a route by
   definition and `right_route` must be a phrase; when it is `concept`, decide: an
   assertion-reason item answered by a test case has a route ("I tested it on a ball at the top
   of its throw"), a pure recall item has none.
5. Run the phrase tests below on every phrase, then write the file.

## The sidecar file — exact shape

```json
{
 "schema": "eapcet_routes_v1",
 "question_id": "tg_eapcet_2021_20210804_an_q083",
 "right_route": "I subtracted the first four seconds from the total by twelve",
 "mistakes": [
  {"index": 0, "type": "application", "route": "I treated the next 8 seconds as a fresh fall from rest"}
 ],
 "authored_by": {"model": "sonnet", "wave": 1, "agent": "W01-R-p1-02", "at": "2026-09-09T10:00:00+05:30"}
}
```

A second example, on a conceptual question whose solution lists two mistakes:

```json
{
 "schema": "eapcet_routes_v1",
 "question_id": "tg_eapcet_2022_20220718_an_q096",
 "right_route": "I scaled the diameter like any length of the sheet",
 "mistakes": [
  {"index": 0, "type": "concept", "route": "I took the hole to shrink as the metal expands"},
  {"index": 1, "type": "application", "route": "I used the area coefficient on the diameter"}
 ],
 "authored_by": {"model": "sonnet", "wave": 1, "agent": "W01-R-p1-11", "at": "2026-09-09T10:00:00+05:30"}
}
```

Field by field — every one is used by the product or by the gate, and **no other key is allowed**:

- `schema` — exactly `"eapcet_routes_v1"`.
- `question_id` — copied from the item; it is also the file name.
- `right_route` — a phrase, or `null` (theory). Never omitted.
- `mistakes` — one object per `common_mistakes` entry of the solution, `index` 0, 1, 2 in the
  solution's order, every index exactly once, no more and no fewer. Each object has exactly
  the keys `index`, `type`, `route`. An empty `common_mistakes` gives an empty list.
- `authored_by` — `{"model", "wave", "agent", "at"}`; copy `wave` and `agent` from your dispatch.

## The phrase tests — a machine runs them and rejects the file

Every `route` and every non-null `right_route`:

1. starts with `I ` — first person, the student speaking;
2. has at most twelve words;
3. carries **no number of two or more digits** — a single digit is fine ("the next 8 seconds");
   "12 s" or "32g" is not. The menu is shown before the answer is revealed, and a number can
   hand it over. Write the quantity in words when you must ("the first four seconds");
4. is not equal to the mistake's `text` — it is a rephrasing in the student's voice, not a copy;
5. passes the Rule 41 idiom scan: no "the trick is", "nail it", "the key is", "a breeze"; no
   personification (a force does not "want"); no "simply", "obviously", "just";
6. holds no markdown: no `**bold**`, no backticks, no `- bullets`.

And, read by the auditor rather than the machine: the route describes ITS entry's error and no
other; the right route matches step 1 and not a later step; the wrong routes read in the same
voice and confidence as the right one; two routes on one question are distinguishable by a
student who has not seen the answer.

## Check the brief, not only your work

Compare your first finished sidecar against the two examples above. If you think the brief is
wrong somewhere — a type that fits no definition, a limit a real route cannot meet, a solution
in your slice whose mistake entry is itself wrong — say so in your reply and do not repair the
solution. The brief is the highest-leverage place for a defect to live, because every sidecar
inherits it.

## Reply

Reply with only: sidecars written (count), mistake entries typed (count, by type), right routes
written and left null (counts), and any question id that gave trouble, one line each. Do not
paste JSON. Do not edit any solution file.
