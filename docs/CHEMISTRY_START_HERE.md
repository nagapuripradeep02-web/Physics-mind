# Starting a chemistry chapter — read this before authoring the first card

> Written 2026-08-23, when chemistry opened as the Answer Book's third subject with
> Chapters 1–7 of Junior Chemistry. Audience: whoever authors the next chemistry chapter.
> Companion docs: `docs/patterns/answer_book.md` (mechanisms + doctrine),
> `docs/MATHS_1B_START_HERE.md` (the same playbook for a new mathematics paper).

## 1. Your first move: pull master. Do NOT skip this.

```bash
git fetch origin
git merge origin/master        # expect: fast-forward or a clean merge
npm install
npm run build:answers          # note the file/entry counts it prints, before you touch anything
```

The one real accident of this track came from a desk working off an old snapshot
(`docs/MATHS_1B_START_HERE.md` §5). Sync at every chapter boundary, and merge back to
master when a chapter is complete.

## 2. Chemistry needed NO engine change — it was already wired

`chemistry` was whitelisted everywhere the maths work generalised the subject dimension.
Verify, do not rebuild:

| Where | What it does |
|---|---|
| `SUBJECTS` in `src/scripts/build_answer_book.ts` | `chemistry` accepted; a typo still fails the build |
| unit-key guard, same file | **fails the build** if two units share `subject-number` |
| `subject` enum in `src/schemas/answerBook.ts` | `chemistry` is a legal question subject |
| `SUBJ_LABEL` in `answer-book/notebook.js` | the chip reads **Chemistry** |
| verification-note wording | already branches on `subject === 'chemistry'` |
| the e2e subject-filter gate | fully data-derived — it iterates `PM_UNITS` and needs no edit |

Unit identity is `subject-number` everywhere (catalog chips, triage, the exam-eve route
**and the study planner**). Chemistry owns its own units 1–7, so there is no collision with
physics 2–9 or maths 1–10, and the build guard proves it mechanically.

**Chemistry-II will need its own subject value** (`chemistry_2`), exactly as Maths-1B did.
One PAPER = one subject value. `chemistry` means Junior/first-year chemistry, the same way
an absent `subject` means physics.

## 3. The source, and the gap you must keep recording

The only chemistry source book held is the **Sri Chaitanya Junior Fastrack**, chemistry half,
**book pp.48–96 over 13 chapters** (PDF page = book page + 2). It carries the star ranks
(`***`/`**`/`*`/none) that are our `pyq_frequency` signal.

> **2026-09-02 — the syllabus changed under this book.** The 2026-27 first-year chemistry syllabus
> has TEN chapters (the Sri Chaitanya 2026-27 *IPE Study Material*, `DocScanner (4).pdf`, is the
> source in hand): States of Matter, Hydrogen and Environmental Chemistry are gone; Stoichiometry,
> Thermodynamics and Chemical Equilibrium are now chapters 4, 5, 6; s-Block (7), p-Block 13 (8),
> p-Block 14 (9) and General Organic Chemistry (10) follow. The bank was renumbered and States of
> Matter retired (unit 99) on 2026-09-02 — see `docs/SYLLABUS_2026_27.md` §2. Questions taken from
> the 2026-27 book carry `source: "chaitanya_fastrack"` and `stars: 0` (docs/ORIGINALITY_MATHS.md R1);
> the 13-chapter page map below describes the OLD 2024 Fastrack only.

**The two-book union check CANNOT be run for chemistry.** The TSBIE Basic Learning Material
PDF in hand is physics only. Founder decision 2026-08-23: proceed Fastrack-only and record
the gap rather than wait. The same holds for the **back-test** — no chemistry board paper is
in the corpus, so the diff-against-a-real-paper step is pending too. Both gaps are written
into the `units.json` comment; keep writing them into every new chapter's note until a second
chemistry source arrives, and run both checks the moment one does.

Read the source **directly, every chapter, every time** — never a previous session's
transcription. Walk each chapter to its **boundary**: chemistry packs two chapters onto one
page (ch.5 starts mid-page 66, ch.7 mid-page 75), so read one page either side of the range.

### What the chemistry half looks like, measured

- **Only chapters 1, 2 and 3 have a Long Answer section** (8 LAQs in total). Chapters 4–7 stop
  at SAQ. Do NOT invent an 8-mark form — author an LAQ only where a source book asks one.
- **There is no PROBLEMS section anywhere in chemistry.** Numericals sit inside the VSAQ and
  SAQ lists, so they ARE the asked bank and must be authored. The physics "PROBLEMS deferred"
  decision does not arise here.
