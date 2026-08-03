# `bonding_scene` E3b — the ENGINE DISPATCH SPEC (Desk 2, Phase-0 bonding wave)

**Desk:** `feat/bonding-scene-e3b` (cut from `origin/master` @ `fec2c2e`). **Rule 40: this is PLATFORM
work — it lands on master by its own PR, never inside a chapter branch.**
**Owner:** `peter_parker:field3d_surgeon`. **Dispatching session:** Desk 2 (`ionic_bonding`).
**Serves BOTH concepts of the wave:** `ionic_bonding` (Desk 2) and `metallic_bonding` (Desk 3 /
Session B). Session B does not dispatch a surgeon — every engine capability either concept needs is
in this document.

**Date:** 2026-08-03.

---

## 0 · Why this dispatch is bigger than Phase-0 planned

Phase-0 §E3 scoped E3b as *"derived layer-shift outcome + D-7 `like_contacts` + electron sea + drift +
row Q + row R + melt"* — i.e. the four `BS_MODES_DEFERRED` and the six declared-but-unimplemented HUD
lines. That scope assumed the E3a **site layer** had reached parity with the older **unit (molecule)
layer**. It has not.

`founder_proxy` Checkpoint A on `ionic_bonding` (2026-08-03) found three motion/decoration mechanisms
that exist ONLY on the unit layer, and the dispatching session re-verified all three in source before
accepting them. Their consequence is that **`ionic_bonding` S1 and S3 are dead states on the shipped
engine** — states Phase-0 and the architect skeleton both certified "buildable today", because both
checked the mode string against `BS_MODES_IMPL` rather than checking which function actually moves the
taught element.

That is the scar `skeleton_certifies_a_state_buildable_from_a_mode_string_without_a_frame_probe`, and
it is why §1 (site-layer parity) is dispatched BEFORE §2 (the deferred modes).

### The three parity gaps, verified in source by the dispatching session

| # | Gap | Verified at | Consequence |
|---|---|---|---|
| P-1 | **The site layer ignores every scripted position mechanism.** `sitePos` is built from the raw authored `SI.at` plus spin only; it never calls `orgAt`/`sepAt`/`baseAt`, which are the *unit* layer's position chain. And `bscIsSite()` switches the unit layer OFF for ion/atom species. | `:54376` (`sitePos.push((spin !== 0) ? bscSpinRot(SI.at, spinAx, spin) : SI.at)`) vs `:54062–54096` (`orgAt`) and `:54154` (`var on = u < nUnits && !(udef && bscIsSite(udef.species))`) | A state authoring `mode:'approach_link'` on two ions is **byte-static**. `approach_from` / `approach_at_ms` / `approach_duration_ms` / `separation` / `separation_axis` are all inert on ions. |
| P-2 | **Sites never jiggle.** `bscJiggle` is called exactly once in the whole file, inside `orgAt` — the unit layer. | `bscJiggle` defined `:52444`, called ONLY at `:54095` | `thermal.jiggle_scale` is a **no-op on every lattice and every ion scene**. Every "no static state" guarantee built on it is false. `deriveStateMeta` still reads the authored field and declares the state MOVING → **a green gate over a dead state**. |
| P-3 | **`electrons:{show:'shells'}` binds to the molecule table.** The dot count is `BS_VALENCE[mol.central]`, one ring, anchored at the focal *molecular* unit's origin, radius from `MG_ELEMENTS[mol.central]`. When no unit species is in `MG_MOLECULES`, `molKey` falls back to `"HCl"`. | `:54843–54845`, `:53810` (`if (!MG_MOLECULES[molKey]) molKey = "HCl"`), `:55081` (the `valence` HUD reads the same field) | A scene of bare `Na` + `Cl` atoms renders **one dot** (`BS_VALENCE.H === 1`) buried inside the sodium sphere, and the `valence` HUD prints **`outer electrons = 1`**. |

**The pattern behind all three:** a mechanism was added to one of the two draw layers and not to the
other, and nothing asserts parity. §1's gate work must close that hole permanently, not just fix the
three instances.

---

## 1 · DISPATCH 1 — SITE-LAYER PARITY (`bug_class: field3d_site_layer_ignores_the_unit_layer_position_script`)

