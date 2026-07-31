# QUALITY AUDIT (CYCLE 2 — RE-AUDIT) — `em_wave_propagation` (Ch.8 #2, NCERT §8.3)

## VERDICT: **PASS**

Re-audit after a 5-fix cycle (4 engine + 1 authoring). Scoped to the surfaces the fixes touched;
all other gates carried forward unchanged from the cycle-1 PASS (`auditor_report.md`). No hard-gate
FAIL, no upstream routing. Renderer family = field_3d (chat-flow / deep-dive / drill-down gates remain
N/A as in cycle 1).

Frames read: `.visual_runs/em_wave_propagation/20260725-032745/` (manifest `warnings: []`, 47/47).

---

## Re-run gates (fix-touched surfaces)

| Fix | Surface | Gate(s) | Result | Evidence (this session) |
|---|---|---|---|---|
| **3** S1 pulse retimed to `needle_kick_at_ms` (arrival→9000ms, period→~10064ms) | S1 frozen | 4, 15, Gate-8 scar `field3d_emw_s1_pulse_arrival_desynced_from_needle_kick_cue` (FIXED) | ✓ | `STATE_1__frozen.png`: pulse packet has ARRIVED at the receiver; receiver gauges read **E ≈ 98 V/m, B ≈ 0.33 μT (NONZERO)** — the exact defect this fix targeted (was `B = 0.00 μT` in the post-reset trough). Regression probe passes: target instrument shows nonzero arrival value, not 0.00. |
| **2** deriveStateMeta S9 freeze pin 1500→18000ms + `link1/2/3`+`assembled` cues | S9 frozen | 4, 15, Gate-8 scar `field3d_emw_s9_link_cues_missing_from_reveal_pin` (FIXED) | ✓ | `STATE_9__frozen.png`: all three recall links docked (`direction: ẑ · same phase: (kx − ωt) · amplitude: E₀/c`) AND the **assembled `B_z = (E₀/c)·sin(kx − ωt)` line is LIT** (blue). Terminal beat fired — no longer a mid-derivation GIVEN-only capture. |
| **1** S5 ghost dissolve wired to `ghost_dissolve_at_ms` (~1s fade of 3D ghost + DOM ✗-tag) | S5 dense + frozen | 15, 16 (Rule 16a), Gate-4 | ✓ | **Rule 16a both halves confirmed.** Ghost APPEARS + does its job: `STATE_5__dense_t03000/08000/13000.png` all show the dim maroon 90°-out-of-phase ghost line + on-canvas cue **`✗ expected: B peaks 90° after E`**, contradicted by the real in-phase green E / blue B trains (HUD "crests together"). Ghost DEFEATED: `STATE_5__frozen.png` (late pin) shows the ghost line AND ✗-tag both gone — dissolved together. Not a ghost-never-appears failure; not a ghost-never-leaves failure (the cycle-1 eye_walker CRITICAL). |
| **4** graphical λ bracket (⊓ + λ sprite spanning 2π/k) gated on `show_lambda` | S6 + S11 frozen | 3g (34c/34d), 9 (overlap) | ✓ | `STATE_6__frozen.png` + `STATE_11__frozen.png`: downward-opening magenta bracket + **`λ = 3.00 m`** sprite render in the reserved upper-centre band (y≈235–267). Real Unicode λ. **No collision** — clears the top-right value HUD, the A/B gate labels below, the E/B receiver labels, and the bottom formula dock (Gate 9 / Rule 34d). Marker renders in-scene, not HUD-only — scar `field3d_emw_s6_lambda_bracket_declared_but_never_rendered` (FIXED) regression absent. Present on both declared states (S6 guided + S11 explore), and S11 explore purity preserved (bracket is a core-ring λ marker; controls remain ν / field-strength / source only, no n/slab/tanks/ratio). |
| **5** S8 formula `u<sub>E</sub>`/`u<sub>B</sub>` markup (was ASCII `_`) | S8 frozen | 3g (34c), 10 (expr), 11 | ✓ | `STATE_8__frozen.png`: bottom formula renders **`u_E = ½ε₀E² = u_B = B²/2μ₀`** with E/B as true typographic SUBSCRIPTS (not literal `u<sub>E</sub>` text, not ASCII `u_E`). Real Unicode ½ ε₀ ² μ₀. Twin tanks render identical string `0.06×10⁻⁸` (equal-by-identity preserved — scar `field3d_equal_quantity_pair_needs_shared_exact_constant` clean). S8 confront cue `✗ B = 0.0000004 T — surely negligible?` renders on-canvas. |

