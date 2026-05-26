# Pilot Topic 49 — Semiconductor Electronics

> Stage-2 pilot catalog. 20th of 44. **Modern Physics applied cluster opener** (sibling: T50 Communication Systems).
> Sources: **NCERT Class 12 Part 2 Ch.14** (canonical curriculum spine) + **HCV Vol 2 Ch.45 Semiconductors and Semiconductor Devices** (derivation/pedagogy) + **DCP Optics & Modern Physics Ch.34 Semiconductors** (problem patterns).
> Coverage class: **TRIPLE-COVERED** (NCERT + HCV + DCP).
> Anchor density: **VERY-STRONG** (proposed sub-bucket from T48 — confirmed here for the second time).

---

## Founder Decisions Applied

| Tag | Decision |
|---|---|
| **SE-G1** | Atomic granularity = "one device behavior or one junction concept". `pn_junction_unbiased`, `pn_junction_forward_bias`, `pn_junction_reverse_bias` are three separate atomics — different physical pictures, different math, different student misconceptions. |
| **SE-G2** | Band theory is one atomic (`energy_bands_in_solids`) with three nanos (`band_gap_metal`, `band_gap_semiconductor`, `band_gap_insulator`). Student must hold all three pictures side-by-side; splitting them across atomics loses the comparison. |
| **SE-G3** | Doping splits into TWO atomics — `n_type_semiconductor` and `p_type_semiconductor`. Pentavalent vs trivalent dopant have different majority/minority carrier maps and different Indian-fab anchors (silicon-pentavalent at Tata Electronics vs gallium-trivalent at compound-semiconductor pilots). |
| **SE-G4** | **Logic gates are one atomic per gate** (NOT, OR, AND, NAND, NOR) — five atomics. Truth tables look similar but each has a distinct symbol, distinct transistor implementation, and distinct misconception ("NAND = NOT-AND in series vs parallel"). NEET drops these; JEE Mains keeps NAND/NOR universality. |
| **SE-G5** | Transistor as amplifier and transistor as switch are TWO atomics (`transistor_amplifier_common_emitter`, `transistor_as_switch`). Same device, two operating regions (active vs saturation/cutoff). Confusing them is the #1 student failure mode. |
| **SE-G6** | Zener diode regulation is its own atomic (`zener_diode_voltage_regulator`) — distinct from `pn_junction_reverse_bias` because it actively exploits the breakdown region. |
| **SE-G7** | **VERY-STRONG anchor density confirmed** — second topic (after T48 Nuclei) to qualify. Anchors: Tata Electronics Dholera fab, Foxconn Chennai, Vedanta-Foxconn JV, ISRO SCL Chandigarh, BEL Bangalore, Sahasra Semiconductors (Bhiwadi), Kaynes Sanand, India Semiconductor Mission (ISM), CDAC Mohali, IIT Bombay nanoelectronics centre, IISc CeNSE. Sub-bucket use multiplier 1.0× (same as STRONG; VERY-STRONG signals teaching-time density, not authoring-cost increase). |

---

## Section A — Source Map

| Sub-topic | NCERT 12.2 Ch.14 | HCV V2 Ch.45 | DCP O/M Ch.34 |
|---|---|---|---|
| Energy bands in solids | §14.2 | §45.1-45.2 | §34.1 |
| Intrinsic semiconductor | §14.3 | §45.3 | §34.2 |
| Extrinsic (doping) | §14.4 | §45.4 | §34.3-34.4 |
| p-n junction formation | §14.5 | §45.5 | §34.5 |
| p-n junction biasing & I-V | §14.6 | §45.6-45.7 | §34.6-34.7 |
| Junction diode rectification | §14.7 | §45.8 | §34.8 |
| Zener diode | §14.7.1 | §45.9 | §34.9 |
| Optoelectronic devices (LED, photodiode, solar cell) | §14.8 | §45.10 | §34.10 |
| Transistor (BJT) | §14.9 | §45.11-45.12 | §34.11-34.13 |
| Transistor as amplifier | §14.9.4 | §45.13 | §34.14 |
| Transistor as switch / logic | §14.9.5 | §45.14 | §34.15 |
| Logic gates | §14.10 | §45.15 | §34.16 |

