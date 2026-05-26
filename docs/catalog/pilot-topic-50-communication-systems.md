# Pilot Topic 50 — Communication Systems

> Stage-2 pilot catalog. 21st of 44. **Modern Physics applied cluster closer** (sibling: T49 Semiconductor).
> Sources: **NCERT Class 12 Part 2 Ch.15** (canonical curriculum spine — note: dropped from NCERT 2023 revision; retained in HCV/DCP/state boards) + **HCV Vol 2 Ch.47 Electromagnetic Waves** §47-extended + **DCP Optics & Modern Physics Ch.35 Communication Systems**.
> Coverage class: **DOUBLE-COVERED-PLUS** (HCV + DCP + state boards retain; NCERT 2023+ dropped — treat as TRIPLE for V1 because Maharashtra HSC, Tamil Nadu, Karnataka PUC, WB HS still examine).
> Anchor density: **VERY-STRONG** (third observed instance — after T48 Nuclei, T49 Semiconductor).

---

## Founder Decisions Applied

| Tag | Decision |
|---|---|
| **CS-G1** | Atomic granularity = "one block in a communication system OR one modulation scheme". `amplitude_modulation`, `frequency_modulation`, `phase_modulation` are three separate atomics. They share math foundations but have distinct waveforms, distinct bandwidth maps, and distinct Indian-anchor systems (AM = AIR medium wave; FM = AIR Rainbow + private FM; PM = Doordarshan digital). |
| **CS-G2** | Block-diagram literacy is one atomic (`generic_communication_block_diagram`) but each block (transducer, modulator, channel, demodulator, repeater, antenna) is its own atomic. Six block atomics + three modulation atomics + propagation atomics. |
| **CS-G3** | Ground wave / sky wave / space wave / satellite propagation are FOUR separate atomics. Each has a distinct frequency band, distinct geometry, and distinct Indian-context anchor (AIR ground-wave; HF amateur sky-wave to remote villages; FM space-wave; GSAT satellite). |
| **CS-G4** | Bandwidth concept is its own atomic (`bandwidth_signal_vs_channel`) — distinct from each modulation scheme. Student must understand bandwidth before AM/FM make sense. |
| **CS-G5** | **Optical fibre communication is its own atomic** (`optical_fibre_communication`) — bridges T44 Wave Optics (TIR) + T49 (LED source + photodiode detector). High-leverage Indian-anchor concept (Bharat Net, Reliance Jio FTTH). |
| **CS-G6** | Antenna height + range formula (`antenna_range_formula`) is a separate atomic. Single-formula `d = √(2hR)` deserves its own state in V1 because (a) NCERT-favourite numerical, (b) sub-1-state insight worth flagging as math-tool candidate (Pythagoras-on-curved-earth derivation). |
| **CS-G7** | **VERY-STRONG anchor density confirmed** — third observed topic (T48, T49, T50). Anchors: ISRO GSAT constellation, INSAT, Bharat Net, BSNL backbone, Reliance Jio (450M+ subscribers, JioFiber), AIR (All India Radio, 600+ transmitters), Doordarshan, Indian Coast Guard MF/HF, DRDO Akash radar, IIT Madras 5G testbed, C-DOT (Centre for Development of Telematics), TRAI regulatory anchor, Indian Submarine Cable landing stations (Mumbai, Chennai, Cochin), NavIC (Indian GPS alternative). **15 distinct anchors** — densest yet, exceeding T48 and T49. |

---

## Section A — Source Map

| Sub-topic | NCERT 12.2 Ch.15 (legacy 2022) | HCV V2 (Ch.47 ext / Ch.48 if applicable) | DCP O/M Ch.35 |
|---|---|---|---|
| Generic communication block | §15.2 | §47.ext-1 | §35.1 |
| Transducer / signal vs message | §15.2.1 | §47.ext-2 | §35.2 |
| Bandwidth (signal & channel) | §15.3, §15.4 | §47.ext-3 | §35.3 |
| Propagation modes (ground/sky/space) | §15.5 | §47.ext-4 | §35.4 |
| Antenna theory & range formula | §15.6 | §47.ext-5 | §35.5 |
| Amplitude Modulation (AM) | §15.7 | §47.ext-6 | §35.6-35.7 |
| Frequency / Phase Modulation | §15.7 (mention) | §47.ext-7 | §35.8-35.9 |
| Production of AM (modulator block) | §15.8 | §47.ext-8 | §35.10 |
| Detection of AM (demodulator) | §15.9 | §47.ext-9 | §35.11 |
| Optical fibre communication | (NCERT 11/12 wave optics cross-ref) | §47.ext-10 | §35.12 |
| Satellite communication | §15.5.3 | §47.ext-11 | §35.13 |
| Digital signal basics | (deferred) | §47.ext-12 | §35.14 |

