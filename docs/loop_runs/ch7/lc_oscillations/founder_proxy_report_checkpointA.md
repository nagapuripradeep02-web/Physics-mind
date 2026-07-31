# FOUNDER_PROXY — Checkpoint A (DESIGN GATE) — `lc_oscillations` — cycle 0

## 1. Verdict: `DESIGN_FIX` → routed to `alex:architect` (cycle 0 of max 2)

This is a genuinely elite skeleton — it correctly delivers the inherited energy-ledger and builds the withheld free-circuit front door (not a re-driven rehash of ac_power_factor), its Class-B triage is warranted and reasoned exactly right (six concrete gaps; engine fix chosen over a worse pure-JSON workaround, per the PRIME DIRECTIVE), the SHM analogy gets a visible mass-spring twin (S6) with a correct notation ladder (calculus confined to the advanced S8, algebra `f₀=1/(2π√(LC))` in core), and it disarms ~18 prior scar classes, several exemplarily (the open-loop apparatus scar inverted into the central `switch renders a closed path` requirement; the dt-accumulator class killed with one closed-form phase clock; the picker-scar closed for the S9 draggable switch). **But two Pass-1 recurrence risks block DESIGN_OK.** One is a P1 on the concept's headline conserved number: E_total sits exactly on the 2-dp rounding boundary (6.365 J), and the skeleton's own stated verification `(0.5*0.1273*100).toFixed(2) === "6.36"` is **false — it returns `"6.37"`** (machine-verified below), so the number-lock is self-contradictory and would risk a visible on-canvas arithmetic seam (6.37 vs 3.18+3.18=6.36) on the exact state (S5) whose entire lesson is "the total never moves." The second is a P2: the design declares the applyGlowEmphasis exemptions for its live-driven focals (S5 gauges, S6 inset) but omits the ac_capacitor fix that the focal boost must be a *multiplier on the live channel* — exemption + brightenOnly = a silent no-op, deleting the "one glow focal" emphasis in the two most important legibility states. Both are cheap architect amendments; neither is a physics doubt (I resolved the number ambiguity), so this is DESIGN_FIX, not ESCALATE.

## 2. Pass-1 recurrence check — classes actually checked (not just "no recurrences")

Checked against this chapter's accumulated scar corpus + inherited FIXED classes. **Handled correctly (no recurrence):** `field3d_dt_accumulated_motion_invisible_to_eye_timepin` (REOPENED/class-wide — killed via one closed-form phase clock, §0a/Esc#4); `field3d_generic_element_value_renders_nothing…open_loop` (inverted into the central switch-closed-path requirement, §0a/§10j); `field3d_rms_subscript_ascii…` + `…f0_vm…` + `…secondary_readout` (all three text paths, digit-subscript compose load-bearing, §10b); `field3d_slcr_empty_band_leaks…` (pwr_ppane declared empty, §10h); `field3d_scenario_missing_maxreveal…` + `slcr_reveal_hold_captures_transitional` (three-site registration + pins past last payoff, §0b ask 9); `field3d_explore_picker_updates_global_but_frame_reads_authored` (frame reads live PM_lco* globals + shared switch-apply helper, §10j); `field3d_dim_apparatus_one_way_no_restore` (E4 restore + S9-BRIGHT-after-S8 probe, §10j); the caption family (`latched_phase_claim` / `canvas_caption_not_cleared` / `unbound_one_shot_races` / `live_player_caption_order_probe` — F1 single-latest + fillText caption-order probe required on S3/S5, Esc#7); `oncanvas_numeric_coincidence…` (§10k audits 6 coincidences incl. the I₀=2.00=iₘ Q=1 artifact never juxtaposed); `field3d_createtubeline_undefined_field_lines_throws` (renderer-level fix landed fleet-wide; new scenario safe); `skeleton_zone_map_asserts_pane_geometry…` (CSS READ with file:line cites, §0a/§10h); `field3d_freeze_window…` (correctly N/A — no state freezes the clock); `field3d_duplicate_formula_surface…` (gauges value-only, one formula surface/state); `field3d_readout_hud_emits_untaught_ring_quantity` ("no f₀ before S4", explore core-only). **Recurrence RISK (findings below):** `design_numberlock_rounded_value_must_be_single_round_of_true_not_hand_copied` (F1); `glow_focal_on_live_driven_object_exempted_becomes_total_noop` (F2). **Partial (P3 note):** `canvas_graph_label_collides_with_peak_reference_line` / `field3d_hud_label_clipped_by_readout_box` (founder_drive blind spots — the strip Q₀ gutter label vs ±Q₀ rails not explicitly named for the Checkpoint-B canvas-internal check).

## 3. Number-lock verification (machine)

