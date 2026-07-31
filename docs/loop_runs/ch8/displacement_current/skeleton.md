# ARCHITECT SKELETON — `displacement_current`

> Chapter-loop run, worktree `physics-mind-ch8`, branch `feat/ch8-em-waves` (2026-07-24).
> **Chapter:** Class 12, Ch.8 Electromagnetic Waves — NCERT §8.2 (Displacement current / the Ampère–Maxwell correction). First Ch.8 diamond; the chapter's load-bearing opener.
> **Renderer:** `field_3d` — **NEW `scenario_type: "displacement_current"`** (clean master, nothing exists for this concept yet). Class-B triage by definition: the engine delta is declared FIRST in §0b and json_author must NOT start until it lands.

---

## 0a. Engine bug queue consultation (pre-authoring)

Live SQL not executable from the architect dispatch (no Bash/DB tool). Consulted the canonical read-only mirror `docs/FIELD3D_SCENARIO_CHECKLIST.md` in full. **FLAG to quality_auditor: run `query_engine_bug_queue.ts displacement_current` + `--field3d --open` live at Gate 8.** Prevention rules applied:

| Scar / prevention rule (mirror) | How this skeleton satisfies it |
|---|---|
| Concrete before abstract | S1–S2 are pure phenomenon (beads, dots, growing field — no law on screen); Ampère's law re-enters S3 only as inherited prerequisite notation; the calculus form waits until S8 |
| Reveal synced to narration | Cue plan in §3 — loop-draw, surface-morph, needle-kick and each docking algebra line land on their narrating sentence via `scenario_cue` + `SET_CUE_TIME`; `at_ms` fallbacks kept for THE EYE |
| Coordinate sim + graph | No graph pane in this concept (deliberate — see §10 38e); the "coordinate" duty is the ONE live I_c that drives beads, flux ramp, and both ammeters together |
| Show a quantity live when it's named | Φ_E HUD appears on the sentence that first says "electric flux" (S2); `I_enc` docks as "enclosed current" is said (S3); the gap readout `I_d` is born on the sentence naming "displacement current" (S6) |
| Don't pre-spoil a later reveal | No formula in S1; **ε₀ first appears on-canvas in S8**; the generalized law is never shown before S9; explore (S10) surfaces core content only |
| Visual must match narration | "nothing crosses the gap" = beads visibly stopping dead at the plate faces; "the field is measurably there" = a live probe needle kicking to 2.4 μT; "two answers" = the I_enc readout physically flipping 1.2 A → 0 |
| Distinct reference lines | Probe radius `r` (dashed radial line to the probe) and plate radius `R` (plate-edge tag, first shown S7) are separate labelled primitives — never conflated |
| Colour by sign/identity | + dots warm / − dots cool; conduction beads amber; E-flux lines green; B circulation rings blue; aggregate readouts neutral |
| Register the NEW scenario in `deriveStateMeta.ts` in the SAME change | §0b requirement 7 — per-state reveal/settle pins for every one-shot, else THE EYE false-fails D7/D1p at the 1500 ms default |
| No frozen tail / one-shots hold end pose | Every state loops a full charge-window motion cycle (charge → hold → soft reset, declared loop); docked formula lines and the pinned peak marker hold end pose |
| Explorers must move | S10 ships an idle I_c auto-sweep (teacher-seizable via trusted-drag) so the headless harness sees motion |
| Don't gate visuals on the clock in slider states | S10 renders at full immediately; slider-driven, no emergence ramp |
| Interactivity contextual, full sandbox last only | Rule 31c rows: I_c (S2/S6), surface (S4/S9), probe r (S7); ALL only in S10 |
| Specific `visible_elements` tokens | `dc_` prefix throughout: `dc_beads`, `dc_surface`, `dc_probe`, `dc_amm_gap`… — no generic substrings ("wire" would match `dc_wire_left`) |
| Billboard readable under 3/4 camera | `r` and `R` reference lines billboarded camera-right; curl arrows `depthTest:false` + high renderOrder over the plate geometry |

**NCERT / DC Pandey check:** chapter indexes consulted for SCOPE only — displacement current is the opening section of Ch.8, ahead of EM-wave nature/spectrum, which supports the atomic split in §1 (waves are siblings, not a tail here). No teaching sequence, no example problem, no figure imported.

---

## 0b. Engine ask — NEW `scenario_type: "displacement_current"` (the field3d-surgeon build target, declared FIRST)

Nothing exists on clean master for this concept. The scenario clones proven patterns only — no exotic geometry:

