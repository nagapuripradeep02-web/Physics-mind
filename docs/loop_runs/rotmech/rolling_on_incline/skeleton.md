# SKELETON — `rolling_on_incline` (chapter `rotmech`, Class 11 Ch.7 — Systems of Particles & Rotational Motion) — REV 6 (post-escalation revision — authorised by FOUNDER RULING 4; supersedes REV 5)

> **Phase-0 role:** 0b spec driver for build **0c-2** (bounded rotational extension to `newtons_laws_body`). founder-proxy Checkpoint A: REV 2 → `DESIGN_FIX`, REV 3 → `DESIGN_FIX`, REV 5 → **`ESCALATE`** (`founder_proxy_A_cycle2_final.md`) — the fix-cycle budget was spent and ONE decision was parked to the founder. **The founder answered on 2026-08-02 (RULING 4 below) — this revision is the one the escalation asked for, not a new fix cycle.** Everything the escalation verified ("verified and holding — do not churn") is carried untouched: the finish semantics, the checkpoints diff, the synchronised restart, the arrow-map force channel and every re-computed value, the glow ruling, the back-compat clause, the eleven-id sweep, every re-derived timing row (S1/S2/S3/S4/S5/S7), A-1…A-13, and the E-numbering scheme. REV 3 at `skeleton_rev3.md`; REV 4 at `skeleton_rev4.md`; REV 5 at `skeleton_rev5.md`.
> Survey: `docs/loop_runs/rotmech/phase0_survey.md`. Concept #12 of 14, ★ Diamond, V1. Sibling: `pure_rolling` (#11 — REV 3 against the same ruling).
> **FOUNDER RULING 1 (2026-08-02):** the survey's 0c-2 row amendment is SIGNED-in-principle — the union is enumerated honestly and completely, not shrunk. **FOUNDER RULING 2:** the arrow map is authorable per-concept, defaults preserved; widened to TWO channels. **FOUNDER RULING 3 (identical contract for both concepts):** (i) two-phase 16a beats stay ONE state on `bodies[].activate_at_ms`; (ii) three-phase states SPLIT (A5 deleted); (iii) `lane_gap_m = 0` legal; (iv) S6's hold-then-release is the single-body case of the same mechanism; (v) the buy is narrowly scoped — no general choreography DSL.
> **FOUNDER RULING 4 (2026-08-02 — the escalation's answer; identical contract for both concepts):** the middle path. **BUY the formula-line reveal ONLY (E18, narrowed to one of the escalation's two halves):** `formula_overlay` becomes an ordered list of lines, each with its own optional `at_ms` — same discipline as `activate_at_ms` (pure function of state-local t; absent ⇒ today's single-string behaviour byte-identically; pin/rewind byte-stable; **registered in `deriveStateMeta.ts`'s nlb reveal-candidate list, `:2739–2994`, or THE EYE mis-pins**). **DO NOT BUY per-arrow `show_at_ms`:** S6's three force arrows are static from state entry, and their teaching sequence is carried by `phases[].glow_focal` (`nlbRunPhases`, `:45296–45310` — exists, Rule-29 native). Reasoning as ruled: three visible force arrows from t = 0 is honest physics, not a spoiler; what genuinely prespoils is the final formula line, which IS the answer the state derives. **The 0c-2 buy is therefore TWO timed field classes — `activate_at_ms` (bodies) and per-line `at_ms` (the one formula surface) — and the scope guard is restated at exactly that boundary** (§3). Ruling 3(v) is amended by this ruling and only by it.
> **Routing correction (carried):** `field3d_nlb_physics_clock_not_state_local` is owned `peter_parker:renderer_primitives` → dispatches the **pcpl-surgeon** agent. E1 must be dispatched on that tag.
> **Cross-document contract note (P2-2/P2-5):** §3's ACTIVATION SEMANTICS ¶ and FORMULA-LINE REVEAL ¶ are the **single canonical source** for both bought fields across the pair; #11's REV 3 quotes them verbatim. Cross-references to #11's states go by CONTENT with the REV-2 number quoted in parentheses (scar rule: never a bare state number across a renumbering).

## RULING-RESPONSE (RULING 4 + the escalation's six carry-forwards + the sibling's cross-document items → what changed → where)

