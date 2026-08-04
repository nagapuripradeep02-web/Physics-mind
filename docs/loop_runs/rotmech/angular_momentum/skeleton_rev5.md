# Skeleton — `angular_momentum` (rotmech · Class 11 Ch.7 · concept #9 · Phase 0d, Desk C) — REV 5

> **Status:** post-build quality-auditor fix revision — **F5 ONLY** (auditor FAIL finding F5, routed
> `alex:architect`: the Rule 38b ring cut was discharged by `min_ring`, a field that DOES NOT EXIST on
> the `rigid_body_rotation` scenario). **REV 4 (`skeleton_rev4.md`) is PRESERVED and carries forward
> VERBATIM except the enumerated replacement blocks below** — state count 5, the arc, C1's
> `theta0_rad` (the §3 azimuth solve), the pinned apparatus, both anchors, every A/B discharge and
> both founder rulings all stand untouched. F-C6 (NaN one-shot restart) and F-C7 (`ArrowHelper` has no
> `.emissive` → S1 focal handoff inert) are FILED engine defects, already worked around / verified —
> nothing here re-diagnoses or designs around them.
>
> **F5 RESPONSE NOTE — decision: CUT `spin_dir` from STATE_5 (`controls_visible`), keep S4 extended.**
> Verified this session: rbr `controls_visible` is a bare `string[]` (`field_3d_renderer.ts:1051`);
> the `min_ring` normalizer at `:55484–55492` belongs to `bonding_scene`; NO preset builder reads
> `depth_ring` anywhere in `src/` (sole occurrence: the Zod enum, `conceptJson.ts:105`). So REV 4's
> "(controls auto-cut by min_ring)" discharged the cut with a phantom. The fix follows the OPEN scar
> `skeleton_discharges_a_ring_cut_with_a_field_no_renderer_reads`: **re-ring or CUT the control,
> never tag it.** Cutting was chosen over re-ringing S4 to core because: (1) Rule 38b's plain reading
> is explore = core-ring content ONLY — the "ring-gated button" carve-out was doctrinally wrong even
> before the field vanished; (2) S4 is the ONLY extended state and the advanced ring is empty, so
> re-ringing it core collapses `core_only` ≡ `no_derivation` ≡ `full` — the preset table degenerates
> and Rule 38 delivers nothing for this concept, while the vector beat is exactly the material whose
> cross-syllabus depth varies (§10(i-3): IB/A-level/AP unverified); (3) the §1 Checkpoint-C open item
> (S4 duplicates #10's S6) may yet reshape S4 at chapter level — extended keeps that decision cheap,
> core welds it into every preset; (4) the sandbox cost is small and CHECKED: `m` and `ω₀` both
> demonstrate L = Iω live (reachable |L| = I·ω₀ ∈ [1.14, 8.68] ⊂ the arrow's faithful band
> [1.10, 9.00], §3 A4-ii; the arrow tracks the product during every drag, readouts re-pin 0.5 s after
> release), and the teacher's live direction control SURVIVES in the `full` preset inside S4 itself
> (Rule 31c — S4's own `controls_visible: ["spin_dir"]`, co-located with the state that teaches
> direction, Rule 25). Discharge mechanism, verified against real code: `rbrToggleSliderRows`
> (`:50128–50142`) shows only rows the APPLIED state names, so with S4 hidden and S5 no longer naming
> `spin_dir`, the row is never visible under the cut — ring assignment of the carrying state + a
> control cut from explore, zero invented fields. Bonus: spin now never goes negative in S1/S2/S3/S5
> under ANY preset, making REV 4's "sign colours never engage" claim true by authoring instead of
> conditionally.

---

## REPLACEMENT BLOCKS (everything not named here = REV 4 verbatim)

### R1 — §3 control table, S4 row, "Live controls" cell

REPLACE
> spin-direction button *(min_ring: extended)* — drives the SAME restart mechanism live
> (`:50100–50111`), never eased through zero

WITH
> spin-direction button — drives the SAME restart mechanism live (`:50100–50111`), never eased
> through zero. *(No ring tag — no such field exists on rbr. The button is S4's per-state contextual
> control (Rule 31c) and dies WITH the state under any cut that hides S4: state-hiding is the
> mechanism, `rbrToggleSliderRows` `:50128–50142`.)*

### R2 — §3 control table, S5 row

DELETE the sentence "The spin-direction button restarts with the sign flipped." from the authored-beat
cell, and REPLACE the "Live controls" cell
> `m` *(core, `slider_controls` 0.5–3.0 kg)* · `ω₀` *(core, 1.0–2.0 rad/s)* · spin-direction
> *(extended)*

WITH
> `m` *(`slider_controls` 0.5–3.0 kg)* · `ω₀` *(1.0–2.0 rad/s)* — each maps to a surviving CORE
> guided state under every cut (`m` → S3, `ω₀` → S2). **`spin_dir` is CUT from S5** (Rule 38b:
> explore = core-ring content only; direction is S4's extended material, and its live control lives
> inside S4). Consequence: S5's spin never goes negative — the sign colours and signed readouts are
> S4-only phenomena in every preset.

### R3 — §10 DoD (b), "Restart badge" row, "First PRINTED at" cell

REPLACE "S3 17500 / S4 11000 / S5 on m/ω₀/direction events"
WITH "S3 17500 / S4 11000 / S5 on m/ω₀ events".

### R4 — §10(i-1), the *Hide advanced+extended* walk (full replacement of that walk)

> *Hide advanced+extended (drop S4):* S1–S3 + S5 — coherent: the axial L arrow debuts in S1 (core)
> with T4's introducing clause, so no surviving state shows an unexplained overlay; direction is
> never narrated in S1–S3 (S1's clause is magnitude-only) and S5's narration + annotation (revised,
> R9) name mass + spin speed only; spin never goes negative in any surviving state, so the sign
> colours and U+2212 signed readouts never engage; the formula surface `L = Iω` is core on every
> surviving state. **Controls walk (the F5 discharge):** every control a surviving state exposes maps
> to a surviving guided state whose `depth_ring` survives the cut — S5 exposes `m` (→ S3, core) and
> `ω₀` (→ S2, core) ONLY; `spin_dir` appears in NO surviving state's `controls_visible` — its sole
> occurrence is S4's own per-state list, hidden with S4. The cut is discharged by RING ASSIGNMENT of
> the carrying state plus the control cut from explore — no field is consulted, because none exists
> (`controls_visible` bare `string[]`, `:1051`; no preset builder reads `depth_ring` in `src/`) ✓.
> **Recorded residual (Checkpoint C, not a defect):** `entry_state_map.vector_direction → STATE_4`
> routes a query ASPECT into extended-ring content, hidden under this preset — same behavior class
> as the future `derivation` aspect under `no_derivation`; presets are teacher-facing display cuts,
> the entry map is the query router, and 38g keeps every preset teacher-invisible until a real
> teacher verifies it, so the seam never ships live.

### R5 — §10(i-2)

REPLACE the clause "S5's live controls are core except the ring-gated direction button ✓"
WITH "S5's live controls (`m`, `ω₀`) are core-mapped in full — `spin_dir` cut per 38b ✓".

### R6 — §10(i-4)

REPLACE "`core_only` = hide S4 (controls auto-cut by min_ring)"
WITH "`core_only` = hide S4 (the ONLY extended state; its `spin_dir` button is authored ONLY in S4's
`controls_visible`, so it disappears with the state by state-hiding — no field consulted; S5 names
`spin_dir` nowhere)".

### R7 — ENGINE-REALITY WALK, `controls_visible` row, "Consumed by" column

REPLACE "S4 ['spin_dir'], S5 ['m','omega0','spin_dir']"
WITH "S4 ['spin_dir'], S5 ['m','omega0'] — F5: `min_ring` does NOT exist on rbr (`:1051` bare
`string[]`; the `:55484–55492` normalizer is `bonding_scene`'s; `depth_ring`'s only `src/` occurrence
is the Zod enum, `conceptJson.ts:105`)".

