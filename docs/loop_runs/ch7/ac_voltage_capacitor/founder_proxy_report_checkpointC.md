# founder-proxy — Checkpoint C (handover gate) — `ac_voltage_capacitor` (Ch.7 #3)

> **Two-pass checkpoint.** Pass 1 returned `FIX` on three handover-artifact defects (the simulation was
> approved unchanged and never re-reviewed). The loop session corrected all three, plus a fourth finding
> raised on the re-verify pass. Pass 2 returned **`SEALED`**. Both passes are recorded below — pass 1 in
> §1–§8, pass 2 in §9.

---

# PASS 1 — VERDICT: `FIX` (three handover-artifact defects; **the simulation itself is APPROVED, unchanged, and needs no re-review**)

**"Is this sim the highest-value version achievable within loop authority?"** — **Yes for the simulation as
taught, with exactly one nameable exception: the `C`-slider step grid.** The physics is exact at every
number re-derived, all eleven engine findings and all four authoring findings genuinely landed in the
committed code, the chapter's locked operating point holds in rendered pixels, and the L↔C mirror reads
correctly against the sealed sibling. What is *not* sealed-ready is the **handover record around it**: the
scar block would fail to INSERT on 8 rows, the engine log is missing both Stage-3 fix commits entirely,
and this concept's Checkpoint-A reports do not exist on disk. Those are loop-session artifacts, not sim
defects — but "scar candidates filed and schema-valid" and "the engine log accurate" are explicit SEALED
preconditions, and the first was certified twice at Checkpoint B. Calling this SEALED would be precisely
the grade drift this role exists to prevent.

No escalation trigger fires: no physics-correctness doubt, no cycle budget exceeded. Nothing ships (Rule 17
intact).

## 1 · Sim-side verification — every A/B claimed fix diffed, zero silent skips

**Drift guard first:** concept JSON md5 = `03ea328a47cc04ee09a9b9ca363e09bc` — **identical** to the cycle-2
record. `field_3d_renderer.ts` and `deriveStateMeta.ts` are **not** in `git status` — the renderer at HEAD
is byte-for-byte what was pixel-verified. Nothing drifted after APPROVE.

### Checkpoint A design fixes

| Fix | Verification | Landed |
|---|---|---|
| **Glyph compose routine + pinned source-string convention** | `skeleton.md:63` carries the routine spec and the convention marked *"PINNED — binding on physics_author, json_author, AND the engine dispatch"*; restated `:196`, quality_auditor duty `:265`. Implemented at `field_3d_renderer.ts:26180` (`accComposeSegments`), `:26208`/`:26226` (canvas measure/draw), `:26269` (`accHtmlComposeSub`), `:26278` (sprite). **Better than specified:** the regex is the *generalized* `/([A-Za-z])_([A-Za-z]+)/g`, not the cycle-0 `X_C\|v_C` whitelist — so `U_max`/`q_max` compose by the same structural path (this is what made E6 a real fix, not a special case). Confirmed in pixels: `X_C`, `v_C`, `q_max` all true styled subscripts, zero literal underscores | ✓ |
| **Store-lobe arithmetic correction** | `skeleton.md:91`. Re-derived: ∫p dt over a charging quarter = vₘiₘ/(4ω)·(1−cos π) = vₘiₘ/(2ω) = **6.36620 J**; ½Cvₘ² = **6.36620 J**; sibling ½Liₘ² = **6.36620 J**; 20/π = **6.36620 J**. All four agree to 6 s.f. The deliberate L↔C energy echo is real | ✓ |

### Checkpoint B — E1–E11 + J1–J3

