# realistic spring choreography — engine seam report

> 2026-07-30. Engine-only session for `docs/NLB_SPRING_CHOREOGRAPHY_SPEC.md` (founder-approved, from a
> screen-recording review of `newton_third_law`). NO concept JSON authored. Two `field3d-surgeon`
> dispatches, one commit per seam, on `feat/lom-a` in `C:\Tutor\physics-mind-lom-a`.
> Prior seams: `d9d07a0` / `208a8ba` (`push_off` + spring geometry, `docs/loop_runs/push_off_report.md`),
> `64fc247` (repeat cycle, `docs/loop_runs/repeat_report.md`).

| Seam | Commit | What |
|---|---|---|
| A | `2b6f503` | `spring_action` phase machine + release-window dt scaling (`slow_factor`) + `slow motion ×N` badge |
| B | `9421ba2` | compression-stroke cart script + coil-length choreography + post-release ring |

Verify chain green at HEAD (`9421ba2`), independently re-run by the orchestrator after each surgeon's
own run: `check:renderer-syntax` OK (field_3d 2230 KB, particle_field 220 KB) · `npx tsc --noEmit`
0 errors · `validate:concepts` **127 PASS / 0 FAIL** (warning profile unchanged).

**The founder's finding is answered with pixels.** eye-walker read the probe frames
(`.scratch_nlb_spring\`, real assembled renderer under Playwright) and returned **PASS**: the coil's
length sequence reads approach(long) → compress(**intermediate**) → hold(short) → release(**intermediate**)
→ ring(long) — the accordion shape. Mid-release also shows the `slow motion ×6` badge (top-left, amber)
and true HUD values `F = 30.00 / −30.00 N`, `a = 7.50 / −2.50 m/s²`. Founder-eyes frames:
`mid-compress_23000ms.png` · `mid-hold_2800ms.png` · `mid-release_26260ms.png` ·
`mid-approach_21810ms.png` · `ring_27552ms.png`.

**Regression (shared-renderer leakage):** `cache:clear:scoped electric_flux` → re-seed →
`visual:eyes` = **62/62 deterministic checks, $0.00**; eye-walker read all 10 states' contact
sheets/dense/frozen/keyframes: **CLEAN** — no stray coil, no badge, no glow/framing/HUD regression,
zero candidate `engine_bug_queue` rows. Seam B's surgeon additionally re-seeded + EYE'd the three nlb
concepts that execute the changed integrator lines: `free_body_diagram` 38/38, `block_on_incline`
32/32, `connected_bodies` 44/44 — **H2 = 0.00 % on every baseline compare**.

---

## 1. What landed

### Seam A — the `spring_action` phase machine + slow window + badge

Sequence per cycle: **approach → compress → hold → release (slowed) → coast → re-arm**, with the
existing `push_off.repeat_every_ms` / `_po_cycle` / `nlbResetTrajectory()` re-arm as the ONE rewind path.

The whole wall-vs-physics resolution is one affine remap. With `lead = approach+compress+hold`,
`S = slow_factor`, `t0/t1 = contact_from_ms/release_at_ms`:

```
phase = t − cycle·R                       // WALL time — the existing repeat arithmetic, unchanged
tPhys = t0 + (phase − lead) / S           // ONE remap
inContact = (tPhys >= t0) && (tPhys < t1) // the ORIGINAL gate expression, untouched
```

The release window occupies wall phase `[lead, lead + (t1−t0)·S)`; the integrator sees
`dtPhysics = inSlowWindow ? dt/S : dt`, so the physics inside it runs exactly `t1−t0` ms. The phase
clock is never scaled — choreography, repeat cycle and reveal pin share one wall-clock timeline; only
the integrator slows. Measured: stroke 0.876 m (true 0.882), exit speeds 3.140/−1.047 (true 3.150/−1.050).

- **Force choreography** (closed form of phase, Rule 36): approach F=0 · compress F = force_N·progress
  (arrows grow in) · hold ±force_N · release ±force_N at dt/S · coast 0.
- **The latch** (the one thing the spec didn't name): during approach/compress/hold the pair rides the
  EXISTING `fixed`-body branch (`b.fixed || nlbLatchedNow(eng,b)`) — force in, no acceleration, one
  code path. Without it the 1.6 s ramp's 24 N·s of impulse would launch the carts before release.
- **Badge**: `#nlb_slowmo`, text exactly `slow motion ×6` (U+00D7), `top:52px;left:12px` (clears review
  chrome + every overlay, Rule 34d), shown ⟺ the release window is active, blanked on state entry,
  Rule 39g-compatible. HUD numbers are NEVER scaled (slowed release verified reading a = 7.50/−2.50,
  where a scaled report would have read 1.25/−0.42).
- **Rule 36 (verified, not asserted)**: dtPhysics is a scale on a dt the step is already linear in; no
  sub-stepping, no literal 0.016, no second clock/accumulator; `__pmSteps`/`dtStep`/`animate()`
  untouched ⇒ NO Rule 36b fleet sweep. Freeze pins mid-hold AND mid-release (dtPhysics = 0): 40 held
  frames each, one t_ms/phase/sA, 0 re-arms, screenshots byte-identical (32102=32102, 35066=35066).
