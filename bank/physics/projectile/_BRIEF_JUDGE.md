# Equivalence-judge brief — are two final answers the same answer?

Your slice holds up to 50 pairs of final answers (`a`, `b`) to the same physics question, each with a
key `k`. A machine comparator could not decide them (different wording, form or unit). You decide
each pair and write ONE file for the whole batch to the `out` path every pair names.

Decide each pair on this rule, and nothing else:

> SAME means: the same value within 1 % rounding in the same or an equivalent unit (55 m/min = 0.92 m/s),
> algebraically identical expressions (also when one is an exact form and the other its decimal), the
> same statement in other words, or the same physical claim with different symbol names for the same
> quantities. Extra explanation, a direction or qualifier stated on one side only, working shown, or one
> side listing MORE parts than the other (while every part both give agrees) do NOT make them different.
> A different number, a different unit dimension, an opposite sign or direction, or a contradicting
> physical claim means NOT the same.

Compute in python whenever a number, a unit conversion or an algebraic identity is involved (name the
scratch file with your agent label). Never guess; if the two sides genuinely cannot be compared (one is
empty or unreadable), answer `false` and say why.

## The file — exact shape

```json
{"verdicts": [
 {"k": "<the pair's k, copied exactly>", "equivalent": true, "why": "3.414 t₀ is (2 + √2) t₀ to 4 figures"},
 {"k": "...", "equivalent": false, "why": "25 m/s downward vs 25 m/s upward: opposite direction"}
]}
```

Every pair in the slice appears once. `equivalent` is a JSON boolean. `why` is at most 15 words.

## Reply

One line: pairs judged, how many true, how many false. Do not paste JSON.
