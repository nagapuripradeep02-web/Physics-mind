# Vidi audit — slice 1 of 11 — Physics-II (TS IPE)

Grading reader report. Rubric followed exactly as printed at the top of
`audit_r1_ts_ipe_p2.slice-01.md` (0–3 scale, graded against the ANSWER FACTS
shown above each group, never against my own physics knowledge). 24 question
cards × 10 templates = 240 replies. Every reply graded; none sampled.

## 1. Per-template table

| Template | Mean | 0 | 1 | 2 | 3 | N |
|---|---|---|---|---|---|---|
| marks | 3.000 | 0 | 0 | 0 | 24 | 24 |
| whystep | 3.000 | 0 | 0 | 0 | 24 | 24 |
| remember | 3.000 | 0 | 0 | 0 | 24 | 24 |
| explain | 3.000 | 0 | 0 | 0 | 24 | 24 |
| mistakes | 3.000 | 0 | 0 | 0 | 24 | 24 |
| important | 3.000 | 0 | 0 | 0 | 23 | 23 graded (+1 guard reply excluded, see §2) |
| skiplast | 2.917 | 0 | 0 | 2 | 22 | 24 |
| why | 2.917 | 0 | 0 | 2 | 22 | 24 |
| outofbank | 2.792 | 0 | 0 | 5 | 19 | 24 |
| telugu | 3.000 | 0 | 0 | 0 | 24 | 24 |

**skiplast** — the two `2`s (`ts_ipe_p2_ac_transformer_principle_working`,
`ts_ipe_p2_atm_bohr_postulates_radius_energy`) are correct on the marks
arithmetic but pad the "steps you must still write" list with a 0-mark item
(the ungraded figure, or the 0.53 Å value restated as if it were its own
step) — not misleading, just loose.

**why** — the two `2`s are the two `OVER_BUDGET` replies (see §5); both are
physically correct, just longer than the template's own word target.

**outofbank** — the five `2`s are SCOPE-CREEP (see §4); the decline itself
is correct in all 24, but 5 of them volunteer unrequested content from the
open card.

## 2. Overall mean

- **Overall mean: 2.962** (708 / 239 graded replies, 3 dp)
- **Total reply count in slice: 240**
- **Guard replies (excluded from mean, counted separately): 1** —
  `ts_ipe_p2_ac_bed_lamp_transformer` · `[important]` · *"I could not answer
  just now. The answer book still works — keep going, and try me again in a
  moment."* This is notable: the guarded question ("is this question
  important? did it come in previous exams?") is a completely ordinary,
  in-bank, answerable question — every other card's `[important]` reply
  answers it cleanly. This looks like a one-off serving hiccup rather than an
  intentional guard trigger, and it is the *first* reply in the whole slice,
  which is a bad first impression if it recurs at scale.

## 3. Replies scored 0 or 1

**None.** No reply in this slice was scored 0 or 1. Every graded reply was
factually correct against its ANSWER FACTS block; the only deductions were
to 2 (padding / over length / unrequested content), never to 1 or 0.

## 4. Four explicit counts

- **WRONG-STEP: 0 of 24.** Every `[whystep]` reply names and explains
  exactly the step the situation names, and attributes marks to the correct
  step. No swaps found.
- **SCOPE-CREEP: 5 of 24.** All 24 `[outofbank]` replies correctly decline
  the off-paper "ideal gas equation" question. Five then volunteer unrequested
  content — steps, formulas, or the answer — of the open card, beyond a bare
  offer to help:
  - `ts_ipe_p2_ac_phase_difference_r_l_c` — states all three phase
    differences (resistor 0°, inductor lag π/2, capacitor lead π/2)
    unprompted.
  - `ts_ipe_p2_ac_transformer_turns_numerical` — states the relation
    Vₛ/Vₚ=Nₛ/Nₚ and the computed answer Nₛ = 100 turns unprompted.
  - `ts_ipe_p2_ac_unity_power_factor_phase` — states "write cos φ = 1, so
    φ = 0°... That earns both marks" unprompted.
  - `ts_ipe_p2_ac_wattless_current` — names the specific answer component
    "I sin φ" and its mark value unprompted.
  - `ts_ipe_p2_atm_impact_parameter_scattering` — quotes the full formula
    b = Zе² cot(θ/2) / 4πε₀(½mv²) unprompted.

  The other 19 `[outofbank]` replies stay to a bare one-sentence offer
  ("I can help you with X if you want") with no formulas/marks/steps —
  correctly NOT counted as creep.