**Apparatus (home pose, persists across all 10 states — Rule 32d):** a constant-current charger (battery box + switch) at frame left → wire runs right → two circular parallel plates (radius R = 6 cm, gap 5 mm, plate faces vertical, gap axis horizontal) → wire continues right back to the charger. 3/4 camera framing plates + right wire. Time-dilation license declared: charging is stylized to seconds; **the charger holds I_c constant** (no RC exponential — one narration clause covers it), so every instantaneous HUD number is self-consistent.

**Addressable objects (Rule 27 explorer pattern — stable ID + key params each):**

| ID | What it is | Cloned from |
|---|---|---|
| `dc_battery`, `dc_wire_left`, `dc_wire_right` | charger + wires | standard meshes |
| `dc_beads` | conduction-current beads streaming along the wires, stopping dead at the plate faces | faraday induced-current bead machinery |
| `dc_plate_L`, `dc_plate_R`, `dc_dots_pos`, `dc_dots_neg` | plates + ± charge-dot pools tracking Q live | capacitance plate-dot pools |
| `dc_eflux` | E-field lines in the gap, count/brightness ∝ Q | parallel_plates field lines |
| `dc_loop` | Ampèrian ring, radius 10 cm, around the right wire near the plate; one `dl` arrow-segment; blue curl arrows riding it | gauss_law ring + curl glyphs |
| `dc_surface` | translucent membrane bounded by `dc_loop`; **morph param 0 = flat disk (wire pierces it) → 1 = balloon bulging through the gap (nothing pierces it)**; pierce-flash ticks while beads cross it | the one genuinely NEW primitive (a lathe/dome morph — simple geometry) |
| `dc_amm_wire` | wire ammeter: needle + live numeric `I_c = 1.20 A` | Rule 33d instrument pattern |
| `dc_amm_gap` | gap readout `I_d = 1.20 A` (born S6) | same |
| `dc_probe` | B-probe sprite gliding on rails, live `B = 2.4 μT` readout + tiny needle | probe_points + bmProbe display-radius pattern |
| `dc_bring_gap` | B circulation rings around the gap axis (born S5) | wire-B ring pattern |
| `dc_ghost_col` | translucent bead-free "current column" in the gap, glows only while Φ_E changes (born S6) | emissive cylinder |
| `dc_ledger` | two-term panel `μ₀(I_c) + μ₀(I_d·)` with a frozen SUM chip (S9 only) | formula-overlay pattern |
| `dc_formula`, `dc_hud` | ONE formula surface ('Cambria Math' Unicode) + value-only HUD (Q, Φ_E, B) | Rule 34b surfaces |

**Slider rows** (built once, shown/hidden per state; same screen position when shared; Rule 39g discovery conventions — `<prefix>_<name>_row` ids, inline `position:fixed` panels, `pm_hud` statics): `dc_ic_row` "Charging current I_c" (0–2.0 A, step 0.1, default 1.2) · `dc_surface_row` "Surface: disk ↔ balloon" (0–1) · `dc_probe_row` "Probe radius r" (0–15 cm, default 10).

**Physics the scenario computes (verified engine, never the LLM):** Q(t) = ∫I_c dt (looping charge window) · Φ_E = Q/ε₀ · I_d = ε₀·dΦ_E/dt = I_c while charging, 0 while paused · B(r) = μ₀I_d r/(2πR²) for r < R, μ₀I_d/(2πr) for r ≥ R · surface ledger: conduction term × pierce-state + displacement term × flux-captured fraction, **sum locked to μ₀I_c by construction** at every morph position.

**Hard requirements in the SAME change:** (1) `deriveStateMeta.ts` per-state reveal/settle pins + S10 `interactive` hold-intent; (2) trusted-drag seize on all three rows; (3) closed glow enum `beads · plate_dots · eflux · loop · surface · probe · amm_gap · formula · ledger`; (4) suppress any generic B-legend (Rule 24); (5) `assembleField3DHtml` routing + capital-suffix regex N/A; (6) grip-rule support = curl-arrow glyphs on `dc_loop`/`dc_bring_gap` required; docking the shipped magnetism grip-hand mesh is OPTIONAL reuse if it ports cleanly — flag, don't block.

---

## 1. Atomic claim

This concept teaches that **a changing electric flux acts as a current — Maxwell's displacement current, I_d = ε₀ dΦ_E/dt — which repairs the two-surface contradiction Ampère's law hits at a charging capacitor and completes the law as ∮B·dl = μ₀(I_c + I_d).** It does not cover how the coupled changing fields propagate as electromagnetic waves (deferred to `em_wave_nature`), the wave speed c = 1/√(μ₀ε₀) (deferred to `speed_of_em_waves`), the spectrum (`em_spectrum`), Ampère's law itself (prerequisite `amperes_circuital_law`), or capacitor charging (prerequisite `capacitance`).

---

## 2. State count + arc

