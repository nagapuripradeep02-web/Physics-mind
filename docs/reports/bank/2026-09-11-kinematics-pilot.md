# Book-derived solutions bank — kinematics pilot (2026-09-11)

The first chapter of the pre-solved bank behind the Solutions tab: every solved example, introductory
exercise and Level-1 exercise of one standard JEE-Main-level mechanics chapter, solved once at Class
11–12 level, verified by three independent readers, stored as **our restatement + our solution + a
fingerprint**, and probed with synthetic photos to size the phase-2 lookup. No endpoint was deployed;
nothing under `bank/` names the source. This report is the founder's read before any PR.

## 1. What was built

| Stage | Result |
|---|---|
| Census (text layer, $0) | 181 items in scope: 55 solved examples, 42 introductory-exercise items, 84 Level-1 items (12 assertion–reason, 30 single-correct, 42 subjective). Two numbered theory notes excluded. |
| Transcription (vision on marker-to-marker crops) | 181 transcripts; printed key for 124 of 128 exercise items (the four without are "prove" or "sketch" items); hints for the gate only. |
| Blind authors (Sonnet, subscription, 13 slices) | 181 solutions, 0 refusals; 35 exceeded the brief's word limits and were trimmed by copy-edit agents (words only). |
| Second reader (Gemini 3.7 Flash on the crop) | 183 rows |
| Restatement (Gemini on the crop) · givens extraction · crossed re-solve (DeepSeek high; Gemini as tie-break) | 183 · 181 · 183 (+12 second re-solves) |
| Syllabus judge (six plants first, every run) | 181 within Class 11–12; 0 beyond |
| Item gate | see §2 |
| Blind audit (Opus, 12 slices + 2 re-audit slices, planted controls) | see §3 |
| Photo-match probe (181 positives, 313 negatives) | see §4 |

Compute spent on paid APIs: about $4 (transcription ≈ 0.36 M tokens, second reader ≈ 0.41 M,
restatement ≈ 0.42 M, crossed re-solves ≈ 0.40 M, judges and embeddings small). Authors, auditors
and rework ran on the Claude Code subscription.

## 2. The item gate (final run)

| Bucket | Items | Meaning |
|---|---|---|
| pass | 163 | author = second reader = printed key (or key + hint) |
| pass, no usable key | 7 | "prove that" / "plot the graph" / "see the hints": author = second reader; the auditor is the third reader |
| pass, second reader could not confirm | 4 | author = printed key; the second reader's answer was garbled or judged different; the auditor is the third reader |
| escalate (two blind readers agree against the key) | 4 | §5 |
| undecided | 1 | a sketch-answer item where the two long graph descriptions could not be judged equal |
| author miss | 1 | the author misread a displacement–time graph (sign of the acceleration); key and second reader agree against it |
| dropped assertion–reason | 1 | author and second reader chose (a), the key prints (d); the key is right (a horizontal v–t line gives a straight s–t line, not a parabola) |
| restatement blocked | 2 | crossed re-solvers disagree with the author on two assertion–reason items whose printed answers are themselves ambiguous ("a or b") |

Restatement gates: 179 of 181 clean — 0 shared 12-word windows of English with the source (a given
formula survives verbatim and is not counted), edit distance ≥ 0.4 with numbers and maths masked,
no given number dropped (33 restatements ADD a number such as "take g = 10", kept as warnings), and
the crossed re-solve reaching the author's answer. Two restatements were rewritten by hand-directed
re-runs: one dropped "g = 10 m/s²", one said "the preceding problem" without stating it.

**What the gate found in itself** (all fixed, each with a fixture): the sub-parts of a question
were invisible to every re-solver (65 of 183 items carry parts); the identity grep matched "fallen";
the words comparator de-duplicated tokens so a swapped positive/negative passed; the unit table lacked
m/min; bracketed qualifiers ("25 m/s (downwards)") and decimal-vs-exact forms ("3.414 t₀" vs
"(2 + √2) t₀") read as different; the equivalence-judge cache outlived its prompt. The comparator
fixture grew from 34 to 77 pairs; the four original holes stay in it.

## 3. The blind audit (wave 1)

Twelve Opus auditors, 173 real items, 12 planted controls (one void: doubling a zero changed nothing).

| | Count |
|---|---|
| Real items audited | 172 |
| ok · weak · wrong · harmful | 148 · 12 · 10 · 2 |
| Controls caught | 11 of 11 valid (restatement-altered, doubled line, wrong final value, wrong option) |
| Auditors discredited | 0 |
| Auditor answer ≠ author answer on a real item | 2 (§5) |

The 22 items with findings were reworked by copy-edit agents that verified each finding in python
before applying it (no finding was rejected), plus one answer that repeated the question's wording.
Round 2 re-audited every item whose content sha changed (24 items, 2 new controls):
26 items audited (24 real + 2 controls, both caught): 22 ok, 2 weak, 1 wrong (a step that still said "in the previous question" after the restatement had been made self-contained), 0 harmful. Round 3 re-audited that one item with a fresh control: ok, control caught. Wave total: 15 controls planted, 14 valid, 14 caught, no auditor discredited.

**Release:** 169 verified items (55 worked examples, 114 exercises; 123 tagged Motion in a Straight Line, 46 Motion in a Plane; 29 single-correct, 8 assertion–reason, 29 numerical, 88 subjective, 15 conceptual) in `bank/physics/kinematics/items/`, ids `bk_phy_kin_<sha8>`.
Every released item's `verified_sha` equals its current content sha.

