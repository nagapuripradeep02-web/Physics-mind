# Desk B — SEAM R engine findings

Desk B is the nominated SEAM R finding owner (`rotmech_b_state.md` guardrail 6): no other
desk files an `nlb` finding. **This desk never dispatches an engine fix.** Desk E is the sole
engine owner; these rows are the handoff.

**Provenance is stamped per finding and the two kinds do not mix.** B-1/B-2 were verified by
direct code read in this worktree at `src/lib/renderers/field_3d_renderer.ts` (post-`eb8fd43`,
the landed SEAM R tree), with no runtime evidence. **B-3 through B-7 were verified by RUNTIME**
(THE EYE, 2026-08-05) with no code read. Where they disagree, the runtime wins: **B-3 refutes
B-1's blast-radius claim that `rolling_on_incline` is unaffected.** Read B-1 with that
correction applied.

---

## ✅ Finding B-1 — **FIXED by E2, verified on pixels 2026-08-06.** Close it.
> Post-merge `pure_rolling` S7 reads `v = 1.33 · Rω = 1.33 · contact = 0.00 · f_k = 0.00` —
> capture, at exactly `v₀/(1+k) = 2.0/1.5`. The original code-read analysis below was correct.
> **Note its "blast radius" claim was NOT** — see the refutation box under B-3; E2 fixed the flat
> track and left `rolling_on_incline` byte-identical. Kept below as the diagnostic record.

## Finding B-1 (original, as filed) — the rolling branch has no KINEMATIC gate, so a flat-track slip-to-roll capture cannot be expressed

**Status:** OPEN · **Severity:** MAJOR (blocks union item **(c)-3**, the item its own skeleton
calls "the (c) centerpiece") · **Owner:** `peter_parker:field3d_surgeon` · **Filed:** 2026-08-04
by Desk B during `pure_rolling` authoring · **Verified by code read, not by runtime.**

### What the design bought

`pure_rolling` union item **(c)-3**: *"Slip-to-roll CAPTURE — closed-form in state-local t
(t_c = v₀k/(μ_k g(1+k))), never a per-frame latch. Plus the A1 branch-priority rule."*
Consumers: STATE_7 (the whole state) and STATE_8's advanced-ring ω₀/μ_k sliders.

STATE_7 launches a wheel on the **flat** track (`theta_deg: 0`) at v₀ = 2.0 m/s with
`omega0_rad_s: 0`. Kinetic friction should slow `v` while spinning `ω` **up**, the two
converging at t_c = 1361 ms, after which the rolling branch takes over with an honest
`f 0.00 N`. The engine's own comment states this intent verbatim (`:46859-46861`):

> *"which is what makes a wheel launched with no spin get spun UP by a friction that is
> simultaneously slowing it down."*

### What the engine actually does

The rolling branch's priority gate (`:46828-46840`):

```js
var kRoll = nlbShapeK(b), rollHeld = false;
if (b.rolling && !b.rotation_locked && !nlbHeldNow) {
    var aRoll = drive / (b.m * (1 + kRoll));
    var fRoll = -kRoll * b.m * aRoll;
    var canRoll = (Math.abs(fRoll) <= maxStat + 1e-12) && !boundPin;
    if (canRoll && !(stuck && Math.abs(b.v) < NLB_STOP_EPS_V && Math.abs(aRoll) < 1e-12)) {
        rollHeld = true; stuck = false; a = aRoll; f = fRoll;
    }
}
```

`canRoll` is a **dynamic availability** test — "is the friction rolling demands available?" It
is the correct and complete test **on an incline**, where `drive = mg sin θ ≠ 0` makes it the
genuine physical gate `μ_s ≥ μ_min = (k/(1+k))·|tan θ|`, exactly as the header comment at
`:46820-46825` derives.

**On flat ground `drive` is identically 0**, so `aRoll = 0` and `fRoll = 0` on every frame
**regardless of the body's actual (v, ω)**. `canRoll` degenerates to `0 <= maxStat`, true for
any `μ_s ≥ 0`. `stuck` requires `|v| < NLB_STOP_EPS_V` (`:46795`), so a launched wheel is not
stuck and the second guard passes too. **`rollHeld` is therefore true on frame 1, for a body
whose contact is demonstrably sliding.** There is no test anywhere in this branch for whether
the kinematic rolling condition `v = ωR` is actually satisfied.

The consequences follow mechanically:

- `a = aRoll = 0` and `f = fRoll = 0` — `v` never decelerates, and `f` reads a **dishonest
  `0.00 N` while the contact speed is 2.0 m/s**.
- `:46852` — `if (!b._spinIndep) b.omega = b.v / R;` is **skipped**, because authoring
  `omega0_rad_s` sets `_spinIndep` (`nlbSpinIndependent`, `:40025-40029`). `ω` is left to
  `nlbRollSpin`'s closed-form segment (`:40117-40131`), whose `alpha` is only ever set nonzero
  inside the kinetic branch — never reached. The lazily-created default segment carries
  `alpha = 0`, so **ω stays frozen at its authored seed forever**.
- `:46844` — the capture re-anchor `if (b._slipping) { … }` never fires, because `_slipping` is
  only set true inside the kinetic branch (`:46874-46877`), which `rollHeld` pre-empted.

Net: a wheel authored per the design glides at constant v with its spin frozen. **No
deceleration, no spin-up, no capture, and an incoherent readout pair (`contact 2.00` beside
`f 0.00`).**

### The alternative authoring is also insufficient

Omitting `rolling` and keeping `omega0_rad_s` routes the body to the kinetic branch. Half of it
works: `vRef = v − ωR` (`:46863`) is gated on `b.rolling || b._spinIndep`, so the friction is
correctly **contact-relative** and `v` decelerates honestly. But the angular half —
`alphaSlip = -f/(k·m·R)` and its `nlbRollSeg` anchor (`:46867-46883`) — is gated on `b.rolling`
alone, now false. **ω still never integrates.** `Romega` reads a flat 0.00 and there is no
convergence to capture.

**Neither available authoring produces the taught picture.** The two gates disagree about what
`rolling` means: `:46863` treats `_spinIndep` as sufficient to have an independent spin, while
`:46867` requires `rolling`.

### Suggested fix (for Desk E / the surgeon — NOT built here)

Two independent changes, either of which alone is insufficient:

1. **Add the kinematic precondition to `rollHeld`** (`:46834`): require the contact to be
   already at rest before adopting the rolling branch, e.g.
   `Math.abs(b.v - nlbOmegaOf(b) * nlbRadiusM(b)) < NLB_STOP_EPS_V`, so a genuine v–ω mismatch
   falls through to the kinetic branch and reaches the existing `_slipping` / `nlbRollSeg`
   capture machinery — which is correct and already written.
2. **Gate the angular-acceleration sub-block on `_spinIndep`, not `rolling`** (`:46867`), to
   match the sign convention already chosen one line earlier at `:46863`.

On an incline both changes are inert: bodies are released from rest with ω₀ = v₀/R = 0, so the
kinematic condition holds from frame 1 and the existing path is unchanged.

### Blast radius

> **⚠ THIS BLAST-RADIUS SECTION IS REFUTED BY FINDING B-3 (runtime, 2026-08-05).**
> `rolling_on_incline` is NOT unaffected — its bodies do not move at all. The code reasoning
> below may still be right about the flat-track branch, but "the incline is the intended
> working direction" is empirically false. **A fix that only adds the kinematic precondition
> will not revive either concept.** Read B-3 first.

- **`rolling_on_incline` (the sibling, this desk): none.** Every one of its rolling states runs
  on `theta_deg ≠ 0` with `drive = mg sin θ ≠ 0`, where `canRoll` is the genuine physical gate
  the branch was derived for, and its bodies are released from rest (v = ω = 0, condition
  satisfied). Its S7 slipping state is a μ_s `param_ramp` that drives `canRoll` **false** — the
  intended, working direction through the same gate.
- **Back-compat: none.** Every pre-SEAM-R body has `rolling` falsy and takes the identical
  two-branch path.
- **Scoped to flat-track capture only:** `pure_rolling` STATE_7, and STATE_8's advanced-ring
  `omega0`/`mu_k` sliders (the ring-gated demo the physics block §A explicitly anticipates).

### What Desk B authored, and why

`pure_rolling.json` STATE_7 and STATE_8 author **`rolling: true` per the design**, not a
workaround. Reasoning: both available options are wrong, so there is no quality to be bought by
deviating — and a workaround that half-works would let the defect ship **silently** (a
decelerating wheel passes THE EYE's motion heuristic), whereas the spec-correct authoring fails
**loudly** (frozen ω, incoherent readouts) and will be caught at the visual gate. Authoring to
spec also means zero re-authoring once the engine is fixed.

**STATE_7 and STATE_8's mismatch demo are therefore BLOCKED, not done.** They must not be
sealed at Checkpoint B until this row is fixed and the states are re-walked.

---

## B-1 — RUNTIME CONFIRMATION (2026-08-05, second EYE run), plus a sharper lead

The first EYE run's "confirmation" of B-1 was **confounded by B-8** — the wheel was hitting the
wall at ~300 ms, so nothing could be concluded about a capture authored at 1361 ms. With s0
corrected the wheel has 5.4 m of runway, and **B-1 is now cleanly confirmed on the pixels:**

| t (ms) | v | Rω | contact | f_k |
|---|---|---|---|---|
| 0 | 2.00 | 0.00 | 2.00 | **0.00 N** |
| 1000 | 2.00 | 0.00 | 2.00 | **0.00 N** |
| 2000 | 2.00 | 0.00 | 2.00 | **0.00 N** |
| frozen (H2 pin) | 2.00 | 0.00 | 2.00 | **0.00 N** |
| 3000 | 0.00 | 0.00 | 0.00 | 0.00 N |

`f_k` never leaves 0.00 N despite `mu_k: 0.05` being authored, so ω never rises, v never decays,
and the capture at 1361 ms cannot occur. This is exactly the code-read prediction. The `v` drop
at ~2700 ms is the wheel reaching the far wall after 5.4 m at 2.0 m/s — **an artefact, and one a
reader could easily mistake for "capture worked."** It did not.

### New lead — a legal authored ZERO, resolved by truthiness

STATE_7 authors **`omega0_rad_s: 0`** — a legal falsy value. The eye-walker flagged this as
matching an already-OPEN scar row, `optional_config_field_with_a_legal_zero_value_is_resolved_by_truthiness`
(`peter_parker:field3d_surgeon`). **This desk's own state file records the same hazard class as
SEAM R fact #2: *"Presence is `typeof`, never truthiness — `lane_gap_m = 0`, `activate_at_ms = 0`
and `visible_before_activation: false` are all legal falsy values."***

If `omega0_rad_s: 0` is being swallowed by a falsy check, `_spinIndep` would not be set, which
would change which branch the body takes — a different mechanism from the missing kinematic gate
B-1 describes by code read. **These may be two defects or one; this desk cannot tell from pixels.**
Offered as a lead, not a diagnosis. Whoever fixes B-1 should check the zero-handling first,
because it is cheap to check and would otherwise survive the kinematic-gate fix.

---

## ✅ Finding B-2 — **FIXED by E3, verified on pixels 2026-08-06.** Close it — but read B-10.
> `pure_rolling` S1 now renders `R = 0.25 m` (it previously had NO control at all);
> `rolling_on_incline` S8 renders all six rows including `R` and `R₂`. Both initialise from the
> body's authored `radius_m`. **However this finding's own suggested fix warned that the write
> must ALSO re-space the revolution marks "or S1 gets a dial that moves nothing" — that half did
> not land, and the result is worse than nothing: see B-10.**

## Finding B-2 (original, as filed) — union item (b)-8 half-landed: `controls_visible` tokens `R`, `R2`, `omega0` are DECLARED but never wired, and are dropped in silence

**Status:** OPEN · **Severity:** MAJOR (kills the only live control on `pure_rolling` STATE_1,
half of its STATE_8 sandbox, and a physics-block-mandated control on `rolling_on_incline`
STATE_4) · **Owner:** `peter_parker:field3d_surgeon` — the code is the `newtons_laws_body`
slider block **inside `field_3d_renderer.ts`**, so it is field3d-surgeon's region, NOT
pcpl-surgeon's (the 2026-07-31 rename table puts `parametric`/`particle_field`/PCPL with
pcpl-surgeon; `field_3d_renderer.ts` is field3d-surgeon's) · **Filed:** 2026-08-04 by Desk B
during `rolling_on_incline` authoring · **Verified by code read, not by runtime.**

### What the design bought

Union item **(b)-8** — "`controls_visible` token `R`" — consumers `pure_rolling` S1 and S8.
SEAM R widened the token enum accordingly; the interface comment at `:1545-1546` reads:
*"SEAM R adds 'R' / 'R2' (the two radius dials) and 'omega0' (starting spin — the control that
makes a v-ω mismatch teacher-drivable)"*, and the enum at `:1547-1548` carries all ten tokens.

`pure_rolling`'s physics block §F.4 explicitly anticipated the pre-SEAM-R absence and told
json_author **not** to mistake it for a design gap, because (b)-8 would land it.

### What the engine actually does

**The declaration landed; the wiring did not.** `NLB_SLIDER_TOKENS` (`:42637`) is still the
eight pre-SEAM-R tokens:

```js
var NLB_SLIDER_TOKENS = ["m", "m2", "F", "F_ang", "theta", "mu_s", "mu_k", "v0"];
```

`NLB_SLIDER_SPEC` (`:42638-42653`) — the per-token row spec (DOM ids, min/max/step/default,
glyph, unit) — has matching keys for exactly those eight. There is **no `R`, `R2` or `omega0`
entry**. `nlbSliderTokensUsed` (`:42683-42693`) builds the panel from the union of every
state's `controls_visible`, filtered through `if (NLB_SLIDER_SPEC[cv[c]]) want[cv[c]] = true;`
— **a token absent from the spec is silently dropped: no row, no disabled row, no console
warning, no gate failure.** `nlbApplyParam` and `nlbSliderValueFromEngine` (the write/read
dispatchers) likewise carry branches for only those eight. (`omega0` does exist at `:49999` /
`:50075`, but that is the UNRELATED `rigid_body_rotation` turntable scenario's own control and
is unreachable from `newtons_laws_body`.)

