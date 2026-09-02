# physics-9 examiner audit — wave B, 2026-09-02

20 newly authored cards audited card by card: question, mark split, every printed line, and every
`why`, `common_mistakes`, `memory_tip`, `margin_note` and `insider_note`. **26 findings across 14 of
the 20 cards.** Six cards were clean.

| severity | count |
|---|---|
| HARMFUL | 3 |
| WRONG | 7 |
| WEAK | 10 |
| REGISTER | 6 |

Every automated gate was green before the audit ran. As on wave A, **none of the 26 findings is
machine-checkable.**

**Every number was re-derived independently and every one was right** — the copper-wire stress, the
brass-wire stress, strain and Young's modulus, the steel-wire lateral strain, and the 10 km mountain.
The arithmetic was settled before authoring and the audit confirmed it. The defects were all in the
prose a student reads.

## The harmful three

All three tell a student that a correct answer is wrong.

- `stress_define`'s `insider_note` claimed BOTH marks need the words "restoring force", contradicting
  its own mark split, where the second mark is the formula and its unit.
- `stress_units_and_dimensions` said a bare "pascal" loses the mark. The pascal **is** the SI unit of
  stress, and the card's own `common_mistakes` treated Pa as legitimate two lines away.
- `brass_wire_stress_strain_youngs` listed "recomputing from F and ΔL directly" as a mistake.
  Y = FL/(AΔL) is the standard one-line route and gives the identical answer. A student following
  that line would delete correct work.

## Physics repaired

- **Elastomers are not defined by a low Young's modulus.** They do not obey Hooke's law, so a single
  Y is not really defined for them. The card now defines them as materials that stretch to very large
  strains and still return to shape — and says explicitly that the study material's "low Young's
  modulus" phrasing is safe for a student to write, so one absolute claim did not replace another.
- **The bulk modulus needs its minus sign.** A `why` gave B = P/(ΔV/V), which is negative under
  compression, in the same chapter as a card calling that the most common way the mark is lost.
- **Shearing strain is tan θ, not θ.** The equality holds only for small angles.
- **The elastic limit is not the failure point.** Past it a material deforms permanently; it breaks at
  the far higher breaking stress.
- **Plastic deformation spends energy, it does not store it.** The clay-ball card said the clay
  "keeps the energy". It is given off mostly as heat, which is exactly why nothing comes back as
  rebound.
- **A confusion between plastic behaviour and plastics.** "Plastics do not return to shape" is false
  of the materials called plastics.

## Two structural re-cuts

- `elasticity_define` spent two of four marks on the elastic limit, which the question does not ask
  for, and never named an ELASTIC example — only putty and wet clay. Re-cut so one mark names one
  example of each kind.
- `steel_wire_lateral_strain` gave a full mark for transcribing the given data. That mark now carries
  the definition of Poisson's ratio, and the answer now says what a student would otherwise leave
  unstated: the lateral strain is a **decrease**, the wire gets thinner.

## A marking claim we should not have made

The sand-heap card asserted that the book's stress-with-depth reasoning "earns zero for the second
mark". Our physics preference is defensible and stands, but no mark scheme was quoted and an
evaluator marking from the printed key would credit it. **Never tell a student a printed answer
scores zero.** Rewritten to say what the complete answer is instead. The same card was also arguing
with the mark scheme inside the lines a student copies; that moved to the insider note.

## A dangling reference the cross-reference gate does not catch

`stress_copper_wire_numerical` said "Same formula as before", pointing at a step that does not exist
in that card. `check:xrefs` catches "the previous question" and "the twin" but not "as before", so
this one needed human eyes. A separate `insider_note` naming "the stress question" by position WAS
caught by the gate, and was fixed before the audit ran.

## Coverage debt recorded, not fixed

These cards carry no `recall` rubric, so the spoken recall check is unavailable on them. The older
first-year physics chapters (thermal properties, fluids, motion in a plane) are 100% recall-enabled;
the three chapters this campaign has authored are mostly not. The grader endpoint is a standing
founder-level blocker, so nothing is student-visible today.