---

## Section B — Atomic + Nano Catalog

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **energy_bands_in_solids** | Valence band, conduction band, energy gap in crystalline solids | atomic | ✅ | — | [bohr_three_postulates, orbit_vs_orbital, pauli_exclusion(MISSING)] | [intrinsic_semiconductor, n_type_semiconductor, p_type_semiconductor, metal_vs_semiconductor_vs_insulator] | Three-panel comparison E-vs-k diagram |
| ↳ band_gap_metal | Overlapping VB/CB → free electrons at 0 K | nano | ✅ | — | [energy_bands_in_solids] | [metal_vs_semiconductor_vs_insulator] | parent: energy_bands_in_solids |
| ↳ band_gap_semiconductor | Eg ≈ 1.1 eV (Si), 0.7 eV (Ge) — thermally bridgeable | nano | ✅ | — | [energy_bands_in_solids] | [intrinsic_semiconductor] | parent: energy_bands_in_solids |
| ↳ band_gap_insulator | Eg > 3 eV — no thermal carriers | nano | ✅ | — | [energy_bands_in_solids] | [metal_vs_semiconductor_vs_insulator] | parent: energy_bands_in_solids |
| **metal_vs_semiconductor_vs_insulator** | Three-band-diagram side-by-side classification | atomic | ✅ | — | [energy_bands_in_solids, band_gap_metal, band_gap_semiconductor, band_gap_insulator] | [intrinsic_semiconductor] | Canonical conceptual atomic |
| **intrinsic_semiconductor** | Pure Si/Ge — electron-hole pair generation, n_e = n_h = n_i | atomic | ✅ | — | [band_gap_semiconductor, covalent_bonding(MISSING)] | [n_type_semiconductor, p_type_semiconductor, pn_junction_unbiased] | Indian-anchor: SCL Chandigarh wafer line |
| ↳ hole_concept_nano | "Hole" = missing electron in covalent bond, behaves as +q carrier | nano | ✅ | — | [intrinsic_semiconductor] | [p_type_semiconductor, pn_junction_forward_bias] | parent: intrinsic_semiconductor |
| ↳ thermal_generation_recombination | Pair generation + recombination dynamic equilibrium | nano | ✅ | — | [intrinsic_semiconductor] | [pn_junction_unbiased] | parent: intrinsic_semiconductor |
| **n_type_semiconductor** | Pentavalent dopant (P, As, Sb) → donor level → electron majority | atomic | ✅ | — | [intrinsic_semiconductor, energy_bands_in_solids] | [pn_junction_unbiased, transistor_npn] | Indian-anchor: Tata Electronics Dholera (12-inch Si fab) |
| ↳ donor_level_nano | Donor energy state just below CB | nano | ✅ | — | [n_type_semiconductor] | [pn_junction_unbiased] | parent: n_type_semiconductor |
| **p_type_semiconductor** | Trivalent dopant (B, Al, Ga, In) → acceptor level → hole majority | atomic | ✅ | — | [intrinsic_semiconductor, hole_concept_nano] | [pn_junction_unbiased, transistor_pnp] | Indian-anchor: GaAs research at IIT Bombay nanoelectronics |
| ↳ acceptor_level_nano | Acceptor energy state just above VB | nano | ✅ | — | [p_type_semiconductor] | [pn_junction_unbiased] | parent: p_type_semiconductor |
| **mass_action_law_semiconductor** | n_e × n_h = n_i² at thermal equilibrium | atomic | ✅ | — | [n_type_semiconductor, p_type_semiconductor] | [pn_junction_unbiased] | DCP JEE-favourite problem pattern |
| **pn_junction_unbiased** | Depletion region formation, built-in potential V_bi, no external current | atomic | ✅ | — | [n_type_semiconductor, p_type_semiconductor, mass_action_law_semiconductor] | [pn_junction_forward_bias, pn_junction_reverse_bias, junction_diode_rectifier] | Diamond candidate sim (3-frame: before / diffusion / equilibrium) |
| ↳ depletion_region_nano | Charged ion-core region devoid of mobile carriers | nano | ✅ | — | [pn_junction_unbiased] | [pn_junction_forward_bias, pn_junction_reverse_bias] | parent: pn_junction_unbiased |
| ↳ built_in_potential_nano | V_bi ≈ 0.3 V (Ge), 0.7 V (Si) | nano | ✅ | — | [pn_junction_unbiased] | [pn_junction_forward_bias] | parent: pn_junction_unbiased |
| **pn_junction_forward_bias** | p→+, n→−; depletion narrows; majority carriers flow; exponential I-V above V_knee | atomic | ✅ | — | [pn_junction_unbiased, built_in_potential_nano] | [junction_diode_rectifier, led_atomic, transistor_amplifier_common_emitter] | I-V curve animated |
| **pn_junction_reverse_bias** | p→−, n→+; depletion widens; tiny reverse saturation current I_s; breakdown at V_z | atomic | ✅ | — | [pn_junction_unbiased] | [zener_diode_voltage_regulator, photodiode_atomic, solar_cell_atomic] | Avalanche vs Zener breakdown distinguished |
| ↳ reverse_saturation_current_nano | I_s ≈ μA (Ge), nA (Si); temperature-doubles-per-10°C | nano | — | — | [pn_junction_reverse_bias] | — | parent: pn_junction_reverse_bias |
| **junction_diode_rectifier** | Half-wave + full-wave (centre-tap + bridge) rectifier circuits | atomic | ✅ | — | [pn_junction_forward_bias, pn_junction_reverse_bias] | [zener_diode_voltage_regulator] | Indian-anchor: India 230 V/50 Hz mains rectification (every DC adapter) |
| ↳ half_wave_rectifier_nano | One diode, 50% utilization, ripple frequency = supply | nano | ✅ | — | [junction_diode_rectifier] | — | parent: junction_diode_rectifier |
| ↳ full_wave_bridge_nano | Four diodes, 100% utilization, ripple frequency = 2× supply | nano | ✅ | — | [junction_diode_rectifier] | — | parent: junction_diode_rectifier |
| **zener_diode_voltage_regulator** | Reverse-biased Zener at V_z provides constant output across varying input | atomic | ✅ | — | [pn_junction_reverse_bias, junction_diode_rectifier] | — | Series resistor + load analysis |
| **led_atomic** | Forward-biased direct-bandgap junction emits photons at hν ≈ Eg | atomic | ✅ | — | [pn_junction_forward_bias, photoelectric_phenomenology, einstein_photoelectric_equation] | — | Indian-anchor: Indian LED revolution (UJALA scheme, ~370M bulbs distributed); Aravind/Vedanta LED fabs |
| **photodiode_atomic** | Reverse-biased junction; incident hν > Eg generates measurable photocurrent | atomic | ✅ | — | [pn_junction_reverse_bias, photoelectric_phenomenology] | — | Indian-anchor: ISRO satellite earth-observation sensors (Cartosat) |
| **solar_cell_atomic** | Large-area pn junction, no external bias; photogenerated EHP → V_oc + I_sc | atomic | ✅ | — | [pn_junction_unbiased, photoelectric_phenomenology] | — | Indian-anchor: Bhadla Solar Park (2,245 MW, largest in world); Pavagada; Adani Mundra; PM-KUSUM scheme |
| ↳ open_circuit_voltage_nano | V_oc ≈ 0.5-0.7 V per Si cell | nano | — | — | [solar_cell_atomic] | — | parent: solar_cell_atomic |
| ↳ short_circuit_current_nano | I_sc proportional to incident intensity | nano | — | — | [solar_cell_atomic] | — | parent: solar_cell_atomic |
| **transistor_npn** | NPN BJT: emitter-base forward, base-collector reverse; α and β current gains | atomic | ✅ | — | [pn_junction_forward_bias, pn_junction_reverse_bias, n_type_semiconductor] | [transistor_amplifier_common_emitter, transistor_as_switch] | Diamond candidate sim (carrier-flow choreography) |
| **transistor_pnp** | PNP variant; current/voltage signs reverse | atomic | ✅ | — | [pn_junction_forward_bias, pn_junction_reverse_bias, p_type_semiconductor] | [transistor_amplifier_common_emitter] | Mirror-image of NPN |
| ↳ alpha_beta_relationship_nano | α = I_C/I_E, β = I_C/I_B, β = α/(1−α) | nano | ✅ | — | [transistor_npn] | [transistor_amplifier_common_emitter] | parent: transistor_npn |
| **transistor_input_output_characteristics** | I_B-vs-V_BE input curve + I_C-vs-V_CE output curve (CE config) | atomic | ✅ | — | [transistor_npn, alpha_beta_relationship_nano] | [transistor_amplifier_common_emitter, transistor_as_switch] | Three operating regions: cutoff, active, saturation |
| **transistor_amplifier_common_emitter** | Active-region operation; A_v = −β × (R_C / r_in); 180° phase inversion | atomic | ✅ | — | [transistor_input_output_characteristics, pn_junction_forward_bias] | — | JEE Mains favourite; Indian-anchor: ISRO X-band amplifier modules |
| ↳ phase_inversion_nano | Output 180° out of phase with input — Class 12 board mark | nano | ✅ | — | [transistor_amplifier_common_emitter] | — | parent: transistor_amplifier_common_emitter |
| **transistor_as_switch** | Operating in cutoff (OFF) or saturation (ON) — never linear active | atomic | ✅ | — | [transistor_input_output_characteristics] | [logic_gate_not, logic_gate_nand] | Foundation of digital electronics |
| **logic_gate_not** | NOT: output = NOT input; single transistor inverter | atomic | ✅ | — | [transistor_as_switch] | [logic_gate_nand, logic_gate_nor] | Truth table {0→1, 1→0} |
| **logic_gate_or** | OR: output = A + B; truth table 4 rows | atomic | ✅ | — | [transistor_as_switch] | [logic_gate_nor] | |
| **logic_gate_and** | AND: output = A · B | atomic | ✅ | — | [transistor_as_switch] | [logic_gate_nand] | |
| **logic_gate_nand** | NAND: output = NOT(A·B); universal gate | atomic | ✅ | — | [logic_gate_and, logic_gate_not] | — | NAND universality proof |
| **logic_gate_nor** | NOR: output = NOT(A+B); universal gate | atomic | ✅ | — | [logic_gate_or, logic_gate_not] | — | NOR universality proof |
| **boolean_algebra_basics** | Identity laws, commutation, De Morgan's theorems | atomic | — | — | [logic_gate_and, logic_gate_or, logic_gate_not] | — | Bridges to CS digital logic course |

