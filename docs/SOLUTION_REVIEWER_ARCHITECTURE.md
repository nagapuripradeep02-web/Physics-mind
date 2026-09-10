# Solution Reviewer — architecture (v1 draft, 2026-09-11)

> The founder's bar (2026-09-11): the reviewer must be **twice as strong as the solution generator**, because the product is not the answer — it is reading a student's own written solution, finding where and why it went wrong, teaching the concept, and turning that weakness into a strength over repeated attempts. A student who is told their correct work is wrong, or given a confident wrong diagnosis, stops trusting the app. Everything below is built around that failure mode.
>
> Numbers cited are from `docs/MODEL_PROBES.md` (Runs 1–11, ~2,500 calls). Nothing about handwritten pages has been measured yet — §6 is the gate before any of this ships.

## 1. What the reviewer does

Input: the question (photo or bank id), **our verified reference solution**, the student's **typed final answer**, and a photo of the student's handwritten working (up to three per question, each a new attempt).

Output, one of exactly three:

| verdict | meaning | what the student sees |
|---|---|---|
| **CORRECT** | final answer matches and the working holds — including a valid method different from ours | "Correct. Your method: … Ours: … (both fine)." then a similar question |
| **ERROR AT STEP n** | the first line where the working stops being right, its class, and what should be there | the student's own line quoted, what it should be, the concept in two lines, "fix from here and send again" |
| **UNSURE** | the two judges disagree or the page cannot be read | never a guess: "I can't tell at line n — retake the photo / type the value you got at that step" |

Plus a **ledger episode** (evidence `photo`, confirmed only on ERROR) into the Weakness tab's shape ledger, which already ranks evidence as typed number > picked option > photo > claim and needs ≥3 confirmed of one type before it names a headline weakness.

## 2. Why reviewing can be stronger than solving

The generator has to find the answer from nothing. The reviewer holds three things the generator never had: a **reference solution already agreed by two solvers** (or from the bank), the student's **typed final answer**, and the student's **own lines** to compare against. Comparing is a narrower task than solving, so the same models score higher on it — and where a line is an equation, whether it follows from the previous line is a *computation*, which code checks exactly. The measured lesson from Run 11 is that code did nothing for *solving* but is the right tool for *checking* steps.

## 3. The pipeline

```
photo ──► S0 intake gate ──► S1 transcribe (strong reader) ──► S2 deterministic checks
                                                                       │
                              ┌─── Judge A: Gemini 3.7 Flash, sees the PHOTO + reference + S2 facts
                              ├─── Judge B: DeepSeek V4.1 Flash high, sees the TRANSCRIPT + reference + S2 facts
                              ▼
                     S4 arbiter (code, no model) ──► verdict ──► S5 teach + ledger + similar question
```