---

## Section B — Atomic + Nano Catalog

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **generic_communication_block_diagram** | Message → transducer → modulator → channel → demodulator → transducer → receiver | atomic | ✅ | — | [signal_vs_information(MISSING)] | [transducer_atomic, modulator_block_atomic, channel_atomic, demodulator_block_atomic] | Master architectural atomic |
| **transducer_atomic** | Energy converter at input/output (mic → e-signal; speaker → sound) | atomic | ✅ | — | [generic_communication_block_diagram] | [generic_communication_block_diagram] | |
| **bandwidth_signal_vs_channel** | Signal bandwidth = max(f) − min(f); channel bandwidth = capacity available | atomic | ✅ | — | [generic_communication_block_diagram, frequency_basics(MISSING)] | [amplitude_modulation, frequency_modulation, optical_fibre_communication] | Foundation for all modulation |
| ↳ audio_bandwidth_nano | Speech ≈ 3 kHz, music ≈ 20 kHz | nano | — | — | [bandwidth_signal_vs_channel] | [amplitude_modulation] | parent: bandwidth_signal_vs_channel |
| ↳ video_bandwidth_nano | TV signal ≈ 4.2 MHz; HDTV ≈ 6 MHz | nano | — | — | [bandwidth_signal_vs_channel] | — | parent: bandwidth_signal_vs_channel |
| **ground_wave_propagation** | Surface-following EM wave; <2 MHz; AM medium-wave broadcast | atomic | ✅ | — | [bandwidth_signal_vs_channel, electromagnetic_waves_basics(EXT T38)] | [antenna_range_formula] | Indian-anchor: AIR Akashvani Bhavan New Delhi medium-wave transmitters |
| **sky_wave_propagation** | Ionospheric reflection; 2-30 MHz; HF amateur, defence comms | atomic | ✅ | — | [bandwidth_signal_vs_channel] | [satellite_communication] | Indian-anchor: amateur radio (VU2 callsigns), Coast Guard HF |
| **space_wave_propagation** | Line-of-sight; >30 MHz; FM, TV, microwave | atomic | ✅ | — | [bandwidth_signal_vs_channel, antenna_range_formula] | [satellite_communication, frequency_modulation] | Indian-anchor: FM Rainbow 102.6 MHz |
| **satellite_communication** | Geostationary uplink/downlink; transponder; coverage footprint | atomic | ✅ | — | [space_wave_propagation, gravitational_orbital_velocity(T16)] | — | Indian-anchor: ISRO GSAT-30, INSAT-4CR, NavIC constellation |
| **antenna_range_formula** | Line-of-sight range: d = √(2hR); d_LOS = √(2h_T R) + √(2h_R R) | atomic | ✅ | — | [space_wave_propagation, vector_resolution(T6), pythagoras_theorem(STUB)] | — | NCERT favourite numerical; Doordarshan transmitter height case study |
| ↳ height_of_antenna_nano | Mathematical derivation from Pythagoras on curved Earth | nano | ✅ | — | [antenna_range_formula] | — | parent: antenna_range_formula |
| **amplitude_modulation** | Carrier amplitude varied with message; c(t) = (A_c + A_m sin ω_m t) sin ω_c t | atomic | ✅ | — | [bandwidth_signal_vs_channel, trig_product_to_sum_identities(STUB)] | [modulator_block_atomic, demodulator_block_atomic] | Diamond candidate sim (3-frame: carrier, message, AM envelope) |
| ↳ modulation_index_nano | μ = A_m / A_c; μ < 1 to avoid distortion | nano | ✅ | — | [amplitude_modulation] | [modulator_block_atomic] | parent: amplitude_modulation |
| ↳ am_sidebands_nano | (f_c − f_m) lower sideband + (f_c + f_m) upper sideband; bandwidth = 2 f_m | nano | ✅ | — | [amplitude_modulation, modulation_index_nano] | — | parent: amplitude_modulation; first-use of `trig_product_to_sum_identities` |
| **frequency_modulation** | Carrier frequency varied with message amplitude; better SNR than AM | atomic | ✅ | — | [bandwidth_signal_vs_channel, amplitude_modulation] | — | Indian-anchor: AIR Rainbow + private FM (Radio Mirchi, Big FM) |
| **phase_modulation** | Carrier phase varied with message; mathematically equivalent to FM after derivative | atomic | — | — | [frequency_modulation] | — | Brief — single state V2 |
| **modulator_block_atomic** | Combines message with carrier; uses non-linear element (diode or transistor) + tuned circuit | atomic | ✅ | — | [amplitude_modulation, modulation_index_nano, junction_diode_rectifier(T49), transistor_amplifier_common_emitter(T49)] | — | Bridges T49 → T50 |
| **demodulator_block_atomic** | Recovers message from modulated carrier; envelope detector (diode + RC filter) | atomic | ✅ | — | [amplitude_modulation, junction_diode_rectifier(T49)] | — | Bridges T49 → T50; same RC time-constant analysis as half-wave rectifier |
| **optical_fibre_communication** | TIR-guided light pulses in glass fibre; LED/laser source + photodiode detector | atomic | ✅ | — | [total_internal_reflection(T42 Refraction), led_atomic(T49), photodiode_atomic(T49), bandwidth_signal_vs_channel] | — | Indian-anchor: Bharat Net (~6 lakh villages target), Reliance JioFiber, Mumbai-Chennai-Cochin submarine cable landings |
| ↳ acceptance_angle_nano | Maximum cone angle for TIR-guided propagation | nano | — | — | [optical_fibre_communication] | — | parent: optical_fibre_communication |
| ↳ fibre_bandwidth_advantage_nano | THz-range channel bandwidth vs MHz copper | nano | — | — | [optical_fibre_communication, bandwidth_signal_vs_channel] | — | parent: optical_fibre_communication |
| **noise_in_communication** | Thermal + shot + atmospheric noise sources; SNR concept | atomic | — | — | [bandwidth_signal_vs_channel, thermal_motion_basics(T18)] | [frequency_modulation] | DCP-only; V2 |
| **digital_signal_basics** | Discrete-level encoding (binary); sampling theorem (advisory) | atomic | — | — | [logic_gate_not(T49), bandwidth_signal_vs_channel] | — | V2; bridge to CS curriculum |
| **mobile_communication_system** | Cellular cell structure, frequency reuse, handover | atomic | — | — | [space_wave_propagation, satellite_communication] | — | Indian-anchor: Reliance Jio 4G/5G rollout; V2 |