**10 states** — a 6-state core spine (crisis → measured fact → fix), ONE extended exam-serving state, a 2-state advanced calculus tail, and explore. Above the complex band (7–9) by one state, documented: the +1 is the extended-ring B(r) state (S7) that serves the dominant board/JEE question pattern; the ring structure means no single preset ever shows more than 8 guided states, and the pure-core lesson is 7 total. The hook MOVES from t=0 (beads flowing) — no static setup state.

| State | Purpose (one line) |
|---|---|
| S1 `charge_the_gap` | Current fills the wires; beads stop dead at the plates — nothing ever crosses the gap |
| S2 `field_grows_in_gap` | While charging, E — and the electric flux Φ_E through the gap — is visibly RISING |
| S3 `loop_and_disk` | Ampère's law works: loop + flat disk → the wire pierces it → I_enc = 1.2 A, B circulates |
| S4 `same_loop_two_answers` | **SUPPORTING AHA** — morph the surface through the gap: same loop, I_enc flips to ZERO — the law contradicts itself |
| S5 `b_lives_in_the_gap` | **Rule 16a contrast beat** — "no current → no B there"? The probe says otherwise: 2.4 μT, same as beside the wire |
| S6 `flux_acts_as_current` | **PRIMARY AHA** — the changing flux IS the missing current: I_d lives and dies with the charging, always equal to I_c |
| S7 `where_is_b_strongest` | EXTENDED — sweep the probe radially: B climbs to a peak at the plate edge, then falls as 1/r |
| S8 `why_epsilon0_dphi_dt` | ADVANCED — three links dock: Φ_E = Q/ε₀ → Q = ε₀Φ_E → rates → I_d = ε₀ dΦ_E/dt |
| S9 `ampere_maxwell_ledger` | ADVANCED — the same surface morph that broke the law now leaves μ₀(I_c + I_d) untouched: the generalized law |
| S10 `displacement_sandbox` | Explore — I_c, surface, probe all live; core-ring content only |

**teaching_method:** S1–S7 straightforward motion beats (field omitted per Rule 31); S8–S9 `derivation_first_principles`; S10 `exploration_sliders`.

**Locked physics numbers (all states share them):** R = 6.0 cm → A = 1.13×10⁻² m²; gap 5 mm; **I_c = 1.2 A** (constant-current charger). Snapshot at each loop's hold: Q = 0.12 μC, E = 1.2×10⁶ V/m, Φ_E = 1.36×10⁴ V·m. Rate while charging: dΦ_E/dt = I_c/ε₀ = **1.36×10¹¹ V·m/s** → I_d = ε₀·(1.36×10¹¹) = **1.2 A ✓**. B at the loop/probe radius r = 10 cm: **2.4 μT** (identical beside the wire and in the gap plane, since r > R). B peak at r = R: **4.0 μT**; at r = 3 cm inside: 2.0 μT (linear).

---

## 3. Per-state choreography + control plan (Rule 31 — with `depth_ring`, Rule 38a)

**Coined archetypes:** `surface-morph` — the bounded SURFACE itself continuously deforms while its loop stays fixed (not apparatus geometry, not field density — nothing in the seed vocabulary names it). Used ×2 as THE declared contrast pair. · `chain-link-derivation` — reusing the capacitance proof-run coin: already-visible scene pieces glow in turn while their algebra lines dock into one building formula surface (distinct from `reveal-build`, which constructs new scene pieces).

**Declared contrast pair — S4 ↔ S9 (`surface-morph` ×2):** the SAME disk→balloon morph that breaks the old law (readout 1.2 A → 0, crisis) later leaves the new two-term sum frozen (resolution). The flip is named in both delta lines.