- **Rule 37**: sandbox — choreography entirely inert (no latch, no slow window, no badge, phase `''`),
  even with `spring_action` authored. Seize (`PM_nlbSweepSeized`/`PM_nlbBodyDragged`) nulls the
  choreography outright → degrades to the pre-existing single-fire path.
- **Omitted key ⇒ bit-identical** to before (`lead=0, S=1, tPhys===phase, hPhys===h`, latch false) —
  proven on a 700-frame control state with 0 mismatches and re-arm times identical to the repeat-seam
  probe. No concept on this branch authors `push_off`/`spring_action`.
- **Reveal pin** (`deriveStateMeta.ts`): a `spring_action` state pins mid-HOLD (fallbacks: 35% into the
  wall release window, then mid-compress) — the loaded, legible beat. Spec choreography → 2800 ms.
  Non-spring_action push_off states keep the repeat-seam value unchanged (2747 verified).
- **Cycle floor raised**: `repeat_every_ms` must exceed `lead + (t1−t0)·S` (5920 ms for the spec
  numbers); too-short degrades to single-fire exactly as before. `deriveStateMeta` mirrors the guard.
- **Published for the geometry layer** (derived reads, never a second source of truth):
  `eng.spring_phase` (`''|approach|compress|hold|release|coast`), `eng.spring_phase_ms`,
  `eng.spring_progress`, `eng.spring_ring`, `eng.slow_active`, `eng.spring_slow_factor`,
  `eng.push_off_latched`, mirror `window.PM_nlbSpringPhase`.

### Seam B — the compression stroke + coil choreography + ring

- **Cart script** (`nlbSpringLoadPose`, runs only while latched, i.e. `phase < lead`): position is a
  pure closed form of phase (smoothstep-eased, derivative 0 at both ends — no snap, no velocity step).
  Approach: face-to-face gap `natural+0.6 m → natural` (coil at full natural length, mounted on
  `spring.between[0]`'s face — "the other cart comes to meet the spring"; contact lands exactly as
  approach ends). Compress: gap `natural → compressed` (pitch visibly tightens). Hold: exactly the
  authored seed, which is what the release integrates from. Travel splits symmetrically about the seed
  midpoint (Rule 32d); a `fixed` body takes none of it; clamped to the rail bounds; only `b.s` is
  written — placement still flows through the `nlbSetBodyPosition` funnel.
- **Coil length**: with a live choreography the fit target is capped at natural in every phase, so THE
  GAP does the compressing — `drawn == gap` on every compress and release frame (to 1e-6). This closes
  the seam-A-flagged defect where the coil held 0.72 m while the slowed release opened the gap.
- **Ring** (coast, `ring !== false`): `len = natural + 0.08·e^(−t/130)·sin(2πt/100)` world units off
  `eng.spring_phase_ms`, 450 ms window, then hide. `sin(0)=0` → continuous handover. Cosmetic only:
  a coil length, `min(gap, ringLen)`, mounted at `between[0]`'s face — never feeds the integrator,
  never moves a cart (probe: F = 0, no latch, vA constant through the ring).
- **Visibility**: the `gap > natural + 0.02` hide rule gains exactly two exemptions — `approach` and an
  active ring. Every other phase and every non-choreography state takes the byte-identical old rule.
- **Rule 36**: all drivers are closed forms of published phase state + positions (grep of added lines
  for `0.016|+= dt|Date.now|performance.now|setInterval` = 0 hits); `NLB_SPRING_LEN_Q` quantised
  rebuild kept. Freeze byte-identity verified at 5 pins including mid-compress and mid-release.
- **Rule 37 / seize mid-approach**: carts stay exactly where the script left them (no teleport), phase
  goes `''`, coil degrades to the plain gap fit — since the gap is then wider than natural the coil
  hides until the teacher brings the carts back within 1.6 m (self-healing; logged as a scar row for a
  possible founder overrule).

## 2. The authoring surface

On the per-state `newtons_laws_body` block, alongside `push_off` (whose full contract from
`push_off_report.md` §2 + `repeat_report.md` §2 still binds — spring position `|s_a − s_b|`, body-a on
the positive side, no `'F'` in `controls_visible` on a guided push-off state, `glow_focal: "nlb_spring"`,
≥15 N arrow floor):

```ts
spring_action?: {
    approach_ms?: number;   // carts converge, coil at NATURAL length, no force yet
    compress_ms: number;    // coil VISIBLY compresses; force ramps in
    hold_ms?: number;       // latched and loaded: compressed coil, full arrows, live HUD
    slow_factor?: number;   // playback slowdown for the RELEASE only, default 6 (1 = real time;
                            //   <1 / non-finite / absent → 6, never a speed-up)
    ring?: boolean;         // brief damped coil oscillation after release (default true)
};
```

