# eye-walker — `conservative_vs_nonconservative_forces` (concept #5) — 2026-08-07

Run: `.visual_runs/conservative_vs_nonconservative_forces/20260807-175955/` (5 states, 118 frames).

## The gate reproduces — and 26% of it is skips

`23 checks · 23 passed · 0 failed` reproduces from `manifest.json.check_summary`.
**But 6 of the 23 are skips, not proofs:** `D5` × 5 (*"motion expectation unknown"*, one per state) and
`H2` × 1 (*"no approved baseline"*). **Substantive passes = 17** (D6×5 teleport, D7×5 stuck-tail, H1×5
template-leak, H3×1 console, D1p×1 timeseries).

Pixel-level checks passed cleanly while eyes-on inspection found real defects — the sibling-concept
pattern, a fourth time.

---

## FINDINGS

### CRITICAL — S2's two checkpoint labels render illegibly interleaved, including in the H2 pin
S2 authors two checkpoints (`"the flag"` ~0.2 m from start, and `"the start"`) close enough in world
space that their italic pink labels render **fully interleaved and illegible at every sampled frame**,
including the frozen baseline that would become the approved reference image. S4's two flags (0.6 m
apart) stay legible by comparison — so the fix pattern already exists in this concept.

This lands on the PRIMARY aha state.

### MAJOR — friction arrow measured at 1.04:1 contrast
Measured fill `RGB(29,12,18)` against canvas `RGB(10,10,26)` = **1.04:1** (WCAG graphics floor is 3:1);
against the incline slab `RGB(102,123,134)` = 4.26:1, still marginal. **Same defect class as the 1.07:1
friction arrow reported on concept #3** — likely the same unfixed colour constant recurring fleet-wide,
not a new instance. Lands on S3, the state whose entire job is "watch this arrow".

### MAJOR — checkpoint flag posts occlude the tracked body
Flag-post meshes are `MeshBasicMaterial` with `depthTest:false`, so they render **in front of** the body
and any co-located label whenever the body is near the checkpoint. Confirmed S1 t=0/t=11000, S2 every
sampled frame including the H2 pin, S3 frozen pin, S4 t=2000/frozen.

### MAJOR — S2's stamp renders 5 lines against a 2-line contract
Recurrence of the already-OPEN
`nlb_checkpoint_W_capture_renders_the_work_bar_label_so_the_authored_stamp_string_never_ships`, whose own
probe caps the formula surface at 2 lines. S2's two-accumulator/two-checkpoint stamp renders **5**.

### MODERATE — `f_k` label tiny and detached from its arrow
Renders at a visibly smaller font than sibling labels (`m=5kg`, `mg`, `θ`) and is anchored well away from
the arrow it names, unlike `mg·sinθ` / `mg·cosθ` which sit adjacent to theirs.

### Recurrence confirmed — the closure stamp is thin
`nlb_work_bar_zero_crossing_reading_is_unrenderable_at_teaching_speed`: S1's closure stamp appears in
**1 of 22** dense frames (1 s cadence). Consistent with the design's own declared ~207 ms per ~1700 ms
cycle. The claim holds, but Checkpoint A's CF-2 lever (R 1700 → 2050 for 2.7× dwell) is now evidenced,
not hypothetical.

### MODERATE — canvas composition
Apparatus occupies roughly the central-left third of a mostly empty 1280×720 frame, across all five
states. Same pattern flagged on the sibling. A founder framing call, not a hard defect.

---

## What came back CLEAN — stated explicitly, because each was a suspected trap

- **The bar-height trap is NOT present.** Both S2 bars measured pixel-for-pixel: identical zero-reference
  row (y ≈ 186–188) and identical scale (≈1.32 px/J, confirmed at four independent value pairs). No
  0-based-vs-signed mismatch. *(This is the defect that DOES exist on concept #4.)*
- **The narration never claims the bars move "together".** S2's caption says gravity's bar "repeats the
  round trip to zero **while** friction's bar only falls" — it correctly narrates the difference.
- **The S2/S3 withholding works exactly as designed.** S2 genuinely draws no friction arrow; S3 genuinely
  debuts one. S3's distinctness is real, not collapsed — the blocking Checkpoint A finding has not regressed.
- **S3's frozen pin DOES capture its pass-2 stamp**, unlike S1/S2 — so S3 carries its own claim in the still.

---

## Per-state verdict

| state | frozen | motion | delta visible | Rule 24/29 | note |
|---|---|---|---|---|---|
| S1 `gravity_round_trip` | ✓ | ✓ ~1.63 s cycle, verified against g·sinθ kinematics | ✓ | ✓ | closure stamp in 1/22 dense frames |
| S2 `friction_round_trip` (PRIMARY) | ✗ labels illegible in the baseline itself | ✓ | ✓ | ✗ | **two most serious findings land here simultaneously** |
| S3 `friction_flips_direction` | ✓ captures pass-2 stamp | ✓ arrow flips at turnaround t≈6000 ms, v≈0 | ✓ | ✗ | friction arrow 1.04:1; `f_k` label tiny |
| S4 `work_depends_only_on_position` | ✓ both flags legible, offset | ✓ two full passes, −14.7/−29.4 J stable across passes as claimed | ✓ | ✗ | flag-post occlusion; 3 numbers on screen at once |
| S5 `explore` | ✓ | ✓ sliders live | n/a | ✓ | composition |

## Frames for founder eyes

1. `STATE_2__frozen.png` — the PRIMARY-aha baseline pin with illegible overlapping flag labels **baked
   into the reference image**, not just a transient frame.
2. `STATE_2__dense_t05000.png` — the actual closure stamp (gravity 0.0 J vs friction −27.4 J, the whole
   point) rendering as a 5-line block beside the label collision.
3. `STATE_3__dense_t00000.png` — the 1.04:1 friction arrow plus flag-post occlusion, on the state whose
   job is "watch this arrow".
4. `STATE_1__dense_t11000.png` — the only dense frame of 22 that caught the gravity closure stamp.
5. `STATE_5__dense_t05000.png` — representative of the empty-canvas composition, for a founder framing call.

## Not filed — insufficient evidence from frames alone
`nlb_static_state_authored_on_the_track_bound_fires_a_false_clamp_alarm` needs `surface.length_m` against
`initial_position_m = −3.6`, not recoverable from pixels. H3 shows zero `console.error`, but that scar's
probe watches `[PM_NLB_ENERGY_CLAMP]`, which logs at warn level — check the manifest's
`diagnostic_warnings` channel directly rather than inferring. *(Dispatching session: checked —
`diagnostic_warnings: []`, so no clamp fired.)*
