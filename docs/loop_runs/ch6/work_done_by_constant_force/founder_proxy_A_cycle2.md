# Checkpoint A — cycle 2 (closing pass) · `work_done_by_constant_force`

> founder-proxy, 2026-08-01. Report-only; persisted by the dispatching session. Cycle 2 of 2 — no cycle 3.

# VERDICT: `DESIGN_OK` **with 12 must-fix patches** + 1 engine ride-along

**All 11 cycle-1 findings landed, and every one landed at every site** — each claim in the CYCLE 2
CHANGES table was diffed against the body; no half-applications, no claim marked addressed that
isn't. The document is materially stronger than cycle 1: the arc, the aha placement, the two pivots
and the anchors survived verbatim as intended, and the three P1s were fixed on verified engine facts
rather than re-asserted.

The patches exist because **the fixes opened new surface, exactly as the brief anticipated** — and
four of the new items are in the same class the cycle-1 findings were: a decision taken against a
seam report or an assumption rather than against the reader function. Three are in code the reviewer
did not check in cycle 1 either, and it owns the miss.

**Applied 2026-08-01 by the dispatching session** — all 12 patches, verbatim, verified landed and
stale text purged. Reviewer's explicit direction: *"apply the twelve patches, then proceed to
physics-author — no re-review needed."*

---

## 1. Ruling on the S1/S4 identical-slope observation (raised by the dispatching session)

**Keep S4 at 40 N / 60°. Do not move it to 45°.** Not the F4/R1 class, and the fix costs more than
the defect.

1. **F4 was a false CLAIM; this is a true coincidence.** F4's defect was a *declared delta* that was
   a verified pixel no-op. S4's declared delta — "the formula's prediction equals the meter's
   measurement" — is true, unique to S4 (F7 removed S1's stamp precisely to keep it unspent), and
   unaffected by the slope. A coincidence between two **non-adjacent** states' accelerations is not
   an information-gain failure.
2. **The adjacency a student actually experiences is S3 → S4**, which shows 2.000 → 4.000 m/s² — a
   visible doubling. Nobody sees S1 and S4 within thirty seconds, and S4 differs from S1 in arrow
   length (double), tilt (0° → 60°), arc present, flag present, stamp present.
3. **Decisive — the stamp's precision.** With no `energy_layer` block the stamp and bar render at
   1 dp (`nlbCpStampText` L44217-18; `nlbUpdateWorkPanel` L44350-51). At 45° the canvas reads
   **`56.6 J`** while a teacher's calculator reads **56.5685…** — a rounding conversation opened in
   the one state whose entire claim is *exact* agreement. At 60° the agreement is exact to every
   printed digit, and `cos 60° = ½` lets the teacher do the arithmetic aloud.

**Optional upgrade, offered not required:** the coincidence is an unnamed teaching asset — 40 N at
60° does exactly as much work per metre as 20 N at 0°. One clause of S4 narration may take it.

---

## 2. Landing verification — all 11 findings

