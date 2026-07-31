# EYE_WALKER REPORT — free_body_diagram (CYCLE 1, post-fix re-walk)
Run: `.visual_runs/free_body_diagram/20260725-194052/` (6 states) - engine_bug_queue: no matching OPEN/DEFERRED rows for free_body_diagram (field3d) at time of walk.

## 1. Deterministic gate summary (verbatim)
27 deterministic checks - 27 passed - 0 failed - $0.00 - (founder-supplied; pixel/motion judgment below is what those gates cannot see.)

## 2. Per-state verdict table

| state | reveal (frozen) | motion (dense) | delta visible? | Rule 24/29 | note |
|---|---|---|---|---|---|
| S1 fbd_isolate | OK G1/G2 dimmed ~0.40, no arrows on ghosts, mg on A, A glows brighter | OK (settled by t=0, non-finding class) | OK "One body at a time" vs black baseline | OK | none |
| S2 rest_equilibrium | OK N=19.60N=mg, no net-force stub arrow (only text readout) | OK static equilibrium correct | OK "Each contact becomes an arrow" | OK | none |
| S3 coast_no_force | FAIL frozen shows body OFF-CANVAS (scrolled past right frame edge), v=0.00 | FAIL CRITICAL, NOT RESOLVED - v holds 2.00 m/s t0 through t6000, then snaps to 0.00 by t7000 and stays 0 through frozen; the halt bug from cycle 0 recurs verbatim. It is now additionally hidden: the body exits the visible camera frustum by roughly t5000-6000 (well before the halt), so a viewer never sees the parked body - only an empty plank, with the "no forward force needed" text still on screen after v silently reaches 0 | FAIL no clean single delta - motion vanishes off-screen, then physics contradicts its own caption | OK | see Finding 1 (regressed, not fixed) |
| S4 coast_with_friction | FAIL frozen shows body completely OFF-CANVAS; F=5.88N, fk=5.88N, net force=0.00N readouts unchanged, formula F=fk still visible | FAIL NEW finding - body glides smoothly and continuously (no v=0 snap observed; F/fk/net constant throughout, consistent with genuine constant velocity) but scrolls off the right frame edge by roughly t6000-7000 and never returns; the state shows an EMPTY plank for its final 3-4s (30-40 percent of the 10s duration) | FAIL motion present but not visible for the back third of the state | OK | see Finding 2 (new) |
| S5 incline_decompose | OK theta=30 degrees constant, N=16.97N | OK RESOLVED - theta held at 30.00 degrees across every dense frame and frozen; N constant at 16.97N; no oscillation | OK caption reads correctly, no promise of an in-progress tilt, text matches the static physics | OK formula fits cleanly, no wrap or collision with the ramp | Finding 3 (cycle 0) CLOSED |
| S6 sandbox (was S7; tension state deleted) | n/a explore | OK RESOLVED - idle_auto_sweep genuinely oscillates: F/a/v alternate sign continuously across all dense and keyframe samples, body stays fully on-canvas the whole time, no v=0 with nonzero a contradiction observed, frozen differs from last dense frame consistent with Rule 37 continuous free-run | n/a explore | OK | none - old S6 tension gap CONFIRMED CLOSED |

## 3. Verification of the three cycle-0 findings

1. hanging_body_tension_arrow_and_readout_missing - CONFIRMED RESOLVED. Read every contact sheet and every frozen frame across all 6 states: no tension arrow, no T readout, no anchor/cable/pulley geometry anywhere. STATE_6 is now the sandbox (was S7); the arc is a coherent 6-state sequence with no orphan gap where the old S6 sat. Clean removal.

2. idle_auto_sweep_non_monotonic_oscillation_on_guided_state - CONFIRMED RESOLVED. S5 is now a static theta_deg: 30 incline: theta reads exactly 30.00 degrees in all 11 dense frames and the frozen baseline, N holds at 16.97N (matches mg times cos30 for m=2kg), and the on-canvas caption/formula/narration text no longer promises a sweep - it correctly states the settled fact that N is less than mg at 30 degrees. No misconception-counter breakage remains.

