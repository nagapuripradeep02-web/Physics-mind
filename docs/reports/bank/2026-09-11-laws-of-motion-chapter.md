# Book-derived solutions bank — laws of motion, the third chapter (2026-09-11)

The third chapter of the pre-solved bank behind the Solutions tab, built the same day as projectile
under the same constraint: **no metered API spend** — every model role (transcription, restatement,
second reader, crossed re-solve, equivalence judge, syllabus judge, printed-key reader, auditor,
rework) ran as a Claude Code sub-agent on the subscription. Paid compute this chapter: **48 stray
calls to the DeepSeek judge, made by the release step through a guard that did not cover it — under
a cent, discarded and re-decided by a Sonnet batch, and the guard now sits where it cannot be
bypassed (§5).** Storage is unchanged — our restatement + our solution + a fingerprint; nothing under `bank/` names
the source. This report is the founder's read before any PR.

This chapter is 1.7 × projectile (160 items in scope against 92) and figure-heavy: 122 of the 160
served questions carry a figure described in words (pulleys, wedges, free-body diagrams). That is
where the session's real work went — see §3 and §4.

The twelve held-back kinematics items were not touched; kinematics and projectile are byte-identical
to their commits.

## 1. What was built

| Stage | Result |
|---|---|
| Census (text layer, $0) | 160 items in scope: 54 solved examples (30 inside the chapter, 24 at its end), 33 introductory-exercise items over five sets (11 + 9 + 8 + 3 + 2), 73 Level-1 items (11 assertion–reason, 30 single-correct, 32 subjective). Expected = transcribed in every tier, 0 duplicates. |
| Readers (14 Sonnet agents on the crops) | 160 transcripts, each with OUR restatement, the givens/conditions of both texts, a figure description for 122 items, and for examples the printed solution's final result. |
| Figure checkers (2 Opus agents, ad hoc — new this chapter) | re-read 23 pulley/force figures against the crops after the first author wave solved the wrong figure in agreement (§3): movable pulleys described as fixed, strings tied to the wrong body, two force arrows reversed on a square. Corrections went into the served restatement AND the stored transcript; every author/second-reader output written from the old text was retired (17 retired files). |
| Key readers (5 Sonnet agents: 3 answer pages + 34 hint pages) | printed key for 100 of the 106 exercise items (the 6 without are sketch answers and "See the hints" entries whose hint is itself a sketch); 84 of the 100 also have a hint entry, which the gate reads as a fourth voice. The printed key is a **single-reader** input (the text-layer second reading found only a handful of entries in this PDF). |
| Blind authors (Sonnet, 15 slices incl. re-author slices) | 160 solutions; 1 refusal ("figure needed" on a moments question whose description did not fix the sense of one force) resolved by a hand-corrected description and a re-author; 17 items re-authored in all (18 runs) after the figure corrections, the refusal and one author miss. |
| Second reader (**Opus**, blind, 13 agents on the crops) | 160 answers — and one of them flagged that a worked example's `values_read` list disagreed with its figure description, which is how the reversed arrows of §3 were found. |
| Crossed re-solve of the restatement alone (Sonnet, 14 agents; Opus on the first-round failures, 1 agent) | every item re-solved from OUR text at its CURRENT restatement sha (47 hand-restatements each triggered a fresh re-solve). |
| Equivalence judge (Sonnet, 10 batches of ≤ 46 pairs) | 301 pairs decided, plus 3 orchestrator verdicts on judge miscalls (a label swap, "range" vs "minimum", symbol names) — all three then fixed in the comparator so the judge is not asked again. |
| Syllabus judge (Sonnet, 9 batches, 6 plants shuffled into each) | 160 within Class 11–12, 0 beyond; 60 of 60 plants caught (contour integration, Laplace transforms, Lagrangians, Jacobians — always flagged; L'Hôpital and plain kinematics — always passed). |
| Item gate | see §2 |
| Blind audit (Opus, 15 auditors over five waves, planted controls) | see §3 |
| Photo-match probe | **not run** — embeddings are a metered call; the fingerprint is written with `embedding: null` (§6) |

Agents dispatched: 99 planned rows in the ledger plus 8 ad hoc (2 figure checkers, 6 rework
agents) — about 107 subscription sub-agents. Metered calls: the 48 stray judge calls of §5, none
other (the chapter's work files hold no metered-model row and no unsigned judge verdict).

## 2. The item gate (final run, against the frozen baseline)

| Bucket | Items | Meaning |
|---|---|---|
| pass | 149 | author = second reader = printed key (or key + hint, or example's printed result) |
| pass, no usable key | 6 | sketch answers ("See the hints" pointing at a drawing) and a subjective item the book prints no number for: author = second reader; the auditor is the third reader |
| escalate (two blind readers agree against the key) | 3 | §5 — one genuine book error, one interpretation, one "figure required" |
| dropped assertion–reason | 2 | §5 — both times three of our readers say the printed letter is wrong |
| author miss / undecided / syllabus / schema / unconfirmed | 0 | — |

Restatement gates: 160 of 160 clean — 0 shared 12-word windows of English with the source, masked
edit distance ≥ 0.40 (median 0.65), no given number dropped (56 restatements add a number such as
"take g = 10", kept as warnings), and the crossed re-solve reaching the author's answer on every
item. **47 restatements were rewritten by hand** — far more than projectile's twelve — almost all of
them figure and served-text defects the blind readers surfaced: a one-pulley text against a
two-pulley figure, an unstated horizontal rod, a cord that leaves a ball at its top (not its side),
a weight component "directed up the slope", a rod end "high on the wall" that in the crop touches
nothing, four "as before"/"same setup" references to a neighbouring problem, a question whose parts
were printed twice, "the whole system in equilibrium" where the source asks only for one block to
stay at rest, "point 1" where the figure names block 1. Each rewrite re-ran the crossed re-solve and
put the item back into the audit queue at its new sha.

**What the gate found in itself this chapter** (all fixed, each with a fixture): `v_B` and `vB`
compared as different symbols; two expressions over different symbol sets returned a hard "no"
instead of "ask the judge"; a bracketed explanation after a value ("F_min = … (block needs …)")
counted as a second reading; a two-word answer ("Move up") against a sentence was called
"disjoint"; `_core` mangled prose; a None from the words path became a False; and, found while
closing the last item, the explanation stripper itself had a hole — "10 N (directed to the left)"
equalled "10 N (directed to the right)" because both brackets were dropped before comparing
(opposite words in the two brackets now send the pair to the judge), and a bracket holding commas
was split as a list before it was stripped. The comparator fixture grew from 87 to 99 pairs. In the
audit tooling: a solution edited after its audit kept the audit (the item sha does not cover the
figure description, which is served text) — an audit older than the item's latest restatement is now
stale and re-queued; the control generator doubled digits inside labels (`N_ground2` → `N_ground4`)
— label digits are now skipped; `plan --role author --only` ignored `--only`; a crossed re-solve of
an OLDER restatement was accepted as a re-solve of the current text — it is ignored now; and the
"hint disagrees with printed answer" warning fired on 27 items where both agreed with the author (a
printed letter compared against the hint's value without the options) — silenced when they cannot
both be wrong.

## 3. The blind audit

Fifteen Opus auditors over five waves, every one solving its slice's questions
before opening a solution, every control hosted on an already-audited item from wave 2 on.

| | Wave 1 | Wave 2 | Wave 3 | Wave 4 | Wave 5 |
|---|---|---|---|---|---|
| Real items audited | 155 | 61 | 7 | 2 | 2 |
| ok · weak · wrong · harmful | 96 · 31 · 22 · 5 | 56 · 4 · 1 · 0 | 5 · 1 · 1 · 0 | 0 · 1 · 1 · 0 | 1 · 1 · 0 · 0 |
| Controls caught | 8 of 8 (2 restatement-altered, 3 doubled line, 1 wrong final value, 2 wrong option) | 4 of 4 | 1 of 1 | 1 of 1 | 1 of 1 |
| Auditors discredited | 0 | 0 | 0 | 0 | 0 |
| Served-text defects reported (`question_defect`) | 10 (all hand-restated) | 0 | 1 (a figure-only item) | 1 (point vs block) | 0 |

The five wave-1 HARMFUL findings, all real and all fixed: force components of a vector resolved from
the wrong angle (the served figure gives 60° from the −x direction; the solution used 30°); a string
at 30° to the VERTICAL resolved with sin and cos swapped through three steps; the horizontal
component of a pseudo force written as √3mg/4 where it is mg/4; a middle line "40 − 5T/6" whose
left side sums to 20 − 5T/6; and coefficients in a three-block equation that do not follow from the
line above. The 22 WRONGs were mostly `why_this_step` and `common_mistakes` lines whose stated cause
cannot produce the number they name, an approach that asserted zero ground friction on a cylinder the
figure draws it on, and two assertion–reason final lines that name one option while the reasoning
reaches another. The WEAKs: metaphor, vague mistake entries, a step that says "the figure" when the
served text says "the description", difficulty tags.

Rework: 63 items in round 1 by five Sonnet rework agents (each finding verified in python before it
was applied) plus hand fixes; the round-2 re-audit of every changed item found one step whose cord
description contradicted the served figure (a cord "looping under" a pulley the figure passes it over)
and nothing harmful; round 3 found one reversed `why_this_step` (it concluded the ground friction on a
cylinder must be zero from the very fact that made it the only force with a moment); round 4 found "one force per contact" in an approach — a rough contact gives two — and was
the last real finding. Round 5 (2 items, 1 control) found nothing beyond a register nit ("feels four forces") and closed the audit.

**Release:** 155 verified items (52 worked examples, 103 exercises; 87 subjective, 30 single-correct, 24 numerical, 9 assertion–reason, 5 conceptual; all tagged Laws of Motion; 117 carry
a figure described in words) in `bank/physics/laws_of_motion/items/`, ids `bk_phy_lom_<sha8>`. Every
released item's `verified_sha` equals its current content sha; 39 of 155 state no number in the source
and must be served as "similar", never "same".

## 4. Independence, honestly — the figure problem

Two Claude models again (Sonnet author, Opus second reader), so their agreement is weaker evidence
than Claude + Gemini agreement was in the pilot; what stands independent is the printed key (single
reader, cross-checked by the hints on 84 items), the blind re-solve from OUR text, and the Opus
auditors measured by 15 planted controls.

This chapter exposed a weaker link than the model pair: **the figure description.** Worked examples
are served to the authors and the second readers as text only (their crop shows the printed
solution), so every blind reader of a worked example inherits the SAME description of the figure —
and when the reader agent had drawn a movable pulley as fixed, or reversed two arrows on a square
(lom_660c1d75: a 4 N and a 3 N arrow), the author, the Opus second reader and the crossed re-solver all agreed on
the wrong moments and only the printed key disagreed. Agreement between readers of the same wrong
text is not independence. The fix is a role, not a model: an Opus figure checker re-read every
pulley/force figure against the crop, and the `escalate_key` bucket is now read as "three readers
against the key — look at the crop before deciding who is wrong". Of this chapter's three
escalations one was a reader error (fixed) and two are the book's (§5).

## 5. For the founder

**Escalations (our blind readers agree against the printed key):**

| Item | Readers | Printed | Note |
|---|---|---|---|
| lom_e5cfe9a4 (solved example: a 2 kg block under a 6 N press, a 4 N side push and a 10√2 N pull at 45°, μₛ = 0.6, μₖ = 0.4) | author, second reader and re-solver: friction 6.4 N (kinetic), the block moves at 3.8 m/s² | f = 14 N, the block does not move | The printed working drops the pull's 10 N vertical component when it forms the normal reaction (R = 26 N instead of 16 N), so its friction limit is too high and it concludes no motion. A genuine book error; our solution is right. Ships on your say-so. |
| lom_5cc3250f (solved example: a car on an incline, four parts) | (c) minimum retardation = g sinθ | (c) minimum retardation = 0 | Interpretation, not arithmetic. The book lets the driver keep friction up the slope and exactly cancel g sinθ (retardation 0); our three readers take the car with no drive and no brake (friction absent), where the smallest retardation is g sinθ. Parts (a), (b), (d) agree. The served text does not say which; your call — the bank ships it only after part (c) says what the driver may do. |
| lom_f069c38c (Level-1 single-correct: direction of the incline's total contact force on a pushed block, options are four drawn arrows OA–OD) | OB, from the drawn directions as described | (a) OA | The answer depends on where the four arrows are drawn; the description places OB nearest the computed direction (≈ 16° from the vertical). Marked `figure_required`; do not ship without your look at the printed figure. |

**Dropped assertion–reason items (three of our readers against the printed letter):**

| Item | Readers | Printed | Why we think the book is wrong |
|---|---|---|---|
| lom_8295f660 (AR: tension in the string holding a pulley "always lies strictly between m₁g and m₂g") | (d) — Assertion false, Reason true | (b) | T_AB = 4m₁m₂g/(m₁ + m₂) exceeds both m₁g and m₂g unless the heavier mass is more than three times the lighter (m₁ = 1, m₂ = 2 gives 8g/3 > 2g). The printed hint proves the claim for the OVER-pulley tension, which is a different string. |
| lom_b325738d (AR: a block in the corner of a smooth box that accelerates up and to the left cannot stay there) | (a) — both true, Reason explains | (b) | The block needs a leftward force the smooth left wall cannot supply; that IS why it cannot stay. All three readers call the Reason the explanation. |

**Book errors are the pattern, not the exception, in this chapter:** one solved example with a
dropped force component, two assertion–reason keys against three readers each. The pilot and
projectile had two escalations each in ~90 items; this chapter has three in 160 plus the two AR
drops.

**The metered calls that should not have happened.** `audit.py release` re-checks every WEAK
audit by comparing the auditor's answer with the author's; when the comparator cannot decide, it asks
the judge — and the "no paid judge without `BANK_ALLOW_API=1`" switch lived only inside `gate.py
run`, so the release step called DeepSeek 48 times (each a few hundred tokens with no reasoning:
under a cent in total). On checking, the projectile release had done the same 27 times, so that
report's "0 API calls" was wrong by 27 such calls; a correction is appended to it. What was done:
the 48 verdicts were taken out of the evidence file and the pairs re-decided by a Sonnet judge batch
(W08); the refusal now lives in the HTTP helper every paid call goes through, the offline judge is
the default in every code path, and `hygiene.py` counts an unsigned judge verdict as a metered row.
The projectile's 27 verdicts stand (they agreed with the auditors and changed no item); say the word
and a Sonnet batch re-decides them too.

**The source PDF** is the founder's copy at the path recorded only in the gitignored
`pdfs/books/dcp_m1/laws_of_motion/source.json`, which also holds the page geometry (no page number
of this book is in git).

**Hygiene checks run** (`scripts/bank/hygiene.py`, exit 0): identity grep over every tracked file
under `bank/physics/laws_of_motion/` and this report = 0; 12-word English shingle sweep against the
transcripts (question, parts, options, printed solutions) over the same files and `scripts/bank/` =
0; page numbers = 0; metered-model rows in the chapter's work files = 0.

## 6. What changed in the pipeline, and what phase 2 inherits

- **A figure-checker role.** Ad hoc this chapter (2 Opus agents, 23 figures); for the next
  figure-heavy chapter it runs BEFORE the authors on every pulley/force/FBD item: fixed vs movable
  pulleys, which body each string end is tied to, arrow senses, rough vs smooth with μ, what each rod
  end touches. Corrections go into both the served restatement and the stored transcript, with the
  `values_read` list corrected together with the description.
- **Stale audits.** An audit written before the item's latest restatement row is re-queued and never
  released (file mtime, not the auditor's self-written timestamp, is the clock).
- **The comparator** learned subscripts, symbol-set differences (ask the judge, never "no"),
  bracketed explanations (stripped — but opposite words in two brackets go to the judge), short
  word answers; fixture 87 → 99 pairs, selftest 99/99.
- **No paid endpoint is reachable by accident.** `_lib._post` refuses without `BANK_ALLOW_API=1`;
  `OFFLINE_JUDGE` defaults to true everywhere; hygiene flags unsigned judge rows.
- **The gate** ignores a crossed re-solve of an older restatement; the control generator never
  doubles a label digit; `plan --only` is honoured for authors; "See the hints" answers defer to the
  hint's final value.
- **Expected yield per chapter at this discipline:** 155 verified of 160 in scope, no intended paid
  compute (the 48 stray judge calls of §5 aside), ~106 subscription sub-agents (14 readers, 5 key readers, 15 authors, 13 second readers,
  15 re-solvers, 19 judge/syllabus batches, 15 auditors, 8 figure-check/rework), and — the honest
  number — about one long session of hand work on figures and served text for a figure-heavy
  chapter. The subscription cap is the real limit: waves of ≤ 8 agents.
