# Skeleton — `kinetic_particle_theory`

> Chemistry, P1 #6 of the `docs/CHEMISTRY_DISCUSSIONS.md` Session-C5 ranked list ("the substrate
> for 1–5"). First concept on the `gas_box` `particle_field` scenario, built 2026-07-27/28.
> **Written after the build, not before** — quality-auditor Gate 0 correctly failed the concept for
> having no design record, and this is that record. Authored-in-arrears is a process defect, noted
> so it is not repeated: the archetype + delta table is a REQUIRED artifact *before* state design.

## §1 Tier and the whiteboard test (Session C5 §1)

**Tier: 💎 diamond.** A teacher with a whiteboard and 60 seconds cannot produce this. It needs
three of the four irreplaceability capabilities:

- **Show the invisible at scale** — 120 particles responding to temperature at once. A teacher draws
  three and asks the class to imagine the rest.
- **Run "what if" with guaranteed-correct physics** — drag T, V or N and everything responds, always
  right. On a board you redraw two cases and assert the trend between them.
- **Make a counterintuitive result believable** — "one temperature does not mean one speed" is the
  aha, and only *watching the distribution* changes that belief.

It does not need capability 3 (3D structure), which is why it is correctly a 2D build.

## §2 Atomic claim

Matter is particles in constant random motion; temperature measures their average kinetic energy,
and pressure is the summed rate of their impacts on the walls.

## §3 Per-state control table (Rule 31 — the required artifact)

| # | Ring | Teaches (ONE idea) | Motion archetype | Delta vs previous | Controls | advance_mode |
|---|---|---|---|---|---|---|
| 1 | core | matter is particles in ceaseless random motion | **ambient-chaos** — free flight + collisions, no driver | first sight of the gas | — | manual_click |
| 2 | core | temperature *is* mean kinetic energy | **heat-the-box** — global speed scales with T | particles speed up together; thermometer appears | T | auto_after_tts |
| 3 | core | pressure = summed wall impacts | **instrument-reveal** — motion unchanged, the meter is new | pressure gauge + collisions/s appear | — | manual_click |
| 4 | core | smaller volume → more frequent impacts (Boyle) | **compress-the-box** — the wall itself is the moving cause | the piston closes; P and collisions climb, T does not | V | manual_click |
| 5 | core | **a spread of speeds, not one speed** (PRIMARY aha) | **distribution-reveal** — the graph is the motion | histogram fills live beside the theory curve | — | auto_after_tts |
| 6 | extended | P·V = N·k·T ties them together | **constant-under-change** — inputs sweep, the ratio holds | gas-law readout appears and refuses to move | T | manual_click |
| 7 | — | sandbox | **open** | all controls live at once | T · V · N | interaction_complete |

**Archetype discipline.** Seven states, six distinct archetypes. The one repeat is
**S2 ↔ S6, and it is a DECLARED CONTRAST PAIR**: both drive temperature, but S2 asks *what does T do
to the particles?* (speed rises) while S6 asks *what does T leave unchanged?* (the ratio holds).
Same knob, opposite question — that contrast is the reason S6 reuses the knob rather than a defect.

**Honest limitation:** the underlying particle motion is hard discs bouncing in all seven states.
The per-state delta is carried by the *driver* (temperature / wall / instrument / graph) rather than
by a different kind of motion. That is intrinsic to a single-apparatus kinetic concept and is the
price of Rule 32d home-pose continuity; it is declared here rather than hidden.

## §4 Misconceptions confronted (Rule 16a)

| State | Wrong belief | Visual counter |
|---|---|---|
| 2 | temperature is a substance that flows into the gas | the same particles speed up; nothing enters the box |
| 3 | pressure is air packed against the wall, pressing | each strike registers; collisions/s shows the real number |
| 5 | at one temperature every particle moves at "the" speed | the histogram counts them — slow and fast, simultaneously |

## §5 Depth rings (Rule 38)

`core` = S1–S5, S7 · `extended` = **S6 only**, contiguous and immediately before the explore state.
Hiding S6 leaves a coherent lesson: no surviving state references the gas law, and S7 carries no
`show_gas_law` flag. Explore surfaces core-ring instruments only. No `advanced` ring — the calculus
form belongs to the physics T27 concepts, not here.

## §6 Real-world anchor (Rule 35 — universal)

A blocked bicycle pump: the handle resists harder the further you push. Universal, no country-specific
culture. **The anchor was corrected during the audit:** it originally led with the pump getting *warm*,
which is adiabatic, while STATE_4 is deliberately isothermal so the squeeze can be read on its own.
It now leads with the resistance (what the sim shows) and names the warming as a separate effect the
sim deliberately holds out.

## §7 Physics honesty

This is a true **2D** hard-disc gas, so its speed distribution is the 2D Maxwell–Boltzmann (Rayleigh)
form, not the 3D form NCERT prints. Verified by the auditor: measured `v_rms/v_avg = 1.1243` against
2D theory 1.1284 (3D theory would be 1.0854). **No state prints a law the sim does not obey** — the
only on-canvas equation is `P·A / N·T`, the 2D-correct form using area. The 3D formula appears
nowhere on screen. Any future state wanting the 3D algebra must put it on a surface that does not
claim to be measured from this box.

## §8 Definition of Done

- [x] tsc 0 · `check:renderer-syntax` OK · `validate:chemistry` PASS · `validate:concepts` 141/141 tripwire
- [x] THE EYE 31/31 on frames stepped by the correct physics
- [x] eye-walker walked twice (7 findings, all fixed)
- [x] quality-auditor gates 0–20
- [x] every slider swept min → max → home, driven via the product rail
- [ ] founder visual approval → `visual:approve`
- [ ] **Asmi professor review** — the gate no chemistry concept has yet passed
- [ ] `assessment` block — deliberately absent this phase (Gates 19/20 dormant, no students yet)