3. coast_body_halts_at_platform_edge - NOT RESOLVED, regressed to a worse/hidden form. The fix raised surface.length_m from 6 to 22 on S3/S4, but the renderer's own code comment defines length_m as the visible half-length of the SLAB geometry - it does not appear to move whatever boundary condition zeroes the body's velocity, because S3's v still snaps 2.00 to 0.00 within the state's own 10s window (between t=6000 and t=7000ms), reproducing the identical CRITICAL defect from cycle 0. What DID change: the camera (camera_position unchanged at [0,1.2,8.5] on both S3 and S4) was never widened or pulled back to match the now much-larger slab, so the body scrolls off the visible frame edge (around t5000-6000) before a viewer ever sees it parked. The bug is not fixed, only hidden - and a NEW sibling defect appeared in S4 (see Finding 2) where the body also exits the frame, independent of whether S4's own physics actually halts (no v readout is shown in S4's HUD to confirm either way - only applied force, friction, and net force).

## 4. Candidate engine_bug_queue rows (2 - one reopened, one new)

1. bug_class: coast_body_halts_at_platform_edge (REOPEN - same class as cycle 0, fix incomplete)
   severity: CRITICAL
   owner_cluster: peter_parker:renderer_primitives
   prevention_rule: Raising surface.length_m (documented as the visible half-length of the SLAB mesh) does not by itself move the coast/friction integrator's stopping boundary - S3's v still hard-drops from 2.00 to 0.00 mid-state after the length_m fix. The actual position-clamp/velocity-zero condition for coast_no_force and coast_with_friction needs to be located and tied to the SAME distance the slab now visually spans, or removed if it is not physically motivated (a body coasting under zero net force should never decelerate). Re-verify by watching v (or x) for the ENTIRE state duration, not just the first few seconds, on every future edit to this mode.

2. bug_class: coast_state_camera_not_widened_for_longer_surface
   severity: MAJOR
   owner_cluster: alex:json_author (or peter_parker:renderer_primitives if a per-state camera-follow/auto-frame is the intended engine fix)
   prevention_rule: When surface.length_m is raised to accommodate a body's full travel distance, the state's fixed camera_position must be widened/pulled back (or the camera must track the body) so the body never exits the visible frustum before the state's authored duration ends. Currently S3 and S4 both authored the SAME camera_position unchanged from the pre-fix 6m-slab framing, so on the new 22-half-length slab the body scrolls off-screen by roughly t5000-7000ms of a 10s state, leaving 30-40 percent of the runtime showing an empty plank. Any newtons_laws_body state whose body travels near or past surface.length_m in world units needs its camera distance checked against the authored travel distance as part of authoring.

## 5. Frames for founder eyes (5)
1. .visual_runs/free_body_diagram/20260725-194052/STATE_3__dense_t06000.png - v=2.00 m/s, body already exiting the right frame edge (only a sliver visible) - the moment the off-canvas exit begins, about 1s before the halt.
2. .visual_runs/free_body_diagram/20260725-194052/STATE_3__dense_t07000.png - v=0.00 m/s, body has vanished from frame entirely - the CRITICAL halt bug recurring, now invisible without reading the readout.
3. .visual_runs/free_body_diagram/20260725-194052/STATE_3__frozen.png - the H2 reveal-complete baseline that would get locked in by visual:approve still shows an empty plank and v=0.00.
4. .visual_runs/free_body_diagram/20260725-194052/STATE_4__dense_t10000.png - S4's end-of-state frame: plank completely empty, body long gone off-screen, the F=fk formula still floating with nothing to anchor it to.
5. .visual_runs/free_body_diagram/20260725-194052/STATE_5__frozen.png - for contrast: this is what the S5 fix looks like done right (static 30 degrees, truthful caption) - useful side-by-side against S3/S4's incomplete fix.

## 6. Overall read
FINDINGS (2) - do not auto-approve. S5 and the old-S6 tension removal are genuinely fixed and clean. S3's CRITICAL halt bug is NOT resolved - the length_m edit changed slab geometry, not the physics boundary, and the fix additionally introduced an off-canvas camera-framing regression that now also affects S4 (new MAJOR). Recommend routing back to peter_parker:renderer_primitives for the coast-mode stopping-boundary fix, and either alex:json_author (camera_position widen) or the same engine owner (if camera-follow needs to be a supported feature) for the off-canvas issue, before the next THE EYE pass.