| State | depth_ring | Teaches (ONE idea) | Archetype | DISTINCT motion (state clock, Rule 26; loops one full cycle per dwell) | Δ cue (≤5 words) | Live controls | glow_focal | advance_mode | Budget |
|---|---|---|---|---|---|---|---|---|---|
| S1 `charge_the_gap` | **core** | Conduction current fills the wires; NO charge crosses the gap | `flow-along-path` | Switch closes (cause) → amber beads stream along both wires → after a readable beat, ± dot pools grow on the facing plate surfaces → beads visibly STOP dead at the plate faces, the gap stays bead-free → wire ammeter needle sits at `I_c = 1.20 A`, HUD Q climbs | "Charge flows, gap stays empty" | none | `plate_dots` | manual_click | 40–55 w / ~18 s |
| S2 `field_grows_in_gap` | **core** | While charging, the E-field — and the flux Φ_E through the gap — is RISING | `densify/rarefy` | Beads keep arriving (cause, inherited motion) → green E-lines in the gap thicken and brighten in step with the dot pools; HUD `Φ_E` counts up live; drag I_c and the growth rate visibly changes | "Charging → flux rising" | **I_c** | `eflux` | manual_click | 30–45 w / ~14 s |
| S3 `loop_and_disk` | **core** | Ampère's law counts the current threading a surface bounded by the loop | `reveal-build` | Camera eases right to frame the wire; the Ampèrian ring draws itself around the wire, a `dl` segment tags it, a flat translucent disk fills it (named "one CHOICE of surface"); beads pierce the disk with flash ticks (cause) → `I_enc = 1.2 A` docks, blue curl arrows circulate the loop (grip rule) | "Flat surface — current pierces" | none | `loop` | manual_click | 40–55 w / ~18 s |
| S4 `same_loop_two_answers` | **core** | The SAME loop bounds a surface through the gap — which encloses NOTHING | `surface-morph` (**pair w/ S9**) | The disk bulges (cause), slips between the plates into a balloon; pierce flashes cease → after a beat `I_enc` flips **1.2 A → 0** while the loop and its curl arrows sit UNCHANGED; the formula surface shows both right sides with a glowing "?" | "Same loop — two answers" | **surface** | `surface` | manual_click | 40–55 w / ~18 s |
| S5 `b_lives_in_the_gap` | **core** | Nature's verdict: B IS in the gap — equal to beside the wire | `translate-through` | Misconception beat (16a): a ghost tag posts the wrong expectation — "no current here → B should be 0". The probe glides at fixed radius from beside the wire (reading 2.4 μT) around into the gap mid-plane (cause) → its needle HOLDS at **2.4 μT**; blue B-rings materialize around the gap axis, same grip-rule sense | "The probe says otherwise" | none | `probe` | manual_click | 40–55 w / ~18 s |
| S6 `flux_acts_as_current` | **core** | The changing flux IS the missing current: I_d = I_c, alive only while Φ_E changes | `cycle-compare` | Charger throttles ON → beads flow, flux ramps, ghost column in the gap glows, and BOTH meters rise together — `I_c = 1.20 A`, new gap readout `I_d = 1.20 A`; throttle OFF → beads halt, flux freezes, ghost column dims, BOTH die to zero; loop. The gap stays bead-free throughout | "Changing flux IS current" | **I_c** | `amm_gap` | manual_click | 40–55 w / ~18 s |
| S7 `where_is_b_strongest` | **extended** | B in the gap grows with r to the plate edge, then falls off like a wire's | `oscillate/track` | The probe sweeps radially in the gap plane, axis → past the edge → back (cause); HUD B tracks live: 0 → 2.0 μT (r = 3 cm) → **4.0 μT peak** as `R = 6.0 cm` tags the plate edge → 2.4 μT at 10 cm; a peak marker pins at r = R and holds | "B peaks at the edge" | **probe r** | `probe` | manual_click | 30–45 w / ~14 s |
| S8 `why_epsilon0_dphi_dt` | **advanced** | Where I_d = ε₀ dΦ_E/dt comes from — Gauss on the gap, then take rates | `chain-link-derivation` | Nothing physically moves; glow walks the scene: dot pool glows → `Φ_E = Q/ε₀` docks; flips to `Q = ε₀·Φ_E`; ammeter glows → `I_c = dQ/dt = ε₀·dΦ_E/dt` docks; the chain closes numerically: 8.854×10⁻¹² × 1.36×10¹¹ = **1.2 A ✓** | "Why the currents match" | none | `formula` | manual_click | 40–55 w / ~18 s |
| S9 `ampere_maxwell_ledger` | **advanced** | One law for every surface: ∮B·dl = μ₀(I_c + ε₀ dΦ_E/dt) | `surface-morph` (**pair w/ S4** — the named flip: the morph that broke the old law leaves the new sum untouched) | The surface scrubs disk ↔ balloon continuously (cause); the ledger's two terms trade — flat: μ₀(1.2 + 0), bulged: μ₀(0 + 1.2), mid-morph: a mix — while the SUM chip `∮B·dl = μ₀ × 1.2 A` sits FROZEN, glowing, never ticking | "Two terms, one sum" | **surface** | `ledger` | manual_click | 40–55 w / ~18 s |
| S10 `displacement_sandbox` | **core** (ring-neutral) | Synthesis under the teacher's hands — I_d = I_c everywhere you poke | `drag-sandbox` | All three sliders live: I_c re-rates beads/flux/both meters; surface scrubs with the core I_enc + `I_d = I_c` chips; probe reads B live along its rail (both sides of R). Idle I_c auto-sweep until the teacher touches anything | "All yours" | **ALL: I_c · surface · probe r** | `formula` | interaction_complete | 0 / open (≤20 w) |

