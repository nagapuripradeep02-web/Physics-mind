# EYE_WALKER report — `transformer` (Ch.7 concept 8/8, NCERT §7.9)

> Persisted by the orchestrator (§0.2 artifacts-are-files). The eye-walker agent's own operating
> instructions prohibit it writing report .md files, so it returned this inline; the text below is
> its report verbatim, transcribed without edit.

Run dir: `C:\Tutor\physics-mind-ch7\.visual_runs\transformer\20260724-212106\`

## 1. Deterministic gate summary
`📊 47 deterministic checks · 47 passed · 0 failed · $0.00`

## 2. Bug-queue consultation (pre-walk)
`query_engine_bug_queue.ts transformer --field3d --open` → **No matching engine_bug_queue rows.**
Expected — `transformer` is a brand-new `scenario_type`, first pixels ever rendered. No prior scars
specific to this concept; the Ch.7-wide scar-recurrence list (formula echo, bar-total collision, glow
no-op, rounding seam, stale caption bleed, ASCII leakage, HUD/chrome collision) was still watched.

## 3. Per-state verdict table (all 11 states, exhaustive)

| state | reveal (frozen) | motion (dense) | delta visible? | Rule 24/29 | note |
|---|---|---|---|---|---|
| S1 | ✓ Φ=0.090Wb, Vₚ=10.0V, secondary loop open/uncomponented, primary beads present | ✓ primary beads oscillate (confirmed via pixel diff), flux arrows pulse with sine | ✓ "One flux, two coils" — baseline | ✓ | — |
| S2 | ✓ Vₛ=Vₚ=10.0V, Iₛ=Iₚ=0.40A, secondary closed + lamp lit | ✓ lamp AC-flickers in sync with graph sine | ✓ "No wires — power crosses"; loop open→closed+lit vs S1 | ✓ | — |
| S3 | ✓ dΦ/dt=0 badge, **no Φ numeral present**, Vₛ=Iₛ=0.00, Iₚ=3.33A, loop CLOSED + dark lamp | ✓ genuine transient: lamp "blip" bright at t≈1000ms → dark by t≈3000ms (correct DC-switch-on physics); AC circle icon swaps to battery-bar icon | ✓ visually distinct from S1 (closed+dead lamp vs open loop) — the exact ask was met | ✓ | — |
| S4 | ✓ tick bar full, "turns:100"/"bar:10.0V", chip "100×0.100V=10.0V", formula Vₚ/Nₚ=0.100V/turn | ✓ bar fills 0→100 turns, 0.0V→10.0V live | ✓ "Every turn, equal share" | ✓ | — |
| S5 | ✓ Nₛ=200 in HUD+chip+winding lockstep, Vₛ=20.0V, chip Vₛ/Vₚ=Nₛ/Nₚ=200/100=2 | ✓ slider drags 100→200; secondary coil bundle visibly grows taller in lockstep (Rule 33 macro↔micro) | ✓ "Turns set the voltage" | ✓ coil growth = real magnitude, not a bulge | — |
| S6 | ✓ Pₚ=Pₛ=16.0W bars confirmed **equal brightness** (no per-object focal — F1-class scar did not recur), Iₚ=1.60 vs Iₛ=0.80, ghost struck through | ✓ | ✓ "Volts up, amps down" | ✓ whole-pane glow verified | — |
| S7 | ✓ loss 3.200W→0.032W (3dp), P_loss=I²·R_line, chip "×10V→÷100 loss", station/house schematic | ✓ | ✓ "Step up, lose less" | ✓ | — |
| S8 | ✓ Pₚ=16.8W, Pₛ=16.0W, η=95%, 4 leak bars 0.4/0.2/0.1/0.1, ledger "16.0+0.8=16.8 ✓" closes exactly | ✓ | ✓ "Real transformers leak" | ✓ | — |
| S9 | ✓ HUD trimmed to Φ/Vₚ/Vₛ/Iₛ/Iₚ, chip "thin slices → no wide loops" | ✓✓ strongest state — eddy-loop ellipses appear ~t3000ms, visibly shrink to slivers by ~t8–11k ms across the 5 dedicated keyframes | ✓ "Thin slices stop eddies" | ✓ | legible at native res (not just on zoom) |
| S10 | ✓ 6 derivation lines docked (εₚ, εₛ, εₛ/εₚ, Vₛ/Vₚ, Vₚ·Iₚ=Vₛ·Iₛ→Iₚ/Iₛ, 200/100=2→20.0V,0.80A), apparatus visibly dimmed | apparatus static/dimmed by design (recap state) — acceptable | ✓ "The ratio, derived" | ✓ Unicode correct | **MODERATE** — empty bordered graph-panel container rendered with zero content for the entire ~22s state (confirmed t=0 and t=10000) |
| S11 | ✓ all readouts present, 4 sliders live (Nₛ/Vₚ/f/R_load) | ✓ confirmed continuous free-run at t=5000 and t=10000 (Rule 37 compliant) | ✓ "All yours" | **✗** | **MAJOR** — formula "Vₛ/Vₚ=Nₛ/Nₚ" renders behind/clipped by the bottom edge of the HUD panel, persists for the entire state |

## 4. Frames for founder eyes (4)

1. `.visual_runs/transformer/20260724-212106/STATE_11__frozen.png` — MAJOR: formula surface clipped behind the HUD panel's bottom edge on the explore state.
2. `.visual_runs/transformer/20260724-212106/STATE_11__dense_t10000.png` — confirms the clip persists through the whole free-run, not a one-frame fluke.
3. `.visual_runs/transformer/20260724-212106/STATE_10__dense_t00000.png` — MODERATE: dead empty bordered panel visible for the full derivation state.
4. `.visual_runs/transformer/20260724-212106/KEYFRAMES_STATE_9__t08375.png` — spot-check only (reads fine): first-ever pixels of the eddy-loop→lamination mechanism, worth one founder glance since it's a brand-new visual on a brand-new scenario_type.

## 5. Candidate `engine_bug_queue` rows (report only — NOT inserted; trial = files only)

**Row 1**
- `bug_class`: `explore_state_formula_surface_clips_behind_growing_hud_panel`
- `severity`: MAJOR
- `owner_cluster`: `peter_parker:renderer_primitives`
- `prevention_rule`: New field_3d scenarios must position the top-right formula surface below the HUD
  panel's *dynamic* bottom edge (computed from actual HUD row count for that state), never a fixed
  y-offset — verify specifically in whichever state has the MOST HUD rows (usually the explore/final
  state, since HUD rows only accumulate across the arc and never shrink).

**Row 2**
- `bug_class`: `derivation_state_leaves_empty_graph_panel_container_rendered`
- `severity`: MODERATE
- `owner_cluster`: ambiguous — `alex:json_author` if a per-state panel-hide override exists and simply
  wasn't set on S10, else `peter_parker:renderer_primitives` if the `transformer` scenario has no such
  toggle at all
- `prevention_rule`: Every field_3d state that doesn't use the flux/wave graph panel must explicitly
  hide its container (not merely leave its content empty) — check for a lingering empty bordered box
  on every "derivation"/"recap"-style state that follows a graph-using state.

## 6. Overall read

**FINDINGS (2)** — one MAJOR (S11 formula/HUD collision, Rule 34d), one MODERATE (S10 dead empty
panel, Rule 34 clutter). Everything else — all 11 states' reveal completeness, per-state motion
distinctness (Rule 31), delta-cue legibility (Rule 32c), home-pose continuity including the tricky
S1-vs-S3 open/closed-switch contrast (Rule 32d), whole-pane glow on the power-equality state (no scar
recurrence), Unicode correctness across all three text paths, and the S9 eddy→lamination micro-story
(Rule 33c) — read clean.
