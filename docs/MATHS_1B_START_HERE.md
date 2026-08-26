# Starting Maths-1B — read this before authoring the first card

> Written 2026-08-23, when Maths-1A merged into `master` and the book went live at
> **answers.viditra.co**. Audience: whoever authors the next IPE mathematics paper.
> Companion docs: `docs/patterns/answer_book.md` (mechanisms + doctrine),
> `docs/IPE_MATHS_1A_SOURCE.md` (how 1A was sourced).

## 1. Your first move: pull master. Do NOT skip this.

Your branch is **200 commits behind** `master`. Everything you built is safely IN master
already (verified: 250 Maths-1A files, all ten units), plus the physics book, plus the
student layer built since. Working on the old tree is how the one real accident of this
track happened — see §5.

```bash
git checkout feat/ipe-mathematics-answerbook
git fetch origin
git merge origin/master        # expect: fast-forward or a clean merge
npm install                    # katex + anything else added since
npm run build:answers          # expect: 448 files, 454 entries, 272 katex lines
```

**The 17 physics files you deleted will reappear in your folder.** That is correct and
deliberate — see §5. Do not re-delete them.

Keeping this one folder/branch for 1A → 1B → 2A → 2B is fine. The only rule is §6.

## 2. Maths-1B is a NEW SUBJECT VALUE, not new units under `mathematics`

Unit numbers namespace **per subject**. Maths-1A already owns units 1–10 under
`subject: "mathematics"`. Maths-1B has its own Unit 1 (Locus), so putting it under the
same value would make two different chapters share one identity — the catalog, the
triage strip, the exam-eve route and the **study planner** all key on `subject-number`.

So, in `answer-book/units.json`, every 1B unit carries:

```json
{ "number": 1, "name": "Locus (Maths-1B)", "subject": "mathematics_1b", "questions": [ ... ] }
```

Already wired for you — nothing to change in the engine:

| Where | What it does |
|---|---|
| `SUBJECTS` in `src/scripts/build_answer_book.ts` | `mathematics_1b` accepted; a typo still fails the build |
| unit-key guard, same file | **fails the build** if two units share `subject-number` |
| `SUBJ_LABEL` in `answer-book/notebook.js` | chips read **Physics · Maths-1A · Maths-1B** |
| verification note | says "the mathematics and the method are checked" for both papers |

`"mathematics"` means Maths-1A for historical reasons (it predates 1B), exactly the way
an absent `subject` means physics. Don't rename it — 250 files and their ids depend on it.
**Physics-II will need the same treatment** (`physics_2`) whenever it opens.

## 3. File and id conventions

- Questions live in `answer-book/questions/`, one JSON per question, flat directory.
- Id prefix: 1A used `ts_ipe_m1a_<chapter>_<slug>`. **Use `ts_ipe_m1b_<chapter>_<slug>`.**
- **Ids are permanent.** A card that later moves chapter keeps its id (there is a physics
  precedent: `..._mp_average_instantaneous_velocity` still carries an `mp_` prefix after
  moving units). A stale prefix is history, not a defect.
- Unit numbers are the **syllabus/paper** numbers, never invented ordering.
- Catalog order is **array order** in `units.json` — there is no sort. Put the 1B block
  where you want it read (after the 1A block is the natural place).

## 4. The bar a card must clear

The build refuses to produce a page otherwise, so this is enforced, not advisory:

- every step has `why` and `common_mistakes`; every scoring step has `mark_note`
- `memory_tip` and `margin_note` are **all steps or none** per question
- **Rule 41 plain language** — no idioms, metaphors or personification, in any string a
  student reads. (Your 250 1A files tripped this exactly **once**: "the whole trick".)
- marks sum to the total, per question and per cut
- `render: "katex"` **only** where Unicode genuinely cannot express it (matrices,
  determinants, capital subscripts). A fraction or power that reads fine on one line stays
  `plain` — every typeset line is a small break in the handwriting illusion.

Source rules (unchanged from 1A, `docs/patterns/answer_book.md` §enumeration):
**read the source books directly every time**, walk each chapter to its **boundary**
rather than trusting a hit list, run the **two-book union check**, and record
discrepancies instead of resolving them silently.

## 5. Why the 17 physics files came back — and why it can never bite again

Your commit `cb6abc8a` deleted physics Unit 4 to make that desk mathematics-only, and
correctly warned that merging it to master would delete master's copy too. When the books
merged, that deletion was **deliberately not taken** while every genuine improvement in
the same commit (the fixture-owned `recallGrader` test, the length-agnostic LAQ gate, the
data-derived deep link) was kept.

Because `cb6abc8a` is now an **ancestor of master**, the deletion is behind master and
cannot replay: merging your branch into master today is a verified **no-op**. Just don't
re-delete them after pulling.

The root cause was drift — a desk working from an old snapshot. That is what §1 and §6 exist to prevent.

## 6. The only ongoing rule: sync at every paper boundary

Keep the folder for the whole maths syllabus, but:

- **Pull `master` before starting each paper** (and whenever convenient in between).
- **Merge your branch back to `master` when each paper is complete** — 1B done → merge.
  Don't let a year of work sit on one unsynced branch; that is precisely how §5 happened.

## 7. Verify before you hand anything over

```bash
npm run build:answers        # content gates: marks, completeness, Rule 41, katex, unit keys
npx tsc --noEmit             # 0
npx vitest run               # 405/405
npm run smoke:answers        # 45 gates, ~25 min
```

Two traps worth knowing:

- **`dist` is shared and the smoke suite asserts the OFFLINE build.** Order is
  `build:answers` → test → `build:answers:hosted` → serve/deploy. `beforeAll` now refuses
  to run against a hosted dist and prints the fix.
- **One gate ≈ 10 s** vs 25 min for the suite:
  `npx playwright test e2e/answer_book.spec.ts -g "<name>"`. A cold `page.goto` of the
  ~4 MB page hangs about once per full run and passes in isolation — re-run the single
  gate before believing a failure.

**Never deploy.** `npm run deploy:answers` publishes to answers.viditra.co and is the
founder's call alone.