| # | Item | What changed vs REV 5 | Where |
|---|---|---|---|
| R-1 | **RULING 4 buy** — formula-line reveal | New **FORMULA-LINE REVEAL SEMANTICS** ¶ (canonical; sibling imports verbatim): `formula_overlay` as ordered lines `{text, at_ms?}`; absent-list/legacy-string ⇒ byte-identical; `deriveStateMeta` registration mandatory; presence by `typeof`, `at_ms = 0` legal. New union row **U16/E18** | §3 FORMULA-LINE REVEAL ¶; U16/E18; S6 row |
| R-2 | **RULING 4 refusal** — no per-arrow `show_at_ms` | S6's three arrows are **static from state entry** at the tabled force-channel lengths; the mg sin θ → N → f_s sequence is a **glow-walk** on `phases[].glow_focal` with hand-back (windows 400–800 / 800–1200 / 1200–1600 ms). The REV 5 "arrows draw in sequence 450/900/1350" beat — the escalation's blocking finding — is deleted. One declaring sentence added: the held phase is the derivation's free-body diagram for the ROLLING case (the `a` readout holds 0.00 until release, then matches 2.76) | §3 S6 row; glow table S6 row |
| R-3 | **RULING 4 fence** — scope guard restated | TWO timed field classes and only two (`activate_at_ms`; per-line formula `at_ms`) — no per-arrow reveal, no per-label reveal, no `phases[].action` revival, no choreography DSL; **a THIRD timed class = the alarm rule** | §3 scope guard; U10; U16; build sheet |
| R-4 | **RULING 4 timing** — S6 re-derived | Last asserted REVEAL is now the final formula line at **2200 ms** (47.8%); release (activation) 2500 (54.3%); pin 2760 lands **560 ms after the final line and 260 ms after release** ✓; the 300 ms gap between the derived answer and the release that verifies it is the Rule-32a readable beat. Halt 4305, loop 4600, pin = 0.60R exactly — unchanged | §3 timing table S6 |
| R-5 | **P2-1** — the union dropped items its state table consumes | **(b)-7 `rotation_locked` restored as U14/E19**; **(b)-15 centre markers restored as U15/E20**; a full **(b)-1…(b)-19 → U mapping walk** added, plus a state-primitives→union walk. The walk surfaced a THIRD unrowed item: the **μ_min tick** (named by S7/S8 and REV 3's (b)-5, no REV 5 U-row) — folded into U1, no new E | Build sheet U14/U15 + mapping walk; U1 |
| R-6 | **P2-2** — two documents, two semantics | Canonical-source declaration added: #11 imports the ACTIVATION SEMANTICS ¶ verbatim; its 1400 ms dissolve is deleted on its side — retirement at the successor's activation is the ONLY phase-boundary rule | Header note; §3 ¶ |
| R-7 | **P2-3** — S7's clamping friction arrow was untabled | S7's two friction values **added to the arrow-map table**: pre-slip ring f_s = 2.0708 N → 0.621 wu (no clamp); post-slip f_k = 0.4441 N → true 0.133 wu, **renders CLAMPED at the 0.25 floor (1.88× overstated; the drop reads 2.5× instead of 4.7×)** — and **declared honest-by-scope**, grounds stated (the taught contrast is the friction TYPE flip + contact leaving zero, carried by the label flip, skid trail, spin lag and the live latched `f_k 0.44 N` readout — never a length ratio). "No clamp anywhere" re-scoped to S6's drag range + S3 | §3 arrow-map table + declaration |
| R-8 | **P2-4** — one field, two E numbers | **E7b merged into E10** (one field, one code site `nlbBodyLaneZ` `:39992–40001`, one dispatch number); E7b marked RETIRED | U8; E-numbering note |
| R-9 | **P2-5** — (b)-19 mis-quoted its own row | Acceptance re-worded to the live DO: *"H2 PASSES its tolerance AND any non-zero percentage reproduces on the PRE-change renderer **or has max channel delta ≤ 3**"*, settled by a pre/post pixel diff (bounding box + max channel delta). The invented "recorded wobble band" phrasing removed everywhere | Build-sheet preamble; SCAR AUDIT |
| R-10 | **P3-1** — retirement gated on a rendering value | Retirement now fires only in states authoring an explicit **`single_lane: true`** — never inferred from `lane_gap_m === 0`. S3 authors both flags | §3 ACTIVATION ¶; S3 row; U10; U8 |
| R-11 | **P3-2** — E9's expectation names the whole body | Pre-activation hiding enumerated: mesh, **arrows (separate path, `nlbDriveArrowsForBody`), labels, trail, readout rows** | §3 ACTIVATION ¶; U10 |
| R-12 | **P3-3** — the `readouts` enum never diffed here | Diffed in THIS document: `:1336` closed union lacks `KE_trans`, `KE_rot`, `contact`, `Rω` and bare `ω`; U4's buy EXTENDS the enum (declaration + reader + validator co-edit) | U4 |
| R-13 | **Sibling P2-5(i)/(ii)** — stale `#11 S4` references | U10's consumer column and E8's shape note re-referenced by content; **both `#11 S4` force-table rows STRUCK** (#11 draws no force arrows); U7's consumers re-referenced by content | Arrow-map table; U7; U10; E8 |
| R-14 | **Sibling P2-6 (adopted)** | Every new optional field has a legal falsy value. Added to E9/E10/E11/E18 acceptance: *presence resolved by `typeof x === 'number'` / `in`, never truthiness; the regression pair asserts authored-0 and absent produce DIFFERENT geometry wherever semantics differ, and notes where they coincide by definition* | Build-sheet preamble; E9/E10/E11/E18 |

## AMENDMENT-TO-REV-4 (preserved from REV 5; brackets where REV 6 supersedes)

| # | Item | What changed vs REV 4 | Where |
|---|---|---|---|
| A-1 | RULING 3(i) — `activate_at_ms` bought | ACTIVATION SEMANTICS ¶: activation instant, seed-at-activation, default-hidden-before, single-lane retirement, `visible_before_activation` *(REV 6: retirement gated on `single_lane: true` — R-10; whole-body hiding enumerated — R-11; guard restated at the two-class boundary — R-3)* | §3 ¶; U10/E9 |
| A-2 | S3's dissolve cue did not exist | Phase A = full 0–1500 ms skid; disc ACTIVATES / block RETIRES at 1500 — hard cut; trail clears. Numbers verified (pin 1920 = 420 ms after activation; block never clamps — 1961 > 1500) | §3 S3; timing table |
| A-3 | RULING 3(iv) — S6's held disc | `activate_at_ms = 2500` + `visible_before_activation: true`; release 2500 → pin 2760 ✓; halt 4305; loop 4600 *(REV 6: the choreography inside the hold is re-authored per RULING 4 — R-1/R-2/R-4; the hold mechanism is unchanged)* | §3 S6; timing table |
| A-4 | RULING 3(iii) — gap 0 legal | S3 authors gap 0 *(REV 6: + explicit `single_lane: true` — R-10)* | §3 S3; U8 |
| A-5 | RULING 3(ii) — A5 deleted | E8's shape note: up to TWO sequential activation bodies per state | Build sheet E8 |
| A-6 | Sibling P1-B — two-channel map | Force + velocity channels, defaults `0.048`/`0.55`; zero-vector marker; FORCE channel (0.30/0.25) verbatim *(REV 6: the two `#11 S4` force rows STRUCK; S7's values tabled + declared — R-7/R-13)* | §3 arrow-map ¶; U7/E11 |
| A-7 | Sibling P1-D — marks off `checkpoints` | Marks + bracket → own primitive U11/E12 (#11-only) | U4; U11/E12 |
| A-8 | Sibling P2-4 — wrap re-seeds v only | ω re-seed: per-body wrap (U12/E13) + S8's synchronised restart for ALL bodies (U6/E4) | §3 S8; U6; U12 |
| A-9 | Sibling P2-7 — matcher registration | E8 enumerates the set; matcher row = E14 (pcpl-surgeon) | E8; E14 |
| A-10 | Sibling P2-1 — A1 as branch PRIORITY | U1: the rolling branch SUPERSEDES Branch A's kinetic path (`:45497–45499`) while rolling holds; θ = 0 is the TEST case | U1 |
| A-11 | Sibling P2-3 — close cameras vs the run | Run-midpoint targets + framed extents tabled (S2: 3.0 m; S6/S7: 5.4 m) | §3 framing plan |
| A-12 | Scar sweep re-run | `eye_h2…` applied to (b)-19 *(REV 6: acceptance corrected to the row's actual DO — R-9)*; `concept_ships_zero_narration_glow_bindings` routed | SCAR AUDIT |
| A-13 | Housekeeping | HOLD note removed; E-collision resolved *(REV 6: + E18 = RULING 4's formula-line reveal; E19/E20 for restored U14/U15; E7b retired into E10)* | Header; numbering note |

## FIX-CYCLE-2 RESPONSE (preserved so the reviewer can verify the original fix set)

| Finding | What changed | Where |
|---|---|---|
| **P1-A(1)** finish semantics | Per-body HALT-AND-LATCH at own CoM crossing; S5 reads sphere `7.0 / 2.8` beside ring `4.9 / 4.9`; the 14.0 J frame impossible by construction | §3; (b)-16 |
| **P1-A(2)** checkpoints enum diff | Four line-numbered reasons; F9/finish reuses the crossing interpolator, bypasses stamp rendering | §3; (b)-16 |
| **P1-A(3)** S8 per-body wrap | Synchronised all-body race restart; Rule 37 preserved; DoD (j)(2) achievable | §3 S8; (b)-17 |
| **P1-A(4)** loop_reset re-derivation | Full timing table against halted geometry, all eight states | §3 timing table |
| **P1-B / RULING 2** arrow map | `arrow_scale = 0.30`, `min_len = 0.25`; S6 lengths 1.243 / 2.665 / 0.414 all unclamped; θ narrowed 20°–40° *(REV 5: became the FORCE channel; REV 6: S7's clamp tabled + declared — R-7)* | §3 arrow-map ¶ |
| **P1-C** glow ruling | Per-state channel table; S4/S5 author NO state-level focal; E6 blocking for S4 | §3 glow table; E6 |
| **P1-D** S2/S3/S6 timing | All three tabled *(REV 5: S3 superseded by A-2; REV 6: S6's arrow/formula sub-beats superseded by RULING 4 — R-2/R-4)* | §3; timing table |
| **P1-E** back-compat clause | Every field OPTIONAL; absent ⇒ today's behaviour byte-identically; EYE regression pair *(REV 6: criterion re-quoted — R-9; falsy discipline — R-14; `formula_overlay` added to the covered list)* | (b)-19 |
| **P2-1…P2-4, P3-1, P3-2, #11 A1–A5** | Scar sweep; radius clause; t = 0 worst case; frame-fit bound; no invisible wall; S1 title; the four sibling flags AGREE, A5 DELETED | as tabled at REV 5 |

**Engine bug queue consultation (REV 6):** REV 5's full consultation stands — the escalation report independently re-ran it (eleven-id sweep, same 29 OPEN rows; every renderer citation re-read; **both concepts still return 0 rows — the sibling review's five candidates + three upserts AND the escalation's three candidates + one upsert are still unfiled; the dispatching session files all of them before the 0c-2 dispatch**). REV 6's deltas introduce no mechanism outside RULING 4's named buy. All rolling motions remain tier **[NEEDS-SCENARIO]**.

## 1. Atomic claim

This concept teaches that a body rolling without slipping down an incline accelerates at a rate set ONLY by the dimensionless shape factor k = I/mR² — so four shapes released together always finish in the fixed order solid sphere, disc, hollow sphere, ring, regardless of mass or radius. It does NOT teach the rolling constraint itself or contact-point kinematics in depth (`pure_rolling` #11, which precedes it; here one compact recap beat), and it does NOT teach rotational kinetic energy as a topic; the energy split appears only as the extended-ring explanation of the race.

## 2. State count + arc

**8 states** (complex — 7–9 band). Rings: core S1–S4, extended S5, advanced S6–S7 (contiguous, immediately before explore), explore S8.

| State | Title (Rule 41 — literal, rail-truncation-safe) | Purpose | teaching_method | depth_ring |
|---|---|---|---|---|
| STATE_1 | **Four shapes, one finish order** | Hook — four bodies released together finish in a fixed order, every time | straightforward beat | core |
| STATE_2 | Rolling links v and ω | Recap of #11: v = Rω on screen — cycloid cusp + equal readouts, on #11's own wheel radius | straightforward beat | core |
| STATE_3 | The friction is static | RM-G7 kill: contact speed 0.00 ⇒ static, not kinetic — SEQUENTIAL contrast with a skidding block | straightforward beat (16a) | core |
| STATE_4 | Mass and radius cancel | Second kill: a heavy large sphere and a light small sphere TIE — only k = I/mR² matters | straightforward beat (16a) | core |
| STATE_5 | The same energy, split two ways | WHY (AP/IB/NCERT route): same drop = same total KE; the ring puts more into spinning | straightforward beat | extended |
| STATE_6 | One formula ranks all four | a = g sin θ/(1 + I/mR²) built from the CoM equations | derivation_first_principles | advanced |
| STATE_7 | Low friction: rolling becomes slipping | Regime switch: μ_s below (k/(1+k))·tan θ → contact slides, friction flips kinetic | straightforward beat | advanced |
| STATE_8 | Try every variable | Sandbox — controls per `min_ring`, core-ring readouts only; synchronised race restart | exploration_sliders | explore |

The hook MOVES (S1 is the race itself). No `narrative_socratic`, no `wait_for_answer`, no `pause_after_ms`.

## 3. Per-state choreography + control plan (Rule 31 control table)

**FINISH-LINE SEMANTICS (unchanged):** any state may author a `finish_line` at track coordinate `s_finish`. When a body's **CoM track coordinate crosses `s_finish`** (crossing-interpolated — the FIXED `nlb_checkpoint_capture_overshoots_exact_crossing_value` machinery, `:44240–44262`), that body **HALTS at the line** (position pinned, v → 0, a → 0) **and its compared readouts, chips and labels LATCH at their crossing-instant values** to state end. The halt is a FINISH, not a wall: friction TYPE and every label latch as-at-crossing, never re-derived at rest (`:45584–45590` — S7's ring holds `f_k`). Trails and traces break at the halt and at every reset. **No state ever reaches the track-bound clamp (`:45582–45591`) on screen.** Mechanism = (b)-16/E3.

**ACTIVATION SEMANTICS (RULING 3 — CANONICAL for the pair; #11 REV 3 quotes this verbatim; U10/E9):** a body may author **`activate_at_ms`** (optional; absent ⇒ active from state entry — the (b)-19 default; presence resolved by `typeof`, never truthiness — authored 0 ≡ absent by definition). Before its activation instant the body is **NOT integrated and entirely absent from the frame: mesh, force arrows (their own draw path, `nlbDriveArrowsForBody`), labels, trail/trace geometry and readout rows are all hidden** (R-11); AT it, the body is seeded at its authored `initial_position_m`/`v₀` (and ω₀ per U1) and integrates on the state-local clock. Two derived rules, both on the SAME authored instants — no third timed field:
- **Single-lane retirement — gated on an explicit `single_lane: true` state flag (R-10), never inferred from `lane_gap_m === 0`:** in a `single_lane: true` state, a body is live from its own `activate_at_ms` (absent ⇒ 0) until the NEXT body's, at which instant it **retires** — hidden, no longer integrated, its trail cleared. A state authoring `lane_gap_m = 0` WITHOUT `single_lane: true` keeps all bodies co-visible. The retirement cut is HARD (the buy has no dissolve animation) — declared, bridged by narration where used (S3, which authors both flags).
- **Held-visible single body:** a state's ONLY body may author **`visible_before_activation: true`**: it renders at its seed pose with v = 0, a = 0 (arrows, labels and the formula surface live on it) until its activation — Ruling 3(iv)'s release-cue-on-a-held-body, as one boolean on the bought instant (S6).

**FORMULA-LINE REVEAL SEMANTICS (RULING 4 — CANONICAL for the pair; #11 REV 3 quotes this verbatim; U16/E18):** a state's `formula_overlay` may be authored as an **ordered list of lines**, each `{text, at_ms?}`, rendering on the ONE existing formula surface (`:44801`; Rule 34b — still one surface). A line renders from its `at_ms` as a pure function of state-local t (pin/rewind byte-stable); `at_ms` absent on a line ⇒ visible from state entry (authored 0 ≡ absent; presence still resolved by `typeof` so the code path is uniform). Authoring the legacy single string ⇒ today's behaviour **byte-identically** ((b)-19). The checkpoint stamper (`:44374–44389`) appends after the last authored line (fleet-defined; this pair bypasses stamps per U5). **The field MUST be registered in `deriveStateMeta.ts`'s nlb reveal-candidate list (`:2739–2994`) — the last line's `at_ms` joins the max-reveal computation — or THE EYE mis-pins.**

**Scope guard (Ruling 3(v) as amended by RULING 4):** 0c-2's timed surface is exactly **TWO field classes — `bodies[].activate_at_ms` and `formula_overlay[].at_ms` — and nothing else.** No per-arrow `show_at_ms`, no per-label reveal, no `phases[].action` revival, no per-body show/hide timeline, no general choreography DSL. Retirement and `visible_before_activation` are derived semantics on the activation instant. **If the surgeon finds a THIRD timed class needed, that is the alarm rule firing — STOP and re-scope with the survey.**

**ARROW MAP (RULING 2, two channels — binding both concepts; U7/E11):** per-concept-authorable in two independent channels, each defaulting to today's constants (`0.048`/`0.55`, `:39661–39662`; clamp `:40602–40607`; `NLB_ARROW_MAX_LEN = 2.80`, `NLB_ARROW_EPS = 0.05`, `:39663–39665`).

**Force channel — authored here: `force_scale = 0.30` wu/N · `force_min_len = 0.25` wu.** Rendered lengths *(REV 6: the two `#11 S4` rows STRUCK — #11 draws NO force arrows (R-13); S7's two values ADDED (R-7))*:

| State | Arrow | F (N) | Rendered L (wu) | Clamp? |
|---|---|---|---|---|
| S6 (disc, m = 1 kg, θ = 25°) | mg sin θ | 4.1417 | **1.243** | no |
| S6 | N = mg cos θ | 8.8818 | **2.665** | no (< 2.80, margin 0.135) |
| S6 | f_s = k·mg sin θ/(1+k) | 1.3806 | **0.414** | no — 1.66× the 0.25 floor |
| S3 | f_k = μ_k·mg cos θ | 1.3323 | 0.400 | no |
| S3 | f_s (rolling half) | 1.3806 | 0.414 | no |
| S7 (ring, pre-slip) | f_s = k·mg sin θ/(1+k), k = 1 | 2.0708 | **0.621** | no |
| S7 (ring, post-slip) | f_k = μ_k·N = 0.05 × 8.8818 | 0.4441 | **renders 0.25 (floor)** — true 0.133 | **CLAMPS — declared** |

True ratios rendered exactly in S6: N : f_s = **6.43 : 1**, mg sin θ : f_s = **3.00 : 1**. **Drag-range honesty:** S6's θ slider is **20°–40°** — across that range no S6 arrow clamps (20°: N = 2.763 ≤ 2.80, f_s = 0.335 > 0.25; 40°: N = 2.252, f_s = 0.630). **S3's near-equal f_k/f_s lengths declared honest** (the forces ARE near-equal; the taught contrast is the friction TYPE). **S7's post-slip clamp declared honest-by-scope (R-7):** at the floor the arrow overstates f_k 1.88×, so the friction DROP reads ~2.5× instead of ~4.7× — accepted, because S7's taught claim is the REGIME switch, not a length ratio: the flip is carried by the label f_s → f_k, the skid trail appearing, the spin visibly lagging, the contact readout leaving 0.00, and the live **`f_k 0.44 N` readout** (latched as-at-crossing), which carries the true magnitude the arrow cannot. Same declaration class as S3's pair. The scar-row closure claim is accordingly scoped: **closed for every COMPARED arrow** (S6's three across its whole drag range; S3's pair); S7's single post-slip arrow clamps, tabled and declared.

**Velocity channel — `velocity_scale`/`velocity_min_len`** (wu per m/s): consumed by #11's point-speed states. **#12 draws NO point-speed velocity arrows anywhere**; the channel VALUES are authored by #11, and if #12 ever adds them it binds to those same values — one chapter value, Rule 32d. **Zero-vector marker (fleet definition):** an exactly-zero vector renders as a **labelled dot + its value** — never a stub, never a floored arrow.

| State | Teaches | Archetype | Distinct motion | Delta cue | Live controls | Words | Ring |
|---|---|---|---|---|---|---|---|
| S1 | Shape decides the finish order | `translate-through` | Four visibly different bodies (equal m = 1 kg, R = 0.15 m; rotation markers per A3) roll from a common start line, released simultaneously, approaching the camera; they separate; **each body HALTS AT the finish line as its CoM crosses `s_finish = −2.1`** (crossings 1744 / 1805 / 1903 / 2085 ms) and its chip stamps 1-2-3-4 at the crossing; by 2085 ms the frame is a finish-line LINEUP; loop resets, same order every time | "Four shapes, one ramp" | none | 40–50 (incl. ≤12-word anchor) | core |
| S2 | v = Rω in action (recap of #11) | `flow-along-path` | ONE recap disc at **R = 0.25 m — #11's own wheel radius** (`nlb_disc_recap`); released from rest, rolls 2.0 m (+2.4 → +0.4) in 1204 ms (1.27 revolutions — one full arch); the marked rim dot's trace comes to a **cusp** at the ground touch (754 ms) while `contact 0.00 m/s` holds; **halt-latches at s = +0.4** with v and Rω equal (3.32 = 3.32). No point-speed arrows | "v equals R ω" | none | 30–45 | core |
| S3 | The contact friction is STATIC | `null-result-hold` | **SEQUENTIAL on the activation mechanism; authors `single_lane: true` + `lane_gap_m = 0`** (both bodies z = 0; the default 0.85 gap would split them 1.7 m across the track): 0–1500 ms the locked block ALONE skids (active from entry; `rotation_locked` — U14; μ_k = 0.15, a = 2.809 m/s², 3.16 m of visible skid +2.4 → −0.76) — contact slides, f_k label + arrow (0.400 wu), skid trail, contact readout ≠ 0; **at 1500 ms the disc ACTIVATES (`activate_at_ms = 1500`, seeded s₀ = +2.4, v₀ = 0) and the block RETIRES** (single-lane rule — hard cut, declared; narration bridges it; the block's trail clears with it); the disc descends rolling (μ_s = 0.50) — `contact 0.00`, f_s label + arrow, no trail; loop ends with the disc mid-track at s = −1.59 (1.41 m clear). The block never reaches the bound (clamp would be 1961 ms > its 1500 ms retirement) | "Contact point speed: zero" | none | 40–55 | core |
| S4 | Only k matters — mass and radius cancel | `translate-through` — declared contrast pair with S1 | A large heavy sphere (5 kg, R = 0.30) races a small light one (0.5 kg, R = 0.10), released simultaneously, approaching the camera; centres stay exactly abreast (**centre markers — U15**, the CoM tie metric); **both halt at the line in the SAME frame (1745 ms) and both chips stamp "TIE" at the crossing**; the small sphere visibly spins 3× faster; both k chips read 0.40; m₂/R₂ re-drag re-runs and it still ties | "Mass and radius cancel" | m₂, R₂ | 35–50 | core |
| S5 | WHY: the energy split | `cycle-compare` — count-up, arrive, HOLD | Solid sphere beside ring, same 1.00 m drop (d = 2.366 m): release → value-only readouts count up, DERIVED live (KE_trans = ½mv², KE_rot = ½k·mv²) → **the sphere halt-latches at ITS crossing (1265 ms): `KE_trans 7.0 J · KE_rot 2.8 J`; the ring at 1512 ms: `4.9 J · 4.9 J`** → from 1512 ms the held side-by-side: both at the line, totals identical (mgh = 9.8 J), splits different, sphere's chip first. NO energy bars — SEAM-M readouts only | "Same energy, different split" | none | 40–55 | extended |
| S6 | a = g sin θ/(1 + I/mR²) | `reveal-build` | **Disc visible AND held at home from t = 0: `activate_at_ms = 2500` + `visible_before_activation: true`** (genuinely un-integrated). **All three force arrows render STATIC from state entry** at the tabled lengths — the held phase is, declared, the derivation's free-body DIAGRAM for the rolling case (f_s at its rolling value; the `a` readout holds 0.00 through the hold and jumps to 2.76 at release, the formula's live check). The teaching sequence is a **glow-walk on `phases[].glow_focal`** (RULING 4 — no arrow reveal): mg sin θ 400–800 ms, N 800–1200, f_s 1200–1600, hand-back. The formula surface then **builds line by line on per-line `at_ms` (U16/E18)**: `f·R = I_cm·α` at **1600**, `f = k·m·a` at **1900**, `a = g sin θ/(1+k)` at **2200** (CoM route, no parallel-axis) — the final line IS the answer, and it is the last reveal; **activation = release at 2500 ms** (a 300 ms readable beat after the derived answer — the formula predicts, the release verifies); live a readout 2.76 matches; **finish halt at 4305 ms**. θ slider **20°–40°** | "One formula ranks all" | θ (20°–40°) | 45–55 | advanced |
| S7 | The slipping condition | `regime-switch` | Ring rolls at μ_s = 0.50; authored `param_ramp` 0.50 → 0.05 over 600–1600 ms; crosses μ_min = 0.233 at ≈1193 ms (s ≈ +0.93) → contact jumps off zero, label flips f_s → f_k, skid trail, spin lags; skids 3.026 m at 3.698 m/s²; **halt-latches at the finish (≈1968 ms) holding the slip picture — `f_k 0.44 N` LATCHED as-at-crossing** (the readout carries the true magnitude; the arrow sits at the declared floor). μ_min tick rides the μ_s row (U1) | "Too little friction: slipping" | μ_s | 35–50 | advanced |
| S8 | Everything, teacher-driven | `drag-sandbox` | Teacher drives the ring-gated set; the four-body race re-runs live under a **SYNCHRONISED restart (U6/E4): lap ends at the LAST body's crossing; after a short hold ALL bodies re-anchor together — position, `_dsp0`/seeds, v₀ and ω re-seeded to authored ω₀ = v₀/R for every body — and chips re-stamp** (the per-body wrap `:45569–45577` re-seeds `v1 = b.v0` only and desynchronises; replaced for race states). Rule 37: the clock free-runs. Trails/traces break at each restart. Core-ring content only: v = Rω, contact, k chips, centre markers, finish chips | "All controls live" | see min_ring table | 0 / open | explore |

**S8 explore controls with `min_ring`:** shape (core, S1/S4) · m (core, S4) · R (core, S4) · θ **20°–40°** (advanced, S6) · μ_s 0.05–1.00 with the μ_min tick riding the row (advanced, S7). *Hide advanced* → shape + m + R ✓. *Hide advanced+extended* → same ✓.

**Slip envelope (unchanged):** μ_min = (k/(1+k))·tan θ. At 25°: 0.133 / 0.155 / 0.187 / 0.233 — authored μ_s = 0.50 clears every shape in every guided state. Full-product maximum: ring at 40° = **0.420** > the 0.05 floor — slip reachable in the full-preset sandbox by design. Reduced presets: worst case 0.233 < 0.50 — provably slip-free.

**Per-state glow plan (channel named per state; Rule 32e caps at one, it does not require one):**

| State | Channel | Emphasis |
|---|---|---|
| S1 | `phases[].glow_focal` (`nlbRunPhases`, `:45296–45310`) | each finish chip glows in a window at its body's crossing, hand-back after |
| S2 | state-level | the rim dot |
| S3 | `phases[]` | phase A (0–1500): the f_k readout · phase B (1500→): the contact readout — windows aligned to the activation boundary |
| S4 | **NO state-level `glow_focal`** — a relation between two k chips | `phases[]`: chip A → chip B → hand-back (both full-bright for the tie run + TIE stamp; mass labels DIMMED as emphasis peers — **precondition E6**) |
| S5 | **NO state-level `glow_focal`** — a relation between two KE pairs | `phases[]` during the hold: sphere pair → ring pair → hand-back (both pairs full-bright at the 2700 pin) |
| S6 | `phases[]` | *(REV 6)* the glow-WALK over the three STATIC arrows (mg sin θ 400–800, N 800–1200, f_s 1200–1600) → each formula line in its window as it lands (1600–1900, 1900–2200, 2200–2500) → the a readout at release (2500→), hand-back. One focal at every instant ✓ |
| S7 | state-level | the friction label (one id; flips f_s → f_k at onset) |
| S8 | none | sandbox |

**Multi-body framing plan (unchanged; one flag renamed):** ψ = 35°, elevation 22°; races approach the camera; t = 0 is the far end and worst case. S1 clearance ≈ 66 px, S4 ≈ 109 px at s ≈ 187 px/m. Acceptance = bbox disjointness under the projection probe at t = 0 and every 100 ms sample, gated by (b)-12. Frame-fit: 6 sin ψ a conservative upper bound. Lanes: S1 `lane_gap_m` = 0.8, speed-ordered; S4/S5 = 1.2; **S3 `single_lane: true` + `lane_gap_m = 0`**; S2/S6/S7 single body. Close-camera table:

| State | Run (track s) | Static target | Framed along-track extent |
|---|---|---|---|
| S2 | +2.4 → +0.4 (2.0 m) | contact at **s = +1.4** | **3.0 m** ([−0.1, +2.9]) |
| S6 | +2.4 → −2.1 (4.5 m) | contact at **s = +0.15** | **5.4 m** ([−2.55, +2.85]) — smallest arrow f_s 0.414 wu ≈ 149 px at ~180 px/m ✓ |
| S7 | +2.4 → −2.1 (4.5 m) | contact at **s = +0.15** | **5.4 m** — same frame as S6 (Rule 32d continuity) |

Acceptance: projection probe (in frame at t = 0 and every 100 ms to halt) **plus** body-mesh rects ∩ `nlbPanelRects()` = ∅ under every authored camera.

**Home pose + track geometry (unchanged):** `surface.length_m = 3.0` (half-length) → 6.0 m plank, s ∈ [−3.0, +3.0]; θ default 25°; `initial_position_m = +2.4` every state; `s_finish = −2.1` (S1/S4/S6/S7/S8), `+0.034` (S5), `+0.4` (S2); all crossings on the CoM track coordinate.

**Loop-reset / frozen-pin timing (g sin θ = 4.1417; a = 2.958 / 2.761 / 2.485 / 2.071; json_author re-verifies at h = 1/60; CONDITIONAL on the state-local clock, U9/E1):**

| State | R (ms) | Sub-beats / last asserted event | Event time (% R) | Pin 0.60R | What the pin photographs · margin |
|---|---|---|---|---|---|
| S1 | 4000 | crossings + chip stamps 1744 / 1805 / 1903 / 2085; all four HALTED from 2085 | 2085 (52.1%) ✓ | 2400 | the finished race: four bodies AT the line, chips 1-2-3-4 · 315 ms ✓ |
| S2 | 3000 | cusp 754; halt-latch at s = +0.4 at 1204 (v = Rω = 3.32 latched) | 1204 (40.1%) ✓ | 1800 | full one-arch cycloid + cusp + equal latched readouts · 596 ms ✓ |
| S3 | 3200 | A: block skids alone 0–1500 (+2.4 → −0.76, never clamps) · disc ACTIVATES / block RETIRES at 1500 | 1500 (46.9%) ✓ | 1920 | the ROLLING half — disc at s = +2.156, `contact 0.00` + f_s, no block, no trail · 420 ms after activation ✓; loop ends disc at s = −1.59, 1.41 m clear |
| S4 | 3500 | tie crossing + double-TIE stamp + halt 1745 | 1745 (49.9%) ✓ | 2100 | both bodies halted abreast at the line, TIE chips · 355 ms ✓ |
| S5 | 4500 | sphere halt-latch 1265 (7.0/2.8); ring 1512 (4.9/4.9); held from 1512 | 1512 (33.6%) ✓ | 2700 | the held split: 7.0/2.8 beside 4.9/4.9, both at the line · 1188 ms ✓ |
| S6 | 4600 | *(REV 6 — R-4)* arrows static from entry (no reveal); glow-walk 400–1600; **formula lines land 1600 / 1900 / 2200 (E18) — the final line at 2200 is the LAST ASSERTED REVEAL (47.8%)**; activation (release) 2500 (54.3%) — 300 ms readable beat after the answer; finish halt 4305 | 2500 (54.3%) ✓ | 2760 | the released disc rolling at s = +2.307, ALL THREE formula lines + all three arrows + a readout 2.76 · **560 ms after the final line, 260 ms after release ✓** |
| S7 | 4000 | slip onset 1193 (29.8%); halt-latch at finish 1968, f_k latched | 1968 (49.2%) ✓ | 2400 | the held slip picture · 432 ms ✓ |
| S8 | — | free-run sandbox; synchronised restart each lap incl. the all-body ω re-seed (Rule 37) | — | — | — |

**Rule 32 legibility:** unchanged, plus: S6's line-by-line build is cause-first by construction — each formula line lands only after its glow-walked arrow evidence, and the final line precedes the release that verifies it by a readable 300 ms beat (32a). S3's activation cut remains the one declared exception to within-state visual continuity (the 16a phase boundary itself; the disc appears AT the home pose).

## 4. Misconception confrontation plan (Rule 16a — 2 genuine pivots)

| Wrong belief | Source | At | `misconception_watch` beat |
|---|---|---|---|
| "Rolling friction is kinetic friction" | RM-G7 | STATE_3 | `belief`: the contact scrubs like a sliding block. `visual_counter`: the skidding locked block (f_k + trail) FIRST and ALONE for the full first phase, retiring at the instant the rolling disc activates at the same home pose. `one_line_fix`: the contact point is instantaneously at rest, so the friction is static; kinetic appears only when the body slips (S7 closes the loop). Named primitives: `rotation_locked` (U14) + skid trail + f_k label/arrow + the activation boundary |
| "The heavier (or bigger) body wins" | PER + catalog | STATE_4 | `belief`: 5 kg beats 0.5 kg downhill. `visual_counter`: centre markers (U15) exactly abreast for the full descent — a dead tie, double-stamped "TIE", re-runnable at any m₂/R₂. `one_line_fix`: "doubling the mass doubles both the pull down the slope and the resistance to speeding up, and making the body bigger raises the turning push and the turning resistance by the same amount — so mass and radius both drop out, and only the shape factor k survives." (The formula appears first in S6, advanced.) |

No other state carries a `misconception_watch`. EPIC-C branches: ZERO.

## 5. `has_prebuilt_deep_dive` states

**STATE_4** — the PRIMARY aha and the stickiest point. **STATE_6** — the derivation; home of the ALTERNATIVE contact-point route. All others un-flagged (Rule 18).

## 6. Drill-down clusters

**STATE_4:** `why_mass_cancels` · `shape_factor_table` · `same_shape_always_ties`. **STATE_6:** `torque_about_contact_point` · `why_one_plus_k` · `rolling_vs_frictionless_slider`.

## 7. `entry_state_map`

```
entry_state_map:
  foundational: STATE_1 → STATE_4
  energy:       STATE_5
  derivation:   STATE_6 → STATE_7
```
Default `foundational`. Cross-slice pill: "See WHY the sphere wins? (energy)" → STATE_5. PRIMARY aha (S4) inside foundational ✓.

## 8. Prerequisites (advisory, Rule 23)

`pure_rolling` (#11 — S2 is its compact recap at its own wheel radius) · `moment_of_inertia` (#6 — S4's cliff) · `tau_eq_i_alpha` (#7 — S6's cliff) · `friction_force` (SHIPPED, same scenario) · `rotational_work_energy` (#8 — advisory for S5). Namespace check: no collision.

## 9. Real-world anchor (Rule 35 / 38f — unchanged, verified clean)

**Primary (STATE_1, ≤12 words):** *"Try it at home: a food can beats a roll of tape."* **Secondary (S8 opening caption option):** a bicycle wheel on a sloped path — the SAME device as #11's primary anchor, deliberate cross-concept continuity. **DC Pandey check:** chapter table of contents only. NCERT §7.14 noted.

## 10. Definition of Done (Gate 0 — no TBDs)

**(a) States:** the 8 of §2, exactly as tabled in §3 — including the finish semantics, the activation semantics, the formula-line reveal semantics, the two-channel arrow map, the glow channel table, the close-camera table, and the eight-state timing table.

**(b) Symbol-label table:** as REV 3, with: **Finish chips** — stamped crossing-interpolated at the body's own CoM crossing; chip and readouts latch. **Rotation markers (A3):** contrasting meridian stripe (spheres), radial face-stripe (disc), one contrasting arc segment (ring) — geometry, not emphasis. **Centre markers (U15):** axle dot + vertical tick per raced body; finish-line centre-height cue. **Energy readouts (S5):** count up live, LATCH at the body's own crossing. **S6 formula surface:** now THREE authored lines on the one surface (E18); the 340 px pixel check runs at the LONGEST line. All Unicode across all three text paths (Rule 34c).

**(b′) Term-introduction ledger:** unchanged from REV 3. Re-read against the REV 6 S6: the three formula lines introduce I_cm, α, k in the derivation state itself — already the ledger's placement; no change.

**(c) RHR plan:** N/A — declared deliberately.

**(d) Motion plan:** per §3; nothing static, nothing asserted-but-unrendered. Spin driven by position through the body's OWN `radius_m`; halts are finishes with latched labels; holds and phase boundaries run on `activate_at_ms` — a held body is genuinely un-integrated, never a narrated fiction; retirement is the `single_lane: true` rule, never a nonexistent dissolve cue; **S6's arrows are static from entry and glow-walked (never a nonexistent arrow-reveal); its formula builds on the bought per-line `at_ms` (E18), and the final line is the last reveal before the release**.

**(e) Modes:** 0c-2 adds `rolling_race`, `rolling_contact`, `rolling_friction_contrast`, `rolling_energy_split`, `rolling_derive`, `rolling_slip`, reusing `sandbox` (+ the S8 `race_restart: 'synchronized'` flag). S3's contrast mode is built on the activation mechanism (U10); S6's derive mode consumes the formula-line reveal (U16). deriveStateMeta co-edit at all three sites — **including E18's reveal-candidate registration**.

**(f)** `assessment` + `coverage_map`: unchanged span; `misconception_watch` = exactly §4's two beats.

**(g) Macro↔micro (Rule 33):** unchanged — every readout metric-defined; document numbers are CHECK values.

**(h) Canvas budget (Rule 34):** unchanged (S6 the ONE formula surface — now line-built, still one surface (34b)).

**(i) Curriculum-flex (Rule 38):** (i-1)–(i-5) unchanged, re-checked against the REV 6 deltas: the formula-line reveal, the `single_lane` flag and the restored U14/U15 are ring-neutral apparatus behaviour; the narrowed θ range appears only in advanced-ring rows; S8 still surfaces core content only.

**(j) Teacher-walk answers:** (1) unchanged. (2) Re-run S4 at the extremes — all tie; then S8 pit a marble against a huge ring — achievable via the synchronised restart + ω re-seed. (3) Ledger (b′); declared omissions unchanged.

---

## Two-pass cognitive lens

**Block 1.** Prerequisite cliff, JEE-backwards trace and misconception entry mapping all unchanged (verified by Checkpoint A cycle 1): constraint → S2; KE split → S5; formula → S6; k per shape → S4 + S1; μ_min → S7; friction-static legitimises the energy route → S3.

**Block 2.** Unchanged: PRIMARY at S4, SUPPORTING at S3, wrong-belief setups S1/S2 and S1, S4 ∈ foundational ✓. **The RULING-4 re-authoring strengthens the do-not-prespoil discipline on S6: the answer line `a = g sin θ/(1+k)` is now genuinely absent until 2200 ms — the exact property the escalation existed to protect.**

---

## SCAR AUDIT (REV 5's audit carried; escalation-verified; REV 6 deltas noted)

**Queries:** as REV 5 (eleven-id grep re-run; per-id queries; `--owner alex:architect` 32 + `--row-type directive` 47; both concepts → 0 rows — **the sibling review's five candidates + three upserts AND the escalation's three candidates + one upsert remain UNFILED; the dispatching session files all of them before the 0c-2 dispatch**; scenario-scoped rows). The escalation report independently re-ran these with identical results.

| bug_class (status/owner) | Verdict |
|---|---|
| `nlb_body_label_is_brighten_only_so_static_text_outranks_the_state_focal` (MAJOR/OPEN) | **build precondition E6, blocking for S4** |
| `field3d_nlb_arrow_min_length_floor_collapses_small_force_visibility_and_ratio` (MAJOR/OPEN) | *(R-7)* **CLOSED for every COMPARED arrow** (S6's three, whole drag range; S3's pair; #11's velocity fan via its own channel); **S7's single post-slip f_k clamps — tabled and declared honest-by-scope** (taught claim = the TYPE flip; the latched `f_k 0.44 N` readout carries the true magnitude). The row's DO quotes a stale `NLB_ARROW_SCALE = 0.030` — live code 0.048 (`:39661`), applied |
| `field3d_nlb_body_screen_anchor_lands_under_the_dom_slider_panel` (MAJOR/OPEN) | **applied** — close cameras carry the row's acceptance + A-11 extents |
| `frozen_frame_read_as_dense_series_continuation_on_translating_body` (MODERATE/OPEN) | **routed to eye_walker/quality_auditor as a READING directive** |
| `eye_h2_frozen_frames_of_moving_elements_wobble_sub_perceptually_so_zero_percent_is_not_a_valid_gate` (MODERATE/OPEN) | *(R-9, corrected)* **applied to (b)-19, quoting the live DO:** same-session A/B EYE runs; criterion = *"H2 PASSES its tolerance AND any non-zero percentage reproduces on the PRE-change renderer **or has max channel delta ≤ 3**"*; settled by a pre/post pixel diff (bounding box + max channel delta) |
| `concept_ships_zero_narration_glow_bindings` (MAJOR/OPEN) | **routed to physics_author** |
| `field3d_generic_visible_elements_matcher_blanks_new_scenario_apparatus` (DIRECTIVE/OPEN) | **surgeon duty, E14 + E8's bring-up probe** |
| `field3d_sprite_label_text_and_ink_box_are_invisible_to_every_dom_probe` (MODERATE/OPEN) | **applied to (b)-14** — sprite projection probe, never DOM |
| `nlb_friction_vector_first_frame_reveal_tint_bypasses_seam_q_ink_fix` (MODERATE/OPEN) | **ride-along (E8)** — sampled at each body's ACTIVATION frame *(REV 6: S6's arrows now render at state t = 0 — its sample point is t = 0; S3's phase B stays the activation frame)* |
| `nlb_multibody_lane_gap_is_along_z…` (DIRECTIVE/OPEN) | **satisfied** — framing plan + S3 explicitly `single_lane: true`, gap 0 |
| `nlb_checkpoint_s_m_authored_as_displacement…` (DIRECTIVE/OPEN) | **satisfied** |
| `field3d_param_ramp_authoring_contract` (DIRECTIVE/OPEN) | **satisfied** — S7's ramp per contract |

**Scenario-scoped rows:** unchanged — clock → U9/E1 (pcpl-surgeon; precondition of every pin, every `activate_at_ms`, **and every formula-line `at_ms`**) · occlusion → E2 · camera target → (b)-13 + A-11 · glow-relation → applied · SET_GLOW row → not chased · per-body wrap → U6/E4 + U12.

**Escalation candidate rows (unfiled — dispositioned here):** `skeleton_authors_a_timed_reveal_chain_of_overlays_on_a_scenario_whose_overlay_config_is_static` → **the defect REV 6 fixes**: the formula build now rides the BOUGHT per-line `at_ms` (U16/E18, deriveStateMeta-registered), and the arrows are static + glow-walked on the channel that exists — the row's probe passes by construction once E18 lands · `signed_engine_union_drops_items_its_own_state_table_still_consumes` → **fixed by R-5** (U14/U15 restored + the mapping walk, which recovered the μ_min tick) · `two_skeletons_sharing_one_engine_build_state_different_semantics_for_the_same_bought_field` → **fixed by R-6** (one canonical paragraph per field; sibling quotes verbatim).

---

# THE 0c-2 BUILD SHEET — as signed (Rulings 1 + 3 + 4; enumerated honestly over BOTH consumers)

> Consumers: `rolling_on_incline` (#12, this document) + `pure_rolling` (#11). No new `scenario_type`; everything extends `newtons_laws_body`. **Cross-cutting clause (b)-19:** every added config field is OPTIONAL; absent ⇒ today's constant/behaviour **byte-identically** — acceptance *(R-9)*: **same-session A/B THE EYE runs** (pre-build vs post-build) on `rolling_friction` (`shape:'wheel'` path) and `work_done_by_constant_force` (two-body lane compare); criterion quoted from the `eye_h2…` row's live DO — *"H2 PASSES its tolerance AND any non-zero percentage reproduces on the PRE-change renderer or has max channel delta ≤ 3"* — settled by a pre/post pixel diff (bounding box + max channel delta), never raw zero-percent against aged baselines. **Falsy-value discipline (R-14):** every new optional field with a legal falsy value (`lane_gap_m = 0`, `activate_at_ms = 0`, `visible_before_activation: false`, per-line `at_ms = 0`) resolves presence by `typeof x === 'number'` / `in` — NEVER truthiness (`x || DEFAULT` silently restores the constant and reproduces the exact defect the field was bought to fix); the regression pair asserts authored-0 and absent produce DIFFERENT geometry wherever semantics differ (`lane_gap_m`: 0 ⇒ z = 0 vs absent ⇒ ±0.425 wu; a formula LIST vs the legacy string), and notes where 0 ≡ absent by definition (`activate_at_ms`, a line's `at_ms`). If the surgeon finds any FURTHER capability needed — above all a THIRD timed field class — that is the alarm rule firing: STOP and re-scope with the survey.
>
> **E-numbering note:** the sibling review's E9–E14 stand; REV 4's colliding E9–E11 are re-tagged E15–E17; **E18 = RULING 4's formula-line reveal (the escalation's number, scope narrowed to the bought half)**; **E19/E20 minted for the restored U14/U15**; **E7b is RETIRED — merged into E10**. E1–E8 are the cycle-2 report's, with E5 superseded by E11.

| # | Union item | Consumed by | Engine queue | Owner | Tag |
|---|---|---|---|---|---|
| U1 | **Rolling physics branch**: per-body k = I/mR²; a = g sin θ/(1+k) with f_s = k·m·a; **BRANCH PRIORITY (A-10):** the rolling branch SUPERSEDES Branch A's kinetic path (`f = -vSign * b.mu_k * N`, `:45497–45499`) while rolling holds; θ = 0 is the TEST case; slip BOTH directions, closed-form in state-local t; independent ω integrator with `omega0_rad_s` + `'omega0'` token; dt-fold exactness; ***(restored at R-5)* the μ_min tick renders ON the μ_s slider row — live-recomputed from shape k and θ, ring-gated WITH the row** | #12 all states; #11 all states | **E15** | field3d_surgeon | **blocking** |
| U2 | **Contact-point picture**: rim dot + cycloid trace + skid trail (replayable pure functions of state-local t; wrap/halt/reset/retirement break discipline); point-speed arrows computed from live (v, ω) — never hardcoded — through U7's VELOCITY channel; contact-speed readout; static/kinetic call-out | #12 S2/S3/S7/S8; #11's contact/point-speed states | **E16** | field3d_surgeon | **blocking** |
| U3 | **Per-body `radius_m`** [optional, default = `NLB_BODY_SIZE/2` lift `:40015` + `NLB_WHEEL_R` divisor `:40053`] | both, every state | E7a | field3d_surgeon | **blocking** |
| U4 | **Rolling apparatus set**: four meshes each with a rotation marker (A3); k chips; KE_trans/KE_rot as SEAM-M value-only readouts, no SEAM-L change ever; bare-ω readout token; `controls_visible` extension `R/R2/omega0/shape` (`:1340`). ***(R-12)* the `readouts` union at `:1336` is CLOSED and lacks `KE_trans`, `KE_rot`, `contact`, `Rω`, `ω`: this buy EXTENDS it (declaration + reader + validator co-edit)** | #12 S1/S4/S5/S8; #11's race/apparatus states | **E17** | field3d_surgeon | **blocking** |
| U5 | **Finish-line halt-and-latch**: per-state `finish_line {s_m, bodies, halt, stamp}`; latch crossing-interpolated (reuses `:44240–44262`); stamps → finish chips + per-body readout rows, NOT the formula surface. Bypasses `checkpoints` for the four line-numbered reasons | #12 S1/S2/S4/S5/S6/S7 | E3 | field3d_surgeon | **blocking** |
| U6 | **Synchronised all-body race restart** for `race_restart:'synchronized'`: ALL bodies re-anchor together — position, `_dsp0`/seeds, v₀ AND ω re-seeded to authored ω₀ = v₀/R; chips re-stamp; Rule 37 preserved | #12 S8 | E4 | field3d_surgeon | **blocking** |
| U7 | **TWO-CHANNEL authorable vector map**: `force_scale`/`force_min_len` AND `velocity_scale`/`velocity_min_len`, defaults `0.048`/`0.55`; + the zero-vector marker. Authored: force channel 0.30/0.25 (§3 table, incl. S7's declared floor case); velocity values authored by #11 | #12 S3/S6/S7 (force); **#11 velocity ONLY — #11 draws NO force arrows (R-13)** | **E11** | field3d_surgeon | **blocking** |
| U8 | **Race framing surfaces**: authorable `lane_gap_m` + speed-ordered lane assignment [optional, default `0.85`] — **0 is LEGAL; single-lane RETIREMENT requires the separate explicit `single_lane: true` flag (R-10)**; `PM_NLB_LANE_OCCLUSION` → `manifest.warnings`; camera **target** authoring + A-11 run-midpoint targets + body-rect-vs-DOM acceptance | #12 S1/S3/S4/S5/S8; #11 | E2 + **E10 (absorbs the retired E7b)** + E8a | field3d_surgeon | E2/E10 **blocking** |
| U9 | **State-local physics clock rebase** — `RESET_TRAJECTORY` exists (`:45002–45018`); fix the `SET_STATE`-without-reset path. **Precondition of every pin, every `activate_at_ms`, and every formula-line `at_ms`** | both | E1 | **`peter_parker:renderer_primitives` → pcpl-surgeon** | **blocking** |
| U10 | **Per-body `activate_at_ms`**: hidden and NOT integrated before its instant — **hidden means the WHOLE body: mesh, arrows (`nlbDriveArrowsForBody`), labels, trail, readout rows (R-11)**; seeded at authored s₀/v₀/ω₀; **retirement only in `single_lane: true` states** (R-10); `visible_before_activation: true` for the held case. Presence by `typeof` (R-14). **Scope guard: with U16, these are the ONLY TWO timed field classes in 0c-2 — a third = the alarm rule.** Expectations: #12 S3 — disc absent (mesh, arrows, labels, rows) and un-integrated until 1500 ms, then descends while the block retires trail-and-all; #12 S6 — disc renders held at +2.4 with arrows/formula live until 2500, then integrates; **#11's two-phase skid-vs-roll 16a contrast state (S3 at its REV 2/3)** | #12 S3/S6; #11's 16a contrast state | **E9** | field3d_surgeon | **blocking** |
| U11 | **Revolution marks + circumference bracket as their OWN primitive**: own mesh, turn-count trigger, live respace; no `checkpoints` reuse, no formula-surface stamp, no `energy_active`, no `NLB_CP_MAX` cap | #11 only | **E12** | field3d_surgeon | **blocking** (for #11) |
| U12 | **ω re-seed on the per-body sandbox wrap**: `:45571–45572` re-seeds `v1 = b.v0` only; re-seed ω to authored ω₀ | #11 S8; #12 S8 via U6 | **E13** | field3d_surgeon | ride-along |
| U13 | **Visible-elements matcher registration**: finish line + chips, rotation markers, centre markers, k chips, KE readouts, skid trail, cycloid trace, revolution marks, bracket, velocity arrows, zero-vector marker | both | **E14** | **pcpl-surgeon** | ride-along |
| U14 | ***(RESTORED — R-5)* Per-body `rotation_locked` flag**: the body translates with ω forced 0 — mesh never spins, rotation marker holds pose — while integrating normally under the kinetic-friction branch; constant per body id, never a per-state build-branch | #12 S3 (the skidding block); #11's 16a contrast state | **E19** | field3d_surgeon | **blocking** |
| U15 | ***(RESTORED — R-5)* Centre markers + CoM crossing metric**: axle dot + vertical tick per raced body; finish-line centre-height cue; all finish/TIE stamps defined on the CoM track-coordinate crossing (the metric U5 consumes) | #12 S4 + S8; U5 (metric) | **E20** | field3d_surgeon | **blocking** (for S4) |
| U16 | ***(NEW — RULING 4)* Formula-line reveal**: `formula_overlay` as an ordered list `{text, at_ms?}` on the ONE existing surface (`:44801`); pure function of state-local t, pin/rewind byte-stable; legacy single string ⇒ byte-identical; stamper (`:44374–44389`) appends after the last line; **MUST register in `deriveStateMeta.ts` (`:2739–2994`) — the last line's `at_ms` joins max-reveal — or THE EYE mis-pins**; presence by `typeof`. Machine evidence for the gap: `:44801` (static string), `:44374–44389` (stamps the only dynamic writer), `deriveStateMeta.ts:2739–2994` (no overlay reveal candidate). Expectation: #12 S6 at 1550 ms shows ZERO lines; at 1700 line 1 only; at 2300 all three; the pin (2760) photographs all three. **No per-arrow `show_at_ms` exists or may be built** | #12 S6; #11's formula-building states | **E18** | field3d_surgeon | **blocking** |

**Ride-along duties (E8 — one dispatch, non-blocking):** `nlb_body_label` out of the brighten-only set (**E6 — blocking for S4**); θ-arc clamp vs outer lane; `#nlb_formula` pixel check at each concept's longest line (340 px); readout zone sized off rendered neighbour height; label decollision via the sprite projection probe; friction-arrow reveal-ink floor sampled at each body's ACTIVATION frame (S6's arrows: state t = 0); new-mode apparatus-visibility bring-up probe; new modes + `deriveStateMeta` co-edit at all three sites — **shape requirement: up to TWO sequential activation bodies per state. No three-phase shape exists anywhere in the union.**

**What is deliberately NOT in the union:** no energy bars / SEAM-L change; no zoom inset; no graph panel; no RHR hand; no new `scenario_type`; **no per-arrow `show_at_ms`, no per-label reveal, no choreography DSL — `activate_at_ms` + `formula_overlay[].at_ms` are the WHOLE timed surface**; no three-phase config shape. #11 consumes U1–U4 + U7(velocity) + U8 + U9 + U10 + U11 + U12 + U14 + U16 + shared ride-alongs; U5–U6 + U15 are #12-only.

## MAPPING WALK (R-5 — old list → union, and state primitives → union)

**(b)-1…(b)-19 → U:** (b)-1 → U1 + U4 · (b)-2 → U1 · (b)-3 → U2 · (b)-4 → U2 · (b)-5 → U1 (slip branch **+ the μ_min tick — recovered by this walk**) · (b)-6 → U4 · **(b)-7 → U14 (RESTORED; its scenario_cue half is dead — superseded by U10)** · (b)-8 → U4 · (b)-9 → U3 · (b)-10 → U8 · (b)-11 → U9 · (b)-12 → U8/E2 · (b)-13 → U8 · (b)-14 → E8 · **(b)-15 → U15 (RESTORED)** · (b)-16 → U5 · (b)-17 → U6 · (b)-18 → U7 · (b)-19 → the cross-cutting clause.

**State primitives → union:** S1: meshes/markers U4 · finish+chips U5 · lanes/camera U8 · clock U9. S2: radius U3 · dot/trace/readouts U2 (+U4 enum) · halt U5 · target U8. S3: locked block **U14** · trail/call-out U2 · f arrows U7 · activation/retirement U10 · single-lane U8/U10 · clock U9. S4: per-body m/R U3 · **centre markers U15** · TIE chips U5 · k chips/rotation markers/tokens U4 · lanes U8. S5: KE readouts U4 · halt-latch U5 · lanes U8. S6: force arrows U7 · **formula lines U16** · hold/release U10 · halt U5 · target U8 · glow `phases[]` (exists). S7: ramp (exists) · **μ_min tick U1** · regime U1 · trail/contact U2 · halt-latch U5 · target U8. S8: restart U6 (+U12) · apparatus U4/U15 · lanes U8 · tokens U4. **No primitive named in §3 lacks a union row; no union row is unclaimed.**

---

**Handoff:** REV 6 answers the escalation with FOUNDER RULING 4 applied exactly at the boundary the founder drew, lands all six carry-forwards, both sibling cross-document fixes, and the sibling's falsy discipline — and churns nothing on the escalation's verified list. Pending before the 0c-2 dispatch, for the ORCHESTRATING session: file the eight sibling-review rows + the escalation's three candidates + one upsert via `npm run log:lesson`; verify #11's REV 3 imports the two canonical paragraphs verbatim and deletes its 1400 ms dissolve.

**Founder-attention note (flagged, not acted on):** with S6's arrows now static from state entry, the held disc displays the rolling-case free-body diagram (f_s at 1.3806 N) while its `a` readout reads 0.00 — physically, a *held* body's f_s would be 4.14 N. REV 6 declares the hold as "the derivation's diagram" in the S6 row so it cannot read as an error. If the founder prefers the arrows to appear only at the glow-walk's start (400 ms), that would require exactly the per-arrow reveal RULING 4 refused, so the declaration is the only in-scope treatment.
