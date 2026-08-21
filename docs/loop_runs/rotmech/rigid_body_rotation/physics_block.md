# PHYSICS BLOCK — `rigid_body_rotation` (rotmech · Class 11 Ch.7 · concept #3) — wave-2 design

> Produced by `alex:physics_author` 2026-08-04, against **skeleton REV 3**
> (`skeleton_rev3.md`) after founder-proxy Checkpoint A returned **`DESIGN_OK`**
> (`founder_proxy_A_cycle2_final.md`). **This concept is BLOCKED on the 0c-3 engine
> build — zero of its six states is buildable today.** This block is PURE DOCS: no
> concept JSON exists or is produced here; the build resumes at `json-author` only
> after 0c-3 merges and the skeleton's §5.1 re-verification list is re-run.
>
> **Tiering discipline (binding on every line below):** `[LIVE]` = checked against
> `field_3d_renderer.ts` on THIS branch today, cited by line; `[NEEDS-0c-3 Cn]` =
> depends on a named 0c-3 engine row that does not exist yet. Every `[LIVE]` claim
> in this document was grepped and read against the renderer before being written
> — not copied from a comment. (`theta0_rad` was the cautionary case: labelled
> "declared, not implemented" at `:953` and in `APPARATUS_CONTRACT.md` line 70,
> and is in fact fully wired — `rbr.theta0_rad` -> `eng.theta0` at `:50499` ->
> `rbrThetaReset()` seeds `eng._th = eng.theta0` at `:49969-49971`, consumed by
> every `rbrThetaAt()` call. This concept does not need `theta0_rad` — S1-S5 all
> enter with theta0 = 0 — but the field is genuinely live if a future revision wants
> it, and the "declared/inert" label in both the renderer comment and the
> apparatus contract is WRONG for this one field. Flagged in my final report, not
> silently corrected in someone else's file.)

---

## §1 — Variables, formulas, constraints

### `physics_engine_config.variables`

```json
{
  "variables": {
    "i_frame": { "name": "Fixed inertia of the turntable + rod, excluding the two sliding masses", "unit": "kg*m^2", "constant": 0.50 },
    "rod_half_length": { "name": "Rod half-length - apparatus geometry only", "unit": "m", "constant": 1.00 },
    "drum_radius": { "name": "Turntable/drum radius - the drum FACE is S4's picture; no brake is authored by this concept", "unit": "m", "constant": 0.55 },
    "rod_height_above_pad": { "name": "Vertical clearance of the rod plane above the drum's pad plane", "unit": "m", "constant": 0.25 },
    "r_min": { "name": "Apparatus hard floor for the sliding-mass radius (not driven by this concept)", "unit": "m", "constant": 0.15 },
    "r_max": { "name": "Apparatus hard ceiling for the sliding-mass radius (not driven by this concept)", "unit": "m", "constant": 0.90 },
    "m": { "name": "Mass of each of the two sliding masses on the rod - fixed at the home pose for THIS concept; sliding it is concept #10's aha, never a control here", "unit": "kg", "constant": 2.0 },
    "r_mass": { "name": "Radius of each sliding mass from the axle - fixed at the home pose for the whole concept (S1-S5); never a live control (r, m, tau_brake are the skeleton's explicit S6 refusals)", "unit": "m", "constant": 0.80 },
    "omega": { "name": "Angular speed shared by every point of the body - the concept's one printed HUD row. Constant 1.50 rad/s through S1-S5 (no torque source is authored - R1 boundary excludes L/KE/torque entirely); live in S6 only, via the NEW non-restarting control C10", "unit": "rad/s", "constant": 1.50 },
    "r1": { "name": "Radius of marked point P1 from the axle - the inner marker used for the S3 arc/radius ratio", "unit": "m", "constant": 0.30 },
    "r2": { "name": "Radius of marked point P2 from the axle - the outer marker, exactly 2x r1", "unit": "m", "constant": 0.60 },
    "compare_from_s": { "name": "S3 compare_window.from_ms, in seconds - the instant the body is AT the fixed start ray (F3b authoring constraint)", "unit": "s", "constant": 1.0 },
    "compare_delta_t": { "name": "S3 compare_window duration (to_ms - from_ms)", "unit": "s", "constant": 1.80 },
    "start_line_angle": { "name": "Fixed start-ray angle - MUST equal theta(compare_from_s) per F3b; an authoring-time derived constant, not a live variable", "unit": "deg", "derived": "start_line_angle = omega * compare_from_s * (180/PI)" },
    "s1": { "name": "Arc length swept by P1 over the S3 compare window", "unit": "m", "derived": "s1 = r1 * (omega * compare_delta_t)" },
    "s2": { "name": "Arc length swept by P2 over the S3 compare window", "unit": "m", "derived": "s2 = r2 * (omega * compare_delta_t)" },
    "crossing_time": { "name": "S3 simultaneous-crossing instant, from state start", "unit": "s", "derived": "crossing_time = compare_from_s + 2*PI/omega" },
    "gauge_axle_p1": { "name": "S1/S3 axle-to-P1 distance = r1 by construction", "unit": "m", "derived": "gauge_axle_p1 = r1" },
    "gauge_axle_p2": { "name": "S3 axle-to-P2 distance = r2 by construction", "unit": "m", "derived": "gauge_axle_p2 = r2" },
    "gauge_p2_farmass": { "name": "S1 P2-to-far-mass distance, crossing the axle to the mass on the OPPOSITE arm", "unit": "m", "derived": "gauge_p2_farmass = r2 + r_mass" },
    "gauge_p1_farmass": { "name": "S5 P1-to-far-mass distance, held constant through the glide", "unit": "m", "derived": "gauge_p1_farmass = r1 + r_mass" },
    "v_glide": { "name": "S5 constant translation speed of the rod's centre - rides the DEFER-RECOMMENDED C7 row", "unit": "m/s", "constant": 0.40 },
    "glide_duration": { "name": "S5 authored glide-run duration", "unit": "s", "constant": 3.5 },
    "glide_distance": { "name": "S5 total translation over the glide run", "unit": "m", "derived": "glide_distance = v_glide * glide_duration" },
    "r_point": { "name": "S6 explore ONLY - draggable massless marker radius, the concept's live generalization of r1/r2. Range capped at 0.65 (not 0.90, the apparatus ceiling) for mass clearance - see section 6", "unit": "m", "min": 0.00, "max": 0.65, "default": 0.30, "step": 0.01 },
    "omega0_s6": { "name": "S6 explore ONLY - live omega control via the NEW non-restarting closed-form path (C10); reuses the apparatus contract's own omega0 slider range", "unit": "rad/s", "min": 0.5, "max": 3.0, "default": 1.50, "step": 0.1 }
  }
}
```

**`g` is absent — never emit it.** Same reasoning as `conservation_of_angular_momentum`: the axle is vertical, the rotation plane is horizontal, gravity is parallel to the rotation axis at every point on the body, so it contributes zero torque and appears in no formula this concept teaches.

**No `L`, no `KE`, no `F_pull`, no `tau_brake`, no `v` of any kind.** This is the R1 founder-ruling boundary, restated as a variable-table fact: this concept's ENTIRE printed-value payload is `omega` (one HUD row) plus the paired numbers `r1/r2/s1/s2` and the four distance gauges. `L`, `KE`, `dLdt`, `F_pull` are declared readout tokens the renderer supports (`RBR_RO_META`, `:50147-50154`) but this concept's `readouts[]` array never names any of them.

### Category summary (tier-tagged)

| Variable | Category | Tier | Where |
|---|---|---|---|
| `i_frame`, `rod_half_length`, `drum_radius`, `rod_height_above_pad`, `r_min`, `r_max` | Apparatus constant | **[LIVE]** — `applyRigidBodyRotationState` reads every field via `rbrNum(ap.*, DEFAULT)` at `:50488-50493` | Every state, authored explicitly (never omitted — the `default_variables_only_first_var_merged` prevention rule) |
| `m`, `r_mass` (`masses.mass_kg`, `masses.r_m`) | Fixed apparatus constant, never a control in THIS concept | **[LIVE]** field, authoring discipline enforced by physics_author — `:50494-50496`; the underlying `r`/`m` SLIDER rows exist (`RBR_SLIDER_SPEC`, `:49997-50002`) but this concept never authors `controls_visible` for them | S1-S6, always `r_m: 0.80`, `mass_kg: 2.0` |
| `omega` (via `omega0_rad_s`, `spin_sign`) | Constant S1-S5; live S6 only | apparatus fields **[LIVE]** (`:50497-50498`); the CLOSED-FORM `omega = L/I` itself **[LIVE]** (`rbrOmegaAt`, `:49945-49948`) — but with no torque authored, this is a degenerate case where `omega` never actually changes S1-S5 | S1-S5 constant 1.50; S6 live via **[NEEDS-0c-3 C10]** |
| `r1`, `r2` (P1/P2 marker radii) | New massless annotation | **[NEEDS-0c-3 C1]** — `point_markers[]` does not exist in the frozen contract (`:977-1059` has no such field) | S1-S6 |
| `compare_from_s`, `compare_delta_t`, `start_line_angle` | New authored constants for a new engine row | **[NEEDS-0c-3 C4]** | S3 only |
| `s1`, `s2`, `crossing_time` | Derived from the above — the underlying theta(t) IS live (`rbrThetaAt`, `:49952-49966`) but the arc-highlight/label/flash PRIMITIVE that displays them does not exist | theta(t) **[LIVE]**; the display **[NEEDS-0c-3 C4]** | S3 only |
| `gauge_axle_p1`, `gauge_axle_p2`, `gauge_p2_farmass`, `gauge_p1_farmass` | New "axis-to-marker" gauge form | **[NEEDS-0c-3 C5]** — the EXISTING `rbr_r_line`/`show_r_line` mechanism (`:50678-50684`) draws axle-to-MASS only, tracks `eng.r` (frozen at 0.80 for this concept) and is the WRONG primitive for these gauges — see §6 constraint 2 | S1, S3, S5, S6 |
| `v_glide`, `glide_duration`, `glide_distance` | New free-flight decomposition | **[NEEDS-0c-3 C7 — DEFER-RECOMMENDED]**, sole consumer S5 | S5 only |
| `r_point` | New draggable massless marker | **[NEEDS-0c-3 C6]** | S6 only |
| `omega0_s6` | Live omega via new non-restarting path | slider row **[LIVE]** (`RBR_SLIDER_SPEC.omega0`, `:49999`); the non-restarting re-anchor **[NEEDS-0c-3 C10]** | S6 only |
| camera pose (all states) | Per-state pose | **[NEEDS-0c-3 C8 — BLOCKING]** | S1-S6, every state |

### `physics_engine_config.formulas`

```json
{
  "formulas": {
    "shared_angular_speed": "omega = L/I -- LIVE closed form (rbrOmegaAt, field_3d_renderer.ts:49945-49948), but with no torque authored by this concept L and I are both constant S1-S5 (I = i_frame + 2*m*r_mass^2 = 3.06 kg*m^2), so omega is simply the constant 1.50 rad/s at every point of the body -- the definitional content of this concept, not a computation it performs on screen.",
    "moment_of_inertia_home": "I = i_frame + masses.count*m*r_mass^2 = 0.50 + 2*2.0*0.80^2 = 3.06 kg*m^2 -- LIVE (rbrIOf, :49865-49870); constant through S1-S5 because r_mass never moves in a guided state of THIS concept.",
    "swept_angle": "delta_theta = omega * compare_delta_t = 1.50 * 1.80 = 2.70 rad -- theta(t) itself is LIVE (rbrThetaAt, :49952-49966); the arc-highlight primitive that displays delta_theta as a growing wedge does NOT exist [NEEDS-0c-3 C4].",
    "arc_length_ratio": "s_i = r_i * delta_theta -- s1 = 0.30*2.70 = 0.81 m, s2 = 0.60*2.70 = 1.62 m, exactly 2x since r2 = 2*r1. This IS the concept's entire quantitative payload (R1) -- a ratio of two on-canvas numbers, never a v = omega*r formula surface.",
    "start_line_angle_authoring_constraint": "start_line.angle_deg MUST equal theta(compare_window.from_ms) in degrees = omega * compare_from_s * (180/PI) = 1.50*1.0*57.29578 = 85.94 deg -- an AUTHORING-TIME constant physics_author computes once and bakes into the JSON; the schema exposes start_line.angle_deg and compare_window.from_ms as INDEPENDENT fields (F3b), so nothing in the renderer enforces this relation. [NEEDS-0c-3 C4]",
    "crossing_time": "t_cross = compare_from_s + 2*PI/omega = 1.0 + 4.18879 = 5.18879 s, prints as 5.19 s. Authored at theta(0) instead of theta(from_ms) would give 4.19 s and detach the flash from the arcs (F3b failure mode). [NEEDS-0c-3 C4]",
    "gauge_forms": "axle-to-marker gauges equal the marker's own radius by construction (gauge_axle_p1 = r1, gauge_axle_p2 = r2); cross-body gauges sum two radii through the axis (gauge_p2_farmass = r2 + r_mass = 1.40 m; gauge_p1_farmass = r1 + r_mass = 1.10 m). Constancy through spin (S1, S3) AND through the S5 glide IS the taught claim. [NEEDS-0c-3 C5]",
    "glide_kinematics": "glide_distance = v_glide * glide_duration = 0.40 * 3.5 = 1.40 m. Looping condition (P2-9): v_glide < omega*r2 = 1.50*0.60 = 0.90 m/s, else P2's traced curve loses its loops in the translating frame; authored v_glide = 0.40 m/s clears this with a 2.25x margin. [NEEDS-0c-3 C7 -- DEFER-RECOMMENDED]",
    "rim_ring_clearance": "the eight rim dots sit at r=0.50 m; clearance from the rod diameter (0/180 deg) and the always-on stripe tip (drum_radius*0.92 = 0.55*0.92 = 0.506 m) is chord = 2*0.50*sin(11.25 deg) = 0.195 m, re-derived independently and matching the skeleton exactly. [NEEDS-0c-3 C1]",
    "mass_clearance": "the drawn mass sphere spans r_mass +/- (RBR_MASS_R/RBR_WORLD_PER_M) = 0.80 +/- (0.16/1.8) = 0.80 +/- 0.0889 = [0.7111, 0.8889] m (RBR_MASS_R :49798, RBR_WORLD_PER_M :49736 -- both [LIVE]). Every authored marker radius and the S6 r_point ceiling (0.65) must clear 0.7111 m; 0.7111-0.65 = 0.061 m clearance."
  }
}
```

### Constraints

- Every point of a rigid body sweeps the same angle in the same time about a fixed axis — ONE shared angular speed omega. This is the definitional content of the whole concept.
- Arc length s = r*Delta-theta for a fixed Delta-theta, so s is directly proportional to r — twice the radius, twice the arc, at ANY ratio, not just 2x.
- Internal distances of a rigid body never change: axle-to-marker, marker-to-mass and marker-to-marker spans stay constant through spin (S1-S4) AND through translation (S5).
- tau_ext = 0 throughout every guided state of this concept — no brake, no applied torque is ever authored — so I and omega stay exactly constant at the home pose (I = 3.06 kg*m^2, omega = 1.50 rad/s). This is a stronger and simpler condition than `conservation_of_angular_momentum`'s "L is conserved while I changes" — here NOTHING changes.
- A point AT the axis (r = 0) sweeps zero arc — it does not move, though it still turns. This is the true-zero fact S6's r_point drag must reach.
- v_glide must stay below omega*r for the farthest traced point in S5, else that point's looping curve degenerates into a straight line: v_glide < omega*r2 = 0.90 m/s; authored v_glide = 0.40 m/s.

### Ground-truth numeric table (independently re-derived; matches skeleton REV 3 exactly)

| Quantity | Value | Re-derivation |
|---|---|---|
| I (home, S1-S5) | 3.06 kg*m^2 | 0.50 + 2x2.0x0.80^2 = 0.50 + 2.56 |
| omega (S1-S5, constant) | 1.50 rad/s | authored `omega0_rad_s`, no torque |
| Period T | 4.19 s | 2*PI/1.50 = 4.18879 |
| r1 / r2 | 0.30 m / 0.60 m | authored, r2 = 2xr1 |
| Delta-t (S3 window) | 1.80 s | authored |
| Delta-theta | 2.70 rad | 1.50 x 1.80 |
| s1 / s2 | 0.81 m / 1.62 m | 0.30x2.70 / 0.60x2.70 — exactly 2x |
| start_line angle | 85.94 deg | 1.50x1.0x57.29578 |
| crossing time | 5.19 s | 1.0 + 2*PI/1.50 = 5.18879 |
| S1 gauges | 0.30 m / 1.40 m | r1 / (r2+r_mass = 0.60+0.80) |
| S4 line dots | 0.10, 0.20, 0.30, 0.40, 0.50 m | authored |
| S4 rim ring | 0.50 m x 8, at 22.5deg+kx45deg | authored |
| S4 rim clearance | 0.195 m | 2x0.50xsin(11.25 deg) |
| S4 stripe tip | 0.506 m | 0.55x0.92 (`:50322-50326`) |
| S5 v_glide | 0.40 m/s | authored, < omega*r2 = 0.90 m/s |
| S5 glide distance | 1.40 m | 0.40x3.5 |
| S5 held gauge | 1.10 m | r1+r_mass = 0.30+0.80 |
| S6 r_point cap | 0.65 m | mass inner edge 0.7111 - 0.061 m clearance |
| mass extent | [0.7111, 0.8889] m | 0.80 +/- (0.16/1.8) |

---

## §2 — Per-state variable notes (`variable_overrides` + tier)

Every state declares the full apparatus block explicitly, even where it never
changes across this concept — the sibling's defensive pattern against
`default_variables_only_first_var_merged` — because `r_mass`, `m` and `omega`
are read by `applyRigidBodyRotationState` from the state's OWN config every
entry (`:50481-50557`), never inherited from a previous state.

| State | `variable_overrides` | Justification | Tier |
|---|---|---|---|
| S1 | `apparatus:{i_frame_kgm2:0.50, rod_half_length_m:1.00, brake_drum_radius_m:0.55, rod_height_above_pad_m:0.25, r_min_m:0.15, r_max_m:0.90}`, `masses:{count:2, mass_kg:2.0, r_m:0.80}`, `omega0_rad_s:1.50`, `spin_sign:1`, `external_torque:` absent (tau=0) | True initial seed at the chapter's shared home pose (`APPARATUS_CONTRACT.md` §1) | apparatus **[LIVE]**; `point_markers`/gauges/camera **[NEEDS-0c-3 C1/C5/C8]** |
| S2 | identical apparatus/masses/omega0/spin_sign — a fresh re-pose, not a continuation | This concept never moves the sliding masses in a guided state (sliding them is #10's aha) | apparatus **[LIVE]**; traces **[NEEDS-0c-3 C3]** |
| S3 | identical apparatus baseline, PLUS `compare_window:{from_ms:1000, to_ms:2800}`, `start_line:{angle_deg:85.94}`, `crossing_mark_at_ms:5190` | The window timing and start-line angle are AUTHORING-TIME constants derived once (§1 formulas), never computed live by the renderer | apparatus **[LIVE]**; window/line/flash **[NEEDS-0c-3 C4]**; radius gauges **[NEEDS-0c-3 C5]** |
| S4 | identical apparatus baseline; the drum face carries five line dots + eight rim dots (§1) | The drum face IS the disc for this beat (skeleton apparatus discipline) — masses/rod baseline unchanged | apparatus **[LIVE]**; drum markers **[NEEDS-0c-3 C1]** |
| S5 | identical apparatus baseline at ENTRY, then `v_glide:0.40, glide_duration_ms:3500, loop_reset_at_ms:11000, loop_blank_ms:1000` | Single-frame re-pose to the home baseline, THEN the glide beat is entirely C7 content | apparatus **[LIVE]**; glide **[NEEDS-0c-3 C7 — DEFER-RECOMMENDED]** |
| S6 | `mode:'sandbox'` **(MUST be authored — see §6)**, `apparatus:` same fixed baseline, `masses:{count:2, mass_kg:2.0, r_m:0.80}` (defensive lock — never a control here), `omega0_rad_s:1.50` (S6's live start value), `readouts:['omega']`, `controls_visible:['omega0','r_point']`, `idle_auto_sweep:{param:'r_point', range:[0.00,0.65]}` | Defensive `m`/`r_mass` lock per the historical leak class; `mode:'sandbox'` is what makes the explore state free-run instead of pinning at the 1500 ms floor (P3-ii) | apparatus/omega0-slider **[LIVE]**; `mode` field itself **[LIVE]** (`rb.mode`, `:50487`, `:3212`/`:3942`); `r_point`/C10-drive **[NEEDS-0c-3 C6/C10]** |

---

## §3 — Within-state motion timeline + per-state control spec (Rule 31)

**Camera framing note (holds for every row below):** the C8 contract authors an
800 ms closed-form ease at every state's entry, but S1->S2->S3->S6 share ONE
target pose, so only S1's FIRST entry (from the global load default) is a
VISIBLE camera move; S2/S3/S6's eases are no-op transitions (target == current
— this is why the cycle-2 margin analysis treats S1's 2.2 s as the concept-wide
worst case). S4's dolly and S5's reframe are the ONLY other visible camera
moves (F6). Every camera-dependent row is tagged **[NEEDS-0c-3 C8]**.

**Reveal-pin methodology (physics_author's job per the pin-table note):** each
state below computes an exact last-reveal instant, then a design-estimate
cushion (900 ms, matching the RENDERER's own `RBR_CUSHION` convention used for
`param_ramp`/`reference_marks`, `:3136`/`:3145`/`:3185`) to land the frozen
frame PAST the settle, never inside it. These are physics_author's numbers,
refining the skeleton's rougher per-state estimates now that the exact
choreography is written out — refinements are called out explicitly where the
skeleton's estimate and mine disagree by more than rounding.

### S1 — "A rigid body: distances stay fixed" · core · no controls · min duration >= 15 s

| t-window (state-local ms) | What animates | Driven by | Tier |
|---|---|---|---|
| 0-800 | Camera eases to the shared pose (the concept's FIRST visible camera move) | authored pose | **[NEEDS-0c-3 C8]** |
| 0 -> end (whole state) | Turntable + rod + two masses spin continuously at omega = 1.50 rad/s — never stops | omega (constant) | **[LIVE]** `rbrOmegaAt :49945`, `spin.rotation.y=theta :50671` |
| 800-1400 | P1 dot+label appears at r1=0.30 m; P2 dot+label appears at r2=0.60 m — SAME arm (F3a) | authored `label_at_ms` | **[NEEDS-0c-3 C1]** |
| 1400-2100 | axle->P1 gauge draws, offset +0.10 world, live label "0.30 m" | r1 | **[NEEDS-0c-3 C5]** |
| 2100-2800 | P2->far-mass gauge draws, offset -0.10 world, crossing the axis to the r_mass=0.80 m mass on the opposite arm, live label "1.40 m" | r2+r_mass | **[NEEDS-0c-3 C5]** |
| 2800 -> end | HELD: both gauge numbers frozen; under the near-top-down pose the DRAWN gauge length visibly holds too (P3-6 — the one thing that could have changed and doesn't) | — | **[NEEDS-0c-3 C5, C8]** |

**Pin:** last reveal 2800 ms + 900 ms cushion = **3700 ms** (refines the skeleton's rough "~3.0 s" now that the two-gauge sequence is written out explicitly). Controls: **none**.

Narration sync: sentence 1 -> 0-800 -> apparatus/spin · sentence 2 -> 800-1400 -> P1/P2 markers · sentence 3 -> 1400-2100 -> axle->P1 gauge · sentence 4 -> 2100-2800 -> P2->far-mass gauge · sentence 5 -> 2800+ -> both gauges (hold-glow).

### S2 — "Every point moves in a circle" · core · no controls · min duration >= 13 s

| t-window | What animates | Driven by | Tier |
|---|---|---|---|
| 0-1000 | Camera pose unchanged (no-op ease); P1/P2 markers persist from S1; no new reveal — a readable lead-in before the trace begins | — | **[NEEDS-0c-3 C1]** (persist) |
| 1000-5190 (4190 ms = one revolution T=2*PI/1.5) | P1's trace paints a circle of radius r1; P2's trace paints a circle of radius r2; CONCENTRIC, growing together (both share the same theta(t)) | theta(t) | **[LIVE]** theta engine; **[NEEDS-0c-3 C3]** the trace primitive |
| 5190 -> end | HELD: both closed circles persist; the aspect-0.94 camera makes them READ as circles, which is the whole claim | — | **[NEEDS-0c-3 C3, C8]** |

**Pin:** 5190 + 900 = **6090 ms ~= 6.1 s** (refines the skeleton's "~5.2 s" by the same cushion convention). Controls: **none**.

Narration sync: sentence 1 (aha framing) -> 0-1000 -> apparatus · sentences 2-3 (the two circles) -> 1000-5190 -> P1/P2 traces · anchor -> 5190+ -> hold, ceiling-fan anchor over the held picture.

### S3 — "Outer points travel farther in the same time" · core (PRIMARY aha + both misconception pivots) · no controls · min duration >= 24 s

| t-window | What animates | Driven by | Tier |
|---|---|---|---|
| 0-700 | axle->P1 (r1=0.30 m, offset +0.10) and axle->P2 (r2=0.60 m, offset -0.10) gauges RE-SHOW, now NAMED as radius — the term-ledger DEFINING moment ("the distance from the axle IS the circle's radius") | r1, r2 | **[NEEDS-0c-3 C5]** |
| 700-1000 | Fixed start line appears, at its authored angle 85.94 deg (= theta at 1000 ms — F3b) | authored constant | **[NEEDS-0c-3 C4]** |
| 1000 | CAUSE: compare window opens — the body is exactly at the ray at this instant | theta(1000)=85.94 deg | **[LIVE]** theta engine underneath; **[NEEDS-0c-3 C4]** the window primitive |
| 1000-2800 (Delta-t=1800, EFFECT after the reveal beat) | Both swept arcs highlight and grow together, tracking theta(t)-theta(1000); the outer arc visibly outrunning the inner | theta(t) | **[LIVE]** theta; **[NEEDS-0c-3 C4]** riding **[NEEDS-0c-3 C3]** |
| 2800 | Arc labels land: s1=0.81 m, s2=1.62 m | s_i=r_i*Delta-theta | **[NEEDS-0c-3 C4]** |
| 2800-5190 | HOLD — arcs/labels stay on screen; body keeps spinning silently toward the crossing | — | — |
| 5190 | `crossing_mark_at_ms` fires: start line + BOTH markers flash simultaneously | 1.0+2*PI/1.5 | **[NEEDS-0c-3 C4]** — see §6 for the group-token gap this needs |
| 5190 -> ~14000 | HOLD — no new visual reveal; narration continues over the settled picture | — | — |
| **~14000-15200** | omega HUD row reveals (`readout_at_ms.omega:14000`), text builds "omega = 1.50 rad/s" | authored reveal, timed to land AFTER the omega-defining sentence is spoken (see §4) | **[LIVE]** mechanism `readout_at_ms :50234-50241` / `deriveStateMeta.ts:3193-3198 (+1200)`; the VALUE `14000` is authored content |
| 15200 -> end | HELD — omega readout hold-glow sustained; the anchor sentence (§4 sentence 5) is spoken over this hold, after the pin — it adds no new visual reveal and does not move the pin | — | **[LIVE]** hold-glow |

**Pin — closing §R P3-iii explicitly:** the founder-proxy residual note names the crossing flash (~5.19 s) as the last-asserted reveal, but flags that the omega-introducing sentence very likely dominates by roughly 10 s once the narration order is fixed. **Confirmed and closed here:** with `readout_at_ms.omega = 14000` ms, the dominating candidate is `14000 + 1200 = 15200` ms — the omega HUD reveal, not the 5190 ms crossing flash. **The pin table's "S3 ~= 5.2 s" cell in the skeleton is WRONG; the real pin is ~=15.2 s.** This matters concretely: a THE-EYE frozen frame at 5.2 s (the skeleton's number) would photograph the arcs and the crossing flash but MISS the omega readout entirely — exactly the "self-contradictory H2 baseline" the pin-rule comment warns about, this time on the state that carries the concept's whole quantitative payload. **Adding the Rule-35 anchor as a closing sentence 5 (below) does not move this pin** — it is spoken entirely after 15200 ms, over the sustained hold. Controls: **none**.

Narration sync (see §4 for the sentences): sentence 1 (aha) -> 0-1000 -> apparatus, no new visual yet · sentence 2 (ratio+radius) -> over the 1000-2800 arc-growth window and the 2800 label-land · sentence 3 (crossing) -> spoken well after the 5190 ms flash already happened and is holding — a genuine narration-lags-visual gap, flagged in §6 · sentence 4 (omega) -> timed so its END lands near 14000 ms, gating `readout_at_ms` · sentence 5 (anchor) -> spoken last, entirely over the 15200 ms+ hold, no new visual.

### S4 — "Same radius, same circle" · extended · no controls · min duration >= 16 s

| t-window | What animates | Driven by | Tier |
|---|---|---|---|
| 0-800 | Camera DOLLIES to the drum-face pose (radius only, same phi/theta — P3-a) | authored pose | **[NEEDS-0c-3 C8]** |
| 800-1400 | Radial LINE of five dots (r=0.10...0.50 m) appears, authored at 90 deg from the rod | authored `label_at_ms` | **[NEEDS-0c-3 C1]** |
| 1400-5590 (4190 ms = one revolution) | The line sweeps, stays perfectly straight (rigidity at scale); each of its five dots paints its own circle SIMULTANEOUSLY (all driven by the same theta(t)) — five nested concentric circles | theta(t) | **[LIVE]** theta; **[NEEDS-0c-3 C3]** |
| 5590-6190 | Eight RIM dots (r=0.50 m, at 22.5deg+k*45deg) fade in at their fixed angles | authored | **[NEEDS-0c-3 C1]** |
| 6190-6790 | The rim-dot GROUP (elementType `rbr_marker_rim`) brightens as the sole glow focal, riding the outermost r=0.50 m circle the line's own end dot already painted | `glow_focal: 'rbr_marker_rim'` | **[NEEDS-0c-3 C1 group token + C9(b)]** — `:50776-50777` elementType match is **[LIVE]**, but no `rbr_marker_*` type exists to match against today |
| 6790-7390 | Labels land: "r = 0.10 m" (innermost line dot), "r = 0.50 m" (line's end dot), "r = 0.50 m" (ONE rim dot at a different angle) | authored `label_at_ms` | **[NEEDS-0c-3 C1]** |
| 7390 -> end | HELD — five nested circles + rim ring visible, rim-group focal glow sustained | — | — |

**Pin — a second refinement worth flagging prominently:** the skeleton's own pin table gives S4 "~=4.5 s". **This is not achievable:** the five nested circles ALONE need one full revolution (4.19 s) to close, and that revolution cannot even START until the line has appeared (>=800 ms dolly + 600 ms line reveal). By the time the rim ring fades in, brightens, and labels land, the true last reveal is **7390 ms**; with the 900 ms cushion the pin is **8290 ms ~= 8.3 s** — nearly DOUBLE the skeleton's estimate. Authoring the pin at the skeleton's 4.5 s would freeze the frame mid-revolution, with the nested circles half-painted and the rim ring not yet built — precisely the "missing-maxReveal-block" failure class the renderer's own comment names. **This must travel to Desk E/0d as a correction, not a footnote.**

Controls: **none**.

### S5 — "Moving and spinning at once" · advanced · no controls · min duration >= 24 s (2 loop cycles)

**Rides the DEFER-RECOMMENDED C7 row (sole consumer). If C7 is declined this wave, this entire state — and the advanced ring — is CUT per the clean preset (§10 i-1 of the skeleton); the timeline below is authored so it is ready to build the moment `motion_of_centre_of_mass` (#2) lands and C7 is built with it.**

| t-window | What animates | Driven by | Tier |
|---|---|---|---|
| 0-800 | Camera reframes to the glide pose (wide, run + one rod-length margin each end); rod detaches from the axle | authored | **[NEEDS-0c-3 C8, C7]** |
| 800-4300 (3500 ms) | Rod glides at v_glide=0.40 m/s while spinning at omega=1.50 rad/s; centre traces a straight line; P2 (r2=0.60) traces a looping curve; a co-moving highlight circle tracks P2 around the translating centre; the P1->far-mass gauge (1.10 m) holds throughout | v_glide, omega | **[NEEDS-0c-3 C7]** (motion); **[NEEDS-0c-3 C5]** (held gauge tracking through translation) |
| 4300-11000 (6700 ms) | HELD at the final glided position — centre line + P2's completed loop trace remain; highlight persists; gauge holds 1.10 m | — | **[NEEDS-0c-3 C7]** |
| 11000-12000 | Blank (1000 ms) — authored loop-reset cue | authored | **[NEEDS-0c-3 C7]** |
| 12000 | Replay from t=0 of this sequence; cycle repeats every 12000 ms for the rest of the state | authored | **[NEEDS-0c-3 C7]** |

**Pin:** last reveal before the FIRST loop ~= 4300 + 900 = **5200 ms** (refines the skeleton's "~=6.0 s" slightly) — precedes the 11.0 s loop reset by **5.8 s** margin. Controls: **none**.

### S6 — "Try it yourself" · explore · omega0 + r_point (ring-gated) · free-run, never auto-freezes (Rule 37)

**`rigid_body_rotation.mode: 'sandbox'` MUST be authored on this state.** Per
`deriveStateMeta.ts:3212` (`if (!rbrFound && rbr.mode !== 'sandbox') candidates.push(RBR_CUSHION)`)
and `:3942` (`(rbrHold.mode === 'sandbox' || rbrHold.trusted_drag_seizes === true) ? 'interactive' : 'reveal_hold'`),
omitting `mode: 'sandbox'` pins this state at the **1500 ms floor** and
misclassifies it as a scripted `reveal_hold` beat instead of `interactive` —
**both [LIVE] mechanisms, both silently wrong without the one field.** No rbr
concept JSON exists in any branch to clone this from (skeleton §5.1 item 6) —
json_author must author it from this contract, not by example.

| Behavior | What animates | Driven by | Tier |
|---|---|---|---|
| Idle (until first trusted input) | `r_point` auto-sweeps 0.00<->0.65 m (repeating triangle); its painted circle rescales live; the axle->r_point gauge tracks live; omega holds at 1.50 rad/s | `idle_auto_sweep` | **[NEEDS-0c-3 C6]** — **must register its OWN sweep param key** (e.g. `"r_point"`), NOT `"r"` — the existing sweep switch only matches `sw.param === "r"` (`:49857-49862`), which drives the SLIDING MASS radius; reusing that string would silently sweep the wrong quantity |
| `omega0` drag (live, trusted-seize) | Angular speed re-anchors live, no blank, no theta teleport; the omega readout tracks every step; every persisted circle (S2-S4's traces, if carried) repaints at the new rate | `omega0_s6` | slider row **[LIVE]** `:49999`; the non-restarting re-anchor **[NEEDS-0c-3 C10]** |
| `r_point` drag (live, trusted-seize) | The marker slides along the rod; its circle rescales live; the axle->point gauge reads r continuously; at r_point=0 the circle collapses to a dot ON the axle — the true-zero fact | `r_point` | **[NEEDS-0c-3 C6, C3, C5]** |
| Camera | Returns to the SAME shared pose used at S1-S3 (a return, not a new framing move — no visible camera motion) | authored | **[NEEDS-0c-3 C8]** |

Controls: **omega0** (min_ring `core`, [0.5, 3.0] rad/s, step 0.1, default 1.50) · **r_point** (min_ring `core`, [0.00, 0.65] m, step 0.01, default 0.30 — continuity with S3's r1). Deliberately NOT exposed: `r` (mass radius), `m`, `tau_brake` — unchanged, endorsed at Checkpoint A. No narration (0/open).

---

## §4 — Narration (`text_en`) per state

**Numeral convention (a deliberate deviation from the sibling's spelled-out-digit
style — flagged explicitly):** the sibling `conservation_of_angular_momentum`
spells numbers as words ("one point five oh radians per second"). At this
concept's word budgets — especially S3's 45-55 words carrying the whole
quantitative payload — that convention alone would consume the entire budget on
four numbers. This block writes numerals as digits ("0.30 m"); Sarvam
bulbul:v3 pronounces inline numerals natively (Rule 30), so this is an audio-safe,
budget-safe choice, not a rule violation. Flagged for founder-proxy/quality-auditor
to confirm this is an acceptable per-concept style choice rather than a fleet-wide
convention break.

**Apparatus noun:** "turntable" throughout — never "drum" or "brake drum" in any
reader-facing string (matching `APPARATUS_CONTRACT.md` §3 and the sibling's
callout 2), even though S4's INTERNAL design language calls it "the drum face" —
that phrase is documentation, not narration; S4's actual narration below never
uses the word.

**S1** (45 words, budget 30-45):
1. "This turntable is a rigid body." (6)
2. "We mark two points on the rod: P1 and P2." (10)
3. "The distance from the axle to P1 is 0.30 m." (10)
4. "From P2, across the axle to the far mass, is 1.40 m." (12)
5. "Both distances hold as the body turns." (7)

Total: 6+10+10+12+7 = **45 words.** (within 30-45)

**S2** (35 words, budget 25-45):
1. "Now watch each marked point on its own." (8)
2. "P1 traces a small circle; P2 traces a larger one." (10)
3. "Every point moves in its own circle." (7)
4. Anchor: "Each point of a ceiling-fan blade draws its own circle." (10)

Total: 8+10+7+10 = **35 words.** (within 25-45)

**S3** (54 words, budget 45-55 — the most loaded state. The Rule-35 anchor now
FITS here, by trimming — see §6 for the resolution and what was cut):
1. "Every point sweeps the same angle in the same time." (10)
2. "That axle distance is the radius: 0.30 m inner, 0.60 outer, twice the arc -- 1.62 against 0.81." (17)
3. "Both cross the line together." (5)
4. "One shared angular speed omega: how fast it turns." (9)
5. Anchor: "On a merry-go-round, the rider at the edge travels the longest way round." (13)

Total: 10+17+5+9+13 = **54 words.** (within 45-55)

**S4** (41 words, budget 30-50):
1. "Look at every point on the body, not just the two marked ones." (13)
2. "Five points trace five circles, 0.10 to 0.50 m; eight more at 0.50 m, at different angles, land on that same circle." (21)
3. "The path depends on the radius alone." (7)

Total: 13+21+7 = **41 words.** (within 30-50) No anchor is authored on this
state — the Rule-35 anchor is placed on S3 instead (see §6), which teaches the
identical distance claim the anchor illustrates.

**S5** (54 words, budget 35-55):
1. "Take the rod off its axle and set it moving." (10)
2. "The centre slides in a straight line while the body still spins about it." (14)
3. "The outer point now traces a looping curve, circling the centre as the centre moves." (15)
4. "The distance from the inner point to the far mass still holds at 1.10 m." (15)

Total: 10+14+15+15 = **54 words.** (within 35-55)

**S6**: 0 words (open explore state — no authored narration, per Rule 31).

---

## §5 — Drill-down cluster phrasings (30 phrases, 6 clusters x 5)

**`outer_point_takes_longer`** (S3): "why does the outer point take longer to go around" · "shouldnt the far point finish after the near point" · "the outer point has more distance so doesnt it need more time" · "how can they both get back at the same time if one travels farther" · "why dont they cross the line at different times"

**`one_omega_all_points`** (S3): "why is there only one omega for the whole body" · "dont different points spin at different rates" · "how can one number describe every point at once" · "is omega the same for a point near the axle and one far away" · "why does the whole rod share one turning rate"

**`arc_length_vs_time`** (S3): "whats the difference between arc length and time here" · "if the time is the same why is the arc length different" · "how do you get arc length from radius and angle" · "does a bigger arc mean a bigger angle too" · "why does doubling the radius double the arc"

**`same_radius_same_path`** (S4): "why do points at the same radius follow the same circle" · "does it matter where on the rod the point sits if the radius is the same" · "how can two different points trace the same circle" · "is the circle only about how far from the axle you are" · "why doesnt the angle of the point on the rod change its path"

**`marked_points_vs_all_points`** (S4): "does this only work for the two points we marked" · "what about points we didnt mark" · "is every single point on the rod doing this" · "why did we only look at two points earlier" · "does the rule apply to points not on the rod at all"

**`path_depends_on_radius_only`** (S4): "so the path only depends on the radius" · "does the angle around the body matter for the path shape" · "why doesnt where the point sits matter, only how far out" · "if two points are at the same radius but opposite sides do they trace the same circle" · "is the circle shape only decided by radius"

---

## §6 — Constraint callouts

1. **Rounding.** 2 dp everywhere, matching `rbrFx()` (`:50817-50823`) — e.g. "0.30 m", "1.62 m", "1.50 rad/s".

2. **The `show_r_line`/`rbr_r_line` TRAP — do not author it for this concept.** The EXISTING live mechanism (`:50678-50684`) draws a single axle-to-mass reference line tracking `eng.r` — the SLIDING MASS's radius, frozen at 0.80 m for this entire concept. **This concept's radius gauges (P1, P2, S6's r_point) are a structurally DIFFERENT quantity and must route exclusively through the NEW C5 axis-to-marker form.** If json_author or field3d-surgeon authors `show_r_line: true` expecting it to draw the P1/P2 gauge, it will instead draw a useless line to the r=0.80 m mass that never moves in this concept — a state that silently teaches nothing while appearing to work. Flag prominently for the 0c-3 build brief.

3. **C4's crossing flash needs a THIRD shared group token, not named in the skeleton's C1/C9 contract text.** The one-string focal-match mechanism (`ud.id === focal || ud.elementType === focal`, `:50776-50777`) that lets S4 address "all eight rim dots" via `rbr_marker_rim` works the same way for S3's `crossing_mark_at_ms` flash — but that flash needs to pulse THREE heterogeneous objects together (the start line + P1 + P2), which is a DIFFERENT grouping than S4's rim/line split. This needs its own shared elementType (suggest `rbr_crossing_flash`, assigned to the start line AND both S1-S3 markers) so a single `phases[]` entry can flash all three with one `glow_focal` string. Not present in the skeleton's C9(b) rider — name it explicitly in the 0c-3 build brief or field3d-surgeon will have to invent it ad hoc.

4. **No L, no F_pull, no R_drum line, no grip hand — anywhere in this concept.** `show_l_arrow`, `show_pull_arrows`, `show_drum_line`, `show_grip_hand` are all omitted (default falsy) at every state. `L` belongs to `angular_momentum`/`conservation_of_angular_momentum` (#9); `F_pull`/the brake belong to #5/#7. This is directly checkable against `rbrApplyVisibility`'s flags map (`:50607-50613`) once 0c-3 lands.

5. **S6's `idle_auto_sweep` param-key gotcha** (already flagged by the skeleton, restated here as a build-sheet item): the sweep switch at `:49857-49862` matches ONLY `sw.param === "r"`. C6 must give `r_point` its own closed-form reader (a parallel `rbrPointRAt()`, not a branch inside `rbrRAt()`) with its own sweep/ramp param check — reusing the string `"r"` for `r_point`'s sweep would silently drive the WRONG quantity (the sliding mass, invisible to this concept) instead of the marker.

6. **The Rule-35 merry-go-round anchor is authored — on S3, resolved by trimming, not by dropping (revised 2026-08-04 per coordinator instruction).** My first pass (above, in the earlier revision of this block) reported the anchor as unfittable; that was wrong to leave as a silent omission, since Rule 35 makes the anchor non-optional and the skeleton already assigned it. Re-attempted properly: **S3 is the better home, not S4** — S3 teaches the exact claim the anchor illustrates (a farther point covers more distance in the same time), so the coordinator's suggestion to try S3 first was right; S4 stays anchor-free. Fit achieved by trimming S3's four existing sentences (none dropped, none merged away — every beat in the C4/C5 timeline still has a narrated sentence):
   - Sentence 1 (aha): "Every point of this body sweeps the same angle in the same time." (13) -> "Every point sweeps the same angle in the same time." (10) — cut "of this body" (redundant given the state's whole subject is one body).
   - Sentence 2 (ratio+radius): "...twice the arc, 1.62 m against 0.81 m." (20) -> "...twice the arc -- 1.62 against 0.81." (17) — dropped the repeated "m" units on the arc-length pair only (the radius pair keeps its "m"; both numbers are already labelled "m" on-canvas per the term ledger, so the narration need not repeat the unit a third and fourth time).
   - Sentence 3 (crossing): "Both cross this line at the same instant." (8) -> "Both cross the line together." (5) — "together" carries the simultaneity claim in fewer words; "this line" -> "the line" (still literal, still points at the one on-canvas start line).
   - Sentence 4 (omega): "One shared angular speed omega -- how fast the body turns." (10) -> "One shared angular speed omega: how fast it turns." (9) — "the body" -> "it" (unambiguous antecedent one word later).
   - Total saved: 13->10, 20->17, 8->5, 10->9 = 11 words freed (51->40 for the four original sentences; the doc's prior "52" total for these four sentences was itself a one-word counting error in the previous revision, corrected here).
   - Anchor added VERBATIM from the architect's Section 9 (no new wording invented): "On a merry-go-round, the rider at the edge travels the longest way round." (13 words) — a pure DISTANCE claim ("travels the longest way round"), no speed word anywhere, matching founder ruling R1 exactly ("fastest" still appears nowhere in the concept). Placed LAST (sentence 5), spoken entirely after the 15200 ms pin, over the sustained hold — **the pin does not move** (see §3 S3). Rule 41 plain literal English preserved throughout every trim.
   - **New S3 total: 10+17+5+9+13 = 54 words — inside the 45-55 band**, with 1 word of headroom to the ceiling. S3's min duration is bumped 21 s -> 24 s (§3) to hold comfortably past the now-longer narration; this is a duration adjustment, not a pin move.

7. **S3's pin — the P3-iii closure, restated as the headline number.** The skeleton's pin table names the crossing flash (~5.19 s) as S3's last reveal; the founder-proxy residual note (P3-iii) correctly flagged this as probably wrong once the omega sentence's placement is fixed. With `readout_at_ms.omega = 14000 ms` (§3), the dominating candidate is **15200 ms**, not 5190 ms — a correction of **~10 s**, exactly the founder-proxy's estimate. **The skeleton's own pin table must be corrected before 0d, not carried forward as written.**

8. **S4's pin is also wrong in the skeleton and must be corrected — see §3 S4.** ~4.5 s (skeleton) vs **8.3 s** (this block, re-derived from the actual choreography: one full revolution alone is 4.19 s).

9. **`mode: 'sandbox'` on S6 is a hard requirement, not a nicety** — see §3 S6 for the exact consequence of omitting it (P3-ii).

10. **`readouts: ['omega']` must be authored independently on S3, S4, S5, S6** — each state's array is its own (`:50158`, `:50233`); a state that does not re-declare it loses the omega HUD row entirely, in silence (unknown/absent keys are skipped, no throw). S1 and S2 author `readouts: []` (or omit it) — the omega HUD panel is fully hidden until S3 defines it.

11. **Notation ladder (Rule 38c) — trivially satisfied.** This concept has NO formula surface at all (R1) — not "algebra only," but literally zero symbolic equations on any ring. The one symbol printed, omega, appears only as a value-only HUD row.

12. **Dialect (38d).** "Angular speed," "radius," "arc length" read identically across CBSE/JEE/NEET — no dual-labelling required. "Turntable" is the one fixed apparatus noun (constraint 4 above; chapter-wide, `APPARATUS_CONTRACT.md` §3).

13. **`theta0_rad` is not needed by this concept** (every guided state enters at theta0=0 by construction — S1's markers start at t=0 with the body already spinning from theta=0) **but it is fully LIVE, not inert** — see the header note. If a future revision of this concept (or a sibling) wants a non-zero entry angle, the field already works: `:50499` -> `:49969-49971`. The renderer comment (`:953`) and `APPARATUS_CONTRACT.md` line 70 both mislabel it "declared, not implemented" — flagged in my final report for correction, not edited here (out of scope for this desk).

---

**DC Pandey check:** every formula, narration line and anchor above derives from `s = r*theta`, the definition of rigid-body rotation (every point sweeps the same angle in the same time about a fixed axis), and Newton's laws applied to the marked points directly — no teaching sequence, example, or figure imported from any book. NCERT §7.1/§7.6 confirm scope only.

*This physics block completes wave-2 design for `rigid_body_rotation` (skeleton REV 3 `DESIGN_OK` + this block). Per the skeleton's own status, the build now HOLDS until 0c-3 merges — the next step is `json-author`, gated on the skeleton §5.1 re-verification list (bug-queue re-run, C8's fate, the two-timed-class fence, C7/#2's wave membership, F-C5, and the fact that no rbr concept JSON exists anywhere to clone from).*