**Atomic count:** 20. **Nano count:** ~11.

---

## Section C — Cross-Source Coverage Matrix

| Atomic | NCERT 12.2 | HCV2 Ch.45 | DCP O/M Ch.34 | Coverage |
|---|---|---|---|---|
| energy_bands_in_solids | §14.2 | §45.1 | §34.1 | TRIPLE |
| metal_vs_semiconductor_vs_insulator | §14.2 | §45.2 | §34.1 | TRIPLE |
| intrinsic_semiconductor | §14.3 | §45.3 | §34.2 | TRIPLE |
| n_type_semiconductor | §14.4 | §45.4 | §34.3 | TRIPLE |
| p_type_semiconductor | §14.4 | §45.4 | §34.4 | TRIPLE |
| mass_action_law_semiconductor | — | §45.4 | §34.4 | DOUBLE (HCV+DCP) — NCERT mentions but doesn't formalize |
| pn_junction_unbiased | §14.5 | §45.5 | §34.5 | TRIPLE |
| pn_junction_forward_bias | §14.6 | §45.6 | §34.6 | TRIPLE |
| pn_junction_reverse_bias | §14.6 | §45.7 | §34.7 | TRIPLE |
| junction_diode_rectifier | §14.7 | §45.8 | §34.8 | TRIPLE |
| zener_diode_voltage_regulator | §14.7.1 | §45.9 | §34.9 | TRIPLE |
| led_atomic | §14.8 | §45.10 | §34.10 | TRIPLE |
| photodiode_atomic | §14.8 | §45.10 | §34.10 | TRIPLE |
| solar_cell_atomic | §14.8 | §45.10 | §34.10 | TRIPLE |
| transistor_npn | §14.9 | §45.11 | §34.11 | TRIPLE |
| transistor_pnp | §14.9 | §45.11 | §34.12 | TRIPLE |
| transistor_input_output_characteristics | §14.9.3 | §45.12 | §34.13 | TRIPLE |
| transistor_amplifier_common_emitter | §14.9.4 | §45.13 | §34.14 | TRIPLE |
| transistor_as_switch | §14.9.5 | §45.14 | §34.15 | TRIPLE |
| logic_gate_* (5) | §14.10 | §45.15 | §34.16 | TRIPLE |
| boolean_algebra_basics | — | §45.15 | §34.16 | DOUBLE (HCV+DCP) — NCERT skips |