- **Stars are front-loaded** per section (`***` → `**` → `*` → an unranked filler tail).
- **Exam-year citations are rare**, clustered at ch.4 VSAQ 23/24/25 and ch.5 SAQ 9/10/12.
  Everywhere else `appearances[]` is empty and the stars carry the whole priority signal.
- **Cuts are common.** The same prompt appears at two or three lengths far more often than in
  physics (σ vs π; Graham's law and Dalton's law each at three lengths; Kp/Kc at three;
  entropy; Cp − Cv; dipole moment; oxidation numbers). One authored step list, several cuts.
- **"(or)" has two different jobs**: an alternate wording of the QUESTION, and an alternate
  printed ANSWER. Decide which per question; do not resolve it silently.

## 4. The bar a card must clear

Build-enforced, so this is not advisory:

- every step has `why` and `common_mistakes`; every scoring step has `mark_note`
- `memory_tip` and `margin_note` are **all steps or none** per question — chemistry authors
  both on every step of every card
- `insider_note` on every asked card; omitted on predicted cards
- marks sum to the total, per question and per cut
- **Rule 41 plain language** — no idioms, metaphors or personification in any string a student
  reads. Chemistry is unusually prone to this: a reaction never "wants" to go right, electrons
  never "prefer" an orbital, an atom is never "happy", a system never "fights back". The
  imported word list catches perhaps half; scan by hand.
- **`render: "katex"` is not used by chemistry at all.** Chemical notation is expressible in
  Unicode (H₂SO₄, Fe³⁺, ⇌, →, ΔH, ν̄, σ, π, °, ½), so chemistry adds **zero** katex lines.
  Check the katex count before and after your chapter; it must not move.
- **Unicode has a subscript x but no subscript y or z**, and none for p, c, v or w. So orbitals
  are plain px, py, pz, dxy, dz², and the thermodynamic and equilibrium constants are plain Cp,
  Cv, Kp, Kc, Kw — never a Unicode subscript mixed with plain letters. Same call as the plain
  i, j, k axis vectors in the mathematics cards.
- `recall` blocks and `recall_prompt` are NOT authored — that feature is dormant.

Ids are `ts_ipe_c1_<chapter-abbr>_<slug>`: `c1` = Chemistry paper 1. Abbreviations in use —
`as` Atomic Structure, `cp` Classification/Periodicity, `cb` Chemical Bonding, `som` States of
Matter (retired 2026-09-02, ids kept), `st` Stoichiometry, `td` Thermodynamics, `ce` Chemical
Equilibrium; reserved for the 2026-27 chapters — `sb` s-Block Elements, `p13` p-Block Group 13,
`p14` p-Block Group 14, `goc` General Organic Chemistry. **Ids are permanent**; a card that later
moves chapter keeps its id (the `som` cards now sit under unit 99 with their ids unchanged).

Catalog order is **array order** in `units.json` — there is no sort. Chemistry sits between the
physics block and the mathematics block.

## 5. The book teaches what is MARKED, not what is true

Where the source is wrong or sloppy, write the correct chemistry on the card and record the
book's position in that step's `why` and in `verification.note`. Never silently follow an error,
and never silently correct one either. Recorded so far:

- ch.1 VSAQ 9 — the book prints `n − l − 1` as "the number of nodes". That is the **radial**
  count; the total is `n − 1` and the nodal planes are `l`. The card writes radial nodes plus
  the total, so the worked 3d example still agrees with the book.
- ch.1 LAQ 2 — the book credits the magnetic quantum number to **Lande**. That is the
  attribution the paper marks; it is more usually traced to Sommerfeld and Zeeman.
- ch.1 — the book prints `h = 6.625 × 10⁻³⁴ J s`; the accepted value is `6.626`. Either is marked.
- ch.1 VSAQ 2 — the book works it in CGS and the card works it in SI. Same answer, 5 × 10¹⁴ Hz.

Sign conventions in Thermodynamics are the highest-risk area: use ΔU = q + w with w = work done
**on** the system, ΔH = ΔU + Δn(g)RT counting gaseous moles only, and ΔG = ΔH − TΔS. If the book
uses the older "work done by" convention anywhere, write the NCERT one and record the difference.
*(Audited 2026-08-25: the NCERT convention is applied consistently on all 25 ch.6 cards. Only two
cards write a work term at all, which is why it held — q is positive-in under both conventions.)*

## 5a. The card must not contradict ITSELF — what the 2026-08-25 audit found

Seven examiners read all 196 cards and found 11 errors, 36 ambiguities and 54 gaps. **The
arithmetic was sound** — chapters 4 and 5, 76 numerical cards, had every boxed answer,
half-reaction, molar mass and oxidation number recomputed and none was wrong. Every error was in
the **explanation layer**, which is exactly the layer Vidi is grounded on and no gate reads.