**S0 — Intake gate ($0).** Reject blur/dark/cut pages before spending anything (a legibility score from the transcriber's first pass, or a cheap sharpness check). Ask for the typed final answer first — it is the cheapest and most reliable evidence and already the Weakness tab's rule.

**S1 — Transcribe (Gemini 3.7 Flash).** The page becomes structured lines: `[{n, text (LaTeX), kind: equation | statement | diagram | final, legible: 0–1}]`, with unreadable spans marked as unreadable, never guessed. **Never a cheap reader here**: the runs showed Flash-Lite drops exactly the detail that matters (100 vs 144 on the same photos) and a solver then repeats the error. Cost ≈ $0.005.

**S2 — Deterministic checks (our code, $0).** Machine facts the judges must respect:
- final answer vs key (exact, or 1% tolerance on numbers — the `Num.matchOption` rule);
- for each pair of consecutive equation lines that parse, algebraic/numeric equivalence (SymPy; sample the free variables) — "line 4 does not follow from line 3";
- the **exam-convention library**: error propagation the EAPCET way, significant-figure rounding, g = 10 vs 9.8, standard constants. This is the only thing that catches the capacitor-type miss (Run 10) — every model computes the physically right error; the exam wants the summed one.

**S3 — Two judges, in parallel.** Each returns the same fixed schema and nothing else:
`{verdict, first_error_line, error_class, what_should_be, concept_tag, evidence_quote, confidence}` with `error_class ∈ {concept, method, calculation, reading, convention, presentation}`. Judge A reads the photo itself (it sees strike-outs, diagrams, margins the transcript loses); Judge B reads the transcript (independent path, different model family, cheaper). Both get the reference and the S2 facts. Cost ≈ $0.006 + $0.003.

**S4 — Arbiter (code).** The trust rules live here, not in a prompt:
1. **CORRECT** if the final answer matches the key **and** S2 found no failing step **and** at least one judge says correct. A valid method that differs from ours is correct by construction — the reference is a comparison aid, never the standard.
2. **ERROR AT n** only if both judges name the same line (±1) with the same class, **or** one judge names a line where S2 has a machine fact. The quoted `evidence_quote` must match a transcript line; a judge that quotes text not on the page is discarded for that review.
3. Everything else is **UNSURE**, and UNSURE asks for one cheap piece of evidence (retake, or "type what you got at line n") rather than spending on a third model.
4. A hedged judge ("step 3, or possibly 5") counts as disagreement.

**S5 — Teach, ledger, next question.** The response shows only the *first* error, never the whole reference (the student has up to three attempts; dumping the solution ends the loop). Plain, literal English. Then a similar question **from the bank** (same concept tag, free, verified key) — never a generated one with an unverified key. The ledger gets one episode per attempt; the third confirmed error of one class on one concept is what turns into the headline weakness.

## 4. Hard trust rules

- **No confident wrong verdict.** The number to minimise is the false-error rate on correct work, not the miss rate. UNSURE is always acceptable; a wrong ERROR is not.
- **Every disputed line is the student's own line, quoted.** If it cannot be quoted, it cannot be disputed.
- **Different method ≠ wrong.** Rule 1 of the arbiter.
- **Say "I can't read this" instead of guessing.** Unreadable spans propagate to UNSURE.
- **Never solve fresh inside the reviewer.** If the reference is missing (no bank hit, solvers disagreed), the question goes back to the solver path first; the reviewer never compares against a single-model answer.
- **The student's typed final answer is evidence; the photo confirms it.** Same order as the Weakness tab.

## 5. Cost and latency

| stage | model | $ per review | seconds |
|---|---|---|---|
| S1 transcribe | Gemini 3.7 Flash | ~0.005 | 5 |
| S2 checks | our code | 0 | <1 |
| S3 judge A | Gemini 3.7 Flash | ~0.006 | 5 (parallel) |
| S3 judge B | DeepSeek `high` | ~0.003 | 10 (parallel) |
| **total** | | **~$0.014** | **~10–12 s** |

That is roughly twice a solve ($0.008 with the agreement gate) — the founder's "twice as strong" has a price, and this is it. Second and third uploads of the same question re-transcribe only (the reference and S2 setup are reused), ≈ $0.011. At the obsessed-student volume (§22 of MODEL_PROBES: ~220 reviews a month) that is ≈ $3, on top of ≈ $4.3 of solves.

Degradation ladder if cost must fall, in order: judge B on DeepSeek `low` for text-only pages; drop judge B on pages where S2 already pins the failing line; never degrade S1.

## 6. The gate before shipping — measure it the same way as the solver

Nothing here is trusted until it is measured on real handwriting, with the same discipline as Runs 1–11:

1. **A labelled set of ~100 handwritten pages** (founder-supplied photos): ~30 fully correct, ~50 with a **planted error at a known line and class**, ~10 correct by a *different* method from the reference, ~10 messy or partly illegible. Labels sealed before any model sees a page.
2. **Metrics:** false-error rate on correct pages (**target ≤ 2%** — this is the trust number), first-error localisation within ±1 line (≥ 85%), error-class accuracy (≥ 80%), UNSURE rate (≤ 15%), and cost/latency per review.
3. **Controls:** the correct-by-different-method pages are the negative control for rule 1; a reviewer that flags any of them fails. An always-says-error dummy must be caught by the harness.
4. **Ablations:** judge A alone, judge B alone, both with and without S2 — so the "twice as strong" claim is a measured delta, not a design belief.
5. Results append to `docs/MODEL_PROBES.md` as Run 12; the harness is `scripts/model_probes/` extended with a `review_probe.py`.

## 7. The data flywheel

Every reviewed page, its transcript, the two judge outputs, the arbiter verdict, and what the student did next (fixed it / disputed it / gave up) is stored. That set is (a) the growing eval set for §6, (b) the source of the real misconception taxonomy — the `error_class × concept_tag` pairs that actually occur, which is the same moat as `student_confusion_log` — and (c) the evidence for pricing the coaching tier. A student's "this review was wrong" tap is the most valuable row in the table.

## 8. Open questions

- Handwriting transcription quality on phone photos of ruled paper: unmeasured; may need a retake prompt more often than expected.
- Diagrams in the student's working (free-body diagrams, circuits, graphs): judge A sees them, the transcript mostly does not — does judge B's blindness make disagreement too frequent?
- Multi-page solutions: stitch or review per page?
- Whether the review should ever show the reference in full (proposal: only after the third attempt, or on request).
- Vault sync of the model-selection and reviewer decisions is still pending founder confirmation.
