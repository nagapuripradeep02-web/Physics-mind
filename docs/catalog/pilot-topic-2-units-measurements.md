# Pilot Topic 2 — Units and Measurements

> Stage-2 pilot catalog. 41st of 44. **NCERT-intro straggler-pair (part 1 of 2)** (sibling T3 Mathematical Tools in same Session 57 paired-batch). **NOT a cluster** — all 10 clusters closed at Session 56. These are the foundation-intro stragglers (T1-T4) that every prior topic silently assumed.
> Sources: **NCERT Class 11 Part 1 Ch.2 Units and Measurements** (canonical spine — SI units + dimensional analysis + significant figures + error of measurement) + **HCV Vol 1 Ch.1 Introduction to Physics** (units, dimensions, sig-figs, order-of-magnitude estimation) + **DC Pandey Mechanics Vol 1 Ch.1 Units, Dimensions and Error Analysis** (problem-pattern density: JEE-style dimensional-formula + error-propagation problems).
> Coverage class: **TRIPLE-COVERED**.
> Anchor density: **STRONG** (11 anchors × 6 strands — metrology/standards + space + education/lab + manufacturing + healthcare/pharma + geospatial). Strong national-metrology anchoring (CSIR-NPL national standards + cesium-clock IST + 2019-SI-redefinition + vernier/screw-gauge labs). Misses defence + transport + consumer-entertainment strands → STRONG, not VERY-STRONG.
> **Critical role:** T2 formalises **measurement itself** — the SI base/derived unit system, **dimensional analysis** (the universal sanity-check applied implicitly in EVERY downstream topic), **significant figures**, and **error propagation**. **T2 is a DAG-ROOT node**: it ABSORBS the `dimensional_analysis` + `unit_analysis` math-tool terminators cited by ~8 prior pilots (T18/T20/T25/T26/T27/T6/etc.) — those references now resolve to T2 rather than dangling at the math-tools file. Highest IN-degree, near-zero OUT-degree (depends on nothing physics; only basic algebra). Authored 41st precisely because it is so foundational every topic assumed it.

---

## Founder Decisions Applied

