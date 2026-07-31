# ARCHITECT SKELETON — `em_wave_propagation`

> Chapter-loop run, worktree `physics-mind-ch8`, branch `feat/ch8-em-waves` (2026-07-24).
> **Chapter:** Class 12, Ch.8 Electromagnetic Waves — NCERT §8.3 (Electromagnetic Waves — nature, propagation, speed). Second Ch.8 diamond; continues DIRECTLY from `displacement_current` (shipped, sealed) and cashes its S9/S10 forward hook ("the handshake that lets waves carry themselves through empty space").
> **Renderer:** `field_3d` — **NEW `scenario_type: "em_wave_propagation"`** (Class-B triage: verified against the live registry in `src/lib/renderers/field_3d_renderer.ts` lines 42–55 — no existing scenario carries a traveling transverse dual-sinusoid train; engine delta declared FIRST in §0b, json_author must NOT start until it lands).
> **Sibling-queue impact:** this concept ABSORBS the two siblings displacement_current's skeleton seeded as `em_wave_nature` + `speed_of_em_waves` (founder brief merges nature + propagation + speed into one atomic diamond). Remaining Ch.8 siblings: `electromagnetic_spectrum` (the founder-approved chapter_map id; the architect wrote `em_spectrum` — use the state-file id), `em_wave_energy_momentum` (intensity / radiation pressure / momentum quantitative — deferred). See Escalation #4 (CONCEPT_SYNONYMS redirects).

---

## 0a. Engine bug queue consultation (pre-authoring)

Live SQL not executable from the architect dispatch (no Bash/DB tool — same constraint as the displacement_current run). Consulted the canonical read-only mirror `docs/FIELD3D_SCENARIO_CHECKLIST.md` in full plus the displacement_current run's own scar applications. **FLAG to quality_auditor: run `query_engine_bug_queue.ts em_wave_propagation` + `--field3d --open` live at Gate 8.** Prevention rules applied:

| Scar / prevention rule (mirror) | How this skeleton satisfies it |
|---|---|
| Concrete before abstract | S1–S3 are pure phenomenon (wiggle, traveling pulse, motes, needle kicks — NO formula surface at S1/S3); the first real equation is S4's direction rule; c's formula waits for S6; calculus never appears (none in this concept) |
| Don't pre-spoil a later reveal | **The word "light" is BANNED from all narration/captions/labels before S6** — the payoff is that this lab object turns out to BE light; μ₀/ε₀ first on-canvas at S6; E₀/B₀ notation first at S7; k/ω first at S9; the sunlight anchor lands AT S6, never earlier (§9) |
| Reveal synced to narration | Cue plan in §3 — source-off, motes-vanish, camera round-trip, ghost-B spawn/dissolve, gate ticks, constant-dock, equation docks all land on their narrating sentence via `scenario_cue` + `SET_CUE_TIME`; `at_ms` fallbacks kept for THE EYE |
| Show a quantity live when it's named | Receiver gauges (E, B) are live from S1; λ + ν readouts born on S6's sentence naming them; ratio chip born on S7's naming sentence; energy tanks born on S8's |
| Visual must match narration | "keeps going with the source off" = switch visibly opens, charge bead freezes, pulse sails on; "nothing material waves" = motes never jiggle, then vanish with zero change; "in phase" = cursor + twin readouts peaking together; "measured speed" = gates + stopwatch ticking real ns |
| Coordinate sim + graph | No separate graph pane (deliberate — §10 i-5); the "coordinate" duty is ONE live source (ν, E₀) driving train, envelopes, gauges, tanks, and λ readout together |
| Distinct reference lines | λ bracket (one pattern repeat), gate-distance line `D = 6.00 m`, and axis ticks are three separate labelled primitives — never conflated |
| Colour by sign/identity | E train/envelope/tank green, B train/envelope/tank blue (Ch.8 continuity with displacement_current); source charge warm amber; motes neutral gray; wrong-expectation ghost desaturated red (reuses the dc S5 ghost-tag pattern, already engine-proven — commit `aa724f8`) |
| Register the NEW scenario in `deriveStateMeta.ts` in the SAME change | §0b requirement 7 — per-state reveal/settle pins for every one-shot + S11 `interactive` hold-intent, else THE EYE false-fails D7/D1p |
| No frozen tail / one-shots hold end pose | Every state's train/pulse motion is perpetual by construction; docked formula lines, the pinned MATCH chip (S6), and the dissolved-ghost end pose all hold |
| Explorers must move / don't gate visuals on the clock in slider states | S11's train self-moves perpetually (satisfies D1p natively) + `interactive` hold-intent declared; S7/S8 envelope scaling renders at full immediately and tracks the slider live — no emergence ramp on slider states |
| Interactivity contextual, full sandbox last only | Rule 31c rows: ν (S6), E₀ (S7/S8), n (S10); explore = the core-ring set (§3 note on the 31c/38b reconciliation) |
| Specific `visible_elements` tokens | `emw_` prefix throughout: `emw_source`, `emw_e_train`, `emw_b_train`, `emw_receiver`, `emw_motes`, `emw_triad`, `emw_ghostb`, `emw_cursor`, `emw_gates`, `emw_tanks`, `emw_slab` — audited pairwise, no token is a substring of another |
| Billboard readable under 3/4 camera | λ bracket, gate-distance line, triad labels billboarded camera-right; triad + ghost train `depthTest:false` + high renderOrder over the arrow arrays |
| Deterministic geometry | Sinusoid trains, pulse envelope, and mote positions are pure seeded functions of the state clock — zero per-frame randomness |

**NCERT / DC Pandey check:** *Consulted NCERT Ch.8 + DC Pandey chapter tables of contents to confirm scope only — §8.3 covers sources/nature (transverse, E⊥B⊥k, in phase), c = 1/√(μ₀ε₀), E₀/B₀ = c, energy sharing, and v = 1/√(με); the spectrum is §8.4 (sibling `electromagnetic_spectrum`); intensity/momentum quantitative deferred to `em_wave_energy_momentum`. No teaching method, no example problem, no figure reference imported.*

---

## 0b. Engine ask — NEW `scenario_type: "em_wave_propagation"` (the field3d-surgeon build target, declared FIRST)

**Renderer reality check (explicit, per brief):** the full registry read from `field_3d_renderer.ts` (union at lines 42–55): point_charge_±, dipole(_field/_potential), parallel_plates, solenoid_field, bar_magnet(_as_dipole/_in_uniform_field), straight_wire_current, changing_flux, lorentz_force_uniform_field, torque_on_loop_uniform_field, biot_savart_element, force_on_current_wire, uniform_field_force, dipole_in_uniform_field, coulombs_law_force, charge_distribution, electric_flux, gauss_law(_sphere/_line/_sheet/_magnetism), rhr_force_direction, magnetic_no_work, radius/helix_in_uniform_field, cyclotron_period, amperes_circuital_law, current_loop_acts_as_dipole, parallel_currents_force, magnetic_field_circular_loop, moving_coil_galvanometer, galvanometer_to_ammeter_voltmeter, earths_magnetism, magnetisation, faraday, system_of_charges, system_pe_assembly, pe_external_field, motional_emf_rod, eddy_current_pendulum, inductance, ac_generator, magnetic_flux_loop, capacitance, displacement_current. **Closest existing:** (a) `changing_flux`/`faraday` — has a moving-object + induced-effect grammar but its geometry is coil+magnet, no propagation axis, no vector train; (b) `ac_generator` — has sinusoids but as a graph of one rotating coil, not a traveling spatial wave; (c) `parallel_plates` — static uniform field only. **None renders a translating transverse vector train with two orthogonal polarizations, a phase-speed clock, or a medium slab. Verdict: NEW scenario required.** Clonable machinery: dc ghost-tag (wrong-expectation), dc formula-dock/ledger chips, probe/needle instrument pattern, trusted-drag seize, glow enum plumbing.