This is the same silent-skip failure shape as the turntable's `RBR_RO_META` hazard recorded in
`APPARATUS_CONTRACT.md` §1: a concept authored against a missing row passes Zod, passes
`validate:concepts`, seeds, renders, and can be sealed with the control simply absent.

### Blast radius

- **`pure_rolling`**: STATE_1's `controls_visible: ["R"]` is its ONLY control — the state ships
  with **no live control at all**, and the whole authored "R drag re-lifts, re-scales and
  respaces the marks + bracket live" mechanism (union (c)-1's live-respace consumer) is
  unreachable. STATE_8's `["v0","R","omega0","mu_k"]` silently reduces to `v0` + `mu_k` — the
  two core-ring dials the reduced preset depends on (v₀, R) lose one, and the advanced-ring
  ω₀ mismatch demo loses its control. Note ω₀'s demo is **also** blocked by Finding B-1; these
  are two independent defects on the same beat.
- **`rolling_on_incline`**: the physics block's control-spec table mandates a live `R₂` on S4
  ("Live controls: m₂, R₂") — inert. S8's radius dials are inert.
- **Back-compat: none.** No pre-SEAM-R concept authors these tokens.

### Suggested fix (for Desk E / the surgeon — NOT built here)

Add `R`, `R2`, `omega0` entries to `NLB_SLIDER_SPEC` and `NLB_SLIDER_TOKENS`, and matching
branches to `nlbApplyParam` / `nlbSliderValueFromEngine` writing `bA.radius_m` / `bB.radius_m` /
the first slider body's `omega0_rad_s`, mirroring the existing `m`/`m2` pattern
(`nlbSliderBodies()` = the first two non-ghost/non-fixed bodies). A radius write must also
re-lift and re-scale the mesh and re-space the revolution marks, which is (c)-1's live-respace
requirement — the two items land together or S1 gets a dial that moves nothing.

**Separately, harden the silent skip:** `nlbSliderTokensUsed`'s `if (NLB_SLIDER_SPEC[...])`
filter should warn on an unknown token rather than drop it. This defect was invisible for
exactly as long as it was silent.

### What Desk B authored, and why

**Both concepts declare the tokens the design bought**, and neither works around the gap:
`pure_rolling` S1 `["R"]` and S8 `["v0","R","omega0","mu_k"]`; `rolling_on_incline` S4
`["m2","R2"]` and S8 `["m","m2","R","R2","theta","mu_s"]`. Declaring a dropped token is inert
(clean filter, no throw), so there is no runtime cost to fidelity — and it means the pair needs
**zero re-authoring** when the wiring lands. The alternative (omitting them) would have made
the JSON silently diverge from an approved design with nothing in the file to say why, and
would have left the two siblings inconsistent with each other.

**`pure_rolling` STATE_1's live-radius beat, both STATE_8 sandboxes' radius dials, and
`rolling_on_incline` STATE_4's live-radius re-verify are BLOCKED, not done.**

### One thing this finding does NOT cover

`controls_visible` has **no `'shape'` token at any layer** — not in the enum, not in the spec.
`rolling_on_incline` S8's design calls for a core-ring shape control. Unlike `R`/`R2`/`omega0`
this was never bought by any union item, so it is a **design-vs-engine scope gap, not a
half-landed build**. Nothing is authored for it (inventing a token the interface does not
declare would be a fabrication, not fidelity). S8 keeps the four canonical shapes fixed per
lane in the apparatus contract's order. Consequence, stated plainly: with no shape control and
no live radius, and with live mass binding by array INDEX to the first two non-ghost bodies
(sphere + disc, never the ring), the skeleton's own DoD teacher-walk example §10(j)(2) — "pit a
marble against a huge ring" — **is not achievable on the shipped engine by any authoring
choice.** That needs a chapter-level decision, not a desk workaround.

---

## ⚠ B-3 CORRECTED 2026-08-05 (second EYE run) — READ THIS BOX BEFORE THE FINDING BELOW

**As originally filed, B-3 was HALF WRONG, and the wrong half was Desk B's own fault.**

B-3 claimed a `rolling: true` body never integrates *on any mode, on any track*, citing both
concepts. The flat-track half of that evidence was an **authoring defect in `pure_rolling`, not
an engine defect** — see **B-8**. `surface.length_m` is the track's HALF-length, so bounds are
±3 m; every body authored `initial_position_m: 2.4` while travelling in **+s**, leaving 0.6 m of
runway. The bodies were hitting the wall and being bound-arrested within ~1 s. That is precisely
the "velocity collapses to 0.00 within one second" signature B-3 reported as engine behaviour.

**After fixing s0 to −2.4, `pure_rolling` moves correctly on 6 of its 8 states** (S1, S2, S4, S5,
S6, S8 — distinct frame hash at every timestamp, including all 11 frames of the S8 sandbox over
10 s). The velocity collapse is gone. The aha state now reads `contact = 0.00` matching its own
caption, and STATE_1's revolution marks fire.

**`rolling_on_incline` was NOT changed** (its s0 was already correct — gravity drives −s, giving
5.4 m of runway) **and is byte-identical to the previous run: still completely dead.**

**So B-3 is REAL but its scope is much narrower than filed**, and its discriminator is NOT the
`rolling` flag alone — `pure_rolling` S1/S2/S4/S6/S8 are all `rolling: true` and now work.
The corrected statement of the defect, with sharpened evidence, is in **B-3 (revised)** below.

**Method note, recorded deliberately:** the original B-3 was built on a real, reproducible,
MD5-verified observation and was still wrong about the cause, because two different failures
produced the same signature and the desk had no negative control separating them. The fix for
this is not "trust the pixels less" — it is to always ask what ELSE produces this signature.

---

## 🔴 Finding B-3 (revised) — a `rolling: true` body's computed motion never reaches its persistent state, so it never moves on the incline

> **POST-MERGE STATUS 2026-08-06: STILL OPEN, STILL CRITICAL, AND NOW ISOLATED.** E2 did not
> touch it. `rolling_on_incline` is **byte-identical to its pre-merge frames** (S1 `f9a8b277`,
> S2 `e8987880`/`e72f7764`, S5 `8604265d`/`5e0bcce9`, S8 one hash `272d2ccb` across the whole
> 10 s sandbox) while the same engine change made flat-track capture work on the sibling. That
> is the cleanest separation of B-1 from B-3 obtainable, and it means **B-3 needs its own
> dispatch — it has no engine owner.** This is the single biggest thing standing between Ch.7
> and a sealed rolling concept.

**Status:** OPEN · **Severity:** **CRITICAL** (both of this desk's concepts are non-functional;
every rolling state in the chapter is affected) · **Owner:** `peter_parker:field3d_surgeon` ·
**Filed:** 2026-08-05 by Desk B from THE EYE run · **Verified by RUNTIME, not by code read** —
the opposite provenance to B-1/B-2, and the reason it supersedes B-1's blast-radius claim.

### Provenance — how this was established

Frame dumps: `.visual_runs/pure_rolling/20260805-014219/` and
`.visual_runs/rolling_on_incline/20260805-015952/`. Both eye-walked, then the headline claim
re-verified in the main session by MD5 over the dumped PNGs (a mechanical check, not a reading).

### The evidence

**1 — Byte-identical frames across a full capture window.** `rolling_on_incline` STATE_8 is the
explore sandbox, which Rule 37 guarantees runs CONTINUOUSLY:

```
4ff923ec6a0b613670471a683b094ef2  STATE_8__dense_t00000.png
4ff923ec6a0b613670471a683b094ef2  STATE_8__dense_t05000.png
4ff923ec6a0b613670471a683b094ef2  STATE_8__dense_t10000.png
4ff923ec6a0b613670471a683b094ef2  STATE_8__frozen.png
```

One hash across 10.5 s. Not "slow", not "imperceptible" — **identical bytes**.

**2 — STATE_1's race never departs.** `t0 = t1000 = t3000 = t4000` (hash `f9a8b27…`), with only
`t2000` differing (`6557f67…`) and then *reverting to the exact t0 hash*. That is a
`glow_focal` window opening and closing over a scene that never moves.

**3 — The negative control passes.** STATE_7 (`param_ramp` on `mu_s`) produces a DIFFERENT hash
at every timestamp. The capture harness sees change perfectly well when there is any.

**4 — The discriminator, and why this was invisible until today:**

| concept | bodies | `rolling: true` | behaviour |
|---|---|---|---|
| `rolling_friction` (approved) | 10 | **0** | moves; H2 matches approved baselines 0.22–0.38% |
| `work_done_by_constant_force` (approved) | 7 | **0** | moves; H2 **0.00%** on all 12 |
| `pure_rolling` (this desk) | 9 | **6** | **ALIVE after the B-8 s0 fix** — 6/8 states move correctly |
| `rolling_on_incline` (this desk) | 17 | **16** | dead |

**⚠ This table is retained as filed, but its conclusion is CORRECTED.** The original reading —
"perfect correlation with the flag" — was an artefact of B-8: `pure_rolling` looked dead for an
unrelated authoring reason. The flag alone is NOT the discriminator; `pure_rolling` S1/S2/S4/S6/S8
are all `rolling: true` and now work. What still holds, and matters: **no approved concept in the
fleet sets `rolling: true`**, so the H2 regression baselines were structurally incapable of
catching anything on this path, and the regression pair passing clean (re-verified this run:
`rolling_friction` 0.22–0.38%, `work_done_by_constant_force` 0.00–0.07%) is **not** evidence of
engine health for rolling bodies.

**The live discriminator is now: flat + launched with v₀ > 0 works; incline + released from rest
does not.** Whether that is about θ, about the `incline_slide` mode, or about a body whose
motion must START from zero, this desk cannot say from pixels.

### SHARPENED EVIDENCE (2026-08-05 second run) — what the surgeon should actually chase

The second eye-walk gathered discriminating evidence. **The force model and the branch-switch
logic are CORRECT. The defect is downstream of them, in the step that carries computed motion
into the body's persistent `v`/`ω`/position state.**

**The forces and transitions are right, to the decimal:**

- **S6 (held → released at `activate_at_ms: 2500`)** — before: `a = 0.00, f_s = 4.14 N`, and
  4.14 N is exactly `mg sin 25° = 1 × 9.8 × 0.4226`. After: `a = −2.76, f = 1.38 N`, and 2.76 is
  exactly `g sin θ/(1+k)` for a disc (k = 0.5), 1.38 exactly `k·m·a`. **The release fires on
  schedule with the correct magnitudes — and the mesh is pixel-identical before and after.**
- **S7 (μ_s `param_ramp` 0.50 → 0.05)** — the slider visibly interpolates, and the readouts cross
  correctly at μ_min: `f_k` drops to 0.44 N ≈ `μ_k·N = 0.05 × 9.8 × cos 25°`. **The branch
  switch fires correctly — ~~and the mesh is pixel-identical throughout~~ SEE CORRECTION.**

> **⚠ CORRECTION 2026-08-06, Desk B against its own record.** *"S7's mesh is pixel-identical
> throughout"* **was WRONG.** It came from the first eye-walk and this desk filed it without
> independently checking. Re-measured: S7's dense hashes are five DISTINCT values **pre**-merge
> (`17904384 e2af4a82 508469b5 1188eb23 1188eb23`) and five post-merge
> (`48e1c0bd 393e86f1 e98942c6 98515330 98515330`). **S7's ring moves — before E2 and after it.**
> Its skid trail lengthens frame to frame and `contact` climbs 0.03 → 2.65 → 2.97 m/s before
> halt-latching at the scripted 1968 ms.
>
> **This SHARPENS the diagnosis rather than weakening it.** S7 is the one state whose body
> *leaves* the rolling branch (its μ_s ramp drives it into kinetic slip) — and the moment it
> does, it integrates correctly. Combined with S3's `rotation_locked` block, that gives **two
> independent bodies that move the instant they are NOT on the `rollHeld` branch**, on the same
> track, in the same frames as bodies that never move.

**The positive control, in the same frame, at the same instant:**

- **S3 carries a `rotation_locked` (NOT `rolling`) block beside a `rolling` disc.** The block's
  `contact` readout climbs 0.09 → 2.88 → 4.18 m/s, tracking `a = g(sin θ − μ_k cos θ) = 2.809`
  almost exactly. **The pre-existing non-rolling kinetic path integrates position and velocity
  correctly on the same track, in the same state, at the same time.** Only the `rolling` disc
  beside it stays frozen at `contact = 0.00`.

**The corroborating signature:** readout tokens that read from integrated body state
(`v`, `ω`, `Rω`, `contact`, `KE_trans`, `KE_rot`) are frozen at their seed for the entire state
on every incline body — S2's `v`/`Rω` at 0.00 despite its label asserting 3.32, S5's KE pair at
0.00 J despite labels asserting 7.0/2.8 and 4.9/4.9 J, all four S8 bodies at 0.00 over 10.5 s.
Meanwhile `a`/`f`/slip-`contact` in S6/S7 — which appear to come from closed-form expressions
rather than from `b.v` — move correctly. **The split falls exactly along "reads from persistent
state" vs "computed from a formula."**

### THE BOUNDARY, as sharp as this desk can make it (post-merge, 2026-08-06)

**It is NOT "incline rolling bodies never move." It is: the `rollHeld` / `contactRest` branch's
output never reaches persistent state. The kinetic-sliding branch's does — always, on the same
track, in the same frame.**

Three bodies establish it, two of them moving:

