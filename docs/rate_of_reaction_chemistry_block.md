# Chemistry block — `rate_of_reaction` (extends architect skeleton REV 2 + session corrections)

> Companion to `docs/rate_of_reaction_skeleton.md`. Renderer: `particle_field`, `scenario_type: "gas_box"`;
> instrument per `docs/GAS_BOX_KINETICS_INSTRUMENT_SPEC.md`.
> Engine bug queue: the SQL consultation could not run from the authoring session — substituted with the in-repo
> scar surface (the spec's §0 verified facts, §4.4/4.4b fitted-slope discipline, the withdrawn Readout C lesson, and
> `check_gas_reaction_physics.ts`'s documented defect classes). **FLAG to quality_auditor: re-run the SQL at Gate 8.**

---

## 0. MEASURED CALIBRATION — DQ-1…DQ-4

Harness: vm-cloned from `check_gas_reaction_physics.ts`, driving `stepGas()` against the built
`gasKinFitWindow`/`gasRxFwdTotal`, 5 seeds, home pose exactly as declared (720 discs, `A:360, B:360, AB:0`, `N:720`,
`activation_fwd_kT: 3`, `reverse_attempt_per_s: 0`, T 300, `speed_scale` 0.105, `ea_ref_T` 300). Probes deleted;
`git status` clean of them.

### DQ-1 (pace) — CONFIRMED, with one correction
Mean reactant A remaining: t=1 s **300** · 5 s **189** · 10 s **130** · 20 s **84** · 30 s **61**.
Half consumed by **≈6–7 s** (target 8–12 s ✓), visible flattening from **≈24–28 s** (target 30–40 s ✓).

**Correction:** the reference figure "360 → ~50 over 30 s" undercounts the tail — measured **~61 at t=30 s**, ~20%
higher. Use 61 in any authored narrative or assessment table.

**Separately — the "52 / 19 / 9 / 5 ev/s" figures must not be narrated anywhere.** They match neither instrument that
could produce them: `gasRxFwdRate` (the legacy HUD, a *trailing cumulative average since state entry*) measures
**60 / 34 / 12 / 3.2** per second at those times — off by up to 79% at t=5 s because it is not centred; a genuinely
centred read (what the new chip shows) measures **≈18.7 discs/s at t≈5 s**. Since this concept never authors
`show_reaction_readout` (§6), `gasRxFwdRate` is never on screen — the only number a teacher sees is the fitted chip.

### DQ-2 (S5 window sizing) — the "±12 s → ±3 s" shrink is UNREACHABLE and is corrected here
A symmetric ±12 s window centred at t=5 s needs data back to t = −7000 ms. `gasKinBuf` resets at state entry, so it
does not exist, and `gasKinFitWindow` silently **clips** to `[0, 17000]` — an *asymmetric* window whose centre drifts
as it "shrinks". Measured, that produces a **non-monotonic wobble, not a settle**:

| authored (clipped) | mean rate | jitter |
|---|---|---|
| `[0,17000]` (nominal ±12 s) | −14.02 | 1.5% |
| `[0,14000]` (nominal ±9 s) | −16.92 | 0.7% |
| `[0,11000]` (nominal ±6 s) | −20.90 | 0.7% |
| `[2000,8000]` (±3 s) | −18.74 | 6.4% |

The chip would visibly **overshoot past its final value and come back** mid-shrink — the exact opposite of the state's
thesis. **Corrected construction — a TRUE symmetric shrink, bounded by data availability (max half-width 5 s at a
centre of 5 s):**

| half-width @ t=5 s | mean \|rate\| | jitter | events |
|---|---|---|---|
| ±5.0 s `[0,10000]` | 22.57 | 0.7% | ~230 |
| ±4.5 s `[500,9500]` | 19.88 | 2.2% | — |
| ±4.0 s `[1000,9000]` | 19.41 | 3.3% | — |
| ±3.5 s `[1500,8500]` | 19.10 | 4.5% | — |
| ±3.0 s `[2000,8000]` (final) | 18.74 | 6.4% | ~116 |

Monotonic, and flat after the first quarter (22.6 → 19.9 → … → 18.7: corrects fast, then holds) — an honest "settles
then holds" story. The final-window event count **~116 independently confirms** the skeleton's ~110 estimate.
**Delta-line correction: the achievable shrink is ±5 s → ±3 s — a 1.7× shrink, not "a visible 4× shrink".** Any
`converge_from` authored at ±12 s must change.

### DQ-3 (S4 contrast) — CONFIRMED, with the late window relocated
Early window at t≈5 s (matching S3/S5, so S4's "identical construction" claim is literally true): **18.74 discs/s**.
A late window at t≈20 s nets only **~19.6 events** — short of the ≥25 floor. **Late window moved to t≈15 s at the
SAME ±3 s width** (`[12000,18000]`): **4.11 discs/s**, **~24 events** (20–29 across seeds), jitter 13.5%.
**Ratio ≈ 4.56 : 1**, clearing the ≥2.5:1 bar with margin.

Width-identity was preserved deliberately: a wider ±4 s late window nets a cleaner 33 events but breaks "same tool,
moved" — under Rule 32b only the taught variable (position) may change. The 24-vs-25 shortfall is trivial beside that.

### DQ-4 (thermostat lag) — CONFIRMED, and longer-lived than a spike
With the reaction OFF, T holds flat at 300 K from t=0 — so the offset is caused **entirely by the exothermic
reaction's own heat release**, not a generic init artefact. With it ON:

| t | 0 | 300 ms | 1 s | 3 s | 5 s | 8 s | 10 s | 15 s | 20–30 s |
|---|---|---|---|---|---|---|---|---|---|
| mean T | 300.0 | 309.3 | 309.2 | 304.6 | 303.1 | 302.9 | 301.9 | 300.6 | ~300.5–301.0 |

Settling to <0.5% takes **≈15 s**, because the offset tracks the reaction's own heat output and decays as the reaction
slows — not on a fixed relaxation clock. That is incompatible with placing the first window at t≈5 s, which the
statistics require. **Stated plainly rather than narrated around: no measuring window opens before t = 2000 ms**
(past the +3.1% peak; `[2000,8000]` already respects this). The residual 1–2% thermal bias is small beside the
6–20% Poisson jitter already budgeted for the same chip and changes no pass/fail call — but **S1 must not claim exact
or instant isothermal control.** "Held at 300 K" is defensible; "isothermal 300 K" read as precision is not.

### ESCALATION — S7 needs the same `New run` control as the sibling
The spec names Piece G "required, not optional" for `rate_law_and_order` S11 because that box is irreversible and runs
down under live sliders. **This concept runs identical constants and DQ-1 confirms the identical failure mode** —
reactant effectively exhausted by t≈30–40 s. S7 is `interaction_complete` with live T / `t_lo` / `t_span`; a teacher
exploring past ~40 s gets a dead box no slider can revive (raising T on an empty box does nothing). **Author
`show_kinetics_new_run: true` on S7.** The control is already built — this is an authoring gap, not new engine work.

---

## 1. `engine_config`

```json
{
  "variables": {
    "T":      { "name": "temperature", "unit": "K", "min": 200, "max": 800, "default": 300, "step": 10 },
    "t_lo":   { "name": "measuring window position", "unit": "s", "min": 3, "max": 23, "default": 15,
                "note": "S4: seconds; ×1000 into kinetics_marks t0_ms/t1_ms at the binding site; width stays fixed at ±3 s" },
    "t_span": { "name": "measuring window half-width", "unit": "s", "min": 1, "max": 5, "default": 3,
                "note": "S5: max = 5 is the MEASURED data-availability bound at centre t=5 s, not a style choice" },
    "N":      { "name": "total discs", "unit": "discs", "constant": 720,
                "note": "authored alongside species_counts in EVERY state — N alone is silently truncated" },
    "activation_fwd_kT":     { "name": "forward activation energy", "unit": "kT at ea_ref_T", "constant": 3 },
    "reverse_attempt_per_s": { "name": "reverse pre-exponential", "unit": "1/s", "constant": 0,
                "note": "renderer default is 3.5 — must be authored explicitly in every state" },
    "rate_A":  { "name": "rate from the A curve", "unit": "discs/s",
                "derived": "-gasKinFitWindow('A', t0_ms, t1_ms).rateDiscsPerSec",
                "note": "MUST be negated before display — the raw fit on the falling A curve is negative, and the definition's minus sign is what makes the printed rate positive. S3's whole sign beat depends on this being done, not glossed." },
    "rate_AB": { "name": "rate from the AB curve", "unit": "discs/s",
                "derived": "gasKinFitWindow('AB', t0_ms, t1_ms).rateDiscsPerSec", "note": "already positive — no negation (S6 mirror)" }
  },
  "formulas": {
    "rate_definition": "rate = −Δ[A]/Δt = +Δ[AB]/Δt",
    "rate_derivative": "rate = −d[A]/dt = +d[AB]/dt",
    "units_lab": "mol L⁻¹ s⁻¹",
    "units_box": "discs/s"
  },
  "computed_outputs": {
    "rate_early_S4":   "~18.7 discs/s at t≈5 s (±3 s window, 5-seed mean)",
    "rate_late_S4":    "~4.1 discs/s at t≈15 s (±3 s window, 5-seed mean)",
    "ratio_S4":        "~4.6 : 1",
    "rate_settled_S5": "~18.7 discs/s at t≈5 s, ±3 s final window"
  },
  "constraints": [
    "count(A) + count(AB) = 360 and count(B) + count(AB) = 360 at all times (irreversible, N fixed at state entry)",
    "reverse_attempt_per_s = 0 authored explicitly in every state (renderer default is 3.5)",
    "the displayed rate is never negative: rate = −slope(A) = +slope(AB); the sign lives in the definition, never in the reading",
    "kinetics_y_max fixed at 360; axes never autoscale, in any state",
    "no kinetics_marks window opens before t0_ms = 2000 (measured thermostat settling)",
    "S5's wide window never exceeds a 5000 ms half-width at its centre = 5000 ms anchor (data-availability bound)"
  ]
}
```

---

## 2. Balanced-equation ledger

**A(g) + B(g) → AB(g)**, irreversible. Coefficients all 1 — the 1/ν case is deliberately off-canvas (assessment Q6).

| | LHS | RHS |
|---|---|---|
| species-units | 1 A + 1 B | 1 AB |
| charge | 0 | 0 |
| redox | none — A, B, AB are abstract gas-phase placeholders; no oxidation numbers, no electron transfer depicted |

Conservation is **enforced, not asserted**: `check_gas_reaction_physics.ts` already gates
`fwd_total − rev_total = count(AB)` exactly for this reaction layer.

---

## 3. Motion timeline + per-state control spec (Rule 31)

Every state: box milling continuously; panel at its one fixed home `kinetics_home: 'tr'` (S2–S7; S1 has no inset).
Every state authors `reaction: { reverse_attempt_per_s: 0 }`, `species_counts: {A:360, B:360, AB:0}`, `N: 720`,
`kinetics_y_max: 360`, `kinetics_span_ms: 30000`. **No state authors `show_reaction_readout` / `show_k_ratio` /
`show_rate_constant`** (§6).

| # | dur | t-window | what animates | controls | glow_focal | words |
|---|---|---|---|---|---|---|
| **S1** | 20 s | 0–20 s | reaction runs from entry; counts chip (`show_species_counts_only: true`, no rate bars, no inset) | none | `species_counts` | 54 |
| **S2** | 26 s | 0–0.5 s box only (cause first); 0.5–26 s inset fades in and accumulates | panel populates once (`count_vs_time`, series A/B/AB, B dashed) | none | `kinetics_plot` | 47 |
| **S3** | 24 s | ~2.0 s first marker at `t0_ms:2000`; chord + chip resolve as the clock passes `t1_ms:8000`; 10–16 s formula surface (definition + sign); 16–24 s units bridge | `kinetics_marks:[{t0_ms:2000,t1_ms:8000,series:'A'}]` | none | `kinetics_mark` → `formula` | 55 |
| **S4** | 26 s | ~2.0 s early window `[2000,8000]` (`keep:true`); ~9.5–10.5 s late window `[12000,18000]` lands beside it; ~21–24 s `t_lo` goes live, seizing position only | two sequential marks, never superimposed | `t_lo` (position only; 3–23 s, default 15) | `kinetics_mark` | 50 |
| **S5** | 24 s | ~2.0 s wide window `converge_from:{t0_ms:0,t1_ms:10000}`; ~2.5–8.5 s ends slide to `{2000,8000}` (`converge_ms:6000`); 9–16 s hold, `t_span` live; 16–24 s "rate at t = settled slope" | true symmetric shrink ±5 s → ±3 s | `t_span` (width only, centre pinned at 5 s; 1–5 s, default 3) | `kinetics_mark` | 45 |
| **S6** | 24 s | ~2.0 s A-tangent reappears (`as_tangent`, same window); ~4–5 s label morphs Δ→d; ~6.5–7.5 s AB-mirror tangent draws; ~13–15 s chips agree; 16–24 s formula settles | two `as_tangent` marks, sequential | none | `kinetics_mark` → `formula` | 53 |
| **S7** | open (`interaction_complete`, Rule 37) | continuous | box, curve, draggable window, count chips; **`show_kinetics_new_run: true`** | T (200–800 K), `t_lo` (2–25 s), `t_span` (1–5 s, clamped) | `box` | 31 |

**Narration (`text_en`), word-checked, 25–55 budget, Rule 41 plain English:**

- **S1 (54):** "Discs move and collide nonstop; a hard enough meeting bonds a blue and a pink into a purple pair. Watch the counts fall and rise. This box is four times fuller than the collision box, so there is enough to measure. These pairs never split apart — it stops only when reactants run out."
- **S2 (47):** "Plot those same counts against time and they become curves. Blue and pink fall along the same line, one dashed to tell them apart. Purple rises as their exact mirror, drawn live from the same events — every purple gained is one blue and one pink lost."
- **S3 (55):** "Pick two times on the curve — the chord has a slope. It falls, so the slope is negative; rate is defined as minus delta A over delta t, so the minus sign makes it positive. This chip counts discs per second; a lab counts moles per litre per second — same idea, different unit."
- **S4 (50):** "The same window, replayed later, gives a much smaller number. Early on, the box is crowded and busy; later it reads roughly four times slower. Fewer blue and pink discs left means fewer meetings to react. One reaction, two honest measurements — the rate keeps falling as reactants run out."
- **S5 (45):** "Shrink the measuring window and watch the number stop changing. Wide, it already reads close to the true value; narrow it further and it holds steady — small enough that shrinking it more changes nothing. That settled number is the rate at this one instant."
- **S6 (53):** "That settled slope has a name: rate equals minus d A over d t. The same construction, redrawn on the purple curve, settles to the same size — rising instead of falling — so rate also equals plus d AB over d t. Blue and pink are used together, one each per event."
- **S7 (31):** "Rerun the reaction and measure any part of the curve yourself. Change the temperature, drag the window anywhere, shrink it to settle on an instant. Same tools, your choice of moment."

Narration never quotes an absolute discs/s value — S4 says "roughly four times slower", matching the measured 4.6:1
with margin against per-seed jitter.

---

## 4. Notation + dialect ladder (Rule 38c/38d)

- **Core (S1–S4):** counts, Δ-ratios, average rate. No calculus.
- **Extended (S5):** the limiting construction, defined operationally — still zero calculus notation.
- **Advanced (S6 only):** `d[A]/dt` first appears here, never below the advanced ring.
- Dual-label once: "reaction rate (sometimes called speed)" S1 · "[A] (particle count standing for concentration — the
  box's volume is fixed)" S2 · "average rate" S3 · "instantaneous rate (the settled slope)" S5.
- No IUPAC naming applies — A/B/AB are abstract placeholders. All on-canvas math Unicode (Δ, −, ⁻¹, →) across the
  DOM / canvas / sprite paths (Rule 34c).

---

## 5. Drill-down cluster phrasings (9 clusters × 5, student voice)

**S3 `average_rate_calculation`** — how do I know which two times to pick from the table · do I divide by the change in
time or the change in amount · why is my answer a huge number when I use seconds instead of minutes · what if the two
concentrations given aren't evenly spaced in time · is the average rate just the total change divided by the total time

**S3 `rate_sign_convention`** — why does the equation have a minus sign in front of it · the concentration is going down
so why do they call the rate positive · do I put a minus for the reactant and a plus for the product every time · can a
rate ever actually be negative in real life · why doesn't the minus sign show up in the units

**S3 `rate_units_conversion`** — how do I turn mol per litre per second into mol per litre per minute · why does the box
show discs per second instead of the units in my textbook · is atm per second the same kind of unit as mol per litre per
second · do I need to convert litres to millilitres before I use the formula · why did my units come out wrong when I
divided concentration by time

**S4 `rate_falls_reactant_used`** — if the same reaction is running why does the rate change at all · does the rate drop
because the discs slow down or because there are fewer of them · so is the rate constant actually changing too, or just
the rate · why does it fizz fast at first and then slow down without anyone touching it · will the rate ever hit exactly
zero or does it just get very small

**S4 `average_vs_instantaneous`** — what's the actual difference between average rate and instantaneous rate · which one
do I use if the question just says find the rate · how can there be a rate at one exact instant if rate needs a change
over time · if I pick a really tiny time interval, is that the same as instantaneous rate · why does my answer change
depending on how wide I make the interval

**S4 `reading_intervals_off_curve`** — how do I read the concentration off the graph at a time that's not marked · do I
draw a straight line between the two points or follow the curve · why does my slope come out different from my
classmates when we pick different points · how do I know if I'm supposed to read the reactant curve or the product
curve · what do I do if the two times they gave me aren't both on the graph

**S6 `stoichiometric_rate_coefficients`** — why do I divide by 2 in the rate expression when the equation has a 2 in
front of A · does the coefficient go on top or on the bottom · if B is used up twice as fast as A, is the rate of the
reaction still just one number · why isn't there a 1/2 anywhere in this box if A and B are 1:1 · how do I write the rate
expression for a reaction with three different coefficients

**S6 `derivative_notation_reading`** — what does d[A]/dt actually mean if I haven't learned calculus yet · is d[A]/dt
just a fancier way of writing delta A over delta t · why is there a d in front of the bracket instead of in front of
the A · do I need to know how to differentiate to answer a rate question with this notation · what's the difference
between writing d[A] and writing dA

**S6 `product_vs_reactant_rate`** — why does the product rate get a plus sign and the reactant rate get a minus sign ·
if A and B disappear at the same speed, do they always have to · does the product always appear exactly as fast as the
reactant disappears · would this still be true if the product were a gas instead of a solid · why do both curves give
the same number if they're going in different directions

---

## 6. Constraint callouts for json_author

- **Never author `show_reaction_readout`, `show_k_ratio` or `show_rate_constant` on any state** — those are the legacy
  and sibling instruments (a trailing cumulative rate, and an equilibrium-K ratio) and would print a second,
  disagreeing "rate" beside the kinetics chip.
- **Negate `gasKinFitWindow('A', …).rateDiscsPerSec` before displaying it as a rate** — the raw fit on the falling A
  curve is negative, and surfacing that raw sign IS the misconception S3 exists to confront.
- **`t_lo` / `t_span` are authored in seconds; `kinetics_marks[].t0_ms/t1_ms` are milliseconds** — apply ×1000 at the
  binding site.
- **No window opens before `t0_ms: 2000`** in any state (measured thermostat settling).
- **S5's wide window is capped at a 5000 ms half-width at its 5000 ms centre** — a hard data-availability ceiling; do
  not widen it to chase a bigger visible shrink.
- **The disc↔mole bridge is qualitative only** ("each disc stands for an enormous number of molecules") — no numeric
  scale factor exists for this box; do not invent one.
- **`N: 720` authored alongside `species_counts` in every state** (N alone is silently truncated).
- **`reverse_attempt_per_s: 0` explicit per state**, not only at `gas.reaction` level.
- **`show_kinetics_new_run: true` on S7** (the escalation above).
- **`t_span`'s S7 max clamped by the live `t_lo`** (`min(t_lo, duration − t_lo)`) so no negative-time window can be
  requested outside S5's fixed centre.

---

## Self-review (chemistry_author)

DQ-1…DQ-4 measured, not guessed, with a correction on each: DQ-1 tail count (61, not 50) · DQ-2 the ±12 s window is
unreachable, corrected to a true ±5 s → ±3 s symmetric shrink · DQ-3 late window relocated to t≈15 s preserving
width-identity · DQ-4 settling is ~15 s, so all windows floored at t=2000 ms ✓ · motion + control table complete with
Rule 32 cause-effect gaps per state ✓ · word budgets checked with `wc -w`, all seven states inside [25,55] ✓ ·
`glow_focal` restricted to the verified `dimFor()` set ✓ · notation ladder keeps `d/dt` in the advanced ring only ✓ ·
45 drill-down phrases across the architect's nine named clusters, plain English ✓ · constraints conservation-first ✓ ·
the rate sign convention was run through the actual fit function, not eyeballed ✓ · one escalation raised beyond the
assigned DQ list because the measurement surfaced it (S7 rerun control) ✓ · all probe scripts deleted ✓.

**Source check:** NCERT Class-12 Ch.3 index consulted for scope confirmation only (re-verified, not re-imported);
NCERT Exemplar for misconception beliefs only. No teaching method, example problem or figure imported.
