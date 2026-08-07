# SKELETON — `rolling_on_incline` (chapter `rotmech`, Class 11 Ch.7 — Systems of Particles & Rotational Motion) — REV 3 (fix cycle 1 response)

> **Phase-0 role:** 0b spec driver for build **0c-2** (bounded rotational extension to `newtons_laws_body`). This skeleton + the physics block ARE the spec the field3d-surgeon builds against. founder-proxy Checkpoint A ran on REV 2 → `DESIGN_FIX` (`founder_proxy_A.md`); this is the cycle-1 revision. Every P1/P2/P3 is addressed — the FIX-CYCLE-1 RESPONSE table at the end is the diff index. REV 2 preserved at `skeleton_rev2.md`.
> Survey: `docs/loop_runs/rotmech/phase0_survey.md` (founder-approved 2026-08-02). Concept #12 of the 14-concept spine, ★ Diamond, V1 priority. Sibling: `pure_rolling` (#11, same 0c-2 build — **see the union-scope limit in ENGINE REQUIREMENTS, P2-5**).
>
> **Engine bug queue consultation (REV 3 — live, queries stated):** live table queried this cycle via `query_engine_bug_queue.ts` AND a direct read-only SELECT — **the script's canned `FIELD3D` concept list predates the nlb fleet and cannot reach scenario-scoped rows, which is the root cause of REV 2's seven skipped rows.** Exact query list in the SCAR AUDIT preamble. Renderer claims re-verified with line numbers this cycle: `length_m` half-length declaration `:941` + readers `:40060–40067`/`:44176`; `nlbGravAlong` sign `:45093–45096`; contact lift `NLB_BODY_SIZE/2` `:40015`; spin divisor `NLB_WHEEL_R` `:40053`; lane derivation `:39998–40001`; `PerspectiveCamera(60,…)` `:3341`; θ-arc `R = 1.05` `:40074`; `controls_visible` enum `:1340`; `#nlb_formula` `:41746`; `param_ramp` `:42295`; energy-layer `slice(0,2)` `:43247/:43356`; body loops `:39895/:40245/:44663`. All rolling motions are tier **[NEEDS-SCENARIO]**.

## 1. Atomic claim

This concept teaches that a body rolling without slipping down an incline accelerates at a rate set ONLY by the dimensionless shape factor k = I/mR² — so four shapes released together always finish in the fixed order solid sphere, disc, hollow sphere, ring, regardless of mass or radius. It does NOT teach the rolling constraint itself or contact-point kinematics in depth (`pure_rolling`, which precedes it; here one compact recap beat), and it does NOT teach rotational kinetic energy as a topic (`rotational_work_energy`); the energy split appears only as the extended-ring explanation of the race.

## 2. State count + arc

**8 states** (complex — 7–9 band). Rings: core S1–S4, extended S5, advanced S6–S7 (contiguous, immediately before explore), explore S8.

| State | Title (Rule 41 — literal, rail-truncation-safe) | Purpose | teaching_method | depth_ring |
|---|---|---|---|---|
| STATE_1 | The race: four shapes | Hook — four bodies released together finish in a fixed order, every time | straightforward beat | core |
| STATE_2 | Rolling links v and ω | Recap: v = Rω on screen — a rim point stops at contact, centre at v, top at 2v | straightforward beat | core |
| STATE_3 | The friction is static | RM-G7 kill: contact speed 0.00 m/s ⇒ static, not kinetic — SEQUENTIAL contrast with a skidding block | straightforward beat (16a) | core |
| STATE_4 | Mass and radius cancel | Second kill: a heavy large sphere and a light small sphere TIE — only k = I/mR² matters | straightforward beat (16a) | core |
| STATE_5 | The same energy, split two ways | WHY (AP/IB/NCERT mainstream route): same drop = same total KE; the ring puts more into spinning | straightforward beat | extended |
| STATE_6 | One formula ranks all four | a = g sin θ/(1 + I/mR²) built from the CoM equations (f R = I_cm α, then F = ma along the slope) | derivation_first_principles | advanced |
| STATE_7 | Low friction: rolling becomes slipping | Regime switch: μ_s below (k/(1+k))·tan θ → the contact slides, friction flips to kinetic | straightforward beat | advanced |
| STATE_8 | Try every variable | Sandbox — controls live per `min_ring`, core-ring readouts only | exploration_sliders | explore |

The hook MOVES (S1 is the race itself). No `narrative_socratic`, no `wait_for_answer`, no `pause_after_ms`.

## 3. Per-state choreography + control plan (Rule 31 control table)