**No-repeat audit:** flow-along-path ×1 · densify/rarefy ×1 · reveal-build ×1 · surface-morph ×2 (the ONE declared contrast pair) · translate-through ×1 · cycle-compare ×1 · oscillate/track ×1 · chain-link-derivation ×1 · drag-sandbox ×1 (explore). No static state (S8's motion is the docking chain + glow walk, declared `reveal_hold` for THE EYE).

**Rule 32 plan:** 32a cause-first with a ~0.5–1 s beat everywhere (switch→beads, beads→dots, morph→readout-flip, probe-arrival→needle-hold, throttle→meters) · 32b one variable per state (S1 switch, S2 I_c, S3 pierce, S4 surface, S5 probe position, S6 throttle, S7 probe radius, S9 surface; inherited bead flow continues as home-pose ambient where it is the CAUSE) · 32c the Δ column verbatim as caption openers · 32d ONE apparatus from S1's home pose; the loop docks at S3 and persists; camera moves once (S3) · 32e one glow focal per state from the closed enum in §0b.

**Rule 33 declaration:** N/A as a dual-level split — the taught variables (currents, flux, B) are field-level, not a hidden microscopic mechanism; the bead stream and dot pools already carry the carrier-level texture. Rule 33d still applies to instruments: wire ammeter, gap readout, and probe all show live NUMERIC values + tracking needles; HUD is value-only.

**Cue plan:** S1 switch-close ~1200 ms, flow-settle pinned · S3 loop-draw → disk-fill → I_enc dock on sentences 1–3 · S4 morph window on sentence 2, readout flip pinned after it · S5 ghost tag on sentence 1, probe glide sentences 2–3, rings on the final sentence · S6 two throttle cycles per dwell · S8 three link-cues on sentences 2–4 · S9 continuous scrub, sum-chip glow on the naming sentence. All via `scenario_cue` + deriveStateMeta pins; `at_ms` fallbacks kept.

---

## 4. Misconception confrontation plan (Rule 16a — exactly THREE pivots)

| Genuine wrong belief | Pivot state + beat |
|---|---|
| **"The charging current flows THROUGH the capacitor — charge jumps the gap"** | **S1.** `visual_counter:` beads march the wires and stop DEAD at each plate face — the gap stays visibly bead-free while ±Q pile up face to face · `one_line_fix:` "No charge ever crosses the gap — one plate fills to +Q while the other drains to −Q." |
| **"No charge crosses the gap → no current there → there can be no magnetic field between the plates"** | **S5 (the concept's central confrontation).** `visual_counter:` the ghost "B should be 0 here" tag sits pinned while the probe glides in and its needle HOLDS at 2.4 μT — identical to its reading beside the wire · `one_line_fix:` "The field is measurably there; whatever makes B in the gap, it isn't moving charge." |
| **"Displacement current is a real flow of charges across the gap"** | **S6.** `visual_counter:` the gap readout shows 1.20 A while the gap stays visibly bead-free — and the reading dies the instant the flux stops CHANGING, unlike any charge flow · `one_line_fix:` "I_d is not charge in motion — it is changing electric flux acting, for magnetism, exactly like a current." |

No other state carries a `misconception_watch` (founder guardrail 2026-07-04). No EPIC-C branches (EPIC-L-first directive 2026-06-10).

---

## 5. `has_prebuilt_deep_dive` states (cache hint, not a gate)

- **S4** — the surface-freedom abstraction ("why are you allowed to pick a different surface?") is where this argument historically dies; the whole crisis rests on it.
- **S6** — the core insight and the ontology trap ("is displacement current REAL?"); 3+ documented phrasings of the same confusion.
- **S8** — the mathematical step (Gauss → rates) where board/JEE students fumble signs, ε₀ placement, and units.

Divergence from the misconception pivots (S1/S5/S6 vs S4/S6/S8) is deliberate: investment follows stuck-ness at the abstractions; the S1/S5 pivots are visually self-resolving.

## 6. Drill-down clusters

**S4:** `why_any_surface_works` (the loop, not the surface, is what Ampère's law fixes) · `flat_vs_balloon_surface` · `what_counts_as_enclosed`
**S6:** `is_displacement_current_real` · `current_without_moving_charge` · `why_gap_current_equals_wire_current`
**S8:** `gauss_gives_q_equals_epsilon0_phi` · `units_of_epsilon0_dphi_dt` (why ε₀·(V·m/s) is amperes) · `steady_state_kills_id` (fully charged → dΦ_E/dt = 0 → I_d = 0)

## 7. `entry_state_map` (v2.2)

```
entry_state_map:
  foundational:     STATE_1 → STATE_6    # contains the PRIMARY aha (S6)
  b_in_gap:         STATE_5 → STATE_7    # "is there / where is B between the plates"
  generalized_law:  STATE_8 → STATE_9    # "derive I_d / state Ampère–Maxwell"
  exploration:      STATE_10
```

Default aspect = `foundational`. Cross-slice pills after foundational ends: "Where is B strongest?" → S7 · "Where does ε₀ dΦ_E/dt come from?" → S8. All four aspects go into `CLASSIFIER_PROMPT`.

## 8. Prerequisites (advisory only — Rule 23)

- `amperes_circuital_law` (shipped) — ∮B·dl = μ₀I_enc, the loop, I_enc; cliff at S3.
- `capacitance` (shipped) — the charging story, beads-stop-at-plates apparatus; cliff at S1.
- `electric_flux` (shipped) — Φ_E = E·A counting; cliff at S2.
- `magnetic_field_wire` (shipped) — B = μ₀I/2πr used numerically at S5/S7.
- `parallel_plate_capacitor_field` (shipped) — uniform E = σ/ε₀, feeds the S8 Gauss link.

Required-by (seeded sibling queue): `em_wave_nature`, `speed_of_em_waves`, `em_spectrum`.

## 9. Real-world anchor (Rule 35 + 38f — universal, culture-neutral)

**Primary — the camera flash charging (S1 narration).** For the second or two a phone or camera flash charges, current flows in its wires while nothing at all crosses the gap inside its capacitor. If only moving charge made magnetic fields, the field map of that circuit would have a hole in it at the gap — and it doesn't. A compass held there would still deflect. That hole-that-isn't is this whole lesson, and every student has held the device it happens in.
**Secondary — the forward hook (S9/S10 narration only):** Maxwell's correction term is the reason radio, Wi-Fi, and light itself exist — a changing E making B is one half of the handshake that lets waves carry themselves through empty space (taught in the sibling diamonds). A defibrillator charging gets one mention at S6 (universal medical device). All anchors narration-only; nothing device-shaped is drawn (Rule 24). Why it hooks Class 10–12: a law they just mastered gets caught contradicting itself inside a device they just studied — and the fix predicts light. Widest-syllabus-overlap devices only (38f); plain English, no Hinglish.

---

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) States:** the 10 rows of §2/§3, ids S1–S10 as STATE_1–STATE_10.

**(b) Symbol-label table:**

| Quantity | Exact on-canvas label | First shown |
|---|---|---|
| conduction current | ammeter `I_c = 1.20 A` + slider "Charging current I_c" | S1 |
| plate charge | HUD `Q = 0.12 μC` + ± dot pools | S1 |
| E-field | one gap field line tagged `E` (HUD `E = 1.2×10⁶ V/m` optional, S2 only) | S2 |
| electric flux | HUD `Φ_E = 1.36×10⁴ V·m` (live, climbing) | S2 |
| Ampèrian loop + element | ring tag `Ampèrian loop` + one `dl` arrow-segment | S3 |
| enclosed current | surface chip `I_enc = 1.2 A` | S3 |
| μ₀ | inside the S3+ formula surface only | S3 |
| B | curl arrows on rings + probe readout `B = 2.4 μT` | S3 / S5 |
| probe radius | dashed radial line `r = 10.0 cm` | S5 |
| plate radius | plate-edge tag `R = 6.0 cm` | S7 |
| displacement current | gap readout `I_d = 1.20 A` | S6 |
| ε₀ | S8/S9/formula surfaces ONLY (never earlier — scar) | S8 |

**(c) Right-hand-rule plan:** grip rule (circulation — per `patterns/magnetism.md`), performed TWICE: S3 thumb along the bead current → fingers = the curl arrows on `dc_loop`; S5 thumb along the flux-GROWTH direction in the gap → the same circulation sense on `dc_bring_gap`. Required minimum = animated curl-arrow glyphs; the shipped magnetism grip-hand mesh docks once in S3 if it ports cleanly (optional, flagged in §0b).

**(d) Motion plan:** every state's motion is the §3 table row; S8 is the only nothing-physically-moves state and is carried by the glow-walk + docking chain, declared `reveal_hold`.

**(e) Modes:** conceptual-only — NO `mode_overrides`, NO `epic_c_branches`. `renderer_pair` = field_3d/field_3d; `available_renderer_scenarios.field_3d = ["displacement_current"]`.

**(f)** `misconception_watch` at exactly S1, S5, S6. **`assessment` + `coverage_map`: AUTHOR THEM** (post-2026-05-30 concept; Ch.2 `capacitance` precedent is inclusion). Six backward-designed questions mapping: q1 nothing-crosses (S1) · q2 two-surface paradox (S4) · q3 B-in-gap (S5) · q4 I_d = I_c and only-while-changing (S6, the aha state) · q5 B(r) peak (S7) · q6 compute I_d from dΦ_E/dt + state the generalized law (S8/S9). `non_assessed_states`: S2, S3, S10.

**(g) Macro↔micro (Rule 33):** N/A as a split — declared in §3 with the instrument plan (two live meters + probe, numeric + needle).

**(h) Canvas budget (Rule 34):** ONE formula surface per state — S1 none · S2 `Φ_E = E·A` · S3 `∮B·dl = μ₀ I_enc` · S4 `∮B·dl = μ₀(1.2 A) … or μ₀(0)?` · S5 `B_gap = B_wire` · S6 `I_d = I_c` · S7 `B ∝ r inside · ∝ 1/r outside` · S8 builds `I_d = ε₀·dΦ_E/dt` in place · S9 `∮B·dl = μ₀(I_c + ε₀ dΦ_E/dt)` · S10 `I_d = I_c`. Caption = the ≤5-word Δ cue only; HUD value-only; real Unicode across all three text paths (Φ ε₀ μ₀ ∮ · μT ×10¹¹); overlays in distinct corners, HUD clears the review-chrome button (top:52px+).

**(i) Curriculum-flex block (Rule 38):**
- **(i-1) Coherence check, both cuts.** Hide advanced (S8–S9): S1–S7 + S10 — crisis → fact → fix → profile → explore; no survivor references the calculus form or the generalized law (S6 defines I_d in words + `I_d = I_c` only; verified against every caption/formula/narration plan above; no forward references authored anywhere, which also serves Rule 25d reordering). Hide advanced+extended (S7–S9): S1–S6 + S10 — a complete qualitative lesson ending on the PRIMARY aha + sandbox; S10 never mentions the peak or the law. **Both cuts coherent.**
- **(i-2) Explore = CORE-ring only:** S10's formula is `I_d = I_c`; its readouts use only symbols established in core states (I_c, I_d, I_enc, B, r); no ledger, no ε₀ dΦ_E/dt, no R-peak callout (B values simply read live).
- **(i-3) `curriculum_tags` (CLAIMS — 38g; only CBSE/NCERT marked verified):**

| Curriculum | Coverage | Note |
|---|---|---|
| CBSE/NCERT Class 12 (+ JEE Main/Adv, NEET) | **✓ full** | Ch.8 §8.2 — verified at authoring time; the full ring set IS this lesson |
| Cambridge IGCSE 0625 | ✗ absent (believed — no Ampère's law at IGCSE) | `needs_teacher_verification` |
| CAIE A-level 9702 | ✗ absent (believed — EM waves qualitative only) | `needs_teacher_verification` |
| IB DP Physics (2023) | ✗ absent (believed) | `needs_teacher_verification` |
| AP Physics 2 | ✗ absent (believed — Maxwell's equations not assessed) | `needs_teacher_verification` |
| AP Physics C: E&M | ◐ partial (believed — Ampère–Maxwell/Maxwell's equations conceptual in the CED; assessed depth unclear) | `needs_teacher_verification` |
| Ontario SPH4U | ✗ absent (believed) | `needs_teacher_verification` |

- **(i-4) Preset proposal (hide, never reorder — 38h):** CBSE/JEE/NEET = S1–S10 (all) · AP Physics C = S1–S6, S8–S10 pending verification (S7's r-profile is JEE-flavoured; harmless if left visible) · every believed-absent board = no shipped preset; opt-in fallback S1–S6 + S10 (core cut). No preset teacher-visible until a teacher of that curriculum confirms (38g).
- **(i-5) Graph-axis conventions (38e):** no graph pane in this concept — the B(r) profile is delivered by probe + live HUD, deliberately (smaller engine ask). If a later retrofit adds a B–r pane: B-on-y, r-on-x is universal; no board conflict, no toggle needed.
- **Dialect (38d):** "Ampère's circuital law" dual-labelled once at S3 ("Ampère's law (circuital law)"), then bare "Ampère's law"; "charger/battery" never "cell"; "capacitor gap" for separation; "displacement current" is universal vocabulary.

**TTS:** author `teacher_script` EN now; `text_hi` via the Rule-30g Sonnet-5 subscription sub-agent pre-ship (30i — never `text_te`); audio on-demand EN only (30h).
**Registration (8 sites):** `displacement_current.json` · `concept_panel_config`/`CONCEPT_PANEL_MAP` · `CONCEPT_RENDERER_MAP` → field_3d · `VALID_CONCEPT_IDS` · deep-dive flags S4/S6/S8 · synonyms n/a · `PCPL_CONCEPTS` N/A · `CLASSIFIER_PROMPT` + the four aspects. Plus clusters migration + `_seed_displacement_current_cache.ts`.
**THE EYE:** 10/10 after the §0b scenario lands; eye-walker ∥ quality-auditor; zero new `engine_bug_queue` rows; founder hand-tests S10's three sliders + the trusted-drag seize (headless can't fire trusted events).

---

## Block 1 — Pass-1 strategic checklist

**Prerequisite cliffs.** `amperes_circuital_law` breaks at **S3** if ∮B·dl is noise → one S3 clause: "add up B along the loop — Ampère says the total equals μ₀ times whatever current threads through the surface the loop bounds." `electric_flux` breaks at **S2** if Φ_E is unfamiliar → one S2 clause: "flux — field strength times the area it crosses, the same counting you used for Gauss's law." `capacitance` breaks at **S1** if the charging story is new → S1's choreography IS the patch, plus one clause naming plates that "fill to ±Q." Cliff states (S2/S3) deliberately differ from the deep-dive picks (S4/S6/S8) — cliffs get one-clause patches, deep-dives get investment where the abstraction sticks.

**JEE-backwards trace.** *"A parallel-plate capacitor with circular plates of radius 6.0 cm is charged by a constant current of 1.2 A. (i) Find the displacement current across the gap. (ii) Find B at 10.0 cm from the axis, midway between the plates, and state where between the plates B is largest. (iii) Write the generalized Ampère–Maxwell law and explain why it is needed."* → (i) S6 (equality) + S8 (the formula, numbers closing at 1.2 A) · (ii) S5 (2.4 μT at r = 10 cm, wire-identical) + S7 (peak at the plate edge; enclosed-fraction reasoning delivered by the S9 ledger's partial-capture mid-morph + S10's live B(r) probe) · (iii) S9 (the law) + S4 (the why). No missing piece; every number in the question is a number the sim shows live.

**Misconception entry mapping / planting audit.** (1) S1's "nothing crosses the gap" deliberately PLANTS "the gap is magnetically dead" — that is the earned wrong belief S5 breaks; S1 therefore asserts nothing about fields (narration stays on charge only), so the belief is the student's own inference, flagged and killed at S5 (16a beat there). (2) S6's "acts as a current" could plant "so charges DO flow in the gap" → confronted in the SAME state (pivot #3: bead-free ghost column, reading dies with the flux change). (3) S9's ledger could plant "I_c and I_d always coexist and add" → one S9 clause: "flat surface: all conduction; bulged: all displacement; mid-morph: a mix — the law only ever needs the SUM." 16b fallback: no EPIC-C branches authored (directive); the three `misconception_watch` entries are the proactive record.

## Block 2 — Aha-moment designation

- **PRIMARY (S6):** *A changing electric flux acts exactly like a current — where the wire's charges stop, the changing field carries the magnetism on, ampere for ampere.* The 10-year memory: nature never lets the current's magnetic effect break at the gap.
- **SUPPORTING (S4):** *The same loop, two legal surfaces, two contradictory answers — the Ampère's law you trusted is incomplete.*
- **Cohesion:** S4 manufactures the crisis that S6 resolves; S5 is the evidence bridge between them, not a third aha. Two ahas total (the sweet spot).
- **Wrong-belief setup:** S1 earns "the gap is electrically dead" and S3 earns "Ampère's law is solid" — by S4 the student is confident in both; S4 breaks the second, S5–S6 break the first. Each aha lands against a belief built 1–3 states earlier.
- **Foundational-coverage rule:** PRIMARY aha (S6) is inside `entry_state_map.foundational` (STATE_1→STATE_6) ✓ — no exit-pill needed.

---

## Escalations / FLAGs for downstream

1. **Engine delta FIRST (§0b, Class-B):** json_author must not start until the `field3d-surgeon` (`peter_parker:renderer_primitives`-class work) lands `scenario_type: "displacement_current"` with `deriveStateMeta` registration, trusted-drag seizes, the closed glow enum, and the S10 idle auto-sweep in the SAME change. No shipped sibling shares these primitives, but the renderer file is shared — Rule 36c `check:renderer-syntax` + a fleet-baseline spot-check after the edit.
2. **quality_auditor:** run the live `engine_bug_queue` SQL at Gate 8 (0a could not); verify the S8 `reveal_hold` declaration and the S4/S9 contrast pair against the built sim's control table.
3. **physics_author:** lock the loop's charge-window timing (charge → hold → soft reset) and the two S6 throttle cycles to the narration beats; keep the constant-current-charger clause in S1 (kills the RC complication); all HUD numbers must stay on the §2 locked set.
4. **Sibling queue seeded:** `em_wave_nature` (opens on this diamond's "changing E makes B" + Faraday's "changing B makes E"), `speed_of_em_waves`, `em_spectrum`. The S9/S10 forward-hook narration must tease, never teach, the wave story.
5. **Anchor discipline:** camera flash / defibrillator / radio live in NARRATION only; nothing device-shaped drawn (Rule 24 / Rule 35).
