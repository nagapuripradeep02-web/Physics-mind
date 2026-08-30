# Originality record — IPE Answer Book, Mathematics 1A / 1B

> Opened 2026-08-30, before any content from the Sri Chaitanya maths Fastrack was read into the
> bank. Its purpose is to answer one question with evidence rather than assertion: **where did our
> maths answers come from?** It is written to be read by someone who is not on the team.

## 1. The claim this file supports

Our Maths 1A and 1B answers were authored from the **Telangana syllabus, past papers, and a
different publisher's question bank** — not from any Sri Chaitanya publication. Every card predates
our first sight of the Sri Chaitanya maths Fastrack.

## 2. The source we did use

| Paper | Source book | Declared in | First committed |
|---|---|---|---|
| Maths 1A | *"JUNIOR INTER MATHS-1A, Baby Bullet-Q"* — Sri Publishers, Machilipatnam | `docs/IPE_MATHS_1A_SOURCE.md` | 2026-08-21 (`67abe3ad`) |
| Maths 1B | *"JUNIOR INTER MATHS-1B, Baby Bullet-Q"* — Sri Publishers, Machilipatnam | `docs/IPE_MATHS_1B_SOURCE.md` | 2026-08-24 (`b80a8738`) |

The Sri Chaitanya *IPE Junior Fastrack* is a source for **physics, chemistry and botany only**, and
is declared as such in those subjects' own records. **No maths card in the bank references Sri
Chaitanya** — verified by full-text search over all 358 maths cards: 0 matches.

What we took from the Baby Bullet-Q, per the standing house rule recorded in three places
(`docs/IPE_MATHS_1A_SOURCE.md` L83, `docs/IPE_MATHS_1B_SOURCE.md` L16, the `units.json` comment):

> **"Take question text, mark split, star rank and years. Never the prose."**

And the founder-level constraint in `docs/DISCUSSIONS.md` L48:

> *"our stored bank must be authored from the syllabus and past papers — publisher guide text must
> never become our stored content."*

## 3. The dates

All **358** maths cards were first committed between **2026-08-21T15:20** and
**2026-08-24T04:24** (Europe/Berlin):

| Day | Cards first committed |
|---|---|
| 2026-08-21 | 124 |
| 2026-08-22 | 126 |
| 2026-08-24 | 108 |

Full per-file record: [`docs/evidence/maths_first_add.tsv`](evidence/maths_first_add.tsv) — 358
rows, `first_committed_at · commit · file`.
SHA-256 `6fd4454b7823089b2c19e864527a18a744651069576ee45136bf809cd489eb40`.

Reproduce it with:

```
git log --diff-filter=A --format='C|%H|%aI|%an|%s' --name-only -- answer-book/questions/ \
  | awk -F'|' '/^C\|/{h=$2;d=$3;next} /ts_ipe_m1[ab]_/{print d"\t"substr(h,1,10)"\t"$0}' | sort
```

## 4. When the Sri Chaitanya maths Fastrack first reached us

Three phone scans, received **2026-08-30**, six days after the last maths card was committed:

| File | SHA-256 | Received | Contents |
|---|---|---|---|
| `DocScanner (2).pdf` | `f53997a011c78869da3eff0b1ee4ca8d02de07189b671306ce1d8c5810f0150c` | 2026-08-30T14:35:39+0200 | Maths 1A, printed pp. 5–59 |
| `DocScanner 29 Aug 2026 10-04 pm.pdf` | `6c279cf902e12bf4dff6529292ae6b1e3f7797f7c88220e9da6f3722616a5ab6` | 2026-08-30T14:36:25+0200 | Maths 1A, printed pp. 60–132 + Model Paper IA |
| `DocScanner.pdf` | `e1156b3681735d955213ff1df1a965c81c20cea765242036d1203d1c5c881c16` | 2026-08-30T14:35:20+0200 | Maths 1B, printed pp. 134–232 + Model Paper IB |

**The ordering is therefore verifiable from the repository alone:** the bank existed in full, in
git, before the book was in the building.

## 5. Why two independent compilations overlap heavily — and why that is not evidence of copying