## Gate 8 — engine_bug_queue regression (scar-candidate FILE rows)

TRIAL constraint honored: scar rows are FILES ONLY on this branch (`docs/loop_runs/ch8/_engine/scar_candidates.sql`),
never written to the DB — "missing DB row" is **not** a finding, and no DB write was attempted. Evaluated
every row whose `concepts_affected` includes `em_wave_propagation`:

- `field3d_traveling_vector_train_primitive` (directive) — byte-stability under freeze. New λ-bracket geometry is a pure fn of ν (no ms term); S1 pulse retiming stays a closed-form fn of state-local ms. THE EYE 47/47 deterministic + regression samples `magnetisation_and_intensity` 38/38, `bar_magnet_as_dipole` 56/56 all H2 @ 0.00% ⇒ no determinism regression. ✓
- `field3d_equal_quantity_pair_needs_shared_exact_constant` (directive) — S8 twin tanks identical string. ✓ (above)
- `field3d_emw_s9_link_cues_missing_from_reveal_pin` (FIXED) — S9 terminal beat present. ✓
- `field3d_emw_s1_pulse_arrival_desynced_from_needle_kick_cue` (FIXED) — S1 gauge nonzero at pin. ✓
- `field3d_emw_s6_lambda_bracket_declared_but_never_rendered` (FIXED) — bracket renders in-scene S6+S11. ✓

displacement_current rows are scoped to a sibling concept (`concepts_affected=['displacement_current']`,
cardinality<5) → out of scope for this candidate per the Gate-8 WHERE clause. (em_wave is not vulnerable to
the OPEN `field3d_scene_composition_annotation_silent_noop` class anyway: its S5 and S8 confront cues both
render via `field_3d_config`, on-canvas, not via silent scene_composition annotations.)

**Gate 8 ✓ — no scar recurs.**

## Carried forward UNCHANGED from cycle-1 PASS (no fix touched the surface)

Fresh machine evidence supplied by the loop and consumed here: `npx tsc --noEmit` → 0 errors (Gate 1 ✓);
`npm run validate:concepts` → `PASS em_wave_propagation.json` (Gate 2 ✓); `founder:drive` →
`consoleErrors=0 flags=0 collisions=0` (Gate 7 ✓); `check:renderer-syntax` → both OK.

Carried forward on unchanged surfaces: **Gate 0** (DoD — strengthened, the λ-bracket symbol-label line is
now genuinely rendered rather than HUD-only), **3a** (Rule 15/19/23), **3d** (E42), **3e** (motion
archetypes + per-state controls — no fix touched motion/controls), **3f** (word budget — only the S8
*formula* changed, not narration), **3h** (rings + tag honesty), **11** (plain-English/Rule 35 — no new
prose), **12** (continuity), **13** (animation vocab), **14** (Pass-1 skeleton), **15/16-20** for the
un-moved states, **anti-plagiarism** (no new text beyond formula markup). N/A as before: 3c, 4a/4b, 5, 6,
Rule 16/EPIC-C, 20/21 modes.

## Notes (LOW, non-blocking — carried from cycle 1, unaffected by this cycle)

- ν renders as a `v`-lookalike in the 13px monospace HUD (advisory; correct Unicode, engine tweak only if
  wanted → `[owner: peter_parker:renderer_primitives]`). Not a gate FAIL.
- Founder hand-test items (headless can't fire trusted drags): S7/S8 field-strength seize, S10 n-drag, S11
  live continuous motion. Unchanged by this cycle.

---
**PASS.** Hands off to founder → reviewer (Asmi). Trial constraints observed: no visual:approve, no tts,
no PILOT_CONCEPTS, no build:pilot/deploy, no DB writes, no merge. Report only; no concept JSON / source edited.