- **LITERAL-MARKDOWN: 1 of 240.** `ts_ipe_p2_atm_closest_approach_impact_parameter`
  `[telugu]` uses `**bold**` markdown around both sub-headings
  ("**Distance of closest approach (r₀):**" / "**Impact parameter (b):**").
  This is the only reply in the whole slice containing `**`, a leading `- `
  bullet, a `#` heading, or a backtick.
- **TRUNCATED: 0 of 240.** No reply ends mid-sentence or mid-formula.

## 5. Mechanical flags on replies I judge wrong

None of the flagged replies were judged wrong (0/1) — but per the
instructions, flags are hints worth reporting regardless of verdict:

- **`GUARD_REPLY`** (`ts_ipe_p2_ac_bed_lamp_transformer` `[important]`) —
  fired correctly (it is a guard message), but the underlying event is a
  finding in its own right: see §2. A guard fired on a normal, in-bank
  question is a reliability signal, not a graded content error.
- **`OVER_BUDGET(178w/150)`** (`ts_ipe_p2_atm_bohr_hydrogen_spectrum`
  `[why]`) — fired correctly; the reply is ~178 words against a ~150-word
  target. Content is fully correct (I graded it 2, not lower).
- **`OVER_BUDGET(160w/150)`** (`ts_ipe_p2_atm_closest_approach_impact_parameter`
  `[why]`) — fired correctly; ~160 words against target. Content correct
  (graded 2).
- **`MARKDOWN:**bold**`** (`ts_ipe_p2_atm_closest_approach_impact_parameter`
  `[telugu]`) — fired correctly; see the LITERAL-MARKDOWN entry in §4. I did
  not lower the 0–3 score for this (content is accurate; the rubric scores
  physics correctness, and the markdown defect is tracked separately here),
  but the formatting itself is a real defect a teacher/student would see as
  stray asterisks on screen.

No flag fired on a reply I judged incorrect, and no flag fired spuriously
(i.e., no flag attached to a reply that doesn't actually exhibit the
condition it names).

## 6. ANSWER FACTS defects (bank-content check)

**No wrong, self-contradictory, or ambiguous ANSWER FACTS found in this
slice.** I checked every card's MARK SPLIT arithmetic against its per-step
marks (all 24 sum correctly to the card's stated total), every formula given
(reactance, impedance, transformer ratio, Rydberg/Bohr radius and energy
derivations, r₀ and impact-parameter expressions, dimensional analysis) for
internal consistency and standard-physics correctness, and every WHY/NOTE
field against its own MARK SPLIT and WRITE text — no contradictions.

Two cards are worth flagging not as NEW defects but because they are exactly
the pattern item 6 asks me to hunt for, and both turn out to be already
correctly handled by the bank rather than live errors:

- `ts_ipe_p2_atm_bohr_hydrogen_spectrum`, step `s3_lyman`: the WHY field
  itself says *"The book prints 'This series lies in the ultra violet region
  which is the visible region' — the sentence contradicts itself."* This
  looks at first glance like exactly the kind of self-contradiction item 6
  wants reported — but on inspection it is the ANSWER FACTS *documenting and
  correcting* a source-book typo, not contradicting itself: every WRITE/NOTE/
  MARK SPLIT field in this card consistently says Lyman = ultraviolet,
  Balmer = visible. No reply was misled by it (checked all "Lyman" replies
  across `[explain]`/`[mistakes]`/`[why]`/`[telugu]` — all state UV/visible
  correctly).
- `ts_ipe_p2_atm_paschen_series_wavelength`, step `s1_regions`: the WHY field
  notes the book prints 6463 Å where the standard Balmer Hα line is 6563 Å,
  and explicitly states the slip doesn't change the answer (either value is
  visible, so still Balmer, still 9549 Å for Paschen). Also correctly
  self-resolved, not a live defect.

Both are flagged here for visibility (a later round should confirm neither
regresses), but **neither is reported as a card defect** — the ANSWER FACTS
text is internally consistent and no reply was harmed.

**Question ids from item 6: none** (no ANSWER FACTS defects found this
round; the two source-book slips above are pre-corrected, not open
defects).