**Apparatus (home pose, persists across all 11 states — Rule 32d):** frame LEFT: a small vertical antenna rod (`emw_source`) with a warm charge bead that oscillates up/down + an ON/OFF switch; from it, the propagation axis (+x, `emw_axis`, ~10 m with metre ticks and a direction arrow) runs RIGHT; frame RIGHT: a receiver post (`emw_receiver`) with two live gauges — `E = … V/m` (green) and `B = … μT` (blue), numeric + needle (Rule 33d). Along the axis, the wave: `emw_e_train` (green E arrows oscillating along y + smooth envelope) and `emw_b_train` (blue B arrows oscillating along z + envelope). 3/4 camera framing source → axis → receiver. **Time-scaling license (declared — FL3 name; it scales playback time, it is NOT relativistic dilation):** distances are real metres and all readouts real SI; the clock runs in real nanoseconds displayed stylized to seconds (one narration clause at S6's stopwatch — "the clock here counts nanoseconds"). Per-state `wave_mode: 'pulse' | 'train'` knob (pulse = enveloped packet; train = continuous sinusoid).

**Addressable objects (Rule 27 explorer pattern — stable ID + key params each):**

| ID | What it is | Cloned from |
|---|---|---|
| `emw_source` | antenna rod + oscillating charge bead + visible switch; params: on/off, ν, E₀, pulse/train | new mesh, simple |
| `emw_axis` | propagation axis + metre ticks + `direction of travel →` tag | standard |
| `emw_e_train`, `emw_b_train` | the two orthogonal arrow arrays + envelope curves, phase-advancing at v = c/n(x); arrows are pure functions of (x, t) | the genuinely NEW primitive (deterministic vector train) |
| `emw_receiver` | dual gauge E (V/m) + B (μT), numeric + tracking needle | dc probe/ammeter instrument pattern |
| `emw_relay` | the S2 leapfrog zoom: at the pulse front, a glowing "change" pulse on the E-kink spawns a B-loop one step ahead, whose change spawns the next E-kink — a chevron hand-off marching +x, looping | new choreography on existing loop/glyph machinery |
| `emw_motes` | ~40 seeded gray dust motes floating along the axis; NEVER displaced by the wave; `vanish` cue fades them out | emissive dots |
| `emw_triad` | x̂ŷẑ axis triad at a marked point P + the E×B thrust arrow + RHR sweep-arc glyph (E sweeps into B) | rhr_force_direction glyphs (optional dock of the shipped RHR hand mesh if it ports cleanly — flag, don't block) |
| `emw_ghostb` | the WRONG 90°-shifted B train, desaturated red, `expected?` tag; spawn + dissolve cues | dc S5 wrong-expectation ghost pattern (`aa724f8`) |
| `emw_cursor` | a vertical phase-cursor plane that rides the train; live per-point E, B (and S8: u_E, u_B) readouts | probe_points pattern |
| `emw_gates` | two timing gates at marked x-positions, distance line `D = 6.00 m`, stopwatch chip (starts/stops on pulse crossing), `v = D/Δt` dock | new, simple |
| `emw_tanks` | two energy-density tank meters (green `u_E`, blue `u_B`), numeric + fill level, sampled at the cursor | Rule 33d instrument pattern |
| `emw_slab` | translucent medium slab straddling a mid-axis section; param n; inside it BOTH trains stay drawn and visibly slow, their crests bunching (λ/n) together; boundary continuity of ν enforced for BOTH trains (F2/FL5) | new geometry, simple |
| `emw_formula`, `emw_hud` | ONE 'Cambria Math' Unicode formula surface + value-only HUD | Rule 34b surfaces |

**Build staging (F1 — bounded first increment for the field3d-surgeon under the Amendment-4 per-dispatch ceiling):** LOAD-BEARING CORE, built FIRST as one coherent increment — `emw_source` + `emw_axis` + `emw_e_train` + `emw_b_train` + `emw_receiver` + the per-state `wave_mode: pulse|train` knob, **plus `emw_motes`** (simple seeded emissive dots; S3's null-result beat cannot render without them) — enough that S1–S3 render end-to-end. PER-STATE ADD-ONS, layered afterwards in state order — `emw_relay` (S2 zoom band), `emw_triad` (S4), `emw_ghostb` + `emw_cursor` (S5; the cursor gains its u_E/u_B readouts at S8), `emw_gates` (S6), `emw_tanks` (S8), `emw_slab` (S10) — with `emw_formula`/`emw_hud` riding the first increment that needs a surface (S2's formula line). Handoff-note-at-ceiling discipline applies (Amendment 4).

**Slider rows** (built once, shown/hidden per state, same screen position when shared; Rule 39g discovery conventions — `emw_<name>_row` ids, inline `position:fixed` panels, `pm_hud` statics; `#sliders` exclusion chain updated): `emw_freq_row` "Source frequency ν" (50–200 MHz, step 5, default 100) · `emw_e0_row` "Field strength" (40–200 V/m, step 5, default 120 — labelled WITHOUT the E₀ subscript until S7 teaches it; row label is ring-safe: "Field strength") · `emw_n_row` "Refractive index n" (1.0–2.0, step 0.05, default 1.5; S10 ONLY — advanced ring) · `emw_src_row` "Source ON/OFF" (toggle; S11).

**Physics the scenario computes (verified engine, never the LLM):** phase advance x − v·t with v = c/n(x) (n = 1 outside the slab), linear in dt (Rule 36 — 0–3 fixed steps, no per-frame constants); E(x,t) = E₀·sin(k(x − vt)) on ŷ; B(x,t) = E(x,t)/c on ẑ (F2: BOTH trains stay drawn inside the slab — both phase-advance at v = c/n, both bunch to λ_med = 2.00 m, and ν is continuous across the boundary for BOTH trains (FL5); the in-slab B amplitude keeps the vacuum ratio E/c as a DECLARED, unnarrated stylization — safe because NO E/B amplitude ratio is surfaced on S10, and the exact n·E/c amplitude would visibly change a non-taught variable against Rule 32b, so the optional exact-amplitude path is deliberately declined — see §3 S10); λ = v/ν with ν continuous across the slab boundary; gate timing Δt = D/v; u_E = ½ε₀E², u_B = B²/(2μ₀) computed from UNROUNDED internals so the tanks read exactly equal (the dc-S8 rounding lesson); ratio chip E₀/B₀ = c locked by construction.

**Hard requirements in the SAME change:** (1) `deriveStateMeta.ts` per-state reveal/settle pins for every one-shot + S11 `interactive` hold-intent; (2) trusted-drag seize on all four rows — and the S10 `emw_n_row` seize must UN-PIN the state's end-of-timeline clock pin (FL1: S10 is `manual_click`, so Rule 37 does NOT free-run it; without the un-pin the n-drag re-renders a frozen picture — clone the S7/S8 seize pattern) so dragging n drives LIVE continuous crest-bunching; (3) closed glow enum `source · relay · motes · triad · cursor · gates · ratio · tanks · formula · slab · receiver`; (4) suppress any generic field legend (Rule 24); (5) `assembleField3DHtml` routing (capital-suffix regex N/A); (6) RHR support = the S4 sweep-arc glyph required, hand-mesh dock optional; (7) no backticks anywhere in the emitted renderer template body (`check:renderer-syntax` after the edit); (8) a `field_lines` block present in `field_3d_config` (validator expectation); (9) motes/train/pulse all deterministic seeded functions — THE EYE frozen baselines byte-stable.

---

## 1. Atomic claim

This concept teaches that **mutually regenerating changing E and B fields self-propagate through empty space as a transverse wave — E ⊥ B ⊥ direction of travel with E×B pointing ahead, E and B in phase with E₀/B₀ = c, carrying energy split equally between the two fields, at the speed c = 1/√(μ₀ε₀) ≈ 3×10⁸ m/s that identifies light itself as an electromagnetic wave (v = c/n in a medium).** It does not cover the electromagnetic spectrum's bands and uses (deferred to `electromagnetic_spectrum`), quantitative intensity / radiation pressure / momentum transfer (deferred to `em_wave_energy_momentum`), the displacement-current law itself (prerequisite `displacement_current`), Faraday's law (prerequisite `faraday_law_induction`), or general wave kinematics — crest, wavelength, frequency, λν = v (Class 11 prerequisite, applied here, never re-taught).

---

## 2. State count + arc

**11 states** — a 6-state core spine (phenomenon → mechanism → structure → the speed payoff), a 3-state extended quantitative block, a 1-state advanced tail, and explore. Very-complex band (10–12), documented: this diamond deliberately ABSORBS two previously-seeded siblings (`em_wave_nature` + `speed_of_em_waves`) per the founder brief — one atomic idea ("the self-carrying transverse wave"), two exam-quantity families. The ring structure means the pure-core lesson is 7 states total and no preset ever shows more than 11. Completeness test: a student who watches all 11 can answer every §8.3 exam-question class — no-medium reasoning, transverse/perpendicularity, E×B direction, phase relation, c from μ₀ε₀, B₀ from E₀, write-B-given-E, energy sharing, speed/wavelength in a medium. The hook MOVES from t=0 (the charge wiggles, the pulse travels) — no static setup state.

| State | Purpose (one line) |
|---|---|
| S1 `wiggle_launches_wave` | A wiggling charge launches a disturbance that TRAVELS — the far receiver kicks only after a delay |
| S2 `the_handshake` | **SUPPORTING AHA** — switch the source OFF mid-flight: the pulse keeps going; zoom: changing E makes B, changing B makes E, each one step ahead |
| S3 `no_medium_needed` | **Rule 16a contrast beat** — the motes never jiggle; remove them entirely (vacuum) and nothing changes |
| S4 `transverse_structure` | E ⊥ B ⊥ travel; sweep E into B — the thrust points where the wave goes, crest or trough alike |
| S5 `in_phase` | **Rule 16a contrast beat** — the expected 90°-shifted ghost B is wrong: crests together, zeros together |
| S6 `speed_payoff` | **PRIMARY AHA** — gates time the pulse at 3.0×10⁸ m/s; 1/√(μ₀ε₀) predicts the same number: light IS this wave |
| S7 `amplitude_ratio` | EXTENDED — drag the field strength: both envelopes scale in lockstep, E₀/B₀ pinned at c |
| S8 `energy_split` | EXTENDED + **Rule 16a contrast beat** — the "tiny" B carries exactly HALF the energy: u_E = u_B at every instant |
| S9 `write_the_partner_wave` | EXTENDED — three recalls (direction, phase, ratio) dock into B_z = (E₀/c)·sin(kx − ωt) under the given E |
| S10 `into_a_medium` | ADVANCED — a slab slows the wave: v = c/n = 1/√(με); crests bunch, frequency holds |
| S11 `em_wave_sandbox` | Explore — ν, field strength, source live; core-ring content only |

**teaching_method:** S1–S10 straightforward motion beats (field omitted per Rule 31); S11 `exploration_sliders`.

**Locked physics numbers (all states share them; physics_author verifies independently):** ν = 100 MHz → T = 10.0 ns, λ = 3.00 m (vacuum); axis ≈ 10 m (~3 wavelengths). E₀ = 120 V/m → **B₀ = E₀/c = 4.0×10⁻⁷ T = 0.40 μT**. Computed **c = 1/√(μ₀ε₀) = 1/√(1.2566×10⁻⁶ × 8.8542×10⁻¹²) = 2.998×10⁸ m/s**. Measured: gates D = 6.00 m, Δt = 20.0 ns → **v = 3.0×10⁸ m/s** (match). Energy at a crest: **u_E = ½ε₀E₀² = 6.38×10⁻⁸ J/m³ = u_B = B₀²/2μ₀** (exact value 6.375×10⁻⁸; display LOCKED to 6.38 — round-half-up, FL4 — both tanks render the IDENTICAL string from unrounded internals). S9: k = 2π/λ = 2.09 rad/m, ω = 2πν = 6.28×10⁸ rad/s, ω/k = 3.00×10⁸ m/s. S10 (n = 1.5): v = 2.00×10⁸ m/s, λ_med = 2.00 m, ν unchanged at 100 MHz.

---

## 3. Per-state choreography + control plan (Rule 31 — with `depth_ring`, Rule 38a)

**Coined archetypes:** `leapfrog-relay` — two coupled processes alternately regenerate each other in a spatial hand-off chain (changing E births B ahead; changing B births E ahead); nothing in the seed vocabulary names mutual regeneration. · `lockstep-scale` — two live amplitudes co-scale under ONE drag with their ratio visibly pinned; nothing in the seed vocabulary names a locked proportional co-scaling. · `chain-link-derivation` — reused precedented coin (displacement_current S8): already-visible pieces glow in turn while their algebra lines dock into one building formula surface.

**Declared contrast pair — S1 ↔ S6 (`translate-through` ×2):** the SAME pulse journey down the SAME axis — S1 shows it qualitatively (the receiver kicks only after a delay: it travels), S6 re-runs it under a stopwatch (gates + ns clock: it travels at exactly 3.0×10⁸). Both delta lines name the flip: "the same journey, now timed."

| State | depth_ring | Teaches (ONE idea) | Archetype | DISTINCT motion (state clock, Rule 26; loops one full cycle per dwell) | Δ cue (≤5 words) | Live controls | glow_focal | advance_mode | Budget |
|---|---|---|---|---|---|---|---|---|---|
| S1 `wiggle_launches_wave` | **core** | An oscillating charge launches a traveling field disturbance — it takes TIME to arrive | `translate-through` (**pair w/ S6**) | Charge bead wiggles a short burst (cause) → a green E-ripple + blue B-ripple pulse detaches and travels +x down the axis → only when it reaches the far post do the receiver needles kick (effect, after the visible travel delay) → pulse exits, soft reset, relaunch (~2 cycles/dwell). NO speed number shown anywhere. | "A wiggle travels out" | none | `receiver` | manual_click | 40–55 w / ~18 s |
| S2 `the_handshake` | **core** | The wave carries ITSELF: each field's change regenerates the other, one step ahead | `leapfrog-relay` | Pulse launches as in S1 → the source switch visibly OPENS mid-flight (cause), the charge bead freezes → the pulse keeps traveling unchanged (effect, readable beat) → camera-near zoom band at the pulse front: glowing "change" pulse on the E-kink spawns a blue B-loop one step ahead; ITS change spawns the next green E-kink; chevron hand-off marches +x, looping | "Source off — wave continues" | none | `relay` | manual_click | 40–55 w / ~18 s |
| S3 `no_medium_needed` | **core** | Nothing material waves — empty space is all the fields need | `null-result-hold` | Continuous train now runs; gray motes float all along the axis and visibly DON'T jiggle as crests sweep through them → cue: the motes fade out entirely, "air pumped away" (cause) → deliberate NOTHING happens: train shape, speed, and the receiver's 120 V/m peak reading are pixel-identical (a small `no change` chip pins) | "Remove everything — nothing changes" | none | `motes` | manual_click | 30–45 w / ~14 s |
| S4 `transverse_structure` | **core** | E ⊥ B ⊥ travel — and E×B points where the wave goes | `rotate/flip` | At marked point P the triad x̂ŷẑ is born; camera eases ONE round trip to the axis-on view (E vertical, B horizontal — a clean cross, 90° apart) and back → the RHR sweep-arc rotates E into B (cause) → after a beat the thrust arrow lights along +x (effect) → half a cycle later BOTH arrows have flipped (trough) → sweep again: thrust STILL +x | "E cross B points ahead" | none | `triad` | manual_click | 40–55 w / ~18 s |
| S5 `in_phase` | **core** | E and B peak together and vanish together — in phase, not 90° apart | `oscillate/track` | Misconception beat (16a): the desaturated-red ghost B train spawns, shifted 90° ("expected?" tag — E max where B zero) → the cursor plane rides the real train (cause); its twin readouts rise and fall TOGETHER — crest with crest, zero with zero (effect) → at a held crest the ghost's claim visibly contradicts the real blue train → ghost dissolves; end pose holds | "Crests together, zeros together" | none | `cursor` | manual_click | 40–55 w / ~18 s |
| S6 `speed_payoff` | **core** | The handshake's speed is 1/√(μ₀ε₀) — the measured speed of light: light IS an EM wave | `translate-through` (**pair w/ S1** — the named flip: the same journey, now timed) | Pulse mode returns (home-pose echo of S1) → gate A tick starts the ns stopwatch (cause), gate B tick stops it: Δt = 20.0 ns over `D = 6.00 m` → HUD docks `v = D/Δt = 3.0×10⁸ m/s` → then the two constant chips (ε₀ from the displacement chain, μ₀ from Ampère's loops) slide into `c = 1/√(μ₀ε₀)` → `2.998×10⁸ m/s` docks BESIDE the measured value; a MATCH chip pins and holds; λ + ν readouts born; dragging ν visibly reshapes λ while the gates keep timing the SAME speed | "Lab constants predict light" | **ν** | `gates` | manual_click | 40–55 w / ~18 s |
| S7 `amplitude_ratio` | **extended** | The two amplitudes are locked: E₀/B₀ = c, so B₀ = E₀/c = 0.40 μT | `lockstep-scale` | The field-strength row auto-sweeps then is teacher-seizable (cause): green envelope grows/shrinks and the blue envelope follows in exact lockstep (effect) → gauges track (`E₀ = 120 V/m`, `B₀ = 0.40 μT` — the strikingly tiny number is SHOWN, deliberately) → the ratio chip `E₀/B₀ = 3.0×10⁸` never ticks (the frozen-chip motif echoing dc S9's sum chip) | "One drag, locked ratio" | **field strength** | `ratio` | manual_click | 30–45 w / ~14 s |
| S8 `energy_split` | **extended** | Energy rides half-and-half in the two fields: u_E = u_B at every instant | `cycle-compare` | Misconception beat (16a): a ghost tag posts "B is 0.0000004 — surely it carries almost nothing" → the cursor steps crest → zero → crest (cause); the two tanks fill and empty in EXACT lockstep — at a crest both read 6.38×10⁻⁸ J/m³ (locked display, FL4), at a zero both read 0, never unequal (effect) → drag field strength: both tanks rescale together, still equal | "Energy splits exactly half-half" | **field strength** | `tanks` | manual_click | 40–55 w / ~18 s |
| S9 `write_the_partner_wave` | **extended** | Given E_y = E₀ sin(kx − ωt), the partner B is fully determined — amplitude, direction, phase | `chain-link-derivation` | Train runs ambient (home pose); glow walks three RECALLS while their lines dock into the formula surface: triad glows → "direction: ẑ (E×B must point +x)" docks; cursor glows → "same phase: same (kx − ωt)" docks; ratio chip glows → "amplitude: E₀/c" docks → the completed `B_z = (E₀/c)·sin(kx − ωt)` line lights and the actual blue train glows in confirmation — the drawn wave IS the freshly-written equation | "Three recalls write B" | none | `formula` | manual_click | 40–55 w / ~18 s |
| S10 `into_a_medium` | **advanced** | In matter the handshake runs slower: v = 1/√(με) = c/n; ν holds, λ shortens | `densify/rarefy` | The translucent slab slides into the mid-axis (cause) → inside it the crest spacing visibly DENSIFIES — crests bunch from λ = 3.00 m to 2.00 m and the phase fronts crawl at 2.00×10⁸ (effect); a crest-counter chip shows the SAME ν = 100 MHz on both sides; the wave exits and resumes c and 3.00 m; drag n and the bunching deepens live (F2: BOTH trains stay drawn inside the slab — green and blue slow and bunch TOGETHER at v = c/n, ν continuous for both (FL5); no E/B amplitude ratio is surfaced anywhere on this state — the in-slab vacuum-ratio B amplitude is an unnarrated stylization, §0b) | "Slower inside, crests bunch" | **n** | `slab` | manual_click | 40–55 w / ~18 s |
| S11 `em_wave_sandbox` | **core** (ring-neutral) | Synthesis under the teacher's hands — same c no matter what you drag | `drag-sandbox` | Core-ring sandbox: ν and field-strength rows live, source ON/OFF toggle live; the train self-moves perpetually (Rule 37 free-run); gauges, λ and ν readouts, and the speed chip `3.00×10⁸ m/s` all track live — amplitude and frequency drags visibly change the wave but NEVER the speed chip. No slab, no n row, no ratio chip, no tanks (see 31c/38b note) | "All yours" | **ν · field strength · source** | `formula` | interaction_complete | 0 / open (≤20 w) |

**No-repeat audit:** translate-through ×2 (the ONE declared contrast pair, S1↔S6) · leapfrog-relay ×1 (coined) · null-result-hold ×1 · rotate/flip ×1 · oscillate/track ×1 · lockstep-scale ×1 (coined) · cycle-compare ×1 · chain-link-derivation ×1 (precedented coin) · densify/rarefy ×1 · drag-sandbox ×1 (explore). No static state (S9's ambient train keeps moving under the docking chain — no `reveal_hold` needed anywhere in this concept).

**Rule 31c/38b reconciliation (declared design decision):** the explore state exposes ALL controls **belonging to core-ring content** (ν, field strength, source). The `n` row is advanced-ring apparatus — surfacing it in explore would make the sandbox incoherent under both reduced preset cuts (38b: explore = core-ring content only). Under the full ring set the teacher gets the medium sandbox by staying on S10, whose n row is live and seizable (FL1: the seize UN-PINS S10's end-of-timeline clock — Rule 37 free-runs only `interaction_complete` — so the drag drives live continuous bunching, never a frozen re-render; bound as §0b hard requirement 2). Precedent: displacement_current's S10 excluded the advanced ledger; here the ring-bound item happens to be a control.

**Rule 32 plan:** 32a cause-first with a ~0.5–1 s beat everywhere (wiggle→pulse→needle-kick, switch-open→pulse-continues, mote-vanish→null, sweep→thrust, cursor→twin-readouts, gate-tick→dock, drag→lockstep, slab→bunching) · 32b one variable per state (S1 the wiggle, S2 the switch, S3 the motes, S4 the sweep, S5 the cursor, S6 the gates/ν, S7–S8 field strength, S9 the docking chain, S10 n; the traveling train continues as home-pose ambient where it is the CAUSE) · 32c the Δ column verbatim as caption openers · 32d ONE apparatus from S1's home pose; the only camera motion in the concept is S4's single round-trip to the axis-on view and back · 32e one glow focal per state from the closed enum in §0b.

**Rule 33 declaration:** N/A as a dual-level split — the taught variable IS the field structure itself; there is no macroscopic manipulandum hiding a microscopic mechanism (the fields are already the deepest visible level). Rule 33d still binds the instruments: receiver dual gauge (E, B — numeric + needle), ns stopwatch, ratio chip, twin energy tanks, λ/ν readouts, crest-counter — every one shows a live NUMERIC value.

**Cue plan:** S1 wiggle-burst ~1200 ms, needle-kick settle pinned · S2 switch-open on sentence 2, relay-zoom on sentence 3 · S3 mote-vanish on sentence 2, no-change chip pinned after a beat · S4 camera-out on sentence 2, sweep+thrust on sentence 3, trough re-sweep on sentence 4, camera-back at end · S5 ghost-spawn on sentence 1, cursor ride sentences 2–3, ghost-dissolve on the final sentence · S6 gate ticks on sentence 2, v-dock sentence 3, constant-dock + MATCH pin on sentence 4 · S9 three link-cues on sentences 2–4 · S10 slab-slide on sentence 1, crest-counter chip on sentence 3. All via `scenario_cue` + `SET_CUE_TIME` with `at_ms` fallbacks; every one-shot registered in `deriveStateMeta` (same change as the scenario — §0b).

---

## 4. Misconception confrontation plan (Rule 16a — exactly THREE pivots)

| Genuine wrong belief | Pivot state + beat |
|---|---|
| **"A wave needs a medium — something material must be waving, and in vacuum it should die"** | **S3.** `visual_counter:` the motes never jiggle as crests sweep through them, and when they vanish entirely the train, its speed, and the receiver's reading are pixel-identical (the `no change` chip) · `one_line_fix:` "Nothing material waves — the fields regenerate each other, and empty space is all they need." |
| **"E and B are 90° out of step — one peaks where the other is zero"** (imported from LC-oscillator energy trading and misremembered figures) | **S5.** `visual_counter:` the ghost 90°-shifted B train sits tagged "expected?" while the cursor's twin readouts peak together and hit zero together; at a held crest the real blue train visibly contradicts the ghost · `one_line_fix:` "E and B rise and fall together — in phase, crest with crest, zero with zero." |
| **"B₀ is a tiny number, so the magnetic half of the wave is negligible"** (planted deliberately by S7's own 0.40 μT readout) | **S8.** `visual_counter:` the ghost tag quotes the tiny number while the two energy tanks fill and empty in exact lockstep — equal at every instant, 6.38×10⁻⁸ J/m³ each at a crest · `one_line_fix:` "The tiny number is a unit artifact — the wave's energy is split exactly half-and-half between E and B." |
| *(Planting-moment flag, not a pivot)* | **S2's narration must NEVER say "E turns into B"** — alternation language would plant pivot #2's 90° belief. Required phrasing: "each field's CHANGE feeds the other, one step ahead," with both trains visibly present together throughout. |

No other state carries a `misconception_watch` (founder guardrail 2026-07-04). No EPIC-C branches (EPIC-L-first directive 2026-06-10).

---

## 5. `has_prebuilt_deep_dive` states (cache hint, not a gate)

- **S2** — the self-sustaining abstraction ("how can fields hold each other up with nothing underneath?") is the chicken-and-egg wall where this concept historically dies; the whole lesson rests on accepting it.
- **S6** — the identity claim ("is it a coincidence that the number matches light?") carries the deepest conceptual weight and draws 3+ distinct confusion phrasings.
- **S9** — the exam-mechanics synthesis (direction sign errors, phase-argument bookkeeping, which axis B takes) is where board/JEE students fumble under time pressure.

Divergence from the misconception pivots (S3/S5/S8 vs S2/S6/S9) is deliberate and documented: the pivots are visually self-resolving contrast beats; deep-dive investment follows stuck-ness at the abstractions (same rationale as displacement_current).

## 6. Drill-down clusters

**S2:** `how_do_fields_sustain_each_other` (the mutual-regeneration loop, not a medium, carries the wave) · `does_the_wave_need_its_source` (what happens after the transmitter stops) · `chicken_and_egg_e_or_b_first` (neither is "first" — the changes co-travel)
**S6:** `is_c_matching_light_a_coincidence` · `why_multiply_mu0_and_eps0` (how two static constants make a speed) · `does_c_depend_on_frequency_or_amplitude` (it doesn't — in vacuum)
**S9:** `how_to_write_b_given_e` · `direction_of_b_from_propagation` (the E×B bookkeeping and its sign) · `same_phase_argument_meaning` (why the identical (kx − ωt) encodes in-phase)

## 7. `entry_state_map` (v2.2)

```
entry_state_map:
  foundational:         STATE_1 → STATE_6    # contains the PRIMARY aha (S6)
  structure_and_phase:  STATE_4 → STATE_5    # "are EM waves transverse / E B perpendicular / phase"
  field_relations:      STATE_7 → STATE_9    # "E0 B0 ratio / energy / write B given E"
  in_medium:            STATE_10             # "speed in glass / refractive index"
  exploration:          STATE_11
```

Default aspect = `foundational`. Cross-slice pills after foundational ends: "How big is B compared to E?" → S7 · "What happens inside glass?" → S10. All five aspects go into `CLASSIFIER_PROMPT`.

## 8. Prerequisites (advisory only — Rule 23)

- `displacement_current` (shipped, Ch.8 #1) — "a changing electric flux acts as a current and makes B"; cliff at S2.
- `faraday_law_induction` (shipped) — "a changing B induces E"; cliff at S2.
- `amperes_circuital_law` (shipped) — μ₀ familiarity; cliff at S6.
- Class 11 wave kinematics (crest, wavelength, frequency, λν = v) — **no shipped diamond**; advisory note + one-clause patches at S4/S6/S10 (this concept applies, never re-teaches, wave vocabulary).

Required-by (updated sibling queue): `electromagnetic_spectrum`, `em_wave_energy_momentum`. **Absorbed:** `em_wave_nature`, `speed_of_em_waves` (see Escalation #4).

## 9. Real-world anchor (Rule 35 + 38f — universal, culture-neutral)

**Primary — the phone's invisible radio link (S1/S3 narration).** When a phone sends a message across a room, nothing physical crosses the space — no air is pushed, no particle travels. Inside the phone, an antenna wiggles charges billions of times a second, and the pattern rides out on the fields themselves. The same link reaches a spacecraft across millions of kilometres of genuinely empty space — the S3 clause that buries the medium belief. Every student on every syllabus holds this transmitter daily (38f widest-overlap device).
**Secondary — sunlight crossing the vacuum (S6 payoff ONLY — deliberately withheld until the aha).** The moment the computed 1/√(μ₀ε₀) matches the measured speed, the narration cashes it: this is how sunlight crosses 150 million kilometres of nothing to warm your face — light itself is this wave. Placing the anchor AT S6 is the don't-pre-spoil discipline (§0a): "light" is never spoken before it. Both anchors narration-only; nothing device-shaped is drawn beyond the abstract antenna rod, which IS the physics apparatus (Rule 24). Why it hooks Class 10–12: the invisible thing their phone does all day turns out to be the same thing their eyes do — and the proof is two constants from last chapter's lab. Plain English, no Hinglish.

---

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) States:** the 11 rows of §2/§3, ids S1–S11 as STATE_1–STATE_11.

**(b) Symbol-label table:**

| Quantity | Exact on-canvas label | First shown |
|---|---|---|
| E field | green train + receiver gauge `E = 120 V/m` | S1 |
| B field | blue train + receiver gauge `B = 0.40 μT` | S1 |
| propagation direction | axis tag `direction of travel →` (x̂ from S4) | S1 / S4 |
| axis triad | `x̂ ŷ ẑ` at point P | S4 |
| E×B thrust | arrow tag `E×B` | S4 |
| wavelength | bracket `λ = 3.00 m` + readout | S6 |
| frequency | slider row + readout `ν = 100 MHz` | S6 |
| gate distance / time | line `D = 6.00 m` · stopwatch `Δt = 20.0 ns` | S6 |
| μ₀, ε₀ | constant chips inside the S6 formula dock ONLY (never earlier — scar) | S6 |
| c | `c = 3.00×10⁸ m/s` (formula + speed chip) | S6 |
| amplitudes | `E₀ = 120 V/m` · `B₀ = 0.40 μT` + ratio chip `E₀/B₀ = 3.0×10⁸` | S7 |
| energy densities | tanks `u_E` / `u_B` = `6.38×10⁻⁸ J/m³` (locked display, FL4) | S8 |
| k, ω | inside the S9 formula surface only | S9 |
| n, v, μᵣεᵣ | slab tag `n = 1.5` · `v = 2.00×10⁸ m/s` · formula `n = √(μᵣεᵣ)` | S10 |

**(c) Right-hand-rule plan:** cross-product rule (per `patterns/magnetism.md`), performed ONCE fully at S4 — the sweep-arc glyph rotates E into B, thumb/thrust lands on +x; re-performed on the trough half-cycle (both arrows flipped → same thrust) to prove sign-robustness. S9 re-GLOWS the S4 triad as a recall (no second performance). Required minimum = animated sweep-arc glyph; the shipped RHR hand mesh docks at S4 if it ports cleanly (optional, flagged in §0b).

**(d) Motion plan:** every state's motion is the §3 table row; there is NO nothing-moves state (S9's ambient train travels under the docking chain).

**(e) Modes:** conceptual-only — NO `mode_overrides`, NO `epic_c_branches`. `renderer_pair` = field_3d/field_3d; `available_renderer_scenarios.field_3d = ["em_wave_propagation"]`; `field_lines` block present (§0b req 8).

**(f)** `misconception_watch` at exactly S3, S5, S8. **`assessment` + `coverage_map`: AUTHOR THEM** (post-2026-05-30). Eight backward-designed questions: q1 no-medium/self-propagation (S3) · q2 E⊥B⊥v + E×B direction (S4) · q3 in-phase (S5) · q4 c = 1/√(μ₀ε₀) and the light identity (S6, the aha state) · q5 B₀ = E₀/c computation (S7) · q6 u_E = u_B despite tiny B₀ (S8) · q7 write B given E — axis, amplitude, phase (S9) · q8 v, λ, ν in a medium (S10). `non_assessed_states`: S1, S2, S11 (S2's mechanism is exercised inside q1's correct-option reasoning).

**(g) Macro↔micro (Rule 33):** N/A as a split — declared in §3 with the instrument plan (dual gauge, stopwatch, ratio chip, twin tanks, crest counter — all live numeric + needle/fill).

**(h) Canvas budget (Rule 34):** ONE formula surface per state — S1 none · S2 `changing E → B · changing B → E` · S3 none · S4 `Ê × B̂ = x̂ (direction of travel)` · S5 none (the cursor + twin readouts carry it) · S6 `c = 1/√(μ₀ε₀) = 3.00×10⁸ m/s` · S7 `E₀/B₀ = c` · S8 `u_E = ½ε₀E² = u_B = B²/2μ₀` · S9 builds `B_z = (E₀/c)·sin(kx − ωt)` under `E_y = E₀ sin(kx − ωt)` · S10 `v = c/n = 1/√(με)` · S11 `c = 3.00×10⁸ m/s — always`. Caption = the ≤5-word Δ cue only; HUD value-only; real Unicode across all three text paths (λ ν μ₀ ε₀ ⊥ × ŷ ẑ ω ×10⁸ μT ½); overlays in distinct corners, HUD clears the review-chrome button (top:52px+).

**S6 overlay-zone assignment (F3 — the densest state, pre-declared per Rule 34d):** in-scene billboards ride their geometry — gate A/B tick markers ON the axis, the `D = 6.00 m` distance line just below the axis between them, the λ bracket above one train repeat, receiver gauges on the receiver post frame-right. Screen-fixed overlays: Δ-cue caption top-center · value-only HUD top-right below `top:52px` (Δt stopwatch + λ + ν readouts — clears the review-chrome Full-screen button) · the ONE `emw_formula` surface bottom-center-left · the ν slider row (`emw_freq_row`) bottom-right · the MATCH chip pinned to the formula surface's right edge (part of the same surface block, never a second surface). **One formula surface at end pose (Rule 34b):** the measured line `v = D/Δt = 3.0×10⁸ m/s` docks first INTO `emw_formula`; the two constant chips then slide INTO THE SAME surface and resolve as its second line, `c = 1/√(μ₀ε₀) = 2.998×10⁸ m/s` — one two-line surface, not two docks. Nothing overlaps or clips; verify at Checkpoint B via THE EYE `overlayCollisions`.

**(i) Curriculum-flex block (Rule 38):**
- **(i-1) Coherence check, both cuts.** Hide advanced (S10): S1–S9 + S11 — phenomenon → mechanism → structure → payoff → quantitative block → explore; no survivor mentions the slab, n, or medium speeds (S6 says "in vacuum," never "unlike in a medium"). Hide advanced+extended (S7–S10): S1–S6 + S11 — a complete qualitative lesson ending on the PRIMARY aha + a sandbox using only E, B, λ, ν, c; no survivor references E₀/B₀ notation, energy tanks, or k/ω (verified against every caption/formula/label above; λ and ν are Class-11 PREREQUISITE symbols, like μ₀/ε₀ — prerequisite symbols are not hidden-ring references). **Both cuts coherent.** No forward references authored anywhere (also serves Rule 25d reordering).
- **(i-2) Explore = CORE-ring only:** S11's formula is the bare speed chip; controls = ν, field strength (row deliberately labelled without the E₀ subscript), source toggle; readouts = E/B gauges, λ, ν, speed. No n row, no slab, no ratio chip, no tanks, no k/ω (§3 reconciliation note).
- **(i-3) `curriculum_tags` (CLAIMS — 38g; web-search budget not spent, zero external verification; only CBSE/NCERT marked verified):**

| Curriculum | Coverage | Note |
|---|---|---|
| CBSE/NCERT Class 12 (+ JEE Main/Adv, NEET) | **✓ full** | Ch.8 §8.3 — verified at authoring time; the full ring set IS this lesson |
| Cambridge IGCSE 0625 | ◐ partial (believed — EM waves transverse, same speed c in vacuum; no E/B field structure) | `needs_teacher_verification` |
| CAIE A-level 9702 | ◐ partial (believed — transverse nature + c; E₀/B₀ believed absent) | `needs_teacher_verification` |
| IB DP Physics (2023) | ◐ partial (believed — qualitative EM wave nature + c in Theme C) | `needs_teacher_verification` |
| AP Physics 2 | ◐ partial (believed — transverse, E⊥B⊥v, speed c conceptual) | `needs_teacher_verification` |
| AP Physics C: E&M | ◐ partial (believed — Maxwell → EM waves conceptual in the CED) | `needs_teacher_verification` |
| Ontario SPH4U | ◐ partial (believed — properties of EM waves within the light/modern units) | `needs_teacher_verification` |

- **(i-4) Preset proposal (hide, never reorder — 38h):** CBSE/JEE/NEET = S1–S11 (all) · AP Physics 2 / C and CAIE/IB = S1–S6 + S11 (core cut) pending verification, upgrade to +S7–S9 if the teacher confirms the quantitative relations · IGCSE = S1–S6 + S11. No preset teacher-visible until a teacher of that curriculum confirms (38g).
- **(i-5) Graph-axis conventions (38e):** no separate graph pane — the 3D train IS the E–x/B–x picture, and field-vs-position with x horizontal is the universal convention (no board conflict, no toggle). If a later retrofit adds an E–t scope pane: t-on-x is universal; still no conflict.
- **Dialect (38d):** "vacuum (free space)" dual-labelled once at S3, bare "vacuum" thereafter; "speed of light c" universal; "refractive index n" universal; "antenna" universal; never "aerial."

**TTS:** author `teacher_script` EN now; `text_hi` via the Rule-30g Sonnet-5 subscription sub-agent pre-ship (30i — never `text_te`); audio on-demand EN only (30h).
**Registration (8 sites):** `em_wave_propagation.json` · `concept_panel_config`/`CONCEPT_PANEL_MAP` · `CONCEPT_RENDERER_MAP` → field_3d · `VALID_CONCEPT_IDS` · deep-dive flags S2/S6/S9 · **`CONCEPT_SYNONYMS`: `em_wave_nature` → `em_wave_propagation`, `speed_of_em_waves` → `em_wave_propagation`** · `PCPL_CONCEPTS` N/A · `CLASSIFIER_PROMPT` + the five aspects. Plus clusters migration + `_seed_em_wave_propagation_cache.ts`.
**THE EYE:** 11/11 after the §0b scenario lands; eye-walker ∥ quality-auditor; zero new `engine_bug_queue` rows; founder hand-tests the S7/S8 field-strength seize, S10's n drag, and S11's three controls (headless can't fire trusted events).

---

## Block 1 — Pass-1 strategic checklist

**Prerequisite cliffs.** `displacement_current` breaks at **S2** if "changing E makes B" is noise → one S2 clause: "last lesson a changing electric flux acted, for magnetism, exactly like a current — it made B" (displacement_current's own locked phrasing, notation continuity). `faraday_law_induction` breaks at **S2** → one clause: "and Faraday showed a changing B stirs up an E around it." `amperes_circuital_law` breaks at **S6** if μ₀ is unfamiliar → one clause: "μ₀ and ε₀ — the magnetic and electric constants every loop and capacitor this chapter used." Class-11 wave vocabulary breaks at **S4/S6** → one clause at S6: "one full repeat of the pattern — one wavelength." Cliff states (S2/S6) partially overlap the deep-dive picks (S2/S6/S9) — documented: S2 and S6 are BOTH where prerequisites land and where the abstractions stick, so patch-clauses and deep-dive investment coincide there by design.

**JEE-backwards trace** (full ring set — no magnetism carve-out applies). *"A plane electromagnetic wave of frequency 100 MHz travels in vacuum along +x. At a point, E = 120 ĵ V/m. (i) Find B (magnitude and direction) at that point. (ii) How can this wave travel where there is no medium? (iii) Compare the energy carried by the electric and magnetic fields. (iv) The wave enters a medium of refractive index 1.5 — find its speed, frequency, and wavelength there."* → (i) magnitude B = E/c = 0.40 μT (S7), direction ẑ via E×B ∥ x̂ (S4), assembled as a written expression (S9) · (ii) mutual regeneration, no medium (S2 + S3) · (iii) exactly equal, u_E = u_B (S8, with S7's tiny-number trap defused) · (iv) v = c/n = 2.0×10⁸ m/s, ν unchanged 100 MHz, λ = 2.0 m (S10). Every number in the question is a number the sim shows live. No missing piece; λν = c bookkeeping rides Class-11 prerequisite + S6's live λ/ν readouts.

**Misconception entry mapping / planting audit.** (1) The medium belief walks in the door (sound/rope waves); S1's ripple could reinforce "like a wave on a rope" → S1's narration stays silent about WHAT waves (the belief is the student's own inference), flagged and killed at S3 (16a pivot #1). (2) The 90° belief is imported (LC energy trading) AND could be planted by S2's hand-off language → hard narration constraint recorded in §4: never "E turns into B," always "each field's change feeds the other"; confronted at S5 (pivot #2). (3) The "B is negligible" belief is planted DELIBERATELY by S7's own 0.40 μT readout — earned one state before S8 breaks it (pivot #3). 16b fallback: no EPIC-C branches authored (directive); the three `misconception_watch` entries are the proactive record.

## Block 2 — Aha-moment designation

- **PRIMARY (S6):** *Two constants measured on a lab bench with capacitors and coils multiply out to the measured speed of light — light itself is an electromagnetic wave.* The 10-year memory: the number 3×10⁸ was hiding inside μ₀ and ε₀ all along.
- **SUPPORTING (S2):** *Switch the source off and the wave keeps going — it carries itself, each field's change regenerating the other.*
- **Cohesion:** S2 establishes the self-carrying handshake; S6 asks and answers the only question that mechanism leaves open — how FAST does the handshake travel — and the answer detonates into the light identity. S3–S5 are evidence and structure between them, not extra ahas. Two ahas total (the sweet spot).
- **Wrong-belief setup:** for S2 — S1 builds "the source's wiggling drives the wave" (so cutting the source should kill it). For S6 — S1–S5 deliberately build "this is a lab curiosity, a field ripple" with the word "light" banned from every earlier state, so the identity lands on a confident this-is-something-else frame.
- **Foundational-coverage rule:** PRIMARY aha (S6) is inside `entry_state_map.foundational` (STATE_1→STATE_6) ✓ — no exit-pill needed.

---

## Escalations / FLAGs for downstream

1. **Engine delta FIRST (§0b, Class-B):** json_author must not start until the field3d-surgeon lands `scenario_type: "em_wave_propagation"` with `deriveStateMeta` registration, trusted-drag seizes on all four rows (**FL1:** the S10 n-row seize UN-PINS the end-of-timeline clock — §0b req 2 — so the n-drag drives live continuous bunching, never a frozen picture), the closed glow enum, the per-state pulse/train mode, and the deterministic train primitive in the SAME change. The renderer file is shared — Rule 36c `check:renderer-syntax` + a fleet-baseline spot-check after the edit; do not race the other chapter loop's uncommitted renderer edits (diff-first).
2. **quality_auditor:** run the live `engine_bug_queue` SQL at Gate 8 (0a could not); audit the **"light"-ban before S6** (don't-pre-spoil); verify the S1/S6 declared pair, the S2 no-alternation-language constraint, and that S11 exposes NO advanced-ring control (n row absent). **Carry to Checkpoint B:** THE EYE must confirm the S3/S5/S8 wrong-expectation cues actually PAINT on the `__frozen.png` — the recurrence check for the still-OPEN fleet-wide scar `field3d_scene_composition_annotation_silent_noop`.
3. **physics_author:** lock the pulse/gate timing to the stylized ns clock (D = 6.00 m, Δt = 20.0 ns), the S2 relay hand-off period, the S7 auto-sweep range, and tank display rounding from UNROUNDED internals so u_E and u_B READ identical at every instant (the dc-S8 rounding lesson) — **FL4:** the locked display figure is `6.38×10⁻⁸ J/m³` (round-half-up of the exact 6.375×10⁻⁸; both tanks render the IDENTICAL string); all HUD numbers stay on §2's locked set. **FL2 — S6 narration framing:** the gate timing derives from v = c internally, so the "measured" and "predicted" numbers agree BY CONSTRUCTION (correct physics — c IS 1/√(μ₀ε₀)); narrate it as the historical identity ("the speed timed here is the same 3×10⁸ that 1/√(μ₀ε₀) gives — the measured speed of light"), NEVER as an independent measurement that coincidentally matches. **F2/FL5 — S10:** BOTH trains stay drawn inside the slab, both at v = c/n, both bunched to λ_med = 2.00 m, ν continuous across the boundary for BOTH trains; no E/B amplitude ratio is surfaced on S10, and the in-slab vacuum-ratio B amplitude is an unnarrated stylization — never a spoken caveat.
4. **Sibling queue update:** `em_wave_nature` and `speed_of_em_waves` (seeded by displacement_current's skeleton) are ABSORBED by this concept — add both as `CONCEPT_SYNONYMS` redirects; remaining Ch.8 queue: `electromagnetic_spectrum`, `em_wave_energy_momentum`. displacement_current's `source_book` prose mentioning the old names needs no edit (non-rendered metadata). **Redirect-only guardrail:** `em_wave_nature` and `speed_of_em_waves` must NEVER be added to `VALID_CONCEPT_IDS` or `CLASSIFIER_PROMPT` — they are not real concepts; the `CONCEPT_SYNONYMS` redirect is their ONLY registration.
5. **Anchor discipline:** phone/spacecraft radio link and sunlight-through-vacuum live in NARRATION only; sunlight is S6-or-later ONLY; nothing device-shaped drawn beyond the abstract antenna (Rule 24 / Rule 35).
6. **Naming (FL3):** the stylized-clock device is the **time-scaling license** (renamed from "time-dilation" — it scales playback rate; it is NOT relativistic dilation, a confusing label in a chapter adjacent to relativity). All downstream artifacts (physics block, JSON comments, Checkpoint-B notes) use this name. The on-canvas "the clock here counts nanoseconds" clause + real-SI readouts stay exactly as declared — they are the honesty guard.

---

**Self-review (architect checklist):** atomic claim one sentence ✓ · 11 states justified against the very-complex band with the sibling-absorption rationale ✓ · control table complete with archetypes/deltas/rings, one declared pair (S1↔S6), two justified coins + one precedented coin, no static state ✓ · pivots exactly 3, at genuine pivots, plus one planting-moment flag ✓ · deep-dive picks 3 with clusters ✓ · entry map 5 aspects, PRIMARY aha inside foundational ✓ · Rule 32/33/34/35/38 blocks all present, both preset cuts checked, explore core-only, tags all claims with `needs_teacher_verification` except CBSE ✓ · Gate 12 (manual_click ×10 + interaction_complete) ✓ · engine queue mirror consulted, live SQL flagged to Gate 8 ✓ · DC Pandey scope-only line present ✓ · zero TBDs.

---

## Orchestrator note (loop, not architect)

The architect's sibling-id `em_spectrum` has been normalized to **`electromagnetic_spectrum`** throughout this file — that is the founder-approved Ch.8 chapter_map id in `docs/loop_runs/ch8_state.md`. No other content changed.