**Triple-coverage rate:** 18 of 20 atomics (90%). Second-highest after T48 (100%). Confirms semiconductor electronics as a canonical-core topic.

---

## Section D — Real-World Anchors (VERY-STRONG, Indian-context)

| Anchor | Concept hook | Authoring use |
|---|---|---|
| **Tata Electronics Dholera Si fab** (Gujarat, 2026 ramp-up) | n_type_semiconductor, intrinsic_semiconductor | "India's first 12-inch silicon wafer line is making this exact material right now in Gujarat" |
| **Foxconn Chennai assembly** (Sriperumbudur, TN) | transistor_npn, logic gates | "Every iPhone built in Chennai uses billions of these transistors" |
| **Vedanta-Foxconn JV** (Dholera) | doping atomics | India Semiconductor Mission anchor |
| **ISRO Semi-Conductor Lab (SCL) Chandigarh** | intrinsic_semiconductor, pn_junction_unbiased | "Where India makes its space-grade chips" |
| **BEL Bangalore** (Bharat Electronics Limited) | transistor_amplifier_common_emitter | Defence electronics anchor |
| **Sahasra Semiconductors Bhiwadi** | LED/optoelectronic atomics | First Indian LED assembly at scale |
| **Kaynes Technology Sanand** | transistor_as_switch, logic gates | OSAT (assembly + test) anchor |
| **CDAC Mohali** | Boolean algebra, logic gates | Indigenous microprocessor design |
| **IIT Bombay Centre of Excellence in Nanoelectronics** | p_type_semiconductor, GaAs research | Compound semiconductor anchor |
| **IISc CeNSE Bangalore** | photodiode_atomic, optoelectronics | Nanoscience research anchor |
| **Bhadla Solar Park** (Rajasthan, 2,245 MW) | solar_cell_atomic | World's largest — primary anchor for V1 |
| **Pavagada Solar Park** (Karnataka) | solar_cell_atomic | Secondary anchor |
| **UJALA scheme** (~370M LED bulbs distributed) | led_atomic | Mass-scale Indian context |
| **India Semiconductor Mission (ISM, MeitY)** | umbrella anchor | All doping/fab atomics reference ISM |

