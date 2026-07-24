# Founder-proxy — Checkpoint B (Build Gate), cycle 0 — `ac_power_factor` (Ch.7 §7.7, `ac_power`, 10 states)

**Founder asleep — proceeding autonomously.** Every finding opened at the pixel + re-derived from the renderer's own display formulas. Orchestrator-persisted verbatim.

## VERDICT: **FIX(engine)** — ONE blocking core-claim contradiction on the flagship pivot (Finding 1). Not APPROVE.
Finding 1 CONFIRMED, a recurrence of a scar class caught one concept ago (series_lcr S4), self-contradicts on the #1 misconception pivot, disagrees with spoken narration → **blocking**: engine fix lands now, S4 re-driven + re-reviewed, THEN approve with ride-alongs. Finding 2 REFUTED (frames prove correct staging). Finding 3 CONFIRMED-absent but REFUTED-as-defect (narration + gauge carry it; dead JSON cue to clean up). Finding 4 = ride-along polish. Physics 100% correct — no ESCALATE.

## Pass-1 scar recurrence check
- `field3d_struck_sum_rounds_full_not_displayed_addends` (series_lcr S4, prior concept, 5dc7ccd) — **RECURRENCE → Finding 1 is P1** (inverse facet: there full-precision operands; here correct displayed operands, but the product still disagrees with the quantity's canonical 2dp). Prior prevention followed but necessary-but-insufficient.
- rms-subscript ASCII (34c) — no recurrence (real Unicode Vᵣₘₛ/Iᵣₘₛ/φ/Ω/⟨p⟩/×/² in every frame).
- dt-accumulator — no recurrence (pure-t; motionProbe bytesEqual:false; explore ran 18.3s live, Rule 37).
- chrome-collision — no recurrence (HUD top:52px+; overlayCollisions:[]).
- one-shot-race — no recurrence (`*_at_ms` spread + scenario_cue present).

## Findings — adjudication
### F1 — S4 apparent power renders 5.54 AND 5.55 on the pivot — **CONFIRM · P1 · BLOCKING · FIX(engine) [peter_parker:renderer_primitives]**
Re-derived: iₘ=vₘ/Z=10/9.013490=1.109448; **I_rms=0.784498 → toFixed(3)=0.784** (4th digit 4 → single-round DOWN; the 0.785 lock is a double-rounding slip). S_true=5.547241 → toFixed(2)=5.55.
Code (field_3d_renderer.ts): `29819-29822` `naive=Number(Vrms.toFixed(2))*Number(Irms.toFixed(3)); chip="7.07 × 0.784 = "+naive.toFixed(2)+" W?"` → **5.54**. `29832` ratio chip → "3.08 / 5.55 = 0.555". `29801` S8 leg → "S = 5.55 VA". (Comment 29817 still "7.07 x 0.785 = 5.55" — stale.)
Pixels: STATE_4__frozen — struck "7.07 × 0.784 = 5.54 W?" directly above "3.08 / 5.55 = 0.555"; S shown as 5.54 AND 5.55 ~18px apart. Narration s4_1 speaks "five point five five" — the on-screen 5.54 also contradicts the spoken number, on the #1 pivot.
**Blocking** (not a "known wart"): visible self-contradiction on the flagship pivot + recurrence + lone outlier vs narration/S8/ratio (all 5.55). Founder catches it in <5s.
**Fix (engine):** in `pwrDrawChips` (~29819-29824), render the naive prediction with SYMBOLIC operands + S's canonical value — `pwrFillComposed("V_rms × I_rms = "+phys.S.toFixed(2)+" W?")` struck → reads 5.55 identically to S8/ratio/narration. Do NOT keep the literal "7.07 × 0.784 = ..." (visibly false multiplication). Residual (teacher manually computes 7.07×0.784=5.54) is an inherent 3dp-display artifact, vastly less bad than the current stacked contradiction. **Reject option (b)** (nudge a default to force 0.785): I_rms sits on the 0.7845 boundary; shifting re-ripples the CpA lattice (0.435/0.653 components, S8 legs) — too fragile. Scope: `apparent_vs_real`/S4 only (gate line 29670, zero blast radius). Re-review: re-drive S4, confirm chip reads 5.55 everywhere.

### F2 — S4/S5 multi-cue "resolve at t=0" — **REFUTE (THE-EYE reading error, no defect)**
STATE_4__dense_t00000 shows ONLY the unstruck naive chip (no strikethrough/ratio/naming); t02000 shows the strikethrough; t06000 adds ratio+naming. STATE_5__dense_t00000 shows only v/i arrows; t02000 the "I_rms cos φ" component; frozen the full split. **Cues stage progressively.** `*_at_ms` spread (S4 0/1500/3000/6000; S5 1000/1800/3600) + scenario_cue bindings present (s4_1→ghost_swing…s4_4→naming; s5_2→split_par, s5_3→split_perp). eye-walker mis-read the t0 frames. No action.

### F3 — S7 close chip never renders — **CONFIRM absent · REFUTE as defect · P3 ride-along [alex:json_author]**
No close-chip draw code in the energy_ledger path. STATE_7__dense_t17000 shows the 3 gauges (E_L 0.00 / E_C 0.49 / E_R 52.31 J, **"+6.15 J/cyc"**), no chip. The "third way" close IS delivered — the +6.15 J/cyc gauge label (÷T=2s→3.08 W) + narration s7_3/s7_4 — parallel to the S5 check-in-narration the auditor approved. NOT a gap. Moreover the specced "0.785²×5.0=3.08" chip would itself be broken (true 0.784²×5.0=3.07) — its absence AVOIDS a second seam. Cleanup only: remove the dead `close_chip_at_ms:3200` JSON field; any future S7 close must use canonical P=3.08.

### F4 — cosmetics
- **4a** S10 "I_rms sin φ = −0.000 A" (sinφ=−0.000188 → toFixed keeps sign). CONFIRM · P3 ride-along [engine] — clamp |v|<5e-4 → "0.000".
- **4b** S3 negative lobe buried: fixed −4..+21 W p-pane (sized for S1/S2 resonance +20 W); at f=0.50 the wave swings −2.47..+8.63 so the returned lobe is a ~10%-height sliver — the "wave dips negative" delta cue under-delivers. CONFIRM · **P2 ride-along [engine]** — tighter y-range or bolder returned-fill.
- **4c** A4 hue (i∥ coral #FF6E40 vs i amber #FFB300): coded-distinct but spatially adjacent at small fan scale — **founder real-scale look, no routed fix.**
- **4d** wattmeter "P=…W" numeric small/faint italic: CONFIRM · P3 ride-along [engine] — enlarge.

**Own-error acknowledgment:** my CpA row 2 stated I_rms=0.785 / 7.07·0.785=5.55; true 0.784498 single-rounds to 0.784. I propagated the double-rounding slip (as did physics_block §4.1 A8). Both need the 0.785→0.784 correction; this is the root that seeded F1.

## Routing (what the orchestrator dispatches)
**BLOCKING — now, then re-drive S4 + re-review, then approve:**
- **F1 · FIX(engine) [peter_parker:renderer_primitives]** · pwrDrawChips ~29819-29824 → symbolic operands + phys.S.toFixed(2) ("V_rms × I_rms = 5.55 W?" struck). Scope S4 only.
**RIDE-ALONG — bundle with F1 (per the series_lcr precedent) or after the approve:**
- F4b engine (S3 p-pane range/returned-fill); F4a engine (clamp near-zero HUD/|X|); F4d engine (enlarge wattmeter numeric); F3 json_author (remove dead close_chip_at_ms:3200).
**DESIGN-DOC (no re-drive):** [alex:physics_author] correct physics_block §4.1 A8 (0.785→0.784); founder-proxy CpA row 2 likewise (I own it).
**Founder real-scale look (no fix):** F4c i∥/i amber at fullscreen.

## ≤5 key frames
1. STATE_4__frozen — the blocking contradiction ("7.07 × 0.784 = 5.54 W?" over "3.08 / 5.55 = 0.555").
2. STATE_4__dense_t00000 + t02000 — refutes F2 (unstruck at t0, struck by t2000).
3. STATE_8__frozen — "S = 5.55 VA" (S8 consistent; S4's chip the outlier).
4. STATE_3__frozen — F4b buried negative lobe.
5. STATE_10__frozen — F4a "−0.000 A"; also confirms explore CORE-only (38b) + continuous (37).

**Cycle budget:** CpB cycle 0; after F1 lands + S4 re-drive + re-review reads 5.55 consistently, the concept APPROVES (authoring sign-off only; shipping stays founder-only) with ride-alongs to follow. Scar rows filed to scar_candidates.sql (5: F1 incident, design-doc directive, F4b, F4a, F3).