| id | Verification at Checkpoint C | Landed |
|---|---|---|
| **E1** beads | `:26364` builds beads with `{elementType:"acc_beads", row, cell}` — the discriminator `:27129` requires. Gold beads visible on both wires in S1/S3/S5/S9 | ✓ |
| **E2** caption latch | Live-θ band re-derivation; cycle-2 `fillText` log showed bounded ~780 ms bursts, no overlap | ✓ |
| **E3** phase accumulator (scar recurrence) | `:27089` — `PM_accPhase = PM_accPhaseBase + omegaEff*(t − PM_accTAnchor)`. **Pure function of absolute t** with an anchor for slider-driven ω. Comment `:26560` cites the scar by name | ✓ |
| **E4** dim one-way | `accSetApparatusDim` `:26063` captures `_accBaseOp`/`_accBaseTr` once per material and **restores on the `else`**; called unconditionally `:26679`. S9 frozen (reached through S8) ships **bright** | ✓ |
| **E5** S1 pre-spoil | `STATE_1__frozen.png`: bare italic `i`, HUD `v` only, cyan v-trace only | ✓ |
| **E6** `U_max` underscore | Structural via the generalized compose regex; `q_max = 1.27 C` true subscript in `STATE_5__frozen.png` | ✓ |
| **E7** glow no-op | Opacity multiplier + colour lerp on the live channel; pixel-upgraded at cycle 2 | ✓ |
| **E8** `iₘ` + slope chip | `iₘ = 2.00 A` in HUD S2→S9 **including S9** (restores the 38a reduced-cut argument at `skeleton.md:214`); vₘ/iₘ gutter lines visible S5/S9 | ✓ |
| **E9** on-graph `X_C` collision | `STATE_5__frozen.png` cropped: `X_C = 5.0 Ω` on its own clear baseline **between** the vₘ and iₘ gutter lines, unstruck | ✓ |
| **E10** duplicate `U = ½Cv²` | Gauge value-only; symbolic relation on one surface | ✓ |
| **E11** charge polarity | `:27183–27186` — single shared `chOpacity`, then `topOpacity = botOpacity = chOpacity`. Per-pool asymmetry **unrepresentable**, not merely retuned. Colours sign-keyed. `STATE_3__frozen.png` at q = +0.90 C: red top **and** blue bottom, simultaneous | ✓ |
| **J1** stops | `[4000, 5000, 6000]` at JSON:652 | ✓ |
| **J1b** cue binding | All three `tangent_stop_1/2/3` bound to sentences 2/3/4; `s4_4` leads with *"Falling steepest now — current dives to its trough"*, drag prompt second. S4 = 52 words | ✓ |
| **J2** idealization | Landed (the `skeleton.md:91` "geometry is identical" half remains absent — P3, carried) | ✓ (partial, as accepted) |
| **J3** `C` step | `step: 0.0127`, `min: 0.04` — **deliberately deferred, not silently skipped** (documented at cycle 1 as founder-proxy's own prescription error, accepted at cycle 2). See §6 | deferred by record |

**Registration — all 8 sites present:** JSON · `CONCEPT_PANEL_MAP` (panelConfig:1525) + clusters migration
file · `CONCEPT_RENDERER_MAP` → `field_3d` (:2948) · `VALID_CONCEPT_IDS` (:567) · deep-dive flags ·
synonyms n/a · `PCPL_CONCEPTS` correctly **absent** (field_3d) · `CLASSIFIER_PROMPT` (:878). Plus seed script.

**Rule 38 full re-check:** 38a rings core×4 / extended×3 / advanced×1 (S8) contiguous immediately before
explore ✓; 38b S9 HUD = v, i, iₘ only, formula `i leads v by ¼ cycle (90°)`, **no q / X_C / p** ✓; 38c
degrees in core/extended, radians+calculus confined to S8 ✓; 38d clean; 38g tags authored as claims with an
honest `verification_note` and `needs_teacher_verification: true` on all six unverified cells ✓.
**Rule 35:** zero country-specific hits; no asserted mains constant. **No-phasor discipline:** all 5
"phasor" strings are metadata/scope notes — **zero rendered or narrated** ✓.

## 2 · C1 (P1) — the scar block is not schema-valid. 8 rows would fail to INSERT

Validated against the *live* constraint set, not the spec.

| constraint | live value | founder-proxy spec says |
|---|---|---|
| `severity` | `CHECK (severity IN ('CRITICAL','MAJOR','MODERATE'))` — never widened | `CRITICAL \| MODERATE \| MINOR` ← **wrong; `MINOR` does not exist** |
| `owner_cluster` | `alex:architect, alex:physics_author, alex:json_author, peter_parker:renderer_primitives, peter_parker:runtime_generation, peter_parker:visual_validator, ambiguous` | silent — no reviewer-role values exist |
| `probe_type` | `sql \| js_eval \| manual` (+ `vision_model`, found pass 2) | ✓ correct as far as it goes |
| `row_type` | `incident \| probe_definition \| directive` | ✓ correct |

*`severity='MINOR'` → check_violation (6):* `canvas_graph_label_collides_with_peak_reference_line` ·
`field3d_duplicate_formula_surface_sprite_label_vs_formula_overlay` ·
`scar_candidate_sql_authored_outside_the_live_column_list` ·
`eye_frozen_candidate_offset_falls_outside_engine_display_band` ·
`slider_step_grid_offset_when_min_is_nonzero` · **plus
`field3d_rms_subscript_ascii_in_renderer_text_paths` (line 423, Stage 1b — inside the *sealed*
`ac_voltage_resistor` block, certified "schema-valid" at that concept's own Checkpoint C).**

*`owner_cluster` not in enum → check_violation (3):*
`review_negative_form_check_is_vacuous_without_an_existence_assertion` (`alex:eye_walker`) ·
`review_a_newly_revealed_layer_has_never_been_content_reviewed` (`alex:quality_auditor`) ·
`scar_candidate_sql_authored_outside_the_live_column_list` (`alex:quality_auditor`).

**The sharpest detail for the founder:** the row `scar_candidate_sql_authored_outside_the_live_column_list`
— filed *because* the upstream reports emitted SQL that would not INSERT — **itself violates the schema
twice**, and its own `prevention_rule` propagates the error verbatim. The prevention rule would perpetuate
the defect it exists to prevent.

**Clean results:** 0 `bug_class` collisions. Zero bare `ARRAY[]` without `::text[]`. Zero NULL array
columns. All INSERT column lists valid. All `status`/`probe_type`/`row_type` values in enum.

**Founder decision worth taking:** the scar schema has **no vocabulary for reviewer-owned process
directives**, and the trial has generated four. Either widen `owner_cluster` to include
`alex:quality_auditor` / `alex:eye_walker` / `alex:founder_proxy`, or accept `'ambiguous'` permanently.
founder-proxy recommends widening — a directive whose owner is `ambiguous` cannot be routed, and routing is
the column's whole purpose. Separately: decide whether `severity` gains `'MINOR'`.
**`.agents/founder_proxy/CLAUDE.md` states the wrong enum and must be corrected** — founder-edited canonical
source founder-proxy cannot touch.

## 3 · C2 (P1) — the engine log is missing both Stage-3 fix commits

`docs/loop_runs/ch7_engine_log.md` contained the Stage-3 **build** entry (`21e1f0f`) and nothing else;
`grep -c "832b1d3\|219937d"` = **0**. So the chapter's log had no record of `832b1d3` (E1–E10, **five
blocking**, two scar recurrences) or `219937d` (E11, the charge-polarity defect that made S3 physically
wrong). The richest engine episode in the chapter, invisible in the chapter's own log — the founder's packet
would have shown a clean build with no defects found.

## 4 · C3 (P2) — this concept's Checkpoint-A reports do not exist

Both sealed siblings have both files, committed. Impact bounded but real: both design fixes were verified
**from the skeleton directly** (§1), so nothing is unverified — but the *reasoning* behind the design gate
for concept 3 is absent from the handover while it exists for concepts 1 and 2.

## 5 · Cross-concept coherence with the two sealed siblings — verified, and excellent

| | R | L | C |
|---|---|---|---|
| defaults | vₘ 10.0 V, f 0.25 Hz, R 5.0 Ω | vₘ 10.0 V, f 0.25 Hz, L 3.1831 H | vₘ 10.0 V, f 0.25 Hz, C 0.1273 F |
| reactance | 5.0000 Ω | ωL = **5.0000 Ω** | 1/(ωC) = **5.0009 Ω** |
| iₘ | 2.0000 A | 2.0000 A | 1.9996 A |

All three render `5.0 Ω` / `2.00 A`. Identical sources, identical opposition — so **S2's ghost is literally
the previous lesson's trace**, arithmetically and on screen.

**The L↔C mirror reads correctly.** Same frozen instant, inductor vs capacitor S5: caption *"Faster swing,
**stronger** choke"* vs *"Faster swing, **weaker** choke"*; both HUDs read `v = −5.9 V` while inductor
`i = **+1.62 A**` and capacitor `i = **−1.62 A**` — **exact opposites**, the lag/lead mirror made literal;
arrow labels *"i (lags v by ¼ cycle)"* vs *"i (leads v by ¼ cycle)"*; `Xₗ = ωL` vs `X_C = 1/(ωC)` in
parallel structure, both real subscripts on screen; rising vs falling reactance ✓; opposite `p` sign ✓;
**apparatus pose identical** — the coil sits exactly where the plates now sit; dialect consistent.

**Nothing contradicts either sibling.** Two chapter-coherence observations (neither a capacitor defect —
**this sim is the one that's right**): (1) the inductor renders beads and current arrow in **cyan**, the
colour its own scope legend assigns to **voltage**; the capacitor uses **amber**, matching the i-trace.
(2) The inductor's HUD carries no `iₘ` line; this concept's does.

## 6 · Sealed-sibling contamination — the founder's chapter-end package (**six** items)

All confirmed in sealed code, all deliberately **not** fixed (orchestrator scope decision, endorsed).

| # | Item | Sev | Effort | Renderer-level invariant? |
|---|---|---|---|---|
| **(a)** | `ac_inductor` S4 authors no `tangent_stops_at_ms` → inherits engine default `[1500,4500,7500]`; at f = 0.25 Hz its t = 4.5 s "flat crest" fires while i climbs at 71% of max. Correct stops 1.0/2.0/3.0 s | P2 | 3 integers in a sealed JSON + S4 H2 re-baseline | **No** — deliberate founder call |
| **(b)** | `dim_apparatus` one-way at `:25402` (verified: no `else`) → the inductor's sandbox and every revisited state ship dimmed after its S8 | **P1** | ~15 lines: port `accSetApparatusDim`'s pristine-capture pattern | **Yes** |
| **(c)** | `PM_acrPhase` / `PM_aclPhase` remain dt-accumulators → both siblings' frozen baselines minted at arbitrary phase; fail rewind-determinism | **P1** | ~20 lines each. **Carries a re-baseline cost on both sealed sims** | **Yes** — Rule-36 invariant |
| **(d)** | E6's literal `U_max` also at `:25810` in `ac_inductor` | P3 | Small — but see recommendation | **Yes** |
| **(e)** | `ac_inductor` S5 renders `Xₗ = 5.0 Ω` **struck through** by the vₘ dashed reference line — the exact E9 class, unfixed. Also lacks E8's vₘ/iₘ gutter labels | P2 | ~5 lines + S5 H2 re-baseline | Partly |
| **(f)** | **Found pass 2.** `supabase_migrations/supabase_2026-07-23_seed_engine_bug_queue_ac_voltage_inductor_checkpointb_fixes_migration.sql` (committed in `f913580`) contains 3 live-apply `engine_bug_queue` rows duplicating candidate-file entries — `supabase_migrations/` is the APPLY PATH, so a routine pending-migration run would write them with no founder ruling. Its header also cites a script that no longer exists | P2 | Neutralized by the loop session (see §9); founder rules on delete-vs-restore | N/A — process |

**Recommendation.** (b), (c) and (d) are genuine renderer-level invariants and should be fixed **once,
generically** — both siblings inherit at near-zero marginal cost, and five more Ch.7 scenarios are coming.
Highest-leverage is **(d)**: promote `accComposeSegments` / `accHtmlComposeSub` out of the `acc_` block into
the shared text layer and *every* scenario gets Rule-34c subscript compliance for free — a one-line sibling
fix becomes a fleet-wide capability. (b) is the most user-visible. (c) is the most expensive (re-baselines
two sealed sims) and should be scheduled deliberately. (a) stays a founder call. (e) is cheap and can ride
with (b).

## 7 · Trial process record

- **No-DB-writes: violated once at Stage 2, remediation held.** Re-verified live rather than accepting the
  account: `query_engine_bug_queue.ts` returns "No matching rows" for `ac_voltage_capacitor`,
  `ac_voltage_inductor` *and* `ac_voltage_resistor`. **Zero live rows across the entire chapter.** The fix —
  restating the constraint in every dispatch prompt, fix cycles included — held across all four Stage-3
  dispatches.
- **Three defects shipped past both machine gates and both AI reviewers**, each caught only at
  artifact-level review: unbuilt beads (a `visible_elements` entry, a glow alias and an `elementType` gate
  all passed while zero meshes existed); an invisible charge layer (pinned at opacity 0 — every check on it
  passed *vacuously*); a permanently-dimmed sandbox (THE EYE captures in state order and **minted the
  baseline with the bug in it**). The directive that came out of this — **presence is not correctness**, and
  a negative-form check must be preceded by an existence assertion — is the trial's most transferable
  output. It generalised immediately: when the E11 registration fix made the charge layer visible, its
  *content* had never been reviewed by anyone, and reviewing it found the layer physically wrong.
- **Where the loop's own gates were blind:** THE EYE posts no cue times, so it structurally cannot see
  caption *ordering* defects (J1b); canvas-internal text is invisible to founder_drive's DOM collision probe
  (E9 — which is exactly why the sealed sibling's identical defect (e) survived its own Checkpoint C).
- **Reviewer errors recorded against founder-proxy itself:** the cycle-0 `C`-step prescription assumed
  `min = 0` (wrong); and it twice certified the scar block "schema-valid" against its own spec's enum rather
  than the live CHECK (§2).

## 8 · Handoff packet for `phasors` (Ch.7 #4)

**The skeleton's §7 seed is still accurate after everything that changed** — re-derived, not assumed:

- **X_L = 5.0000 Ω, X_C = 5.0009 Ω at shared defaults** → the chapter's default operating point **is** the
  resonance point of the eventual `series_lcr_circuit`: f_res = 1/(2π√(LC)) = **0.25002 Hz** against a
  default f = **0.25 Hz** (0.008% apart).
- **"The two reactive currents are exact opposites there"** — confirmed *in pixels*: same frozen instant,
  inductor `i = +1.62 A`, capacitor `i = −1.62 A`.
- **The three settled facts `phasors` formalizes are all true and all at 2.00 A on identical sources:** R in
  phase (2.00 A) · L a quarter late (2.0000 A) · C a quarter early (1.9996 A). All three sims default to
  vₘ = 10.0 V, f = 0.25 Hz — verified from `slider_controls` in all three JSONs.
- **No-phasor discipline held**: zero rendered or narrated phasor/rotating-vector/CIVIL content.

**What `phasors`'s architect must know:**
1. **Inherit the number lock** — vₘ 10.0 V, f 0.25 Hz, 5.00 Ω, 2.00 A. Any new default breaks the
   ghost-trace continuity that makes each S2 work.
2. **Inherit the home pose** — source ring, wire loop, scope pane, HUD corner, formula zone, slider panel
   are pixel-consistent across all three sims.
3. **Do not re-teach the mechanisms.** All three are settled; `phasors` formalizes. Show the *same* traces
   gaining a rotating representation, not new physics.
4. **The `X_C` glyph convention is chapter law** — authored strings carry the ASCII token `X_C`/`v_C`; the
   engine composes. `phasors` needs `X_L` and `X_C` side by side, and the compose routine is currently
   **`acc_`-scoped** and must be promoted to shared before concept 4 can use it (contamination item (d) —
   concept 4 is where it stops being optional).
5. **Colour semantics need a chapter ruling** before concept 4 fixes them in place — cyan = voltage /
   amber = current is the capacitor's (correct) convention; the sealed inductor's apparatus contradicts it.

---

# PASS 2 (re-verify) — VERDICT: `SEALED`

## 9 · Verification of the three corrections

**C1 — PASS.** Constraints confirmed two independent ways rather than trusting the loop's DB read:
`supabase_2026-04-25_engine_bug_queue_migration.sql:26` (`severity IN ('CRITICAL','MAJOR','MODERATE')`),
`supabase_2026-04-27_..._visual_categories_migration.sql:42` (the 7-value `owner_cluster` list), plus a live
read-only value distribution over 319 rows (severity `{MAJOR:142, MODERATE:125, CRITICAL:52}`).

**A third spec error found:** `probe_type` was widened to include `vision_model` by the same 2026-04-27
migration, and **45 live rows use it**. `.agents/founder_proxy/CLAUDE.md` omits it — so the canonical source
is wrong in *two* enums, not one. Fold into the same founder correction.

Full-file validation with a real comment-aware, string-aware SQL tokenizer: quote parity **clean** (the
`NO MINOR level` rewrite was the only such hazard; no others found) · 18 statements = 14 INSERT + 4 UPDATE ·
**29 INSERT tuples, 29 unique `bug_class`, 0 duplicates** · VALUES arity 29/29 match · **0 enum violations in
live SQL** (the 4 residual `MINOR`/reviewer hits are all `--` comment lines, i.e. the correction record) ·
9/9 empty arrays cast · 4/4 UPDATE targets resolve · **0 collisions vs the live table** → applies cleanly on
first apply.

**One figure in the loop's audit was wrong:** it reported "18 unique bug_class values." 18 is the
**statement** count; the row count is **29**. The conclusion (no duplicates) holds.

Non-blocking: 8 non-empty arrays lack `::text[]` (Postgres infers it — style only); 4 rows omit `row_type`
(`NOT NULL DEFAULT 'incident'`, semantically correct); **0 of 14 INSERTs carry `ON CONFLICT (bug_class) DO
UPDATE`** though house style does — harmless on a clean first apply, but the file is non-idempotent.

**C2 — PASS.** Verified the log's *evidence claims* against the actual diffs, not its prose: `git show
219937d` removes verbatim the exact lines the log quotes (`ACC_CHARGE_TOP_HEX`/`BOT_HEX` and both
opacity ternaries), substantiating the "undrawable q<0 configuration" claim from the diff; `git show
832b1d3` adds the missing bead creation with `row`/`cell` userData. Stat lines match.

**C3 — content verified, with a correction about attribution.** founder-proxy **cannot attest to verbatim
fidelity** — its context does not persist between dispatches, so it has no memory of the Checkpoint-A
dispatch. The loop session, holding the retained dispatch result, is the party vouching for fidelity; the
provenance notes were amended accordingly. What founder-proxy *could* do it did: re-derived every physics
claim (store-lobe slip, X_C = 5.00 Ω, iₘ = 2.00 A, q_max = 4/π, U_max echo, X_C = 1.25/f, both edge corners,
the lead direction, the Unicode subscript claim) — **all correct** — and verified every line-specific claim
true against the current skeleton. Downstream corroboration: the compose routine actually landed at
`field_3d_renderer.ts:26153`, in use at `:26937`.

**New finding (f), P2, chapter-scope — the queued-write hazard.** See §6 item (f). **No write ever
occurred** — confirmed live: 0 of 29 candidate classes and 0 of the 3 inductor classes exist in
`engine_bug_queue`; `confusion_cluster_registry` / `concept_panel_config` return `[]` for all three Ch.7
concepts. A queued hazard, not a breach.

> **Loop-session disposition (2026-07-23).** The migration file was **neutralized in place**: a
> `TRIAL HOLD — DO NOT APPLY` guard header was prepended and every executable statement commented out
> (`grep` for uncommented SQL now returns 0 lines). Content is preserved verbatim and the change is
> reversible in one step. The guard documents why (`supabase_migrations/` is the apply path and the trial
> forbids DB writes), that no write ever occurred, the 3-row duplication against `scar_candidates.sql`, the
> dangling script citation, and the restore path. Deleting the file outright was deliberately NOT done —
> it is committed history and the choice between "delete as duplicate" and "apply after ruling" is the
> founder's.

## 10 · Founder-packet line, final form

> **Yes — `ac_voltage_capacitor` is the highest-value version achievable within loop authority:** every
> locked number is exact and independently re-derived (X_C = 5.00 Ω, lead = T/4, q_max = 1.27 C,
> U_max = ½Cvₘ² = 20/π), its PRIMARY aha rides the tangent on the *cause* trace v and is genuinely distinct
> from both sealed siblings rather than a relabelled mirror, and the three defects that slipped past both
> machine gates and both AI reviewers — wire beads that were never built, a tangent caption that latched for
> 62% of the state, and a charge-glyph layer whose correct q < 0 configuration was literally undrawable —
> were each fixed in the engine rather than worked around in content; **what remains outside loop authority**
> is founder judgment on the now-ripened DF1 three-family refactor, hand-testing the trusted-drag explore
> sandbox (THE EYE cannot fire trusted events), teacher verification of every non-CBSE `curriculum_tags`
> cell, and ruling on the 29 scar candidates — including the two (now three) `.agents/founder_proxy/CLAUDE.md`
> enum errors this concept exposed.

## 11 · Self-review (both passes)

- Every finding has evidence verifiable in under a minute: a constraint line, a `grep -c`, a directory
  listing, or a cropped frame.
- **Pass 1 recurrence check ran against the LIVE corpus** (upgrading cycle 2's file-only check): 23 OPEN
  `peter_parker:renderer_primitives` rows queried read-only, none recurred. Plus all 17 file-based Stage-3
  classes and the commit-only scars.
- Two suspicions raised and **honestly ruled out rather than reported as findings**: the `vₘ` slider label's
  apparent mojibake (a cp1252 read artifact — the bytes are correct UTF-8 `U+2098`), and an apparent stale
  founder_drive dump (the run directory is named in **UTC**; `15:08:36Z` = 17:08 local, *after* commit
  `219937d`).
- **No P1 lowered to reach a verdict.** The opposite risk applied at pass 1 — softening C1/C2 to notes in
  order to say SEALED was declined, as was re-grading the `C`-step P3 upward to manufacture a sim-side
  finding. Both calls are written down so the founder can overturn either.
- Every scar correction prescribed was validated against the live CHECK constraints, not against the spec —
  which is itself wrong and is flagged for founder correction.
- Nothing was dispatched, no file written by founder-proxy, no SQL applied, no DB row touched.
  `visual:approve`, TTS, `PILOT_CONCEPTS`, deploy and merge all untouched — Rule 17 intact.