| body | branch | integrates? |
|---|---|---|
| S3 `block_locked` (`rotation_locked`, never rolling) | kinetic from entry | ✅ `contact` 0.09 → 4.18, tracks `a = g(sinθ − μ_k cosθ) = 2.809` |
| S7 `ring_s7` **after** its μ_s ramp drives it out of the rolling branch | kinetic, reached live | ✅ skid trail lengthens, `contact` 0.03 → 2.97, halt-latches at 1968 ms |
| every other body (S1 ×4, S2, S3 disc, S4 ×2, S5 ×2, S6, S8 ×4) | `rollHeld` for its whole life | ❌ `v`/`ω`/`Rω`/`contact`/`KE` pinned at 0.00 forever |

**E2's `contactRest` gate is being satisfied, not blocking them.** Confirmed by the force value:
S3's rolling disc reads `f = 1.38 N = k·m·a = 0.5 × 1 × 2.7607` — the **rolling** closed form, not
`μ_k·N = 1.33 N` (which is the *other* body's number in the same frame; the two are close enough
to conflate, and were checked apart). So the bodies ARE admitted to the rolling branch and its
formulas evaluate correctly. **Whatever writes `a`/`f` back into `b.v` / `b.omega` / position is
missing or short-circuited inside the `rollHeld === true` path specifically.**

That is the dispatch. It is a write-back defect on one branch, not a force-model or gate defect.

### A hypothesis that was TESTED AND REFUTED — do not re-derive it

Desk B proposed that the bodies are held STUCK by static friction (all incline bodies are
released from rest, and on S3 `maxStat ≈ 7.99 N` exceeds the drive of `4.14 N`, so the `stuck`
test at `:46795` looked like a plausible culprit). **The frames refute it:** S6's release fires
correctly on schedule and S7's μ_s ramp drives the body *out* of the static regime with correct
post-slip numbers — and neither moves. Excess static friction is not what is holding them.
Recorded so no desk spends the same hour on it.

### Why this SUPERSEDES B-1's blast radius

B-1 states *"`rolling_on_incline` (the sibling, this desk): **none**"* — reasoning that on an
incline `drive = mg sin θ ≠ 0`, so `canRoll` is the genuine physical gate and the branch works.
**The pixels refute that.** On the incline `aRoll = drive/(m(1+k))` is nonzero and the bodies
should visibly accelerate; they do not move at all. Whatever B-1's kinematic-gate defect is, it
is **not the whole story**, and the "incline is the intended working direction" scoping is
wrong. B-1's code analysis may still be correct about the flat-track branch — but its
conclusion that the incline path is healthy is empirically false.

**B-1 must not be closed by a fix that only adds the kinematic precondition.** That fix, alone,
would leave every incline rolling state exactly as dead as it is now.

### Root cause NOT asserted

This desk read the pixels, not the integrator. The correlation isolates the flag; it does not
identify the line. Desk E's surgeon owns the diagnosis. One suggested starting point, offered
as a hypothesis and nothing more: `pure_rolling`'s `coast_*` bodies show `v` *collapsing* from a
correct authored launch value to a dead `0.00` within ~1 s, while `rolling_on_incline`'s bodies
never leave `0.00` at all — consistent with a single defect in how the rolling branch's `a`
reaches position integration, rather than two separate ones. **Do not build to that guess.**

### Consequence for this desk (CORRECTED 2026-08-05)

- **`rolling_on_incline`: entirely non-functional.** Not one of its 8 states renders its physics.
  Nothing to seal, nothing to baseline, until B-3 lands.
- **`pure_rolling`: 6 of 8 states now work** after the B-8 fix (S1, S2, S4, S5, S6, S8). It is
  blocked on **S3 (B-5, zero bodies render)** and **S7 (B-1, capture never occurs)**, plus the
  B-2 slider rows on S1/S8. Still not sealable — but it is a working sim with two broken states,
  not a dead one.

---

## Finding B-4 — THE EYE passed 35/35 on a fully static simulation (gate blind spot)

**Status:** OPEN · **Severity:** MAJOR (tooling; a scar-list candidate per CLAUDE.md §2) ·
**Owner:** routing decision for Desk E — the code is `src/lib/validators/visual/*`, a Rule-40
PLATFORM surface, so it lands on master separately, never inside a chapter branch ·
**Filed:** 2026-08-05 by Desk B.

Both dead concepts scored **35 deterministic checks · 35 passed · 0 failed**. The gate reported
a clean bill of health on a simulation whose bodies never move. Mechanism:

- **D5 was SKIPPED on every state of every concept** — *"motion expectation unknown for
  STATE_N"*. This is the check that would have caught it. Note it is skipped on the APPROVED
  `rolling_friction` too, so the gap is pre-existing to the `newtons_laws_body` scenario and was
  not introduced by SEAM R.
- **D6/D7 were satisfied by non-body pixels.** Caption text, `glow_focal` windows and live HUD
  digits produce enough frame delta to clear both thresholds. D7 in particular only fires on a
  frozen tail *"after earlier motion"* — a scene that never moved at all has no "earlier
  motion" to fall from, so it passes by construction.

The eye-walkers caught what the machine missed, on both concepts, which is the pipeline working
as designed (§5 ③: "the eye is the gate the machine cannot replace"). But the machine's verdict
was actively misleading, and a desk in a hurry would have read 35/35 and moved on.

**Suggested check (for whoever owns the fix):** assert that at least one *body mesh* changes
position between two samples ≥2 s apart, independently of overlay/HUD pixels — and make D5's
"motion expectation unknown" a WARN rather than a silent pass.

---

## Finding B-5 — `pure_rolling` STATE_3 renders ZERO bodies while its HUD prints readouts for two

**Status:** OPEN · **Severity:** MAJOR · **Owner:** `peter_parker:field3d_surgeon` ·
**Filed:** 2026-08-05 by Desk B · **Verified by runtime** (frame read in the main session, not
only by the eye-walker).

`STATE_3__dense_t02000.png`: the track is empty. No wheel mesh renders in any frame of the
state — `panel_a`, every `dense_t*`, or the frozen H2 pin — while the HUD faithfully prints
`locked wheel = 1 kg / f_k = 0.00 N / contact = 0.00 m/s` and `rolling wheel = 1 kg / f_k = 0.00
N / contact = 2.00 m/s`. This is the concept's two-body skid-vs-roll comparison state; its
entire teaching visual is absent.

Note this is **the same gate blind spot as B-4** from the other direction: live HUD text was
sufficient to pass the motion checks on a canvas containing no bodies at all.

### ⚠ HYPOTHESIS TESTED AND CORRECTED 2026-08-06 — read this before the section below

The narrowing below named *"two bodies with custom ids under `single_lane`, where every working
state is a single body with id `wheel`"*. **Tested read-only across all 74 `newtons_laws_body`
states in the fleet. Half of it was wrong, and the wrong half would have sent the surgeon after
id resolution.**

**REFUTED — "custom ids" is not the discriminator.** *Every* multi-body nlb state in the fleet
uses custom ids; not one uses `wheel`:

```
block_on_incline S4 [A|B] · connected_bodies S1-S7 [A|B|A_ghost|P|Q] · free_body_diagram S1,S3
[A|G1|G2|G3] · friction_force S4 [A|B] · newton_second_law S2,S3 · newton_third_law S1-S5 [A|B|W]
· normal_force S4 · rolling_friction S1-S5 [A|B] · tension_force S1-S6 [A|B|P|Q|R] ·
work_done_by_constant_force S5 [crate_a|crate_b] · rolling_on_incline S1,S4,S5,S8
```

**`rolling_friction` S1–S5 are two custom-id bodies and are APPROVED with passing H2 baselines.**
Verified on pixels this session: its S1 renders both meshes (blue block + red wheel), each with
its own force arrows. My "every working state is single-body `wheel`" was true only *within*
`pure_rolling` — I over-scoped it to the fleet.

**CONFIRMED AND SHARPENED — `single_lane: true` is the discriminator.** Exactly **2 of 74**
states in the fleet set it, and both are this desk's:

| state | bodies | renders? |
|---|---|---|
| `pure_rolling` S3 | `nlb_wheel_locked` \| `nlb_wheel_roll` | **zero meshes** |
| `rolling_on_incline` S3 | `block_locked` \| `disc_s3` | **zero meshes** |
| all 35 other multi-body states (`single_lane` absent) | custom ids | render correctly |

**2 of 2 fail; 35 of 35 without the flag render.**

**A second correction, against my own record.** This file previously called `rolling_on_incline`
S3 *"the sharpest positive control — the locked block dragging a skid mark"*. **Wrong.** Cropped
and upscaled 5× this session: at t0 and at the frozen pin the incline carries a moving pink force
arrow and the θ label, **and no body mesh at all**. What moves is the position-derived arrow, not
the block. Both `single_lane` states show the identical signature — physics ✅, position ✅,
position-derived overlays ✅, **mesh ❌**. (The genuine positive control is `rolling_friction` S1,
a different concept.)

### Does the mesh path resolve by id, or by lane index? **Neither — by authored activation instant.**

```js
function nlbRetireMs(eng, b) {                 // :40176
    if (!eng || !eng.single_lane || !b) return Infinity;   // <-- the whole story
    ... return the next authored activation AFTER this body's own
}
function nlbBodyLive(eng, b, tMs) {            // :40188
    return t >= nlbActivateMs(b) && t < nlbRetireMs(eng, b);
}
```

**Without `single_lane`, `retireMs` is `Infinity` for every body**, so `nlbBodyLive` collapses to
`t >= activateMs` — permanently true for any body with no `activate_at_ms`. **Setting
`single_lane: true` is the ONLY way `retireMs` can become finite, and therefore the only way a
body can ever stop being live.** That is exactly why the defect is confined to those two states,
and it is why id resolution and lane offsets are the wrong places to look.

**But retirement alone does NOT explain it, and the surgeon must not stop there.** Worked for
`pure_rolling` S3: `nlb_wheel_locked` has no `activate_at_ms` (⇒ 0) and retires at the sibling's
1500; `nlb_wheel_roll` activates at 1500 and never retires. So the gate says **locked is live on
`[0, 1500)` and roll is live on `[1500, ∞)`** — every instant is covered by exactly one body.
Yet the cropped frames show a **bare plank at t=0 and t=2000**, where the gate says locked and
roll respectively should be drawn. **Something in the `single_lane` path suppresses the mesh even
when `nlbBodyLive` returns true.**