The recurring shapes, in the order they cost marks:

1. **A `common_mistakes` entry that names the CORRECT move as the error.** Four separate cases:
   `cb_bond_order_he2` listed "bonding minus antibonding" (its own boxed formula);
   `ce_lechatelier_principle` called "the system opposes the change" a mistake (NCERT's own
   wording); `som_ke_4g_methane` named *subtracting* as the error where 273 − 73 = 200 is
   correct; `cp_highest_ea_en` named chlorine where the trap is fluorine. **Read every mistakes
   entry against the step's own marked lines before shipping.**
2. **`insider_note` contradicting its own `mark_split`.** `as_photoelectric_effect` claimed three
   of four marks on a 2M step; `td_second_law` said "either form" against a 1M+1M split, and that
   one produced a harmful reply. The insider note is prose written last and checked by nothing —
   re-read it against the split every time.
3. **A trend stated as absolute while a sibling card boxes the exception.**
   `cp_periodic_properties_trends` gave the IE and electron-gain trends flat while
   `cp_ie_nitrogen_oxygen` and `cp_ea_chlorine_fluorine` box N > O and Cl > F. Silence about an
   exception is what makes an AI state a trend backwards.
4. **A count that disagrees with the card.** A margin note saying "four numbered points" on a
   five-point answer, where the fifth point is the one the mistakes line says must not be dropped.

**The cut limit you cannot author around.** `applyCut` in `answer-book/notebook.js` overrides only
`marks`, `label`, `lines`, `margin_note`, `why`, `memory_tip`, `mark_note`. **`common_mistakes`
and `insider_note` are NOT cut-overridable** — a cut-level key for either is silently dropped. So
a card served at two lengths must have BASE text that is true at every length. Four cards were
shipping 4-mark insider notes and 4-mark mistakes to 2-mark students ("parts (a) and (b)" on a
card with no parts; "the applications carry half the marks" on a form where they earn nothing).

**What a grader sees that an examiner cannot.** The examiner pass reads raw JSON; the audit's
graders read the ASSEMBLED grounding context, and that is where the insider/split contradictions,
the two `STARS: 0` renderings, and the truncated chapter roster all surfaced. Run both, and run
the audit second so its findings can be fed back.

## 6. The enumeration sweep

After the asked cards, list the chapter's object inventory from the syllabus, cross it with the
archetypes, delete the cells the book already asks, and author roughly 8–10 predicted lean cards
for the gaps (`source: "enumerated"` on the manifest entry, `verification.note` opening
"PREDICTED, not asked.", no `insider_note`).

**What the sweep finds missing arrives as WHOLE NCERT SECTIONS, not scattered questions.**
Chapter 1's sweep recovered the entire atomic-number/mass-number/isotopes block, the whole
Rutherford model with its limitations, the Rydberg equation, wave number and ψ² — none of which
the Fastrack asks at all. A commercial bank tracks what was *asked*, so it inherits whatever the
examiners skipped, whole.

**Sweep against the WHOLE bank, not the chapter's own unit.** Nothing automatic catches
cross-unit or cross-subject duplication — the drift gate only checks that an entry resolves to a
file. Chemistry Thermodynamics can collide with physics Work-Power-Energy, and chemistry States
of Matter with physics kinetic theory. Check the existing files before authoring.

## 7. Verify before you hand anything over

```bash
npm run build:answers        # content gates: marks, completeness, Rule 41, katex, unit keys
npx tsc --noEmit             # 0
npx vitest run
npm run smoke:answers        # the full e2e suite, ~30 min at this fleet size
```

Two traps worth knowing:

- **`dist` is shared and the smoke suite asserts the OFFLINE build.** Order is
  `build:answers` → test → `build:answers:hosted` → serve/deploy. `beforeAll` refuses to run
  against a hosted dist and prints the fix.
- **One gate ≈ 10 s** vs the full suite:
  `npx playwright test e2e/answer_book.spec.ts -g "<name>"`. A cold `page.goto` of the multi-MB
  page hangs about once per full run and passes in isolation — re-run the single gate before
  believing a failure.

The three fleet sweeps (construction lines, figure labels, and the widest one, every cut of
every question) carry a 900 s budget measured at a slope of about 0.9 s per question. **Raise
them when the book grows; never trim the sweep or its waits to fit** — a shortened sweep
silently stops checking the questions it drops. Record the new measurement in the comment.

**Never deploy.** `npm run deploy:answers` publishes to answers.viditra.co and is the founder's
call alone.
