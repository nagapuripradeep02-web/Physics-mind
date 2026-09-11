# Book-derived solutions bank — projectile motion, the second chapter (2026-09-11)

The second chapter of the pre-solved bank behind the Solutions tab, built the day after the kinematics
pilot under one new constraint: **no metered API spend.** Every model role that the pilot bought from
Gemini and DeepSeek (transcription, restatement, second reader, crossed re-solve, equivalence judge,
syllabus judge, the printed-key reader) ran as a Claude Code sub-agent on the subscription. Paid
compute this chapter: **$0.** Storage is unchanged — our restatement + our solution + a fingerprint;
nothing under `bank/` names the source. This report is the founder's read before any PR.

The twelve held-back kinematics items were not touched (the founder's instruction).

## 1. What was built

| Stage | Result |
|---|---|
| Census (text layer, $0) | 92 items in scope: 24 solved examples, 21 introductory-exercise items, 47 Level-1 items (10 assertion–reason, 16 single-correct, 21 subjective). Expected = transcribed in every tier, 0 duplicates. |
| Readers (8 Sonnet agents on the crops) | 92 transcripts, each with OUR restatement, the givens/conditions of both texts, and for examples the printed solution's final result. One figure misread (angles swapped on a figure-only item) was caught by the key + hint and re-transcribed. |
| Key readers (3 Sonnet agents on the answer and hint pages) | printed key for 66 of 68 exercise items (the two without are "prove"/"show" items); 106 hint entries for the gate only. The text-layer second reading of the key found only 3 entries this chapter (option letters render as glyphs in this PDF), so the printed key is a **single-reader** input here — the hints are its cross-check. |
| Blind authors (Sonnet, 8 slices + 1 re-author slice) | 92 solutions, 0 refusals; 11 exceeded the brief's word limits and were trimmed by a copy-edit agent (words only, numbers byte-identical); 3 retired and re-authored after transcript corrections. |
| Second reader (**Opus**, blind, 9 agents on the crops) | 92 answers |
| Crossed re-solve of the restatement alone (Sonnet, 14 agents; Opus on the 4 first-round failures) | 96 + 4 |
| Equivalence judge (Sonnet, 6 batches of ≤ 50 pairs) | 144 pairs decided |
| Syllabus judge (Sonnet, 4 batches, 6 plants shuffled into each) | 92 within Class 11–12, 0 beyond; 30 of 30 plants caught |
| Item gate | see §2 |
| Blind audit (Opus, 8 + 3 slices, planted controls) | see §3 |
| Photo-match probe | **not run** — embeddings are a metered call; the fingerprint is written with `embedding: null` (§6) |

Agents dispatched: 60 planned rows in the ledger plus 5 rework/copy-edit agents — about 65
subscription sub-agents, 0 API calls (grep of the chapter's work files for `gemini`/`deepseek`
model rows = 0).

## 2. The item gate (final run)

| Bucket | Items | Meaning |
|---|---|---|
| pass | 83 | author = second reader = printed key (or key + hint, or example's printed result) |
| pass, no usable key | 4 | "prove"/"show" items and two subjective items the book prints no answer for: author = second reader; the auditor is the third reader |
| pass, second reader could not confirm | 1 | the train-and-ball item (§5): author = printed key; the Opus reader took the other reading of an ambiguous question |
| escalate (two blind readers agree against the key) | 2 | §5 |
| dropped assertion–reason | 2 | author and second reader chose (a), the key prints (b); "is the Reason the explanation" is the book's call, not ours |
| author miss / undecided / syllabus / schema | 0 | — |

Restatement gates: 92 of 92 clean — 0 shared 12-word windows of English with the source, masked edit
distance ≥ 0.418 (median 0.59), no given number dropped (11 restatements add a number such as
"take g = 10", kept as warnings), and the crossed re-solve reaching the author's answer on every
item. Eight restatements were rewritten by hand-directed re-runs: three too close to the source,
three that lost a number or an interval, two that said "the above problem". Four more were corrected
from what the audit and the re-solvers found: a figure description that never said which way the
slope rose (the blind re-solver launched the particle UP the incline), "5.0 away" served without its
unit (the book's own omission; served as 5.0 km), a question that listed its three parts twice, and
"speed" where the book asks for velocity. The ten assertion–reason items were restated without the
standard four-option list (the book prints it once per section, not per item); the list was added so
the served text carries the options the solution's answer refers to.

**What the gate found in itself this chapter** (all fixed, each with a fixture): `5/√2` was read as
`5/(sqrt)(2)`; `sinθ` without a space became a product of letters; a word label before "=" ("speed
= 50 m/s") was not stripped; prose that carried numbers was declared "words disjoint"; "at ≈65.9°"
split into a second reading; a bare symbol "v" counted as a form of the answer; a global two-span
budget starved multi-part answers; a magnitude-plus-angle answer matched a wrong magnitude through
the angle alone; and a parenthetical explanation ("0 (both have acceleration g downward)") counted
as a second value. The comparator fixture grew from 77 to 87 pairs. Two collector defects were also
found by reading rows: a re-solve of a restated item was filed under the item's OLD restatement sha
(an older slice shared the output file), and a stale output was collected before its agent had
written — the collector now keys every re-solve by (item, restatement sha).

**g conventions.** The book is inconsistent: one printed answer needs g = 10 (0.18 s), the next needs
g = 9.8 (2.5 m). Where the question states no g, the solution now shows the symbolic result and both
numerical values, g = 10 m/s² first.

## 3. The blind audit

Eight Opus auditors in wave 1 (86 real items, 8 controls), three in wave 2 (26 re-audits of every item
whose content changed, 3 controls), one in wave 3 (8, 1 control). Every auditor solved its slice's
questions before opening a solution; every control was hosted on an already-audited item from wave 2 on.

| | Wave 1 | Wave 2 | Wave 3 |
|---|---|---|---|
| Real items audited | 86 | 26 | 8 |
| ok · weak · wrong · harmful | 66 · 12 · 5 · 3 | 18 · 3 · 5 · 0 | 8 · 0 · 0 · 0 |
| Controls caught | 8 of 8 (3 restatement-altered, 2 doubled line, 2 wrong final value, 1 wrong option) | 3 of 3 | 1 of 1 |
| Auditors discredited | 0 | 0 | 0 |
| Auditor answer ≠ author answer on a real item | 1 (the sign convention below) | 0 | 0 |

The three wave-1 HARMFUL findings, all real and all fixed: a solution that overrode the served figure's
axes with "y positive downward" and so printed the landing point with the wrong sign
(prj_6e73404f); the bullet-from-a-car item, whose answer was the ground-frame velocity with no frame
named and the gun's own 8 m/s never used (prj_e517e4e8 — now gives both frames); and the
trajectory item that stopped at the velocity vector when the printed question asks for the velocity's
magnitude (prj_df9b881f — the restatement had also drifted to "speed"; both fixed). The WRONGs
were mistake entries whose stated cause cannot produce the number they name (4), a step that
derived the maximum height "by setting the landing displacement to zero", a step that said "from the
earlier problem", an approach that called 4H and H "equal heights", and two assertion–reason
mistake entries pointing at the wrong option. The WEAKs: metaphor ("a true Reason cannot rescue a
false Assertion"), duplicated prose, a range asserted without its working, a vague mistake entry, a
"coach" who is a "trainer" in the served text, and difficulty tags.

Rework: 20 items in round 1 by three copy-edit agents, 8 in round 2 by one; every finding was verified
in python before it was applied, 2 auditor fix-texts were trimmed to the word limits, none was
rejected. Round 2's re-audit found the round-1 rework had introduced one physics wording error
("the elevator floor accelerates away beneath the stone" — it rises to meet it) and one mistake entry
whose new cause still did not produce its number; both fixed and re-audited clean in wave 3.

**Release:** 88 verified items (24 worked examples, 64 exercises; 44 subjective, 16 single-correct,
14 numerical, 8 assertion–reason, 6 conceptual; all tagged Motion in a Plane; 28 carry a figure
described in words) in `bank/physics/projectile/items/`, ids `bk_phy_prj_<sha8>`. Every released
item's `verified_sha` equals its current content sha; 27 of 88 state no number in the source and
must be served as "similar", never "same".

## 4. Independence, honestly

The pilot's second reader was a different model family (Gemini on the crop). This chapter's second
reader is Opus, the author Sonnet — two Claude models. They share training and habits, so their
agreement is weaker evidence than Claude + Gemini agreement was. What still stands independent: the
printed key (read by an agent from the answer page, cross-checked by the hints; the text-layer second
reading found only 3 entries in this PDF), the blind re-solve from OUR restatement (a different text,
no crop), and the blind Opus auditors, who solve every question before reading the solution and who
are themselves measured by planted controls. The signal to watch is the count of "two blind readers
against the key": 2 of 92 here, both examined by hand in §5, versus 4 of 181 in the pilot.

## 5. For the founder

**Escalations (two blind readers agree against the printed key):**

| Item | Readers | Printed | Note |
|---|---|---|---|
| prj_78ea1db0 (intro exercise, velocity after 2 s of a 40√2 m/s, 45° launch) | author 20√5 ≈ 44.7 m/s at tan⁻¹(1/2); second reader and re-solver the same | 20√2 m/s at tan⁻¹(1/2) | The components are 40 and 20 m/s, whose magnitude is 20√5; 20√2 fits no reading. A printed misprint. Ships on your say-so. |
| prj_c550c7cd (Level-1 subjective, ballast bag from a balloon) | author t ≈ 3.55 s, impact speed ≈ 31.97 m/s; second reader 3.55 s, 32.0 m/s; re-solver the same | 3.55 s, 32.7 m/s | The time agrees; the printed speed is 0.7 m/s high and matches neither g = 9.8 nor g = 10. Needs your look at the printed solution if you want it shipped. |

**Ambiguous question, shipped on the book's reading:** prj_aa74029b (train at 30 m/s, ball thrown
sideways at 30 m/s, 45°): the distance from "the point of projection on the train" is 90 m in the
train's frame (the key's answer, our solution) and 90√3 m from the ground-fixed point (the Opus
reader's answer). Both readings are among the options; the auditor confirmed our solution is correct
under its stated reading. If you want the ground reading, the wording changes, not the solution.

**Dropped assertion–reason items (the book's call on "correct explanation", not ours):**
prj_25a50447 (speed at height h is √(u² − 2gh); Reason gives the vertical component) and
prj_2b909aaa (u·v can be zero at t ≠ 0): all three of our readers say (a), the key prints (b).

**The source PDF** is the founder's copy at the path recorded only in the gitignored
`pdfs/books/dcp_m1/projectile/source.json`, which now also holds the page geometry (so no page
number of this book is in git).

**Hygiene checks run** (`scripts/bank/hygiene.py`, exit 0): identity grep over every tracked file
under `bank/physics/projectile/` and the report = 0; 12-word English shingle sweep against the
transcripts (question, parts, options, printed solutions) over the same files and `scripts/bank/`
= 0; page numbers = 0; metered-model rows in the chapter's work files = 0.

## 6. What changed in the pipeline, and what phase 2 inherits

- **Chapter parametrisation.** `BANK_CHAPTER=<name>` selects the chapter; `scripts/bank/chapters.json`
  holds the id prefix, syllabus tag(s) and topic words; page geometry lives only in the gitignored
  `source.json`. Kinematics is byte-identical (`git diff -- bank/physics/kinematics/` empty; its
  release still reads 169 verified).
- **Every paid role is now a planned, dispatched, collected sub-agent role** (`scripts/bank/roles.py`:
  reader, keyreader, solveB, fidelity, fidelity2, judge, syllabus; `audit.py plan --role X`,
  `solve.py collect --role X`). The gate runs offline: pairs the comparator cannot settle queue to
  `_gate/_judge_pending.jsonl` and a judge batch decides them. Any command that would call a metered
  API refuses without `BANK_ALLOW_API=1`.
- **The fingerprint has no embedding.** `match.py fingerprint --no-embed` writes signature + simhash +
  tokens with `embedding: null` for every released item. Phase 2 embeds the whole bank once, with
  whichever free route is chosen then (Workers AI, a free embedding tier, or a local model); the
  pilot already sized the matcher (cosine ≥ 0.85 + numbers gate = 82 % top-1, 0 PYQ false hits).
- **Expected yield per chapter at this discipline:** ~88 verified of 92 in scope (this chapter),
  $0 paid compute, ~65 subscription sub-agents (8 readers, 3 key readers, 8 authors, 9 second
  readers, ~15 re-solvers, ~10 judge/syllabus batches, ~11 auditors, ~5 rework), one session of gate
  and audit reading. The subscription cap is the real limit: plan waves of ≤ 8 agents.

---

**Correction (2026-09-11, found while building the laws-of-motion chapter):** "0 API calls" above
was wrong by 27 calls. `audit.py release` re-checks each WEAK audit by comparing the auditor's answer
with the author's, and when the comparator could not decide it asked the paid DeepSeek judge — the
`BANK_ALLOW_API` switch covered only `gate.py run`. The 27 calls are a few hundred tokens each with no
reasoning (well under a cent in total); every one of them agreed with the auditor, so no item changed.
The guard now lives in the HTTP helper every paid call passes through and `hygiene.py` counts an
unsigned judge verdict as a metered row. The 27 verdicts stay in the (gitignored) evidence file; a
Sonnet judge batch can re-decide them on request. Details: the laws-of-motion report, §5.