**Atomic count:** 17 (15 V1-eligible, 2 V2-deferred). **Nano count:** ~7.

---

## Section C — Cross-Source Coverage Matrix

| Atomic | NCERT 12.2 (legacy) | HCV2 ext | DCP O/M Ch.35 | Coverage |
|---|---|---|---|---|
| generic_communication_block_diagram | §15.2 | §47.ext-1 | §35.1 | TRIPLE |
| transducer_atomic | §15.2.1 | §47.ext-2 | §35.2 | TRIPLE |
| bandwidth_signal_vs_channel | §15.3, §15.4 | §47.ext-3 | §35.3 | TRIPLE |
| ground_wave_propagation | §15.5.1 | §47.ext-4 | §35.4 | TRIPLE |
| sky_wave_propagation | §15.5.2 | §47.ext-4 | §35.4 | TRIPLE |
| space_wave_propagation | §15.5.3 | §47.ext-4 | §35.4 | TRIPLE |
| satellite_communication | §15.5.3 | §47.ext-11 | §35.13 | TRIPLE |
| antenna_range_formula | §15.6 | §47.ext-5 | §35.5 | TRIPLE |
| amplitude_modulation | §15.7 | §47.ext-6 | §35.6 | TRIPLE |
| frequency_modulation | §15.7 (mention) | §47.ext-7 | §35.8 | TRIPLE-light (NCERT brief) |
| phase_modulation | — | §47.ext-7 | §35.9 | DOUBLE |
| modulator_block_atomic | §15.8 | §47.ext-8 | §35.10 | TRIPLE |
| demodulator_block_atomic | §15.9 | §47.ext-9 | §35.11 | TRIPLE |
| optical_fibre_communication | (cross-ref Ch.9) | §47.ext-10 | §35.12 | TRIPLE |
| noise_in_communication | — | — | §35.x | SINGLE |
| digital_signal_basics | — | §47.ext-12 | §35.14 | DOUBLE |
| mobile_communication_system | — | — | §35.x | SINGLE |

