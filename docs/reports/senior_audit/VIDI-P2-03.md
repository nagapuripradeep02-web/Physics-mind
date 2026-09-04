# Vidi Audit — Physics-II, Slice 3 of 11

Slice file: `.answerbook_logs\audit_r1_ts_ipe_p2.slice-03.md`
24 question groups × 10 templates (marks, whystep, remember, explain, mistakes, important,
skiplast, why, outofbank, telugu) = **240 replies**, every one graded (no sampling).

Rubric used (frozen, as printed at the top of the slice): 3 precise · 2 acceptable
(correct but vague/padded/over-length) · 1 weak/misleading (a student could take away
something wrong) · 0 harmful (states a falsehood, invents a mark/step, or answers an
off-bank question instead of declining it). Graded against the ANSWER FACTS shown above
each group, never against my own physics knowledge.

## 1. Per-template table

| Template | Mean | 0 | 1 | 2 | 3 |
|---|---|---|---|---|---|
| marks | 3.000 | 0 | 0 | 0 | 24 |
| whystep | 3.000 | 0 | 0 | 0 | 24 |
| remember | 2.958 | 0 | 0 | 1 | 23 |
| explain | 3.000 | 0 | 0 | 0 | 24 |
| mistakes | 3.000 | 0 | 0 | 0 | 24 |
| important | 2.917 | 0 | 1 | 0 | 23 |
| skiplast | 2.958 | 0 | 0 | 1 | 23 |
| why | 3.000 | 0 | 0 | 0 | 24 |
| outofbank | 3.000 | 0 | 0 | 0 | 24 |
| telugu | 3.000 | 0 | 0 | 0 | 24 |

## 2. Overall mean

**2.983** across **240** replies. **Guard replies excluded from the mean: 0** — none of the
240 replies were a guard message ("I could not answer just now" / "Give me a short moment").

## 3. Every reply scored 0 or 1

Only one reply scored below 2 in this slice (none scored 0).

**[important] · `ts_ipe_p2_dnr_heisenberg_uncertainty` · score 1**

> This question has 0 stars in the book, which means the book does not rank it as one that
> is asked very often. The book also does not list any past exam years for it, so I cannot
> say it appeared in previous papers. Still, it is a 2-mark VSAQ, and **the lecturer did
> mark it as important in the source book, so it is worth knowing well**.

Reason: the reply is internally self-contradictory — it states in one sentence that the
book gives the question 0 stars ("not... asked very often") and two sentences later says
the opposite, that the question was starred/marked important by the lecturer. A student
reading this cannot tell whether the question is a priority or not. The root cause is a
contradiction baked into the card's own ANSWER FACTS (see item 6) — Vidi faithfully
reported both halves of a self-contradicting source rather than reconciling or flagging
it, producing a confusing reply.

## 4. Four explicit counts

- **WRONG-STEP:** 0 of 24 — every `whystep` reply explained exactly the step named in the
  open-step context and attributed marks to that same step; none substituted a different
  step.
- **SCOPE-CREEP:** 0 of 24 — every `outofbank` reply declined the off-paper "ideal gas
  equation derivation" question cleanly. Several then offered to help with the card's own
  open question, but none volunteered steps/formulas/marks belonging to the off-bank
  question itself.
- **LITERAL-MARKDOWN:** 0 of 240 — no reply contains `**`, a leading `- ` bullet, a `#`
  heading, or backticks.
- **TRUNCATED:** 0 of 240 — every reply ends on a complete sentence/formula.

## 5. Mechanical flags on replies judged wrong

No mechanical/regex flags were displayed under any reply anywhere in this slice file, so
there is nothing to report here — including under the three replies scored 1–2 above (the
`important`/`remember`/`skiplast` items had no flag markup shown beneath them either).

## 6. Cards whose ANSWER FACTS are themselves wrong, self-contradictory, or ambiguous

**`ts_ipe_p2_dnr_heisenberg_uncertainty` — direct contradiction (highest confidence).**
The card's own facts block says:

> STARS: 0 of 3 — the source book's frequency rank (3 = asked very often, 0 = the book
> gives it no star). ... No Asked line is given for this question, so the book records no
> exam years for it — say that plainly rather than concluding it was never asked.
>
> INSIDER POINT: **The lecturer starred this one in the source book.** Write the word
> statement first, then the relation with Δx and Δp defined — the relation alone is half
> the answer.

`STARS: 0 of 3` explicitly says the book gives this question no star, while the INSIDER
POINT in the very same block asserts "the lecturer starred this one." These are opposite
claims about the same fact (was it starred or not) and there is no way for a reply to be
faithful to both — any reply that reports the star-status at all (the `important` template
does, by design) inherits the contradiction. This poisoned the one reply above. Fix:
either the STARS line or the INSIDER POINT sentence needs correcting/removing so they agree.

**`ts_ipe_p2_cur_potentiometer_internal_resistance` — ambiguous symbol reuse (secondary,
lower confidence; no reply in this slice actually reproduced the ambiguity, but it sits in
the source facts a future reply could pick up).** Step `s5_closed_key`'s WRITE block:

> V = I ρ l₂ ... (2) ... But **V = IR across the box and ε = I(R + r)** round the cell
> circuit, so ε / V = I(R + r) / IR = (R + r)/R ... (4)

Earlier in the same card (`s1_principle`/`s2_primary_figure`), `I` is explicitly defined as
the *potentiometer-wire* current from the primary circuit ("the cell E, the key K and the
rheostat Rₕ hold a steady current I in it"). In step `s5_closed_key`, the same symbol `I`
is silently reused for the *secondary-loop* current the test cell drives through the
resistance box R and its own internal resistance r — a physically different current from
the wire current. The final boxed result, `r = R(l₁ − l₂)/l₂`, still comes out correct
because the two occurrences of "I" cancel algebraically the way the derivation needs them
to, so no numeric answer is wrong — but a student who tracks the symbol literally (as `I`
was defined a few lines earlier) would reasonably wonder why the potentiometer's primary
wire current is now said to satisfy `V = IR` and `ε = I(R+r)` across the *secondary* branch.
Worth relabeling the secondary current with its own symbol (e.g. `i`) to remove the
ambiguity.

No other card in this slice showed a mark-split arithmetic mismatch, a WHY/NOTE
contradicting its own MARK SPLIT, an unbalanced equation, or a rule stated one way and
applied another — I checked every numeric result (meter-bridge ratios, potentiometer
gradients/emfs, parallel-resistor combinations, the stretched-wire ×4 factor, the
resistivity dimensional formula `[M L³ T⁻³ A⁻²]`, the V₀–ν slope `h/e`/intercept `ν₀`, and
the mixed-grouping `R = nr/m` condition) against the given facts and all of them are
internally consistent and correct.
