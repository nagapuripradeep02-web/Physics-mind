# PHYSICS BLOCK — `kirchhoff_junction_rule_KCL`

*(companion to `kirchhoff_junction_rule_KCL-architect.md`; authored by physics_author. json_author reads BOTH files.)*

## Verified numbers (all arithmetic confirmed by physics_author)
- **S2** R1=R2=3Ω → R_eq=1.5Ω → I_total=2.0A, I1=I2=1.0A. "2.0 = 1.0 + 1.0" ✓
- **S3** R1=6Ω, R2=2Ω → R_eq=1.5Ω (SAME) → I_total=2.0A (pinned), I1=0.5A, I2=1.5A. "1.5 + 0.5 = 2.0" ✓
- **S4 primary (3-branch)** R1=2Ω, R2=10Ω, R3=15Ω → R_eq=1.5Ω → I_total=2.0A, I1=1.5A, I2=0.3A, I3=0.2A. "1.5 + 0.3 + 0.2 = 2.0" ✓
- **S4 fallback (2-branch reframe)** reuse S3's (6,2)Ω → I1=0.5A, I2=1.5A, "0.5 + 1.5 = 2.0"; flip both branch arrows to point INTO N, main wire = single "out".
- **Assessment** 3A+2A in, 4A out one wire → remaining wire = **1A OUT** (5 in = 4 + 1 out).

## 0. Engine bug queue (ran live, 278 rows) — prevention rules honored
- `junction` glow key ALREADY EXISTS (combination_of_resistors s5_2/s6_1) → S1 node-N glow uses it, **no new primitive**.
- NOT PCPL_CONCEPTS (site 7 skipped). Cluster registry N/A-DORMANT (drill-down deferred).
- **json_author flags:** size each state `duration` off the full motion timeline (§3), NOT word-count — S3 has ~5.5s choreography before TTS. Cue gates (S3 R2-lowers-first, S4 branch-draws-in) MUST be derivable at any pinned sim-time incl. t=0 + registered in `deriveStateMeta`. Zero `pause_after_ms` (new Rule-31 concept). Every on-canvas sum/formula must match the exact rendered branch count + numeric values for its state.

## 1. physics_engine_config

```json
{
  "physics_engine_config": {
    "variables": {
      "epsilon": { "name": "EMF (ideal cell)", "unit": "V", "constant": 3.0, "role": "locked constant ALL states incl explore; never a slider" },
      "R1": { "name": "Branch 1 resistance (top)", "unit": "Ω", "min": 1, "max": 20, "default": 3, "role": "slider — LIVE in S3 + S5; state-entry value fixed via variable_overrides on S1/S2/S3/S4" },
      "R2": { "name": "Branch 2 resistance (bottom)", "unit": "Ω", "min": 1, "max": 20, "default": 3, "role": "slider — LIVE in S3 + S5; fixed via variable_overrides on guided states" },
      "R3": { "name": "Branch 3 resistance (S4-primary only)", "unit": "Ω", "min": 1, "max": 20, "default": 15, "role": "exists ONLY if 3-branch path ships; locked on S4; live in S5 only if 3-branch renders; if 2-branch fallback, never declared/rendered" },
      "branch_count": { "name": "Branches feeding node N", "unit": "enum 2|3", "min": 2, "max": 3, "default": 2, "role": "internal flag, never UI; 2 on S1/S2/S3/S5-default/fallback-S4, 3 only on primary-path S4" },
      "R_eq": { "name": "Equivalent resistance at N", "unit": "Ω", "derived": "branch_count===3 ? 1/(1/R1+1/R2+1/R3) : 1/(1/R1+1/R2)", "role": "NOT displayed on canvas; internal sanity value only" },
      "I_total": { "name": "Total current (A_in = A_out)", "unit": "A", "derived": "epsilon / R_eq", "role": "live readout — A_in AND A_out both show this identical number every state" },
      "I1": { "name": "Branch 1 current", "unit": "A", "derived": "epsilon / R1", "role": "live readout — A₁ needle + numeric" },
      "I2": { "name": "Branch 2 current", "unit": "A", "derived": "epsilon / R2", "role": "live readout — A₂ needle + numeric" },
      "I3": { "name": "Branch 3 current (S4-primary only)", "unit": "A", "derived": "branch_count===3 ? epsilon / R3 : 0", "role": "live readout — A₃; not rendered unless branch_count===3" }
    },
    "formulas": {
      "R_eq": "branch_count === 3 ? 1/(1/R1+1/R2+1/R3) : 1/(1/R1+1/R2)",
      "I_total": "epsilon / R_eq",
      "I1": "epsilon / R1", "I2": "epsilon / R2", "I3": "branch_count === 3 ? epsilon / R3 : 0",
      "kcl_identity": "I_total === I1 + I2 + I3 (the taught rule; sum IS I_total by construction on an ideal-cell node)",
      "current_divider_number_source": "Ik = I_total*(R_eq/Rk) ≡ I_total*(1/Rk)/Σ(1/Rk) — NUMBER SOURCE ONLY for ammeter readings; NEVER a taught derivation or on-canvas formula"
    },
    "constraints": [
      "I_total = I1 + I2 (+I3) EXACTLY at every setting — this IS the taught rule (Σi_in=Σi_out)",
      "A_in and A_out are the SAME numeric value (I_total) every instant, every state — never drift/lag",
      "All currents ≥ 0; R1,R2,R3 ∈ [1,20]Ω so no divide-by-zero, no negative R, no infinite current",
      "R_eq = 1.5Ω identically on S2, S3, S4(primary) — DELIBERATE authorial invariant (Rule 32b: A_in/A_out hold still while only the split changes) — do NOT 'fix'",
      "split ratio set by CONDUCTANCE (1/R): lower R carries more current",
      "energy/heat OUT OF SCOPE (deferred to electrical_power_in_resistor) — no P=I²R anywhere",
      "current-divider formula is engine/doc only — NEVER an on-canvas formula_overlay or narrated derivation; only Σi_in=Σi_out is taught (S4)"
    ]
  }
}
```
*(Like the shipped circuit concepts, particle_field computes these natively in engine JS — `physics_engine_config` is authored as documentation per Zod, not driven by PM_interpolate.)*