| # | Verified landed at | Verdict |
|---|---|---|
| **F1** | §3 home-pose ¶ · S4 row · DoD (b) · DoD (d) · FIT CHECK S4 · Handoff — all five sites carry the arithmetic, no bare literal survives | ✅ (see N1 for the value) |
| **F2** | S4 row (cycle-1's "stamp holds" gone) · bounding ¶ · DoD (d) · FIT CHECK · Handoff; live-teacher consequence stated honestly | ✅ |
| **F3** | §1 · §2 S3/S6 · §3 S3 Controls · §3 S6 · Decision-2 block · FIT CHECK S3/S4/S6. Cycle-1's "drags past 90°… acceptable" **verified absent** | ✅ (see N2, N5, N6) |
| **F4** | §2 S5 · §3 S5 row · archetype audit · Rule-41 titles · FIT CHECK · cut check (i-1) updated | ✅ (see N8) |
| **F5** | DoD (b) — all three re-verified independently: header hardcoded L43198 ✓, caption L43551/44507 ✓, stamp `head + ":  W " + label + " = " + value` L44216-36 ✓, bar numeric bare L44358 ✓ | ✅ exactly correct |
| **F6** | §3 S6 row · FIT CHECK S6 · compliance scar list | ✅ (see N7 — claim overstated) |
| **F7** | §2 S1 · §3 S1 row · DoD (b) ×2 · DoD (d) · FIT CHECK · **cut check (i-1) correctly rewritten** | ✅ — the second-order cut-check edit is the kind usually missed |
| **F8** | (f-1) with arithmetic ✓ · (f-2) ✓ · (f-3) ✓ | ✅ (see N2, N9, N12) |
| **F9** | CYCLE 2 table · DoD (d) · FIT CHECK S2/S4 | ✅ |
| **F10** | §2 arc ¶ · §3 S1 row · DoD (d) explicit | ✅ |
| **F11** | §4 S3 row re-worded · FIT CHECK accepted-limitation block | ✅ |

**Feasibility check the DoD depends on and nobody had verified.** F2's <55% invariant, the bounding
discipline and F8(c) are jointly satisfiable but the window is narrow. At S4's a = 4.000 m/s²,
crossing d = 2.0 m takes 1.000 s, so F2 needs `R ≥ 1818 ms`; the bounding discipline needs
`½·4·R² < 11.4 m`, i.e. `R < 2387 ms`. **`R = 2000 ms` sits in the middle** (crossing at 50.0% of R,
loop distance 8.00 m, loop peak 160 J). The window is ~570 ms wide.

**Pass 1 — scar classes actually checked:** teleport-billed-as-displacement (arrow half → N7) ·
`geometric_track_clamp_rendered_as_an_energy_change` (**adjacent recurrence → N1**) ·
two-faults-one-latch (verified separate latches L44366-71, no recurrence) · both cycle-1 checkpoint
classes (fixed) · `architect_declares_an_engine_limit_without_checking_the_per_concept_override_path`
(**recurrence → N3, N4, N6** — the "read the config type AND the reader" rule was applied to the four
routed findings but not extended to the rest of the document) · non-keyed-`glow_focal`-silently-dims
(**recurrence → N3, N4**) · on-canvas-text-source (clean) · coast-body-halts (covered) ·
uncoupled-readouts-revert (engine-handled, L45356). A recurrence of this run's own class is
automatically P1, which is why N3/N4 are graded P1.

---

## 3. New findings (all now patched)

### P1

**N1 · `initial_position_m = −length_m` parks S2's static crate exactly ON the bound, firing this
chapter's own `[PM_NLB_ENERGY_CLAMP]` guard on the PRIMARY aha state — and hangs half the crate off
the slab in every opening frame.** `bd.lo = −lenM` (L45050); seed uncapped (L44543/L44550); the clamp
branch is taken whenever `s1 <= bd.lo + 1e-9` (L45441) and calls `nlbEnergyClampGuard` when
`energy_active` (L45452), which `work_accumulators` alone make true (L42747). S2's crate **never
moves**, so the guard fires every frame and latches `energy_held`. Nothing fails *today* — the bars
read live `wk[i].W`, and THE EYE's H3 captures only `m.type() === 'error'`, not warnings — which is
precisely why it must be fixed at design time: **SEAM K open item D plans this exact prefix as a
zero-occurrence EYE assertion.** Second, independent consequence: the slab is drawn to exactly
`±lenM` (`nlbApplySurface` L40061-68) against a 0.55 m cart half-width, so a crate centred on the
bound overhangs the floor by half its own width in every frozen baseline.

*This partially reverses the reviewer's own cycle-1 F6 fix, and it says so plainly: the direction was
right, the value collided with two engine behaviours it had not checked.* → **Patch 1** (0.6 m inset,
keeps ~95% of F6's benefit).

**N2 · The θ slider changes what `work_scale_J` must cover, and (f-3) still sizes it to the loop.**
One trusted input latches `PM_nlbSweepSeized` (L42171) and `nlbRunLoopReset` returns early for the
rest of the visit (L43018) — the crate stops looping and runs the whole remaining track once. At the
clamp's lower end (θ = 0) S3's slope is its maximum 20.00 J/m → reachable peak `20.00 × 11.4 = 228 J`
against a scale sized to the authored 80 J loop peak. The bar clamps and `[PM_NLB_ENERGY_SCALE]`
fires (L44364-75) **in the one state whose lesson IS the bar's slope**, during the exact interaction
the F3 fix exists to enable. → **Patch 2**.

**N3 · S2's declared focal `work_bar_applied` is inert, and the unmatched focal dims the force arrow
the state's ten-year memory depends on.** `nlbEnergyApplyGlow` gates on
`energy_panel | energy_bar_* | energy_seg_* | energy_col_E` (L43490-92) — `work_bar_applied` matches
none, so every slot is written `opacity "1"` / `boxShadow "none"` (L43495-503) and the bar is never
lit; meanwhile `nlbApplyGlow` sees a truthy focal matching no mesh (L41819) and dims every arrow and
label to `GLOW_DIM_OPACITY = 0.4`. **Net on S2: a 40%-opacity force arrow with nothing lit** — against
a skeleton naming "the large force arrow over the meter frozen at 0.0 J" as the ten-year memory. The
patch is also the better picture: with no `energy_*` focal the work panel stays fully opaque, so
focusing the arrow gives a haloed arrow *and* a readable 0.0 J bar. → **Patch 3**.

**N4 · S5's declared focal "the formula surface" is not a contracted glow id in any seam.** Same
silent-global-dim class; `nlb_formula` is a DOM element no glow pass addresses. Verified registered
and safe: `displacement_vector` (L43893), `angle_arc` (L43913), `checkpoint_1` (L43706),
`nlb_arrow_<bodyId>_applied` (L40914 + `NLB_ARROW_KINDS` L39668). → **Patch 3**.

### P2

**N5 · The S3 seizure consequence is stated as "acceptable" without saying what the teacher sees.**
The architect flagged it, to its credit, but "may eventually reach the bound" understates a specific
and short window: at a = 2.000 m/s² over 11.4 m the seized run arrests in **≈3.4 s** from a fresh
entry, **≈2.4 s** if θ is dragged toward 0. Then `v = 0`, the clamp warns, and the crate parks under
a still-drawn 20 N arrow with a full `d` arrow and a static bar — the picture S2 spent a whole state
teaching means "no work is being done," now produced by an invisible wall. Re-clicking STATE_3 clears
the latch (L44725). **The F3 fix is not withdrawn** — a manipulable taught variable beats an
untouchable loop, and this is fleet-normal seizure behaviour. → **Patch 4**.

**N12 · S6's `work_scale_J` is sized to the extreme corner, flattening the bar for every ordinary
setting.** At the authored defaults (20 N, 60°) a full lap is `10.00 J/m × 11.4 m = 114 J` — **14%
deflection** against a ~800 J scale, in the state whose whole job is manipulation. This optimises for
a console warning nobody can see (THE EYE cannot drive a slider) over the readability of the
instrument the teacher is watching — the wrong trade under the prime directive. → **Patch 8**.

### P3

**N6** · the `slider_controls` key is `default`, not `def` (`nlbSc` reads `o["default"]`, L41907;
config type L1878-1918). Inert in practice (rows re-sync on entry, L44731) but a Gate-0 DoD carries
no false literals — same class as cycle-1's F3. → **Patch 5**.
**N7** · F6's "hides in the same frame" is stronger than the engine guarantees: the wrap never
touches `b.s0`, so the residual is the frame's overshoot, above `NLB_DISP_MIN_M = 0.02`. The arrow
does not hide; the *substance* holds (centimetres, not metres). → **Patch 6**.
**N8** · "a third distinct bar slope: 17.3 vs 20" is 13% and sequential — not perceptible. S5's real
distinctness (arc at 30° vs 60°, arrow at half length) is sufficient. → **Patch 9**.
**N9** · name the frictionless key: `surface.frictionless: boolean` is real and contracted (L942;
reader L44406 + L44552-53). → **Patch 7**.
**N10** · extend V2's glyph verification to the RAIL title (review-chrome font stack, not Cambria
Math). → **Patch 12**.
**N11** · "buys" is a metaphor sitting in the aha designation physics-author writes narration from
(Rule 41a). → **Patch 11**.
**N13** · name what the `m` slider demonstrates in S6 — mass does not enter `W` at all — or it reads
as a dead control. → **Patch 10**.

---

## 4. Engine queue — one item, RIDE-ALONG (this concept does not depend on it)

**E1 · `work_bar_*` glow ids are declared by SEAM M and never light.**
`[owner: peter_parker:field3d_surgeon]` · **ride-along** — fix after this concept; **#2 will want it**,
since its whole arc is signed work bars and it will reach for `work_bar_friction` as a focal.
`nlbEnergyApplyGlow` L43487-43513; `isEn` accepts only the four `energy_*` forms (L43490-92), so the
`data-en="work_bar_*"` attributes set at L44336 are unreachable, contradicting the in-file claim at
L43194 and SEAM M's contract (L43556-57). One-line shape: `|| focal.indexOf("work_bar_") === 0`.
Probe: on a state authoring `work_accumulators` + `glow_focal: "work_bar_applied"`, assert
`getComputedStyle(document.getElementById("nlb_wk_0")).boxShadow !== "none"` and a sibling at
`opacity ≈ 0.4`. **Not blocking** — Patch 3 gives S2 a strictly better focal needing no engine change,
so the 0d zero-renderer-edit test is intact.

Also still open, filed not routed: the `b.s0 -= span` one-liner from cycle 1's F6
(`nlb_sandbox_wrap_remaps_s_but_not_s0…`). Patch 6's residual is why it stays worth doing.

---

## 5. Rubric (advisory, unratified — did not affect the verdict)

```
Checkpoint A subset (D1, D2, D8, D9, D10)
D1 2 · D2 2 · D8 2 · D9 2 · D10 1   = 9/10   (cycle 1: 8/10)

weakest: D10 explore earns its place — every dial does change something, but the
         sandbox's headline instrument is sized for the extreme corner of the
         slider space (14% deflection at the authored defaults), and the m
         slider's demonstration — that mass does not enter W at all — is never
         named, so it reads as a control that moves nothing.
         D1 information gain — recovered from cycle 1 (S5 now carries its own
         angle, arc number and arrow length; S1's stamp is gone so S4's device
         is unspent). Residual: S4's slope/acceleration coinciding with S1's —
         ruled acceptable in §1, since S4's gain is the stamp-vs-bar agreement
         and its only adjacency is S3, which differs by a factor of two.
```

No P1 was lowered to reach this.

---

## 6. Handoff

Apply the twelve patches, then **proceed to physics-author — no re-review needed.** Physics-author's
inputs are unchanged except: (i) `work_scale_J` now follows Patches 2 and 8, (ii) S3's acceleration is
chosen against the seized-traverse window of Patch 4, (iii) the home pose and every flag derive from
Patch 1's arithmetic only. The verified R-window (`R ∈ [1818, 2387] ms` on S4; `R = 2000 ms` clean) is
a starting point, not a constraint on physics-author's own computation.

---

## Dispatching-session verification + application (2026-08-01)

The two new findings that would silently damage the build were re-verified at source before applying:

- **N3 CONFIRMED.** `var isEn = !!focal && (focal === NLB_EN_PANEL_GLOW || focal.indexOf("energy_bar_")
  === 0 || focal.indexOf("energy_seg_") === 0 || focal === "energy_col_E");` — `work_bar_applied`
  (declared in `NLB_WK_GLOW`, L43555-58) matches none of the four branches.
- **N1 CONFIRMED.** `if (s1 <= bd.lo + 1e-9 || s1 >= bd.hi - 1e-9) { … if (eng.energy_active)
  nlbEnergyClampGuard(eng, b); }` with `return { lo: -lenM, hi: hiS }` and
  `eng.energy_active = !!(eng.energy_layer || eng.work_state || eng.checkpoint_state)`. A never-moving
  crate seeded at `-length_m` satisfies the branch every frame. The in-file comment even reads
  *"hold the bars and warn loudly."*

**All 12 patches applied verbatim; landing verified by grep (12/12 present, 4/4 stale strings purged).**
Checkpoint A is CLOSED. Next: physics-author.