### R8 — SCAR AUDIT, disposition #35 (full replacement) + one appended row

REPLACE #35's disposition
WITH "35. `explore_controls_not_ring_gated_survive_the_ring_cut` — SUPERSEDED by the newer row (next);
its 'carry a min_ring' prevention rule named a field no rbr code reads. Discharged the superseding
way: S5 `controls_visible` = ['m','omega0'] only; `spin_dir` rides S4's state-hiding. §10(i-1)."

APPEND
> 35b. `skeleton_discharges_a_ring_cut_with_a_field_no_renderer_reads` (OPEN, `alex:architect`,
> filed 2026-08-04 mid-session — landed after this concept's Checkpoint A, which is why no upstream
> stage saw it) — BINDS: a ring cut is discharged by RING ASSIGNMENT, never by a field; every control
> the explore state exposes must map to a guided state whose `depth_ring` survives the cut; the fix
> is to re-ring or to CUT the control, not to tag it. Discharged: R2/R4/R6 above; both cuts
> re-walked against the real mechanism (`rbrToggleSliderRows` `:50128–50142`).

### R9 — json_author handoff (the EXACT JSON deltas; nothing else in the JSON moves)

1. `field_3d_config.states.STATE_5.rigid_body_rotation.controls_visible`:
   `["m", "omega0", "spin_dir"]` → `["m", "omega0"]`.
2. `epic_l_path.states.STATE_5.teacher_script.tts_sentences` `s5_1` `text_en`:
   `"Change the mass, the spin speed, or the direction, and try it yourself."`
   → `"Change the mass or the spin speed, and try it yourself."`
3. `epic_l_path.states.STATE_5.scene_composition` annotation `am_s5_head` `text`:
   `"Change the mass, the spin speed, or the spin direction freely"`
   → `"Change the mass or the spin speed freely"`
4. `field_3d_config.states.STATE_5.label` (dev-facing record): append
   `"; spin_dir excluded (S4-only — Rule 38b)"` to the existing exclusion clause.

DO NOT TOUCH: `STATE_4.rigid_body_rotation.controls_visible: ["spin_dir"]`; the physics block's
spin-direction variable entry; STATE_5's rendered `caption: "Try it yourself"`; `am_s5_detail` /
`am_s5_anchor`; `entry_state_map`; anything in S1–S4. TTS: `s5_1`'s `text_en` changed → any rendered
EN clip for it is stale (hash-aware `tts:generate` re-fetches only that clip, on demand — Rule 30h);
`text_hi` count in this JSON is 0, so no re-translation is due now.

### Re-walked preset table (supersedes any REV 4 preset summary)

| Preset | States | Surviving explore controls | Coherent? |
|---|---|---|---|
| `full` | S1–S5 | S5: `m`, `ω₀` · (S4 in-state: `spin_dir`) | ✓ — direction control co-located with S4 |
| `no_derivation` | S1–S5 (advanced ring empty — identity today) | same as `full` | ✓ trivially; exists for the L = r × p retrofit |
| `core_only` | S1, S2, S3, S5 | S5: `m`, `ω₀` only | ✓ — R4 walk above |

---

*Everything else — §1 atomic claim, §2 arc, §3 choreography/timings/pins/camera/theta0 solve, §4–§9,
§10(a)–(h), (i-3), (i-5), Blocks 1–2, all fix-cycle tables — REV 4 verbatim.*