## 2. Per-state variable_overrides
- **S1** `{R1:3, R2:3, branch_count:2}` — apparatus in home pose; beads through N are already the real S2 stream (no teleport into S2).
- **S2** `{R1:3, R2:3, branch_count:2}` — equal-branch "earned wrong belief" (fork=50/50); no live sliders.
- **S3** `{R1:6, R2:2, branch_count:2}` at state-entry — SCRIPTED transition (R1 3→6 and R2 3→2 TOGETHER to hold R_eq=1.5Ω, pin A_in/A_out at 2.0A). Sliders go LIVE only AFTER the reveal plays. Override distinguishes "authored opening value" from "whatever a teacher left sliders at."
- **S4 primary** `{R1:2, R2:10, R3:15, branch_count:3}` — R_eq=1.5Ω again; A_in/A_out pinned 2.0A a third time.
- **S4 fallback** `{R1:6, R2:2, branch_count:2}` (identical to S3) — keep 2 branches, flip both arrows INTO N, main/return = single "out"; only direction changes, zero new physics.
- **S5** none — all live; R1=R2=3 default (legible against the arc), R3=15 if 3-branch ships.

## 3. Within-state motion timeline (pure fn of state clock; cause→beat→effect gaps per Rule 32a)
- **S1 (0–14s loop):** beads flow steadily through N at I_total=2.0A; node N glow (`junction` key) pulses from ~0.6s; live crossing-tally shows beads-in = beads-out incrementing IDENTICALLY at N (reuses combination_of_resistors S3 tally). Controls: none.
- **S2:** 0–0.8s branch wires+streams brighten (fork activates); 0.8–2.0s A₁,A₂ needles animate 0→1.0/1.0 (effect ~1s after cause); 2.0–2.6s sum readout "2.0 = 1.0 + 1.0 A" composes after needles settle. Controls: none.
- **S3:** 0–1.0s R1/R2 dials glide (3,3)→(6,2) [CAUSE]; 1.0–1.8s readable beat (no bead change); 1.8–3.5s bottom(R2) stream thickens, top(R1) thins [EFFECT] + R1/R2 sliders now LIVE; 3.5–4.5s A₁ 1.0→0.5, A₂ 1.0→1.5, A_in/A_out hold 2.0 (glow focal → `ammeter_branches`); 4.5–5.5s ghost "1.0 + 1.0" fades in struck through beside live "1.5 + 0.5 = 2.0 A". Controls: R₁+R₂ (after reveal).
- **S4 primary:** 0–1.0s third branch (R3 box+wire) draws in, framing pans to admit it [CAUSE]; 1.0–1.8s beat; 1.8–3.2s three streams reshuffle (R1=2Ω thickest, R3=15Ω thinnest) [EFFECT]; 3.2–4.2s A₁,A₂,A₃ → 1.5/0.3/0.2; 4.2–5.0s Σ readout "1.5 + 0.3 + 0.2 = 2.0 A" builds + formula surface `Σi_in = Σi_out` appears (`glow_focal: "formula"`). Controls: none.
- **S4 fallback:** 0–1.0s both branch arrows reverse to point INTO N, main-wire "out" arrow emphasized [CAUSE]; 1.0–1.8s beat; 1.8–3.0s flow completes flip [EFFECT]; 3.0–4.0s relabel "in₁=0.5A","in₂=1.5A","out=2.0A"; 4.0–5.0s Σ "0.5 + 1.5 = 2.0 A" + formula surface. Controls: none.
- **S5 (open):** teacher drags R1/R2(/R3); all bead thicknesses, ammeters, Σ readout track live; formula surface persists. Controls: ALL (`show_sliders:true`).