| Tag | Decision |
|---|---|
| **U-G1** | Atomic granularity = "one measurement-system OR one error-treatment OR one instrument-class." SI-units-and-consistency, dimensional-analysis, significant-figures, error-propagation, measurement-instruments = 5 atomics. T2 is the QUANTITATIVE-FOUNDATION topic; it does NOT teach calculus or functions (that is T3) — it teaches the unit/dimension/error layer. |
| **U-G2** | **Dimensional analysis is its own atomic** (`dimensional_analysis_atomic`) — dimensional formula [MᵃLᵇTᶜ]; principle of homogeneity; THREE legitimate uses (check an equation, convert units, derive a relation UP TO a dimensionless constant). **Diamond candidate** — the dimensional-balance animation (each term's [M][L][T] "weighs" the same on a balance). **cognitive_error_target:** "dimensional analysis gives the complete formula including numerical constants" → NO; the ½ in ½at² and the 2π in T=2π√(l/g) are INVISIBLE to it. |
| **U-G3** | **The LIMITATION of dimensional analysis is a mandatory nano** (`dimensional_limitations_nano`), not an afterthought. Three failures: (a) cannot find dimensionless constants (½, 2π); (b) cannot handle equations with >1 term of unknown form; (c) arguments of sin/cos/log/exp MUST be dimensionless. This is the single most-tested conceptual trap in the topic. |
| **U-G4** | **Significant figures is its own atomic** (`significant_figures_atomic`) — counting rules + the asymmetric arithmetic rule: **addition/subtraction keeps DECIMAL PLACES; multiplication/division keeps SIG-FIG COUNT.** **cognitive_error_target:** "more decimal places = more precise/accurate" → sig-figs ≠ decimal places; 0.0012 (2 sf) is LESS precise than 1.50 (3 sf) despite more decimals. |
| **U-G5** | **Error analysis + propagation is its own atomic** (`error_analysis_and_propagation_atomic`) — absolute/relative/percentage error; combination rules: **errors ADD (absolute) for sums/differences; RELATIVE errors add for products/quotients; multiply relative error by the POWER for exponents.** **cognitive_error_target:** "errors always just add" → the combination rule depends on the OPERATION; for Z = A²B/√C the relative error is 2(ΔA/A) + (ΔB/B) + ½(ΔC/C). |
| **U-G6** | **Measurement instruments + least count is its own atomic** (`measurement_instruments_least_count_atomic`) — least count; vernier caliper (LC = 1 MSD − 1 VSD); screw gauge (LC = pitch/divisions); zero error (systematic, subtract); accuracy vs precision. **cognitive_error_target:** "accuracy and precision are the same thing" → accuracy = closeness to true value; precision = repeatability/spread. A biased instrument is precise but inaccurate. |
| **U-G7** | **SI units + unit consistency is the catalog-anchor atomic** (`si_units_and_unit_consistency_atomic`) — 7 base units (m, kg, s, A, K, mol, cd); derived units built from base; unit consistency as the zeroth-order check. Includes the **2019 SI redefinition** (kg via Planck constant h; no more physical artefact) as a modern nano. **cognitive_error_target:** "units are just labels you can drop during calculation" → carrying units catches errors and is itself a derivation tool (factor-label method). |
| **U-G8** | **T2 is a DAG-ROOT — it ABSORBS math-tool terminators.** `dimensional_analysis` + `unit_analysis` were carried as math-tool reference stubs cited by ~8 prior pilots. Founder decision: those references now **resolve to T2's `dimensional_analysis_atomic`** as their true teaching home (exactly as T5 owns `vector_addition`). math-tools IN-degree HELD at 52 for continuity; flag Stage-4 final sweep to formally re-home + recompute. **Zero NEW math-tool stubs from T2.** |
| **U-G9** | **STRONG anchor (formalised criterion)** — 11 anchors × 6 strands. Metrology/standards (CSIR-NPL national standards + cesium-fountain clock for IST + kilogram-via-Planck 2019) + space (ISRO orbit-determination precision + Mangalyaan budget-precision) + education/lab (vernier caliper + screw gauge + school/IIT measurement labs) + manufacturing (Maruti/Tata machining tolerances ± microns) + healthcare/pharma (drug-dosage error propagation + clinical-thermometer least count) + geospatial (Survey of India geodesy + GPS precision). Misses defence + transport + entertainment strands → STRONG. **26th foundational-physics STRONG data point.** |
| **U-G10** | **Cognitive-error-prevention sub-category — 5 instances** (U-G2 dim-analysis-gives-constants; U-G4 decimal-places=precision; U-G5 errors-always-add; U-G6 accuracy=precision; U-G7 units-are-droppable-labels). Founder-decision share: 5/11 = 45%. T2 is genuinely misconception-rich — the dimensional-analysis limitation, sig-fig/decimal confusion, and accuracy/precision conflation are the three classic JEE-Main measurement traps. |

---

## Section A — Source Map

| Sub-topic | NCERT 11.1 Ch.2 | HCV V1 Ch.1 | DCM M1 Ch.1 |
|---|---|---|---|
| SI base + derived units, consistency | §2.1-2.3 | §1.4-1.5 | §1.1-1.2 |
| Dimensional analysis + homogeneity | §2.7 | §1.6 | §1.3 |
| Significant figures + rounding | §2.6 | §1.7 | §1.4 |
| Error of measurement + propagation | §2.6 | §1.8 | §1.5-1.6 |
| Measuring instruments + least count | §2.x (lite) | §1.3 | §1.7 (vernier/screw-gauge problems) |

**NCERT Ch.2 is the canonical spine for the unit-system + sig-fig + error treatment.** **HCV Ch.1 carries order-of-magnitude-estimation pedagogy** (the "guesstimate" skill NCERT/DCM treat lightly). **DCM M1 Ch.1 carries problem-pattern density** for JEE-style dimensional-formula-finding + error-propagation arithmetic. NCERT is lighter on vernier/screw-gauge mechanics; DCM is the problem source there.

**Root-node note (U-G8):** T2 sits at the BOTTOM of the dependency DAG. Its `Requires` column is nearly empty (only basic Class-9 algebra + the log function for error work). Its `Required-by` column is effectively UNIVERSAL — every quantitative atomic in every topic implicitly checks units/dimensions. This catalog records the explicit absorbed references (~8) rather than the universal implicit dependency, to keep the matrix sparse.

---

## Section B — Atomic + Nano Catalog

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **si_units_and_unit_consistency_atomic** | The **7 SI base units** (metre, kilogram, second, ampere, kelvin, mole, candela) and how every **derived unit** (N = kg·m/s², J = N·m, ...) is built from them. **Unit consistency** is the zeroth-order check on any equation; the **factor-label method** uses units as an algebraic derivation tool. | atomic | ✅ | — | [basic_algebra(Class 9)] | [dimensional_analysis_atomic, EVERY quantitative atomic (universal, implicit)] | U-G7; catalog-anchor atomic; **cognitive_error_target:** "units are droppable labels" |
| ↳ seven_base_units_nano | The 7 base quantities + their SI units + symbols; every other physical quantity is derived. Why exactly 7 (independence — none derivable from the others). | nano | ✅ | — | [si_units_and_unit_consistency_atomic] | — | parent; U-G7 scaffold |
| ↳ unit_conversion_factor_label_nano | Convert via multiplying by 1 in disguise (e.g., 72 km/h × (1000 m/km) × (1 h/3600 s) = 20 m/s). Units cancel like algebra; the method PREVENTS conversion errors. | nano | ✅ | — | [si_units_and_unit_consistency_atomic] | — | parent; cognitive-error countermeasure (units-as-tool) |
| ↳ si_redefinition_2019_nano | 2019 SI redefinition: kg now fixed via Planck constant h (no physical artefact); ampere via electron charge e; kelvin via Boltzmann k. **Modern Indian-relevant anchor**: CSIR-NPL realises the new kg with a Kibble balance. Constants, not objects, define units. | nano | ✅ | — | [si_units_and_unit_consistency_atomic, seven_base_units_nano] | — | parent; **metrology anchor**; modern |
| **dimensional_analysis_atomic** | The **dimensional formula** [MᵃLᵇTᶜ...] of a quantity; the **principle of homogeneity** (every additive term in a valid equation has identical dimensions). Three legitimate uses: (1) CHECK an equation; (2) CONVERT units between systems; (3) DERIVE a relation UP TO a dimensionless constant. The universal sanity-check applied implicitly across all of physics. | atomic | ✅ | — | [si_units_and_unit_consistency_atomic] | [error_analysis_and_propagation_atomic, EVERY formula-bearing atomic (universal); absorbs math-tool `dimensional_analysis`+`unit_analysis` stubs] | U-G2/U-G8; **Diamond candidate** (dimensional-balance animation); **cognitive_error_target:** "gives complete formula incl. constants" |
| ↳ principle_of_homogeneity_nano | Every additive term in a physically valid equation carries the SAME dimensions (you cannot add a length to a time). The instant equation-validity test: if the terms don't match dimensionally, the equation is WRONG (necessary, not sufficient). | nano | ✅ | — | [dimensional_analysis_atomic] | — | parent; U-G2 scaffold |
| ↳ deriving_relations_dimensionally_nano | Find the FORM of a relation by matching powers: T = k·mᵃ·lᵇ·gᶜ → solve a,b,c by dimensional balance → T = k√(l/g). **The k (= 2π here) is NOT obtainable** — must come from theory/experiment. The power-matching method. | nano | ✅ | — | [dimensional_analysis_atomic, principle_of_homogeneity_nano] | — | parent; the "derive up to a constant" use |
| ↳ dimensional_limitations_nano | Three hard failures: (a) cannot find dimensionless constants (½, 2π, sin's coefficient); (b) cannot handle multi-term-of-unknown-form equations; (c) arguments of sin/cos/log/exp MUST be dimensionless (ωt is fine; t alone inside sin is dimensionally illegal). **The single most-tested conceptual trap.** | nano | ✅ | — | [dimensional_analysis_atomic] | — | parent; U-G3; mandatory cognitive scaffold |
| **significant_figures_atomic** | The digits that carry real measurement information. Counting rules (non-zero always count; captive zeros count; leading zeros never; trailing zeros after a decimal count). The **asymmetric arithmetic rule**: +/− keeps the least DECIMAL PLACES; ×/÷ keeps the least SIG-FIG COUNT. | atomic | ✅ | — | [si_units_and_unit_consistency_atomic] | [error_analysis_and_propagation_atomic] | U-G4; **cognitive_error_target:** "decimal places = precision" |
| ↳ sig_fig_counting_rules_nano | Leading zeros (0.0025 → 2 sf) vs captive zeros (1002 → 4 sf) vs trailing zeros (2.50 → 3 sf; 2500 → ambiguous, use scientific notation 2.5×10³). Scientific notation removes ambiguity. | nano | ✅ | — | [significant_figures_atomic] | — | parent; U-G4 scaffold |
| ↳ sig_figs_in_arithmetic_nano | The asymmetric rule in action: 12.11 + 0.3 = 12.4 (1 decimal place); 4.32 × 1.1 = 4.8 (2 sf). The weakest measurement caps the result's precision. | nano | ✅ | — | [significant_figures_atomic, sig_fig_counting_rules_nano] | — | parent; the asymmetric +/− vs ×/÷ rule |
| ↳ rounding_convention_nano | Standard rounding (≥5 rounds up); only round the FINAL answer, never intermediate steps (intermediate rounding compounds error). Carry a guard digit. | nano | ✅ | — | [significant_figures_atomic] | — | parent |
| **error_analysis_and_propagation_atomic** | **Absolute error** Δx, **relative error** Δx/x, **percentage error** (Δx/x)×100. Propagation: errors ADD (absolute) for sums/differences; RELATIVE errors add for products/quotients; for Z = (A^p B^q)/C^r the relative error = p(ΔA/A) + q(ΔB/B) + r(ΔC/C). The exponent MULTIPLIES the relative error. | atomic | ✅ | — | [dimensional_analysis_atomic, significant_figures_atomic] | [EVERY experimental-result atomic (universal, implicit)] | U-G5; **cognitive_error_target:** "errors always just add" |
| ↳ combination_of_errors_nano | Derivation of the propagation rules from differentials: for Z = A·B, dZ/Z = dA/A + dB/B (relative errors add). The power rule from Z = Aⁿ: ΔZ/Z = n·(ΔA/A). | nano | ✅ | — | [error_analysis_and_propagation_atomic, derivative_as_rate_and_slope_atomic(T3)] | — | parent; bridges to T3 (differentials) |
| ↳ percentage_error_worked_nano | Worked: density ρ = m/V; m = 5.00 ± 0.01 g (0.2%), V = 4.0 ± 0.1 cm³ (2.5%) → Δρ/ρ = 0.2% + 2.5% = 2.7%. **The volume measurement dominates** — improving the balance is wasted effort. Error budgeting. | nano | ✅ | — | [error_analysis_and_propagation_atomic, combination_of_errors_nano] | — | parent; **healthcare/lab anchor** (dosage budgeting) |
| ↳ least_count_sets_minimum_error_nano | The instrument's least count is the floor on absolute error for a single reading. A vernier reading to 0.01 cm cannot claim 0.001 cm precision. Connects instrument choice → achievable error. | nano | ✅ | — | [error_analysis_and_propagation_atomic, measurement_instruments_least_count_atomic] | — | parent; links instrument → error |
| **measurement_instruments_least_count_atomic** | **Least count** = smallest measurable division. **Vernier caliper** LC = 1 MSD − 1 VSD (typically 0.01 cm). **Screw gauge** LC = pitch / number-of-circular-divisions (typically 0.001 cm). **Zero error** (systematic; subtract it). **Accuracy** (closeness to true value) vs **precision** (repeatability/spread) — independent qualities. | atomic | ✅ | — | [si_units_and_unit_consistency_atomic, significant_figures_atomic] | [error_analysis_and_propagation_atomic] | U-G6; **cognitive_error_target:** "accuracy = precision" |
| ↳ vernier_screw_gauge_reading_nano | Vernier: main-scale reading + (coinciding vernier division × LC). Screw gauge: main-scale + (circular-scale × LC), watch for backlash. The two workhorse Indian-physics-lab instruments. | nano | ✅ | — | [measurement_instruments_least_count_atomic] | — | parent; **education/lab anchor** |
| ↳ accuracy_vs_precision_nano | Bullseye picture: tight cluster off-centre = precise-but-inaccurate (systematic error / zero error); scattered around centre = accurate-but-imprecise (random error). The two are independent; good measurement needs both. | nano | ✅ | — | [measurement_instruments_least_count_atomic] | — | parent; U-G6 cognitive scaffold |
| ↳ zero_error_correction_nano | A screw gauge reading 0.002 cm with jaws closed has +0.002 cm zero error → SUBTRACT from every reading. Systematic (not random) — repeating the measurement does NOT average it out. | nano | ✅ | — | [measurement_instruments_least_count_atomic, accuracy_vs_precision_nano] | — | parent; systematic-vs-random scaffold |

**Atomic count:** 5. **Nano count:** 14. **Total entries:** 19.

---

## Section C — Cross-Source Coverage Matrix

| Atomic | NCERT 11.1 Ch.2 | HCV V1 Ch.1 | DCM M1 Ch.1 | Coverage |
|---|---|---|---|---|
| si_units_and_unit_consistency_atomic | §2.1-2.3 | §1.4-1.5 | §1.1-1.2 | TRIPLE |
| dimensional_analysis_atomic | §2.7 | §1.6 | §1.3 | TRIPLE |
| significant_figures_atomic | §2.6 | §1.7 | §1.4 | TRIPLE |
| error_analysis_and_propagation_atomic | §2.6 | §1.8 | §1.5-1.6 | TRIPLE |
| measurement_instruments_least_count_atomic | §2.x (lite) | §1.3 | §1.7 | TRIPLE (NCERT lite on vernier/screw-gauge mechanics) |

**Triple-coverage rate: 5 of 5 atomics = 100%.** **18th 100% topic in 41 pilots.** Streak (reset by T9 to 1) extends to **2**. T2 is genuinely triple-covered AND genuinely curricular (NCERT Ch.2 is a full quantitative chapter; dimensional-analysis + error-propagation are high-frequency JEE-Main topics) — unlike T3 (next), where NCERT structurally delegates math to the Math syllabus. **Contrast pair**: T2 = core-quantitative-physics 100%; T3 = NCERT-DELEGATED.

---

## Section D — Stage-3 Math-Tool Dependencies

| Math-tool primitive | Used by | Status |
|---|---|---|
| `dimensional_analysis` | dimensional_analysis_atomic | **ABSORBED → now resolves to T2** (U-G8; was a math-tool stub) |
| `unit_analysis` | si_units_and_unit_consistency_atomic | **ABSORBED → now resolves to T2** (U-G8; was a math-tool stub) |
| `algebra_basic_manipulation` | deriving_relations_dimensionally_nano (power-matching) | REQUIRED (existing) |
| `calculus_partial_derivative` | combination_of_errors_nano (differentials) | REQUIRED (existing; teaching-unit, owned by T3) |
| `logarithm_base_10` | percentage_error_worked_nano (log-differentiation for products) | REQUIRED (existing) |

**ZERO new stubs registered.** T2 instead **ABSORBS** two existing math-tool stubs (`dimensional_analysis` + `unit_analysis`) as a DAG-root — these now have their true teaching home in T2's `dimensional_analysis_atomic`. Math-tools IN-degree HELD at **52** for continuity (the two absorbed terminators are flagged for formal re-homing at the Stage-4 final sweep — they should migrate from the math-tools column to a new T2 column). **Light-maintenance mode continues 8 consecutive sessions** (S50 → S57).

---

## Section E — Cross-Topic Dependencies (Bidirectional Edges)

### Outgoing (T2 requires from earlier topics)

T2 is a **DAG-ROOT** — it requires almost nothing from physics (only basic algebra + the log/differential machinery owned by T3). Outgoing edges are minimal:

| Target topic | Edge | Reason |
|---|---|---|
| **T3 Mathematical Tools (intra-session)** | error_propagation → T3 derivative/differentials; sig-figs ↔ T3 approximations | **Intra-session bidirectional** (4 edges; foundation-intro straggler-pair, cross-link band 2-4) |
| Math-tools | algebra + log (existing); ABSORBS dimensional_analysis + unit_analysis | Zero new stubs; 2 absorbed |

### Incoming (T2 is required by — effectively UNIVERSAL)

| Source topic | Edge | Reason |
|---|---|---|
| **~8 prior pilots (back-edges, ABSORBED)** | T18/T20/T25/T26/T27/T6/etc. `unit_analysis` + `dimensional_analysis` terminators ← T2 | **RESOLVES** the dimensional_analysis/unit_analysis math-tool stubs into their true T2 home — these pilots were implicitly depending on T2 all along |
| **EVERY quantitative atomic (implicit, universal)** | dimensional consistency + unit checking | Recorded as the absorbed explicit references only (keeps matrix sparse); the universal implicit dependency is the DAG-root signature |

### T2 ↔ T3 intra-session bidirectional edges (4 edges)

| Edge | Reason |
|---|---|
| T2 error_propagation → T3 derivative | Error-combination rules derive from differentials dZ = (∂Z/∂A)dA + ... |
| T2 dimensional_analysis ↔ T3 functions | sin/cos/log/exp arguments must be dimensionless (T2 limitation ↔ T3 function-domains) |
| T3 functions_and_graphs → T2 units | Graph axes carry units; slope/area inherit composite units |
| T2 significant_figures ↔ T3 approximations | Both are "controlled-precision" disciplines (sig-figs ↔ truncated expansions) |

**Total outgoing: 4 intra-session (with T3) + 2 absorbed math-tool terminators + minimal algebra/log.**
**Total incoming: ~8 absorbed back-edge references (DAG-root) + universal implicit.**

**T2 is the lowest node in the dependency DAG** alongside T3 + T5 — see Part C "DAG-root" capstone observation.

---

## Section F — Real-World Anchors (STRONG, Indian-context)

| Anchor | Concept hook | Authoring use | Strand |
|---|---|---|---|
| **CSIR-NPL (National Physical Laboratory, New Delhi) — India's NMI** | si_units_and_unit_consistency_atomic, si_redefinition_2019_nano | "NPL keeps India's national standards; realises the 2019 kg via a Kibble balance — units defined by constants, not objects" | Metrology/standards |
| **Cesium-fountain atomic clock at NPL → Indian Standard Time** | si_units_and_unit_consistency_atomic, seven_base_units_nano | "The second is defined by 9,192,631,770 oscillations of a cesium-133 atom; NPL's clock broadcasts IST" | Metrology/standards |
| **ISRO orbit-determination + Mangalyaan budget-precision** | error_analysis_and_propagation_atomic, significant_figures_atomic | "Mars-orbit insertion needs velocity known to many sig-figs; small relative errors compound over millions of km" | Space |
| **Vernier caliper + screw gauge (school + IIT physics labs)** | measurement_instruments_least_count_atomic, vernier_screw_gauge_reading_nano | "Measure a wire's diameter with a screw gauge (LC 0.001 cm); read a cylinder with vernier (LC 0.01 cm)" | Education/lab |
| **Manufacturing tolerances (Maruti/Tata machining ± microns)** | measurement_instruments_least_count_atomic, error_analysis_and_propagation_atomic | "Engine-bore machined to ± a few microns; tolerance stack-up is error propagation in production" | Manufacturing |
| **Pharma drug-dosage + clinical-thermometer least count** | error_analysis_and_propagation_atomic, percentage_error_worked_nano | "Dosage error propagates from mass + volume measurement; clinical thermometer LC 0.1 °C" | Healthcare/pharma |
| **Survey of India geodesy + GPS coordinate precision** | si_units_and_unit_consistency_atomic, error_analysis_and_propagation_atomic | "Geodetic surveys carry error budgets; GPS position precision depends on timing precision (units of length ← time)" | Geospatial |
| **Order-of-magnitude estimation (Fermi-style 'how many...' )** | dimensional_analysis_atomic, deriving_relations_dimensionally_nano | "Estimate without exact data: dimensional reasoning + order-of-magnitude — the HCV Ch.1 'guesstimate' skill" | Education/lab |
| **T = 2π√(l/g) pendulum derivation (the canonical dim-analysis demo)** | dimensional_analysis_atomic, deriving_relations_dimensionally_nano, dimensional_limitations_nano | "Derive the pendulum period form by dimensional balance — then show the 2π is INVISIBLE to the method" | Education/lab |
| **Speed-limit unit conversion (km/h ↔ m/s on Indian highways)** | si_units_and_unit_consistency_atomic, unit_conversion_factor_label_nano | "Convert a 100 km/h expressway limit to 27.8 m/s via factor-label; units cancel like algebra" | Education/lab |
| **Chandrayaan/Aditya-L1 instrument calibration** | measurement_instruments_least_count_atomic, accuracy_vs_precision_nano | "Space-instrument calibration distinguishes accuracy (true value) from precision (repeatability)" | Space |

**Total: 11 distinct institutional/system anchors across 6 strands** (metrology/standards, space, education/lab, manufacturing, healthcare/pharma, geospatial). **Falls short of strand-diversity ≥ 8 VERY-STRONG threshold.** **Decision (U-G9): STRONG**. **26th foundational-physics STRONG data point.** Anchors cluster in metrology + education/lab (the topic's natural home); misses defence + transport + entertainment strands. T2 anchors notably BETTER than its sibling T3 (next) — measurement has tangible institutional anchors (NPL, ISRO, labs) while pure math-tools are abstract.

---

## Section G — Cognitive-Error-Prevention Decisions

**5 of 11 founder decisions are cognitive-error-prevention type = 45%.** T2 is genuinely misconception-rich — the dimensional-analysis limitation, sig-fig/decimal-place confusion, and accuracy/precision conflation are the three classic JEE-Main measurement traps.

| Tag | cognitive_error_target | Countermeasure |
|---|---|---|
| **U-G2** | "dimensional analysis gives the complete formula including numerical constants" | Mandatory `dimensional_limitations_nano`: the ½ and 2π are INVISIBLE; dimensional analysis gives FORM up to a dimensionless constant only |
| **U-G4** | "more decimal places = more precise/accurate" | Mandatory sig-figs-vs-decimal-places distinction; 0.0012 (2 sf) is less precise than 1.50 (3 sf) |
| **U-G5** | "errors always just add" | Mandatory operation-dependent propagation: absolute add for ±; relative add for ×/÷; exponent multiplies relative error |
| **U-G6** | "accuracy and precision are the same thing" | Mandatory bullseye picture: precise-but-inaccurate (systematic) vs accurate-but-imprecise (random) — independent qualities |
| **U-G7** | "units are just droppable labels" | Mandatory factor-label method: units cancel like algebra and CATCH errors; units are a derivation tool |

**T2 cognitive-error share: 45% (5/11).** Sits within the foundation-topic high band (Kinematics cluster mean 48.5%). Like kinematics, the measurement chapter is where the silent CONVENTIONS of physics (what a unit means, what a measurement claims, what an error is) are set — and conventions are the deepest misconception sources.

---

## Section H — V1 Priority Flags

| Atomic | V1? | Reason |
|---|---|---|
| dimensional_analysis_atomic | ✅ | Diamond candidate; dimensional-balance animation; the universal sanity-check; absorbs math-tool terminators; THE highest-leverage measurement concept |
| significant_figures_atomic | ✅ | Pure-curricular essential; high JEE-Main frequency; sig-figs-vs-decimals is a top-3 measurement trap |
| error_analysis_and_propagation_atomic | ✅ | JEE-Main staple (error-propagation problems appear nearly every year); error-budgeting is a transferable lab skill |
| si_units_and_unit_consistency_atomic | ⚖️ | V1.1; foundational but lower student-failure-rate; factor-label is quick to teach |
| measurement_instruments_least_count_atomic | ⚖️ | V1.1; vernier/screw-gauge is hands-on (better taught with a real instrument than a sim); accuracy-vs-precision nano is the V1-worthy fragment |

**V1 ship count for T2: 3 atomics.**

---

## Section I — Open Questions

1. **Should `dimensional_analysis` + `unit_analysis` be formally migrated** from the math-tools column to a dedicated T2 column at the Stage-4 final sweep? (U-G8 holds the count at 52 for now; the clean answer is YES — T2 is their true teaching home, exactly as T5 owns vectors.)
2. **Order-of-magnitude / Fermi estimation** — HCV Ch.1 teaches it; NCERT/DCM barely. Is it a V1 atomic or a nano under dimensional_analysis? Currently a nano-adjacent skill folded into `deriving_relations_dimensionally_nano`. Revisit if student data shows estimation is a distinct gap.
3. **2019 SI redefinition depth** — students rarely tested on it but it is conceptually clarifying (constants define units). Kept as a nano, not an atomic.
4. **Vernier/screw-gauge as simulation vs physical instrument** — these may teach BETTER with a real tool than a sim (hands-on). Board/lab mode may route to a "bring a real caliper" instruction rather than a full sim. Flag for mode-design.
5. **NCERT-intro straggler-pair check** — **T2 DONE (this catalog). T3 next (same session).** After Session 57: Stage-2 at 42/44 = 95%. Remaining: T1 Physical World + 1 final straggler (Session 58) = Stage-2 COMPLETE.

---

## Section J — Sign-Off

- Authored: Session 57, 2026-05-26.
- Author: Claude (Architect+Engineer role).
- Coverage class: **TRIPLE**.
- Anchor density: **STRONG** (11 anchors × 6 strands — 26th foundational-physics STRONG data point).
- Triple-coverage rate: **100%** (5/5 atomics) — **18th observed 100% topic**; streak extends to 2 (after T9 reset).
- Atomic count: **5**. Nano count: **14**. Total: **19 entries**.
- V1 ship count: **3 atomics**.
- **DAG-ROOT node**: absorbs `dimensional_analysis` + `unit_analysis` math-tool terminators (~8 prior-pilot references re-homed to T2). Highest IN-degree, near-zero OUT-degree.
- **0 new math-tools stubs. Light-maintenance NEW LONGEST streak at 8 consecutive sessions.** 2 existing stubs ABSORBED (re-homing flagged for Stage-4).
- Cognitive-error-prevention founder-decision share: **45%** (5/11) — foundation-topic high band.
- **Stage-2 at 41/44 = 93% after T2; 42/44 = 95% after T3 (same session).**
- Next: T3 Mathematical Tools (this session) → then Session 58 T1 + final straggler = Stage-2 COMPLETE.

---

*18th 100% topic; 26th foundational-physics STRONG. T2 is a DAG-ROOT — it absorbs the dimensional_analysis + unit_analysis math-tool terminators that ~8 prior pilots silently depended on. Measurement is where the conventions of physics are set; 45% cognitive-error share. Contrast pair with T3 (NCERT-DELEGATED). 8 consecutive math-tools light-maintenance sessions.*
