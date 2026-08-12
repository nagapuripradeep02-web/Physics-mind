# Engine findings — Desk C (`angular_momentum` · `rigid_body_rotation`) → build 0c-3

**Desk:** `feat/rotmech-c` · `C:\Tutor\physics-mind-rotmech-c`
**Owner of the fix:** Desk E (`peter_parker:field3d_surgeon`). Desk C never edits `src/`.
**Status: PASS 1 — filed with the `rigid_body_rotation` 0b design pass, 2026-08-04.**
Source of truth for full contracts: `docs/loop_runs/rotmech/rigid_body_rotation/skeleton.md`,
section "ENGINE REQUIREMENTS (0c-3)". This file is the mirror Desk E drains; append-only.

## 0 · One paragraph

Concept #3 (`rigid_body_rotation`, the concept — not the scenario of the same name) needs ONE
capability family on the frozen 0c-1 turntable: **massless point markers on the spinning body**,
with circular traces, a same-interval swept-arc compare, tangential v = ωr arrows carrying live
numeric labels, chord gauges, and one draggable marker-radius control. Rows C2/C3/C4 are the
SAME build items as Desk D findings §3/§4 (commit `c677482`) — one semantics, build once. The
advanced ring consumes the #2 translating-frame row and is cut cleanly if that row defers.

## 1 · Rows (full contracts in the skeleton; this is the drain list)

- **C1 — point markers** `point_markers[]` (id, r_m — 0 legal, angle_deg, plane rod|drum,
  label + reveal cue). MASSLESS: `rbrIOf` (`:49865`) untouched; a marker never changes I/ω/L
  (the #10-trap guard). Serves #3 + #4 (Desk D §3 body mark) + #6 precedent.
- **C2 — tangential v arrow + live value label per marker.** DEDICATED linear velocity map,
  TRUE ZERO drawable (never the force-arrow knee map `:49829` / MIN_LEN `:49795`); band
  0–2.85 m/s; label from one per-frame snapshot; blanks under `rbrBlanked`. = Desk D §4.
- **C3 — circular trace per marker.** Progressive, persistent, pure function of state-local t
  (the `rbrThetaAt` `:49958` rebuild pattern); bring-up probe: pin/rewind/re-pin byte-equal.
  Shares its drawing core with the #2 `cm_path_trace` declared member. = Desk D §4 option.
- **C4 — fixed base-frame start ray + swept-arc highlight + arc labels over ONE window.**
  The drum stripe (`:50322`) rotates with the body — verified unusable as the fixed reference.
  Same fixed-ray machinery Desk D §3 needs for the swept ANGLE.
- **C5 — chord gauge between two markers (or marker↔mass), live length label.** Constancy
  through spin AND through the C7 glide is the taught claim.
- **C6 — `r_point` control token** + slider row (reserved-slot pattern) + ramp/sweep plumbing
  for `param:"r_point"` (today only `"r"` is consumed — `:49852`/`:49858`). Sanctioned enum
  reopen; the 0c-3 brief must re-close `controls_visible` against the remaining served set
  (#4 α-drive/applied-torque per Desk D §5, #14 κ) with a declared/implemented split.
- **C7 — free-flight decomposition** (detach + constant-velocity glide while spinning, centre
  trace straight vs point trace looping, co-moving highlight circle, loop blank). This is #2's
  union row — #3 only CONSUMES it (advanced ring; cuttable).
- **C8 (P2, optional) — per-state camera pose.** No camera field in the rbr config
  (`:977-1059`); build pins one pose (`:50475`). APPEND rbr to the OPEN row
  `field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable` — do not mint a
  duplicate. Fallback accepted: default 3/4 view.
- **C9 — registration rider on every row:** deriveStateMeta co-edit (F3D_REVEAL_KEYS /
  maxRevealForField3dState / deriveHoldExpectations, both config shapes) + RBR_ELEMENT_TYPES +
  overlay flags map (`:50586-50613`; overlays default OFF) + no backticks +
  check:renderer-syntax.

All new fields optional (absent = byte-identical), legal-zero fields resolved by typeof,
everything closed-form accumulator-free (`:969-976`), meshes built once from the union.

## 2 · Scope findings (shrink 0c-3, do not grow it)

1. **`body_shape` variants are NOT required by concept #3.** The drum face IS the disc (dot
   line + rim ring of C1 markers); the rim ring IS the ring picture. The variants stay
   declared-inert unless #1 buys them for its own row.
2. **No `v` HUD row needed.** v is per-point; C2's per-marker live labels carry it. Concept #3
   will never author an unknown `readouts[]` token (silent skip, `:50162`/`:50236`). Desk C
   ENDORSES Desk D findings §2: make the unknown-token skip a `console.warn` in 0c-3.
3. **Concept #3 exposes NO r/m/tau_brake control anywhere** — sliding the masses under the
   L-conserving engine stages #10's conservation aha. Its explore state is ω₀ + r_point only.

## 3 · Cross-desk reconciliation note for Desk E

C2/C3/C4 here and Desk D findings §3/§4 describe the same mechanisms from two consumers. Build
each ONCE against the union of both contracts; if the two texts ever disagree, that is a
`two_skeletons_sharing_one_engine_build_state_different_semantics_for_the_same_bought_field`
event — stop and reconcile in the office, do not pick one silently.
---
## PASS 2 appendix — angular_momentum architect pass (append-only)

## 2026-08-04 · `angular_momentum` architect pass (alex:architect, Desk C) — two rbr findings

**F-C1 — sandbox live `tau_brake` drag is an INVISIBLE CAUSE (pad neither shown nor moved).**
Verified in `field_3d_renderer.ts` (read-only, this desk):
- Pad/arm/label visibility is decided ONLY from the AUTHORED per-state config —
  `padOn = (et.source||'brake')==='brake' && |et.tau_brake_Nm| > 0` (`:50626–50631`) — inside
  `rbrApplyVisibility`, whose SOLE call site is `applyRigidBodyRotationState` (`:50559`).
- A live sandbox slider drag goes through `rbrApplyParam('tau_brake', …)` (`:50079–50088`), which sets
  `eng.tau` and `eng.brakeOnMs` but NEVER `eng.padEngageMs` and never re-runs the visibility pass.
- The pad's pose is gated on `eng.padEngageMs` (`:50728–50744`); with it null the pad (if visible at
  all) stays PARKED while real torque decays L.