**advance_mode:** `manual_click` on S1/S2/S3/S4 (S3 reveal auto-plays on entry, sliders become interactive after it lands — no special mode needed), `interaction_complete` on S5. ≥2 distinct modes (Gate 12), never `wait_for_answer`, never all-auto. json_author finalizes vs the live enum.

## 4. Board mark scheme — SKIPPED (Rule 20 dormant). epic_l_path + particle_field_config ONLY.

## 5. Drill-down cluster phrasings (migration file only — N/A-DORMANT)
**current_used_up_at_junction:** "why doesnt current go down after passing a resistor" / "shouldnt some current be lost at the junction" / "why is inflow same as outflow isnt some of it used up" / "current gets consumed by resistors right so output should be less" / "if resistor uses up current the ammeter after it should read less no"
**fork_splits_fifty_fifty:** "why doesnt it split half half at the fork" / "shouldnt both branches always get equal current" / "why is one branch getting more current than the other" / "isnt a junction always fifty fifty by definition" / "how can unequal resistors still not give an equal split I thought current always divides evenly"
**sign_convention_at_node:** "which current counts as positive in kirchhoffs junction law" / "how do i know if a branch current is entering or leaving the node" / "why is sigma i equal to zero if directions are all mixed up" / "do i take incoming current as negative or outgoing as negative" / "im confused about the sign convention when writing the kcl equation"

## 6. Constraint callouts
- Slider steps: R1/R2/R3 `step:1` Ω, range [1,20] (all overrides 2,3,6,10,15 on-grid).
- ε NEVER a slider (any state) — locked 3.0V; adding a voltage slider reintroduces excluded Ohm's-law scope.
- S3 ghost "1.0 + 1.0" is a FIXED authored string (not computed) — renders identically wherever the teacher later drags R1/R2 in S3; if no overlay primitive supports strikethrough, this is the one confirmed engine risk → peter_parker FAIL-route via auditor.
- R_eq=1.5Ω invariant across S2/S3/S4 is DELIBERATE — do not "correct."
- S4 fallback needs a bead-direction flip (both branches into N) — genuine engine risk if split-by-conductance assumes one-in/many-out; **prefer the 3-branch primary** (additive only, precedent in combination_of_resistors).
- current-divider is number-source only — only Σi_in=Σi_out surfaces on canvas (first at S4).

## FLAGS to json_author / quality_auditor
1. Author S4 as **3-branch primary** (R1=2,R2=10,R3=15); fall back to 2-branch reframe only if the third-branch build proves non-trivial.
2. Size each `duration` off the §3 timeline (S3 ~5.5s choreography before TTS) — undersizing blinds THE EYE.
3. Reuse existing `junction` glow key for S1 — no new primitive.
4. S3 ghost = fixed string; strikethrough styling is the one confirmed possible peter_parker risk.
5. quality_auditor: R_eq=1.5Ω repetition is intentional (Rule 32b) — do not flag.
