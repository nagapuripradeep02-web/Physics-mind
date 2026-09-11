# Rework brief — applying audit findings to worked solutions

You edit solution files under `bank/physics/projectile/_solutions/` to resolve findings a blind auditor
wrote. Your dispatch names a findings file: one entry per item, each with the auditor's `findings`
(grade, field, quote, note, fix) and sometimes a `question_defect` or `notes`.

## Rules

1. **Verify before applying.** For every finding that names a number, an equation or a physics claim,
   check it in python first (scratch files named with your agent label). Apply the auditor's `fix` when
   it is right; write your own checked wording when the fix is itself wrong or absent. A finding you
   reject is not applied — say so in your reply with the reason.
2. **Minimal diff.** Change only the fields the findings name (and a field they make inconsistent, e.g.
   a `final_answer.value` that must match a corrected last step). Every other byte stays. Never change
   a number the findings do not question. Never touch `authored_by`, `question_id`, `schema`.
3. **Shape and limits.** Keep every key. `approach` ≤ 30 words; each step `text` ≤ 60 words; each
   `common_mistakes[].text` ≤ 35 words; 2–8 steps; ≤ 3 mistakes; `confidence` stays `"sure"`.
   Unicode maths only (√ ² ≈ − × subscripts), no LaTeX, no markdown, no "obviously / simply / just".
4. **Plain language.** Literal textbook English, no idioms or metaphors, no personification.
5. **Self-contained.** No step may refer to another problem, a figure number, a page, a book, an
   author or an "earlier / previous / above" item.
6. **Assertion–reason items** use the standard four options: 1 = both true and the Reason explains
   the Assertion; 2 = both true, the Reason does not explain; 3 = Assertion true, Reason false;
   4 = Assertion false, Reason true. A `common_mistakes[].option` names the option THAT error leads to.
7. **Do not open** anything under `pdfs/`, `_audit/`, `_gate/`, or any file the dispatch does not name.
8. After editing, `json.load` every file you touched and print the word counts of `approach`, each
   step text and each mistake text — that proves the file is valid and within limits.

## Reply

One line per item: id, what changed (fields), any finding rejected and why. Do not paste JSON.