Node probe confirms every inherited/derived value EXCEPT the boundary: LC=0.405209, ω₀=1.571, f₀=0.25, T₀=4.00, Q₀=1.27, I₀=2.00 (ω₀Q₀=1.99981 ✓), √(L/C)=5.0005 (Q=1 artifact, guarded), α=0.31416=π/10, R_crit=10.00, per-swing decay e^(−αT′)=0.277. **Boundary result (the finding):**
```
E_total = 0.5*C*V0*V0        = 6.364999999999999  -> toFixed(2) "6.36"
(0.5*0.1273*100).toFixed(2)  = "6.37"      <-- the skeleton's OWN stated verification, returns 6.37 not 6.36
½LI0² @ displayed addends     = "6.37"      (correctly kept symbolic by the design)
```
The true value is *exactly* 6.365 J (dead on the 2-dp boundary). The natural left-to-right expression yields 6.36; the skeleton's specified verification expression yields 6.37. The display is fragile and the design artifact is internally contradictory on the concept's headline number.

## 4. Design findings

| # | Sev | Where | What the founder would say | Evidence | Route |
|---|---|---|---|---|---|
| **F1** | **P1** | S1/S5/S7 HUD + gauges + total line; §2 display law, §10k(3), Esc#5 | "Your conserved number is on a knife-edge. E_total is exactly 6.365 J — and the verification you wrote to prove it displays 6.36 actually returns **6.37**. If the total line renders 6.37 while the half-split shows 3.18+3.18=6.36, S5's whole 'nothing is spent' lesson has a visible arithmetic contradiction on screen. This is the pwr F1 / `design_numberlock…single_round` class again, at design time, on the headline number." | node probe §3; skeleton line ~215–218 (the false JS-eval), ~206 (`6.3650 J → displays 6.36 J ⚠ boundary`), ~490–492 (§10k item 3), ~580–582 (Esc#5). The design's own new work-point pick V₀=10.0 (~202) created the boundary. | `alex:architect` |
| **F2** | **P2** | S5 (gauges focal), S6 (inset focal); also S1 plates / S2 beads / S4·S7 strip | "You declared the glow exemptions but not the fix. In ac_capacitor, exempting a live-driven object from the generic glow pass while brightenOnly=true made the focal boost a total no-op and silenced three narration beats. Your S5 focal IS the gauges and your S6 focal IS the inset — both live-driven exempt objects. Unless the boost is a multiplier on the live channel, Rule-32e 'one glow focal' shows *no* emphasis in your two most important states." | skeleton §0a item (3) line ~41 ("applyGlowEmphasis exemptions declared (coil…, the phase-locked inset, gauges as focal)"); §3 glow column S5=`gauges` (~249), S6=`inset` (~250); scar `glow_focal_on_live_driven_object_exempted_becomes_total_noop` (corpus lines 644–652). Note: this class is NOT in the §0a scar table nor in the precision-checklist directive's cross-reference list — genuinely unwired. | `alex:architect` |

**Architect amendment asked (both cheap, single-cycle):**
- **F1** — correct the E_total number-lock: **preferred** = nudge the work-point off the boundary so the headline conserved value is not `.xx5` (weigh against the V₀=10.0 continuity rationale — a small change to V₀ or the C/L decimals removes the fragility entirely); **or** pin ONE canonical float expression used *identically* on every surface (S1 gauge fill target, S5 total line, HUD `E_total`, half-split addends, S7 E_R ceiling) and have physics_author confirm which way `toFixed(2)` lands for that exact expression. Either way, replace the false `(0.5*0.1273*100).toFixed(2) === "6.36"` verification with the true one. (Fix is a physics_author number decision; the false claim lives in the architect's skeleton, so the amendment is the architect's.)
- **F2** — add `glow_focal_on_live_driven_object_exempted_becomes_total_noop` to the §0a scar table and to the §0b engine ask (items 4/11): *every live-driven object used as a state's glow_focal (S5 gauges, S6 inset, and any of plates/beads/strip so used) must apply the focal boost as a MULTIPLIER on its own live channel — never rely on exemption alone, since exemption + brightenOnly = no-op.*

## 5. P3 ride-along notes (do NOT need a cycle — carry into the engine ask / physics_author)