Both books compile the *same underlying material*: Telangana Board of Intermediate Education past
questions and Telugu Akademi textbook exercises. Neither publisher originated those questions and
neither owns them. Substantial overlap between any two Telangana IPE maths question banks is the
expected result, not a signal.

What a publisher *does* own in such a book is its **compilation** — which questions it selected, how
it arranged them, and its priority ranking — together with its **solution prose** and its
**figures**. The rules in §6 exist to keep us clear of all three.

## 6. Rules for using the Sri Chaitanya scans (binding on this work)

- **R1 — Their per-question stars are a research signal, never our published ranking.** They may
  inform *what we choose to author*. They are not copied into `units.json`. (Our existing `stars`
  values are the Baby Bullet-Q's, and for maths long answers are that book's *chapter* rank, not the
  question's — recorded in the `units.json` comment.)
- **R2 — We never mirror their arrangement.** We order by the official syllabus. Their distinctive
  structural choices are specifically not followed: `TRANSFORMATIONS` printed as an unnumbered
  chapter inside ch.8; `CONTINUITY` folded inside `LIMITS`; Applications of Derivatives split five
  ways. (Our Unit 10 ships as one unit — a decision recorded in `units.json` before these scans
  arrived.)
- **R3 — Independent corroboration per card.** Each new card names where the *question* comes from —
  a Telugu Akademi exercise, or a named TSBIE/AP paper and year — and states that the solution is
  our own working. A question found *only* in the Fastrack is restated from the textbook or dropped,
  never transcribed.
- **R4 — Solutions are authored from scratch.** Our step / marks / `why` / `common_mistakes` /
  `margin_note` architecture is a different work from their running `Sol:` prose. Their 1A volume
  prints no mark allocation at all, so no mark split of ours can have come from it.
- **R5 — A similarity gate** (`check:originality`) flags any long shared word-run between our
  rendered answer text and the internal source index, and runs in the verify chain before ship.
- **R6 — The internal source index is never shipped.** `answer-book/sources/chaitanya_maths_1*.json`
  holds our own restatement of each stem plus page/section/star, for diffing only. It is
  git-ignored out of the built bundle and never read by `build_answer_book.ts`.

## 6b. What this scope deliberately leaves out — measured, not estimated

`check:originality` is scoped to mathematics by founder decision (2026-08-30). Running it unscoped
is what measured the rest, and the number belongs on the record rather than in a footnote:

| Subject | Cards citing Sri Chaitanya |
|---|---|
| Zoology | 190 |
| Chemistry | 148 |
| Botany | 115 |
| Physics | 68 |
| **Total** | **521** |

Those four subjects were authored **from** a Sri Chaitanya title — the *Junior Phy & Chem Fastrack*
and its siblings — and they **do** republish that book's priority stars in `units.json`, which the
live product renders. That is a larger exposure than anything in mathematics, where our bank came
from a different publisher entirely.

R1 is not enforced there yet. The gate prints this count on every run rather than filtering it away,
because a number that stops being printed stops being true. Bringing those subjects in scope is a
founder decision, not a tidy-up: it means recomputing a displayed priority signal for 521 cards.

## 7. The reverse question: did their edition take anything from ours?

**We have no evidence that it did, and we should not claim it.** A full read of all 226 scanned
pages found none of this book's distinctive features:

- no mark splits anywhere in the 1A volume, and no per-step mark allocation in either;
- no step architecture, no "why this step earns the mark" rail, no common-mistakes register;
- solutions are continuous `Sol:` working in the conventional Telugu-state coaching format.

The edition is also demonstrably recent on its own evidence — it carries the two NCERT-foundation
chapters added for 2026-27 (Sets & Relations, Sequences & Series) and prints 8-mark long-answer
banners — so both works are recent, and recency alone settles nothing in either direction.

**Open input:** no scan includes a cover or copyright page (1A begins at printed p.5, 1B at p.134),
so this edition is undated in our hands. A photograph of the copyright/edition page of both volumes
would close that gap.

---

*Maintained under `docs/`. Update §3 and §4 whenever a new source enters the maths track.*
