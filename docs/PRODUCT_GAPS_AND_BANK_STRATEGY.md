# Product gaps, syllabus-level solutions, and the "one-lakh bank" question (2026-09-11)

> Founder questions, 2026-09-11, after the model probes (Runs 1–11) and the reviewer design: (1) can every AI solution be kept at Class 10–12 level; (2) what are we missing or neglecting in the product, and what is not possible; (3) if we pre-solve a very large bank (one college's full material plus the standard books), does a student from any other college benefit — by exact hits, or by pattern similarity that helps the AI. Answered from what was measured, with the assumptions marked.

## 1. Keeping solutions at Class 10–12 level

**Possible, and mostly a prompt — but a prompt alone is not enough.** What works, in layers:

1. **A syllabus contract in the system prompt**, stated positively: "use only methods in the NCERT Class 11–12 syllabus plus the standard coaching techniques for JEE Main / EAPCET / NEET" — with an explicit *forbidden* list (Lagrangian/Hamiltonian mechanics, complex-analysis tricks, matrix exponentials, Laplace transforms, tensor notation, group theory, multivariable Jacobians, research-grade organic reagents…) and an explicit *allowed-though-not-NCERT* list (L'Hôpital, Leibniz rule, Feynman's trick on definite integrals, symmetry arguments — coaching teaches these and JEE expects them). The models default to exam style anyway when given an exam question; the failures are occasional, not systematic.
2. **A level check after generation**, cheap: a second call (or the same call's self-check) that lists every technique used and flags anything outside the allowed list; a flagged solution is regenerated with the flag in the prompt. This is a $0.001 pass.
3. **Retrieval of solved examples from the bank** (§3) is the strongest level control of all: three syllabus-level worked solutions in the prompt set the style far better than a rule does.
4. **The reviewer must not punish a student who legitimately uses a beyond-syllabus method** (a topper's shortcut is still correct); it accepts the work and may note "in the exam, the syllabus method is …".

Measurable today: sweep the ~2,500 stored solutions for beyond-syllabus techniques with the level check, and report the rate per subject. Expected to be low single digits per cent.

## 2. What we are missing — honestly

**Limits of the evidence so far.**
- Every score was measured on **typeset crops with a photo effect**, one question per image. Real phone photos of coaching material — glare, skew, two questions in frame, a thumb — are unmeasured. So is handwriting entirely. The first real month will move the numbers, probably down.
- The **hard tail** (§Run 10) is real: convention questions and drawing-slope reads beat every configuration. The agreement gate handles it by saying "unsure", which is designed but unproven with students.
- **Coaching-material keys are sometimes wrong** (3 of ~300 official keys were, this week). When we disagree with the student's printed key, the student trusts the book. The "our working differs from the key, here is why" flow is a trust builder only if we are right — and that is exactly the case where we must be.

**Things students need that the product does not do yet.**
- **Teaching after diagnosis.** The reviewer says *where* and *why* the step went wrong; then what? The Learn tab has one unreviewed lesson pack. Physics has the sims; maths and chemistry have nothing to send a student to. Diagnosis without remediation is a mirror, not a tutor.
- **Revision and scheduling.** No spaced repetition, no "you were weak on this three weeks ago — try one now", no study plan toward the exam date. This is where the ledger becomes a coach, and it is cheap (no model calls).
- **Speed.** JEE Main and EAPCET are as much about time as correctness. Nothing measures or trains time per question, or teaches which questions to skip.
- **Mock-test analysis.** The highest-value moment in a student's week is the evening after a mock. Uploading a result sheet or OMR and getting a weakness map from it would be the single most used feature, and it is mostly the existing ledger fed a different way.
- **Language.** The product is English-only. EAPCET papers are bilingual and a large share of the students think in Telugu; JEE aspirants in Hindi belts think in Hindi. Explanations in plain English are right for the sims (Rule 30i), but a student who does not understand the diagnosis in English gets nothing from it. At minimum, a "explain this again in Telugu/Hindi" tap on the diagnosis — text only, no audio — is worth measuring.
- **Escalation to a human.** Every UNSURE, every "this review was wrong" tap, and every disagreement with a printed key should be able to reach a teacher (paid or included, within a day). That closes the trust loop and produces the labelled data nothing else can.
- **Low-end phones and bad networks.** A 10–20 s wait on a 4G-lite connection with a 2 GB phone is the real UX. Nothing has been tested on one.
- **Misuse.** A homework-copying student is the product's cost without its value. The review loop (try first, then upload) is the natural antidote and should be the default path, not an option.
- **Privacy vs the flywheel.** The current rule is "photo bytes never stored". The reviewer's data flywheel needs stored pages. That is a consent decision to make deliberately, not a default to drift into.
- **Copyright.** See §3 — the biggest legal exposure in the plan.

**What is not possible (today).**
- A deterministic solver for arbitrary questions (§Run 11). A model plus code plus conventions is the ceiling.
- 100% on the hard tail. The honest product is 99% with a visible "unsure" on the rest, not 100% with hidden errors.
- Reliable reading of a student's *diagrams* by a transcript-based judge; only a vision judge sees them (reviewer §8).

## 3. The one-lakh bank

**How big the sources are (rough, from typical page counts).** One large coaching institute's full material for one exam, three subjects, two years: about 20,000–40,000 questions (chapter exercises, assignments, weekly tests). DC Pandey (5 volumes) ~8–10k; HC Verma ~2.5k; RD Sharma 11+12 ~10k; Cengage maths ~15k; NCERT + Exemplar ~5k. One lakh across sources is realistic. Cost to pre-solve with the two-solver gate: ~$0.008 × 100,000 ≈ **$800** — the solving is the cheap part.

**What is expensive is everything around the solving.**
- *Ingestion*: OCR of printed books with figures, de-duplication, chapter/concept tagging. The EAPCET PYQ corpus (26 shifts, 4,159 questions) took real weeks and a second-reader pass that found 242 wrong keys. A lakh is 25× that.
- *Verification*: the agreement gate is ~99% right when the two solvers agree, but ~12% of hard questions get a disagreement and need a third opinion. For textbook problems the book's own answer key is that third reader — three sources agreeing is as good as it gets; the residual (a few thousand) needs a human.
- *Copyright*: **a coaching institute's material and the standard books are copyrighted.** Ingesting them wholesale and serving their questions back is not a grey area — it is the thing publishers sue over, and coaching institutes are litigious with each other. PYQs of public exams are safe; NCERT is government-published; questions **students themselves send us** are the safest and best-targeted source of all. Get legal advice before scanning a single Narayana module; do not build the company on a competitor's book.

**Does a big bank help a student from another college? Three different mechanisms, three different answers.**

1. **Exact or near-exact hits.** Coaching materials copy each other, the PYQs, and the same standard books, so overlap is real — for standard problems a plausible hit rate is 30–50%, higher on PYQ-derived questions, near zero on an institute's fresh test papers. Numbers-changed variants (very common) are not hits — the bank cannot return the key, only the method. **This is a measurable number and should be measured before anything is built:** take 200 questions from a *different* institute's material and check them against the bank we already have plus a small pre-solved sample. One day of work, and it decides the whole plan.
2. **Pattern similarity helping the AI solve a new question.** The mechanism is retrieval: put the three most similar *solved* bank questions into the solver's prompt as worked examples. For a strong model on standard problems the gain in raw correctness is modest — it already solves 97–99% of those. The gain is elsewhere, and it is exactly where the misses are: **the retrieved examples carry the exam's conventions** (the capacitor error rule), the *expected method* at syllabus level (§1), and consistent notation. Measurable *now* with the EAPCET bank on the 148 hard questions: rerun with retrieval on, see whether the convention-type misses flip. Cost ≈ $2.
3. **Pattern similarity for the reviewer and the ledger.** This is the biggest win and needs no lakh: a bank tagged by concept and pattern means a student's question maps to a pattern, the ledger tracks weakness by pattern rather than by isolated question, the reviewer's judges see the expected method, and the "similar question next" comes from the bank with a verified key. A few thousand well-tagged questions per exam do this; a lakh does it marginally better.

**So — a big bank, built in the right order.**
- **First, the organic bank**: every question a student sends, solved once through the gate, cached by transcribed-question fingerprint, human-verified when disputed. It grows in exactly the distribution students ask, batches of the same college hit it on the second student, and it is legally ours. This is the cache already assumed in the cost model.
- **Second, the public sources**: all PYQs for EAPCET, JEE Main, NEET (public), NCERT + Exemplar. Tag them by concept and pattern. This is the retrieval and similar-question backbone.
- **Third, and only after the 200-question hit-rate measurement and legal advice**: licensed or authored coverage of the standard problem types — either a licence from a publisher, or our own variants authored per pattern (the answer-book campaign already does this at scale, with audits).
- **Never**: scanning a competitor's modules into the product.

## 4. What I would do next, in order

1. Measure the reviewer on real handwriting (Run 12) — the product's core is unmeasured.
2. Measure retrieval-augmented solving on the hard 148 with the EAPCET bank (Run 13, ~$2) — tells us whether patterns fix conventions.
3. Measure the cross-institute hit rate with 200 questions from a different college's material — decides the bank plan.
4. Run the syllabus-level sweep over the stored solutions (§1) — cheap, and it sets the prompt.
5. Product: mock-test analysis into the ledger; revision scheduling from the ledger; a human-escalation path for UNSURE and disputes; a Telugu/Hindi "explain again" on the diagnosis. None of these needs a new model.
6. Decide the consent rule for storing student pages before the reviewer ships.