Consequence: any explore state authored with entry `tau_brake = 0` (the natural authoring — e.g.
`conservation_of_angular_momentum` physics_block §2 S8: entry tau_brake 0, "brake applies live τ_ext
while held > 0") applies a live external torque with NO rendered agent — the
`ghost_compare_cannot`-class invisible-cause defect (`ghost_compare_cause_invisible_slider_frozen`).
Suggested shape of the fix (Desk E's call): on a live tau drag crossing 0 → engage (set
`padEngageMs = now`, travel-in) and on a drag back to 0 → release (`padReleaseMs = now`); ensure pad
visibility whenever `eng.tau > 0`, not only when the authored config says so.
Desk-C mitigation meanwhile: `angular_momentum` EXCLUDES `tau_brake` from its explore
`controls_visible` entirely (its S2/S3 brakes are fully AUTHORED engage/release windows — the
implemented, correct path). Desk A should re-check #10's S8 against this before build:review.
Owner suggestion: `peter_parker:field3d_surgeon` (via Desk E). No DB write made from this desk.

**F-C2 — `RBR_L_ARROW_MIN` floor draws a NONZERO stub for L = 0 and distorts ratios below |L| ≈ 1.10.**
`RBR_L_ARROW_MIN = 0.22` (`:49797`), applied unconditionally in the frame update (`:50705–50707`) with
`RBR_L_ARROW_SCALE = 0.20`/(kg·m²/s). So any |L| < 1.10 renders longer than proportional, and L = 0
renders a visible 0.22-length arrow — a rendered lie in any beat that dwells at rest (e.g. a braked
stop, or `angular_momentum` S3's stop-and-reconfigure beat: L = 0.00 on the readout beside a nonzero
arrow). Request: suppress/hide the L arrow below a small ε (a true-zero draw), mirroring the
`velocity_arrows_…_cannot_draw_a_true_zero` prevention rule.
Desk-C mitigation meanwhile: `angular_momentum` authors `show_l_arrow: false` on S3 (and notes the
post-restart L = 0.99 is also inside the distorted band, another reason the readout carries that beat).
Owner suggestion: `peter_parker:field3d_surgeon` (via Desk E). No DB write made from this desk.

---
## PASS 3 appendix — `angular_momentum` Checkpoint A (founder-proxy, Desk C) — append-only

Filed by the dispatching session, 2026-08-04. Full report:
`docs/loop_runs/rotmech/angular_momentum/founder_proxy_A.md` §4.4 and §5. founder-proxy
re-verified F-C1 and F-C2 against the code independently; F-C1 is **CONFIRMED on all four
links**, F-C2 is **CONFIRMED but INCOMPLETE**. One new row, F-C3.

**F-C1 — CONFIRMED, and it BLOCKS Desk A.** The four-link chain in PASS 2 was re-walked
(`:50627` authored-config read · `rbrApplyVisibility` sole call site `:50559` · `rbrApplyParam`
`:50079–50088` never sets `padEngageMs` · pose gated `:50728`/`:50732`) and every link holds.
The consequence for `conservation_of_angular_momentum` is not advisory: its DESIGN_OK'd S8
contract reads "the brake applies live τ_ext while held > 0" (`skeleton_rev3.md` §3 S8), which
this defect makes an invisible cause. **Desk A should drop the live brake from S8 or hold S8
until the fix lands.** Probe for the fix: in a sandbox state with entry `tau_brake = 0`, drag τ
to 1.0, then assert `rbrFindById('rbr_brake_pad').visible === true` and
`position.z === drumR·1.8 + 0.09` within `pad_travel_ms`.

**F-C2 (EXTENSION) — the filed row covers the low end only; the high end also fails.**
PASS 2 asked for ε-suppression at L = 0, which is correct and confirmed (at L = 0 the sign
resolves to +1 at `:50669`, so a stopped platform draws an up-pointing 0.22 stub beside
`L = 0.00`). It omits two things:
- **`RBR_L_ARROW_MAX = 1.80` clips everything above |L| = 9.00** (`:49796–49797`, applied
  `:50705–50707`). A sandbox exposing `m` and `ω₀` reaches L = 20.7 at the corners
  (I = 0.50 + 2(5.0)(0.80²) = 6.90, ω₀ = 3.0). Dragging `m` from 2.0 to 5.0 at ω₀ = 3.0 moves L
  from 9.18 to 20.7 **with zero change in the drawn arrow** — in a state whose declared lesson is
  that L tracks I·ω.
- The fixed 0.20 scale leaves the entire guided band drawing between 0.306 and 0.918 world units
  against an 1.80 ceiling — the small-arrow direction of the same problem.
Request: the bounded/asymptotic map the **pull arrow already has** in this file
(`:49762–49794`) — true zero below ε, linear through a knee placed above the guided band,
asymptotic above it — sized so the guided band [1.53, 4.59] is large and readable. Probe:
`len(0) === 0`, `len(20.7) > len(9.18)`, `len(4.59)/len(1.53) === 3.0`.
Authoring-side mitigation available today, and taken by `angular_momentum` regardless of the
engine fix: `rbrSc` reads per-concept overrides from `config.slider_controls[token]`
(`:50007–50013`, schema `:2181`), so slider ranges can be narrowed to keep reachable L inside
the faithful band.

**F-C3 — NEW · the re-pin blank fires on every `input` event, so a slider drag hides the
readouts it exists to teach.** `rbrRestartNow` sets `eng.evRepinT = t` (`:50058`) and
`rbrBlanked` (`:49899`) blanks for `blank_ms` after it; the `m` and `ω₀` slider handlers call it
on **every** `input` event (`:50074`/`:50078`). So during a continuous drag all three readouts
render `"—"` (`:50243`) with the "restarting" badge over the HUD (`:50284`), and the numbers
only reappear 500 ms after the teacher lets go. Second half of the same row: `rbrRestartNow`
also calls `rbrThetaReset()` (`:50063`) on every one of those events, which re-accumulates the
whole fixed grid from zero per event (O(n) at `:49960`, up to `RBR_GRID_MAX` 20000) and makes
the drum marker stripe's angle jump on each drag tick, since θ is recomputed with the new ω back
to t = 0.
A re-pin cue marks a **discrete** restart (Addendum C). Suggested shape: fire the blank on
`change`, on a sign flip, or debounced — never on every input tick — and re-anchor θ
continuously instead of resetting it. Probe: drive a synthetic 3 s drag on `m`; assert
`rbr_ro_L_val.textContent !== "—"` on ≥90% of frames and that `PM_rbrTheta` stays monotonic.
**Scope: this degrades EVERY rbr sandbox, including `conservation_of_angular_momentum` S8** —
it is not specific to Desk C. Owner: `peter_parker:field3d_surgeon` (via Desk E). No DB write
made from this desk.

**Candidate scar rows** for all three (plus three `alex:architect` design-side rows) are written
as SQL text in `docs/loop_runs/rotmech/angular_momentum/founder_proxy_A.md` §6. No
`engine_bug_queue` DB write has been made from this desk — guardrail 9.

---
## PASS 4 — **F-C4 · P1 · per-state camera authoring in the rbr scenario**

Filed 2026-08-04 by the dispatching session on a **founder ruling**. Raised by founder-proxy at
`rigid_body_rotation` Checkpoint A (P1-1); the founder confirmed the measurement, rejected the
authoring-side workaround, and set the framing below. **This is a P1 engine gap, not an
authoring problem.**

### The gap

`spherical.phi = 1.16` is **hardcoded in the rbr scene builder** (`field_3d_renderer.ts:50476`,
with `radius = 9.6`, `theta = π/4`). There is **no camera field anywhere in the rbr config
surface** (`:978-1060`), and `applyRigidBodyRotationState` (`:50480`) never touches the camera —
so the pose is set once at build time and is identical in every state of every concept the
scenario serves.

φ = 1.16 rad is a polar angle of 66.5°, i.e. **23.5° elevation above the rotation plane**. A
horizontal circle therefore projects to an ellipse of aspect **sin(23.5°) = 0.399** — the 0.40
figure in the Checkpoint A report is exact.

### Why ONE pinned pose cannot serve this chapter

This is the crux, and it is not a preference:

- **#3 `rigid_body_rotation` needs near-top-down.** Its atomic claim is that every point traces a
  **circle**. At 0.399 aspect the circles render as flat ellipses while the titles, delta cues and
  narration say "circle" — Rule 41 (literal language) and Rule 24 (reads correctly sound-off)
  break **together**. Its S1 chord gauges are worse than cosmetic: they swing between 1.0× and
  0.40× projected length twice per revolution while their numeric labels hold constant, which is
  a live **Rule 33d** violation on the state that *defines* the concept.
- **#9 `angular_momentum` needs oblique — the pose that exists.** Its headline visual is L drawn
  as a vector **along the rotation axis**. From near-top-down an axial vector collapses toward a
  dot.

Desk C owns both concepts, so it hits the same fixed pose twice with **opposite** requirements.
That is the argument: no single pose is correct, so the pose must be authorable.

### The ask

**Per-state camera authoring in the rbr scenario** — a config surface letting each state declare
its pose, applied on state entry alongside the rest of `applyRigidBodyRotationState`.

### The constraint that makes "just nudge it" wrong

The current pose is **not arbitrary**. The comment at `:50469-50474` records that it was *solved*
— the widest object on screen is a pull arrow at r = 0.90 (mass at 1.62 world, arrow tail to
+2.30, ~4.0 units of half-width to clear) — and that the solve deliberately swept **radius and
elevation together**, citing scar
`camera_solve_searched_in_one_axis_hides_the_feasible_region_in_the_axis_held_fixed`. Any new
authorable pose inherits that framing obligation per state; moving elevation alone re-enters the
exact failure region that scar records. **Do not nudge the default — add the surface.**

### Rules that bind the fix

Rule 32d (the same apparatus from a recognisable home pose — a per-state pose must not read as a
different machine; treat a pose change as a declared, narrated move, not a teleport), Rule 36 and
THE EYE's byte-stable frozen frames (a pose that eases must be a closed form of state-local t, or
must settle before the pin), Rule 29 (a pose change is not emphasis).

### Desk C's position while this is open

Per the founder ruling, **both Desk C skeletons are designed ASSUMING per-state camera lands**,
with every camera-dependent beat marked as such in the skeleton. If the founder later declines
the row, **`rigid_body_rotation` is not authorable as designed** and is re-scoped at that point —
`angular_momentum` survives on the existing oblique pose. No authoring-side rewording was taken:
narrating an ellipse as a circle was considered and **rejected**.

Owner: `peter_parker:field3d_surgeon` (via Desk E). No DB write made from this desk.

---
## PASS 5 — **C10 · non-restarting live ω control** + one office question

Filed 2026-08-04 by the dispatching session, from the `rigid_body_rotation` fix-cycle-1 pass
(founder-proxy P1-4). Full contract: `docs/loop_runs/rotmech/rigid_body_rotation/skeleton_rev2.md`,
ENGINE REQUIREMENTS row C10.

### C10 — a live ω control that does NOT restart

**The defect it fixes.** The rbr `omega0` slider re-pins L on every input event. Traced:
`:50115-50122` → `rbrApplyParam` → `rbrRestartNow` **unconditionally** (`:50075-50078`) →
`evRepinT = t` + `rbrThetaReset()` (`:50053-50064`) → `rbrBlanked` true (`:49896-49899`) →
readouts write an em dash (`:50243`). A drag fires `input` per step, so **the blank is
continuous for the whole drag**, and `rbrThetaReset` re-bases θ so the apparatus teleports by
≈ `t·Δω` per event.