Unblocks `ionic_bonding` S1, S2, S3, S5, S10 and every lattice state in both concepts.

### S-1 · Site layer honours the scripted position chain
- The leading pair of sites (indices 0 and 1 of `bscSiteList`) must respond to `separation_axis`,
  `separation`, `approach_from`, `approach_at_ms`, `approach_duration_ms` exactly as the unit layer
  does, using the **same closed-form `mgRamp`** — no accumulator, no replayed history (D-1), so
  frozen pins stay byte-identical by construction (Rule 36).
- The `separation` slider drag-seize path applies to sites as it does to units: re-seed on state
  entry, per-frame track until a trusted drag seizes
  (`scripted_change_desyncs_the_dom_control_that_shares_it`).
- **Second-order, do not miss:** `bscOpeningExtent` (`:52914–52932`) widens the camera fit for the
  OPENING pose, but `if (!msp) continue;` skips any species not in `MG_MOLECULES` — i.e. every ion.
  An ion pair opening at `approach_from` will be framed for its settled pose and open off-frame.
  **Extend the opening-extent solve to sites in this same change.** Never author `camera` is a
  standing authoring rule precisely because the fit is engine-owned; that promise has to hold here.

### S-2 · Site-layer thermal jiggle
- Apply `bscJiggle` to site positions from `thermal.{T_K, jiggle_scale}`, same deterministic
  per-site seeded sines, same √(T/T₀) amplitude law as the unit layer (`:52209–52217`). Deterministic
  ⇒ frozen baselines safe.
- `jiggle_scale` keeps its default of **0** (`:54034`) — authoring stays explicit, per the Desk-1
  lesson. What changes is that authoring it now does something.
- **This is load-bearing for `ionic_bonding` S8's negative control**, which is *"the solid's ions
  jiggle in place and never translate"*. A byte-frozen solid beside a drifting melt teaches "solids
  are dead", not "solids are locked". Both halves must be real.

### S-3 · Per-site valence shell dots + a site-aware `valence` HUD
- Dot count per site from `BS_VALENCE[bscElement(siteSp[i])]`, ring radius scaled from that site's
  own `siteRU[i]`, drawn around **every counted site**, not only a focal one. Budget-cap the dot pool
  the way site labels are capped (D-6) and declare the cap.
- The `valence` HUD line must resolve against the site layer whenever sites are on screen.
  **Copy the pattern the `radius_pm` branch already uses at `:55066–55077`** — it is the same problem,
  already solved once, and it is the reference implementation for "this HUD line is site-aware".
- Keep the D-4 countability property the existing ring has (drawn in the camera plane so every dot is
  countable from the solved view, stable under a pin) — now per site, and it must hold across the
  full spin window.

### S-4 · New HUD line `separation_pm`
- Add to `BS_HUD_LINES` (`:51634`). Prints the **live centre-to-centre distance between the two
  leading sites**, converted through `pm_per_unit`. Format: **`d = 282 pm`** (`Math.round`).
- Why it is in scope: `ionic_bonding` S3's entire taught quantity is a distance that ramps in and
  stops, and there is no instrument for it — the skeleton was forced to hand-type `282` into the
  on-canvas delta cue, which is the class of defect §3 of this document bans everywhere else
  (Rule 33d: an instrument shows the live numeric reading and tracks the physical change).
- With `separation_pm` live, **no authored string in either concept types a separation digit.**

### S-5 · `coordination` HUD format → `6 : 6`
- Today: `lines.push("neighbours = " + nbIdx.length)` (`:55080`) — a single number.
- **Decision (dispatching session):** print `coordination = 6 : 6`, where **both numbers are
  DERIVED** — the neighbour count of the focal cation and the neighbour count of the focal anion,
  counted independently by the same geometry pass. Never hard-code the pair, and never print `6 : 6`
  by doubling one count: MgO/CaO/LiF/KCl must read correctly off the same code, and a cell that is
  genuinely not n:n must read honestly.
- **Safe to change:** no shipped concept authors the `coordination` HUD line
  (`grep -rl coordination src/data/concepts/` → empty). `ionic_bonding` is its first consumer.
