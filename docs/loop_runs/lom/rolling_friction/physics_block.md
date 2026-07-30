# PHYSICS BLOCK — `rolling_friction`
*(physics_author output, appended to the architect skeleton at
`docs/loop_runs/lom/rolling_friction/skeleton.md`. Engine: `newtons_laws_body` Branch A + SEAM G.
Rule 41 plain-language register honored throughout. Rule 20: board mode SKIPPED entirely below.)*

---

## 0. Rigor check — every skeleton number independently re-derived

Re-derived from the Branch-A formulas in `docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md` §2 (not copied from
the skeleton), then cross-checked one state (S3, the only time-varying-coefficient state) with a
0.5 ms-step numeric simulation using BOTH the spec's literal `s += v_new*dt` and the shipped engine's
trapezoid `s += 0.5*(v_old+v_new)*dt` (scar `spec_semi_implicit_euler_position_not_step_count_invariant`
— the two forms differ by < 4 mm here, irrelevant at this scale but worth confirming they agree).

| # | Claim | Skeleton value | Independent recompute | Verdict |
|---|---|---|---|---|
| 1 | Block break-away | μₛmg = 0.40·5·9.8 = 19.6 N; F = 20.0 N moves it | 19.6 N exactly; 20.0 > 19.6 ✓ | **CONFIRMED** |
| 2 | S1 block acceleration | a = (20−19.6)/5 = 0.08 m/s² | 0.08 m/s² exactly | **CONFIRMED** |
| 3 | S1 wheel friction + acceleration | f = 0.002·49 = 0.098 N; a = (20−0.098)/5 = 3.98 m/s² | f = 0.098 N exact; a = 3.9804 m/s² | **CONFIRMED** (3.9804 rounds to 3.98) |
| 4 | Acceleration gap | "~50×" | 3.9804/0.08 = 49.75× | **CONFIRMED** ("~50×" is the correct order; exact value 49.75×, not 50.00× — say "about 50 times" in narration, never "exactly 50") |
| 5 | Friction gap | "~200×" | 19.6/0.098 = 200.0× exactly | **CONFIRMED**, exact |
| 6 | S1 wheel finish time/speed | 2.35 s, v ≈ 9.4 m/s | t = √(2·11/3.9804) = 2.351 s; v = a·t = 9.359 m/s | **CONFIRMED** (finish time matches; v more precisely 9.36 m/s, not 9.4 — minor tighten, not a defect) |
| 7 | S1 block position/speed at t=12s | +0.76 m, v = 0.96 m/s | s = ½·0.08·144 = 5.76 m → −5+5.76 = +0.76; v = 0.08·12 = 0.96 | **CONFIRMED**, exact |
| 8 | S2 glide | both a = 0 at F=19.6/0.098, v = 1.0 m/s constant | drive − μN = 0 for both bodies by construction | **CONFIRMED** |
| 9 | S2 bound arrival | both reach +6 at t = 11 s of the 12 s state | s = v·t = 1.0·11 = 11 m = −5+11 = +6 | **CONFIRMED**, exact |
| 10 | S3 phase 1 (0–3 s) | a = −0.0196 m/s²; v(3s) = 1.44; s = 4.41 m, pos ≈ −0.59 | a = −μᵣg = −0.0196 exact; v=1.5−0.0588=1.4412; s=1.5·3−½·0.0196·9=4.4118 → pos −0.5882 | **CONFIRMED** |
| 11 | S3 phase 2 coefficient | a(τ) = −0.0196 − 0.193τ | a(τ) = −0.0196 − (0.118/6)·49·τ/5 = −0.0196 − 0.19267τ | **CONFIRMED** (0.19267 rounds to 0.193) |
| 12 | S3 stop time | τ = 3.77 s (t ≈ 6.8 s) | Hand quadratic: τ = 3.7676 s (t = 6.768 s). **0.5 ms numeric sim (both integrator forms): t = 6.754 s** | **CONFIRMED** — hand algebra and numeric sim agree to 0.02 s; both round to "≈6.8 s" |
| 13 | S3 stop position | +2.98 m | Hand algebra: +2.985 m. Numeric sim: **+2.9849 m** (trapezoid) / +2.9846 m (spec-literal form) | **CONFIRMED**, matches to 3 decimals; +2.985 rounds to either +2.98 or +2.99 at 2dp — use +2.98 for consistency with the skeleton. Margin to the ±6 bound: 3.0 m |
| 14 | S4 block stuck | μₛN = 0.40·98 = 39.2 N > 20 N | 39.2 N exact | **CONFIRMED** |
| 15 | S4 wheel friction + acceleration | f = 0.196 N, a = 1.98 m/s² | f = 0.002·98 = 0.196 N exact; a = (20−0.196)/10 = 1.9804 | **CONFIRMED** |
| 16 | S4 wheel finish time | 3.33 s | t = √(2·11/1.9804) = 3.333 s | **CONFIRMED** |
| 17 | Arrow floor scar, "~15 N min-length clamp" | "~15 N" (approximate figure quoted from the block_on_incline lesson) | Read directly from the committed renderer: `NLB_ARROW_MIN_LEN = 0.55`, `NLB_ARROW_SCALE = 0.048` (world units/N) → floor = 0.55/0.048 = **11.46 N** | **CORRECTED** — the real floor is ≈11.5 N, not ~15 N. Changes no go/no-go decision here: every wheel force (0.098–0.196 N) is still ~2 orders of magnitude below either figure, and every DRAWN block arrow (19.6, 20, 39.2→shown as 20.0 static, 49, 98 N) is comfortably above either figure |
| 18 | `NLB_ARROW_EPS` (the separate "real zero, hide the arrow" threshold) | not quoted numerically by the skeleton | Read from renderer: `NLB_ARROW_EPS = 0.05` N | **NEW FINDING** — the wheel's friction forces (0.098–0.196 N) are all above 0.05 N, so the engine will NOT auto-hide them if authored into an `arrows.show` list; it draws them at the MIN_LEN floor instead, visually asserting an ~11.5 N force where the real value is ~0.1–0.2 N. This makes the skeleton's per-state exclusion of wheel friction/tiny-applied from `arrows.show` a physical-honesty requirement, not a style choice — confirmed correct as authored |
| 19 | S4 "98 N weight arrows are double S1's" (skeleton §4 motion-notes prose) | implies a visible 2× arrow length vs S1 | S1 authors NO weight arrows at all (S1's `arrows` column is `A: applied, friction · B: applied` — no `weight` token). Even setting that aside: 49 N → 2.352 world units (under `NLB_ARROW_MAX_LEN` 2.80, unclamped); 98 N → 4.704, which EXCEEDS 2.80 and is CLAMPED to 2.80. Drawn-length ratio if both existed: 2.80/2.352 = **1.19×, not 2×** | **CORRECTED** — genuine finding: (a) no S1 weight arrow exists to compare against, and (b) even a hypothetical comparison clamp-flattens to ~1.2×, not 2×. Recommend treating the HUD numbers (39.2 N, 20 N push, f readouts 20.00 vs 0.20) as the load's real legibility carrier in S4, not arrow length |

**DoD physics-layer spot-checks (role spec's v2.3 alignment, items 2–4):**
- **`aha_moment` (PRIMARY, S1):** skeleton's Block-2 prose is not itself the ≤15-word `aha_moment.statement`
  field. Proposed statement: *"Rolling friction is about 200 times smaller than sliding friction — same
  push, opposite outcome."* (14 words) — physically TRUE (row 5, exact 200×). Proposed
  `visual_confirmation`: *"Both bodies push with 20 N; the wheel crosses the 11 m track in 2.35 s while
  the block has moved only 0.76 m by 12 s — the friction readouts show why: 19.6 N vs 0.10 N."*
- **SUPPORTING aha (S4):** proposed statement *"Doubling the load stops sliding completely (39.2 N >
  push) while rolling barely notices it."* (14 words) — TRUE (rows 14–15).
- **`misconception_watch` (S3, the one genuine pivot):** `visual_counter` ("the f readout is 0.10 N
  while the wheel coasts, and the v readout falls the whole time — zero friction would keep v constant
  forever") is physically correct (Newton I: zero net force ⇒ constant v; here f ≠ 0 ⇒ v falls).
  `one_line_fix` ("rolling friction is small, not zero — f = μᵣN with μᵣ about 0.002, and it grows on
  soft or deformed surfaces") is correct and matches §1's formulas. **CONFIRMED**, no change needed.
- **Assessment items (i)–(iv), skeleton §10(f):** all four re-checked against rows 1–16 above.
  **CONFIRMED**, no numeric corrections needed.

---

## 1. `physics_engine_config`

Two bodies, two distinct contact types, deliberately opposite of `friction_force`'s single-body μₛ≠μₖ
arc: here **μₛ = μₖ per body** (declared per §1 of the skeleton) and the two bodies' μ VALUES are the
taught contrast. The block's μ is never a live control anywhere in this concept (identity constant,
owned by the sibling). The wheel's `mu_k` field is the ONE live μ control, exposed only in S3.

```json
{
  "variables": {
    "m":            { "name": "mass of body A (the block)", "unit": "kg", "min": 1, "max": 10, "step": 0.5, "default": 5 },
    "m2":           { "name": "mass of body B (the wheel)", "unit": "kg", "min": 1, "max": 10, "step": 0.5, "default": 5 },
    "F":            { "name": "applied push (both bodies' authored value in every guided state; single shared engine slider - see OPEN ITEM note below)", "unit": "N", "min": 0, "max": 50, "step": 0.5, "default": 20 },
    "mu_s_block":   { "name": "block's coefficient of static friction (sliding contact)", "unit": "", "constant": 0.40 },
    "mu_k_block":   { "name": "block's coefficient of kinetic friction (sliding contact)", "unit": "", "constant": 0.40 },
    "mu_s_wheel":   { "name": "wheel's coefficient of static friction (rolling contact) - never a live slider in this concept; the stuck-check it feeds is physically inert here (see S3 note in section 2)", "unit": "", "constant": 0.002 },
    "mu_k_wheel":   { "name": "wheel's coefficient of kinetic/rolling friction (rolling contact) - the ONE live mu control, engine key mu_k, exposed only in S3", "unit": "", "min": 0, "max": 0.5, "step": 0.002, "default": 0.002 },
    "v0":           { "name": "initial velocity (wheel, S3/S5 only)", "unit": "m/s", "min": -5, "max": 5, "step": 0.5, "default": 0 },
    "g":            { "name": "gravitational acceleration", "unit": "m/s^2", "constant": 9.8 },
    "theta":        { "name": "incline angle - fixed at 0 throughout (flat concept; block_on_incline owns the incline arc)", "unit": "deg", "constant": 0 },
    "N_block":      { "name": "normal force on the block", "unit": "N", "derived": "m * g * cos(radians(theta))" },
    "N_wheel":      { "name": "normal force on the wheel", "unit": "N", "derived": "m2 * g * cos(radians(theta))" }
  },
  "computed_outputs": {
    "f_block": { "formula": "friction on the block, N - magnitude equals |drive| while stuck (never exceeds mu_s_block*N_block); mu_k_block*N_block once sliding" },
    "f_wheel": { "formula": "friction on the wheel, N - magnitude equals |drive| while stuck (never exceeds mu_s_wheel*N_wheel); mu_k_wheel*N_wheel once rolling/sliding" },
    "a_block": { "formula": "0 while stuck; (F - mu_k_block*N_block)/m once moving" },
    "a_wheel": { "formula": "0 while stuck; (F - mu_k_wheel*N_wheel)/m2 once moving" },
    "v_block": { "formula": "velocity, m/s" },
    "v_wheel": { "formula": "velocity, m/s" },
    "friction_ratio": { "formula": "f_block / f_wheel at equal N - 0.40/0.002 = 200 (the S1/S2 taught number)" }
  },
  "formulas": {
    "N_block": "m * g * cos(radians(theta))",
    "N_wheel": "m2 * g * cos(radians(theta))",
    "drive_block": "F - m * g * sin(radians(theta))",
    "drive_wheel": "F - m2 * g * sin(radians(theta))",
    "max_static_block": "mu_s_block * N_block",
    "max_static_wheel": "mu_s_wheel * N_wheel",
    "break_away_block": "mu_s_block * m * g",
    "break_away_wheel": "mu_s_wheel * m2 * g",
    "f_block_sliding": "mu_k_block * N_block",
    "f_wheel_rolling": "mu_k_wheel * N_wheel",
    "a_block_moving": "(F - mu_k_block * N_block) / m",
    "a_wheel_moving": "(F - mu_k_wheel * N_wheel) / m2"
  },
  "constraints": [
    "f = mu * N in BOTH regimes - the only difference between the block and the wheel is which mu applies (0.40 sliding vs ~0.002 rolling), never a separate rolling-resistance law",
    "rolling resistance is small but never zero: f_wheel = mu_k_wheel * N_wheel > 0 for any N_wheel > 0 - a coasting wheel under rolling friction alone is always decelerating, never coasting forever",
    "both frictions scale with load: N_block = m*g and N_wheel = m2*g, so doubling either mass doubles that body's maximum friction - but only the SLIDING side's growth can cross a fixed push and flip motion to no-motion (S4)",
    "a body at rest with |drive| <= mu_s*N stays at rest, and its REPORTED friction equals the drive exactly, not mu_s*N (the self-adjusting static mechanism itself is owned by friction_force; here it is cited once, in S4, without re-deriving it)",
    "no rotational dynamics anywhere: no torque, no moment of inertia, no angular acceleration is computed or asserted - the wheel's rendered spin is a position-derived kinematic fact (s = r*theta, SEAM G), never a dynamics claim",
    "theta = 0 throughout: N = m*g exactly for every body in every state, never resolved into components - the incline decomposition belongs to block_on_incline"
  ]
}
```

**F write-semantics note (carried from the skeleton's ORCHESTRATOR RESOLUTION, restated here because it
governs how `F` behaves as a *variable* wherever it is live — S1 and S5):** `nlbApplyParam('F')` writes
`nlbSliderBodies()[0]` = the first non-ghost body in AUTHORED array order = body **A, the block**, in
every state that authors bodies `[A, B]`. So wherever `F` is a live control, dragging it changes **only
the block's push**; the wheel keeps its own authored `applied_force_N`. This is true in **both** S1 and
S5 — see §3 control specs below for what that means in each.

**mu_k_wheel label note:** the engine's generic slider row for `mu_k` is elsewhere labeled "μₖ"
(kinetic). In S3 that same row targets the **wheel's rolling** coefficient, and S2 has just taught the
student μₖ = 0.40 for the **block's sliding** contact one state earlier. Labeling S3's row "μₖ" risks
exactly the symbol collision Rule 41c warns against (reads as jargon, not plain physics). **Recommend
json_author label this row "μᵣ" for this concept** (the concept's own vocabulary throughout, including
the formula overlays), even though the underlying engine field/PARAM_UPDATE key is literally `mu_k`.

---

## 2. Per-state `variable_overrides`

Following the `hinge_force.json` STATE_4 (`F_ext: 0`) / `field_forces.json` STATE_5 (`m: 1`) defensive
pattern named in the role spec — every state whose narrative needs a value different from the
`default_variables` (m=5, m2=5, F=20, mu_k_wheel=0.002, v0=0) is documented below, even where the
override is "none needed," so json_author never has to guess.

- **S1 — none needed.** Both bodies at exactly the global defaults (m=5, m2=5, F=20 both bodies, v0=0).
- **S2 — REQUIRED, and this is exactly bug-class #1 territory (`default_variables_only_first_var_merged`):**
  `{ body_A.F: 19.6, body_B.F: 0.098, body_A.v0: 1.0, body_B.v0: 1.0 }`. If `F` silently fell back to the
  global default (20) instead of these exact balance values, both bodies would ACCELERATE instead of
  glide — the entire "same law, both bodies balanced" premise of the state breaks silently and passes
  every gate that doesn't re-derive the arithmetic. Flag this override with maximum emphasis to
  json_author.
- **S3 — REQUIRED, the literal `hinge_force` `F_ext: 0` pattern:** `{ body_A.ghost: true (parked, never
  integrated), body_B.F: 0, body_B.v0: 1.5, body_B.mu_s_wheel: 0.002 (held constant, never ramped),
  body_B.mu_k_wheel: 0.002 (the param_ramp's own `from` value, per the engine's documented contract) }`.
  Note: `mu_s_wheel` staying fixed at 0.002 while `mu_k_wheel` ramps to 0.12 is SAFE — the stuck-check
  `|drive| <= mu_s*N` uses `drive = F - ... = 0` throughout this state (F is never non-zero here), so
  `|0| <= mu_s*N` is trivially true for ANY non-negative `mu_s`. The wheel's eventual "stopped and
  holds" behavior does not depend on `mu_s_wheel`'s value at all in this state — confirmed, no gap.
- **S4 — REQUIRED, the literal `field_forces` `m: 1` pattern (here doubled, not held):**
  `{ body_A.m: 10, body_B.m2: 10 }`, both explicitly authored, not left to the slider default (5). This
  is the state whose entire teaching point is the mass change — an unauthored default leak here is the
  single worst possible place for bug-class #1 to recur.
- **S5 — REQUIRED for `F` only:** `{ body_A.F: 15, body_B.F: 15 }` (the sandbox's own starting value,
  matching `idle_auto_sweep.range[0] = 15` per the engine's own authoring contract — "author the state's
  own value equal to `from`/`range[0]`, never let the sweep's first frame step"). `m`, `m2`, `v0` sit at
  their global defaults (5, 5, 0) — no override needed for those three.

---

## 3. Within-state motion timeline + per-state control spec + narration

**Pacing note before the table:** the architect's §3 "Duration" column (12 s / 12 s / 12 s / 11 s /
open) reads as a MOTION-BUDGET target, not a hard narration cutoff — every guided state here is
`manual_click` (never `auto_after_tts`), so nothing forces the state to end at that mark; it is simply
how long the authored motion needs to reach a legible frame (matches the shipped `friction_force.json`
precedent, whose STATE_3 duration of 14 s comfortably outpaces the ~10-12 s a naive word-count-to-speech
estimate would predict for its ~54-word script). The binding gate below is strictly the **25-55 EN word**
count on `text_en`, verified per state with an exact word count.

### STATE 1 — "Same Push: Rolling Moves Much Farther"

**Motion timeline (Rule 32a: cause visible before the effect accumulates):**

| t-window | what animates | driven by |
|---|---|---|
| 0.0 s | Both bodies at rest at -5; both 20 N applied-force arrows fully rendered (equal length, 0.96 world units each - confirmed identical, row 19 in section 0); `glow_focal = nlb_body_B` (wheel) | static home pose |
| 0.0-0.6 s | Both bodies barely move (wheel delta-s is approx 0.5 m at 0.6 s of a 12 m track, still visually near-zero on first glance; block delta-s approx 0.01 m) - the "same push" fact reads BEFORE any divergence is visible | a_block(t), a_wheel(t), pure functions of the state clock |
| 0.6-2.35 s | Wheel visibly accelerates away (a = 3.98 m/s^2); v/f HUD rows climb live; block still nearly stationary | a_wheel(t) |
| 2.35 s | Wheel reaches the +6 bound at v approx 9.36 m/s and halts; readouts freeze | motion-bound |
| 6.0 s | `glow_focal` hands off `nlb_body_B` -> `nlb_arrow_A_friction` (kept at the skeleton's authored 6000 ms - see phase-tuning note below) | authored phase |
| 6.0-12.0 s | Block continues its slow crawl (a = 0.08 m/s^2), ending at +0.76 m, v = 0.96 m/s - a legible "still going" contrast frame beside the parked wheel | a_block(t) |

**Phase-tuning (assigned to physics_author per the skeleton's handoff line):** at approx 2.5 words/sec,
my 3-sentence, 46-word narration below lands roughly: sentence 1 (8 w) approx 0-3 s, sentence 2 (14 w)
approx 3-9 s, sentence 3 (24 w, the numeric explanation) begins approx 9 s. Keeping the glow handoff at
the skeleton's authored **6000 ms** gives it a approx 3 s lead before sentence 3 names the block's
friction arrow - the visual cue arrives before the narration calls it out, which is the correct order
(Rule 32a). **No change recommended**; re-verify against the REAL TTS clip duration once Rule 30g
narration audio exists (word-count-to-seconds here is only an estimate).

**Control spec:** `controls_visible: ['F']`. Per the F write-semantics note in §1, dragging F in S1 moves
**the block's push only** (first non-ghost body in authored order) — the wheel's push stays at its
authored 20 N. This is analogous to the accepted "m drag breaks the exact match, remains true physics"
precedent the skeleton already uses for S2/S4's `m` control: if a teacher drags F down toward or below
19.6 N, the block would be stuck from t=0 (a live, correct demonstration of the very break-away threshold
S1's own arithmetic uses) while the wheel is unaffected — a physically valid, arguably USEFUL extension
of the state, not a defect. Lower stakes than the S5 open item because S1 is a single-click guided beat a
teacher is unlikely to touch mid-explanation; flagged here for completeness, not blocking.

**Narration (`text_en`, 3 sentences, 46 words — within 25-55, near architect's suggested 35-45):**
1. "Same mass, same 20 newton push, different results." (8 w)
2. "The wheel crosses the whole track in about two seconds; the block barely moves." (14 w)
3. "Sliding friction takes 19.6 of the 20 newtons; the wheel's rolling friction takes only about 0.10 newton, too small to draw as an arrow." (24 w)

---

### STATE 2 — "Same Law, Much Smaller Coefficient"

**Motion timeline:**

| t-window | what animates | driven by |
|---|---|---|
| 0.0 s | Home pose; both bodies already at v = 1.0 m/s (state begins mid-glide, matching the archetype's "reveal-build" framing — the formula surface and HUD rows build in from here, not the motion) | authored initial state |
| 0.0-11.0 s | Both bodies glide at constant 1.0 m/s (a = 0 exactly for both, by the balanced-force overrides in §2); formula surface `f = μN` and the two μ values reveal progressively; HUD `f`/`F_applied` rows tick in step with the glide | reveal-build sequencing (no `phases[]` needed — S2 carries no time-varying physics, only a progressive on-canvas reveal) |
| 11.0 s | Both bodies reach the +6 bound simultaneously (11 m at 1.0 m/s) and halt together — a legible "matched" freeze frame | motion-bound |
| 11.0-12.0 s | Hold | reveal_hold |

**Control spec:** `controls_visible: ['m']` — targets the **block's** mass row only (`m`, not `m2`; the
wheel's mass row is not shown this state). Dragging it scales the block's `N_block` and therefore its
`f_block` live — this breaks the "both glide identically" premise (F stays fixed at 19.6 N while the
required balance value shifts with m), which the skeleton's own motion-notes column already accepts as
"true physics… acceptable." No further note needed.

**Narration (`text_en`, 3 sentences, 54 words):**
1. "One law covers both: friction f equals the friction coefficient mu times normal force N — 0.40 for the block, 0.002 for the wheel." (23 w)
2. "Same law, far smaller number: both now glide at the same 1.0 meter per second." (15 w)
3. "The wheel's push and friction are too small to draw — read the number instead: 0.10 newton." (16 w)

**This is the canonical "too small to draw" sentence** (task requirement): *"The wheel's push and
friction are too small to draw — read the number instead: 0.10 newton."* Placed here because S2 is the
one state where BOTH of the wheel's force arrows (applied 0.098 N and friction 0.098 N) are entirely
absent from the scene — the state where the honesty statement matters most. S1/S3/S4 each carry a
lighter one-clause echo of the same fact rather than repeating the full sentence verbatim.

---

### STATE 3 — "Rolling Friction Is Not Zero"

**Motion timeline (Rule 32a: the slider/ramp value and its f-readout consequence rise before the wheel's
visible deceleration reads as a deliberate slow-down rather than noise):**

| t-window | what animates | driven by |
|---|---|---|
| 0.0 s | Block `ghost: true`, parked at -5 (home-pose continuity, never integrated). Wheel v0 = 1.5 m/s from -5, F = 0, mu_r = 0.002. Weight/normal arrows (49 N each, well above the arrow floor) visible; friction sub-floor → HUD only | authored state entry |
| 0.0-3.0 s | Wheel coasts, decelerating gently (a = -0.0196 m/s^2, confirmed row 10) — f readout pinned at approx 0.10 N the whole time, v readout falling from 1.50 to 1.44 — **this is the confrontation**: friction is visibly nonzero while nothing else is happening | closed-form coast, a pure function of the state clock |
| 3.0 s | `param_ramp{param:'mu_k', from:0.002, to:0.12, start_ms:3000, end_ms:9000}` begins; mu_r readout starts climbing (cause) a beat before the deceleration visibly steepens (effect) | one-shot monotonic ramp |
| 3.0-6.75 s | Wheel visibly slows faster as mu_r climbs; f readout rises with it | a(tau) = -0.0196 - 0.193*tau (confirmed rows 11-13; numeric sim: stop at t approx 6.75 s, s approx +2.98) |
| approx 6.75-9.0 s | Wheel at rest at +2.98; drive = 0 <= mu_s*N trivially, so it holds (reveal_hold) even though the ramp is still technically running toward 0.12 in the background | stuck branch |
| 9.0-12.0 s | mu_r ramp completes at 0.12 (no visible effect — wheel already stopped); teacher may seize the `mu_k` slider at any point, canceling the ramp for the rest of the state | trusted input override |

**Control spec:** `controls_visible: ['mu_k']` (recommend re-labeled "μᵣ" per §1's label note) —
targets the wheel's rolling coefficient. Safe to expose here specifically **because the block is
`ghost: true`** in this state — per the confirmed engine semantics (`mu_s`/`mu_k` writes EVERY
non-ghost, non-hanging body), the ghost is skipped by that write loop too, so the slider can only ever
reach the wheel. This is the ONE state where a shared μ control is safe; S5 (both bodies live) is not
— see the S5 open item below.

**Narration (`text_en`, 3 sentences, 54 words):**
1. "The wheel coasts with no push, yet friction reads about 0.10 newton, not zero, too small to draw — and speed keeps slowly falling." (23 w)
2. "Zero friction would keep speed constant forever; this does not." (10 w)
3. "Raise the friction coefficient mu, as soft or deformed ground would, and the wheel stops completely; ball bearings push mu lower." (21 w)

Ball bearings appear here, spoken only, per the skeleton's explicit "narration mention only" brief —
never asserted as a rendered object (the engine draws no bearing). The S2 drill-down cluster
`rolling_vs_ball_bearings` carries the fuller mechanism explanation for a student who asks.

---

### STATE 4 — "Heavier Load: Sliding Stops, Rolling Continues"

**Motion timeline (Rule 32b: only the taught variable — load — differs from S1's apparatus; same
apparatus, same push, same home pose):**

| t-window | what animates | driven by |
|---|---|---|
| 0.0 s | Both bodies at -5, m = m2 = 10 kg (override, §2), F = 20 N both. Block's weight (98 N, drawn at the MAX-clamped 2.80 world units — row 19 in section 0) and applied+friction arrows visible; block at rest, f readout **20.00 N static** (equals the drive exactly, not the 39.2 N maximum — the "one clause, no re-teach" citation of the sibling's own mechanism) | authored state entry |
| 0.0-3.33 s | Block never moves (drive 20 <= maxStat 39.2 — a genuine null RESULT, not a static state: the wheel is doing all the moving beside it). Wheel accelerates at 1.98 m/s^2; f readout 0.20 N (sub-floor, HUD only) | a_wheel(t) |
| 3.33 s | Wheel reaches the +6 bound (11 m at a = 1.98 m/s^2) and halts | motion-bound |
| 3.33-11.0 s | Hold; block still stuck at -5 the whole time, f still reading 20.00 N | reveal_hold |

**Control spec:** `controls_visible: ['m']` — targets the **block's** mass row only (`m`; the wheel's
`m2` is NOT exposed this state, so it stays fixed at its authored 10 kg regardless of what the teacher
does to `m`). This gives the teacher a live, additional demonstration layered on the load contrast:
dragging `m` below **approx 5.10 kg** (solve mu_s*m*g = 20 => m = 20/(0.4*9.8) = 5.102 kg) live-unsticks
the block while the wheel (fixed at 10 kg) keeps rolling unaffected — an asymmetric-load exploration
that is physically correct and pedagogically additive, not a bug. Flagging it here so
json_author/quality_auditor don't mistake the asymmetry for an authoring error.

**Narration (`text_en`, 2 sentences, 54 words — the required "heavier, not more-significant-friction"
clarification is the second sentence):**
1. "The load doubles to 10 kilograms: the block's maximum static friction is now 39.2 newtons, more than its 20 newton push, so it stays still, while the wheel's rolling friction reaches 0.20 newton, too small to draw." (37 w)
2. "It moves slower than before only because it is heavier now, not because rolling friction grew large." (17 w)

---

### STATE 5 — "Explore: Change Every Value"

**Motion timeline:** free-run sandbox (Rule 37 — the review player never freezes `interaction_complete`).
`idle_auto_sweep{param:'F', range:[15,45]}` drives the block's push back and forth across its own 19.6 N
break-away threshold (crossing both ways) until a trusted slider/drag seizes control; the wheel always
runs (its own break-away, 0.098 N, is never in reach of this sweep). `m`/`m2` drags re-stage S4's load
flip live; `v0` restages S3's coast. No `phases[]` — everything is teacher- or sweep-driven, continuously
re-derived, per Rule 26.

**Narration (`text_en`, 1 sentence, 19 words — explore state is exempt from the 25-55 gate per Rule
31/CLAUDE.md self-review checklist: "explore = 0/open"):**
1. "Now change the mass, the push, and the starting speed yourself, and watch the block and the wheel respond." (19 w)

**Control spec — OPEN ITEM, do NOT resolve here (per the orchestrator's instruction; take the founder's
answer from `docs/loop_runs/lom_e_state.md`):**

`controls_visible: ['m','m2','F','v0']` as authored in the skeleton. The problem: `nlbForceTargetBody()`
writes only the first non-ghost body in authored order (body A, the block), so as authored, dragging `F`
or letting the idle sweep run changes **only the block's push**, silently leaving the wheel's push frozen
at its own authored 15 N while the caption still implies "same push, compare the bodies." Two ways to
author S5, written out in full so json_author can drop in whichever the founder picks:

- **(a) Drop `F` from S5's controls.** `controls_visible: ['m','m2','v0']`. The sandbox loses the
  live break-away exploration (no more crossing 19.6 N interactively) but keeps a fully honest "same
  push" premise throughout — F stays at its authored 15 N on both bodies for the whole state, and the
  `idle_auto_sweep` on `F` must ALSO be removed (there is nothing left to sweep if F is not a control),
  which in turn means S5 needs a different idle motion or none — **flag this consequence to json_author
  explicitly if (a) is chosen**: dropping F breaks the free-run motion Rule 37 expects unless another
  param (e.g. `v0` or an `m` sweep) replaces it, or the state simply free-runs at constant F=15 with only
  slider drags providing motion (still valid — Rule 37 only requires the clock not freeze, not that
  something be actively animating every second).
- **(b) A small opt-in engine flag making the `F` slider/sweep write EVERY non-ghost surface body**
  (peter_parker:renderer_primitives scope — this is new engine work, not a physics_author or json_author
  change). Keeps `controls_visible: ['m','m2','F','v0']` exactly as authored and preserves the
  break-away sweep on both bodies simultaneously — the more faithful sandbox, at the cost of a genuine
  (if small) engine change requiring its own bring-up verification.

Everything else about S5 (the `m`/`m2`/`v0` controls, the sweep bounds `[15,45]`, `trusted_drag_seizes`)
is unaffected by which option is chosen and needs no rewrite either way.

---

## 4. Board-mode mark scheme — DEFERRED (Rule 20)

Conceptual-only directive active (founder 2026-06-11). **Skipped entirely** — no `mode_overrides`
authored, no mark-scheme/derivation-sequence content drafted for this concept, matching the skeleton's
own Rule 20 declaration.

---

## 5. Drill-down cluster phrasings

Five real-student-voice phrases per cluster, matching the register of the shipped `normal_reaction.json`
seed (plain, colloquial, not textbook prose).

**S2 — `rolling_resistance_origin_deformation`:**
1. "why is rolling friction smaller than sliding friction"
2. "what causes rolling friction if nothing is sliding"
3. "does the wheel squash the ground a tiny bit"
4. "why does a heavier wheel still roll easily"
5. "how can there be friction with no sliding at all"

**S2 — `mu_r_typical_values_tyres_rails`:**
1. "what is a typical rolling friction value for tyres"
2. "is rolling friction different for train wheels on rails"
3. "why is mu for rolling so much smaller than mu for sliding"
4. "does tyre pressure change the rolling friction number"
5. "what is the rolling friction coefficient for a car"

**S2 — `rolling_vs_ball_bearings`:**
1. "why do ball bearings have almost no friction"
2. "are ball bearings rolling friction or something else"
3. "why do machines use ball bearings instead of plain wheels"
4. "is ball bearing friction the same law as wheel friction"
5. "how small can rolling friction actually get"

**S3 — `rolling_friction_not_zero`:**
1. "does a rolling wheel have any friction at all"
2. "why does a ball eventually stop rolling on a flat floor"
3. "if there is no push why does the wheel slow down"
4. "isnt rolling supposed to be frictionless"
5. "why do people say wheels have no friction"

**S3 — `why_rolling_objects_stop`:**
1. "why does a rolling ball stop on its own"
2. "what force slows down a coasting wheel"
3. "why doesnt the wheel keep rolling forever"
4. "does air resistance stop the wheel or is it friction"
5. "why does a coin stop spinning and rolling eventually"

**S3 — `mu_r_depends_on_surface_and_pressure`:**
1. "why does rolling friction change on soft ground"
2. "why is it harder to push a cart on grass than on tile"
3. "does low tyre pressure make a bike harder to pedal"
4. "why do mountain bike tyres feel heavier to roll"
5. "does the surface type change how much rolling friction there is"

---

## 6. Constraint callouts

- **f = μN in both regimes** — the block (sliding, μ=0.40) and the wheel (rolling, μ≈0.002) obey the
  SAME law; only which μ applies differs. Never author a separate "rolling resistance formula."
- **Rolling resistance is small but never zero** — `f_wheel = mu_k_wheel * N_wheel > 0` for any
  `N_wheel > 0`. A coasting wheel under rolling friction alone is ALWAYS decelerating (S3's whole point).
- **Both frictions scale with load** — `N = m*g` for both bodies, so doubling mass doubles BOTH bodies'
  maximum friction (S4). Only the sliding side's growth can cross a FIXED push and flip motion to
  no-motion; the rolling side's growth (0.098→0.196 N) never gets close to mattering at these pushes.
- **A stuck body's reported friction equals the drive, not μₛN** — S4's block reads f = 20.00 N (the
  push it is opposing), never 39.2 N (its maximum). This is a one-clause citation of `friction_force`'s
  mechanism, never re-derived here.
- **No rotational dynamics anywhere** — no torque, no moment of inertia, no angular acceleration
  computed or asserted. The wheel's visible spin is a position-derived kinematic fact (SEAM G), never a
  dynamics claim.
- **θ = 0 throughout** — N = mg exactly for every body in every state; never resolved into components.
  No `theta` control anywhere in this concept, including the sandbox.
- **Arrow-length is a magnitude cue, not a decoration** — any force authored into a body's `arrows.show`
  list at S1's/S4's scale must clear the floor `NLB_ARROW_MIN_LEN`/`NLB_ARROW_SCALE` ≈ 11.5 N (section 0
  row 17) to avoid a false-magnitude clamp; the wheel's forces never do, and are correctly kept out of
  every `arrows.show` list in this concept (section 0 row 18).

---

## Engine bug queue consultation

DB query not runnable from this thread (Read/Grep/Glob/Bash only, no DB access) — consulted the
committed scar surface instead, per the architect's own fallback: `docs/loop_runs/lom/_engine/scar_candidates.sql`
(all rows OPEN/candidate, founder-review-pending, none yet applied). Every scar already folded into the
skeleton's own arithmetic and reused verbatim above: motion-bound scar (every burst checked against
`length_m`, section 0 rows 6-16), lane-offset fix `ff408ed` (two independent bodies get their own
z-lane — SEAM G bodies A/B), arrow-floor scar (section 0 rows 17-19, re-verified against the ACTUAL
renderer constants rather than the skeleton's approximate figure), `param_ramp` contract (S3's own
`mu_k` = ramp `from`, section 2), HUD-bleed scar (four or fewer readout rows per state throughout
section 3), slider-row position scar (shared `m` row keeps position across S2/S4/S5 per the engine's
build-once-show/hide convention). No new physics-content-level (`alex:physics_author`/
`alex:json_author`-owned) bug class found beyond what the skeleton already defended against.
**FLAG to quality_auditor:** confirm no new FIXED rows landed for those two clusters since this
consultation.

---

## Self-review checklist

- [x] Every symbol in the skeleton's state narratives (F, m, m2, f, v, a, N, μ) appears in `variables`
      or `computed_outputs`.
- [x] Every `formulas` entry wraps `theta` in `radians()` even though it is a fixed 0 constant, for
      schema consistency with `friction_force.json`'s own convention.
- [x] Every state's live controls declared per the architect's Rule 31 table (section 3), each with
      range/step/default from section 1; S1's and S5's single-body F-write nuance flagged explicitly.
- [x] `variable_overrides` documented for every state (section 2), including the two states that need
      none.
- [x] Board mode: skipped entirely (Rule 20 [D]).
- [x] Drill-down cluster phrasings: 5 per cluster times 6 clusters = 30, real-student-voice register
      verified against the `normal_reaction.json` good/bad examples.
- [x] `constraints` block: 6 short factual assertions (section 6).
- [x] Numerical sanity check: run independently for all 16 numeric claims plus 1 numeric simulation
      cross-check (section 0) — all CONFIRMED, two minor CORRECTIONS (arrow-floor figure, S4
      weight-arrow "double S1's" claim), neither blocking.
- [x] Within-state motion timeline written for all 5 states (section 3), every row a pure function of
      the state clock, Rule 26; no two states share a motion (side-by-side-race S1/S4 is the ONE
      declared contrast pair, per architect); no static state (S4's block-at-rest is a null RESULT
      beside a moving wheel, not a static scene).
- [x] Rule 32 sequencing verified per state: S1/S4 cause (push arrows) visible before divergence reads;
      S3's ramp value/readout rises before the visible slow-down steepens; only the taught variable
      (load in S4, μᵣ in S3) changes apparatus behavior, all else holds pose.
- [x] Word budget (Rule 31a): S1=46, S2=54, S3=54, S4=54 — all within 25-55; S5=19, explore-exempt.
- [x] Notation ladder (Rule 38c/38d): N/A — this concept authors no `depth_ring` calculus/vector
      content per the skeleton (advanced ring empty by design); every formula surface (`f = μN`,
      `fᵣ = μᵣN`) is algebra-only throughout, core/extended rings alike. Dialect: no board-divergent
      terms in this concept's vocabulary (friction/normal/mass/push are universal).
- [x] Engine bug queue consulted against the committed scar surface (DB unreachable from this thread);
      documented above.
- [x] DC Pandey check: consulted §8.7 table-of-contents scope only, per the architect's own note — no
      formula, explanation, or example problem in this physics block was imported from any external
      book; every number was independently re-derived in section 0 from Newton's second law plus the
      engine's own Branch A formulas, never copied from a textbook.

---

## Handoff to json_author

Highest-priority items: (1) S2's `variable_overrides` (F=19.6/0.098 per body) — bug-class #1 territory,
(2) the S5 OPEN ITEM — take the resolution from `docs/loop_runs/lom_e_state.md`, do not guess, (3) the
`mu_k` to "μᵣ" relabel recommendation for S3's slider row, (4) confirm S1's glow-handoff stays at
6000 ms (no change from the skeleton) once real TTS clip durations exist.