| State | Teaches | Archetype | Distinct motion | Delta cue | Live controls | Words | Ring |
|---|---|---|---|---|---|---|---|
| S1 | Shape decides the finish order | `translate-through` | Four visibly different bodies (equal m = 1 kg, R = 0.15 m) roll from a common start line, **released simultaneously** (no stagger), **approaching the camera**; they separate; finish chips light 1-2-3-4, each stamped on the body's CENTRE (CoM coordinate) crossing `s_finish`; loop resets — same order every time. Authored, no teacher input | "Four shapes, one ramp" | none | 40–50 (incl. ≤12-word anchor) | core |
| S2 | v = Rω in action | `flow-along-path` | ONE disc rolls slowly from the home pose (the loop covers only the first ≈2 m so the cycloid reads); a marked rim point traces its cycloid, pausing at each ground touch; velocity arrows at contact (0), centre (v), top (2v); v and Rω readouts stay equal | "v equals R ω" | none | 30–45 | core |
| S3 | The contact friction is STATIC | `null-result-hold` | **SEQUENTIAL, never co-present:** the locked block ALONE skids down (μ_k = 0.15) — contact slides, f_k label, skid trail; the block DISSOLVES; only then the rolling disc assembles and descends (μ_s = 0.50) — contact readout holds 0.00 m/s, f_s label, no trail. Cues on the scenario_cue channel; at no instant are both visible | "Contact point speed: zero" | none | 40–55 | core |
| S4 | Only k matters — mass and radius cancel | `translate-through` — **declared contrast pair with S1** | A large heavy sphere (5 kg, R = 0.30) races a small light one (0.5 kg, R = 0.10), released simultaneously, approaching the camera; their CENTRES stay exactly abreast — **each body carries a centre marker (axle dot + vertical tick), and the tie is judged on the CoM track coordinate** (P1-8): both cross the finish line's centre-height cue in the SAME frame, both chips stamp "TIE". **The small sphere visibly spins 3× faster** (ω = v/R at equal v — per-body radius drives spin, (b)-9), making "equivalent except in size" literally visible. Both k chips read 0.40; μ_s = 0.50. The m₂/R₂ sliders are the Rule-31 extra — a re-drag re-runs and it still ties | "Mass and radius cancel" | m₂, R₂ | 35–50 | core |
| S5 | WHY: the energy split | `cycle-compare` — **freeze-and-read rhythm, distinct from S1/S4** (P2-3): the payoff frame is a HELD side-by-side comparison at arrival, not a crossing | Solid sphere beside ring, **same 1.00 m drop** (d = 2.366 m at θ = 25°, m = 1 kg, μ_s = 0.50): release → value-only readouts **count up** as they descend, DERIVED live from v and ω (KE_trans = ½mv², KE_rot = ½k·mv² under rolling, zero at release) → at the ring's arrival the scene FREEZES ≈1.5 s with both splits side by side, each pair glowing one at a time: sphere `KE_trans 7.0 J · KE_rot 2.8 J`, ring `4.9 J · 4.9 J`; totals identical (mgh = 9.8 J), splits different; the sphere arrived first with more KE_trans → reset. **NO energy bars — founder decision; SEAM-M readouts only** | "Same energy, different split" | none | 40–55 | extended |
| S6 | a = g sin θ/(1 + I/mR²) | `reveal-build` | One disc HELD at the home pose (v₀ = 0 + release cue — never the `fixed` flag, which collapses lane derivation, (b)-10); arrows mg sin θ, N, f_s draw in sequence; **CoM derivation route (P2-1)**: the surface builds f·R = I_cm·α (the f_s arrow's torque spins the disc) → with α = a/R, f = k·m·a → mg sin θ − f = ma → a = g sin θ/(1+k) — **the drawn f_s arrow is CONSUMED by the derivation, and the route needs no parallel-axis theorem**; then the disc releases and the live a readout matches. The θ slider is the contextual extra | "One formula ranks all" | θ | 45–55 | advanced |
| S7 | The slipping condition | `regime-switch` (coined — restated as a RHYTHM claim, P3-1: nothing → nothing → sudden discontinuity at a threshold. Nearest neighbour it is NOT: `ramp-response` (8 corpus uses), whose beat is PROPORTIONAL tracking of a ramped cause) | Ring rolls at μ_s = 0.50 (μ_k = 0.05); an **AUTHORED `param_ramp`** (`:42295`) drives μ_s **0.50 → 0.05 over 600–1600 ms** — re-derived for the true 6 m plank (P1-3): the old 1000–5000 ms ramp put slip onset AFTER the ring left the track. Slider thumb + label move in lockstep; authored μ_s = `param_ramp.from` = 0.50. The μ_min tick sits on the μ_s row; when the ramp crosses μ_min = 0.233 (**≈1193 ms**, at s ≈ +0.93 after 1.474 m of rolling), the contact readout jumps off zero, the label flips f_s → f_k, a skid trail starts, spin visibly lags; the ring skids the remaining 3.026 m (a = g(sin θ − μ_k cos θ) = 3.698 m/s²), reaching the finish at **≈1968 ms**, then holds the slip picture until reset | "Too little friction: slipping" | μ_s | 35–50 | advanced |
| S8 | Everything, teacher-driven | `drag-sandbox` | Teacher drives the ring-gated set; race re-runs live; finish chips, per-body compact readout rows, contact-speed live. Core-ring content only (38b): v = Rω + k chips; no formula, no KE split. **The μ_min tick is NOT explore content — it is part of the μ_s slider ROW and appears/vanishes with that row per its `min_ring`** (P1-6) | "All controls live" | see min_ring table | 0 / open | explore |

**S8 explore controls with `min_ring`:**

| Control | `min_ring` | Guided state that teaches it |
|---|---|---|
| shape (per lane) | core | S1, S4 |
| m (selected body) | core | S4 |
| R (selected body) | core | S4 |
| θ (10°–40°) | **advanced** | S6 |
| μ_s (0.05–1.00, with its μ_min tick riding the row) | **advanced** | S7 |

*Hide advanced* → shape + m + R (exactly the surviving core lesson) ✓. *Hide advanced+extended* → same set ✓. No control survives whose lesson is hidden.

**Slip envelope over the FULL slider product (P1-6 — the generalisable half of the envelope scar, now computed):** rolling requires μ_s ≥ (k/(1+k))·tan θ. At θ = 25°: sphere 0.133 · disc 0.155 · hollow 0.187 · ring 0.233 — the fleet-wide authored **μ_s = 0.50 clears every shape in every guided state**. Over S8's full ranges the envelope maximum is the ring at 40°: μ_min = **0.420 > the 0.05 slider floor — slip IS reachable in the full-preset sandbox, by design**: (b)-5 implements honest slip physics, and the μ_min tick (recomputed live from the selected shape's k and current θ) **rides the μ_s slider row itself**, so wherever the row is exposed the cue is exposed with it. Under reduced presets the surviving controls (shape/m/R at fixed θ = 25°, μ_s = 0.50) give a worst case of 0.233 < 0.50 — **no reduced preset can reach slip**, so the sandbox never contradicts the core claim with its cue suppressed. This replaces REV 2's blanket "no μ_min in S8".

**Multi-body framing plan (REV 3 rewrite per P1-1/P1-2/P1-5).** Track along world x; lanes along world z (`nlbBodyLaneZ`, `:39998–40001` — today index × the hard constant `NLB_LANE_GAP = 0.85` wu, auto-centred, returns 0 if any body is `fixed`; authorable lane geometry is (b)-10). The camera is `PerspectiveCamera(60,…)` (`:3341`) — the argument below is perspective-aware and the PROOF is the probe, not the geometry:

- **Yaw convention (P1-1, explicit):** ψ ≡ the angle between the horizontal projection of the camera view axis and the track axis (world x). Authored: **ψ = 35°, elevation 22°** (cos ψ = 0.819, sin ψ = 0.574). A lane offset Δz projects to screen-x as **Δz × s × cos ψ** (s = px/m at that depth); a body's screen diameter carries **no** foreshortening; along-track Δx projects as Δx × s × sin ψ and into depth as Δx × cos ψ.
- **Approach direction (P1-2):** +s is UP-slope (`:45093–45096`), so the race runs toward −s. The camera sits on the **down-slope side of the finish**, so bodies **approach** through the whole run: per-body scale and the lane term both GROW as the race proceeds — perspective *aids* the speed-ordered-lane monotonicity argument instead of undermining it. That argument is now the design heuristic; **the proof is the 100 ms-sampled projection probe.**
- **S1 (4 bodies):** authored `lane_gap_m` = 0.8 (z = −1.2, −0.4, +0.4, +1.2), lanes ASSIGNED speed-ordered in the drift direction. Design estimates at a mid-run reference s ≈ 220 px/m (fitting the 6 m run × sin 35° ≈ 757 px plus the 2.4 m lane span × cos 35° ≈ 432 px inside ≈1200 px of a 1280 px canvas): adjacent separation ≈ 0.8 × 220 × 0.819 ≈ **144 px**; body diameter ≈ **66 px**; clearance ≈ 78 px. **These are design estimates, NOT the acceptance criterion — the criterion is disjointness under the projection probe.** **No release stagger** (a stagger would falsify the narrated "released together").
- **S4 (2 bodies, the dead heat):** `lane_gap_m` = 1.2. Separation ≈ **216 px**; projected half-width sum ≈ 88 px; clearance ≈ 128 px. Both bodies hold identical track positions at every t, so their screen separation is the constant lane projection for the entire descent. **Lane offset + camera angle, no time stagger.**
- **S5 (2 bodies):** `lane_gap_m` = 1.2, same treatment; the speed-ordered rule + approach direction keep the gap monotone.
- **S3:** two bodies but SEQUENTIAL — multi-body probe N/A per instant; single-body centre-lane framing.
- **S8:** inherits S1's four-lane camera. **S2/S6/S7:** single body, centre lane; camera closes on the contact point (position + target per state — target authoring is (b)-13).
- **Occlusion gate:** the probe that would catch a framing failure does not exist yet — (b)-12 (`PM_NLB_LANE_OCCLUSION` → `manifest.warnings`) is a **precondition for signing off this plan**.