**Triple-coverage rate:** 13 of 17 atomics (76%) — lower than T49 (90%) because Ch.15 was dropped from NCERT 2023. **Adjusted for state boards retaining the chapter:** effectively 13/17 still examinable.

---

## Section D — Real-World Anchors (VERY-STRONG, Indian-context)

| Anchor | Concept hook | Authoring use |
|---|---|---|
| **ISRO GSAT-30 / INSAT-4CR** | satellite_communication | "Your DTH dish points at GSAT-30 right now" |
| **NavIC constellation** | satellite_communication | "India's own GPS — 7 satellites" |
| **Bharat Net** (6 lakh villages target) | optical_fibre_communication | National fibre backbone anchor |
| **BSNL backbone** | optical_fibre_communication, transducer_atomic | Government telecom anchor |
| **Reliance Jio** (450M+ subscribers, JioFiber) | mobile_communication_system, optical_fibre_communication | "Largest single-operator network in the world" |
| **AIR Akashvani** (600+ transmitters, medium wave) | ground_wave_propagation | AM broadcast anchor |
| **AIR Rainbow 102.6 MHz / Vividh Bharati** | frequency_modulation, space_wave_propagation | FM anchor |
| **Doordarshan** | space_wave_propagation, antenna_range_formula | TV broadcasting + tower-height numerical |
| **Indian Coast Guard HF** | sky_wave_propagation | Defence comms anchor |
| **DRDO Akash radar / NETRA** | antenna_range_formula | Defence anchor |
| **IIT Madras 5G testbed** | mobile_communication_system, modulator_block_atomic | Research anchor |
| **C-DOT** (Centre for Development of Telematics) | demodulator_block_atomic | Indigenous switching equipment |
| **TRAI** | regulatory umbrella | Bandwidth allocation policy anchor |
| **Submarine Cable landing stations** (Mumbai, Chennai, Cochin) | optical_fibre_communication | International connectivity |
| **Amateur radio VU2 callsigns** | sky_wave_propagation | Hobbyist-level anchor (Class 12 students relate) |

**Total: 15 distinct institutional/system anchors.** **Densest yet** — exceeds T48 (13) and T49 (14). Confirms communication systems as the **single highest-anchor-density topic** observed.

---

## Section E — V1 Priority Flags

| Atomic | V1? | Reason |
|---|---|---|
| generic_communication_block_diagram | ✅ | Architectural foundation — must ship first |
| bandwidth_signal_vs_channel | ✅ | Prerequisite for AM/FM/optical fibre |
| amplitude_modulation | ✅ | Diamond candidate; #1 NCERT topic in chapter |
| antenna_range_formula | ✅ | Single-formula NCERT favourite; high JEE Mains hit rate |
| optical_fibre_communication | ✅ | Bharat Net anchor + bridges T44+T49; very high-leverage |
| frequency_modulation | ⚖️ | Defer to V1.1 (AM ships first) |
| satellite_communication | ⚖️ | Strong anchor but math-light; V1.1 |
| Others | — | V2+ |

**V1 ship count for T50:** 5 atomics + supporting nanos.

---

## Section F — Cross-Topic Dependencies (Bidirectional Edges)

### Outgoing (T50 requires from earlier topics)

