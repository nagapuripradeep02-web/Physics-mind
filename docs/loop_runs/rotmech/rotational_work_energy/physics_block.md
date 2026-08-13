# PHYSICS BLOCK — `rotational_work_energy` (rotmech · Class 11 Ch.7 · Phase-0b, Desk A)

> ## ⚖️ FOUNDER RULING 2026-08-14 — §2's reseed reading is **RATIFIED**. This block stands AS WRITTEN.
>
> §2 flagged reseed-vs-continue as physics_author's own interpretation and asked for a ruling.
> **The founder ruled RESEED:** each guided state reseeds ω₀ = +1.50 rad/s fresh; no state inherits
> the prior state's decayed ω. **No rework — `json_author` builds this block as it stands.**
>
> ### Four constraints that are easy to lose in the handoff. All binding.
>
> 1. **Numbers in narration are SPELLED OUT** — "minus zero point four zero", never "−0.40". The
>    digits rule in §4 was struck (see the correction banner there): it rested on a bug class that
>    exists nowhere in this repo, and the shipped sibling concept is 6-of-6 spelled, 0 digits.
>    **F-4 is unaffected and still binding** — S3 speaks the SIGNED torque, with the minus named.
>    On canvas the value stays symbolic/numeric with a true U+2212 (Rule 24); only the SPOKEN form
>    spells out.
> 2. **A value that is only COMPUTABLE is not coverage.** Anything absent from the skeleton's §4
>    instrument table is computed-not-spoken. The engine prints **−3.45** and **8.62** (16 ms grid
>    bias) — never −3.44 / 8.61, and S3's dwell never reaches 8.61.
> 3. **DoD (k): NO KE row in S3.** Adding one collapses `mirror-fall` into `accumulate-through-turn`
>    and evaporates the PRIMARY aha — and every automated gate still passes if you do it.
> 4. **The two removed beats stay removed.** S1's "bar fills to 3.44 J" (the KE bar writes
>    unconditionally from state entry, so it cannot be staged — the bar first appears in S2) and
>    S5's "slower replay" (no playback-rate lever exists on the rbr surface).
>
> **`W` and `θ` readout rows exist on master (E5) — author them.** The engine warns
> `[PM_RBR_TOKEN]` once per unknown token per state, so a **clean console is part of the gate**.

