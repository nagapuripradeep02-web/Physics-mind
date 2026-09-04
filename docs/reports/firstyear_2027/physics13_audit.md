# physics-13 examiner audit — wave B, 2026-09-02

22 newly authored cards audited card by card. **23 findings across 15 of the 22 cards.** Seven were
clean.

| severity | count |
|---|---|
| HARMFUL | 5 |
| WRONG | 7 |
| WEAK | 5 |
| REGISTER | 6 |

**Every number was re-derived and every one was right again** — 1092 K, the rms ratio of 10,
6.21 × 10⁻²¹ J, 12.47 J mol⁻¹ K⁻¹, the 1:4 oxygen-to-hydrogen ratio, 2.74 km/s from a mean of
squares of 7.5, γ = (f+2)/f, 1246.5 J, and 1.96%. The eight-mark derivation's algebra was checked
line by line and is correct throughout. **Two chapters in, the pattern is settled: settling the
arithmetic before authoring works, and the defects are in the prose.**

## The harmful five

Four of the five tell a student that a correct answer is wrong. The fifth states physics that
contradicts another card in the same chapter.

- `rms_ratio_oxygen_hydrogen` — the `why` said the HEAVIER gas's molar mass goes in the numerator,
  while the card's own printed line and its margin both put the lighter one there. A student
  following the `why` writes √(32/2) and answers 4:1, the exact error the same card warns against
  two lines later.
- `degrees_of_freedom` — the mistake line said counting vibration gives 6 for a diatomic molecule.
  The card's own line makes it 5 + 2 = 7. The card disagreed with itself about the number a student
  would write.
- `cv_monoatomic_gas` — called leaving the answer as (3/2)R an error. That **is** the answer to the
  question, and the card's own mark split does not support refusing it.
- `absolute_zero_kinetic_theory` — forbade starting from PV = Nk_BT, which is the standard route,
  and which the card's OWN third step then argues through. The card called its own third mark a
  mistake.
- `pressure_and_internal_energy` — asserted flatly that the internal energy of an ideal gas is the
  total translational kinetic energy. That holds only for a **monatomic** gas, and it contradicts the
  equipartition card in the same chapter, which gives a diatomic gas U = (5/2)RT including rotation.
  A student taking it as general writes U = (3/2)RT for oxygen.

## Physics repaired

- **Squaring speeds does not stop anything cancelling.** The rms card justified squaring by
  "keeping the negative directions from cancelling", but speeds are magnitudes with no sign. The
  cancellation argument belongs to velocity components, which the same card states correctly one
  step later.
- **The area does not cancel out of the pressure derivation.** The wall area combines with the
  cube's length to give the volume, which is why only the number density survives.
- **The two-thirds does not cancel either.** It is divided across, and that division is exactly what
  turns k_BT into (3/2)k_BT. A student who cancels it writes ½mv̄² = k_BT.
- **"Average energy" needs the word translational.** For a diatomic molecule the total average
  kinetic energy is (5/2)k_BT, so "(3/2)k_BT whatever the gas" is false as written.
- **Temperature is not heat.** A memory tip glossed "same temperature" as "same heat" in the
  Avogadro card — a misconception the syllabus works to remove.
- **The reason intermolecular collisions can be ignored** is that they are elastic between identical
  masses, so a collision exchanges velocities and changes nothing the wall receives. It is not the
  point-size assumption, which is about neglecting molecular volume.

## Marking claims we should not have made

Three cards asserted what a mark scheme awards or refuses without any mark scheme in hand: that a
bare (3/2)R loses the mark, that the calorie form of the specific heat of water is "a bonus, not a
substitute", and that the sixth mark of the derivation requires the density form P = ⅓ρv̄². All were
rewritten to say what the complete answer is. This is the same rule wave B's physics-9 pass
established, and it recurred immediately.

## Two marks that were paying for a calculator key

`boyles_law_two_percent_pressure_rise` split "V′ = V/1.02" and "= 0.9804V" across two marks, and
`rms_speed_four_molecules` split "add the squares" from "divide by four". Each is one operation. Both
were merged and the freed mark given to the physics the question actually tests — in the Boyle's law
card, why the answer is 1.96% and not 2%.
