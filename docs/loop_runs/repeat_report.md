# push-off REPEAT cycle — engine seam report

> 2026-07-29. Engine-only session on `feat/lom-a` in `C:\Tutor\physics-mind-lom-a`. ONE `bug_class`.
> NO concept JSON authored or edited. NO DB write. One `field3d-surgeon` dispatch, one commit.
> Prior seams: `d9d07a0` (push_off phase + `fixed` body), `208a8ba` (spring geometry + glow + lane),
> `docs/loop_runs/push_off_report.md`.

**bug_class:** `nlb_push_off_interaction_dies_after_release_leaving_96pct_of_the_state_empty`

## 0. The problem this closes

The push-off apparatus was correct at `t = 0` — compressed spring, both equal-and-opposite arrows,
HUD `F = 30.00 / −30.00 N`, `a = 7.50 / −2.50 m/s²` — but contact lasted `release_at_ms = 420 ms` of an
~11 **second** state. Past release both forces go to 0, so the arrows hide, the spring hides (past natural
length) and the HUD reads 0.00: **96% of the state was two blocks sitting apart**, and the canonical frozen
reviewer frame landed in that dead zone showing none of the lesson.

Unfixable by authoring. A spring push-off with classroom-visible force magnitudes is inherently fast
(`t = sqrt(2·stroke/a_rel)`; a 2 s contact out of the 0.88 m stroke needs ~1.3 N, far under the arrow-length
floor), and the state can't be shortened to 2 s because Rule 31 requires 25–55 words of narration = 10–20 s.
So the interaction now **repeats inside the state, the way a teacher repeats a demo.**

## 1. What landed