> Produced by `alex:physics_author` against **skeleton REVISION 3** (`skeleton.md`), after founder-proxy
> Checkpoint A returned `DESIGN_FIX` cycle 1 -> all findings applied -> cycle 2 (F-1..F-6 + the A-34/grid-cap
> declaration) -> hand-off, **no cycle 3**. Per the task brief, states/archetypes/arc are treated as
> SETTLED - nothing in the sections below redesigns a state; every table only adds the physics rigor the
> skeleton's own "ASSUMPTION - probe-before-authoring" flag on its own S3/S4 calls for.
>
> **Engine bug queue consulted before authoring** (`npx tsx --env-file=.env.local
> src/scripts/query_engine_bug_queue.ts ...`): `--owner alex:physics_author` (18 rows) ·
> `--owner alex:json_author` (165 rows, scanned for cross-cutting variable/formula classes) ·
> `--scenario rigid_body_rotation` (7 rows, all `alex:architect`-owned, all already satisfied by the
> skeleton's own design - see the note at the end of §6). Every `prevention_rule` relevant to this
> concept's variable/formula/narration surface is folded into §1/§4/§6 below; DUALPANEL_* rows are
> N/A (this is a single-canvas field_3d concept, no Panel B); `default_variables_only_first_var_merged`
> is N/A (that failure mode lives on the OLD PCPL/legacy runtime-generation path, not the field_3d
> `rigid_body_rotation` scenario) - documented per the spec's exception-handling requirement, not
> silently skipped.

---

## §0 - Verification: skeleton arithmetic re-derived independently (DoD (j), first obligation)

Every number below was recomputed from first principles (python3, closed-form kinematics of a
constant-torque angular decay: I = I_frame + 2mr^2, KE = 1/2 I omega^2, alpha = -tau/I,
omega(t)=omega0-(tau/I)t, theta(t)=omega0 t - 1/2 (tau/I) t^2, t_stop=omega0*I/tau, W=tau*theta),
independent of the skeleton's own figures, then compared.

| Quantity | Skeleton figure | Independently computed | Match |
|---|---|---|---|
| I = I_frame + 2mr^2 = 0.50+2(2.0)(0.80^2) | 3.06 kg.m^2 | 3.0600000... | OK exact |
| KE0 = 1/2 I omega0^2, omega0=1.50 | 3.44 J (3.4425 unrounded) | 3.442500... -> 3.44 | OK exact |
| alpha = -tau/I, tau=0.40 | -0.13 rad/s^2 | -0.13071895... -> -0.13 | OK exact |
| t_stop = omega0*I/tau | 11.48 s | 11.475000... -> 11.48 (2dp) | OK exact |
| half-speed KE, omega=0.75 | 0.86 J, "1/4 of 3.44" | 0.8606250... -> 0.86; 3.4425/4 = 0.860625 | OK exact - the half/quarter claim is EXACT, not approximate (KE is quadratic in omega, so halving omega exactly quarters KE for ANY I) |
| theta_stop (continuous form) | "board answer 8.61" | 8.606250... -> 8.61 (2dp) | OK exact |
| theta_stop as **rendered** by the engine | 8.62 rad (theta-bias) | not independently reproducible without the live renderer - accepted on Desk A's measured report | flagged, not re-measured this session |
| W_stop (continuous form) | -3.4425 -> board -3.44 | -3.442500... -> -3.44 | OK exact |
| W_stop as **rendered** by the engine | -3.45 J | not independently reproducible without the live renderer - accepted on Desk A's measured report | flagged, not re-measured this session |
| S2 chip match: dt from omega=1.50 to 0.75 at alpha=-0.1307 | "match ~ 6537 ms" (state-local, pad engaged ~800 ms) | dt=0.75/0.130719=5739 ms; +800 ms engage ~ **6539 ms** | OK within 2 ms - a slightly different assumed `engage_at_ms` (~798 vs 800 ms), not a physics disagreement |
| S6: alpha, tau=0.05 | -0.02 rad/s^2 (printed, 2dp) | -0.016340 -> -0.02 | OK exact |
| S6: t_stop, tau=0.05 | ~92 s / "91.8 s" | 91.800000... | OK exact |
| S6 @ t=30 s: theta | 37.65 rad | 37.647058... -> 37.65 | OK exact |
| S6 @ t=30 s: W | -1.88 J | -1.882352... -> -1.88 | OK exact |
| S6 @ t=30 s: KE | 1.560 J | 1.560147... -> 1.56 | OK exact |
| ke_bar home-pose fill, max_j=3.80 | "90.6%" | 3.4425/3.80=90.59% | OK exact |
| ke_bar home-pose fill, max_j=14.0 | "24.6%" | 3.4425/14.0=24.59% | OK exact |
| omega threshold where max_j=3.80 would peg (KE=3.80) | "omega >= 1.576" / "15 of 31" | omega=sqrt(2*3.80/3.06)=1.5760; reachable grid 0.0-3.0 step 0.1 -> {1.6,...,3.0} = 15 values | OK exact |
| dwell pegged at omega0=3.0, tau=0.05, max_j=3.80 | "87 s" | (3.0-1.576)/0.016340 = 87.15 s | OK exact |
| I*alpha check on S5's rendered rows | "3.06x(-0.13)~-0.40, matches printed tau" | 3.06*(-0.130719)=-0.39999... -> -0.40 | OK exact |

**Everything the skeleton asserts as a closed-form/continuous-physics number reproduces exactly.** The
two figures I could **not** independently reproduce are the two the skeleton itself already marks as
*rendered/measured, not derivable* - the theta-bias-inflated stop values (8.62 rad, -3.45 J) - because
they come from the fixed-16-ms-grid theta offset (~half of h*delta-omega ~ 0.012 rad) baked into the
live integrator, which this session did not re-run against the renderer (no dev server probe executed
this pass; the recomputation above is pure closed-form kinematics). **These two values are correctly
excluded from every quotable instrument per DoD (l) and are not used anywhere below** (the
`computed_outputs` block, the narration).

### Numbers I could not independently pin (flagged, not invented)

1. **Each state's exact live omega/theta/W at any instant beyond its own entry** depends on that
   state's authored total on-screen duration (a pacing/build-time choice, not a skeleton figure) - see
   the explicit design note below (the "reseed" reading) for how this is resolved.
2. **The exact ms of S2's chip match** depends on the exact authored `engage_at_ms`/`pad_travel_ms`
   (skeleton: ~6537 ms; mine, assuming a clean 800 ms travel: 6539 ms - a <=2 ms difference from a
   plausible ~798 ms travel, not a physics disagreement; json_author's exact `pad_travel_ms` decides
   the last couple of ms).
3. **§4's instrument table has no gap relative to the teaching need.** DoD (l)'s two
   COMPUTED-BY-THE-STUDENT values (theta=8.61 rad, W=-3.44 J at the full stop) are correctly excluded
   from every instrument, and I have deliberately excluded them from `computed_outputs` too for the
   identical reason - a computed_output whose symbol nothing paints is exactly the
   `computed_output_name_encodes_a_symbol_no_instrument_paints_so_every_reading_is_harvested_then_discarded`
   bug class this desk queried against.

---

## §1 — `physics_engine_config`

### `variables`

```json
{
  "variables": {
    "I_frame": {
      "name": "Fixed apparatus inertia (bare turntable, no masses)",
      "unit": "kg·m^2",
      "constant": 0.50
    },
    "m": {
      "name": "Mass of each of the two symmetric sliding masses on the rod — apparatus-fixed in this concept, no slider anywhere",
      "unit": "kg",
      "constant": 2.0
    },
    "r": {
      "name": "Distance of each mass from the axle — apparatus-fixed in this concept, no slider anywhere (moment-of-inertia dependence belongs to `moment_of_inertia`, not this concept — skeleton (i-3))",
      "unit": "m",
      "constant": 0.80
    },
    "I": {
      "name": "Total moment of inertia of the turntable + two masses — CONSTANT in every state of this concept (no param_ramp on r, no m/r slider anywhere)",
      "unit": "kg·m^2",
      "derived": "I_frame + 2*m*r^2"
    },
    "omega0": {
      "name": "Angular speed the wheel is spinning at when a state's clock begins (the seed value)",
      "unit": "rad/s",
      "min": 0, "max": 3.0, "default": 1.5, "step": 0.1
    },
    "omega": {
      "name": "Live angular speed — the engine's own derived quantity; documented here as the closed form this concept's decay follows while the brake is engaged and the wheel has not yet stopped",
      "unit": "rad/s",
      "derived": "omega0 - (tau_brake/I)*t"
    },
    "tau_brake": {
      "name": "Magnitude of the constant frictional brake torque opposing the spin — this concept's own characteristic guided value is 0.40 (forced by the 0.05-step slider grid, not taste — skeleton §3)",
      "unit": "N·m",
      "min": 0, "max": 2.0, "default": 0.40, "step": 0.05
    },
    "tau": {
      "name": "Net RESOLVED torque the wheel actually feels — reads exactly 0 once the wheel is at rest (rest clamp), never the authored schedule value",
      "unit": "N·m",
      "derived": "omega > 0 ? -tau_brake : 0"
    },
    "alpha": {
      "name": "Angular acceleration — the engine's own per-step finite difference of omega; equals the closed form below everywhere except the rest-clamp/engage edges (I is constant here, so no dI/dt term ever enters)",
      "unit": "rad/s^2",
      "derived": "omega > 0 ? -tau_brake / I : 0"
    },
    "theta": {
      "name": "Angle turned since the torque began acting in THIS state's own local clock (time-integrated — see the computed_outputs note below for why this is not expressed as a fixed-default formula)",
      "unit": "rad",
      "derived": "omega0*t - 0.5*(tau_brake/I)*t^2"
    },
    "KE": {
      "name": "Rotational kinetic energy — time-varying whenever the brake is engaged; equals 0.5*I*omega0^2 only at/near a state's own t=0",
      "unit": "J",
      "derived": "0.5*I*omega^2"
    },
    "W": {
      "name": "Signed work done on the wheel by the torque since THIS state's own run anchor (re-zeroes at every state entry — correct per-state ledger behaviour, not a bug)",
      "unit": "J",
      "derived": "tau*theta"
    }
  }
}
```

### `formulas`

```json
{
  "formulas": {
    "moment_of_inertia": "I = I_frame + 2*m*r^2 — CONSTANT throughout this concept: no state authors a param_ramp on r, and neither r nor m is ever exposed as a slider (skeleton (i-3)). I = 3.06 kg·m^2 in every single state, S1 through S6.",
    "angular_decay_under_constant_torque": "While the brake is engaged and the wheel has not yet stopped: omega(t) = omega0 - (tau_brake/I)*t and theta(t) = omega0*t - 0.5*(tau_brake/I)*t^2, t measured from the instant the brake engages in THAT state's own local clock. The rest clamp holds omega = theta_dot = 0 for all t >= t_stop = omega0*I/tau_brake.",
    "net_torque_and_alpha": "tau (the PRINTED row) = -tau_brake while omega>0, else exactly 0 (rest clamp — rbrTauOf resolves the NET torque the integrator is actually running, never the authored schedule value). alpha (the PRINTED row) is the engine's own per-step finite difference of omega; away from the t=0/engage/rest-clamp edges it equals the analytic -tau_brake/I exactly, because I is constant everywhere in this concept.",
    "rotational_kinetic_energy": "KE = 0.5*I*omega^2 = L^2/(2I) (numerically identical forms; this concept never displays L).",
    "work_torque_times_angle": "W = tau*theta, identically BY CONSTRUCTION inside the engine's own integrator (rbrGridWalk accumulates _th and _w from the SAME grid-walk operand, per Desk A's measured Checkpoint-A finding) — this identity never drifts at any pinned instant, for any reachable tau_brake. This is the concept's S3 payload and the one identity that is stronger than 'measured'.",
    "work_energy_theorem": "For constant I: W = delta(KE) = KE - KE0 over the SAME interval (the work-energy theorem for rotation) — verified on the real renderer to within one display quantum (<=0.01 J), EXCEPT at the exact full-stop frame, where a shared grid-quantization theta bias (~0.012 rad, half of h*delta-omega on the fixed 16 ms grid) pushes the printed W one quantum past the printed delta-KE for every tau_brake >~ 0.21 N.m (A-28 revised). No state may ever be pinned at the full stop — this is the concept's S4 payload and its one hard exclusion."
  }
}
```

### `computed_outputs`

**Deliberately limited to the three TIME-INVARIANT-WHILE-ENGAGED quantities.** `KE`, `theta`, `W` are
time-integrated and have no single default-scope value that stays true across a state's whole run —
declaring them here would either always assert a false-precision snapshot or spuriously SKIP/FAIL
depending on the exact pin instant THE CALCULATOR happens to harvest, which is exactly the
`computed_output_name_encodes_a_symbol_no_instrument_paints_so_every_reading_is_harvested_then_discarded`
bug class this desk queried against. `I`, `alpha`, `tau` are the one honest exception: while the brake
is continuously engaged from a state's own t=0 and the wheel has not yet stopped, they are constant for
the ENTIRE state, so a static default-scope formula is a legitimate, robust check regardless of the
exact pin ms.

```json
{
  "computed_outputs": {
    "I": { "formula": "I_frame + 2*m*r^2" },
    "alpha": { "formula": "-tau_brake / (I_frame + 2*m*r^2)" },
    "tau": { "formula": "-tau_brake" }
  }
}
```

**Per-state applicability** (uses §2's `variable_overrides` for `tau_brake`): `I` is asserted in every
state that shows the `I` row (S1, S5) — always true, apparatus-fixed. `alpha`/`tau` are asserted only in
states whose `alpha`/`tau` rows are shown AND whose brake has been continuously engaged from that
state's own t=0 (S5 for both; S3/S4 for `tau` alone, since neither shows an `alpha` row) — S1 is
excluded (no brake engaged, `tau_brake` override = 0, formula would correctly read 0 but S1 authors no
`tau`/`alpha` row to check it against anyway) and S2 is excluded (the brake engages ~800 ms INTO the
state, not from t=0, so a static "entry" scope does not describe the post-engage reading; S2 shows no
`tau`/`alpha` row regardless — §4).

### `constraints`

```json
{
  "constraints": [
    "I = I_frame + 2*m*r^2 = 3.06 kg·m^2 at every instant in every state — r and m never change (no slider, no ramp, anywhere in this concept).",
    "tau (printed) is the RESOLVED net torque, not the authored schedule value: it reads exactly 0.00 once omega = 0 (rest clamp), and -tau_brake at every instant before that.",
    "alpha (printed) is a finite difference of omega, not tau/I evaluated: stays correct at the rest clamp and at every engage edge; equals -tau_brake/I exactly away from those edges, because I is constant here.",
    "W is IDENTICALLY tau*theta by construction (never merely approximate) — checkable at ANY pinned instant, in every state that shows theta, tau and W together.",
    "W = delta(KE) over the same interval to within one display quantum, EXCEPT at the exact full-stop frame (A-28 revised) — no state may ever be pinned there.",
    "W is the SIGNED work integral and RE-ZEROES at every state's own run anchor (a fresh state entry = a fresh anchor) — correct per-state ledger behaviour, never narrated as one continuous run across states.",
    "tau_brake is reachable only in 0.05 N·m steps over [0, 2.0]; omega0 only in 0.1 rad/s steps over [0, 3.0] — a guided value outside these grids can never be reproduced by a teacher's slider.",
    "m, r and the drum radius have NO on-screen instrument anywhere in this concept and must never be spoken or quoted, in any state, in any language (DoD hard prohibition, restated for the physics layer)."
  ]
}
```

### Ground-truth numeric table (cross-check reference for json_author)

| Quantity | S1 (static, τ=0) | S3/S4/S5 entry (t=0, τ engaged) | Local full stop (11.475 s) — never pinned | S6 entry (t=0, τ=0.05) | S6 @ t=30 s |
|---|---|---|---|---|---|
| I (kg·m²) | 3.06 | 3.06 | 3.06 | 3.06 | 3.06 |
| ω (rad/s) | 1.50 | 1.50 | 0.00 (clamp) | 1.50 | 1.01 |
| KE (J) | 3.44 | 3.44 | 0.00 | 3.44 | 1.56 |
| θ (rad) | — (no row) | 0.00 | 8.61 (board) / 8.62 (rendered) | 0.00 | 37.65 |
| α (rad/s²) | — (no row) | −0.13 | 0.00 (clamp) | −0.02 | −0.02 |
| τ (N·m) | — (no row) | −0.40 | 0.00 (clamp) | −0.05 | −0.05 |
| W (J) | — (no row) | 0.00 | −3.44 (board) / −3.45 (rendered) | 0.00 | −1.88 |

---

## §2 — Per-state `variable_overrides`

**General rule (governs every guided state, stated once — the design interpretation this session
adopts):** each state's `rigid_body_rotation` config is a fresh, independently-seeded run — `omega0_rad_s`,
`theta0_rad` and `external_torque` are AUTHORED PER STATE, not literally carried forward as an
accumulating physics clock across a state boundary. This reading is supported by three independent
pieces of evidence: (a) S6 authors `tau_brake_Nm: 0.05` with a t=30s reference value computed from
ω₀=1.50 — i.e. S6 reseeds to the canonical home-pose ω₀ rather than continuing from wherever S5 left
off; (b) `theta0_rad` is documented as **implemented** (seeds theta per state) in the renderer, and S3's
own framing — "θ is exactly the angle turned while the torque acted [in S3]" — only makes sense if θ
starts at 0 at S3's own entry; (c) it removes an otherwise-uncomputable dependency on each state's exact
on-screen duration (a downstream TTS/pacing decision), which is NOT fixed by the skeleton. Under this
reading, S3/S4/S5's "same decay at the same rate" (skeleton §3) means the SAME apparatus replays the
SAME physical problem from its own t=0 each time (same ω₀, same τ, same I) — giving visual continuity
of RATE and POSE (pad already in contact, same camera, same rod) without requiring a fragile numeric
ω-handoff between states. **This is physics_author's interpretation, not a literal skeleton mandate —
flagged explicitly for json_author to confirm against the live renderer per DoD (j).** The alternative
reading (S3 continuing from wherever S2's clock froze) is internally consistent too, but was rejected
here because (i) it makes S4/S5's exact entry ω unknowable without first fixing S2's/S3's on-screen
duration, and (ii) a SHORTER continuing ω only shortens the local time-to-stop further, making the
pin-margin risk (below) worse, not better.

**Defensive lock, per the `hinge_force.json`/`field_forces.json` pattern (guards the historical
`default_variables_only_first_var_merged` failure class even though it is N/A on the field_3d path):**
every state declares `r: 0.80` and `m: 2.0` explicitly even though neither ever changes.

| State | `variable_overrides` | Justification |
|---|---|---|
| S1 | `{ m: 2.0, r: 0.80, omega0: 1.50, tau_brake: 0 }` | Home pose, no brake at all — pad parked off (`APPARATUS_CONTRACT.md` §1's canonical opening pose). |
| S2 | `{ m: 2.0, r: 0.80, omega0: 1.50, tau_brake: 0.40, engage_at_ms: ≈pad_travel_ms (≈800) }` | ω₀=1.50 at entry (pad travels in first — the only state that shows the travel); brake becomes effectively 0.40 only AFTER contact. THE CALCULATOR should treat `tau_brake` as 0 for an entry-scope check and SKIP a post-engage assertion here (no τ/α row is shown in S2 anyway — §4). |
| S3 | `{ m: 2.0, r: 0.80, omega0: 1.50, tau_brake: 0.40, engage_at_ms: 0, theta0_rad: 0 }` | Pad ALREADY in contact (no travel — Rule 32b: only the taught variable's motion changes); brake engaged from t=0 so θ is exactly the angle turned while the torque acted, per the skeleton's own framing. Fresh θ=0 — first state to show the row. |
| S4 | `{ m: 2.0, r: 0.80, omega0: 1.50, tau_brake: 0.40, engage_at_ms: 0, theta0_rad: 0 }` | Identical entry to S3 ("same machine, same brake, same run") — the readout SET differs (τ drops, KE+bar return), not the physics. Fresh θ=0 (S4 also shows the θ row). |
| S5 | `{ m: 2.0, r: 0.80, omega0: 1.50, tau_brake: 0.40, engage_at_ms: 0, theta0_rad: 0 }` | Identical entry again ("the same decay at the same rate as S3 and S4" — skeleton's own words); θ not displayed in S5 but still seeded at 0 for W's own internal accumulation. |
| S6 | `{ m: 2.0, r: 0.80, omega0: 1.50 (slider, teacher-adjustable), tau_brake: 0.05 (slider, teacher-adjustable), engage_at_ms: 0, theta0_rad: 0 }` | Fresh sandbox seed at the canonical home pose; pad pre-parked in contact at entry (the design-side workaround for A-2, per skeleton). Both sliders live, ring `core`. |

**Cross-check obligation for json_author (DoD (j)):** confirm via the Playwright probe that S3/S4/S5
each render ω (where shown), α, τ matching this table's "S3/S4/S5 entry" column at t≈0 of their OWN
state clock, and that **no state's authored pin/hold instant reaches or exceeds 11.475 s of that state's
own local clock** (§3 restates this per-state).

---

## §3 — Within-state motion timeline + per-state control spec (Rule 31)

**Glow-target glossary** (physics-verified against the live element list, `field_3d_renderer.ts:57626-57629`
— json_author binds these exact ids): `rbr_rod` · `rbr_brake_pad` · `rbr_drum` · `rbr_r_line` · HUD rows
via `hold_glow` (`I`,`omega`,`KE`,`theta`,`alpha`,`tau`,`W` — HUD emphasis is a SEPARATE channel from
`glow_focal`, per Addendum A / A-1: `glow_focal` resolves only against 3D scene meshes).

**One-shot-hold contract:** no state authors a `param_ramp` or `restart` block (skeleton §2/DoD (k)) —
the only in-state "motion" beyond the continuous spin/decay is S2's one-shot pad translate. Every other
state's entry is a single-frame pose (pad already in contact from t=0, per §2).

### S1 — "Spinning wheel stores energy" · core · no live controls · pin ≥ 4.8 s

Entry: r=0.80, m=2.0, ω₀=1.50, brake off, pad parked off-contact (§2).

| t-window | What animates | Driven by |
|---|---|---|
| 0 → open (whole state) | Rod + 2 masses spin continuously at ω=1.50 rad/s (~4.19 s/rev); `show_r_line: true` from frame 0, breaking the 2-fold symmetry so the turn is visibly countable | ω (constant this state) |
| 0 → ~1700 ms | `I` row builds in: "I = 3.06 kg·m²" | I (apparatus constant) |
| ~1700 → ~3200 ms | `ω` row builds in: "ω = 1.50 rad/s" | ω₀ |
| ~3200 → ~3900 ms | `KE` row builds in: "KE = 3.44 J" — **no `ke_bar` this state** (DoD (k)/§2 invariant: the bar is unconditional-from-entry and would sit static, contradicting the staged ledger) | KE = ½Iω₀² |
| ~3900 ms → pin (≥4800 ms) → open | HELD: all three rows steady; rod keeps its home pose | — |

Controls: **none**. Margin: content settles ~3.9 s, pin ≥4.8 s, ~0.9 s clear ✓. `glow_focal`: `rbr_rod`
(0 → first readout, "the thing that is turning") then none / `hold_glow:["KE"]` after KE lands, per
skeleton's Rule-32e phase table.

Suggested `readout_at_ms` (tune to final `text_en` timing per the reveal-sync rule — not hard-pinned):
`I: 1700, omega: 3200, KE: 3900`.

### S2 — "Half the speed, quarter the energy" · core · no live controls · pin ≥ 3.0 s (anywhere after 3.0 s)

Entry: r=0.80, m=2.0, ω₀=1.50, brake off, pad parked off-contact.

| t-window | What animates | Driven by |
|---|---|---|
| 0 → ~800 ms | `rbr_brake_pad` translates in toward `rbr_drum` (`pad_travel_ms`≈800); wheel spins freely at ω=1.50 the whole time (unengaged); `ke_bar` (max_j=3.80, **first appearance**) sits flat at its home-pose fill, 90.6% | pad translate (authored, cause-first — Rule 32a) |
| ~800 ms | Contact — `tau_brake_Nm: 0.40` engages | brake engagement |
| ~800 → ~12275 ms (local) | ω decays continuously: ω(t)=1.50−0.1307·(t−0.8)s; KE bar falls continuously from 90.6%; live `ω`,`KE` readouts update every frame | α=−τ/I |
| ~6539 ms | **Chip match**: live ω crosses 0.75 (`reference_marks` chip, surface `omega`, value 0.75, label "½ of 1.50") and live KE crosses ≈0.86 (chip, surface `KE`, value 0.8606, label "¼ of 3.44") — **both cross within the same 16 ms grid step**, so the two chips co-glow essentially simultaneously | ω,KE meeting the chips (`match_tolerance` default 0.01) |
| pin (recommend ≈7000 ms, any ≥3000 ms per skeleton) → open | HELD (Rule 26) at whatever ω/KE the pin lands on; chip highlights persist regardless of how far past the match | — |

Controls: **none**. Margin: chip match at 6539 ms, pin any ≥3000 ms — **the chips carry the numbers, the
pin need not land on the match** (skeleton's own words, confirmed: chip labels are static text, unaffected
by the live readout's later value). `glow_focal`: `rbr_brake_pad` (0→contact, "the cause, travelling")
then `rbr_drum` (contact→end, "where the torque acts"); `hold_glow:["omega","KE"]` whole state.

**No A-28 risk in S2** — S2 shows no `W`/`theta` row, so the full-stop quantum mismatch (which is
specifically a `W` vs `KE` ledger issue) does not apply here; S2 may safely run to or past its own local
full stop (12275 ms) without violating any invariant, since only `KE`/`ω` are shown and both correctly
read 0 there.

### S3 — "Work is torque times angle" · core · no live controls · pin inside the W=τθ window, < 11475 ms

Entry: r=0.80, m=2.0, ω₀=1.50 (reseed, §2), pad already in contact, `tau_brake_Nm: 0.40`,
`engage_at_ms: 0`, `theta0_rad: 0`. **No ω/KE row, no `ke_bar`, no KE chip — DoD (k) invariant.**

| t-window | What animates | Driven by |
|---|---|---|
| 0 → open (whole state) | Rod sweeps continuously from ω=1.50 decaying (`show_r_line: true`, breaking symmetry so the turn is countable); τ reads a flat **−0.40 N·m** for the entire state (well clear of the rest clamp — see the margin check below) | τ=−τ_brake (constant while engaged) |
| ~0 → ~600 ms | `τ` row builds in (first-named quantity per the DoD (b) term-introduction ledger); formula surface `W = τθ` appears | authored reveal, dual-labelled first mention ("turning effect, torque τ") |
| ~600 → ~2500 ms | `θ` and `W` rows build in together (both start accumulating from their own t=0 the instant they exist as rows — the underlying accumulator runs regardless of row visibility, so no value is "lost" by staging the reveal) | authored reveal |
| ~2500 ms → pin (recommend ≈8000–9000 ms) → open | HELD: θ and W keep climbing together in lockstep with the rod's sweep (**`accumulate-through-turn`** — the picture IS the two counters climbing) | θ,W continue integrating |

**Build note (cosmetic, not a defect):** `RBR_RO_META`'s fixed declaration order places `θ` ABOVE `τ`
in the panel regardless of authoring/reveal order (F-3). Because DoD (b)'s ledger names τ as S3's FIRST
sentence, revealing τ (~600 ms) before θ (~2500 ms) leaves a ~1.9 s window where the panel shows an
empty slot above a filled one. This is acceptable, not a defect — but if THE EYE reads it poorly,
json_author's fallback is to reveal θ and τ SIMULTANEOUSLY at ~600 ms instead; physics is unaffected
either way.

Controls: **none**. **Pin-margin cross-check (this session's addition to the skeleton's own table):**
this state's local full stop is 11475 ms (identical to the canonical decay, since it reseeds ω₀=1.50 with
τ=0.40 engaged from t=0 — §2). The pin (and the state's total authored on-screen duration) MUST stay
strictly below 11475 ms, with margin — **recommend ≤10500 ms** — both to satisfy "dwell ends well before
the 11.48 s stop" (skeleton, Block 1) and to keep clear of any rounding-boundary ambiguity near the stop.
`glow_focal`: `rbr_r_line` (whole state) + `hold_glow:["W"]` — "the pointer that makes the angle
countable."

### S4 — "The work is the energy lost" · core (PRIMARY AHA) · no live controls · pin ≥ 5.0 s, NOT at the full stop, < 11475 ms

Entry: r=0.80, m=2.0, ω₀=1.50 (reseed, §2), pad already in contact, `tau_brake_Nm: 0.40`,
`engage_at_ms: 0`, `theta0_rad: 0`. `ke_bar.max_j: 3.80` (deliberate copy of S2's — Rule 32d).

| t-window | What animates | Driven by |
|---|---|---|
| 0 → ~400 ms | `KE`, `θ`, `W` rows and the `ke_bar` all "return" together (already-taught quantities being reunited, not freshly introduced — a single combined reveal rather than a slow stage) | authored reveal |
| ~400 ms → pin (recommend ≈7000–8000 ms) → open | **`mirror-fall`**: as W grows more negative, KE (row + bar) falls by the same amount, beat for beat — same decay as S3, same τ=−0.40 the whole time | τ,θ,W,KE all continuing from t=0 |

Controls: **none**. **A-28 cross-check:** pin MUST NOT land at or after 11475 ms (local full stop),
where the printed ledger is off by one quantum (W=−3.45 vs ΔKE=3.44) on 36 of 40 reachable τ, including
the authored 0.40. Recommend pin ≈7500 ms — clears the full stop by ≈4 s, comfortably inside the
skeleton's own "≥5.0 s, NOT at full stop" cell. `glow_focal`: `rbr_brake_pad` (whole state, "the agent
doing the work") + `hold_glow:["KE","W"]` — "the two mirrored rows."

### S5 — "Where the rule comes from" · advanced · no live controls · pin ≥ 6.0 s, < 11475 ms

Entry: r=0.80, m=2.0, ω₀=1.50 (reseed, §2), pad already in contact, `tau_brake_Nm: 0.40`,
`engage_at_ms: 0`, `theta0_rad: 0`. Readouts `I, ω, KE, α, τ, W` (RBR_RO_META order, matches the
sibling readout table's six-row set exactly — F-1). No θ row (dropped at this transition, per
skeleton's own transition table).

| t-window | What animates | Driven by |
|---|---|---|
| 0 → open (whole state) | Same decay, same rate as S3/S4 — `I`,`ω`,`KE` visible from t=0 (already-familiar quantities) | continuing t=0 decay |
| ~0 → ~800 ms | `formula_lines` line 1 appears: "W = ∫τ dθ" | authored reveal |
| ~1500 → ~2000 ms | `α` and `τ` rows appear TOGETHER, timed to land exactly as `formula_lines` line 2 appears: "τ = Iα, dθ = ω dt" — the α row landing exactly on the τ=Iα line (skeleton's explicit requirement) | authored reveal, synced |
| ~3500 → ~4000 ms | `W` row appears, timed to `formula_lines` line 3: "W = ∫Iω dω = Δ(½Iω²)" — the closing line points at the live `KE` row | authored reveal, synced |
| ~4000 ms → pin (≥6000 ms) → open | HELD: full equation on screen; I×α = 3.06×(−0.13) ≈ −0.40 checkable against the live τ row (§0 verified this arithmetic exactly) | — |

Controls: **none**. Margin: assembly completes ~4.0 s, pin ≥6.0 s (skeleton's own figure), replay window
to ~8.0 s — all comfortably clear of the 11475 ms local stop (≥3.5 s margin even at the latest pin).
`glow_focal`: `rbr_rod` (whole state) + `hold_glow:["W","KE"]`.

### S6 — "Try it yourself" · explore · ALL, ring-gated · open/continuous (Rule 37 — never auto-freezes)

Entry: r=0.80, m=2.0, ω₀=1.50 (slider default), pad already in contact at entry (the A-2 workaround),
`tau_brake_Nm: 0.05`, `engage_at_ms: 0`, `theta0_rad: 0`. `ke_bar.max_j: 14.0` (F-2, option (a) — never
pegs across the full slider range; see skeleton's own derivation, independently verified in §0).

| Behaviour | What animates | Driven by |
|---|---|---|
| From entry, continuous (no `idle_auto_sweep` needed — the decay itself is already live motion, unlike a sandbox with nothing initially changing) | Rod decays continuously from ω=1.50 under τ=0.05; θ, W climb; KE/bar fall; local stop at 91.8 s (verified §0) | continuing decay |
| `tau_brake` drag (live) | τ takes the new value; **BLOCKED on A-32** until the anchor fix lands — a drag currently re-zeroes W while θ keeps counting (declared, not routed around, per the task's standing rule) | tau_brake |
| `omega0` drag (live) | Re-anchors the run; W correctly re-zeroes (this one IS correct behaviour — a fresh seed legitimately starts a fresh work ledger) | omega0 |
| — | A-34 (pad visually stays in contact after a τ→0 drag though the wheel keeps spinning) and the 320 s θ/W grid-cap freeze are DECLARED ride-alongs on the τ→0 path only — not routed around, per the task's explicit instruction | — |

Controls: **ALL, ring-gated** — `tau_brake` (core, [0,2.0] N·m, step 0.05, default 0.05 at entry) ·
`omega0` (core, [0,3.0] rad/s, step 0.1, default 1.50). `r` and `m` deliberately **not** exposed (skeleton
(i-3) — no guided state teaches the I-dependence of KE). No narration (0/open, Rule 37).

---

## §4 — Narration (`text_en`) per state — suggested draft, ready for json_author

> ## ⛔ CORRECTION — the digits rule below is STRUCK. Spell numbers out. (Desk A, 2026-08-13)
>
> **The cited bug class does not exist.** `tts_spelled_out_numerals_render_verbatim_in_the_reader_facing_subtitle_strip`
> appears **nowhere in this repository** — not in `engine_bug_queue` seeds, not in
> `_engine/scar_candidates_0c3.sql`, not in any doc. A repo-wide grep returns exactly one hit: this
> file. It was cited as a FIXED bug and used to justify inverting the fleet convention.
>
> **The fleet convention is spelled-out, measured not assumed.** In the shipped, founder-reviewed
> sibling `conservation_of_angular_momentum.json`: **33 `text_en` sentences, 6 carrying numbers,
> 6 spelled out, 0 using digits** — "one point five oh to six point nine five", "three point four
> four joules", "zero point seven five". That concept's narration was audited against the pixels
> last session and its numbers were corrected, so it is current, not legacy.
>
> **`json_author`: spell the numbers out.** Convert every digit value in §4 below to its spoken
> form, preserving the sign — S3's `−0.40 N·m` becomes "minus zero point four zero newton metres".
> **The F-4 requirement is unaffected and still binding**: S3 must speak the DISPLAYED value with
> the minus, never a bare "0.40". Everything else in §4 (word bands, symbol expansion, dialect
> dual-label, the two anchors) stands as written.
>
> *Recorded because a fabricated citation that survives into `json_author` becomes narration, then
> becomes a rendered TTS clip — the same propagate-through-metadata shape that cost this desk two
> unsupported numbers last session.*

All within the skeleton's per-state word bands; every spoken number matches the skeleton's own §4
instrument table exactly; ~~numerals written as **digits** (not spelled-out words) per the FIXED bug
`tts_spelled_out_numerals_render_verbatim_in_the_reader_facing_subtitle_strip` — bulbul v3 pronounces
digits natively.~~ **STRUCK — see the correction above; spell numerals out.** Symbols expanded to spoken names on first use (Rule 30); "wheel" throughout, never
"drum" (dialect, skeleton (i-7)); no idioms/personification (Rule 41). **json_author may adjust wording,
but must preserve: every digit value + its sign, the F-4 sign explanation in S3, the dialect dual-label
in S3, the two required anchors (S2, S4), and each state's word band.**

**S1** (45 words): "Two masses set how hard this rod is to spin — the moment of inertia, I: 3.06
kilogram metre squared. It turns at 1.50 radians per second, angular speed omega, though its centre never
moves. The meter reads rotational kinetic energy: 3.44 joules, though nothing travels."

**S2** (54 words, PRIMARY anchor folded in — skeleton §10, ~8 words): "Like a bicycle wheel slowed by
squeezing its brake, watch the pad press against the wheel's rim. As it slows, the energy bar empties
much faster than the speed drops. Speed omega falls toward half, 0.75 radians per second — the kinetic
energy KE falls to a quarter, 0.86 joules. Energy depends on speed squared."

**S3** (49 words — carries the F-4 fix, Checkpoint A cycle 2): "The brake still presses on the
wheel's rim — its turning effect, the torque tau, keeps the wheel slowing. Two counters run together:
the angle turned, theta, and the work done, W, torque times angle. The torque meter reads −0.40 N·m,
meaning the brake is removing energy from the wheel." *(F-4: quotes the DISPLAYED −0.40, true minus,
never bare "0.40"; names the sign's meaning explicitly, per founder-proxy's own wording. Dialect (i-7):
"turning effect (torque tau)" dual-labelled once, bare "torque"/"tau" after.)*

**S4** (50 words, PRIMARY AHA + SECONDARY anchor folded in — skeleton §10, ~8 words): "The energy meter
and the bar return, beside the work counter that never stopped running. As the work counter grows more
negative, the energy bar falls by the same amount — like a potter's wheel slowed by a hand pressed to
its rim. The brake's work is the wheel's lost energy." *(No number spoken — the skeleton's own §4
instrument table makes this optional here, and it is the SAFEST choice: it avoids any proximity to the
full-stop-quantum risk entirely by never quoting a KE/W value at all.)*

**S5** (55 words, one permitted counterfactual — DoD (d)): "This rule comes from adding up work as the
wheel turns. Torque equals I times alpha — check it against the live rows on screen. Carrying the turn
through gives the change in one half I omega squared, the rotational work-energy rule. A torque that
speeds the wheel up does positive work and adds energy." *(The one counterfactual clause DoD (d)
permits, spoken here only, attached to no instrument reading, absent from every caption/label.)*

**S6**: 0 words (explore, Rule 37).

---

## §5 — Drill-down cluster phrasings (30 phrases, 6 clusters × 5 — skeleton §7)

**`why_angle_not_time`** (S3): "why angle and not time" · "does it matter how long the brake pushes or
just how far it turns" · "why not use seconds for work instead of the angle" · "the brake pushes for the
whole time so why does only the angle count" · "why is time not part of the work formula"

**`negative_work_sign`** (S3): "why is the work negative" · "does negative work mean less work was done"
· "what does the minus sign on W actually mean" · "is negative work even real work" · "why isnt the work
just zero if the wheel is slowing down"

**`torque_times_angle_is_joules`** (S3): "how does newton metre times radian give joules" · "why does the
radian not show up as a unit" · "torque times angle looks nothing like force times distance" · "where did
the joules come from if theta has no unit" · "is N·m the same as a joule or not"

**`where_does_the_lost_energy_go`** (S4): "where does the energy actually go" · "does the energy just
disappear" · "is the lost kinetic energy turned into heat" · "why does the wheel get warm when it slows
down" · "if energy is conserved where did the 3.44 joules end up"

**`rotational_work_energy_theorem`** (S4): "is this the same work energy theorem as before but for
spinning things" · "why does work done equal the change in kinetic energy" · "does the work energy
theorem work for rotation the same way it does for straight line motion" · "so W equals delta KE always,
even here" · "how is this rule different from the one for a block sliding on a table"

**`energy_falls_faster_than_speed`** (S4): "why does the energy meter fall faster than the speed drops" ·
"the wheel has only slowed a little so why has it lost so much energy" · "does energy always fall faster
than speed" · "why dont energy and speed drop at the same rate" · "if speed drops slowly why does the bar
empty so fast"

---

## §6 — Constraint callouts

1. **Units are fixed and fleet-wide, SI throughout.** θ in radians, α in rad/s², τ in N·m, W in J, all
   2 dp — this is the field_3d/`rigid_body_rotation` dialect natively; **no `radians()` conversion is
   ever needed** (that helper belongs to PCPL expressions only, per the `pcpl_radians_helper_missing`
   scar — N/A here, but confirmed not to apply so json_author doesn't reach for it by habit).
2. **τ prints the RESOLVED net torque, never the authored schedule value** — it reads exactly 0.00 once
   ω=0 (rest clamp). No narration may assert a nonzero τ once the wheel has visibly stopped; every guided
   state's pin/duration is kept clear of the local full stop specifically to avoid this (§3, per state).
3. **α is a finite difference of ω, not a τ/I formula evaluation** — stays correct at the rest clamp and
   at every engage edge; numerically equals −τ_brake/I away from those edges because I never varies in
   this concept (constraint block, §1).
4. **S3 invariant (DoD (k)): NEVER author a KE row, `ke_bar`, KE chip, or the word "energy" tied to a
   quantitative KE claim in S3's caption or formula surface.** Confirmed in §3's table above — S3 shows
   only θ, τ, W.
5. **m, r, drum radius: never spoken or quoted, in any state, in any language** — restated from the
   skeleton's own DoD hard prohibition; no `RBR_RO_META` row exists for any of them.
6. **Chip label length ≤14 characters (A-30)** — "½ of 1.50" and "¼ of 3.44" are both 9 characters,
   verified under the budget.
7. **Slider step discipline (S6 only):** `tau_brake` reachable only in 0.05 N·m multiples over [0,2.0];
   `omega0` only in 0.1 rad/s multiples over [0,3.0] — every number in §0/§1's tables sits on these
   grids.
8. **Notation ladder (Rule 38c) — confirmed compliant.** Every formula surface on a core-ring state
   (S1–S4, S6) is algebra-only: `KE=½Iω²`, `KE∝ω²`, `W=τθ`, `W=ΔKE`. The one calculus form
   (`W=∫τ dθ → τ=Iα, dθ=ω dt → W=∫Iω dω=Δ(½Iω²)`) is correctly confined to S5 (advanced ring) and
   appears nowhere else. **No calculus form needed to be flagged for the founder — the physics genuinely
   fits algebra-only on every core/extended-ring state as designed.**
9. **Dialect (Rule 38d) — confirmed applied.** "Wheel" throughout, never "drum" (my own first S2 draft
   used "drum" and was corrected during this session — flagged here so json_author's own pass doesn't
   reintroduce it). "Turning effect (torque τ)" dual-labelled once at S3's first mention, then bare
   τ/"torque" (§4).
10. **Pin-margin / A-28 cross-check (this session's independently-verified addition).** With the §2
    reseed reading, S3/S4/S5 each share the SAME local full stop at **11475 ms** (ω₀=1.50, τ=0.40, I=3.06
    — verified exactly in §0). Every one of these three states' authored pin AND total on-screen duration
    must stay strictly below that, with margin (**recommend ≤10500 ms** for S3, **~7500 ms** for S4 to
    clear the A-28 quantum risk by a wide margin, and S5's own ≥6000/≤8000 s window is already safely
    clear). This is a CONFIRMATION of the skeleton's own pin-margin table (§3), not a new requirement —
    but it is the first time the exact 11475 ms boundary has been computed and cross-checked against it.
11. **Engine bug queue rows already satisfied by the skeleton's own design** (no physics_author action
    needed, confirmed by cross-reading `--scenario rigid_body_rotation`'s 7 rows, all `alex:architect`-owned
    against the sibling `conservation_of_angular_momentum`): no `param_ramp` is authored anywhere
    (closes `authored_beat_ends_by_undoing_the_state_own_claim`); the brake pad is a rendered, visible
    object in every state that claims it presses/removes energy (closes `teach_visual_must_match_narration`);
    S2's chips are authored as the `chip` surface form with an explicit `match_tolerance`, never a `tick`
    on a value-only readout (closes `named_primitive_declared_without_the_surface_that_can_render_it`);
    the KE bar's fill percentage is the real, live-driven number in every state that shows it (closes
    `derivation_principle_applied_to_one_beat_but_not_its_sibling`'s "real number must drive the pixels"
    clause); I=3.06 is not an independently-authored lumped constant — it derives from the SAME
    apparatus geometry (`I_frame`, `m`, `r`) pinned by `APPARATUS_CONTRACT.md` §1, so no
    `authored_lumped_constant_inconsistent_with_the_drawn_apparatus_geometry` risk exists.
12. **`nlb_signed_bar_half_range_breaks_equal_value_pairing_with_an_unsigned_bar` — N/A.** This concept
    never pairs an unsigned energy bar against a SIGNED work bar on the same track (`ke_bar` is the only
    bar this concept ever authors, and it is always unsigned/energy — W is a plain readout row, never a
    bar). Documented per the spec's exception-handling requirement rather than silently skipped.
13. **`default_variables_only_first_var_merged` — N/A.** That failure class is specific to the OLD
    PCPL/legacy runtime-generation default-merge path (`friction_static_kinetic`, `field_forces`, etc.),
    not the field_3d `rigid_body_rotation` scenario, which reads its per-state config directly off
    `field_3d_config.states[].rigid_body_rotation` — no `default_variables` merge step is in this
    concept's serving path. Documented, not silently skipped.

---

**DC Pandey check:** every formula, narration line, anchor and drill-down phrase above is derived
directly from Newton's second law for rotation, W=τθ and KE=½Iω² — no teaching sequence, worked example,
or figure imported from any book. The two real-world anchors (bicycle wheel + brake, potter's wheel + a
warmed hand) are authored fresh, universal, and culture-neutral (Rule 35), matching the skeleton's own
§10.

*Physics block complete for `rotational_work_energy` (skeleton REVISION 3, no cycle 3). Handoff to
`alex:json_author` is NOT executed this session per the task brief — this file is the artifact for a
later session to consume. First build obligations for that session, in order: (1) DoD (j)'s Playwright
probe — confirm the §2 reseed reading against the live renderer (or correct it) before trusting any
θ/W/ω figure beyond a state's own t=0; (2) verify the 11475 ms pin-margin cross-check (§3/§6-10) against
the actual authored `pad_travel_ms`/pin instants once chosen; (3) verify S3's τ-before-θ reveal-order gap
(§3, S3 build note) reads acceptably under THE EYE, or fall back to a simultaneous reveal.*