- **N1** — S9 V₀ slider is gated on re-throw (physically correct: V₀ only has meaning at the charge event, unlike L/C/R which are live). Risk: it reads as a *dead control* when dragged mid-swing (Rule-31 spirit / the dead-guided-slider class). Ask the engine to give it visible feedback (battery-voltage label / pending-charge indicator) so the drag is never inert. (§3 S9 ~253)
- **N2** — canvas-internal label collisions are a founder_drive blind spot (`canvas_graph_label_collides_with_peak_reference_line`, `field3d_hud_label_clipped_by_readout_box`). The zone map reserves regions well, but the engine ask should name the Checkpoint-B cropped-frame check for the strip's `Q₀` gutter label vs the ±Q₀ dashed rails, and the S3 `I₀=2.00 A` / S4 `Q₀` sprite labels vs the DOM HUD corner. (§10h ~442)
- **N3** — S8 caption promises "the swing, solved" but the chain stops at ω₀; consider surfacing the *solution* `q(t)=Q₀cos(ω₀t)` as the chain's last link so the algebra closes the cosine the S4 trace showed visually (physics_author's call on S8 content). (§10 formula-surface line ~407)

## 6. Candidate scar rows (FILES only — schema-disciplined; both REUSE existing bug_classes)

```sql
-- F1 · recurrence of an existing OPEN class at DESIGN stage (Checkpoint A, lc_oscillations).
UPDATE engine_bug_queue SET
  concepts_affected = ARRAY['ac_power_factor','lc_oscillations']::text[],
  root_cause = root_cause || ' RECURRENCE 2026-07-24 (lc_oscillations Checkpoint A, design stage): '
    || 'E_total = ½CV₀² is EXACTLY 6.365 J (true value on the 2dp boundary; created by the design''s own '
    || 'new work-point pick V₀=10.0). The skeleton (§2/§10k(3)/Esc#5) asserts canonical display 6.36 J and '
    || 'specifies the verification (0.5*0.1273*100).toFixed(2) === "6.36" — which actually returns "6.37" '
    || '(node-verified). 0.5*C*V0*V0 returns "6.36". No single canonical float expression is pinned across '
    || 'the S1 gauge-fill target, S5 total line, HUD E_total, half-split addends (3.18+3.18) and S7 E_R ceiling, '
    || 'so a cross-surface seam (6.37 vs 6.36) can render on the exact state whose lesson is the flat total.'
WHERE bug_class = 'design_numberlock_rounded_value_must_be_single_round_of_true_not_hand_copied';

-- F2 · forward-catch: the EXISTING (ac_capacitor-FIXED, scenario-local) class WILL recur in the lco_ clone
UPDATE engine_bug_queue SET
  status = 'OPEN',
  concepts_affected = ARRAY['ac_voltage_capacitor','lc_oscillations']::text[],
  prevention_rule = prevention_rule || ' DESIGN-STAGE CARRY (lc_oscillations Checkpoint A): the fix is '
    || 'scenario-local (accApplyGlow), so the lco_ clone does NOT inherit it. The lc engine ask (§0b) declares '
    || 'the exemptions (coil emissive ∝ i², inset, gauges) but omits the multiplier requirement; S5 focal=gauges '
    || 'and S6 focal=inset are both live-driven exempt objects, so both emphasize as no-ops unless the lco_ glow '
    || 'pass applies the focal boost as a multiplier on the live channel. Name this in §0b before json_author.'
WHERE bug_class = 'glow_focal_on_live_driven_object_exempted_becomes_total_noop';
```

## 7. Process flags for the loop / founder (not verdict drivers)

- **Runaway guard:** engine-commit count entering at **18** (§0b ask 12, Esc#1) — a founder-boundary call; correctly surfaced, not my verdict driver.
- **Compose rule-of-FIVE:** the skeleton correctly defaults to a fifth `lco_`-scoped clone (trial-safe) and restates the promotion recommendation (Esc#2) — promotion stays founder-only. No action.
- **Live `engine_bug_queue` SQL gap:** the architect (like all 6 siblings) could not run live SQL and FLAGged it to Gate 8 (§0a). Corpus files were sufficient for a complete Pass-1.

## 8. ≤5 key skeleton sections the founder should read first

1. `skeleton.md` §2 lines ~213–218 — the display-precision law + the false JS-eval verification (F1, the P1). Read first.
2. `skeleton.md` §10k line ~487–498 — the coincidence audit; item (3) is the E_total boundary (F1).
3. `skeleton.md` §0a line ~41 + §3 glow column lines ~249–250 — the exemption declaration (F2) vs S5/S6 focals.
4. `skeleton.md` §0b lines ~71–96 — the Class-B triage (six gaps).
5. `skeleton.md` §9 line ~360–373 — the radio-transmitter-tank anchor (the strongest part; what "right" looks like).

**Cycle status:** DESIGN_FIX cycle 0 → return to `alex:architect` for F1 + F2. On re-review, DESIGN_OK requires F1's number-lock corrected (boundary removed or one canonical expression pinned + verification fixed) and F2's multiplier requirement in §0b. Cycle 1 of max 2 pending.