| Target topic | Edge | Reason |
|---|---|---|
| **T49 Semiconductor** | modulator_block_atomic ← transistor_amplifier_common_emitter | Every modulator uses transistors |
| **T49 Semiconductor** | demodulator_block_atomic ← junction_diode_rectifier | Envelope detector = half-wave + RC filter |
| **T49 Semiconductor** | optical_fibre_communication ← led_atomic, photodiode_atomic | Source + detector pair |
| **T49 Semiconductor** | digital_signal_basics ← logic_gate_not, logic_gate_nand | Binary encoding |
| **T42 Refraction** | optical_fibre_communication ← total_internal_reflection, critical_angle | TIR-guided propagation |
| **T44 Wave Optics** | (cross-link only) optical_fibre_communication ↔ wave_propagation_basics | Light as EM wave |
| **T38 EM Waves** (anticipated) | all propagation atomics ← electromagnetic_wave_basics, wave_polarisation | Radio/TV/microwave are all EM |
| **T16 Gravitation** | satellite_communication ← orbital_velocity, geostationary_orbit | GSAT altitude derivation |
| **Math-tools** | amplitude_modulation ← `trig_product_to_sum_identities` (STUB — first use; promote from anticipated to required) | Sideband derivation |
| **Math-tools** | antenna_range_formula ← `pythagoras_theorem` (STUB) | Curved-earth LOS derivation |
| **T18 Thermodynamics** (anticipated) | noise_in_communication ← thermal_motion_basics | Thermal-noise floor (V2 only) |

### Incoming (T50 will be required by later topics)

| Source topic | Edge | Reason |
|---|---|---|
| (Modern Physics applied cluster CLOSED — no immediate downstream) | — | |
| (Possible long-tail: future "applied physics" topics in V2 catalog) | — | |

**Outgoing edges: 11 (highest count of any pilot — confirms T50 as integration hub).** Incoming edges: 0 (cluster terminal).

---

## Section G — Open Questions

1. **NCERT 2023 dropped Ch.15.** State boards retained. **Decision (founder-applicable):** Author for state-board-essential layer; flag in V1 metadata as `ncert_2023: dropped, state_boards: retained`. Skip for JEE Advanced explicit prep but keep for NEET (which still tests indirectly via NCERT 2020-2022 graduates).
2. **5G / IoT layer?** All DCP edition <2024 omit. **Decision:** V2 — wait for NCERT to formalize OR for a state-board adopt.
3. **Sampling theorem (Nyquist)?** Math-heavy, NCERT skipped. **Decision:** V2; flag for math-tools file as anticipated stub `sampling_theorem`.
4. **Antenna types (dipole / Yagi / dish) deep-dive?** NCERT skips; HCV brief. **Decision:** Single nano `antenna_types_overview` under antenna_range_formula in V2.
5. **`signal_vs_information` MISSING** — required by generic_communication_block_diagram. Add as Stage-3 mini-atomic OR fold as opening-nano.
6. **`frequency_basics` MISSING** — required by bandwidth_signal_vs_channel. Likely covered in T29 Oscillations (period, frequency, ω); cross-link rather than re-author.

---

## Section H — Citation Conventions

- NCERT 12.2 Ch.15 (legacy 2022) cited as `NCERT 12.2 §15.X (2022 ed.)`.
- HCV V2 extension chapter cited as `HCV2 §47.ext-X`.
- DCP O/M Ch.35 cited as `DCP O/M §35.X`.
- Indian system anchors cited with operator name on first use.
- Subscriber counts per TRAI 2025 quarterly report.

---

## Section I — Sign-Off

- Authored: Session 45, 2026-05-25.
- Author: Claude (Architect+Engineer role).
- Coverage class: TRIPLE-effective (state boards retain post-NCERT 2023 drop).
- Anchor density: **VERY-STRONG** (15 anchors — **densest topic observed across 21 pilots**).
- Triple-coverage rate: 76% (13/17).
- Atomic count: 17. Nano count: 7. Total: 24 entries.
- V1 ship count: 5 atomics.
- **Modern Physics applied cluster CLOSED** (T49 + T50).
- Next pilot batch: pending founder greenlight.

---

*Three consecutive VERY-STRONG anchor topics (T48, T49, T50). The applied/modern cluster is the Indian-context-richest region of the entire physics curriculum — a strategic insight for authoring priority and marketing.*