**Home pose + track geometry (P1-3 — corrected against BOTH declaration and reader, lines quoted):** `length_m` is a **half-length** — declaration `// visible half-length, default 6` (`:941`); readers `halfWorld = lenM * NLB_WORLD_PER_M; slab.scale.set(halfWorld*2,…)` (`:40060–40067`) and `span = (eng.length_m||0)*2` (`:44176`). And **+s is UP-slope** — `nlbGravAlong` returns `−b.m·NLB_G·sin θ` (`:45093–45096`), so released bodies move toward decreasing s. Therefore **`surface.length_m = 3.0`** — ONE value concept-wide (Rule 32d + the `field3d_release_widens_ground_plane_per_state…` row) — rendering a **6.0 m plank spanning s ∈ [−3.0, +3.0]**; θ default 25°. Home pose every state: **`initial_position_m = +2.4`** (0.6 m inset from the +3.0 bound — ≥ 2× the largest body half-width R = 0.30). Finish lines as arithmetic on the home pose, running DOWN-slope: `s_finish = initial_position_m − 4.5 = −2.1` (S1/S4/S7 — 0.9 m inset from −3.0), `s_finish = initial_position_m − 2.366 = +0.034` (S5). All crossings judged on the **CoM track coordinate** (P1-8).

**Loop-reset / frozen-pin timing (RE-DERIVED after the P1-3 fix; θ = 25°, g sin θ = 4.142; a = 2.958/2.761/2.485/2.071 for sphere/disc/hollow/ring; json_author re-verifies at h = 1/60).** S1/S4/S5 event times **re-verified unchanged** — they depend only on run distance d and a, neither touched by the coordinate fix (the finish COORDINATES changed, the displacements did not). S7 is **fully re-derived**: on the true 6 m plank the old ramp's slip onset (3372 ms) fell AFTER the ring's rolling exit (2085 ms) — **the old state was unrenderable.** New: ramp 600–1600 ms crosses μ_min = 0.23315 at t = 600 + 1000×(0.26685/0.45) ≈ **1193 ms**; rolling distance ½·2.071·1.193² = 1.474 m (s ≈ +0.93), v = 2.471 m/s; post-slip a = 9.8(sin 25° − 0.05 cos 25°) = 3.698 m/s²; remaining 3.026 m in 0.775 s → **arrival ≈ 1968 ms**, skid drawn ≈775 ms. **The timing table is valid ONLY on a state-local physics clock — (b)-11 is its precondition.**

| State | R (ms) | Last asserted event | Event time | < 55% R? | Pin 0.60R | Margin |
|---|---|---|---|---|---|---|
| S1 | 6000 | ring crosses finish (d = 4.5) | ≈ 2085 (34.8%) | ✓ | 3600 | ≈ 1515 ms ✓ |
| S4 | 5000 | tie crossing (d = 4.5, a = 2.958) | ≈ 1745 (34.9%) | ✓ | 3000 | ≈ 1255 ms ✓ |
| S5 | 4500 | ring arrives → freeze-and-read hold begins (d = 2.366) | ≈ 1512 (33.6%) | ✓ | 2700 | ≈ 1188 ms ✓ (pin photographs the held split) |
| S7 | 4000 | slip onset ≈ 1193 (29.8%); arrival + hold ≈ 1968 (49.2%) | both < 55% | ✓ | 2400 | ≈ 432 ms past arrival ✓ (pin photographs the held slip picture) |

**Rule 32 legibility:** cause before effect everywhere (S1/S4 release → separation; S6 θ slider → arrows re-resolve → a updates after a beat; S7 ramp falls → μ_min tick crossed → THEN slip). Only the taught variable moves per state. Same apparatus persists from the home pose across all 8 states — bodies swap by show/hide of a union-built set with **distinct body ids per role** (the S3 block is `nlb_block`, never a reused disc id; any build-time-consumed flag such as `rotation_locked` is constant per id). Exactly ONE glow focal per instant (S2 rim point · S3 contact readout · S4 k chips · S5 the compared KE pair, one body at a time during the hold · S6 the formula term · S7 the friction label) — every target names a primitive the state builds.

## 4. Misconception confrontation plan (Rule 16a — 2 genuine pivots)

| Wrong belief | Source | At | `misconception_watch` beat |
|---|---|---|---|
| "Rolling friction is kinetic friction" | RM-G7 | STATE_3 | `belief`: the contact scrubs like a sliding block. `visual_counter`: the skidding locked block (f_k + skid trail) shown FIRST and ALONE, dissolving before the rolling disc assembles — wrong expectation, then real physics, back-to-back in motion. `one_line_fix`: the contact point is instantaneously at rest, so the friction is static; kinetic appears only when the body slips (S7 closes the loop). **Named primitives:** `rotation_locked` flag + skid-trail primitive + f_k label — all in the build sheet |
| "The heavier (or bigger) body wins" | PER + catalog | STATE_4 | `belief`: 5 kg beats 0.5 kg downhill. `visual_counter`: both centre markers stay exactly abreast for the full descent — a dead tie stamped "TIE", re-runnable at any m₂/R₂. `one_line_fix` (**ring-safe, P2-2 — no formula in a core state**): "doubling the mass doubles both the pull down the slope and the resistance to speeding up, so the motion is unchanged — only the shape factor k survives." (The formula appears first in S6, advanced.) |

No other state carries a `misconception_watch`. EPIC-C branches: ZERO.

## 5. `has_prebuilt_deep_dive` states

- **STATE_4** — the PRIMARY aha and the stickiest point ("surely mass matters" survives one viewing).
- **STATE_6** — the derivation; also the right home for the ALTERNATIVE contact-point route, which uses the parallel-axis theorem the main state now avoids.

All others un-flagged (Rule 18).

## 6. Drill-down clusters