What the audit caught that the gate could not: mistake entries whose stated cause cannot produce the
number they name (5), a mistake entry that condemns a correct method (1), a "from rest" claim the
question contradicts, an unqualified physics claim (|dv/dt| = d|v|/dt "in straight-line motion"),
one explanation the auditor overturned (why sₜ = u + at − ½a looks dimensionally wrong), and a
context-dependent restatement ("the preceding problem").

## 4. The photo-match probe

Queries: every bank crop pushed through a photo effect (181 positives) and 313 negatives — 77
kinematics PYQs, 150 other-chapter PYQs, 36 same-book Level-2 page bands (same typesetting, never in
the bank) and 50 twins (a released restatement with one number changed, typeset and photographed).
Each query was transcribed by Gemini, embedded, and matched against the 181 fingerprints. Full tables:
`docs/reports/bank/match_probe_2026-09-11.md`.

| Matcher, with the numbers gate | Correct top-1 on positives | False hits: PYQ (225) | Same-book bands (36) | Twins (50) |
|---|---|---|---|---|
| embedding cosine ≥ 0.80 | 169 / 181 (93 %) | 2 | 2 | 5 |
| embedding cosine ≥ 0.85 | 148 / 181 (82 %) | 0 | 1 | 5 |
| embedding cosine ≥ 0.90 | 55 / 181 (30 %) | 0 | 0 | 5 |
| lexical (the app's 58_match port) ≥ 0.50 | 101 / 181 (56 %) | 1 | 0 | 5 |

Three things the probe settled:

- **The numbers gate is what stops a twin.** Without it every one of the 50 twins is the top-1 match
  at cosine ≥ 0.80 (a changed number barely moves an embedding). The gate is "every number the source
  question states appears in the photo"; it blocks 45 of 50 twins and costs 3 true hits (177 → 174 at
  low τ). The 5 twins it lets through are items whose source states no number at all (symbolic
  questions) or a number the restater added ("take g = 10", "45°") — there is nothing for the gate to
  check. 36 of the 169 released items state no number in the source; for those the lookup must say
  "similar", never "same".
- **The restatement embedding is enough.** Embedding the source's own words lifted top-1 by 1.7 points
  (180 vs 177 of 181), under the 5-point rule fixed in advance, so the served fingerprint carries no
  source embedding and no source words — only our restatement's embedding, simhash and tokens, plus
  the source's numeric multiset for the gate.
- **The lexical arm is not a matcher for photographed book questions** (56 % at its best threshold);
  it stays as a cheap pre-filter at most.

The founder's ~30 real phone photos were not available this session; the `--real DIR` path of
`match.py probe` is ready for them and the report has a column for it.

## 5. For the founder

**Escalations (two blind readers agree against the printed key):**

| Item | Readers | Printed | Note |
|---|---|---|---|
| kin_0555f008 (intro exercise, true/false) | author False, second reader False | True | "Average speed always equals the magnitude of average velocity" — false in general. Either the printed key is wrong or its numbering slipped. |
| kin_59db942d (Level-1 subjective, a–t graph) | (a) +5 m/s² | (a) −5 m/s² | Sign of the average acceleration read off the figure. Needs a human look at the crop. |
| kin_0369fa6e (intro exercise, conceptual) | "curvilinear two-dimensional motion" | "two-dimensional with non-uniform acceleration" | Same classification; the judge wanted "non-uniform acceleration" stated. Ships if you accept the author's wording. |
| kin_3abcb90b (intro exercise) | s ∝ t^(7/4), a ∝ t^(−1/4) | s ∝ t⁷/⁴, a ∝ t⁻¹/⁴ | Identical physics; the printed superscripts confused both comparator and judge. Ships on your say-so. |

Also held back: one author miss (kin_6e233343, needs re-authoring with the figure), one undecided
sketch item (kin_64788ccd), one dropped assertion–reason item, two assertion–reason items whose
book answers are ambiguous, and any item the round-2 audit failed.

**The source PDF** is the founder's copy at the path recorded only in the gitignored
`pdfs/books/dcp_m1/kinematics/source.json`. It carries a Telegram distribution watermark; a purchased
copy would remove that question for later chapters. Nothing was downloaded from the web.

**Hygiene checks run:** identity grep over `bank/` = 0 files; 12-word English shingle sweep over
`bank/` and `scripts/bank/` against the transcripts (question, parts, options and printed solutions) = 0 files; the tracked scripts no longer carry
the PDF's file name.

## 6. Phase 2, sized by the numbers

- Operating point: embedding cosine ≥ 0.85 with the numbers gate = "same" (82 % of synthetic
  photos answered from the bank, 0 false hits in 225 PYQs, 1 in 36 same-book bands); 0.75–0.85 =
  "similar" (shown as a related worked example, never as the answer); below = solve live. At 0.80 the
  hit rate is 93 % for about 1 % false hits — the founder's call once the real photos are in.
- Items whose source states no number (36 of 169) are served as "similar" only.
- The served lookup needs: the 169 `bank_item_v1` files, `_fingerprints.jsonl` (169 rows: restatement
  embedding 768-d, simhash, tokens, two numeric signatures), the `sig_gate` and `cosine` functions of
  `scripts/bank/match.py` ported to the worker, and a wire into `ep-solve`'s similarity cache before its
  live solve. One Gemini embedding call per photo (already transcribed by `ep-photo-read`).
- Expected yield per chapter at the same discipline: ~170 verified items from ~185 in scope, about
  $4 of paid compute, ~13 author + ~14 auditor + ~4 rework subscription agents, one session of gate
  and audit reading. Next chapters: the remaining Mechanics-1 chapters, then the same pipeline on the
  other two books; the gate, comparator fixtures and briefs carry over unchanged.