One coincidence worth handing over: the frozen pin sits at **exactly 1500** (B-9's flat default),
which is precisely the handover instant — `t < retireMs` is false for locked at exactly 1500 and
`t >= activateMs` is true for roll at exactly 1500. A boundary-exact handover is worth checking
for an off-by-one, but it cannot be the whole defect, because t=0 and t=2000 are also empty.

**Dispatch scope:** `single_lane` retirement/visibility, not id resolution, not lane offsets.
This also means the cross-reference below to `nlb_lane_offsets_apply_to_declared_bodies_not_co_present_ones`
is probably a **false lead** — lane offsets are not involved in either failing state (both author
`lane_gap_m: 0`).

### MECHANISM NARROWED (post-merge re-walk, 2026-08-06) — superseded in part by the box above

**Unaffected by E1–E5.** Still zero bodies at every timestamp including the frozen pin.

**The load-bearing observation: `nlb_wheel_locked` carries NO `activate_at_ms` at all** and must
be visible from state entry — and it is absent at t=0 too. That **rules out activation gating**
as the explanation. (`nlb_wheel_roll` does carry `activate_at_ms: 1500`, so on its own it would
have been the obvious suspect.)

**What DOES work in this state, precisely:**
- **Physics integrates correctly.** `locked wheel` reads `f_k = 1.96 N` / `contact = 1.97 m/s` at
  t0, decaying to 0.02 by t1000 and pinned at 0.00 after — exactly `μ_k·g = 0.2 × 9.8 = 1.96
  m/s²`, and matching the authored `skid_glow` window closing at 1020 ms.
- **A position-derived overlay renders.** The skid-trail line appears on the bare plank from
  ~t1000 and lengthens — it is keyed to `nlb_wheel_locked`'s position and draws correctly **even
  though that body's own mesh never does.**
- The plank/track renders normally (single lane, consistent with `single_lane: true`,
  `lane_gap_m: 0`).

**So: integration ✅, position ✅, position-derived overlays ✅, body MESH ❌.** The failure is
isolated to whatever instantiates or shows the wheel mesh — not to physics, not to gating.

**The one structural feature unique to S3 in this concept:** it is the only state with **two
bodies**, and the only one whose bodies carry **custom ids** (`nlb_wheel_locked` /
`nlb_wheel_roll`) rather than the plain `"wheel"` that S1/S2/S4/S5/S6/S8 all use — and it runs
them under `single_lane: true`. Every single-body `id: "wheel"` state renders its mesh fine.
**Multi-body + custom ids + single_lane is the untested combination.** Offered as the narrowing,
not as an asserted root cause — this desk read pixels, not the mesh factory.

Possibly the concrete manifestation of existing OPEN architect rows on this concept
(`…no_per_body_activation_time`, `nlb_lane_offsets_apply_to_declared_bodies_not_co_present_ones`)
— cross-reference before treating as independent. The observed symptom is **total invisibility**,
not the lateral split those rows predict.

---

## Finding B-6 — Rule 34c cannot be literally satisfied for `I_cm`: Unicode has no subscript 'c'

**Status:** OPEN — **authoring doctrine question, not an engine defect** · **Severity:** MINOR ·
**Owner:** founder / doctrine (NOT the surgeon) · **Filed:** 2026-08-05 by Desk B.

`rolling_on_incline` STATE_6 authors a rendered formula surface
`"text": "f·R = I_cm·α"` — ASCII underscore, which Rule 34c's Unicode sweep nominally forbids.

**This desk did NOT "fix" it, deliberately.** Unicode provides ₘ (U+2098) but **no subscript
'c'** (U+1D9C ᶜ is a superscript modifier letter, not a subscript). So there is no correct
Unicode spelling of `I_cm` to sweep to; the available options are all judgment calls — drop the
subscript to a bare `I` and carry "about the centre of mass" in the label, use `Icm`, or accept
`I_cm` as the standard physics ASCII convention Rule 34c did not anticipate.

Inventing a glyph to satisfy a rule literally would be a fabrication, not fidelity. Flagged for
a doctrine decision; nothing edited.

---

## Finding B-7 — negative `a` on release: possible sign-convention artefact, NOT asserted as a defect

**Status:** OPEN — **needs a human check before routing** · **Severity:** unknown ·
**Filed:** 2026-08-05 by Desk B.

`rolling_on_incline` STATE_6 shows `a` going to **-2.76 m/s²** on release, and STATE_7 shows
`-2.07 → -3.70`, where the authored physics `a = g sin θ/(1+k)` is positive down-slope. This may
be an intentional camera-axis convention (negative = down-slope) rather than a sign bug.

**Not filed as a defect and not routed to any owner.** Someone must check it against the
renderer's axis convention first. Recorded here so it is not lost, and so no desk re-derives it.
Note it is also currently unfalsifiable from the pixels — under B-3 the bodies do not move, so
there is no observable direction to compare the sign against. **Re-check after B-3 lands.**

---

## Finding B-8 — DESK B's OWN DEFECT: `surface.length_m` is a HALF-length, and `pure_rolling` authored every body 0.6 m from the wall

**Status:** FIXED 2026-08-05 · **Severity:** was CRITICAL (it made a working concept look like a
dead engine) · **Owner:** `alex:json_author` — **this desk, not the engine** · **Filed and fixed
in the same session.**

### What was wrong

`surface.length_m` is the track's **visible HALF-length** — engine:
`NLB_DEFAULT_LEN_M = 6 // surface.length_m default (visible half-length, metres)`, and
`nlbBoundsM` returns `{ lo: -lenM, hi: lenM }`. Both concepts author `length_m: 3`, so the track
runs **±3 m**, not 0–3 m.

`nlbGravAlong` returns **`-m·g·sin(θ)`**, so on an incline gravity drives **−s**.

Every body in both concepts authored `initial_position_m: 2.4`:

- **On the incline (θ = 25°, v₀ = 0): CORRECT.** Runs +2.4 → −3, i.e. 5.4 m of runway.
- **On the flat (θ = 0, v₀ > 0): BACKWARDS.** Motion is +s, so the runway is 3 − 2.4 = **0.6 m**.
  STATE_7 launches at 2.0 m/s and hits the wall at ~300 ms; its capture is authored at 1361 ms.

8 of `pure_rolling`'s 9 bodies were affected. Only STATE_5 escaped — because `v₀ = 0`, which is
exactly why the first eye-walk independently named S5 "the only clean state." All 17
`rolling_on_incline` bodies were already correct and were not touched.

### Fix

`initial_position_m: -2.4` on all 9 `pure_rolling` bodies (5.4 m of runway, deliberately
matching the incline's), plus the doc-only `x0` constant. STATE_5 moved too — not because it was
broken, but for **Rule 32d** pose continuity: 8 siblings starting at −2.4 and S5 alone at +2.4
would teleport the wheel 4.8 m when a teacher opens that state from the rail.

Verified: `tsc` 0 · `validate:concepts` 151 PASS / 0 FAIL · `rolling_on_incline` untouched.
Fallout checked and clean: `revolution_marks` and `skid_trail` both derive from live body
position, not authored constants; no narration states a position. Two camera values were flagged
as possibly stale (`STATE_2.camera_target_m: 0.9`, `STATE_5.camera_position[0] = 2.4`, the latter
numerically equal to the OLD start) — **both since eye-walked and found to frame correctly**; the
camera-x match is a coincidence, not a derived value.

### Prevention rule — the reason this is filed rather than quietly fixed

**`length_m` is a HALF-length. A body's runway is `length_m − s0` in +s and `length_m + s0` in
−s, and gravity drives −s.** An authored `initial_position_m` must be checked against the
DIRECTION of travel, which on a flat track comes from `initial_velocity_mps`, not from gravity.

This passed Zod, passed `validate:concepts`, passed all 35 deterministic EYE checks, and
produced a physically plausible-looking wall-arrest that two eye-walkers and this desk all read
as an engine integration failure. **Nothing in the pipeline catches it.** A cheap gate would be:
assert `0 < (bounds − s0) in the direction of travel` for every body, and warn when a body's
authored runway is shorter than the distance implied by its own authored timings.

1. **No `'turns'` readout token, no turn-counter primitive.** `readouts` (`:1540-1541`) has no
   such member; `revolution_marks` (`:1608-1613`) exposes only `body_id` / `show_bracket` /
   `bracket_label` / `max_marks`. The skeleton's S1/S8 "turns counter `turns 3`" is not
   expressible. **Authored around it:** the numbered ground ticks the marks primitive already
   stamps ("0", "1", "2", …) carry the turn count visually, which is the pedagogical payload;
   no `turns N` HUD row is authored. Not filed as blocking — the R dial stays visibly
   consequential under the reduced preset via the mark spacing, which was the requirement.
2. **No k-chip render path.** `shape_factor_k` is consumed by physics (`nlbShapeK`, `:40010`)
   and stored on the body record (`:45519`), but nothing renders it. **Does not affect
   `pure_rolling`**, which deliberately never renders k (do-not-prespoil — k is the sibling's
   reveal) and never authors `shape_factor_k` (`shape: 'wheel'` derives k = 0.5). **Carried
   forward as a live risk for `rolling_on_incline`**, whose S4 ("both k chips read 0.40") and
   S8 core-ring furniture both call for k chips — to be resolved in that concept's authoring
   pass and appended here if it proves a genuine gap.

---

## ✅ E2 / E3 VERIFICATION — BEHAVIOURAL, POST-MERGE (2026-08-06)

**PR #29 merged** (`bd89d433`). Containment confirmed independently, not from `desk:sync` output:
`git merge-base --is-ancestor deb764b origin/master` → **ON_MASTER**; `gh pr view 29` →
`state: MERGED`; and the code itself on `origin/master` — `NLB_SLIDER_TOKENS` now carries
`R`/`R2`/`omega0`, `contactRest` appears 4×. **`desk:sync` again did not list this desk** (it
skips the current worktree); the merge into `feat/rotmech-b` was done by hand, 46 commits behind.
Triad after merge: `check:renderer-syntax` OK · `tsc` 0 · `validate:concepts` 151 PASS / 0 FAIL.
Both Desk B fixes survived the merge (9 bodies at `s0 = −2.4`, S7 `until_ms: 2000`).

Re-seeded before every run per notice §1. Staleness proof: assembled `sim_html` grew
4183986 → 4255010 chars (incline) and 4181111 → 4252135 (flat), so the new renderer is genuinely
under test.

### E2 — **VERIFIED WORKING** on the flat track. B-1 is FIXED.

`pure_rolling` STATE_7, frozen pin, post-merge:

| | v | Rω | contact | f_k |
|---|---|---|---|---|
| pre-merge | 2.00 | **0.00** | 2.00 | 0.00 N |
| **post-merge** | **1.33** | **1.33** | **0.00** | 0.00 N |

That is capture, and the number is exactly right: `v_capture = v₀/(1+k) = 2.0/1.5 = 1.333` for a
wheel (k = 0.5). v decayed, ω spun up, they met, the contact went to rest and friction dropped to
zero. **B-1 → FIXED.** Close it.

### E2 — **DOES NOT FIX B-3.** `rolling_on_incline` is unchanged and still dead.

md5, post-merge, against the desk's OWN pre-merge frames (notice §1 — not a fresh baseline):

```
S1  f9a8b277 f9a8b277 6557f678 f9a8b277 f9a8b277   <- byte-identical to PRE-merge
S2  e8987880 e8987880 e72f7764 e72f7764            <- byte-identical to PRE-merge
S5  8604265d 8604265d 5e0bcce9 8604265d 8604265d   <- byte-identical to PRE-merge
S8  272d2ccb x10                                    <- ONE hash across the whole 10 s sandbox
```

**This is the cleanest possible separation of B-1 from B-3.** The same engine change that made
flat-track capture work left the incline bit-for-bit identical. B-3 is a genuinely independent
defect, exactly as the corrected finding claimed, and it remains OPEN and CRITICAL with **no
engine owner**.

(S8's hash *did* move, `4ff923ec` → `272d2ccb` — that is E3's new slider rows rendering, not
motion. Sliders appeared; nothing moved.)

### E3 — **PARTIALLY VERIFIED.** Presence and initialisation work; the RE-SPACE does not.

Presence, on pixels (not the enum):
- `pure_rolling` S1 now renders an `R = 0.25 m` row — it previously had **no control at all**.
- `rolling_on_incline` S8 now renders all six rows including `R = 0.15 m` and `R₂ = 0.15 m`.
- Both initialise from the body's authored `radius_m` (0.25 and 0.15 respectively; 0.55 is only
  the default when absent). **B-2 → FIXED.** Close it.

The **write** path was driven directly — `src/scripts/_probe_e3_radius.ts` sets `#nlb_r_slider`
and dispatches the DOM `input` event `nlbWireSlider` binds, i.e. exactly what a teacher drag
fires, with the clock pinned (`SET_TIME_FREEZE 1200`) so before/after differ ONLY by the write.
Requested R = 0.50 clamps to **0.35** (the row's own max), so the measured step is 0.25 → 0.35.

| requirement | result |
|---|---|
| engine `radius_m` updated | ✅ 0.25 → 0.35 |
| rolling constraint preserved | ✅ ω 3.60 → 2.5714, so `Rω` holds 0.90 (0.25×3.6 = 0.35×2.5714) |
| slider row restates the value | ✅ `R = 0.25 m` → `R = 0.35 m` |
| **re-SCALE** | ✅ wheel visibly larger |
| **re-LIFT** | ✅ still sits ON the track, not sunk through it |
| **re-SPACE** | ❌ **marks and bracket DESTROYED** — see B-10 |

---

## Finding B-10 — a radius write DESTROYS the revolution marks and the 2πR bracket instead of re-spacing them

**Status:** OPEN · **Severity:** MAJOR (E3 is the fix that was supposed to make `pure_rolling`
S1's live-radius beat work; the beat is the state's whole point) · **Owner:**
`peter_parker:field3d_surgeon` · **Filed:** 2026-08-06 by Desk B · **Verified by RUNTIME**
(driven write + before/after frames), reproducible via `src/scripts/_probe_e3_radius.ts`.

`pure_rolling` STATE_1 authors `revolution_marks` with a `2πR` bracket — the ground ticks that
carry the "one turn advances exactly one circumference" payoff, and the reason `R` is the state's
only control. E3 wired the radius write; `nlbApplyBodyRadius` re-scales and re-lifts the mesh.
**Nothing re-spaces the marks.**

Before (R = 0.25): the bracket line renders with its label `2πR = 1.57 m` and a numbered tick
series along the track. After (R = 0.35): the bracket and its label are **gone**, one stray tick
remains, and a collapsed label artefact sits at the far-left edge of the track.

Evidence frames (cropped + upscaled 4× over the track region):
`.visual_runs/_e3_probe/crop_before.png` · `.visual_runs/_e3_probe/crop_after.png`
(full frames alongside them as `S1_before_R0.25.png` / `S1_after_R0.5.png`.)

**Expected:** spacing should become `2πR = 2.199 m` and the bracket label should restate it.

Note this is precisely the risk B-2's own suggested fix flagged — *"a radius write must also
re-lift and re-scale the mesh and re-space the revolution marks, which is (c)-1's live-respace
requirement; the two items land together or S1 gets a dial that moves nothing."* Two of the three
landed. S1 now has a dial that moves the wheel but breaks the marks, which is worse than a dial
that does nothing, because the broken state is what a teacher would show.

**Second-order, same beat:** S1's narration hard-codes *"2πR = 1.57 m"*. Once R is live that
sentence is stale for every value except the default. Authoring-side and Desk B's to fix, but
**not fixable until the marks re-space** — deferred deliberately, not overlooked.

---

## E2 / E3 VERIFICATION (first pass) — 2026-08-05

### Status: CODE CONFIRMED PRESENT, BEHAVIOUR **NOT VERIFIED — BLOCKED** *(superseded by the post-merge block above)*

**PR #29 is OPEN, not merged** (`mergedAt: null`, head `feat/rotmech-0c3`). `npm run desk:sync`
merges `origin/master` only, so it can never pull an unmerged PR — it reported "master already
current" and did not list this desk at all. The 2 commits this desk was behind master are the
unrelated mathematics ones.

**Read-only inspection of `origin/feat/rotmech-0c3` confirms both changes exist:**

| item | evidence on the PR branch |
|---|---|
| **E3** | `NLB_SLIDER_TOKENS = ["m","m2","F","F_ang","theta","mu_s","mu_k","v0","R","R2","omega0"]` — the three SEAM R tokens present |
| **E2** | `if (canRoll && contactRest && !(stuck && …))` — a new `contactRest` term now gates the rolling branch, i.e. the kinematic precondition B-1 asked for |

**What this desk has NOT done and cannot do yet:** run either concept against that code. Nothing
about revival, capture, radius re-lift/re-scale/re-space, or B-3 is verified. **Verification
requires the PR merged to master** — this desk did not merge the PR branch into its own worktree,
because (a) it is unreviewed work, (b) Rule 40 forbids landing engine changes inside a chapter
branch, and (c) the `.githooks/` auto-push hook would immediately publish the result.

**On merge, this desk owes:** a full re-walk of both concepts, an E2/E3 verdict here, and per
notice §1 a re-seed before every run plus an H2 comparison against its OWN earlier frames.

---

## Finding B-9 — THE EYE's entire nlb timed-reveal derivation is DEAD for hand-seeded concepts; every state pins at the 1500 ms default

**Status:** OPEN · **Severity:** MAJOR (tooling/seed contract; the sibling of B-4) ·
**Owner:** routing decision — the seed convention is desk-local, but `deriveStateMeta` /
`validators/visual/*` is a Rule-40 PLATFORM surface · **Filed:** 2026-08-05 by Desk B.

Measured, not inferred — `deriveMaxRevealTimeMs` called directly on both concepts returns
**exactly 1500 for all 16 states**, including states whose authored phases run to 2618 ms:

```
pure_rolling        S1..S8  pin=1500   (last phase until_ms: 2050, 2618, 1800, 1200, 1200, 1400, 1361, —)
rolling_on_incline  S1..S8  pin=1500   (last phase until_ms: 2400, 1204, 3200, 1100, 2200, 3200, 1968, —)
```

**Cause:** `resolveField3dStates` looks for `config.field_3d_config` or a top-level
`config.states`. The `_seed_<id>_cache.ts` convention writes
`physics_config: { epic_l_path: json.epic_l_path }` — and `epic_l_path.states` carries **no
`newtons_laws_body` block** (verified: its state keys are title / duration / focal_primitive_id /
advance_mode / motion_archetype / delta_cue / depth_ring / scene_composition / teacher_script).
So the resolver returns null, the whole nlb branch — `phases[]`, `param_ramp`, `activate_at_ms`,
`formula_lines[].at_ms` — never executes, and every state falls through to `DEFAULT_REVEAL_MS`.

**Consequence:** for every hand-seeded field_3d concept, THE EYE's frozen frame is photographed
at a flat 1500 ms regardless of what the author scripted, and the ~100 lines of nlb pin logic in
`deriveStateMeta.ts` (with its own scar citations) are unreachable on this path. Same family as
commit `2d4cb06` *"fix(eye): make the visual gate correct for every hand-seeded subject, not just
chemistry"*, which evidently did not cover this `physics_config` shape. **It also affects the
APPROVED baselines** — `rolling_friction` and `work_done_by_constant_force` use the identical
seed shape, so their baselines were captured at a default pin too.

### Why this desk does NOT enrich its own seeds (the primary justification)

Notice §4 item 2 tells desks to add `field_3d_config` to their seed, and Desk E fixed both its
canaries that way. **That advice does not transfer to this desk, and the notice's own caveat is
why:** enriching the seed restores `[D5]` only for scenarios that HAVE a motion branch in
`deriveMotionExpectations`. §4 names `rigid_body_rotation` as one that does — and
**`newtons_laws_body` as one that does NOT**, where the `?` is by design. Desk E's canaries are
rbr; both of this desk's concepts are nlb.

So for `pure_rolling` and `rolling_on_incline`, enriching the seed would buy **zero** `[D5]`
coverage while silently moving all 16 pins off the flat 1500 — changing where every frozen frame
is photographed, mid-verification, for no gate benefit. Confirmed empirically this session:
`Motion map:` read `STATE_1=? … STATE_8=?` on both concepts even post-merge, exactly as §4
predicts for nlb.

That is the reason to leave it alone; "the instruction said not to" is not. B-9 stays fleet-wide
and unfixed here — it hits the approved `rolling_friction` and `work_done_by_constant_force`
baselines too, which use the identical seed shape. Flagged for a fleet-level call.

### Consequence handled: `pure_rolling` STATE_7 phase window — FIXED

Notice §6 (second half) is closed. S7's only phase window closed at `until_ms: 1361` while the
frozen frame pins at 1500, so the focal was handed back before the reviewer screenshot.
**Fixed by extending the window to `until_ms: 2000`** — notice-sanctioned option 1, the minimal
one-field diff, inventing no new choreography. Verified on pixels: S7's frozen frame now shows
the wheel lit, and its t0/t1000/t2000/frozen hashes all changed while t3000 (outside the window
either way) stayed byte-identical. `tsc` 0 · validate 151 PASS / 0 FAIL.

### FIVE more states have the same mismatch — MEASURED, deliberately NOT blind-fixed

The notice named only S7. Checking every state (the lesson from the B-8 round) found five more
where the 1500 pin lands after the last phase window closes:

| concept | state | last phase closes |
|---|---|---|
| `pure_rolling` | S4 | 1200 |
| `pure_rolling` | S5 | 1200 |
| `pure_rolling` | S6 | 1400 |
| `rolling_on_incline` | S2 | 1204 |
| `rolling_on_incline` | S4 | 1100 |

**Not fixed, on purpose.** Unlike S7 — where the pin lands after a *capture* the state exists to
show — "no focal at the pin" is not automatically wrong: a state whose choreography completes and
then holds a settled end pose may legitimately want an unemphasised frozen frame (Rule 32d).
Deciding that for five states requires seeing them, and `rolling_on_incline` is still dead while
`pure_rolling` S4/S5/S6 have not been re-walked against E2/E3. Re-choreographing them blind is
the speculative retune this desk refused on the camera values. **Re-assess at the post-merge
re-walk.**

### Method note for the md5 discipline

Comparing runs by hash works, with one exception worth recording: **the explore state's dense
frames are NOT comparable run-to-run.** `pure_rolling` S8 produced entirely different dense
hashes across two runs with no S8 edit, while its `__frozen.png` stayed byte-identical
(`7974ff8c94`) — the Rule 37 sandbox free-runs on wall-clock, so only the time-pinned frozen
frame is deterministic. Guided states ARE deterministic (S1 byte-identical across the same two
runs). Do not read a changed S8 dense hash as a regression.

**`Motion map:` on this run read `STATE_1=? … STATE_8=?`** — per notice §4, `[D5]` did not run.
B-4's blind spot is live on this concept, so the hash remains the real check.

---

## Finding B-11 — the frozen H2 frame is a HYBRID, not a photograph of the pin: the clock rewinds, the reveals do not

**Status:** OPEN · **Severity:** MAJOR (fleet-wide; it makes every H2 baseline's overlay content
depend on how long the clock ran before the freeze was posted) · **Owner:** routing decision —
`validators/visual/*` + the renderer's `SET_TIME_FREEZE` handler are Rule-40 PLATFORM ·
**Filed:** 2026-08-06 by Desk B · **Verified by RUNTIME** (`src/scripts/_probe_pin.ts`).

This reconciles two accounts that looked contradictory: B-9 measured the pin at a flat 1500 ms,
while the post-merge eye-walk reported `pure_rolling` S1's frozen frame showing formula lines
authored at **2300 and 2600 ms**. Both were right.

**Measured:** let S1 run to `PM_simTimeMs = 3344`, then post `SET_TIME_FREEZE {ms: 1500}`.

```
PM_simTimeMs before : 3344
PM_simTimeMs after  : 1500        <- the clock DOES rewind, exactly
formula text visible at that rewound frame:
   ["One turn, one circumference", "one turn → 2πR\nv = Rω"]
   (authored at_ms: 2300 and 2600 — both AFTER the pin)
```

**The physics rewinds; the DOM reveals do not retract.** So the frozen frame photographs
t = 1500 physics with up-to-3344 ms of reveals overlaid. Its overlay content is a function of how
far the clock happened to run before the freeze arrived — not of the pin.

**Why it has not bitten yet:** in practice the pre-freeze runtime is consistent, so the approved
baselines are stable (this desk re-verified the regression pair post-merge at
`rolling_friction` 0.22–0.38% and `work_done_by_constant_force` 0.00–0.07% — *identical
percentages to the pre-merge run*, which by notice §1's own two-run method proves those deltas
are pre-existing baseline vintage, not engine drift). But it is stable by luck of timing, not by
construction.

**Suggested fix (not built here):** `SET_TIME_FREEZE` should re-run the reveal pass for the
target time — hiding anything whose `at_ms` exceeds it — so the frozen frame is what the pin
claims it is.

### Consequence for B-9: the remedy is authorable, and it is NOT enriching the seed

`visual_eyes.ts` supports a per-state opt-in override, **`eye_capture_ms`** (added 2026-07-29 for
exactly this class of problem — its own comment says *"a scenario whose content EMERGES from the
physics has [no discrete cues], so the derived target is null and the renderer's 1500 ms default
is used… A baseline photographed before the concept happens cannot catch a regression in the
concept"*). `newtons_laws_body` is precisely such a scenario.

**Neither of this desk's concepts authors a single `eye_capture_ms`.** That is the sanctioned,
per-state, non-diverging way to place the frozen frame where each state's claim is actually on
screen — no platform file, no seed change, no fleet divergence. **Not authored this session
deliberately:** doing it while B-11 is open would bake in frames whose overlays are still hybrid,
and `pure_rolling` cannot be sealed until B-5 and B-10 land anyway. **Author `eye_capture_ms`
per state as part of the pre-seal pass, after B-11.** Recorded so it is not lost.

---

## Minor findings from the post-merge re-walk (2026-08-06)

- **B-12 (MINOR, `peter_parker:field3d_surgeon`)** — *friction readout subscript is derived from
  held-state, not from the active branch.* `rolling_on_incline` S6 shows `f_s = 4.14 N` while held
  (correct) then flips to **`f_k`** `= 1.38 N` after release — but 1.38 = `k·m·a` is the
  **rolling** closed form, not a kinetic one, and the state authors no `mu_k` at all. S3's rolling
  disc shows `f_k` from t = 0 despite never leaving the rolling branch. **Every numeric value
  checked was correct; only the printed subscript is wrong.** Fix: pick the subscript from the
  same branch flag that already selects the formula.
- **B-13 (MODERATE, `alex:json_author` — DESK B's own)** — *`point_arrows` labels overlap
  illegibly on `pure_rolling` S4/S5/S6.* At the authored `camera_position` the wheel occupies a
  small screen area, so the top/centre/bottom velocity labels land within ~15 px and merge into an
  unreadable stack (S6 t04000: "2.00 m/s", "1.00 m/s", "0.00 m/s" overlapping). This defeats the
  exact comparison those three states exist to teach — S6 in particular needs the student to read
  three *different* on-canvas numbers. **Not fixed this session:** the cheapest lever is pulling
  the camera closer, but the states cannot be re-verified until B-5/B-10/B-11 are resolved and
  the frames are re-walked; fixing camera framing blind is the speculative retune this desk has
  refused throughout. Fix it in the pre-seal pass.
- **B-14 (MINOR, `alex:json_author` — DESK B's own, LOW CONFIDENCE)** — `pure_rolling` S8's
  `μ_k` slider label may use an ASCII underscore where Unicode ₖ (U+2096) exists. Unlike B-6's
  `I_cm` there IS a correct glyph here, so this one is fixable. Read from a screenshot, not the
  DOM — **confirm against the JSON before editing.**

---

## ✅ E11 VERIFICATION (Desk B is the verifier) — 2026-08-06. B-3 CLOSED.

Containment confirmed independently of `desk:sync` (which skipped this desk again, 5 behind):
`merge-base --is-ancestor ccb2b65 origin/master` → **ON_MASTER**; `ba12073` (PR #30 merge) also
on master. Merged into this desk by hand. Triad clean; both Desk B fixes survived.
Staleness proof: `sim_html` 4255010 → 4257634.

**`rolling_on_incline` is ALIVE — verified on the MESHES, not on hashes.** S8 now yields **10
distinct hashes** where it previously had one; every state moves. Cropped 5× to defeat the
overlay trap: at t=0 all four bodies sit clustered at the top of the incline; by t=2000 they have
travelled down and **separated into the authored finish order** — solid sphere leading, then
disc, then hollow sphere, ring trailing. That is `a = g sinθ/(1+k)` with k = 0.4 < 0.5 < 0.667 <
1.0. **B-3 CLOSED.**

**`pure_rolling` NON-REGRESSED — but NOT byte-identical, and the hashes were misleading.**
S1/S3/S7 hashes all changed vs pre-E11. Measured properly instead of trusting them:

| comparison | frozen delta | dense delta | tolerance |
|---|---|---|---|
| pre-E11 vs post-E11, S1 / S4 / S7 | 0.000 / 0.000 / **0.021%** | 0.042 / 0.137 / 0.081% | 2.0% |

**E11 caused no visible change.** S7's capture readouts are unchanged (`v = Rω = 1.33`).

### 🔬 B-18 (METHOD, MAJOR) — md5 is OVER-SENSITIVE: a differing hash is not a changed picture

Two `pure_rolling` runs, **no change between them**, re-seeded each time:

```
S1 dense=DET   frozen=det      S5 dense=NOISY frozen=det
S2 dense=NOISY frozen=det      S6 dense=NOISY frozen=det
S3 dense=NOISY frozen=det      S7 dense=NOISY frozen=NOISY
S4 dense=DET   frozen=det      S8 dense=NOISY frozen=det
```

**6 of 8 states produce different dense hashes across identical runs**, and S7's *frozen* frame
does too. But the measured pixel deltas are **0.000–0.021% (frozen)** and **0.013–0.128%
(dense)** against a 2.0% tolerance — sub-threshold render noise (antialiasing / 1-LSB), not
content. S7 even oscillates back to its exact pre-E11 hash.

**Consequences for this desk's own method, stated plainly:**
1. **"Hashes differ" proves nothing.** Only the *dead* direction survives: one hash across a
   series ⇒ genuinely identical ⇒ dead scene. That heuristic stands and is still the fastest
   liveness check. The converse does not.
2. **Any A/B hash comparison needs a determinism check first** — two runs with no change — or a
   pixel-delta measurement. This desk drew a "pure_rolling changed under E11" conclusion from
   hashes that was **wrong**; the pixels say ≤0.137%.
3. **CORRECTS this desk's earlier method note** claiming *"the explore state's dense frames are
   NOT comparable run-to-run (Rule 37 free-runs on wall-clock); guided states are
   deterministic."* **Both halves are wrong.** S8 (explore) is as deterministic as anything else
   here, and 4 of 6 noisy states are GUIDED. The cause is sub-threshold render noise across the
   board, not Rule 37 free-running. The earlier S8 difference was an engine change (the E2/E3
   merge sat between those two runs), not nondeterminism.
4. H2 at 2.0% tolerance is unaffected and safe — which is why the fleet's baselines have been
   stable. Sealing is **not** blocked by this.

---

## ⛔ B-17 RULING CANNOT BE APPLIED — there is no preset layer to apply it to

**Founder ruling:** *"38b governs formula surfaces, not controls. Keep v₀/ω₀/μ_k and θ/μ_s in the
explore state; hide those rows in the reduced presets (Rule 38h — presets hide, never reorder)."*

**The first half is applied: nothing was changed, both explore states keep their controls.**

**The second half cannot be, and this desk did NOT fabricate a field to satisfy it.** Verified:

- **No `presets` field exists in `src/schemas/conceptJson.ts`** — the only occurrences of
  "preset" are comments, which state the shape is *"not yet gate-enforced or preset-consuming;
  this is the proof-run's data shape pilot."*
- **Zero concepts in the fleet author any preset-like key** (`grep -ohE '"[a-z_]*preset[a-z_]*"'
  across `src/data/concepts/*.json` → empty), including the `capacitance` proof-run that piloted
  curriculum-flex.
- **No code reads `depth_ring` at all** — the only hits are validator comments and seed scripts.

And an already-filed scar row states this exact hazard verbatim:

> *"A ring cut is discharged by RING ASSIGNMENT, never by a field: every control the explore
> state exposes must map to a guided state whose depth_ring survives the cut, **with no hiding
> mechanism assumed anywhere**. If a control cannot satisfy that, the fix is to re-ring or to CUT
> the control, not to tag it."*
> — `_seed_engine_bug_queue_unit_circle_checkpoint_a.ts`

Authoring a `presets` block would create a shape nothing consumes — the precise failure that row
exists to prevent, and the same class as the `'shape'` control token this desk refused to invent
under B-2.

**The genuine options, for a founder decision (no state redesign is possible without one):**
1. **Build the preset layer** (schema field + a consumer) — then the ruling applies as written.
2. **Re-ring the teaching states** so each explore control maps to a surviving ring — but the
   ruling says "no state redesign", and this is one.
3. **Accept it as-is** and record that under a reduced preset these dials are untaught — cheapest,
   and defensible while no preset consumer exists to reduce anything.

**Nothing authored. B-17 stays OPEN pending that decision.**

---

## 📋 DECISION BRIEFS FOR THE FOUNDER — B-6 · B-17/N8 · N3 (2026-08-13)

Three rulings requested. Each is one decision; the desk's recommendation is first in each list.

### Brief 1 — B-6: `I_cm` vs Rule 34c (Unicode has no subscript c)

**The question:** S6 renders the formula `f·R = I_cm·α`. Rule 34c mandates Unicode math on canvas,
but the Unicode subscript block is ₐ ₑ ₕ ᵢ ⱼ ₖ ₗ ₘ ₙ ₒ ₚ ᵣ ₛ ₜ ᵤ ᵥ ₓ — **no c**. U+1D9C (ᶜ) is a
modifier letter that renders as a superscript. 34c literally cannot be satisfied.

| option | cost |
|---|---|
| **(A) RECOMMENDED — keep `I_cm`; amend 34c with a documented no-glyph exception** ("where Unicode provides no subscript glyph, standard physics ASCII is the correct spelling") | Zero content cost. `I_cm` is the standard physics notation every textbook uses; the exception is a one-line doctrine note that future concepts (`v_cm`, `a_cm` — the same c!) will need anyway. Ch.7+ is full of centre-of-mass subscripts, so this recurs immediately. |
| (B) `Icm` (no separator) | Reads as a three-letter variable; non-standard; ambiguous at 14 px. |
| (C) bare `I` + "about the centre of mass" in narration | Loses precision exactly where it matters — a rolling body has DIFFERENT moments about contact vs centre, and I_contact = I_cm + mR² is the next concept's whole point. A bare `I` plants the ambiguity Ch.7 exists to remove. |

**One-line ruling suffices: "A" closes B-6 with no file edit; "B" or "C" is a one-string edit.**

### Brief 2 — B-17 + N8: the explore state's advanced-ring controls, and the preset layer that does not exist

**The question:** `pure_rolling` S8 exposes `v₀/R/ω₀/μ_k`; `ω₀/μ_k` are first taught in S7
[advanced]. `rolling_on_incline` S8 exposes `θ/μ_s` first taught in S6/S7 [advanced]. Your prior
ruling — "keep the controls; hide those rows in the reduced presets (38h)" — is half-applied: the
controls are kept, but **the hiding cannot be done because no preset layer exists**: no `presets`
field in the schema, zero concepts author one, no code reads `depth_ring`, and the scar row
`unit_circle_checkpoint_a` forbids assuming a hiding mechanism ("a ring cut is discharged by RING
ASSIGNMENT, never by a field"). N8 (S8's narration names the same advanced concepts) is subsumed —
a dial you may show is a dial you may name.

| option | cost |
|---|---|
| **(A) RECOMMENDED — accept as-is; record that the ruling's second half becomes actionable when a preset layer lands** | Zero cost today: nothing reduces anything, so nothing is incoherent. When presets land, S8's rows AND its narration both become preset-aware in one pass. This desk's ledger already tracks it as a dependency. |
| (B) commission the preset layer now (schema field + consumer + 38h semantics) | A platform feature on master — new scope, new owner, and it blocks nothing this chapter ships. |
| (C) re-ring S6/S7 down to extended so every explore control maps to a surviving ring | This is the state redesign your ruling excluded, and it inflates the reduced presets' teaching load — the derivation states ARE advanced. |

**A closes B-17 and N8 together with a doctrine note; B opens a platform work item; C reopens two
sealed-design skeletons.**

### Brief 3 — N3: the framed-extent camera rule (parent of B-13, B-19, and the open close_camera row)

**The question:** the architect camera plan sets framed extent = full run + one body diameter
(4.0–6.4 m) for a 0.5 m body, so the wheel is 15–30 px in a 1280×720 frame. Four findings are
symptoms of this one rule: B-13 (point-label collisions, INCLUDING the PRIMARY aha state S2),
B-19 (the 2πR bracket at ~10–14 px), the open `close_camera_framed_extent…` row, and half of N7's
residue (S5's direction arrows are ~50 px stubs). **Fixing any symptom individually papers over
the rule in one place and leaves the other three.**

| option | cost |
|---|---|
| **(A) RECOMMENDED — architect amends the camera rule to budget GLYPH HEIGHT, not just body framing** ("when a state's payoff is an overlay — bracket/labels/marks — the camera table must verify each glyph ≥ a minimum px height at the authored distance"), then ONE re-framing pass over both concepts against the new rule | One architect dispatch + one authoring pass + one re-walk. Fixes all four symptoms coherently, and every future nlb concept inherits the rule. The engine already exposes `camera_target_m` — no engine work. |
| (B) per-state camera patches on S1/S2/S4/S5/S6 now | Cheaper today; leaves the rule wrong, so `rolling_on_incline` and every future chapter re-derives the same defect. Explicitly what this desk has refused four times. |
| (C) engine-side label-separation + glyph-size floor (field3d_surgeon) | The durable *complement* to A (it fixes label COLLISION at any camera) — but alone it cannot make a 15 px wheel readable. Worth doing WITH A, not instead of it. |

**Recommendation is A, with C as its engine-side complement. B is the trap.**

---

## 📒 FINDING LEDGER — read this first (2026-08-07)

Every finding this desk has raised, with owner. **Authoring-side is now CLOSED except two doctrine
questions.** Nothing below is ambiguous about who acts next.

### ✅ CLOSED — Desk B authoring (all fixed and verified)

| # | What | Closed by |
|---|---|---|
| B-8 | `s0 = 2.4` backwards on every flat state (0.6 m of runway) | s0 = −2.4, 9 bodies |
| B-14 | `μ_k` glyph | **superseded by N5** — the engine default was already right; the concept was overriding it. Key deleted |
| B-15 | design table rendered as narration in 8 states | 8 rewrites, 39–43 words |
| B-16 | `"v equals R omega"` caption | → `"v = Rω"`, caption + delta_cue |
| N2 | **narration quoted world-unit lengths as speeds** on the PRIMARY aha state | 4 strings; `0.55→0.60`, `1.84→2.00`, `0.92→1.00` |
| N4 | all 7 assessment answers keyed "A" | re-keyed `C A D B A C B` with a text↔misconception identity assertion |
| N5 | `μ_k` label overriding a correct engine glyph | key deleted |
| N6 | **doctrine: is `label` narration or an on-canvas surface?** | **RESOLVED on evidence — see below** |
| N7 (authoring half) | S5 was the only state with no `readouts` | `["v","omega","Romega"]` added |
| N9 | Rule 41a register in rendered strings | "sit equal", "as the numbers dictate" fixed |
| — | **four-class defect sweep, all fields, both concepts** | **CLEAN** — see below |

### ⏳ OPEN — Desk B, but BLOCKED ON A RULING (cannot be closed by authoring)

- **B-6 — `I_cm` and Rule 34c.** Unicode has **no subscript c** (the subscript block runs
  ₐ ₑ ₒ ₓ ₕ ₖ ₗ ₘ ₙ ₚ ₛ ₜ — U+1D9C is a *modifier* letter, not a subscript), so 34c cannot be
  literally satisfied. Options: keep `I_cm` (standard physics ASCII), write `Icm`, or drop to a
  bare `I`. **Recommendation: keep `I_cm` and record 34c as admitting a documented no-glyph
  exception** — every alternative is either non-standard or loses the "about the centre of mass"
  precision that matters for a rolling body. Awaiting a one-line ruling; nothing to build.
- **B-17 — the preset layer does not exist.** First half applied (controls kept). Second half
  ("hide the rows in reduced presets") cannot be: no `presets` field in the schema, zero concepts
  author one, no code reads `depth_ring`. Not fabricating a shape nothing consumes.
- **N8 — subsumed by the B-17 ruling, not independently open.** S8's narration names "starting
  spin" and "friction", first taught in S7 [advanced]. But the B-17 ruling keeps those controls in
  the explore state, and a dial you may show is a dial you may name. **Coherent today**, because no
  preset layer exists to reduce anything. It becomes live only if/when presets land, at which point
  the narration must be preset-aware. Tracked as a dependency of B-17.

### 🚚 ROUTED AWAY — not Desk B's to fix, listed so the gate reads unambiguously

| # | What | Owner |
|---|---|---|
| **B-5** | `single_lane: true` → zero body meshes (2 of 74 states, both this desk's) | `peter_parker:field3d_surgeon` — 2nd in queue behind B-1 |
| **N1** | 13 of 15 glow windows unreachable; they DIM the whole overlay layer | `peter_parker:field3d_surgeon` |
| **N3** | framed extent = run length for a 0.5 m body → wheel 15–30 px | **`alex:architect`** — the PARENT of B-13, B-19 and the open `close_camera_framed_extent` row: **four symptoms, one design rule** |
| B-10 | radius write destroys the revolution marks + 2πR bracket | `peter_parker:field3d_surgeon` |
| B-11 | frozen frame is a hybrid (clock rewinds, DOM reveals do not) | platform / visual tooling |
| B-12 | friction subscript from held-state, not active branch | `peter_parker:field3d_surgeon` |
| B-13 | `point_arrows` label collision (incl. the PRIMARY aha state) | `peter_parker:field3d_surgeon` — **symptom of N3** |
| B-19 | S1's 2πR bracket illegible at ~10–14 px | `alex:architect` — **symptom of N3** |
| N7 (engine half) | point labels print `Math.abs(pv)`, so S5's top and bottom both read 1.00 m/s | `peter_parker:field3d_surgeon` |
| **B-18** | md5 method | **RESOLVED by Desk E**: 88/88 equal hashes on pixel-identical adjacent pairs — within-run adjacent comparison is sound, **never across runs**. Dead-scene findings need no re-derivation |

**No per-state camera has been patched, and none should be** — that is N3's fix, and doing it
per-state would paper over the parent rule in four places.

---

## ✅ N6 RESOLVED ON EVIDENCE — `label` is an ON-CANVAS surface, so Rule 34c governs it

The disagreement was: the auditor read `label` as a rendered surface (⇒ Rule 34c Unicode); this
desk had filed the opposite (⇒ it IS the narration, where Rule 30 *requires* bare symbols expanded
to spoken names). Two defensible readings giving opposite instructions — settled by reading the
renderer rather than by preference:

```js
// field_3d_renderer.ts:66507
lines.push("<b>" + (stateDef.label || PM_currentState) + "</b>");   // → legendEl.innerHTML
```

`label` is composed into the **legend overlay drawn inside the sim** (the bottom-left box that also
carries "Drag to rotate • Scroll to zoom" — visible in every captured frame). It is not the spoken
channel: `teacher_script.tts_sentences[].text_en` is, and it is a **separate field**.

**So both rules apply, to different fields, and there was never a real conflict:**
- `label` → on-canvas → **Rule 34c, Unicode math**.
- `tts_sentences[].text_en` → spoken → **Rule 30, expand bare symbols to spoken names**.

Fixed accordingly in the rendered labels: `1.96 m/s squared` → `1.96 m/s²` · `omega = 4.0 rad/s`
→ `ω = 4.0 rad/s` · `launches at v0 … spins omega up` → `launches at v₀ … spins ω up`.
`rolling_on_incline` S6's label restated the formula in words ("g times sine theta, divided by one
plus k") — rewritten to point at the formula surface instead, which also satisfies **Rule 34b**
(one formula surface per state, never duplicated).

---

## ✅ DEFECT-CLASS SWEEP — all fields, both concepts, four classes at once (2026-08-07)

The doctrine this desk derived last session, applied at full scope: *a register defect from one
authoring habit appears in every field that habit touched — audit by DEFECT CLASS across all
fields, not by the field the finding happens to name.*

`src/scripts/_probe_defect_class_sweep.mjs` walks **every string field** of both concepts against
world-unit numbers · internal units · engine verbs / ms timings · Rule 41a personification.

**14 hits → 6, and all 6 survivors are verified false positives.**

**The doctrine paid off exactly as predicted.** The habit `pure_rolling` and `rolling_on_incline`
share is competitive personification, and last session I fixed it in `aha_moment.statement` only:

| the same habit | field |
|---|---|
| "a food can **beats** a roll of tape" | `real_world_anchor.primary` |
| ditto | `epic.STATE_1.scene_composition[2].text` |
| ditto | **`tts_sentences[3].text_en` — the SPOKEN channel** |
| "watch who **wins**" | `epic.STATE_8.scene_composition[1].text` |
| "are **let go** together" (41a bans it by name) | `assessment.questions[0].parallel_form_stem` |
| "Which one **wins the race**?" | `assessment.questions[3].parallel_form_stem` |

**Six fields, one habit — and only one of them was the field the original finding named.** All
fixed. Had the sweep been scoped to `label` again, five would have shipped.

**The 6 survivors, checked and dismissed with reasons** (recorded so they are not re-chased):
`"stamp"` in `physics_engine_config.constraints[5]` and `"param_ramp"` in `variables.mu_s.name` are
internal physics documentation — and `physics_engine_config` is **never read by the renderer**
(grep: no hits), so neither is reader-facing. `"know"` is about a *student* ("Does not know rolling
ties…"), `"like"` ×2 is comparison ("behaves like sliding contact"), and `"lose"` is the physical
verb in "lose contact-static friction". None is personification.

---

## SESSION 2026-08-06b — N4/N7 landed, N2 audit extended to the sibling

**Sync status, checked rather than assumed:** this desk is **0 behind** `origin/master` (994bb8f),
which is a strict ancestor of HEAD — a master merge had already landed, so there was nothing to
sync. (`desk:sync` again reported the desk skipped.) Triad re-run on the merged tree: renderer
syntax OK · `tsc` 0 · 151 PASS / 0 FAIL.

**B-15 / B-16 were already DONE** — landed in `0eed746`, two commits before the last one, which is
why the final commit message did not mention them. Verified on disk rather than from memory: all
8 `rolling_on_incline` labels are 39–43 words and clean of ms timings, engine verbs, world
coordinates and `wu`; S2's caption is `"v = Rω"`.

### ✅ N2 audit EXTENDED to `rolling_on_incline` — no world-unit leak, but the same register leak in a field I had missed

**Rendered strings are clean.** After the B-15 rewrite the only numbers left in rendered surfaces
are shape factors (k = 0.40 / 0.50 / 0.67 / 1.00) and masses — all genuine physical values, none
a `× 0.92` world-unit length. Checked every `label` / `caption` / `formula_lines[].text` / body
label, plus `aha_moment` and `misconception_watch`.

**But B-15's fix was incomplete in a way the original finding did not capture: the design-table
register had also leaked into `misconception_watch`, which the label rewrite never touched.**

- `S3.misconception_watch[0].visual_counter` — *"the instant the block **retires**"* (engine verb).
- `aha_moment.statement` — *"only the shape factor decides who **wins**"* (Rule 41a bans
  personification by name).

Both fixed. **Lesson worth keeping: B-15 was scoped to `label` because that is where the audit
looked. A register defect introduced by one authoring habit will appear in every field that habit
touched — audit by DEFECT CLASS across all fields, not by the field the finding happened to name.**

**And the validator caught my own fix:** the first `aha_moment.statement` rewrite removed the
personification but ran to 24 words against a ≤15-word gate. Corrected to 13. Recorded because it
is the second time this session that running the gate — rather than trusting the edit — was what
caught the defect.

### ✅ N4 — **FIXED.** Assessment re-keyed `C A D B A C B`, all four letters in use

Was `A A A A A A A`: an all-A student scored 100% on both the pre- and post-test, so the
instrument could not measure the learning it exists for.

**The hazard, and how it was neutralised.** `distractor_misconceptions` is keyed **by letter**, so
permuting options without permuting the misconception map silently detaches every distractor from
its misconception — converting a *measurable* defect into an *invisible* one. The re-key therefore
moved (option TEXT ↔ misconception TEXT) as an inseparable pair, never letters alone.

**Verification method (this is the part that matters, not the result):** the script builds, for
every question, the map `option text → misconception text` (with the correct option marked
`<<CORRECT>>`) BEFORE the edit, rebuilds it AFTER, and asserts the two are identical — same size,
every text still present, every text still bound to the same misconception. Any detachment aborts
the write. It **HELD for all 7 questions**. Independently confirmed: the diff is 28 insertions /
28 deletions with **zero** changed lines outside `"A"/"B"/"C"/"D"` and `"correct"`, and a spot-check
of q1 shows *"omega = v times R"* still carrying the multiply-instead-of-divide misconception,
*"omega = R / v"* still the inversion, *"omega is unrelated to v"* still the no-relation.
Script retained at `src/scripts/_probe_rekey_assessment.mjs` so the check is reproducible.

### ✅ N7 — **HALF FIXED, and the other half is not mine to fix**

**Fixed:** S5 was the only state in the concept with **no `readouts` key at all** — verified
against all 8 (S1 `["v","omega","Romega"]`, S2 `["v","contact"]`, … S5 **null**). Added
`["v","omega","Romega"]`, matching the trio S1/S6 already use, so the HUD now reads
**v = 0.00 · ω = 4.00 rad/s · Rω = 1.00 m/s**. That is exactly the state's claim made numeric:
the centre is at rest while the rim moves, and Rω = 0.25 × 4.0 = 1.00 explains the 1.00 m/s the
point labels print. Rule 33d satisfied.

**NOT fixed — engine-owned, `peter_parker:field3d_surgeon`:** the second half of N7 is that the
point labels print `nlbFx(Math.abs(pv), 2)`, so S5's top and bottom both read `1.00 m/s` and the
*opposite directions* — the whole point of the state — are carried only by two arrow stubs. That
`Math.abs` is in `field_3d_renderer.ts`, a platform file this desk must not edit. **Filed as the
engine half of N7.** Note it interacts with N3: at the authored camera the stubs are ~50 px, so
even the arrow-only signal is weak. Do not fix by re-authoring the camera (N3 is architect-owned).

---

## PRE-SEAL QUALITY AUDIT — VERDICT **FAIL**, 9 new findings (2026-08-06)

Ran alongside the eye-walk on the twice-verified post-E11 run. Gates 1/2/3a/7/9/10/12/14/16–18
and all 8 registration sites PASS; Gates 0/3e/3f/3g/3h/4/8/15/20 FAIL. **Seven of the nine are
authoring-side and fixable with no engine dependency** — which is exactly what the audit was for.

### ✅ N2 — **FIXED.** Rendered narration quoted arrow WORLD-UNIT lengths as speeds

**The most consequential finding of the session, and it is mine.** The skeleton's velocity-arrow
map tabulates rendered arrow lengths in **wu**; those numbers were carried into the narration as
**m/s**. Verified independently in the main session — the arithmetic is exact:

| state | narration said | canvas + HUD read | wu identity |
|---|---|---|---|
| S2 | centre arrow "**0.55 m/s**" | **0.60** | 0.60 × 0.92 = **0.552** |
| S6 | top "**1.84 m/s (2v)**", centre "**0.92 m/s (v)**" | **2.00**, **1.00** | 2.00 × 0.92 = **1.840**, 1.00 × 0.92 = **0.920** |

S6 also contradicted itself: it states `v = 1.0` and then calls 1.84 "2v". The canvas was right
throughout (`nlbFx(Math.abs(pv), 2)`); the narration was wrong. **On S2 — the PRIMARY aha state —
the sim was telling the student a number the screen does not show.**

The error had propagated into two more places, both now fixed: `aha_moment.visual_confirmation`
and `STATE_2.misconception_watch[0].visual_counter` (the aha's own stated visual proof).
Four strings corrected; `grep` for `0.55 m/s|1.84 m/s|0.92 m/s` now returns **0**.
`tsc` 0 · `pure_rolling` PASS · 151/151.

### ✅ N5 — **FIXED**, and it supersedes B-14 with the right fix

B-14 was filed low-confidence off a screenshot, guessing the label needed a new glyph. The audit
found the opposite: the engine default is **already correct** (`NLB_SLIDER_SPEC.mu_k … glyph:
"μₖ"`), and the concept was *overriding* it with ASCII via `label: "μ_k"`. **The fix is to DELETE
the key**, not author a glyph — the override path is `o.label ? o.label : sp.glyph`. Deleted; its
three siblings (`v₀`, `ω₀`, `R`) already rendered correctly, so this was an isolated regression
against a working default. **B-14 CLOSED.**

### 🔴 N1 (MAJOR, `peter_parker:field3d_surgeon`) — 13 of 15 glow windows are unreachable AND they dim the teaching layer instead of lighting it

Every SEAM-R overlay is a pooled child of `nlb_roll_group` and is deliberately never registered
(`field_3d_renderer.ts:46597-46600`), while `nlbEach` walks only `nlbIndex` and matches on
`ud.id === focal || ud.elementType === focal || ud.bodyId === focal`. So a `glow_focal` naming a
roll-layer child **cannot match anything — but still sets `focal` truthy**, which sets
`glowActive`, which sends every registered object down the *peer* branch to
`GLOW_DIM_OPACITY = 0.4`. The registered `nlb_roll_group` therefore drags the **entire** overlay
layer — bracket, marks, rim dot, cycloid, every point arrow and label, skid trail, zero markers —
to 40%, **with nothing lit**.

Only 2 of 15 authored windows resolve (`nlb_body_nlb_wheel_roll` S3, `nlb_body_wheel` S7 — both
registered bodies). Pixel confirmation: S4 inside its 900–1200 ms window is visibly *dimmer* than
outside it, and nothing is brighter in either frame; S7 (a registered body) is the positive
control and is plainly lit.

**Two consequences worth the founder's attention:** (1) the skeleton's entire §3 "glow walk" — the
only sequencing mechanism S4/S5/S6 have left after per-arrow reveal was ruled out — is inert;
(2) **the mitigation adopted for the existing OPEN scar row is defeated by the channel it moved
to.** That row's remedy was "author no `glow_focal` so `glowActive` stays false"; the skeleton
moved the focal from state level into `phases[]`, but the renderer reads `eng.glow_focal ||
nlb.glow_focal` — the same variable. `glowActive` goes true either way, and because the id cannot
match, **both** halves of every relation dim, which is strictly worse than the one-half dimming
the row was filed for.

### 🔴 N3 (MAJOR, `alex:architect`) — the framed-extent rule makes the apparatus 1–3% of canvas on EVERY state; B-13 and B-19 are symptoms

Measured off the 1280×720 frames: the 6 m plank spans ≈180 px (S1), ≈287 px (S2 — the *closest*
camera), ≈223 px (S4), ≈189 px (S8), so the 0.5 m wheel is **15–30 px tall**. Every teaching
payload in this concept lives at wheel scale — the cusp, the rim dot, mark spacing, the three
point arrows, the contact marker.

Root cause is upstream of json_author: the skeleton's camera plan sets framed extent = full run +
one body diameter (4.0–6.4 m) for a 0.5 m body. **This is the parent of B-13 (label collision),
B-19 (bracket illegible) and the OPEN row `close_camera_framed_extent_is_authored_as_the_run_length_and_omits_the_body_radius`** —
four symptoms of one design rule. The engine already exposes `camera_target_m` (S2 uses it), so a
wheel-scale follow camera needs **no engine work** — but it does need an architect decision, not a
per-state camera tweak, which is why it is not being fixed blind here.

### 🔴 N4 (MODERATE, `alex:json_author` — MINE, NOT fixed) — all seven assessment answers are keyed "A"

Verified: `pr_q1..pr_q7` → `A A A A A A A`, one distinct key. Gates 20a–20d pass mechanically
(real misconception distractors, physically correct keys, 7 distinct `tested_idea`,
`parallel_form_stem` on all 7) — but **a student who always answers A scores 100% on both the pre-
and post-test, so the instrument cannot measure the learning it exists to measure.** No machine
gate checks key distribution.

**Deliberately NOT fixed in this pass.** Re-keying means reordering options, and
`distractor_misconceptions` is keyed *by letter* — a careless shuffle silently detaches every
distractor from its misconception, turning a measurable defect into an invisible one. It needs its
own careful pass with the distractor map re-mapped in lockstep, not a find-and-replace at the end
of a long session.

### N6–N9 (MINOR/MODERATE, `alex:json_author` — MINE, filed not fixed)

- **N7 (MODERATE)** — **S5 is the only state with no `readouts` key at all**, confirmed on pixels
  (no top-right panel, unlike its seven siblings), while its own label asserts "omega = 4.0 rad/s"
  with no instrument to confirm it (Rule 33d). Compounding: S5 teaches "equal in speed, *opposite*
  in direction", but point labels print absolute values, so top and bottom both read `1.00 m/s` —
  the direction contrast rests entirely on two ~50 px arrow stubs at the N3 camera distance.
- **N8 (MODERATE)** — S8's rendered label ("change speed, radius, **starting spin** and
  **friction**") names concepts first taught in S7 [advanced], so the hide-advanced cut is
  incoherent **on the narration alone**, independently of how the B-17 slider ruling lands. Also
  confirms B-17's blocker from the other side: `min_ring` and `presets` are **not schema fields**,
  so the skeleton's per-control `min_ring` table and its three DoD presets have no representation
  in the shipped file.
- **N6 (MINOR) — DISAGREEMENT, recorded rather than silently resolved.** The audit reads `label`
  as a rendered surface, so Rule 30's expand-bare-symbols carve-out would not cover it, making
  S5's "omega = 4.0 rad/s", S6's mixed "omega … Rω", S7's "v0" and S3's "m/s squared" violations.
  **This desk's filed position (B-16) is the opposite** — `label` renders in the subtitle strip,
  i.e. it IS the narration, where Rule 30 *requires* bare symbols expanded to spoken names. Both
  readings are defensible and they give opposite instructions. **Needs a doctrine call; nothing
  changed either way.**
- **N9 (MINOR)** — Rule 41 register in rendered strings: S1 "v and Rω **sit equal**" (figurative),
  S8 "as the numbers **dictate**" (personification, 41a bans it by name), S2 "comes to a **cusp**"
  (geometry jargon in the subtitle strip — the state's own TTS correctly says "comes to rest").
  *S2's was fixed incidentally by the N2 rewrite; S1 and S8 remain.*

### Gate 0 — DoD rows now stale (owner `alex:architect`)

- **"Turns counter (S8) `turns 3`" is UNBUILDABLE** — the `readouts` enum has no `turns` member,
  and DoD (i-1)'s reduced-preset coherence argument leans on that counter. (This desk pre-flagged
  the absence during authoring; it is now a live DoD contradiction, not just a gap.)
- Slider labels shipped as bare glyphs vs the DoD's named rows.
- **"`f 0.00 N` on the roller": S3's HUD prints `f_k` for BOTH bodies — B-12 manifests on this
  concept too**, not only on the sibling.
- DoD names `mode` values (`rolling_intro_circumference` …) that do not exist; `mode` is a closed
  14-member enum and the JSON correctly ships `coast_no_force` / `coast_with_friction` / `sandbox`.

### Recorded PASSES (so they are not re-audited)

Registration: all 8 sites correct and drift-free, `PCPL_CONCEPTS` correctly *absent*,
`PILOT_CONCEPTS` 0 hits and `visual_baselines/` empty — both correct for an unsealed concept.
Console: 0 errors / 0 pageerrors / 0 failed requests across all 8 states on port 8111 (4 warnings,
all headless-WebGL `ReadPixels` stalls). Layout: `0 collisions across 8 states`. Word budget: all
8 within Rule 31. Delta cues ≤5 words on all 8. Anti-plagiarism: clean. Rule 35: spotless.
Per-line formula reveal verified working (S6 line 1 present at t=2000, line 2 correctly absent).

---

## 🔴 B-13 SCOPE BROADENED + ESCALATED TO CRITICAL — 2026-08-06 pre-seal walk

**B-13 was filed as "point_arrow labels overlap on S4/S5/S6" (MODERATE, `alex:json_author`,
camera distance). Both the scope and the severity were wrong.**

**It affects EVERY state using `contact_layer.point_arrows`, including the two-label case** —
confirmed by the eye-walk on S2 and S8, and **verified independently in the main session** by
cropping S2's frozen frame 4×.

**The escalation: `pure_rolling` STATE_2 is the concept's designated PRIMARY aha state.** Its
`aha_moment.visual_confirmation` requires *"the centre arrow keeps reading 0.55 m/s and the
contact marker holds 0.00 m/s"* — and those are **exactly the two labels that collide**. On the
frozen frame they render stacked with near-zero vertical separation, the lower one partly
occluded by the wheel mesh, in low-contrast blue-on-dark; the contact reading is effectively
unreadable. The clean values exist in the top-right HUD, so the number is *available* — but the
point-adjacent overlay the aha explicitly leans on is not. **A state cannot ship failing its own
stated Definition of Done.**

**Compounding, and already OPEN:** the queue row
`state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach` already names
`pure_rolling` and is live here — S2/S4/S5/S6 each author sequential single-point `glow_focal`
phases while the claim is a *relation* between 2–3 simultaneous point speeds. During any one
phase the non-focal labels are dimmed, on top of the physical collision. **Same overlay code
path — fix together or the second fix will look like a regression of the first.**

**Owner is genuinely ambiguous and should not be guessed:** the cheapest lever is
`camera_position` (`alex:json_author`), but pulling the camera closer does not stop labels
stacking, and the 2-label case proves it is not a "too many labels" problem. A label-layout
separation rule in the `point_arrows` overlay (`peter_parker:field3d_surgeon`) is the durable
fix. **Recommend the surgeon, with the camera as a fallback if layout is out of scope.**

**Still deliberately NOT fixed** (standing instruction, and correctly so — the camera cannot be
re-tuned blind while B-5/B-10/B-11 are open). **But B-13 now blocks the seal on its own merits,
independently of B-5** — it is no longer a cosmetic tail item.

### Also from the pre-seal walk (not fixed, recorded)

- **B-19 (MODERATE)** — `pure_rolling` S1's revolution-mark bracket and tick numerals are
  *correct* (`2πR = 1.57 m`, ticks space one per completed turn) but render at roughly 10–14 px
  in a 1280×720 frame, and that bracket **is** the state's whole stated payoff. Either a closer
  `camera_position` for S1 or a glyph-size floor independent of camera distance. Owner ambiguous,
  same pair as B-13.
- **Observational, for founder taste (not filed):** S7's capture reads as a strong *number*
  story — v falling, Rω rising, contact falling, `f_k` stepping to 0.00 N exactly at the
  ~1.36 s closed-form capture instant — but a weak *picture* story: the only on-mesh spin cue is
  a small rotating cross-marker. The skid trail freezing at the capture point while the wheel
  runs on past it is the one genuinely legible visual mechanism. Not blocking.
- **Checked and CLEAN** (two OPEN queue rows whose failure modes did NOT reproduce): no
  camera-edge clipping of the body in any sampled frame (`close_camera_framed_extent…`), and no
  zero-arrow collapse — a distinct marker glyph renders at exact-zero points and S6's top/centre
  arrows show a visibly correct 2:1 length ratio (`velocity_arrows_routed_through_a_force_arrow_map…`).
  Worth re-checking the second once labels stop obscuring the arrow bases.

---

## PRE-SEAL AUTHORING AUDIT (text only, no frames) — 2026-08-06

Both concepts audited against Rules 41 / 35 / 38 and the prerequisites ruling, on text alone.
**Nothing fixed this session** (narrow-session instruction) — this is the bounce-list to clear
before Checkpoint B.

**Method note that changed the result:** for `field_3d`, `epic_l_path.scene_composition` text is
**NOT rendered** — only `field_3d_config.states` reaches the canvas. Confirmed here: S1's
`scene_composition` says *"2 pi R"* while the pixels show *"2πR"* from the `label` field. A first
pass flagged ~8 ASCII-math violations that were all doc-only. **Audit the rendered fields, not
every string in the file.** The rendered surfaces are: `caption` (on-canvas delta cue),
`label` (subtitle strip = narration), `formula_lines[].text`, body labels, slider labels.

### ✅ B-15 — **FIXED 2026-08-06.** All 8 labels rewritten as teaching narration.
> Rewritten, not tidied: every ms timing, engine verb (*halt-latches / retires / activates /
> re-synchronises*), raw world coordinate, `wu`, and ASCII variable is gone. All 8 now sit at
> **39–43 words** (Rule 31 budget 25–55; S8 was previously 18, below the floor). Verified by
> re-scan: zero residual hits. `tsc` 0 · `rolling_on_incline` PASS · 151/151.
> **Not yet seen on pixels** — a re-walk is owed once B-5/B-10 land. Original finding below.

### 🔴 B-15 (as filed, MAJOR, `alex:json_author` — DESK B's own) — `rolling_on_incline`'s subtitle strip renders AUTHORING DESIGN NOTES, not narration

**7 of its 8 rendered `label` strings are design notes**, carrying millisecond timings, engine
verbs, raw world coordinates and ASCII variable names. These render in the strip below the canvas
— confirmed on pixels: S3's frozen frame shows this text verbatim to the reader.

| state | rendered subtitle |
|---|---|
| S2 | *"…rolls **+2.4 to +0.4**, rim dot cusps at **754 ms**, **halt-latches at 1204 ms**…"* |
| S3 | *"**0-1500 ms**: a locked block skids alone (**mu_k** = 0.15, a = 2.809, **+2.4 to -0.76**). At **1500 ms** the block **retires** and a rolling disc **activates** at **+2.4**…"* |
| S5 | *"Sphere **halt-latches at 1265 ms**: **KE_trans** 7.0 J, **KE_rot** 2.8 J…"* |
| S6 | *"…f_s **1.243 to 0.414 wu**, a jumps to 2.76. **Halt 4305**"* |
| S7 | *"…**ramping** to 0.05 over **600-1600 ms**… label **flips** f_s to f_k… **Halt-latches** at 1968 ms with f_k = 0.44 N **latched**"* |
| S8 | *"…the four-body race **re-runs live and re-synchronises at each restart**"* |
| S1 | *"Four shapes at **theta = 25 deg**… (**1744/1805/1903/2085 ms**) and stamp 1-2-3-4"* |

**Rule 41c test — "a Class-11 student with textbook English must understand every word without
asking":** *halt-latches*, *retires*, *activates*, *re-synchronises*, *param ramp*, and **`wu`
(world units — an internal renderer unit with no physical meaning)** all fail it. Millisecond
timings and signed track coordinates are authoring metadata, not teaching. This also breaches
Rule 24/34 (the strip is for prose narration).

**The asymmetry is the diagnosis.** `pure_rolling`'s eight labels are genuine teaching narration
— *"The wheel rolls at v = 0.90 m/s; each completed turn advances it exactly one circumference,
2πR = 1.57 m; v and Rω sit equal"* — clean, literal, correct Unicode. Same desk, same authoring
session, same author. **`rolling_on_incline`'s `label` field was populated with the design table
instead of the narration.** It needs a rewrite of 7 strings, not a wording tidy.

### ✅ B-16 — **FIXED 2026-08-06.** `"v equals R omega"` → `"v = Rω"`, in BOTH the rendered
`caption` and its `epic_l_path.delta_cue` mirror (two occurrences, kept consistent).

### B-16 (as filed, MINOR, `alex:json_author` — DESK B's own) — one caption breaks Rule 34c

All 16 captions audited; **exactly one** uses ASCII where the canvas convention is Unicode:

- `rolling_on_incline` S2: **`"v equals R omega"`** → should be **`"v = Rω"`**.

The other 15 are clean, and both concepts already use Unicode correctly elsewhere
(`2πR`, `Rω`, `sinθ`, `f·R = I_cm·α`, slider labels `ω₀ μₛ θ m₂`) — so this is an isolated slip,
not a systematic gap. (Note the sibling `label`/narration fields spelling out *"omega"*/*"theta"*
are **NOT** violations — Rule 30 requires bare symbols expanded to spoken names in narration.
Only the on-canvas caption is governed by 34c.)

### ⚠ B-17 (needs a RULING, not a fix) — the explore state exposes controls first taught in the advanced ring

Rule 38b: *"the explore state surfaces CORE-ring content only… a ring-neutral sandbox inheriting
advanced content is incoherent under every reduced preset."*

| concept | explore controls | first introduced in |
|---|---|---|
| `pure_rolling` | `v0, R, omega0, mu_k` | `v0` first appears in **S7 [advanced]**; `omega0`/`mu_k` appear **nowhere but S8** — they are S7's capture parameters, never taught as controls |
| `rolling_on_incline` | `m, m2, R, R2, theta, mu_s` | `theta` first appears in **S6 [advanced]**; `mu_s` in **S7 [advanced]** |

Under a core-only preset both advanced states are hidden, so a teacher gets a `μ_s` / `ω₀` dial
whose physics was never taught. **Not asserted as a violation** — the opposite reading is
defensible (38b's stated target is advanced *formulas*, and sliders are manipulation, which is
explicitly the explore state's job). **This needs a founder/doctrine call, and it is cheap to
honour either way** (drop the dials from the reduced preset rather than from the state).

### PASSES — audited and clean, recorded so they are not re-audited

- **Rule 35 (no country-specific culture):** ✅ both. Zero hits across every rendered string.
  Anchors are universal — *"a bicycle wheel crosses the road"*, *"a food can beats a roll of
  tape"*. No region-dependent constant is asserted as THE value.
- **Rule 38a (ring order + coherent-when-cut):** ✅ both. `pure_rolling` core S1–S3 / extended
  S4–S6 / **advanced S7** / explore S8; `rolling_on_incline` core S1–S4 / extended S5 /
  **advanced S6–S7** / explore S8. In both, the advanced ring is a **contiguous block immediately
  before the explore state**, and the explore state is tagged `core`.
- **Rule 38g (`curriculum_tags` are claims):** ✅ both. 5 rows each; **0 unverified rows missing
  `needs_teacher_verification: true`**. Both carry an honest `verification_note` stating no
  web-search verification was run and that only the CBSE/NCERT row is confidently verified.
- **Prerequisites (founder ruling — name JSON-less ids where the dependency is real):**
  ✅ both comply. `pure_rolling` names 3 JSON-less ids (`rotational_kinematics`,
  `tau_eq_i_alpha`, `moment_of_inertia`) + 1 real (`friction_force`); `rolling_on_incline` names
  3 JSON-less (`moment_of_inertia`, `tau_eq_i_alpha`, `rotational_work_energy`) + 2 real
  (`pure_rolling`, `friction_force`). The ruling is honoured, not worked around.

---

## Naming reconciliations — design doc vs. what shipped (not defects; recorded so no desk re-derives them)

| Design doc says | Engine shipped | Where |
|---|---|---|
| `formula_overlay` becomes an ordered line list | a **separate** key `formula_lines: Array<{text, at_ms?}>`; legacy `formula_overlay` string untouched | `:1644` |
| readout tokens `'Rω'`, `'ω'` (physics_block §F.2) | ASCII `'Romega'`, `'omega'` — Unicode is display-only | `:1540-1541` |
| new `mode` values (`rolling_contact`, `rolling_intro_circumference`, …) | **`mode` is a closed enum of 14 pre-SEAM-R members**; no rolling modes exist. Only `'sandbox'` has behavioural consequence (Rule 37 / trusted-drag); the rest are inert labels | `:1070-1074` |

Both bought timed fields ARE registered in `deriveStateMeta.ts` as the design required —
`activate_at_ms` at `:2814`, `formula_lines[].at_ms` at `:2829`. THE EYE will pin correctly.

**The Phase-0 alarm rule did NOT fire in this pass:** no third timed field class was needed or
found. Every authored millisecond in `pure_rolling.json` is a `phases[].glow_focal` window, a
`formula_lines[].at_ms`, the single `activate_at_ms: 1500`, or a physics event.