**STATE_4:** `why_mass_cancels` · `shape_factor_table` · `same_shape_always_ties`.
**STATE_6:** `torque_about_contact_point` (the alternative route; needs I_contact = (1+k)mR² — parallel-axis introduced HERE, in the deep-dive, not the main state) · `why_one_plus_k` · `rolling_vs_frictionless_slider`.

## 7. `entry_state_map`

```
entry_state_map:
  foundational: STATE_1 → STATE_4
  energy:       STATE_5
  derivation:   STATE_6 → STATE_7
```
Default `foundational`. Cross-slice pill: "See WHY the sphere wins? (energy)" → STATE_5. PRIMARY aha (S4) inside foundational ✓.

## 8. Prerequisites (advisory, Rule 23)

`pure_rolling` (#11, same 0c-2 build — S2 is its compact recap) · `moment_of_inertia` (#6 — S4's cliff) · `tau_eq_i_alpha` (#7 — S6's cliff; f·R = I_cm·α is its rotational-second-law form, and **the parallel-axis theorem is NOT needed on the main path**, P2-1) · `friction_force` (SHIPPED, same scenario — static/kinetic vocabulary for S3/S7) · `rotational_work_energy` (#8 — advisory only for S5).

Namespace check: `rolling_on_incline` collides with no rostered physics or chemistry id.

## 9. Real-world anchor (Rule 35 / 38f — universal, culture-neutral)

**Primary (assigned to STATE_1, ≤ 12 words inside its 40–50 budget):** the closing sentence of S1's narration — *"Try it at home: a food can beats a roll of tape."* A can and a ring-shaped tape roll on a tilted board reproduce the race in any kitchen or classroom on Earth; physics-true at every depth (the tape roll genuinely has k ≈ 1); no brand, place, or culture. Placement pre-spoils nothing: S1's visual already shows the outcome. **Secondary (available to physics_author for S8's opening caption only):** a bicycle wheel on a sloped path — the widest-syllabus-overlap rolling device (38f). Why it hooks: checkable at home in thirty seconds, and it contradicts the "heavier wins" instinct immediately — the hook and the misconception kill are the same object. (The catalog's 12 anchors are ALL India-specific — none imported.)

**DC Pandey check:** chapter table of contents only. No teaching sequence, example, figure or phrasing imported. NCERT: rolling motion is §7.14 (taught via the energy route — which is why the energy explanation is ringed extended, not dropped).

## 10. Definition of Done (Gate 0 — no TBDs)

**(a) States:** the 8 of §2, exactly as tabled in §3, including the framing plan, corrected home-pose geometry, and re-derived timing table.

**(b) Symbol-label table:**

| Quantity | On-canvas label |
|---|---|
| Incline angle | θ ("Incline θ") |
| Body velocity (CoM) | v |
| Angular velocity | ω |
| Radius (authored per body, (b)-9) | R (and R₂ on S4's row) |
| Rolling constraint readout | v = Rω (`v 2.40 m/s · Rω 2.40 m/s`) |
| Contact-point speed | `contact 0.00 m/s` (metric: \|v − ωR\|) |
| Shape factor chip | k = I/mR² → `k 0.40` `k 0.50` `k 0.67` `k 1.00` |
| Centre marker (P1-8) | axle dot + short vertical tick per raced body; finish line carries a centre-height cue |
| Weight component | mg sin θ · Normal force N · friction f_s / f_k |
| Acceleration readout | a (m/s²) |
| Formula surface (S6 only) | builds f·R = I_cm·α → f = k·m·a → a = g sin θ/(1 + I/mR²) — on `#nlb_formula` (Cambria Math, `:41746`), never the generic overlay; **verified in pixels at the LONGEST line against the 340 px max-width** ((b)-14) |
| Slip threshold | μ_min tick on the μ_s row, recomputed live from shape k and θ |
| Energy readouts (S5 only) | `KE_trans 7.0 J · KE_rot 2.8 J` (value-only, DERIVED; they **count up** — never fill, no bar) |
| Masses | m₁, m₂ · Friction slider μ_s |
| Finish chips | `1` `2` `3` `4` and `TIE` — stamped on CoM crossing |

All Unicode across all three text paths (Rule 34c).

**(b′) Term-introduction ledger:**

| Symbol/term | DEFINED in | First USED in | ✓ |
|---|---|---|---|
| finish chips, centre markers | S1 | S1 | ✓ |
| v, ω, R, v = Rω | S2 | S2 | ✓ |
| contact-speed readout | S2 | S2 (re-used S3/S7) | ✓ |
| f_k, f_s, skid trail | S3 (S1 narration stays friction-neutral) | S3 | ✓ |
| k chip | S4 | S4 (re-used S6/S8) | ✓ — **k chips MUST NOT render in S1–S3** |
| KE_trans, KE_rot | S5 | S5 | ✓ |
| mg sin θ, N, a, the formula | S6 | S6 | ✓ |
| μ_s, μ_min tick, TIE chip | S7 / S7 / S4 | S7 / S7 + S8-full-preset / S4 | ✓ |

**(c) Right-hand-rule plan:** N/A — no direction rule taught here (ω/L vectors belong to `angular_momentum`, 0c-1). Declared deliberately.

**(d) Motion plan:** per the §3 table; nothing static, nothing asserted-but-not-rendered (S3's skid trail and S7's spin-lag are drawn). Spin is driven by position via the extended SEAM-G mechanism **divided by the body's OWN authored radius** (ω = v/R — (b)-9; S4's 3× difference is a taught picture) and honours the slip state. Every archetype is discharged by the AUTHORED beat with zero teacher input (S4 the tie run; S5 the count-up + freeze-and-read hold; S6 the build + release + match; S7 the `param_ramp`); sliders are Rule-31 extras only.

**(e) Modes:** the nlb `mode` enum is closed — 0c-2 adds `rolling_race`, `rolling_contact`, `rolling_friction_contrast`, `rolling_energy_split`, `rolling_derive`, `rolling_slip`, reusing `sandbox`.

**(f)** `assessment` + `coverage_map` span race order (S1), constraint (S2), friction type (S3), cancellation (S4), speed ratio (S5/S6), slip threshold (S7); `misconception_watch` = exactly the two beats of §4.

**(g) Macro↔micro (Rule 33):** strict lattice/carrier structure N/A — the mechanism is contact-scale. The 33d instrument duty is met: every instrument shows a live numeric value tracking the motion; no decorative dials. Every derived readout specified by METRIC, not values: contact speed = |v − ωR|; KE_trans = ½mv², KE_rot = ½k·mv² (rolling), zero-baselined at release; a = the integrator's own acceleration. The numbers in this document are the CHECK values those metrics must reproduce, never authored display strings.

**(h) Canvas budget (Rule 34):** ONE formula surface max per state (S2 `v = Rω`; S5 none; S6 the acceleration formula; S7 the μ_min inequality; S1/S3/S4/S8 none); on-canvas caption = the ≤5-word cue only; prose in the strip below; HUD value-only; every NEW top-anchored panel at `top:52px+` on BOTH edges. **S8 readout load bounded by design:** one compact chip row per body (`k 0.40 · v 2.40 · Rω 2.40 · contact 0.00`) — 4 rows + finish chips, with the readout zone sized off ACTUAL rendered neighbour height ((b)-14).

**(i) Curriculum-flex (Rule 38):**
- **(i-1) Preset-cut coherence over states AND controls:** *Hide advanced (S1–S5 + S8):* phenomenon → constraint → friction type → cancellation → energy explanation → sandbox (shape/m/R). No surviving narration references the formula or slip condition (S4's `one_line_fix` is now the ring-safe cancellation sentence of §4). *Hide advanced+extended (S1–S4 + S8):* a complete qualitative lesson. Both cuts verified against every §3 caption, control, the min_ring column, and the slip envelope (no reduced preset can reach slip).
- **(i-2)** S8 surfaces CORE content only: v = Rω, contact-speed, finish chips, k chips, centre markers. No formula surface exists in explore at all, so no explore relation needs a deriving state under any preset; the one explore relation, v = Rω, is derived in core S2. **The μ_min tick is control-row furniture, not explore content: it belongs to the advanced μ_s row and is ring-gated WITH it.**
- **(i-3) `curriculum_tags` (claims, not facts):** CBSE/NCERT core+extended = §7.14 — **verified at authoring**; advanced S6 + S7 = JEE Main/Advanced — verified against the DCP index. AP Physics C full · AP Physics 1 core+extended · IB DP core+extended · A-level core only — every one `needs_teacher_verification`.
- **(i-4) Presets:** `full` = S1–S8; `mainstream` = hide S6–S7 (sandbox loses θ, μ_s + the tick); `qualitative` = hide S5–S7.
- **(i-5) Graph axes:** no graph panel — N/A, declared.
- **Notation ladder (38c):** core/extended surfaces algebra-free or single-relation; the only compound formula sits in advanced. **Dialect (38d):** "incline (ramp)" once, then bare.

**(j) Teacher-walk answers:** (1) *States and shows the named thing in the assessed representation?* Yes — S6 states the closed form and shows the live a matching it; S5 shows the NCERT/AP energy route; S4 states the governing claim. (2) *First thing a teacher tries, demonstrable in range?* Re-run S4 at the extremes — m₂ ∈ [0.2, 10] kg, R₂ ∈ [0.05, 0.40] m all tie (and the spin contrast grows with the R gap); then S8 pit a marble against a huge ring. (3) *Term ledger:* table (b′). Declared omissions re-examined: the constraint's full treatment is deferred to `pure_rolling` by roster design (S2 recaps on screen), rotational KE to `rotational_work_energy` (S5 still shows the split live) — decisions, not exemptions.

---

## Two-pass cognitive lens

### Block 1 — Pass-1 strategic checklist

1. **Prerequisite cliff.** `pure_rolling` → **S2**: patch is S2 itself (one compact sentence while the cycloid shows it). `moment_of_inertia` → **S4** (the k chips): "k measures how far the mass sits from the axis — a ring's mass is all at the rim, so k = 1." `tau_eq_i_alpha` → **S6**: "torque divided by rotational inertia gives angular acceleration, the rotational form of F = ma" — now the ONLY imported rotational tool, since the CoM route needs no parallel-axis theorem, so no second patch sentence is required. `friction_force` (shipped) → S3's skidding-block half IS the patch.
2. **JEE-backwards trace.** *"A solid sphere and a ring, same m and R, roll without slipping from rest down an incline of height h. (i) Ratio of their speeds at the bottom; (ii) the minimum μ_s for the ring to roll at angle θ."* Constraint v = Rω → S2; KE split with equal drops → S5; v = √(2gh/(1+k)) / a = g sin θ/(1+k) → S6; k per shape → S4 + S1; μ_min → S7; friction-is-static (so it does no work, legitimising the energy route) → S3. No missing piece.
3. **Misconception entry mapping.** RM-G7 → S3. *Planting risk:* S1's narration must never say the bodies "rub" or "grip" (also Rule 41) — physics_author flagged to phrase S1 friction-neutrally. Heavier-wins → S4. *Planting risk:* S1 must show four bodies of EQUAL m and R (labels visible on demand) so the race never suggests mass caused the order.

### Block 2 — Aha-moment designation

- **PRIMARY aha, at STATE_4:** "mass and radius cancel: a marble and a bowling ball tie, because only the SHAPE — the dimensionless k = I/mR² — decides who wins."
- **SUPPORTING aha, at STATE_3:** "the contact point is at rest, so rolling friction is STATIC friction" — the mechanism behind the primary (static friction converts shape into rank, and it legitimises S5's equal-energy argument since it does no work).
- **Wrong-belief setup:** primary — S1 builds "the order must come from some property of the bodies" and instinct supplies "heavier/bigger"; S2 quietly shows m nowhere in v = Rω; S4 breaks it. Supporting — S1's rolling contact plus the everyday word "friction" builds "the wheels rub, so kinetic"; S3 breaks it with the 0.00 readout.
- **Foundational coverage:** S4 ∈ foundational (S1–S4) ✓.

---

## ENGINE REQUIREMENTS (the 0c-2 build sheet)

> **Union-scope limit (P2-5, stated):** the survey named #12 the 0c-2 spec driver, but the union this sheet closes is **one-of-two** — `pure_rolling` (#11) shares the build and has NO skeleton yet, so the union below is complete over THIS concept only. **Recommendation: author #11's skeleton (short — it consumes (b)-3/(b)-4 and little else) BEFORE the 0c-2 surgeon dispatch**, so the success test is measured against a true union. If the founder dispatches on #12 alone, this limit is the recorded reason a second, smaller 0c-2 amendment may follow — the alarm rule firing by design, not by surprise.

### (a) What `newtons_laws_body` ALREADY provides (no work) — lines quoted

1. **Inclined surface** — `surface.theta_deg`; **`length_m` is a HALF-length** (`:941`; readers `:40060–40067`, `:44176`) — authored 3.0 for a 6 m plank; **+s is UP-slope** (`:45093–45096`), races run toward −s.
2. **Bodies with mass / position / velocity** — `bodies[]`, stable IDs, union-built meshes shown/hidden per state. Body iteration loops `bodies.length` (`:39895/:40245/:44663` — F7, downgraded).
3. **Static + kinetic friction** — `mu_s` / `mu_k` per body, `surface.frictionless`.
4. **Rolling wheel mesh + position-driven spin** — SEAM G (`:40045`), **but its divisor is the constant `NLB_WHEEL_R` (`:40053`) and body lift the constant `NLB_BODY_SIZE/2` (`:40015`) — both replaced by per-body radius, (b)-9.**
5. **Force-arrow overlay** — SEAM C — S6's mg sin θ / N / f_s arrows.
6. **Live numeric readouts** — SEAM M — v, Rω, contact-speed, a, k chips, and the S5 KE pair as VALUE-ONLY readouts (SEAM L untouched).
7. **Per-state sliders + guided ramp + drag-seize** — `controls_visible` (`:1340/:41856–:42146`), `param_ramp` (`:42295–:42318`, closed form of t_ms — pin/rewind safe), `trusted_drag_seizes`.
8. **Fixed-step real integrator** (Rule 36, trapezoid position update) — the substrate the rolling branch plugs into; must preserve dt-fold exactness in position AND velocity at 1e-9. **Its clock is NOT yet state-local — see (b)-11 (CRITICAL/OPEN).**
9. **Ghost/fixed body machinery + Cambria formula panel** — `#nlb_formula` (`:41746`); S3's locked block is an ordinary integrated body with `rotation_locked`, distinct id. **Note: `nlbBodyLaneZ` returns 0 for ALL bodies if any body is `fixed` (`:39998–40001`) — S6's held disc is v₀ = 0 + release cue, never `fixed`.**

### (b) What the extension must ADD

*1–8 as in REV 2; 9–15 are NEW in REV 3, forced by Checkpoint A:*

1. **Per-body shape factor k = I/mR²** — authored per body (2/5 · 1/2 · 2/3 · 1), surfaced as a live chip (rendered only from S4 onward).
2. **Rolling acceleration branch** — a = g sin θ/(1 + k) with v = Rω driving ω and mesh spin; f_s = k·mg sin θ/(1+k) so SEAM-C arrows are honest — **the same f = k·m·a the S6 CoM derivation produces on screen (P2-1)**. Fold-exactness preserved.
3. **Contact-point velocity picture** — arrows 0/v/2v + cycloid trace + contact-speed readout. (Shared with #11 — **see the union-scope limit.**) **Trace constraint:** cycloid and skid trails must be REPLAYABLE pure functions of state-local t over a bounded lookback, never latched per-frame state, so pins are byte-stable.
4. **Static-vs-kinetic friction call-out** — f_s / f_k at the contact; regime a closed-form function of state-local t, no latch.
5. **Rolling-vs-slipping regime switch** — when μ_s < k tan θ/(1+k): a = g(sin θ − μ_k cos θ), α from kinetic-friction torque, contact ≠ 0, spin lags, skid trail draws. The **μ_min tick renders ON the μ_s row** (live from shape k and θ) and is ring-gated WITH the row (P1-6); the ramp drives thumb + label in lockstep.
6. **KE_trans / KE_rot** exposed to SEAM-M readouts, derived from the live post-step state in one pass; readouts **count up** (P3-2); **no SEAM-L change, no new bar, ever.**
7. **`rotation_locked` per-body flag + sequential contrast cueing** — S3's wrong-picture primitives, named at design time: the flag (constant per body id, never a per-state build-branch), skid-trail primitive, f_k label, and show/dissolve cues on the scenario_cue channel.
8. **`controls_visible` token enum extension** — the closed enum at `:1340` lacks `'R2'`, `'R'` and the per-lane shape-picker tokens. Extend + build rows via the existing union-over-states builder; empty deferred list.
9. **(NEW — P1-4) Per-body physical radius `radius_m`.** **No such field exists** (grep: zero hits); today lift is the constant `NLB_BODY_SIZE/2` (`:40015`) and spin divides by the constant `NLB_WHEEL_R` (`:40053`, coupled by comment to `NLB_BODY_SIZE`). `radius_m` must drive: mesh scale, contact-height lift (centre at `radius_m` above the surface), spin ω = v/radius_m (S4's small sphere spins 3× faster — a taught picture), and live re-lift + re-scale under an `R`/`R2` drag. **Rule-29 ruling, stated for the surgeon:** the `NLB_BODY_SIZE` comment ("size is never a magnitude cue") is scoped to MASS-independence and stands; here R is a REAL physical magnitude the concept teaches, so a size change with R is Rule-29-legal under the same clause that lets a vector's length change. **Do not stop at the comment.**
10. **(NEW — P1-5) Authorable lane geometry** — per-state `lane_gap_m` (S1 0.8; S4/S5 1.2) + explicit per-body lane ASSIGNMENT (speed-ordered); today lane z = index × the hard `NLB_LANE_GAP = 0.85` wu (`:39998–40001`), auto-centred, zeroed if any body is `fixed`. **Slab depth sized ONCE per concept from the widest lane span:** S1's span = 2.4 + 2×0.15 = 2.7 m ≤ default `NLB_SURFACE_DEPTH` 1.6 wu = 3.2 m — verified sufficient with ≥ 0.25 m margin per side; sized once, never per state.
11. **(NEW — P1-7, CRITICAL) State-local physics clock rebase** — per `field3d_nlb_physics_clock_not_state_local`: the nlb integrator must rebase on RESET_TRAJECTORY / state-local (t − stateStartTime), or hold dt = 0 from SET_STATE until first RESET_TRAJECTORY/Play. **Precondition for the entire timing table, all pin margins, the S7 crossing, and the literal truth of "released together".**
12. **(NEW — P1-7) `PM_NLB_LANE_OCCLUSION` renderer warning** — emitted whenever two non-ghost body screen bboxes intersect, surfaced in `manifest.warnings` — **the gate that makes the framing plan verifiable; a precondition for signing off S1/S4/S5.**
13. **(NEW — P2-4) Camera position AND TARGET authoring per state** — position is authorable, the **target is not** (`field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable`, MAJOR/OPEN), and S2/S6/S7's "camera closes on the contact point" is exactly a target change. Reconcile with that row's second DO: reference surfaces sized ONCE ((b)-10) so the apparatus never resizes between states. Surgeon's solve sweeps BOTH yaw and elevation with feasible-band reporting.
14. **(NEW — P1-7 residue) Overlay verifications in pixels, at this concept's extremes:** `#nlb_formula` (340 px max-width) at S6's LONGEST built line; θ-arc (fixed world R = 1.05, `:40074`) clamped to nearest-body screen distance or drawn behind with a leader, checked against S8's outer lane; screen-space label de-collision under EVERY authored camera incl. rotated (five of eight states); readout zone sized off ACTUAL rendered neighbour height at S8's 4-row + chips load.
15. **(NEW — P1-8) Centre markers + CoM crossing metric** — axle dot + vertical tick per raced body; finish-line centre-height cue; all finish/TIE stamps defined on the CoM track coordinate crossing `s_finish`.

### Phase-0 union WALK (state × row, both directions)

| State | Rows consumed |
|---|---|
| S1 | (a)1,2,3 · (b)1,2,9,10,11,12,13,15 · F8 · F7 · F9 · F10 |
| S2 | (a)1,2,4 · (b)2,3,9,11,13 · F10 |
| S3 | (a)1,2,3,9 · (b)3,4,7,11 · F10 |
| S4 | (a)1,2,7 · (b)1,2,8,9,10,11,12,13,15 · F8 · F9 · F10 |
| S5 | (a)1,2 · (b)1,2,6,9,10,11,12,13 · F9 · F10 |
| S6 | (a)1,2,5,7,9 · (b)1,2,9,11,13,14 · F10 |
| S7 | (a)1,2,3,7 · (b)3,4,5,9,11,13,14 · F11 · F10 |
| S8 | (a)1,2,3,7 · (b)1,2,3,5,8,9,10,12,14 · F7,F8,F9,F15 · F10 |

Reverse: every row (a)1–9, (b)1–15, F7–F11 claimed by ≥1 state; every state claims ≥1 row. Both directions closed.

### ⚠ FINDINGS not explicit in the survey's union table

7. **Body count > 2 — DOWNGRADED (code-verified).** Every body path loops `bodies.length`; the only `slice(0,2)` caps are the unused energy panel. **Residual widened per Checkpoint A ruling 3:** correct the stale "1 or 2 bodies" comment; VERIFY HUD/label layout at 4 bodies; plus lane-geometry authoring (b)-10 and the occlusion warning (b)-12 — the parts of the 4-body picture that ARE real work.
8. **Four new rolling-shape meshes** — `shape` enum `'solid_sphere' | 'disc' | 'hollow_sphere' | 'ring'`, scaled by (b)-9's `radius_m`. **Design-time resolution of the reviewer's caveat (ruling 3): at R = 0.15 m each body is ~5% of track length, so hollowness cannot be carried by interior detail — distinctness comes from SILHOUETTE + COLOUR (ring = open annulus; hollow sphere = shell-cutaway silhouette + its own colour), with a stated minimum on-screen diameter of ≈ 60 px at the reference scale (0.30 m × 220 px/m — met at the design camera).** Decided here, not left to the surgeon.
9. **Finish-order chips + start/finish lines + TIE stamp** — finish as a track coordinate on the home pose, per-body chips, TIE stamp, **all stamped on CoM crossing with centre markers (b)-15**. New top-anchored panels at `top:52px+` both edges.
10. **New `mode` values + deriveStateMeta co-edit** — all three sites (`F3D_REVEAL_KEYS` + `maxRevealForField3dState` + `deriveHoldExpectations`), proven against both config shapes.
11. **Slip-threshold indicator** — the μ_min tick as slider-row furniture, live-recomputed — (b)-5 and the envelope paragraph.
12. **`controls_visible` token enum extension** — (b)-8 (declaration `:1340` and reader `:42146` quoted).
13. **Multi-body race camera authoring — position AND target** — (b)-13; speed-ordered lane assignment as authorable state data; verified by the projection probe + (b)-12.
14. **Registration duty for json_author** — inserts `concept_panel_config` (default_panel_count=1) in the SAME session, and declares motion consistently in `epic_l_path` AND `field_3d_config`.

Nothing else. No energy bars, no zoom inset, no graph panel, no RHR hand. If Checkpoint A or the surgeon finds any FURTHER capability needed, that is the alarm rule firing — STOP and re-scope with the survey.

---

## SCAR AUDIT (queries stated first)

**Queries run this cycle (2026-08-02, all read-only):**

1. `query_engine_bug_queue.ts rolling_on_incline` → 0 rows (new id).
2. `… --owner alex:architect` → **32 rows**.
3. `… --row-type directive` → **47 rows**.
4. `… --field3d --open` → **30 rows** — note: **the script's `FIELD3D` list predates the nlb fleet, so this query CANNOT reach nlb-scenario rows. REV 2 relied on it, which is HOW the seven rows were skipped.**
5. `… friction_force` → 3 rows; `… normal_force` → 3 rows; `… newtons_laws_body` → 0 rows (scenario names are not concept ids — confirming the gap).
6. **Direct read-only SELECT** on `engine_bug_queue` by `bug_class` for the seven rows Checkpoint A named + the camera-target and ground-plane rows — **all returned**; their `prevention_rule` texts are applied below and in the build sheet.

A row I did not query is not dispositioned; every disposition traces to one of these six queries.

**The seven previously-skipped rows — now queried and dispositioned:**

| bug_class | Verdict |
|---|---|
| `field3d_nlb_physics_clock_not_state_local` (CRITICAL/OPEN) | **build-item precondition** — (b)-11 per the row's DO. The timing table, all pin margins, the S7 crossing and "released together" are CONDITIONAL on it |
| `the_eye_passes_a_frame_in_which_one_compared_body_is_hidden_behind_another` (MAJOR/OPEN) | **build-item precondition** — (b)-12, exactly per the DO; named in §3 as the gate for the framing plan |
| `nlb_camera_rotated_body_label_bleed_through_slider_panel` (MODERATE/OPEN) | **satisfied via (b)-14** — screen-space label dodge verified under every authored camera, rotated included |
| `nlb_angle_arc_radius_overruns_the_neighbouring_lane_body` (MAJOR/OPEN) | **satisfied via (b)-14** — θ-arc clamped to nearest-body screen distance or drawn behind with a leader; checked against S8's outer lane |
| `nlb_formula_and_readout_zones_are_fixed_css_and_collide_with_a_tall_hud` (MODERATE/OPEN) | **satisfied via DoD (h) + (b)-14** — S8's load bounded by design; zone sized off actual rendered neighbour height |
| `field3d_edge_anchored_formula_surface_wraps_back_over_the_apparatus…` (MODERATE/OPEN) | **satisfied via (b)-14** — verified in pixels at S6's LONGEST built line against 340 px |
| `field3d_world_space_label_decollision_is_projection_blind…` (MODERATE/OPEN) | **satisfied** — (b)-14 asserts pairwise screen-space gaps under every camera; the row's corollary now JUSTIFIES S6's near-side-on close-up explicitly, and confirms per-state `camera_position` is authorable — de-risking half of (b)-13 |

**Rows underpinning the P1 fixes (queried via #6):**

| bug_class | Verdict |
|---|---|
| `field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable` (MAJOR/OPEN) | **build-item** — (b)-13 names the TARGET as the missing surface; its second DO ("sized ONCE") applied to slab depth in (b)-10 |
| `field3d_release_widens_ground_plane_per_state_causing_unnarrated_apparatus_jump` (MODERATE/OPEN) | **fixed-in-this-revision** — ONE `length_m = 3.0` concept-wide; slab depth sized once from the widest lane span |

**Corrected verdicts this cycle:**

| bug_class | REV 3 verdict |
|---|---|
| `nlb_checkpoint_s_m_authored_as_displacement_not_track_coordinate` | **NOW genuinely fixed** — REV 2 claimed this while authoring an up-slope race on a mis-modelled track. REV 3: finish lines are track coordinates on the corrected model: `s_finish = 2.4 − 4.5 = −2.1` / `2.4 − 2.366 = +0.034`; insets 0.6 m and 0.9 m real against the ±3.0 bounds |
| `architect_declares_an_engine_limit_without_checking_the_per_concept_override_path` | **NOW genuinely satisfied** — previously quote-free claims are quoted BOTH sides: `length_m` `:941` + `:40060–40067`/`:44176`; gravity `:45093–45096`; lane `:39998–40001`; lift `:40015`; spin `:40053`; camera `:3341`; arc `:40074` |
| `nlb_multibody_lane_gap…` | **fixed with projection honesty** — separations recomputed as `lane_gap × s × cos ψ` with ψ and s stated; acceptance = probe disjointness; approach-the-camera closes the perspective gap; occlusion warning is the gate |
| `nlb_static_state_authored_on_the_track_bound…` | **fixed on the corrected bounds** — 0.6 m inset from +3.0 = 2× largest half-width |
| `nlb_loop_reset_clears_checkpoint_stamp…` / `nlb_frozen_pin_lands_within_one_frame…` | **re-derived** — S1/S4/S5 unchanged (d, a untouched); **S7 rebuilt** (ramp 600–1600, onset 1193 ms = 29.8%, arrival 1968 ms = 49.2%; pin 2400; margins 432–1515 ms) — CONDITIONAL on (b)-11 |
| `explore_controls_not_ring_gated_survive_the_ring_cut` | **fixed + envelope closed** — min_ring table stands; NEW: envelope over the full (θ, μ_s) product (max 0.420, ring @ 40°); full preset reaches slip WITH its cue; no reduced preset can reach slip |
| `teach_visual_must_match_narration` | **strengthened** — S4's tie judged and DRAWN on centres; the 3× spin contrast rendered; "released together" true on a state-local clock |
| `archetype_live_tier_unverified_against_renderer` | **extended** — the three constants standing in for radius and the lane constant verified as NOT providing what S1/S4 need → (b)-9/(b)-10, with file:line |

All other REV 2 rows (`teach_do_not_prespoil`, `contrast_ghost`, `symbol_printed…`, `derived_readout…`, `phase0_union_table…` (WALK re-run over (b)1–15), `field3d_param_ramp_authoring_contract`, `ghost_compare_cause_invisible_slider_frozen`, `hysteretic_state…`, `spec_semi_implicit_euler…`, `derivestatemeta…`, `deferred_enum_members`, `chemistry_concept_id_collides`, the N/A-with-reason set, and the routed physics_author/visual_validator directives): **verdicts unchanged**, re-checked against the corrected geometry this cycle.

---

## FIX-CYCLE-1 RESPONSE (finding × what changed × where)

| Finding | What changed | Where |
|---|---|---|
| **P1-1** | ψ convention defined (camera view axis vs track axis, ψ = 35°); separations recomputed as `lane_gap × s × cos ψ` with s ≈ 220 px/m stated; px figures demoted to design estimates; acceptance = disjointness under the 100 ms probe | §3 framing plan |
| **P1-2** | Race authored APPROACHING the camera; perspective now aids monotonicity; probe named as the proof, geometry argument demoted to heuristic | §3 framing plan; S1/S4 |
| **P1-3** | Track model corrected both sides with line numbers: `length_m` = half-length → authored **3.0** (6 m plank, s ∈ [−3,+3]); +s = up-slope → race toward −s; `initial_position_m = +2.4`; `s_finish = −2.1` / `+0.034`; one `length_m` concept-wide; dependent numbers re-derived | §3 home-pose + timing table; scar audit |
| **P1-3 knock-on** | S7's old ramp was **unrenderable** on the true plank (onset 3372 ms > rolling exit 2085 ms): re-authored 600–1600 ms → onset ≈ 1193 ms, skid ≈ 775 ms visible, arrival ≈ 1968 ms, R = 4000, pin 2400 | §3 S7 + timing table |
| **P1-4** | Per-body `radius_m` added (b)-9 (mesh scale, contact lift replacing `:40015`, spin ω = v/R replacing `:40053`, live re-lift); explicit Rule-29 ruling for the surgeon; S4 now RENDERS the 3× spin contrast | (b)-9, (a)-4; §3 S4; DoD (b)/(d) |
| **P1-5** | Authorable `lane_gap_m` + lane assignment (b)-10; slab depth sized ONCE (2.7 m ≤ 3.2 m — verified); `fixed`-body early-out flagged (S6 = v₀ = 0 + release cue) | (b)-10, (a)-9; §3; S6 |
| **P1-6** | μ_s authored per state; per-shape μ_min at 25°; envelope over the FULL product (max 0.420); μ_min tick ring-gated WITH the μ_s row + honest slip physics; reduced presets provably slip-free; (i-2) reworded | §3 envelope + min_ring + S8; DoD (i-2); (b)-5 |
| **P1-7** | SCAR AUDIT rebuilt with six queries STATED (incl. the direct SELECT the script cannot replace — **root cause named**); all seven skipped rows queried and dispositioned; the CRITICAL clock row became (b)-11 and the timing table is declared conditional on it; occlusion warning (b)-12; overlay verifications (b)-14 | SCAR AUDIT; (b)-11/12/14 |
| **P1-8** | Centre markers on raced bodies; TIE/finish crossing on the CoM coordinate; finish-line centre-height cue; (b)-15 | §3 S1/S4; DoD (b); (b)-15, F9 |
| **P2-1** | S6 switched to the CoM route (f·R = I_cm·α → f = k·m·a → a = g sin θ/(1+k)) — no parallel-axis theorem, f_s arrow consumed, produces (b)-2's f_s; contact-point route moved to the S6 deep-dive; Block-1 cliff updated | §2/§3 S6; §6; Block 1 |
| **P2-2** | §4's `one_line_fix` rewritten ring-safe (no formula); the formula's first appearance pinned to S6 | §4; DoD (i-1) |
| **P2-3** | S5 given a distinct rhythm: count-up during descent → FREEZE-AND-READ hold (~1.5 s) at arrival with the splits side by side — the payoff frame is the held comparison, not a crossing | §3 S5; timing table |
| **P2-4** | (b)-13 names the camera TARGET as the missing surface; sized-ONCE reconciliation applied to slab depth | (b)-13/(b)-10 |
| **P2-5** | 0c-2 union declared one-of-two; recommendation to author #11's skeleton before the surgeon dispatch, with the fallback consequence stated | ENGINE REQ preamble; header |
| **P3-1** | `regime-switch` re-justified as a RHYTHM claim, naming `ramp-response` as the nearest neighbour it is not | §3 S7 |
| **P3-2** | "fill" → "count up" | §3 S5; (b)-6; DoD (b) |
| Ruling 3 (F8 caveat) | Hollow-vs-solid distinctness resolved at design time: silhouette + colour, minimum ≈ 60 px on-screen diameter | FINDINGS F8 |
| Praised items | No-stagger decision, F7 downgrade, S5 geometry (d = 2.366 m, 7.0/2.8 vs 4.9/4.9 J), min_ring structure, term ledger, all nine line citations — **all preserved unchanged** | throughout |