| File | Diff | Region |
|---|---|---|
| `src/lib/renderers/field_3d_renderer.ts` | +110/−1 (**20 lines of code**, rest doc block) | `nlbRunPushOff` (~31217) · `applyNewtonsLawsBodyState` eng literal (~31290) · `nlbResetTrajectory` (~31583) · `Field3DConfig.push_off` type (~936) |
| `src/lib/validators/visual/deriveStateMeta.ts` | +54/−1 (**12 lines of code**) | `maxRevealForField3dState`, the `push_off` branch (~1749–1810) |
| `docs/loop_runs/lom/_engine/scar_candidates.sql` | +95 (text only, commented `INSERT`s) | 4 rows |
| `src/scripts/_scratch_nlb_repeat_probe.ts` | NEW | the Playwright probe (precedent: `_scratch_nlb_bringup.ts` is committed) |
| `.gitignore` | +1 | `/.scratch_nlb_repeat/` (the probe's PNG output) |

### The engine change — the whole of it

The contact test now reads `phase` instead of the raw clock; everything else in the gate is untouched.

```js
var rep = (typeof po.repeat_every_ms === "number" && isFinite(po.repeat_every_ms)
    && po.repeat_every_ms > 0 && po.repeat_every_ms > t1) ? po.repeat_every_ms : 0;
if (rep && (window.PM_nlbSweepSeized || window.PM_nlbBodyDragged)) rep = 0;   // Rule 37 — seized
var phase = tMs;
if (rep) {
    var cycle = Math.floor(tMs / rep);
    if (eng._po_cycle == null) {
        eng._po_cycle = cycle;                   // entry / post-rewind: adopt, never fire
    } else if (cycle !== eng._po_cycle) {
        var tKeep = eng.t_ms, tKeepPub = window.PM_nlbTimeMs;
        nlbResetTrajectory();                    // the ONE rewind path
        eng.t_ms = tKeep;                        // the master clock stays monotonic
        window.PM_nlbTimeMs = tKeepPub;
        eng._po_cycle = cycle;                   // AFTER the rewind (which nulls it)
    }
    phase = tMs - cycle * rep;
}
var inContact = (phase >= t0) && (phase < t1);
```

Plus two one-line memo inits (`_po_cycle: null` in the `eng` literal, `eng._po_cycle = null;` in
`nlbResetTrajectory`) and the authoring type.

**Single rewind path, as required.** The re-arm calls `nlbResetTrajectory()` — every body's `s`/`v` back to
its `s0`/`v0` seed, the spring re-fitted from the home positions, the one-shot latches re-armed. No second
rewind implementation exists to drift from it.

**Clock rebase — the choice made.** `nlbResetTrajectory` zeroes `eng.t_ms`, which here would be a latch
(`phase = 0` forever ⇒ permanently in contact). Rather than thread a "keep the clock" flag through a function
with four other call sites (where zeroing is *correct*), the call is wrapped in a save/restore of `eng.t_ms`
and its published mirror `window.PM_nlbTimeMs` — 3 lines, and the exception stays inside the one caller that
needs it.

**Accepted re-arm side effects.** `nlbResetTrajectory` also clears `phase_fired`/`phase_active`, restores
`glow_focal` to `base_glow_focal`, and nulls `_sweep_last`/`_ramp_last` — right in spirit for "the demo runs
again", and the churn guards are idempotent. One consequence: because `nlbRunPhases` runs *before* the gate in
the same frame, a still-open `phases[]` entry that owns the focal hands it back for exactly **one frame** at
each re-arm before re-firing. Phases gate on the raw monotonic clock (unchanged), so a closed window does not
re-open, and no re-arm can fire under a freeze pin — so no frozen frame can catch that frame.

## 2. The exact authoring surface

On the per-state `newtons_laws_body.push_off` block — one new optional key, everything else as
`push_off_report.md` §2 documents it:

```ts
push_off?: {
    body_a_id: string;
    body_b_id: string;
    force_N: number;          // magnitude applied to EACH body, equal and opposite, during contact
    release_at_ms?: number;   // contact ENDS here; default 0 = released immediately
    contact_from_ms?: number; // contact BEGINS here; default 0
    repeat_every_ms?: number; // re-arm the WHOLE interaction on this cycle; omit = fire once
};
```

Semantics: `cycle = floor(t/R)`, `phase = t − cycle·R`, contact ⟺ `contact_from_ms ≤ phase < release_at_ms`;
on every cycle boundary the interaction re-arms through `nlbResetTrajectory()`. **Omit the key ⇒ behaviour
exactly as before.** A non-finite, `≤ 0`, or too-short (`R ≤ release_at_ms`) value is **ignored** — degrades
to single-fire, never divides by zero, never renders a permanently-stuck spring. `R ≤ release_at_ms` is an
author error; it is *not* validated here (validator candidate logged instead — §5 row 2).

The authoring contract from `push_off_report.md` §2 still binds in full (spring position `|s_a − s_b|`,
body-a on the positive side, `release_at_ms` from the geometry, no `'F'` in `controls_visible` on a guided
push-off state, `glow_focal: "nlb_spring"`, ≥ 15 N arrow floor).

## 3. How a state should pick `repeat_every_ms`

`R` is bounded below by the phase arithmetic and above by the track length.

1. **Floor (hard):** `R > release_at_ms`, else the phase never escapes the contact window (and the engine
   ignores it). Practical floor `R ≥ release_at_ms + 1000` — the separation needs a beat to read before the
   reset.
2. **Ceiling (soft, geometric):** the coast beat is `R − release_at_ms`. Each body coasts at
   `v = force_N · (release_at_ms/1000) / m` and is clamped at `±length_m`, where it stops dead. Keep
   `(R − release_at_ms)/1000 · v_fast ≤ length_m`, else the carts park against the surface bound for the tail
   of every cycle (measured; §5 row 3).

General form: **`R = release_at_ms + 1000 · min(1.5…2.2, length_m / v_fast)`**.

Worked, for the founder's case (30 N, 4 + 12 kg, `release_at_ms = 420`) → `v_A = 3.15 m/s`, `v_B = −1.05 m/s`:

| `length_m` | clamp reached at | usable `R` band | recommended | repetitions in an 11 s state |
|---|---|---|---|---|
| 6 | 1.90 s | 1420 … 2320 ms | **2200** | 5 (420 ms push + ~1.78 s coast + home pose) |
| 8 | 2.54 s | 1420 … 2950 ms | **2600** | 4 (420 ms push + ~2.18 s coast) — the probe's config |

(`R = 2600` on `length_m = 6` *does* park the carts at the ends for the last ~0.7 s of each cycle — measured,
logged as a MODERATE authoring scar, not an engine bug.)

## 4. The frozen-frame half (`deriveStateMeta.ts`)

Single-fire pins at `release + 2000` — the *separation* coast beat, which is exactly what produced the empty
canonical frame. A **repeating** push-off inverts the taught beat: it *is* the recurring interaction, so the
pin must land inside a contact window.

```ts
if (rep > 0 && release > contactFrom) {
    const offset = contactFrom + (release - contactFrom) * 0.35;
    const base = Math.max(DEFAULT_REVEAL_MS, ...candidates);
    const wanted = Math.max(0, Math.ceil((base - offset) / rep));
    const ceiling = Math.floor((DURATION_MAX_MS - offset) / rep);
    const cycle = Math.max(0, Math.min(wanted, ceiling));
    candidates.push(cycle * rep + offset);
} else {
    candidates.push(release + NLB_PUSH_OFF_COAST_MS);   // byte-identical single-fire path
}
```

- **Offset = 35% into the contact window** — fractional, not a fixed cushion, so it scales with any authored
  window and is clear of both edges by construction: never the entry/re-arm frame (pose still the untouched
  home seed), never the frame where the forces just went to 0.
- **Cycle = the first contact window at or after every other candidate**, because the caller returns
  `Math.max(...candidates)`: a late authored phase would otherwise out-vote the pin and drop it back outside
  contact.
- **The `DEFAULT_REVEAL_MS` floor is load-bearing** and caught a real trap: a cycle-0 pin at 147 ms is
  silently raised by `clampReveal` (`Math.max(DEFAULT_REVEAL_MS = 1500, …)`, 300 lines away in
  `deriveMaxRevealTimeMs`) to 1500 ms ⇒ phase 1500 > release 420 ⇒ straight back into the dead zone. Logged as
  a general scar (§5 row 4).

**`deriveMotionExpectations` / `deriveHoldExpectations` deliberately unchanged — a verified answer, not a
skip.** `deriveMotionExpectations` has no `newtons_laws_body` branch ⇒ the state derives `undefined` ⇒ D5
asserts nothing about its pixels. `deriveHoldExpectations`' nlb branch gives a non-sandbox state
`reveal_hold`, which in `pixelGate.ts` (lines 163, 323) only *relaxes* the stuck/static checks and never
asserts stillness. So a continuously repeating push-off cannot false-fail on moving pixels in the tail. The
reasoning is recorded in a comment so it isn't re-litigated. No `potential`-block logic touched.

## 5. Rule 36 / Rule 37

**Rule 36 (verified, not asserted).** `eng.t_ms` advances only by the dt handed to
`updateNewtonsLawsBodyFrame`, and `animate()` passes `heldAtPin ? 0 : dtStep`. Under a pin dt = 0 ⇒ `t_ms`
unchanged ⇒ `cycle` and `phase` unchanged ⇒ the cycle-change branch is unreachable ⇒ **no re-arm, same force
bit-for-bit, positions untouched.** The only frame memo is `_po_cycle`, and a `null` memo *adopts* instead of
firing, so the first frame after a freeze-pin entry — and any state re-entry, where
`applyNewtonsLawsBodyState` has just written the seed — cannot fire a spurious re-arm (no double-rewind).
Step-fold is exact: `t_ms` is linear in dt and the cycle is re-derived every frame, so N micro-steps folded
into one `dtStep` land on the same cycle; skipping a whole cycle needs `R < ~50 ms`, which the guard rejects.
No literal `0.016`, no second clock, no accumulator. Measured: 40 held frames at the pin gave one distinct
`t_ms` (5344), one distinct `sA`, zero re-arms, and byte-identical screenshots (31361 vs 31361 bytes over 20
more held frames). No shared integrator was touched (`__pmSteps`/`dtStep`/`animate()` untouched) ⇒ **Rule 36b
fleet re-verify NOT warranted.**

**Rule 37.** The prior seam's `if (eng.mode === "sandbox") return;` already makes the whole gate inert in a
sandbox state, so the cycle cannot fight a teacher there — nothing added for that case (probe: 400 sandbox
frames, 0 re-arms, `push_off_contact` never set, even with `repeat_every_ms` authored). What that carve-out
does *not* cover is a **guided** state with `trusted_drag_seizes`, so the repeat additionally cancels on
`PM_nlbSweepSeized || PM_nlbBodyDragged` — the same latches `idle_auto_sweep`/`param_ramp` honour, both
cleared on state entry. Once seized the gate degrades to single-fire on the raw clock (already past release ⇒
forces 0) rather than continuing to push carts that are no longer touching. The seize check gates the
**repeat only**, never the force gate, so the omitted-key path stays bit-identical.

## 6. Verify chain

Independently re-run by the orchestrator after the surgeon's own run — both green.

| Check | Result |
|---|---|
| `npm run check:renderer-syntax` | field_3d **syntax OK (2204 KB)** · particle_field **OK (220 KB)** |
| `npx tsc --noEmit` | **0 errors** |
| `npm run validate:concepts` | **127 PASS / 0 FAIL**; registration cross-check ✓; warning profile identical to the seam-B baseline |

**(a) Omitted-repeat bit-identity, by inspection.** With the key absent `rep = 0`, so `phase` is initialized
to `tMs` and never reassigned (the `if (rep)` block is skipped entirely), and
`inContact = (phase >= t0) && (phase < t1)` is the same expression on the same value as the previous
`(tMs >= t0) && (tMs < t1)`. `_po_cycle` is never read or written; `nlbResetTrajectory` is never reached. No
concept JSON on this branch authors `push_off`, so the statically-false path is the only path any locked
baseline can take.

**(b) Node probe — `src/scripts/_scratch_nlb_repeat_probe.ts`.** Drives the **real renderer code path**, not a
mirrored copy: `assembleField3DHtml()` → scratch HTML → Playwright chromium with real Three.js, the real
`animate()` master clock, the real `nlbRunPushOff`/`nlbResetTrajectory`, on the same deterministic
virtual-clock harness `_scratch_nlb_bringup.ts` uses. Every reported number is read out of the live
`window.PM_nlbEngine`; only the *expected* values are re-computed in the probe. `ALL CHECKS PASSED`:

- **A — repeat omitted (700 frames):** gate identical to the raw-clock test (24 contact frames, expected 24);
  contact is ONE unbroken run, t = 48…416 ms; 0 re-arms; cycle memo stays `null`; `F_A/F_B = 30/−30` during
  contact; **and the founder's dead zone reproduced** — 676 of 700 frames with both forces 0 (96.6% empty),
  tail frame `t = 11248, F_A = 0, sA = 6.00, sB = −6.00`.
- **B — `repeat_every_ms = 2600`:** contact ⟺ `phase ∈ [contact_from, release)` on **every** frame (0
  mismatches of 700); re-arm fires **exactly once per cycle boundary** (4 re-arms at t = 2608, 5200, 7808,
  10400 ms), each in the first frame of its cycle; each re-arm rewinds `s`/`v` to the authored seed while the
  previous frame was at `sA = 6.00 m` (so it really rewound); clock monotonic across every re-arm; contact
  recurs through the tail (130 contact frames, 18.6% of the state — vs 3.4% single-fire).
- **C — `SET_TIME_FREEZE`:** `t_ms`, cycle and phase all frozen; **0 re-arms in 40 held frames**; force and
  positions bit-identical; **the pin lands IN CONTACT** (5347 ms → `contact = true, F_A = 30`); frozen pixels
  byte-identical over 20 more held frames.
- **D — Rule 37:** a seize stops the repeat for good (0 re-arms in 400 post-seize frames, gate degrades to
  single-fire); sandbox inert. No page errors.

Pin arithmetic driven through the real exported `deriveMaxRevealTimeMs`: single-fire (omitted, release 420) →
`2420` (unchanged); repeat 2600/release 420 → `2747` (phase 147, in contact); contact 200…620 → `2947`
(phase 347); with a phase at 7000 → `7947`; with `param_ramp` end 9000 → `10547`; repeat 1500 == clamp floor
→ `1605` (phase 105); repeat 3000/release 900 → `3315` (phase 315); at the 40000 ceiling → `41747`; and
`0 / 300 (<release) / NaN / −2600` all degrade to `2420`. Every repeat case lands in contact.

**(c) Pixel evidence** (surgeon's own fixture, not a concept): the frozen frame at cycle 2, phase 144 ms shows
the compressed spring wedged between the two carts near the home pose, both applied-force arrows drawn in
opposite directions, and the HUD reading `F = 30.00 / −30.00 N`, `a = 7.50 / −2.50 m/s²`,
`v = 1.20 / −0.40 m/s` — the picture the founder review said the canonical frame was missing.

**(d) Regression — shared-renderer leakage.**
`npm run cache:clear:scoped -- electric_flux` (deletes the cached sim ⇒ re-seed required) →
`_seed_electric_flux_cache.ts` → `npm run visual:eyes -- electric_flux` = **62 deterministic checks, 62
passed, 0 failed, $0.00**. `eye-walker` read all 211 frames across 10 states: **CLEAN** — no stray meshes, no
brightness/glow anomaly, no z-shift or mis-framing, no overlay leakage or clipping, no HUD/label regression,
no `push_off` apparatus visible anywhere; **zero** candidate `engine_bug_queue` rows, zero frames flagged for
founder eyes.

**Scope proof:** a contamination grep of the added lines for
`acr_|acl_|acc_|phs_|slcr_|pwr_|lco_|particle_field|parametric` returns exactly one hit, and it is a scar
*name* inside a comment. Zero code contamination; no sealed sibling internals touched.

## 7. Scar candidates (text only — appended to `docs/loop_runs/lom/_engine/scar_candidates.sql`, nothing applied to the DB)

1. `nlb_push_off_interaction_dies_after_release_leaving_96pct_of_the_state_empty` — CRITICAL, `incident`,
   status **FIXED** (fixed here; logged so the *class* is on the list). Probe: fail when the fraction of the
   state with contact open is < 0.10.
2. `nlb_push_off_repeat_every_ms_shorter_than_release_would_lock_permanent_contact` — MODERATE, `directive`,
   OPEN. The validator candidate for the guard implemented here as a silent degrade.
3. `nlb_push_off_repeat_coast_pins_carts_against_the_surface_bound_before_the_re_arm` — MODERATE, `incident`,
   OPEN. Measured in the probe; check `(R − release)/1000 · v_coast ≤ length_m`.
4. `field3d_reveal_pin_inside_a_narrow_window_silently_raised_by_clampreveal_floor` — MAJOR, `directive`,
   OPEN. The general `clampReveal` trap that bit the first draft of §4.

Still open from the prior seam (unchanged by this dispatch):
`nlb_push_off_release_window_outlives_the_spring_extension` (MAJOR) is a **founder call** — deriving the
release instant from the geometry would change `push_off`'s founder-approved force semantics. The `F`-slider-
inside-a-contact-window dead control likewise still awaits a decision (validator-forbid vs let the drag
rescale the magnitude).

## 8. Interpretive calls

1. **Save/restore `t_ms` around `nlbResetTrajectory`** rather than a flag (§1).
2. **`R ≤ release_at_ms` is ignored (degrade to single-fire), not clamped and not validated here.** Clamping
   would invent a cycle the author didn't write; a validator is a schema/alex change.
3. **The seize check gates the repeat only, never the force gate** — the omitted-key path stays bit-identical,
   at the cost of a guided seized state falling back to a dead tail (the honest "teacher took over" behaviour,
   matching `idle_auto_sweep`).
4. **35% into the contact window** for the pin — a judgement call the brief didn't name; fractional so it
   scales.
5. **Accepted the full `nlbResetTrajectory` side-effect set** as the correct semantics of "the demo runs
   again", rather than carving a partial rewind.
6. **`DEFAULT_REVEAL_MS` floor + `DURATION_MAX_MS` ceiling folded into the pin search** — slightly more than
   the literal ask, but without the floor the fix does nothing (§4).

## 9. Deliberately not done

No concept JSON authored or edited, so **there is still no live EYE proof on a real push-off concept** — no
state on this branch authors `push_off`, which is why the proof is inspection + the real-code-path probe. No
DB write, no migration, no seed-script row. No validator or schema change. No `visual:approve`, no TTS, no
deploy. No refactor of the shared rewind, the integrator, or `nlbFitSpring`. No `potential`-block logic
touched. No branch or worktree change. No Rule-36b fleet sweep (no renderer-clock edit).