**Why those semantics are right elsewhere and wrong here.** For `conservation_of_angular_momentum`
(#10) ω₀ genuinely re-pins L, so a restart is the honest reading. For `rigid_body_rotation` (#3)
**τ = 0 and ω₀ *is* ω** — a continuously variable quantity — so a restart is a lie about a
continuous change.

**The ask.** An opt-in per-state `omega_live` that takes the non-restarting path: closed-form
re-anchor `θ_new(t) = θ(t₀) + ω_new·(t − t₀)`; **no** `evRepinT` blank, **no** `rbrThetaReset`,
**no** re-pin badge. Rule 36 and THE EYE's byte-stable frozen frames are preserved because the
re-anchor stays a closed form of state-local t.

**Probe.** Drive a synthetic 3 s drag on ω: assert no readout ever reads `"—"`, and that
`PM_rbrTheta` is monotonic throughout.

**C10 is NOT F-C3 — do not merge them.** F-C3 (PASS 3) debounces *when* the blank fires and
keeps the restart. C10 stops the restart firing at all, in the states where τ = 0 makes ω₀ a
continuous control. Both are wanted: F-C3 fixes every sandbox that legitimately restarts
(including #10 S8), C10 serves the sandboxes that must not.

**Consumers.** #3, #4 `rotational_kinematics` (Desk D), and every future rbr sandbox that
teaches no L. Owner: `peter_parker:field3d_surgeon` (via Desk E). No DB write made from this desk.

### C2 — WITHDRAWN by Desk C

PASS 1 filed **C2** (tangential v arrow + live value label) and claimed it shared with Desk D
findings §4. **Founder ruling 2026-08-04: `v = ωr` belongs to #4 `rotational_kinematics`, not
#3.** The ambiguity came from the master pre-registration line for #3, which wrongly carried
"(v = ωr)" in its description — corrected on master in `2443a74`.

**C2 is therefore Desk D's sole property.** Desk C withdraws its claim. Recorded explicitly so
Desk E neither double-builds the row nor drops it as retracted: **the row is still wanted, by
#4 alone.** Concept #3 keeps only "a point further out traces a longer path in the same time"
as an arc-length comparison — no formula surface, no v arrow, no velocity numeric ladder.

### Office question — does the 0c-2 two-timed-class fence bind 0c-1?

The 0c-2 build carries a founder-signed fence: the timed surface is **exactly two field
classes** (`bodies[].activate_at_ms`, `formula_overlay[].at_ms`), and needing a third is the
Phase-0 alarm rule — stop and re-scope, never build.

Desk C's #3 ask now counts **2** new timed field classes on the **rbr** scenario (C1 marker
label cues; the C4 compare family). **Whether that fence binds 0c-1 at all is not a desk
decision** and is not answered locally. A design fallback is named-but-not-taken in the
skeleton. Raised for the office alongside F-C4.

---
## PASS 6 — **F-C5 · rbr glow pass has no `glowTargets` fallback**

Filed 2026-08-04 by the dispatching session, from `angular_momentum` Checkpoint A cycle 2
(founder-proxy §5). Full report:
`docs/loop_runs/rotmech/angular_momentum/founder_proxy_A_cycle2.md`.

**The defect.** `applyRigidBodyRotationGlow` computes its focal as
`(eng && eng.glow_focal) || rb.glow_focal || ""` (`field_3d_renderer.ts:50772`). The
`force_rig` sibling in the same file reads
`… || (glowTargets.length ? glowTargets[0] : "")` (`:49002`) and sets
`glowActive = !!focal || glowTargets.length > 0` (`:49003`).

**Consequence.** An authored `tts_sentences[].glow` is a **silent no-op on every rbr state** —
it parses, seeds, renders, and moves nothing. The scenario's only working emphasis channel is
the per-state `glow_focal` plus `phases[]` (`:50647-50657`). So the narration→canvas binding
that the measured exemplars achieve per sentence (52/52) is unreachable through the normal
channel for the **entire Ch.7 rotmech family**.

**Fix shape.** Parity with `force_rig`: add the `glowTargets[0]` fallback and widen
`glowActive` to match. An explicit `glow_focal` or phase focal must keep short-circuiting it
exactly as today, so any state that authors one is unaffected.

> **CORRECTION (2026-08-04, this session).** An earlier draft of this paragraph justified the
> short-circuit by saying it keeps `conservation_of_angular_momentum`'s "already-approved
> states" byte-identical. **That was wrong and is withdrawn.** `conservation_of_angular_momentum`
> is approved at the DESIGN level (skeleton + Checkpoint A) and has no concept JSON — verified
> this session: `grep -rl rigid_body_rotation src/data/concepts/` returns nothing, and
> `git log --all -- "src/data/concepts/*angular*"` is empty across every branch. **No concept
> JSON consuming the rbr scenario exists anywhere yet**, so there is no rendered baseline to
> preserve and no back-compat obligation on this fix at all. The short-circuit is still the
> right shape — it keeps the explicit channel authoritative — but Desk E should scope it as a
> clean addition, not as a compatibility constraint. Caught by founder-proxy at
> `rigid_body_rotation` Checkpoint A FINAL (§5 item 4).

**Probe.** In an rbr state with no `glow_focal` and a sentence glow naming `rbr_l_arrow`, assert
that element's material opacity is 1.0 and a peer overlay's is 0.4.

**Consumers.** #3, #4, #9, #10 and every future rbr concept. Owner:
`peter_parker:field3d_surgeon` (via Desk E).

**Tag: ride-along — blocks no concept**, because `phases[]` is a working substitute and Desk C's
concepts author it. Recorded so a later desk does not spend a cycle debugging why its
per-sentence glow does nothing.

### Related design-side finding (NOT an engine row — recorded here for context only)

The same review found that a *reachable* focal now genuinely dims its peers
(`applyGlowEmphasis` → `GLOW_DIM_OPACITY = 0.4`, `:3397-3398`), and that **`rbr_l_arrow` is not
in the solid carve-out list** (`:50782-50788`) — arrows keep the real dim channel by design.
That is **not** filed as a defect: the engine's own recorded judgment is that an arrow at 40 %
still reads as an arrow (`:49010-49026`). The finding is authoring-side — a static `glow_focal`
held across a 22–24 s multi-sentence state — and routes to `alex:architect`, not to Desk E.

No DB write made from this desk.

---
## PASS 7 — **CONTRACT CORRECTION (chapter-wide, affects three sibling desks)**

Filed 2026-08-04 by the dispatching session from `angular_momentum` Checkpoint A FINAL
(founder-proxy C4). **Not an engine defect — a documentation defect in the binding chapter
contract.** Routed here because `APPARATUS_CONTRACT.md` §4 forbids a desk from changing it
unilaterally, and this correction is worth more than the usual Checkpoint-C wait: the other
rotmech desks are reading the wrong line right now.

### `APPARATUS_CONTRACT.md:70` lists `theta0_rad` as inert. It is fully implemented.

The contract's "Declared but inert — reading these is a silent no-op" list names `theta0_rad`.
The engine reads it, seeds it and returns it:

```
:50499   theta0: rbrNum(rb.theta0_rad, 0),          // read from authored config
:50557   rbrThetaReset();                            // called on every state apply
:49970   eng._thN = 0; eng._th = eng.theta0;         // seeds the theta accumulator
:49958   rbrThetaAt(tMs)  ->  eng._th + ...          // returned in every frame
```

`theta0_rad` **fully controls the apparatus start angle**. The renderer's own type-declaration
comment at `:953` is stale, and the contract inherited the error from it.

### Why this is worth a chapter-wide correction rather than a per-desk footnote

`theta0_rad` is the ONLY lever controlling the rod's azimuth. On the turntable, azimuth governs
how much of any radial motion is visible rather than foreshortened — measured on
`angular_momentum` S3, the swing between best and worst azimuth is **1.85× of screen travel**
(0.1383 NDC vs 0.0748 NDC), and at the worst angle a radial slide reads as a vertical drift
rather than as motion along the rod.

Six Ch.7 concepts share this turntable. **Any desk that needs to control its start azimuth is
currently told the lever does not exist**, and will either design around a constraint that
isn't real or ship a beat at whatever azimuth its timing happens to produce.

### Requested correction (office / contract owner — NOT taken locally)

1. Move `theta0_rad` OUT of the `:70` declared-but-inert list, citing the readers above.
2. Re-run the both-directions check over the **whole** declared-inert list: a field claimed
   inert needs proof no reader consumes it, and a type-declaration comment is documentation,
   not evidence. `theta0_rad` was wrong; the rest of that list has not been verified against
   readers by this desk.
3. Correct the renderer comment at `:953` in whatever engine change next touches that region
   (Desk E) — it is the propagation source.

### The general lesson, already filed

This is the contract-level recurrence of the cycle-2 candidate
`walk_labels_a_field_inert_from_its_declaration_comment_while_the_reader_implements_it`. Per
founder-proxy it is a **widening of that existing row, never a new `bug_class`** — see
`docs/loop_runs/rotmech/_engine/scar_candidates_c.sql` for the amendment text and
`angular_momentum/founder_proxy_A_cycle2_final.md` §5 for the authoritative wording.
`concepts_affected` widens to `angular_momentum`, `conservation_of_angular_momentum`,
`rigid_body_rotation`, `rotational_kinematics`.

No DB write and no contract edit made from this desk.

---
## PASS 8 — **0c-3 ask corrections found at physics-author time (concept #3)**

Filed 2026-08-04 by the dispatching session from the `rigid_body_rotation` physics block.
These are **corrections to the 0c-3 ask itself**, found by writing the timeline in full against
the code. They do not change the approved design and add no new engine row — but Desk E scopes
0c-3 from the skeleton's ENGINE REQUIREMENTS, and each of these would otherwise be discovered
mid-build. Full contracts: `docs/loop_runs/rotmech/rigid_body_rotation/physics_block.md`.

### 1 · C4's crossing flash needs a THIRD group token the C1/C9(b) contract does not provide

Checkpoint A closed F1 by making each marker's **elementType its group token** —
`rbr_marker_rim` (eight rim dots) and `rbr_marker_line` (five line dots) — so a one-string focal
can name eight objects.

**Those two tokens do not cover C4's `crossing_mark_at_ms` flash.** That beat co-highlights a
HETEROGENEOUS set: the fixed start ray **plus both markers P₁ and P₂**. P₁ and P₂ are line-group
markers, so `rbr_marker_line` would light **all five** line dots and still miss the ray.

The glow pass matches one string, two ways only (`isFocal = ud.id === focal || ud.elementType
=== focal`, `:50776`), so a heterogeneous highlight is not expressible today. C4 needs its own
addressable token spanning the ray + the two compared markers. **Without it the concept's
primary-aha flash cannot be authored** — the exact class of failure F1 was raised to close, on
the one beat F1's fix does not reach.

### 2 · `show_r_line` / `rbr_r_line` is the WRONG primitive for this concept's gauges

The existing radius line tracks the sliding mass's `eng.r` — which this concept pins at 0.80 m
for its whole run. Reused naively for the P₁/P₂/`r_point` gauges it would **silently draw a
line at the wrong radius that never moves**, passing every automated check.

C5's gauges are a genuinely new primitive: an axle-to-marker span at an authored radius with a
signed lateral offset, independent of `eng.r`. State that in the C5 row so Desk E does not
"reuse what's already there" and ship a useless line.

### 3 · S6's `idle_auto_sweep` needs its own param key

`idle_auto_sweep` is consumed ONLY for `param: "r"` (`rbrRAt`, `:49858`). This concept's explore
state sweeps **`r_point`** — the marker radius — not the mass radius. C6 must extend the sweep
reader to the new key, or the explore state's idle motion is a **silent no-op**. The skeleton
flags this; it is restated here as a concrete build-sheet line because it is one word in a
reader and invisible if missed.

### Cross-check against PASS 7

Finding 2 of the physics block independently re-derived the `theta0_rad` mislabel already filed
as PASS 7 — same conclusion, reached from the readers (`:50499` → `:49969-49971`) rather than
from the report. Two independent confirmations; no further action.

No new engine ROW is created by any of the above — items 1–3 are contract text belonging inside
existing rows C4, C5 and C6. No DB write made from this desk.

---
## PASS 9 — **Supabase RECOVERED; two corrections to this session's audit trail**

Filed 2026-08-04 by the dispatching session after `engine_bug_queue` became reachable again,
following four failed attempts across two independent callers (12:52, 13:16, 13:40 UTC + a
founder-proxy attempt returning a PostgREST schema-cache error).

### Correction 1 · The `rigid_body_rotation` row was NEVER missing

Both skeletons record that the `rigid_body_rotation` concept query returned **0 rows** where an
earlier run had returned **1**, and reasoned that either the row's concept tag had been dropped
or the row removed at the live table.

**Re-run against the recovered table: the row is there.** It is
`engine_stash_on_shared_renderer_reverts_concurrent_session_uncommitted_work`, tagged
`rigid_body_rotation, rolling_friction, work_done_by_constant_force`.

**The 0 was an outage artifact, not a data change.** This matters beyond bookkeeping: a query
that fails *soft* — returning an empty result rather than an error — is indistinguishable from a
genuine empty result, and both skeletons reasoned about a table change that never happened. The
disposition was N/A-at-this-desk either way, so **no design consequence**; but the recorded
speculation should be struck rather than left to mislead a Checkpoint C reader.

### Correction 2 · The corpus DID move — the carried-forward counts are stale

`--owner alex:architect` now returns **67 rows**, against the **63** carried forward from the
REV 1 consultation and relied on by every subsequent revision of both skeletons.

**Four rows entered that result set during this session.** Both skeletons state their audit
boundary honestly ("nothing outside the four queried result sets is dispositioned"), so nothing
is falsified — but **the 0d session must re-audit the delta before json_author starts on
`rigid_body_rotation`**, and that obligation is now specific rather than precautionary: it is
four known rows on the architect-owned query, not a hypothetical drift.

`angular_momentum` reached json-author under the same stale counts. Its JSON is written and
validating (150 PASS / 0 FAIL), so the re-audit for that concept belongs at **quality-auditor
Gate 8**, which reads the live queue directly — not as a re-run of the design-time audit.

### Standing lesson

A same-day carried-forward count is only sound if the corpus is quiet, and this one was not.
Where an audit is carried forward under an outage, the re-run obligation should name the
**queries** to repeat rather than assert the counts still hold — which is what both skeletons
did, and it is why this correction is a delta and not a re-derivation.

No DB write made from this desk.

---
## PASS 10 — **F-C6 · CRITICAL · a one-shot `restart` (no `every_ms`) silently zeroes L for the WHOLE state**

Filed 2026-08-04 by the dispatching session. **Found by eye-walker on a build where all 23 THE EYE
deterministic checks PASSED** — the machine proved the pixels moved; the state was still dead.
Root-caused here against the code, then reproduced arithmetically.

### The chain, every link verified

```js
:50547   every_ms: rbrNum(rb.restart.every_ms, Infinity)   // omitted => Infinity
:49883   return eng.restart.at_ms + (k - 1) * eng.restart.every_ms;
```

For the first restart, `k = 1`, so `(1 − 1) * Infinity` = `0 * Infinity` = **`NaN`** — and
`rbrCutTime(1) = 17500 + NaN = NaN`, `rbrEffTime(1) = NaN`.

```js
:49890   if (tMs < rbrEffTime(1)) return 0;    // tMs < NaN is FALSE, always
:49893   if (!isFinite(every_ms) ...) return 1;
```

So `rbrRestartCount` returns **1 at every instant, including t = 0** — the guard that should
suppress it before the cut never fires.

> **CORRECTION (2026-08-04, same session).** The first draft of this entry then said the anchor
> branch is TAKEN with `t0 = NaN`, producing `L0 = NaN` which the rest-clamp swallows. **That is
> wrong.** quality-auditor traced it independently and found the real bite point one line
> earlier — the anchor branch is **never entered at all**:
>
> ```js
> :49918   if (k > 0 && rbrEffTime(k) >= evT) {   // NaN >= -1 is FALSE
> ```
>
> With no event anchor, `evT = -1`, and **`NaN >= -1` evaluates false**, so the re-anchor branch
> is skipped and control falls through to the initial anchor `{ t0: 0, L0: eng.L0 }`. L therefore
> stays on the ORIGINAL 4.59 anchor from t = 0 — which the brake has already clamped to zero by
> 6.8 s — and never re-seeds. The `repin_cue` badge never fires for the same reason.
>
> **Same symptom, same fix, but the mechanism matters for whoever fixes it:** the defect is a
> guard silently failing on `NaN`, not a `NaN` propagating into the physics. Fixing only the
> rest-clamp would not have helped. Both readings are recorded because the divergence is itself
> the lesson — my trace stopped at `rbrRestartCount` returning 1 and inferred the rest; the
> correct trace follows the call into `rbrAnchor`. That is the OPEN scar
> `rewind_path_assertion_stops_at_the_function_body_and_never_follows_its_calls`, recurring here
> in a review rather than in a design.

The rest-clamp is what converts the un-re-anchored, fully-braked value into a hard zero:

```js
:49941   if (!(mag > 0)) mag = 0;
```

**`L = 0` for the entire state.** ω = L/I = 0, so θ never advances and the apparatus never
turns. Nothing throws, nothing warns, no gate fails.

### The natural experiment — same concept, same run, one field apart

- `angular_momentum` **STATE_3** authors `restart: { at_ms: 17500, flip_spin: false }` — no
  `every_ms`. The state is **dead from t = 0**: never spins, never decays, and its primary-aha
  payoff (L = 0.99 after the restart) never renders. eye-walker confirmed 7 consecutive samples
  t = 17000…23000 plus the frozen H2 pin are byte-identical at L = 0.00.
- `angular_momentum` **STATE_4** authors `restart: { at_ms: 11000, every_ms: 8000, flip_spin: true }`.
  It works correctly — eye-walker confirmed two clean restarts with the sign flip and the re-pin
  badge.

### Why this is an ENGINE defect and not an authoring error

`every_ms` is **optional in the frozen contract** (`:1046`, `restart?: { at_ms?, every_ms?, flip_spin?, cue? }`), and a **one-shot restart is the natural reading of an omitted repeat interval** — it is exactly what `angular_momentum` S3 and the sibling `conservation_of_angular_momentum` S6 both want. The `Infinity` default was clearly chosen to mean "never repeats", and it does mean that in `rbrRestartCount`'s second guard — it is only the `(k−1) * every_ms` arithmetic that turns it into `NaN`.

**Fix shape (Desk E's call):** compute the cut time without multiplying by a non-finite interval —
e.g. `k === 1 ? at_ms : at_ms + (k-1)*every_ms`, or guard `isFinite(every_ms)` before the
multiply. Whatever the shape, **`rbrCutTime(1)` must equal `at_ms` exactly** whether or not
`every_ms` is authored.

**Probe:** author a state with `restart: { at_ms: 5000 }` and no `every_ms`; assert
`PM_rbrL` is non-zero at t = 1000 (before the cut), blanked across [5000, 5500), and equals
`I(r)·ω₀` at t = 6000. Today it is 0.00 at all three.

**Secondary hardening worth doing in the same pass:** the rest-clamp at `:49941` converts a
`NaN` magnitude to a silent 0. A `NaN` here always means an upstream arithmetic fault, never a
physical rest — it should warn rather than clamp, or the next defect of this class is equally
invisible.

### Desk-C mitigation, taken today

`angular_momentum` S3 will author a **finite `every_ms` larger than the state duration**
(state is 23 s; `every_ms: 99000`). Verified arithmetic: `rbrCutTime(1) = 17500` exactly,
`rbrCutTime(2) = 116500` (far beyond the state), `rbrRestartCount` = 0 before 18000 and 1 after,
blank window [17500, 18000) intact. This is a **workaround for a live engine defect, not a
design change** — when F-C6 lands, the field can be dropped again.

**Scope: this binds every rbr concept that wants a single restart**, including
`conservation_of_angular_momentum` S6 on Desk A. Owner: `peter_parker:field3d_surgeon` via
Desk E. No DB write made from this desk.

---
## PASS 11 — **F-C7 · MAJOR · the L arrow cannot be made to glow: `ArrowHelper` has no emissive channel**

Filed 2026-08-04 by the dispatching session. Reported by eye-walker from the frames, diagnosed by
json-author, **independently re-verified against the code here** before filing.

### What eye-walker saw

In `angular_momentum` STATE_1 — the state whose entire purpose is to introduce the axial L vector
— the authored focal hands off to `rbr_l_arrow` at 15200 ms and holds to the end. In the frames the
**bright yellow drum marker stays visually dominant right through the frozen frame**, while the L
arrow stays pale grey and near-indistinguishable from the neutral axle (`#90A4AE`).
Frames: `STATE_1__frozen.png`, `STATE_1__dense_t17000.png`.

### The authoring is CORRECT — this was checked first

`phases[]` entries are in ascending `at_ms` order matching array order; the update loop
(`:50647-50657`) iterates every phase each frame with no `break`, so the last entry whose
`at_ms ≤ tMs` wins; `s1_p4` (`at_ms: 15200`, `glow_focal: "rbr_l_arrow"`) is the last entry and
carries no `until_ms`, so it holds to state end. The token matches the arrow's own
`userData.elementType`/`id` exactly (`:50388`). `eng.base_glow_focal` is seeded from
`rb.glow_focal` at state entry (`:50508`) and the phase loop starts from that baseline.
**Nothing in the concept JSON can fix this.**

### The mechanism

```js
:50386   var lArrow = new THREE.ArrowHelper(...);      // cone: MeshBasicMaterial
                                                       // line: LineBasicMaterial
:3396    if (m.emissive) m.emissiveIntensity = m.userData._glowBaseEmI + emB;
```

**Neither `MeshBasicMaterial` nor `LineBasicMaterial` has an `.emissive` property**, so the
focal brighten's emissive boost is a **silent no-op** on the L arrow. The arrow receives only
`opacity → 1.0` and a ≤28% colour lerp toward white.

Its competitor loses nothing, ever:

```js
:50324   new THREE.MeshPhongMaterial({ ..., emissive: RBR_MARK_COLOR, emissiveIntensity: 0.42 })
:50782-50788   // rbr_drum_marker IS in the hardcoded brighten-only `solid` list
```

`rbr_drum_marker` is a constantly-lit `#FFF176` emissive object that **never dims** — it is
carved out of the dim branch — against a `#0A0A1A` background. So a correctly-authored focal
handoff produces no visible change at all: the marker keeps the eye, and the state that exists
to introduce L never visually introduces it.

### Why this matters beyond one state

**`L` is the chapter's headline vector.** `APPARATUS_CONTRACT.md` §3 requires it to be the axial
vector in the same colour across all eight rotmech concepts, and `angular_momentum`'s registered
scope line names it "drawn as a VECTOR along the rotation axis". Any state that makes the L
arrow its focal — here S1 and S2, and the sibling `conservation_of_angular_momentum` S1/S6 —
inherits this. Rule 32e says exactly one focal at any instant; today the *authored* focal and
the *apparent* focal are different objects.

**Fix shape (Desk E's call):** give the arrow a material that can brighten — replace the
`ArrowHelper` with meshes carrying `MeshPhongMaterial` (matching the drum marker's pattern), or
special-case the emissive-less branch in `applyGlowEmphasis` so a focal element with no
`emissive` channel gets a stronger compensating treatment (larger colour lerp, or the peers
dimmed harder). Note the second option interacts with the brighten-only carve-out: a focal that
cannot brighten needs its non-carve-out peers to dim, and `rbr_drum_marker` currently cannot.

**Probe:** in a state whose focal is `rbr_l_arrow`, sample the arrow's rendered pixel luminance
in the frame before and after the focal instant; assert a measurable increase, and assert the
arrow is brighter than `rbr_drum_marker` at that instant.

### Desk-C position

**No authoring workaround exists and none was faked.** `angular_momentum` ships with the
handoff authored correctly, so it becomes legible for free when F-C7 lands. Recorded here so a
later reader does not "fix" the JSON — the JSON is right.

Owner: `peter_parker:field3d_surgeon` via Desk E. No DB write made from this desk.

---
## PASS 12 — **Provenance carried here because the concept schema has nowhere to put it**

Filed 2026-08-04 by the dispatching session. Two authoring facts about `angular_momentum` that a
later reader will otherwise misread as errors. json-author checked `src/schemas/conceptJson.ts`
end to end and confirmed **there is no notes/comment/provenance field anywhere in the schema** —
top-level carries only `source_book` (book sourcing, not internal notes), and `field_3d_config`
is not Zod-typed at all (it rides the top-level `.passthrough()`), so nothing reserves a
never-displayed slot for authoring commentary. It correctly declined to invent one or to stuff
either note into a rendered string. So they live here.

### 1 · `STATE_3.restart.every_ms = 99000` is a WORKAROUND, not a design decision

The approved design (`skeleton_rev4.md:679`) certifies the opposite shape — *"no every_ms →
single restart"*. The literal 99000 appears in no skeleton and no physics block.

It is there solely to dodge **F-C6** (PASS 10): a one-shot `restart` computes
`at_ms + (1−1) × Infinity` = `NaN`, which silently fails `rbrAnchor`'s guard, so L never
re-seeds and the state is dead from t = 0. A finite `every_ms` larger than the state duration
makes `rbrCutTime(1) = 17500` exactly, with the phantom second restart at 116500 ms — far
outside the 23 s state.

**When F-C6 lands, DROP the field** and restore the bare one-shot `restart`. Leaving it in place
after the engine fix would preserve a physically meaningless "repeats every 99 seconds" in a
shipped concept.

### 2 · `spin_dir` is deliberately absent from STATE_5's `controls_visible`

Closing quality-auditor's F5. The explore state exposes `["m", "omega0"]` only. `spin_dir` is
authored **only** in STATE_4's own `controls_visible`, so under the `core_only` preset it
disappears with the state that teaches it — the discharge is ring assignment plus a control cut,
never a field. Full reasoning: `skeleton_rev5.md`.

**This is not an omission to "fix".** A later session restoring `spin_dir` to the explore state
would re-open the Rule 38b failure and the OPEN scar
`skeleton_discharges_a_ring_cut_with_a_field_no_renderer_reads`.

### 3 · A conflict between two fixes, caught before it landed — worth recording as a pattern

`skeleton_rev5.md` §R9 edit 4 instructed json-author to append
`"; spin_dir excluded (S4-only — Rule 38b)"` to `STATE_5.label`, describing `label` as a
dev-facing record.

**`label` is rendered** — `lines.push("<b>" + (stateDef.label || PM_currentState) + "</b>")`
(`:63739`), the bold first line of the on-canvas bottom-left legend. That append would have put
engineering prose back on the teacher's screen **minutes after F4 removed it from all five
states**. Edit 4 was declined by the dispatching session and the exclusion recorded here instead.

The general shape, since it will recur: **a fix written by an agent that has not read the
renderer can specify a field's use correctly in intent and wrongly in effect.** The architect had
no reason to know `label` renders — it is named like metadata. Any handoff that names a field to
write should state whether that field reaches the screen.

No DB write made from this desk.

---
## PASS 13 — **A real seam: "filed" here is invisible to the standard pre-walk query**

Raised by eye-walker on the 2026-08-04 re-walk, as a process observation rather than a content
finding. It is correct, and it deserves an answer in this file rather than a shrug.

**What it saw.** Its standard pre-walk consultation —
`query_engine_bug_queue.ts angular_momentum --field3d --open` — returned **zero rows** for a
concept with two known open engine scars (F-C6 CRITICAL, F-C7 MAJOR). An agent trusting that
query would conclude the concept is scar-free and re-discover both from scratch.

**Why it is empty, and why that is correct today.** Desk guardrail 9 forbids `engine_bug_queue`
DB writes from this desk — five parallel desks writing the shared queue mid-chapter is exactly
the race the guardrail exists to prevent. So every Desk C finding lives in **this file**, which
Desk E drains, plus `scar_candidates_c.sql` as the apply manifest. Nothing is lost; it is
staged, not filed.

**But eye-walker's point stands and is not answered by "working as intended."** The gap is that
the *consulting* half of the contract assumes the queue is the single source of truth, while the
*writing* half routes around it. During a parallel chapter wave, a concept can carry two open
CRITICAL/MAJOR engine defects that no standard query surfaces — and the agent most likely to
trip over them is the next one to walk the same frames.

**For the 0d session and Desk E — the concrete obligation:**
1. When the Desk C manifest is applied (`scar_candidates_c.sql`, amendment first), F-C6 and
   F-C7 must reach the queue tagged `concepts_affected` including `angular_momentum` and
   `conservation_of_angular_momentum`, so the ordinary pre-walk query finds them.
2. Until then, **any agent walking an rbr concept must read
   `docs/loop_runs/rotmech/_engine/findings_c.md` in addition to querying the queue.** A clean
   query is not evidence of a clean concept during this wave.

**For the office:** worth deciding whether a desk-local findings file should be a declared,
queryable source during parallel waves, or whether the one-owner rule should carve out an
append-only path to the real queue. This is the second time the wave's parallel-safety design
has produced an honest blind spot — the first was the same-day carried-forward bug-queue counts
under the Supabase outage (PASS 9).

No DB write made from this desk.

---
## PASS 14 — **The seed script was silently disarming THE EYE's motion gate. Fixed; every rotmech desk is affected.**

Filed 2026-08-04 by the dispatching session. Surfaced by quality-auditor as caveat A on an
otherwise-PASS re-audit; **its diagnosis was half right, and the half it got wrong is the half
that made this fixable.**

### The symptom

Every THE EYE run on `angular_momentum` reported:

```
Motion map:  STATE_1=?, STATE_2=?, STATE_3=?, STATE_4=?, STATE_5=?
  ✓ [D5] STATE_1: Skipped — motion expectation unknown for STATE_1.
```

D5 is the check that asserts **pixels actually moved**. It was skipped on all five states, in
every run — while the headline still read "23 checks · 23 passed". The green was real but the
motion gate was not participating.

### The cause, and the correction to the diagnosis

`visual_eyes.ts:68` derives the motion map from `cached.physics_config`, and
`deriveMotionExpectations` resolves field_3d motion from `field_3d_config.states`
(`deriveStateMeta.ts:108`, whose own comment says "or a cached field_3d-as-physics_config").

quality-auditor concluded there is **"no `rigid_body_rotation` branch in the function"** and
routed it to `peter_parker:visual_validator` as unfixable inside a chapter branch.
**That is wrong — the branch exists**, `deriveStateMeta.ts:416-429`, reading
`state.rigid_body_rotation` with a comment block describing exactly what the engine animates.

The real cause was **this desk's own seed script**, which wrote:

```ts
physics_config: { epic_l_path: json.epic_l_path },     // field_3d_config ABSENT
```

So a working branch was being starved of its input. Not a platform defect — a desk-local
one-line defect, in a file this desk owns and may edit.

### The fix and the proof

`src/scripts/_seed_angular_momentum_cache.ts` now seeds
`physics_config: { epic_l_path, field_3d_config }`. Re-seeded and re-ran:

```
Motion map:  STATE_1=true, STATE_2=true, STATE_3=true, STATE_4=true, STATE_5=true
  ✓ [D5] STATE_1: OK — motion visible: max adjacent diff 0.50% of canvas (>=0.1% required)
  ✓ [D5] STATE_2: OK — 0.98%   ✓ [D5] STATE_3: OK — 0.83%
  ✓ [D5] STATE_4: OK — 0.61%   ✓ [D5] STATE_5: OK — 0.49%
```

Five skips became five passing assertions. Total stays 23/23, so **the count never revealed the
difference** — which is the point.

### Why this matters to every rotmech desk

**The seed scripts are copied between concepts.** The exemplar this desk cloned
(`_seed_bar_magnet_in_uniform_field_cache.ts`) carries the same `physics_config: { epic_l_path }`
line, and so, by inheritance, will every sibling desk's seed. **Any rotmech concept seeded that
way runs its visual gate with D5 disarmed on every state**, while reporting all-green.

That is the exact failure mode this chapter has now hit three times in one session: a check that
does not throw, does not warn, and does not fail — it silently declines to run. See also the
unknown-`readouts` token skip (`:50162`) and the `NaN` guard in F-C6.

**Action for the other desks and for 0d:** before trusting a THE EYE run on any rbr concept,
read the `Motion map:` line. **If it shows `?`, D5 did not run** — add `field_3d_config` to the
seed's `physics_config` and re-capture. It costs one line and one re-run.

**Worth considering at the office** (not a desk decision): whether `visual_eyes.ts` should refuse
to report a green summary when the motion map is entirely unknown, or at minimum print the skip
count alongside the pass count. A gate that silently declines to run is worse than one that
fails, because it is indistinguishable from success.

No `src/` platform file was touched — only this desk's own scratch seed script. No DB write.

---
## PASS 15 — **F-C8 · CRITICAL · the L vector is OCCLUDED, not pale. F-C7 IS SUPERSEDED — and its probe was satisfiable while the arrow stayed invisible.**

Filed 2026-08-04 by the dispatching session from founder-proxy Checkpoint B, which drove the
live sim with a trusted mouse and measured pixels. **Geometry re-verified here independently
before filing.**

### F-C7 was right about the symptom and wrong about the cause

PASS 11 filed F-C7: the L arrow "stays pale" because `THREE.ArrowHelper` uses
`MeshBasicMaterial`/`LineBasicMaterial`, neither of which has `.emissive`, so the focal brighten
is a no-op. **That is true, and it is not why the arrow cannot be seen.**

**The arrow is drawn inside the opaque axle.** Verified:

```
:50304   axle  = CylinderGeometry(0.07, 0.07, 3.4, 20), MeshPhongMaterial, OPAQUE
:50386   lArrow = new THREE.ArrowHelper(dir(0,1,0), origin(0,0.22,0), len, colour,
                                        headLength 0.24, headWidth 0.16)
```

`ArrowHelper` builds its shaft as a `THREE.Line` — **1 px, no thickness** — on the axle's own
centreline, so it is entirely interior. Its cone is `CylinderGeometry(0, 0.5, 1, 5)` scaled by
`headWidth`, giving radius **0.08** against an axle radius of **0.07**: a **0.010 world-unit
crescent** is the entire escaping silhouette.

Measured on the frozen frames (the arrow's materials are unlit, so its pixels are colour-exact
and anything blended is occlusion):

| frame | L-arrow ink | bbox |
|---|---|---|
| `STATE_1__frozen` | **15 px** | 11×6 |
| `STATE_2__frozen` | **15 px** | 11×5 |
| `STATE_4__frozen` (flipped) | **~6 px** | — |

Explore state, both slider extremes: **L = 1.14 → 9 px; L = 6.51 → 19 px.** A **5.7× change in
the taught quantity** moves a 7-pixel smear up a pole. The material colour `#42A5F5` never
appears anywhere on screen.

### The part that matters most — F-C7's probe would have PASSED on a still-broken build

F-C7's probe reads: *"sample the arrow's rendered pixel luminance before and after the focal
instant; assert a measurable increase."*

**Fifteen occluded pixels getting brighter satisfies that.** An engine agent could implement
F-C7 exactly as filed, watch its probe go green, and the concept's headline vector would still
not be on screen. A probe asserting a **delta** cannot detect a defect of **absence**.

Founder-proxy also measured that the emphasis beat changes scene mean luminance by **< 0.1%** —
nothing brightens (no emissive) *and* nothing dims (`rbr_axle`/`rbr_drum`/`rbr_drum_marker` are
all in the brighten-only carve-out). So **F-C7 in isolation is near-cosmetic; all the damage is
the occlusion.**

### Disposition

- **F-C7 is SUPERSEDED by F-C8. Do not fix F-C7 alone.** A mesh-cylinder shaft with
  `MeshPhongMaterial` closes both at once — the material gains an emissive channel *and* the
  shaft gains thickness.
- **This is a RECURRENCE of a FIXED scar**, not a new class:
  `field3d_arrowhelper_shaft_invisible_when_collinear_with_apparatus_line`, previously fixed in
  `force_rig` and now live in `rigid_body_rotation` — same engine file. **Amend that row (upsert
  on `bug_class`), never mint a new one.** Its existing `prevention_rule` already prescribes the
  fix: a mesh-cylinder shaft parented to the ArrowHelper group, the apparatus line made thinner
  **and** dimmer than that shaft with the ratio in the constants, and clause (d) — a z-offset is
  NOT a fix for this class.
- **The recurrence adds a constraint the original row did not name:** here the apparatus line is
  *thicker than the arrow's head* (axle 0.07 vs cone 0.08), so clause (b) is **two-sided** — the
  head must clear the apparatus silhouette as well. Fixing `RBR_AXLE` geometry is in scope, not
  just the arrow.

### Acceptance criteria (objective, so the re-review needs no taste)

1. S1 frozen: hue-gated `rbr_l_arrow` ink **≥ 400 px** (15 today).
2. Drawn-length fidelity: `len(L=6.51)/len(L=1.14) = 5.71 ± 0.10` measured **in pixels**, fitted
   intercept **< 1 px**.
3. Arrow-vs-axle stroke contrast **≥ 3:1**.
4. S4: flipping the spin changes **≥ 300 px** in the axle column.

### The general lesson, worth more than this row

**When an element is reported invisible, measure its on-screen ink before proposing a
mechanism.** Hue-gate its pixels, report count and bbox. A material-level explanation is only
admissible once the ink count shows the element is being rasterised at a size worth brightening.
And **pair every delta assertion in a probe with an absolute floor**, or the probe cannot tell
"it changed" from "there is nothing there to change."

I filed F-C7 from material properties without measuring pixels. founder-proxy caught it by
driving the sim. Recorded plainly because the next invisible-overlay finding will look the same.

Owner: `peter_parker:field3d_surgeon` via Desk E. **BLOCKING — `angular_momentum` holds for this
fix.** No DB write made from this desk.

---
## PASS 16 — **E7 has a back-compat surface. `FROZEN_SCOPE_0c3.md` §C row C-3 says it does not.**

Filed 2026-08-05 by Desk C as **E7's named verifier** (`ENGINE_LANDING_NOTICE.md` §5). This is a
correction to a frozen-scope premise, not a new defect and not an engine dispatch.

### The premise

`FROZEN_SCOPE_0c3.md` §C row **C-3** reads: *"**No back-compat constraint: no concept JSON
consuming rbr exists on any branch** (Desk C verified and withdrew its earlier contrary claim)."*

### What this desk actually withdrew was narrower

The withdrawal (cycle-2 report §5.3 item 4) was about **`conservation_of_angular_momentum`'s
"already-approved states"** — Desk A's concept, which has no JSON on any branch. That was correct
and stands. It was then generalised to *no rbr JSON anywhere*, and the generalisation is false.

```
git show origin/feat/rotmech-c:src/data/concepts/angular_momentum.json | grep -n scenario_type
  588:    "scenario_type": "rigid_body_rotation",
```

`angular_momentum.json` — commit `7877393`, **2026-08-05 01:31:12 +0200**, on `origin/feat/rotmech-c`
— consumes the rbr scenario. `FROZEN_SCOPE_0c3.md` was last written at `6c5ed6d`, **14:06:26 +0200**
the same day: the JSON preceded it on origin by ~12½ hours. Not a race — a stale premise.

### Why it lands on E7 rather than on C-3's deferral

C-3 is deferred, so its own back-compat clause costs nothing today. **E7 is dispatched**, and it
rebuilds the primitive this JSON consumes: mesh-cylinder shaft replacing the zero-width `Line`,
two-sided clearance with `RBR_AXLE` geometry in scope, and a bounded magnitude→length map
replacing the raw `RBR_L_ARROW_SCALE` clamp. The §C registration rider's **"absent = byte-identical"**
clause can no longer be discharged against an empty consumer set.

Committed authoring E7 must not regress:

| `angular_momentum.json` | Field | Surface |
|---|---|---|
| `:628` `:671` `:759` `:790` | `show_l_arrow: true` (4 states) | arrow renders wherever asked |
| `:718` | `show_l_arrow: false` | S3 stays clean |
| `:641` | `phases[]` → `glow_focal: rbr_l_arrow` @ 15200 ms | S1 focal handoff |
| `:684` | `phases[]` → `glow_focal: rbr_l_arrow` @ 12600 ms | S2 focal handoff |
| `:766` | state-level `glow_focal: rbr_l_arrow` | **S4 — where the ≥ 300 px flip criterion is measured** |

This is a *strengthening* of E7's verification, not new scope: the four PASS 15 acceptance floors
already measure this concept's frames. It means an rbr A/B can now be run against real authored
states rather than asserted vacuously — which is what Desk E's own §F verification standard asks
for, and what Desk E correctly said it could not do itself (§5: *"this desk will never seed an rbr
concept"*).

### Confirmed while here — the E7 acceptance criteria are consistent across both documents

`founder_proxy_B.md` §6 and `FROZEN_SCOPE_0c3.md` §B E7's "secondary acceptance floors" agree
verbatim: S1 ink **≥ 400 px** · `len(6.51)/len(1.14)` = **5.71 ± 0.10** fitted in pixels with
intercept **< 1 px** · arrow-vs-axle contrast **≥ 3:1** · S4 flip **≥ 300 px**. The contract
correction's primacy rule — **assert drawn geometry, not pixel luminance**, with these floors
secondary — is recorded and will be verified in that order. A confirmation, per §5's ask.

Owner: `peter_parker:field3d_surgeon` via Desk E, **as an amendment to the E7 dispatch's
back-compat framing** — not a new row and not a new `bug_class`. No engine fix dispatched from
this desk (guardrail 6). No DB write made from this desk.

---
## PASS 17 — **E7 VERIFIED on `angular_momentum`. Plus two harness findings, one of which makes a recommended check unsound.**

Filed 2026-08-06 by Desk C as **E7's named verifier** (`ENGINE_LANDING_NOTICE.md` §5 — Desk E's
canaries do not exercise rbr, so E7 was LANDED but not VERIFIED until now). E7 = `14b2943`,
confirmed an ancestor of `origin/master`. Full measurement table in
`angular_momentum/founder_proxy_B.md` §6.

### 1 · E7 is correct. F-C8 is closed, and F-C2 and F-C7 close with it.

Primary assertion is **drawn geometry**, per E7's own contract correction — F-C7's luminance-delta
probe is deliberately NOT carried forward, because it passes on a build where the arrow is invisible.

- L shaft: `Mesh` · `CylinderGeometry` · `MeshPhongMaterial` — no longer a zero-width `THREE.Line`.
- Separability **by construction, both consumers**: L shaft `0.090` ÷ axle `0.045` = **2.0 exact**;
  pull shaft `0.080` ÷ rod `0.040` = **2.0 exact**. The C-6 merge-into-E7 ruling was honoured — one
  mechanism, two consumers — and the clearance is genuinely two-sided (`RBR_AXLE_R` 0.07 → 0.045).
- Emissive ratio 6.0 as declared (apparatus 0.14, arrow base 0.84).
- **S1 ink 1247 px** in a **45×68** bbox, against the pre-fix **15 px / 11×6**. Floor 400 → 3.1× margin.
- **Contrast 8.79 : 1** vs floor 3:1.
- **S4 flip 5518 px** changed vs floor 300.
- **Drawn world length exactly proportional**: slope **0.200000** = `RBR_L_ARROW_SCALE`, intercept
  **1.5e-15**, `len/|L| = 0.20000` at **7/7** pins across L = 1.53…6.12 and both signs.

**F-C2 closes as intended**: true zero (length 0 hides the meshes, no 0.22 stub beside a readout
saying 0.00) and a knee-then-asymptote map whose knee (10.0) sits above the slider maximum, so every
reachable |L| is on the exactly-linear segment.

**One measurement trap, recorded because it nearly became a false finding.** `rbrSetVectorLength`
shrinks the head for short vectors (`hl = min(_headLen, L × 0.40)`) so tip-to-tail is exactly the
requested length. Computing drawn length as `shaft.scale.y + _headLen` (the CONSTANT) instead of
`+ head.scale.y` (the actual) fabricates a length floor at low |L| — it reported `len/|L|` rising
0.200 → 0.277 and a fitted slope of 0.162, which reads exactly like a min-length clamp regression.
It is an artifact of the probe. Read the setter before filing a proportionality defect against it.

### 2 · P1-2 / F-C3 — downgrade to ride-along, on measured evidence

P1-2's routing note set the condition itself: *"if P1-1 lands and the arrow carries L continuously
through a drag, this degrades from fatal to annoying."* Over a 10-sample real `input`-event drag of
`rbr_omega0_slider`: the numeric row **still blanks on 10/10** (`I = — · ω = — · L = —`, restored
after release) — E6 has not landed, F-C3 is untouched — but the **arrow is drawn on 10/10**, length
exactly 0.20·|L|, sweeping 0.612 → 1.224 world as L goes 3.06 → 6.12. The magnitude is now legible
throughout the drag even though the digits are not. **Blocking → ride-along. Still OPEN until E6.**

### 3 · E5's loud token channel — a clean confirmation

Zero `[PM_RBR_TOKEN]` warnings and zero console errors across every state of this concept. Every
`readouts` token it authors is a known row. Before E5 this was unfalsifiable — an unknown token was
skipped in silence — so this is the first run in which a clean readout table is actually *evidence*.

### 4 · ⚠ HARNESS — the §4 trap-1 remedy is UNSOUND in this harness. It cannot detect a dead scene.

`ENGINE_LANDING_NOTICE.md` §4 says: *"Until this is fixed, `md5sum` your dense frames. One hash
across the series = a dead scene."* **On this harness that check can only ever return all-clear.**

The capture path's **PNG IDAT compression is nondeterministic while the pixels are not.** Demonstrated
on two consecutive `visual:eyes` runs of the identical build with zero changes between them
(`20260806-021608` vs `20260806-022052`): 10 frozen/panel_a pairs are **byte-different** — differing
IDAT chunk lengths, e.g. 3448 vs 3468 — and **pixel-identical**, 0 of 921600 differing under
pixelmatch on every pair.

So a totally static scene would still emit N distinct md5s and the operator would read "it moved."
I ran the md5 check first and it reported 106/106 distinct hashes — which proved **nothing**.
Desk B's observation that its two dead concepts were MD5-*identical* is therefore not general;
whatever made the encoder deterministic there does not hold here, and the check silently inverts.

**The sound test is pixel-level adjacent-frame comparison.** Run on all 5 states: **zero identical
adjacent pairs**, adjacent diffs 0.078 %…0.948 %, first-vs-last 0.334 %…0.965 %. `angular_momentum`
is genuinely not a dead scene — but that is established by pixels, not by hashes.

Recommend amending the scar row
`eye_dense_motion_gates_all_pass_by_construction_on_a_totally_static_scene`
so its prevention rule names a **pixel** comparison; an md5-based remedy encodes a check that cannot
fail. Not filed as a DB row from this desk (guardrail 9) — flagged for Desk E's manifest.

### 5 · B-11 on this concept — the frozen frame WAS deterministic, but nothing is checking it

The same two-run comparison answers B-11 for `angular_momentum` directly: all five `__frozen` frames
are **pixel-identical** across runs. The "deterministic by luck, not construction" caveat did not
bite here, so frozen-frame judgments in this cycle are sound.

**The gap is elsewhere and it is worth stating plainly:** `[H2]` reported *Skipped — no approved
baseline*. This concept has never been baseline-locked (correctly — `visual:approve` is founder-only
and it was never approved), so **there is no A/B regression signal on it at all.** Every verdict in
this cycle rests on the frames' own merits plus the geometry probe. Third blind spot carried into
the verdict: byte-identical A/B would only have proven non-regression anyway, and here there is not
even that.

No engine fix dispatched from this desk (guardrail 6). No DB write. No `visual:approve`.

---
## PASS 18 — **F-C9 · P1-A CONFIRMED independently. And the acceptance criterion I verified against could not have caught it.**

Filed 2026-08-06 by Desk C. founder-proxy returned `FIX(engine)` **blocking** at Checkpoint B fix
cycle 1 on a NEW finding (P1-A): STATE_4's reversed L vector is swallowed by the drum's projected
silhouette. **Verified here by a second, independent method before relaying it.**

### The measurement

founder-proxy measured with a hue gate. This desk re-measured with **hide-and-diff** (hide only the
`rbr_l_arrow` group, re-shoot, diff — assumes no colour at all). Two methods, same conclusion:

| pin | L | ink | bbox | non-head ink |
|---|---|---|---|---|
| S1 up | +4.59 | 1206 px | 45×**68** | **681 px** |
| S4 **pre**-flip @9500 | +4.59 | 1243 px | 44×68 | 754 px |
| S4 **post**-flip @13000 | −4.59 | **589 px** | 40×**21** | **73 px** |
| S4 post-flip @16000 | −4.59 | 610 px | 40×21 | 77 px |
| S5 up | +4.59 | 1160 px | 44×69 | 607 px |

**down/up = 48.8 %** at identical |L|. Bbox height collapses **68 → 21 px**; non-head ("shaft-ish")
ink collapses **681 → 73 px**. What survives is essentially the cone. Reproducible at two instants,
so not a frozen-pin artifact; and **pre-flip is healthy (1243 px)**, so the state is fine when the
vector points up — it is the reversed direction specifically. founder-proxy read 640 px / 40×20;
this desk reads 589 px / 40×21 — **within 8 % across two independent methods.**

The anchor is already sign-mirrored (`lArrow.position.set(0, sign * 0.22, 0)`, `:51885`), so this is
**not** an anchor bug. The camera looks down on the apparatus, so the drum's *projected silhouette*
extends further below the axis origin than 0.22 world. Clearing a body's **surface** is not clearing
its **silhouette from the authored camera**.

### The part that matters more than the defect: my verification could not have caught it

Acceptance criterion 4 read *"S4: flipping the spin changes ≥ 300 px."* I measured **5518 px** and
recorded a PASS at 18× margin. That number is large **precisely because the arrow vanishes** — a
delta between "arrow present" and "arrow absent" is exactly as big as a delta between "arrow up" and
"arrow down", and bigger than one between two legible poses. **The criterion cannot distinguish
flipped from disappeared, and I did not ask whether it could.**

This is a live recurrence of the desk's own scar — PASS 15's standing lesson, *"pair every delta
assertion in a probe with an absolute floor, or the probe cannot tell 'it changed' from 'there is
nothing there to change.'"* That row was filed from this desk after F-C7's luminance-delta probe was
caught. It was then violated by an acceptance criterion written at cycle 0 and satisfied by a
measurement taken here at cycle 1. founder-proxy owns writing it; **this desk owns verifying against
it without checking its shape.** Three of the four criteria were absolute floors; the one that was a
bare delta is the one that hid a blocking defect.

**Standing correction for every future arrow/vector verification on this chapter:** measure the
**absolute** ink at the sign or pose pointing **away from the camera**, and pair it with a ratio
against the same magnitude in the favourable pose. Never accept a bare change-count.

### Routing

Owner `peter_parker:field3d_surgeon` **via Desk E** — a NEW `bug_class`, not a fold-in to the
arrowhelper class (different root cause: solid-body silhouette occlusion, not collinearity with a
thin line). Blocking. **No engine fix dispatched from this desk (guardrail 6).**

Constraint recorded so it is not rediscovered: E7 deliberately declined `depthTest = false` for rbr
(`:50434`) because a spinning apparatus with an always-on-top arrow riding a mass inverts depth every
half turn. That reason is strong for the **pull** arrow and weak for the **axial L** arrow, which
never leaves the rotation axis. A per-state camera change is **not** an option — Rule 32d home-pose
continuity forbids S4 framing differently from S1–S3.

Also confirmed as still-true and unblocked by this: E7 itself is correct. F-C8, F-C2 and F-C7 remain
closed; the up-pointing vector is a real, legible object at 1206–1243 px in all four states that
author it. **F-C9 is a second, distinct defect on the same primitive, not a regression of E7.**

No DB write made from this desk.

---
## PASS 19 — **N2 narration audit: CLEAN on `angular_momentum`. Two probe gaps that would each have produced a false finding.**

Filed 2026-08-06 by Desk C after Desk B's N2 (rendered narration quoting arrow **world-unit lengths**
as physical speeds). This concept is the obvious second candidate: its L arrow's drawn length is
`0.20 × |L|` world units, so the same class is expressible here.

### Result — the N2 class is ABSENT, and that is a measured claim

All **74** reader-facing strings extracted structurally (`text_en`, `caption`, `label`, `title`,
`delta_cue`, `formula`, `statement`, `visual_confirmation`, `visual_counter`, `belief`, `.text`) and
swept for the arrow's world-unit lengths at every authored |L| — 0.918, 0.792, 0.612, 0.342, 0.306,
0.198, 1.224. **No world-unit value appears anywhere.** No `wu`/"world units", no engine verbs
(render/draw/mesh/sprite/canvas/pixel), no authoring tokens (`at_ms`, `glow_focal`, `STATE_n`).

Every asserted value verified against the **rendered** readout row at its own instant, not against
engine globals alone:

| assertion | source | engine | rendered on canvas |
|---|---|---|---|
| L settles at 1.53 | `s2_2` + chip `predicted L = 1.53` | 1.530 | `L = 1.53 kg·m²/s` ✓ |
| L reads 4.59 | `s3_1` | 4.590 | `L = 4.59 kg·m²/s` ✓ |
| ω is zero, so is L | `s3_2` | 0.000 / 0.000 | `ω = 0.00 · L = 0.00` ✓ |
| L reads 0.99, not 4.59 | `s3_5` + scene text + `aha_moment` | 0.990 | `L = 0.99 kg·m²/s` ✓ |
| ω = 1.50 after restart | chip `same speed: 1.50` | 1.500 @19500 | `ω = 1.50 rad/s` ✓ |

Rule 33d holds: every asserted quantity has a live instrument (`I`, `ω`, `L` rows) showing it in real
units at that instant.

**Not defects, recorded so a later reader does not re-file them:** `before: 4.59` (@7800) and
`same speed: 1.50` (@17000) read against a stopped turntable (ω = 0). Both are *reference chips* —
explicitly labelled baselines that hold a value for comparison, which is this concept's approved aha
mechanism (`aha_moment.visual_confirmation` is literally "L reads 0.99 beside the 'before: 4.59'
chip"). `same speed: 1.50` is a forward reference that the live instrument matches 500 ms later at
the restart. A naive "chip value ≠ live value" probe flags both; both are correct.

### ⚠ Two probe gaps, either of which would have produced a false verdict

1. **A digit regex finds NOTHING in this concept's narration.** Rule 30 requires spoken numbers be
   spelled out for TTS, so `s2_2` says *"settle at one point five three"*, `s3_1` *"four point five
   nine"*, `s3_5` *"point nine nine … not four point five nine"*. A digit sweep over `text_en`
   returns zero matches and reads as **"narration quotes no numbers — clean."** It is the exact
   opposite: narration is where three of the five value assertions live. **Any N2 audit on this
   fleet MUST sweep spelled number-words, not just digits.** Desk B's N2 was found in narration; a
   digit-only sweep would have missed it on a Rule-30-compliant concept.
2. **First extraction silently missed 10 on-canvas strings.** `caption` and `label` sit at the
   **state** level of `field_3d_config.states.<S>`, not inside the `rigid_body_rotation` block. An
   extractor reading `st.rigid_body_rotation.caption` returns undefined and reports clean coverage.
   Caught only by diffing extracted counts against ground truth (18 tts vs 18 in file, 15 scene
   texts vs 5 states × 3). **State the coverage count and reconcile it, or a null extractor reports
   a null result as a pass.**

Same shape as PASS 17 §4 and PASS 18: on this harness the cheap check keeps failing *open*.

### P2-1 verification — and a third near-miss

STATE_4's new `phases[]` was verified from **scene state** (each token's `emissiveIntensity` vs its
own baseline), not from pixels. All four fire: `grip_hand` 1.00 → **1.43/1.48** across p2 and back to
1.00 at p3; `mass` 0.24 → **0.94/0.64** across p4; `l_arrow` boosted across p1/p3.

Two ways this nearly read as a defect: (i) the grip hand is a `THREE.Group` with **no material of its
own** — the glow pass `traverse()`s it, so reading `obj.material` returns nothing and the token looks
dead; (ii) comparing absolute emissive **across** element types is meaningless — `rbr_l_arrow`'s
baseline (0.84) exceeds `rbr_mass`'s boosted value (0.94 vs base 0.24), so "brightest object wins"
reports `l_arrow` focal at every instant. **Compare each token against its own baseline.**

### Consequence of P2-1 that the founder should see: STATE_4's frozen pin MOVED

`deriveStateMeta` takes `phases[].at_ms + 500` as a reveal candidate (`:3283-3292`), so the pin went
**13000 → 16000 ms** (p4 @15500). Verified in the run: `Reveal map: STATE_4=16000ms`. This is
unavoidable — any phase after ~12500 moves it, and s4_3/s4_4 must follow the flip at 11000.

16000 is still inside the flipped run (11500–19000), so the frozen frame still shows the reversed
vector; but its **focal is now `rbr_mass`, not `rbr_l_arrow`**. founder-proxy called the flipped
L-arrow frame *"the single most important frame for the FIX(engine) sign-off"*. That frame is still
capturable from the dense series; it is no longer the frozen one. **Flagged for the cycle-2 taste
call — not a defect, a consequence of the fix that was asked for.**

**P1-A / F-C9 re-measured at the new pin and STILL OPEN:** 595 px, bbox 40×21, non-head ink **53** vs
**677** for the up vector — ratio **48.9 %**. Consistent with 589 px @13000 and 610 px @16000 before
the edit, so the finding is robust to the pin move and Desk E can verify at either instant.

No DB write, no engine dispatch (guardrail 6), no `visual:approve`.

---
## PASS 20 — **F-C9 VERIFIED on `angular_momentum`. The reversed L vector is a vector again.**

Filed 2026-08-13 by Desk C as **F-C9's named verifier** (Desk E's canaries do not exercise rbr, so
the fix was LANDED but not VERIFIED on a real rbr config). Containment checked directly rather than
from the brief: `f003025` **is** an ancestor of `origin/master` (PR #42, merged 2026-08-07).
Re-run on the real config per Desk E's ask; the rig needs no DB and no seed of its own — it reads
the desk's own scoped seed.

### Method — the PASS 18 standing correction, applied

**Absolute ink at the pose pointing AWAY from the camera, plus a ratio against the favourable pose.**
Never a bare change-count: that is exactly why F-C9 stayed hidden for a whole cycle while E7 passed
at 1579 px on the *favourable* pose and the S4 criterion ("flip changes ≥ 300 px") passed at 5518 px
**because the arrow vanished**. Ink measured by hide-and-diff on the `rbr_l_arrow` group, so no
colour is assumed; "shaft ink" = ink on rows narrower than 60 % of the widest row (the head).

### Result — all four floors met at every post-flip instant

| pin | ink (was 589) | ratio vs up (was 48.9 %) | bbox height (was 21) | shaft ink (was 53) |
|---|---|---|---|---|
| @13000 | **1083** ≥700 ✓ | **81.7 %** ≥60 ✓ | **60** ≥55 ✓ | **554** ≥200 ✓ |
| @16000 | **1024** ✓ | **77.2 %** ✓ | **60** ✓ | **457** ✓ |
| @18000 | **1016** ✓ | **76.6 %** ✓ | **60** ✓ | **449** ✓ |

**Shaft ink 53 → 554 = 10.5×.** Desk E measured 51 → 545 = 10.7× on its own rig. Two independent
measurements, different concept, different harness, agreeing to ~2 %. Desk E's ratio 48.2 % → 84.1 %
against this desk's 48.9 % → 81.7 %; the residual (18.3 % here, 16 % there) is the same perspective
term Desk E proved three ways — the vector runs along the axle, so its far end sits at greater camera
depth and projects shorter. Consistent with the E7 criterion-2 amendment already on the record.

**Up-pose non-regression:** S1 1206 → **1326**, S4 pre-flip 1243 → **1223**, S5 1160 → **1273**.
No pose lost ink. The up-pose numbers moved by up to +10 % and bbox height 68 → 72; that is drift
from 422 commits of master (this desk was 422 behind), **not** from F-C9, and it is an increase in
every case. Recorded so a later reader does not read it as a regression.

### Also confirmed this session

- **E6 has NOT landed** — verified in source, not assumed: `rbrCutTime(1)` still evaluates
  `at_ms + (0 × Infinity)` → `NaN` for a one-shot restart, and because `tMs < NaN` is false the
  count returns 1 from t = 0. The `isFinite` guard at `:56310` fixes only the *count* path, not the
  time arithmetic at `:56300`. **`STATE_3.restart.every_ms: 99000` therefore stays.**
- **E9 has NOT landed** — no per-state camera authoring exists for rbr. `rigid_body_rotation` stays
  parked; json-author not started.
- Dead-scene check redone at **pixel** level (md5 is unsound on this harness — PASS 17 §4): zero
  identical adjacent pairs across all 5 states, adjacent diffs 0.089 %…0.936 %.
- Zero `[PM_RBR_TOKEN]` warnings and zero console errors.
- **`[H2]` Skipped — no approved baseline.** This concept still carries **no A/B regression signal at
  all**. Every verdict rests on the frames' own merits plus the geometry probe. Stated rather than
  left as silence.

No DB write, no engine dispatch (guardrail 6), no `visual:approve`.