- Each duration guards to 0 when absent/invalid (that beat simply doesn't exist).
- Zod is `.passthrough()` — no schema edit needed to author it.
- **`repeat_every_ms` floor with a choreography**: must exceed
  `approach_ms + compress_ms + hold_ms + (release_at_ms − contact_from_ms)·slow_factor`, else the
  repeat silently degrades to single-fire (validator candidate logged).
- A `mode:'sandbox'` state gets NO choreography regardless of what is authored (Rule 37).
- The ring's amplitude/decay/period and the spring's natural (1.6 m) / compressed (0.72 m) lengths are
  apparatus constants, not authorable.

## 3. `newton_third_law` — the EXACT numbers for the lom-b session to apply

`newton_third_law` does **not** exist on `feat/lom-a` (verified: no `src/data/concepts/newton_third_law.json`
here), so per the session brief NOTHING was authored. The lom-b session applies, on **each of its three
`push_off` states**:

```jsonc
"spring_action": {
    "approach_ms": 600,
    "compress_ms": 1600,
    "hold_ms": 1200,
    "slow_factor": 6,
    "ring": true
},
// and on the same states' existing push_off block:
"repeat_every_ms": 7200      // raised from 2600
```

Why 7200: lead = 600+1600+1200 = 3400 ms; slowed release = 420·6 = 2520 ms; floor = 5920 ms; 7200
leaves ~1.3 s of coast+ring per cycle and gives ONE full realistic cycle per narration beat instead of
four flashes (the spec's own recommendation). Everything else in the states is untouched — the reveal
pin moves itself to mid-hold (2800 ms into the cycle) with no authoring. After applying: re-seed +
`visual:eyes -- newton_third_law` (expect H2 fails against any pre-choreography baselines — that is the
Rule 34e re-baseline path after founder OK, not a fix cycle).

## 4. Scar candidates (text only, in `docs/loop_runs/lom/_engine/scar_candidates.sql`; nothing applied)

Seam A: `nlb_spring_release_plays_at_raw_420ms_with_no_compression_or_hold_beat_and_no_slow_motion`
(CRITICAL, FIXED) · `nlb_spring_coil_holds_its_compressed_length_while_the_release_stroke_opens_the_gap`
(MAJOR → FIXED by seam B) · `nlb_spring_action_repeat_cycle_shorter_than_the_slowed_choreography_degrades_to_single_fire`
(MODERATE, OPEN — validator candidate) · `renderer_slow_motion_window_must_scale_dt_only_and_label_itself_on_canvas`
(MAJOR, OPEN — the reusable doctrine).
Seam B: `nlb_spring_coil_geometry_does_not_follow_the_choreography_phases` (CRITICAL, FIXED) ·
`renderer_latched_body_pose_must_be_a_scripted_closed_form_or_the_loading_beat_is_invisible` (MAJOR,
OPEN) · `nlb_spring_seize_during_approach_hides_the_coil_until_the_carts_are_within_natural_length`
(MODERATE, OPEN — founder may overrule) · `nlb_hud_reads_v_zero_while_the_scripted_loading_beat_visibly_moves_the_carts`
(MODERATE, OPEN — see founder flags).

## 5. Founder flags / interpretive calls

1. **HUD `a` reads 0.00 during the hold beat** (the pair is latched; it jumps to 7.50/−2.50 at
   release). Honoured "true values" as a no-scaling constraint; printing a not-yet-happening 7.50 while
   nothing moves would be a Rule 24 falsehood. Flag if the founder wanted the preview number.
2. **HUD `v` reads 0 while the scripted loading beat visibly moves the carts** (same latch). Two
   resolutions logged: author `readouts` without `v` on loading states, or publish the scripted
   closed-form velocity for the readout only. Founder call.
3. Approach travel = 0.6 m (comparable to the 0.88 m stroke, similar reading speeds); ring numbers
   (amp 0.08 w, τ 130 ms, period 100 ms, 450 ms window) are apparatus constants — same precedent as the
   spring lengths.
4. `contact_from_ms` contributes its duration, not an extra offset — the phase offset is `lead` alone.
5. With `hold_ms = 0` the release starts ~0.3 mm off the seed (eased-script frame residual, not an
   accumulation); the spec default `hold_ms: 1200` makes it exact.
6. Orchestrator hand-fixes: 4 tsc literal-widening errors in the seam-A scratch probe (type casts only,
   zero runtime change) — the surgeon's tsc run predated its last probe edit.

## 6. Deliberately not done

No concept JSON (so still no live EYE on a real `spring_action` concept — the proof is the
real-code-path Playwright probe + eye-walker on its frames + three zero-diff nlb concept EYEs +
the electric_flux leakage EYE). No DB write, no schema/validator change, no `visual:approve`, no TTS,
no deploy, no refactor of `nlbFitSpring`/`nlbResetTrajectory`/the shared clock, no branch/worktree
change, no Rule 36b fleet sweep (no shared-clock edit). `newton_third_law` untouched (lives on
`feat/lom-b`; §3 has the numbers).