- Rationale: `6 : 6` is the chemistry notation, the skeleton's §14(b) symbol table asserts it, and
  S5's narration closes *"the count is the same: six and six"* — which fails Rule 24 sound-off
  against a canvas showing a single `6`.

### S-6 · The explore idle-spin fallback must not stand down on a no-op signal
- `:53968`: `if (mode === "explore" && !(spinRate > 0) && !window.PM_bscSpinDragged && !(th.jiggle_scale > 0)) spinRate = 0.14;`
- The `jiggle_scale > 0` term assumes jiggle is live motion. True on the unit layer; **false on the
  site layer today**, so a lattice explore state that authors `jiggle_scale` under the fleet's own
  no-static-state discipline gets *no jiggle and no spin* — a byte-frozen sandbox that
  `deriveStateMeta` reports as MOVING. Rule 37 breach with a green gate over it.
- S-2 fixes the underlying cause. **Keep this guard correct anyway**: the fallback may only stand
  down on a motion signal that is live for the layer actually drawing the state.

### S-7 · Slider ranges are concept-level and the default cannot serve this wave
- `config.slider_controls` is read once at concept level (`:53372–53375`); `temperature` defaults to
  **100–600 K** (`:53412`).
- Against that: `ionic_bonding` S7 ramps to 1200 K with the slider exposed, S9 ramps to 1500 K, and
  S10 must reach ≥3400 K so MgO (mp 3125 K) and CaO (2886 K) can actually melt in the sandbox. A
  scripted ramp past the slider max is the clamping form of
  `scripted_change_desyncs_the_dom_control_that_shares_it`: the frame reads 1200, the widget pins at 600.
- **No engine change required** — but the surgeon must confirm the drag-seize re-seed **clamps into
  the authored range** rather than silently pinning, and the gate must assert that a scripted `T_K`
  destination outside `slider_controls.temperature.{min,max}` is a **hard authoring error**, not a
  silent clamp. Authoring decision handed to the architect: `{min: 300, max: 3400, step: 25}`.

### S-8 · The parity gate (this is the permanent half)
Add to `check:bonding-scene` a **layer-parity section** that fails when a motion or decoration
mechanism is live on one layer and inert on the other. Minimum assertions:
1. Two ion units + `approach_from`/`approach_at_ms`/`approach_duration_ms`: site position at
   state-local t=0 ≠ position at t=state_end, and the end position equals the authored `separation`.
2. A lattice state with `thermal.jiggle_scale: 1`: two frames 200 ms apart are **not** byte-identical.
   With `jiggle_scale: 0`: they **are**.
3. `units:[{species:'Na'},{species:'Cl'}]` + `electrons:{show:'shells'}`: **8** visible shell dots
   (1 on Na, 7 on Cl); the `valence` HUD prints both counts, never `outer electrons = 1`.
4. `mode:'explore'`, `placement:'lattice'`, `jiggle_scale > 0`, no authored `spin_rate`: two frames
   400 ms apart are not byte-identical.
5. `separation_pm` prints a value that changes across the approach ramp and settles at the authored
   destination.

---

## 2 · DISPATCH 2 — THE PROPERTY TABLE + `melt` + row R `groups`

`bug_class: field3d_bonding_scene_melt_mode_and_ion_property_table_missing`.
Unblocks `ionic_bonding` S7, S9, S10.

### T-1 · Extend `BS_ION_PAIRS` (`:51693`) with `mp_K` and `lattice_kJ`

**RATIFIED by `chemistry_author`, 2026-08-03 — transcribe exactly, change no digit.**

| key | cation | anion | a_pm | **mp_K** | **lattice_kJ** |
|---|---|---|---|---|---|
| NaCl | Na+ | Cl- | 564.0 | **1074** | **788** |
| KCl | K+ | Cl- | 629.3 | **1043** | **715** |
| LiF | Li+ | F- | 402.6 | **1118** | **1030** |
| MgO | Mg2+ | O2- | 421.2 | **3125** | **3791** |
| CaO | Ca2+ | O2- | 481.1 | **2886** | **3401** |