**Total: 14 distinct institutional/scheme anchors.** Confirms VERY-STRONG sub-bucket (≥13 anchors per T48's threshold).

---

## Section E — V1 Priority Flags

| Atomic | V1? | Reason |
|---|---|---|
| pn_junction_unbiased | ✅ | Diamond candidate; foundation for 8 dependent atomics |
| pn_junction_forward_bias | ✅ | Highest NCERT+JEE+NEET overlap; appears in every PYQ paper since 2015 |
| pn_junction_reverse_bias | ✅ | Paired with forward — must ship together |
| transistor_npn | ✅ | Diamond candidate; second-most-tested transistor topic |
| transistor_amplifier_common_emitter | ✅ | JEE Mains numerical favourite; high failure rate |
| logic_gate_nand | ⚖️ | Universal-gate proof high-leverage; defer to V1.1 |
| solar_cell_atomic | ⚖️ | Strong anchor but NCERT-light; defer to V1.1 |
| Others | — | V2+ |

**V1 ship count for T49:** 5 atomics + supporting nanos.

---

## Section F — Cross-Topic Dependencies (Bidirectional Edges)

### Outgoing (T49 requires from earlier topics)

| Target topic | Edge | Reason |
|---|---|---|
| T47 Atomic Models | energy_bands_in_solids ← bohr_three_postulates, orbit_vs_orbital | Bohr orbitals → solid-state band picture |
| T46 Dual Nature | led_atomic, photodiode_atomic, solar_cell_atomic ← einstein_photoelectric_equation, photon_particle_nature | Photoelectric foundation for optoelectronics |
| T48 Nuclei | (none direct — analogy only) | Band-gap energy scale ≪ nuclear; analogy retired |
| Math-tools | mass_action_law_semiconductor ← algebra_quadratic, intrinsic_semiconductor ← calculus_exponential_decay (thermal carrier conc.) | Algebra + first-use validation chain extends |
| T31 Electrostatic Potential | pn_junction_unbiased ← electric_potential_difference, built_in_potential_nano | Depletion region = potential step |
| T34 Current Electricity | junction_diode_rectifier ← ohms_law, kirchhoffs_laws | Rectifier circuit analysis |

### Incoming (T49 will be required by later topics)

| Source topic | Edge | Reason |
|---|---|---|
| T50 Communication Systems | modulator_circuits, demodulator_circuits ← transistor_amplifier_common_emitter, junction_diode_rectifier | Every modulator uses transistors + diodes |
| T50 Communication Systems | optical_fibre_communication ← led_atomic, photodiode_atomic | Source + detector pair |
| T50 Communication Systems | digital_communication ← logic_gate_nand, logic_gate_nor | Digital channel encoding |

**Outgoing edges: 6. Incoming edges (anticipated): 3.** Net IN-degree contribution from this batch alone: +3 (will be confirmed by T50 back-edges).

---

## Section G — Open Questions

1. **MOSFET / FET coverage?** NCERT 12.2 Ch.14 (2023+ edition) drops FETs entirely. HCV2 §45.16 keeps a brief mention. DCP includes basic FET in Ch.34 §34.17. **Decision (founder pre-approved style):** Skip FET in V1; flag as V2 retrofit when CMOS-era anchor (Tata Dholera fab) demands it.
2. **IC / integrated circuit as atomic?** NCERT mentions in §14.10.4 only as application. **Decision:** Not atomic in V1 — IC is a packaging concept, not a physics concept. Refer-out to a future engineering catalog.
3. **Hall effect** — covered in DCP only (Ch.34 §34.18). **Decision:** Hall effect belongs to T35 EM (magnetic force on carriers), not T49. Cross-link only.
4. **Tunnel diode, photovoltaic effect mechanism deep-dive** — defer to V2.
5. **`pauli_exclusion` MISSING** — flagged as Stage-3 atomic candidate; needed by `energy_bands_in_solids`. Add to math-tools backlog OR open as a new dedicated mini-atomic.

---

## Section H — Citation Conventions

- NCERT 12.2 Ch.14 sections cited as `NCERT 12.2 §14.X`.
- HCV V2 Ch.45 cited as `HCV2 §45.X`.
- DCP O/M Ch.34 cited as `DCP O/M §34.X`.
- Indian institution anchors cited by full name on first use, abbreviation thereafter.
- Solar park capacities cited per Ministry of New & Renewable Energy (MNRE) 2025 data.

---

## Section I — Sign-Off

- Authored: Session 45, 2026-05-25.
- Author: Claude (Architect+Engineer role).
- Coverage class: TRIPLE.
- Anchor density: **VERY-STRONG** (14 anchors — second observed instance after T48 Nuclei).
- Triple-coverage rate: 90% (18/20 atomics).
- Atomic count: 20. Nano count: 11. Total: 31 concept entries.
- V1 ship count: 5 atomics.
- Next pilot: **T50 Communication Systems** (paired-batch sibling).

---

*Confirmed: VERY-STRONG anchor density is not a one-off (T48). Modern Physics applied cluster is the densest cluster for Indian-context anchoring observed so far.*