**Conventions — name them in the source comment beside the table, verbatim:**
- `mp_K` — melting point at standard pressure, congruent melt (solid → liquid, same composition, no
  decomposition). CRC-Handbook-class table; every value is a clean whole-°C→K conversion
  (801/770/845/2852/2613 °C). MgO and CaO carry a **measurement-precision** flag (refractory oxides
  above 2800 °C; older sources spread wider) — the values shipped are the modern commonly-cited ones.
  Never narrate them to more significant figures than the whole-Kelvin HUD readout.
- `lattice_kJ` — lattice **DISSOCIATION** enthalpy, **MX(s) → M⁺(g) + X⁻(g)**, positive, kJ·mol⁻¹,
  298 K, **Born–Haber-derived (experimental cycle)** — never Born–Landé/Kapustinskii-calculated.
  `chemistry_author` confirmed all five rows are internally consistent with a single Born–Haber
  tradition; **no calculated value is mixed in**. KCl (literature band 701–717) and LiF (1030–1036)
  carry a normal cross-compilation spread flag; the shipped digits sit inside both bands.
- Ratify state: **all five rows RATIFIED, both columns.** The gate prints table-vs-literature with the
  ratify flag (the E1 dipole-table pattern) and must never assert an unratified digit.

### T-2 · `melt` mode — the law, stated so it cannot be invented

**Decision (dispatching session), because "a closed-form function of (T_K, site index, t)" is a shape
constraint and not a law:**

```
f_melt(T_K, pair) = clamp( (T_K - pair.mp_K) / 25, 0, 1 )
```

- **Sharp by design.** Melting is a first-order transition; the 25 K width exists only so the beat is
  legible rather than a one-frame snap. 25 K against NaCl's 1074 K is 2.3 % — visually smooth,
  chemically sharp.
- `f_melt = 0` ⇒ every ion holds its site (jiggle only, per S-2). `f_melt = 1` ⇒ every ion is mobile.
  Between, the mobile FRACTION ramps — chosen sites, deterministic by site index, never random.
- **Closed-form in (T_K, site index, state-local t). No latch, no accumulator, no replayed history**
  (D-1) — so a group may open **already molten** (`ionic_bonding` S8's `g_melt`) with no memory of
  having melted, and frozen pins stay byte-identical.
- **Derived, never authored** (D-2): nothing in any JSON says "this one melts". The outcome falls out
  of `T_K` vs the pair's `mp_K`.
- **Authoring consequence, hand this to the architect:** the knee sits at `mp_K + 25`. `ionic_bonding`
  S8's `g_melt` must be authored **clear of the knee** — 1074 + 25 = 1099, so the skeleton's authored
  `T_K: 1100` is only *just* over and would render as a barely-perturbed lattice at f≈1.0 with no
  margin. **Author `g_melt.thermal.T_K: 1150`.** The engine law is fixed first; the authoring follows
  it. Never widen or narrow the law to make an authored number work.

### T-3 · HUD lines `melting_point` and `lattice_enthalpy`
- `melting_point` → **`m.p. = 1074 K`**. `lattice_enthalpy` → **`ΔH = 788 kJ·mol⁻¹`** (real Unicode Δ
  and the middle dot, Rule 34c). Both engine-printed from T-1 for the **live** ion pair, so the S10
  picker changes them; never hand-typed anywhere in any JSON.
- Under row R (`groups`), each line prints **once per group, prefixed by the group label** —
  `NaCl m.p. = 1074 K` / `MgO m.p. = 3125 K`. Fix the exact string here so the surgeon does not
  invent it: `"<label> m.p. = <n> K"` and `"<label> ΔH = <n> kJ·mol⁻¹"`. Group order follows the
  authored `groups` array order.
- Budget check: `ionic_bonding` S9 authors both lines across two groups = **four lines** in the fixed
  220 px HUD (min-width 190 px, `:53335`). Verify they fit at 1024 px and do not collide with the two
  `pmCreateAutoLabel` group labels — the HUD is a fixed box at every width, so **measure, do not
  reason about text length** (Desk-1 lesson).

### T-4 · Row R — `groups: [{id, label, at, units?, lattice, thermal, field}]`
- Two or more independently-placed sub-scenes in ONE state, each with its own `lattice` and optional
  `thermal`/`field` override.
- **Inheritance is the teaching, and it must be inheritance by construction, not by copy-paste:**
  a key absent from a group is inherited from scene level. `ionic_bonding` S8 authors the field ONCE
  at scene level so "the SAME field acts on both" is true structurally; S9 authors `thermal` ONCE at
  scene level so "one temperature, two crystals" is true structurally. Per-group override must exist
  (S8 needs per-group `thermal`) but must never be *required* for the shared quantity.
- Group labels via `pmCreateAutoLabel`, placed clear of the fixed 220 px right-anchored HUD.
- **Camera: the fit-solve must span the union of all groups' bounding boxes.** Never author `camera`.
- `check:bonding-scene` §14: heating a two-group scene past NaCl's `mp_K` leaves the MgO group's
  lattice **bit-for-bit unchanged** apart from jiggle.

---

## 3 · DISPATCH 3 — `layer_shift` + the D-7 `like_contacts` metric

`bug_class: field3d_bonding_scene_layer_shift_mode_and_like_contacts_metric_missing`.
Unblocks `ionic_bonding` S6 and `metallic_bonding` S5 — **the wave's one declared archetype-repeat
contrast pair** (`layer-shift-snap` ⇄ `layer-shift-hold`). Same motion, same readout, opposite
derived outcome. The metric is the entire point of the pair, so it gets built to the definition, not
to the expected number.

### L-1 · `shift: {at_ms, duration_ms, offset_sites, plane}`
- One half of the lattice, split on `plane`, slides `offset_sites` lattice positions over
  `duration_ms` from `at_ms`. Closed-form `mgRamp` (D-1).
- The `shift` slider shares the quantity ⇒ **drag-seize required**, same pattern as `separation`.
- The **outcome is DERIVED** (D-2): in `ionic_bonding` the halves separate because like charges now
  face each other; in `metallic_bonding` they do not. Nothing in either JSON authors "it splits" or
  "it holds" — the charges decide.

### L-2 · `like_contacts` — the definition, binding

Phase-0 D-7, quoted from the `ionic_bonding` skeleton §5.2 because it is already exactly right:

> `like_contacts(t)` = like-charge nearest-neighbour contacts **created by the shift** (a DELTA
> against the unshifted reference lattice at the same t) **and left unscreened** (a contact is
> screened when electron-sea density lies between the pair — so in a metal every contact, before and
> after, is screened).

Operationally:
- `naive(t)` = count of nearest-neighbour pairs (separation ≤ ~1.1 × nn distance) with same-sign
  charge. On unshifted rock salt `naive = 0`; **on a cation-only bcc metal `naive = 8` per interior
  site before anything moves** — the case where naive and intended disagree, and the reason a naive
  implementation passes a careless gate.
- `like_contacts(t) = unscreened(shifted, t) − unscreened(unshifted reference, t)`.
  Ionic (no sea): 0 → 6. Metal (sea screens all): 0 → 0.
- Displayed value = the derived count for the focal interface ion. HUD format: **`like contacts: 6`**.
- **Gate 8 must assert the DEFINITION on the disagreement case**: on the cation-only lattice the
  naive count is non-zero pre-shift while the shipped metric reads **0**. A gate that only checks
  "ionic reads 6" passes a naive implementation and is worthless.
- **Discipline (binding on the surgeon):** "0 → 6" is the Phase-0 *design expectation*, not a target.
  If the derived count is not 6, that is a **Phase-0 arc discrepancy — STOP and report it.** Do not
  tune the metric to print 6. No narration or annotation in either concept quotes the digit; the HUD
  carries it, so a different honest number is survivable and a tuned 6 is not.

---

## 4 · DISPATCH 4 — row Q `ions` + `drift` + `field_at_ms` + the conductivity readouts

`bug_class: field3d_bonding_scene_ion_drift_mode_and_field_cue_missing`.
Unblocks `ionic_bonding` S8, S10 and `metallic_bonding` S4, S7.

### Q-1 · `ions: {mobile, field}` (row Q) and `mode:'drift'`
- Applies a field bias to **ion units and lattice sites** — distinct from `sea` (row G), which biases
  free electrons for `metallic_bonding`. Both must exist; they are different carriers.
- Mobile ions (per T-2's `f_melt`, or `ions.mobile: true`) acquire a slow biased drift along the
  field: cations one way, anions the other. **Immobile ions must jiggle in place and never
  translate** — that is `ionic_bonding` S8's gate-13 negative control **and its pedagogy**, and
  S-2 is its prerequisite.
- Deterministic and closed-form in (field, T, site index, state-local t). No accumulator.

### Q-2 · `field_at_ms` — a new cue that does not exist today
- Turns the field on at a stated time so **the cause moves before the effect** (Rule 32a): arrows
  appear, a readable beat, then the carriers respond.
- **Destination-valued like every other scalar cue on this surface** — the Desk-1 rule, paid for by
  `hydrogen_bonding` S1 shipping a static state: *every `*_from`-less scalar cue key names the
  DESTINATION of a ramp from 0, never the entry value.* Author `field: 1` + `field_at_ms: 6000`.
- **Register `field_at_ms` as a frozen-pin candidate in `deriveStateMeta` in the SAME change** — the
  polarity E1c-8 lesson; a cue the pin deriver does not know about photographs the wrong instant.
- The `field` slider shares the quantity ⇒ drag-seize.

### Q-3 · HUD line `conductivity` — **the endpoint that could not be ratified**

`chemistry_author` (2026-08-03) ratified the molten endpoint and **declined to ratify a solid-NaCl
endpoint**: solid-state ionic conduction in NaCl is defect-mediated (Schottky-pair migration),
thermally activated, and heavily dependent on purity/doping, so quoted room-temperature values span
many orders of magnitude. There is no single defensible handbook digit.

Phase-0's `≈10¹³-fold` figure therefore **cannot ship as an asserted ratio** — the dispatch brief's own
rule is *"endpoints get units and temperatures or they don't ship"*, and this one does not.

**Decision (dispatching session): teach the gap by CONTRAST, not by an unratified ratio.** The line is
live and state-dependent:

| sample state | HUD prints |
|---|---|
| below `mp_K` (ions fixed) | `conductivity: none — ions fixed` |
| at/above `mp_K` (ions mobile) | `conductivity ≈ 3.5 S·cm⁻¹ (1100 K)` |

- `3.5 S·cm⁻¹ at 1100 K` for molten NaCl is **RATIFIED** (Janz-tradition molten-salt conductivity
  compilation; literature 3.4–3.6 S·cm⁻¹ just above the melting point).
- **Never print a solid-NaCl S·cm⁻¹ digit anywhere.** This is the one number `chemistry_author`
  flatly declined.
- This is strictly better pedagogy for S8 than a ratio: the state shows both samples side by side, so
  the gap **is** the contrast on screen, engine-printed from each group's own live state.
- ⚠ **Flagged to the founder**: this deviates from the dispatch brief's `≈10¹³-fold` line, under that
  same brief's endpoint clause. Reversible — if the founder wants the ratio, it is a data edit.

### Q-4 · HUD line `drift` (Session B's — lands here)
- Phase-0 `metallic_bonding` S4: *"a slow net drift appears"*, `v_d ~10⁻⁴ m/s`, cross-linking the
  shipped physics concept `drift_velocity`.
- Format: **`v_d ≈ 1 × 10⁻⁴ m·s⁻¹`**, real Unicode throughout (`≈ × ⁻⁴ ·`), value scaling with the
  live `field` control so the instrument tracks the physical change (Rule 33d).
- The order of magnitude is the teaching (it is the same "conduction is fast, carriers are slow"
  point `drift_velocity` makes). **Session B's `chemistry_author` ratifies the coefficient and the
  field-scaling before `metallic_bonding` authors against it** — until then the gate prints it with
  the ratify flag and asserts nothing.

### Q-5 · HUD line `atomisation` (Session B's — lands here) + a `BS_METALS` table
- Phase-0 `metallic_bonding` S6/S7: **ΔH_atomisation Na 107 · Mg 146 · Al 326 kJ·mol⁻¹** — monotonic
  with the number of free electrons per atom, and *it is bond strength*, which is why Phase-0 chose it
  over melting point for the metallic arc.
- Add `BS_METALS = { Na: {valence_e: 1, atomisation_kJ: 107}, Mg: {valence_e: 2, atomisation_kJ: 146},
  Al: {valence_e: 3, atomisation_kJ: 326} }` beside `BS_ION_PAIRS`, same shape, same gate treatment.
- Format: **`ΔH_at = 107 kJ·mol⁻¹`**, engine-printed for the live metal so the `metal` picker changes it.
- **RATIFY STATE: NOT RATIFIED.** These three digits are Phase-0's, and the ratification pass this
  dispatch ran covered the ionic table only. **Ship the rows behind the ratify flag** — the gate
  PRINTS table-vs-literature and **asserts nothing** until Session B's `chemistry_author` ratifies
  the convention (enthalpy of atomisation, M(s) → M(g), standard state, 298 K) and the three values.
  This is the E1 dipole-table pattern working exactly as designed: unratified data ships visible and
  inert, never silently asserted.

---

## 5 · Standing rules for every dispatch above

1. **Verify every claim in this document by grep before building on it.** The dispatching session
   verified P-1/P-2/P-3 and the seven cited line numbers in source; everything else here is design.
   Rule 40a: `git fetch origin && git log --all -S "<symbol>" --oneline` before adding any mechanism —
   the PCPL focal-glow fix and the parametric player clock were each built twice in one week.
2. **Closed-form only.** No accumulator, no replayed history, no `Math.random()`, no `Date.now()`.
   Every new mechanism is a pure function of (authored config, state-local ms, index). Under a
   `SET_TIME_FREEZE` pin the step count is forced to 1, so frozen baselines stay byte-identical **by
   construction** (Rule 36) — that property is not optional and not something to test for afterwards.
3. **Every new cue key is registered as a frozen-pin candidate in `deriveStateMeta` in the same
   change** (`field_at_ms`, `shift.at_ms`, and anything else introduced). The E1c-8 lesson.
4. **Every new scalar cue is DESTINATION-valued** unless it ships an explicit `*_from` partner.
5. **Every quantity that shares an id with a slider gets drag-seize**: re-seed on entry, per-frame
   sync until a trusted drag seizes. `shift`, `field`, `temperature`, `separation`, `ion_pair`,
   `metal`, `valence`.
6. **All new on-canvas text is real Unicode** (Δ ⁻¹ · ≈ × ⁻⁴ ²⁺ ²⁻), across all three text paths —
   DOM overlays, canvas `ctx.fillText`, and `createLabelSprite`/`createWideLabelSprite` sprite labels.
   A sweep of one path silently skips the others (Rule 34c).
7. **`pmCreateAutoLabel` only** for live text sprites. No backticks anywhere in renderer comments
   (they terminate the emitted template literal).
8. **No new numbers without a named convention and a ratify flag.** The gate prints table-vs-literature;
   it never asserts an unratified digit.
9. **`npm run check:renderer-syntax`** after every renderer edit (Rule 36c).
10. **File a scar row for each defect class fixed**, and add the corresponding permanent probe to
    `check:bonding-scene` — the scar list is the build-side moat, and a fix without a probe is a
    defect waiting to recur.

## 6 · Definition of done for the E3b desk

- `npx tsc --noEmit` 0 · `npm run check:renderer-syntax` PASS · `npm run validate:concepts` still
  PASS on the whole shipped fleet (this is platform work — it must not regress a single physics sim).
- `npm run check:bonding-scene` PASS with **§8 / §13 / §14 now real assertions, not declared stubs**,
  plus the new §1 layer-parity section (S-8).
- THE EYE re-run on at least one shipped `bonding_scene` concept to prove zero regression
  (`hydrogen_bonding` is unmerged, so use a merged one; `vsepr_molecular_shapes` or
  `sigma_pi_bonding`).
- Scar rows filed to `engine_bug_queue` for P-1, P-2, P-3 and the skeleton-certification class.
- PR opened against master. **Never merge to master from this desk** — Rule 17, shipping and merging
  stay founder-only.
