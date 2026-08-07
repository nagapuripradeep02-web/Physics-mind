# Checkpoint A — `pure_rolling` REV 3 (fix cycle 2 of 2 — FINAL)

**VERDICT: `DESIGN_OK`** — with three **BLOCKING-BEFORE-DISPATCH** reconciliation items (all mechanical, none an unlanded cycle-2 P1, none requiring a founder decision) · founder-proxy, 2026-08-02

All three cycle-2 P1s landed **in the text**, not just in the response table. Ruling R-2 is conformed to correctly and non-trivially: the per-arrow reveal times in S4/S5/S6 became glow-walk windows over arrows static from state entry, the S1/S6 formula builds are declared as the bought per-line field with `deriveStateMeta` registration, and the scope guard is restated at the two-field boundary. Every number the cycle-2 report confirmed as printed reproduces to the digit after the R-2 conversion; both re-derived rows (S2 2618/382, S3 retirement-at-1500) reproduce exactly. The P1-3 "whole-ledger re-read" was **real** — it found a further contradiction of its own that was verified against REV 2 (`skeleton_rev2.md:213`: `point-speed arrows | DEFINED S4` while REV 2's own S2 rendered the centre arrow). The adversarial sweep of the scope guard finds **no third timed CONFIG FIELD CLASS surviving anywhere** — the claim holds.

The three blocking items exist because **the canonical source moved 4½ minutes after REV 3 was written** (mtimes: `pure_rolling/skeleton.md` 20:35:27, `rolling_on_incline/skeleton.md` 20:39:52). The sibling's REV 6 R-10 re-gated single-lane retirement from `lane_gap_m === 0` onto an explicit `single_lane: true` flag — and REV 3's import, which *was* verbatim against the text that existed when it was made, is now one revision stale on the one clause that decides whether retirement fires at all. Charging that to #11 as an unlanded P1 would punish the architect for text it could not read; ignoring it would ship a skeleton that, built as written, reproduces the exact P1-1 failure picture. So it is a blocking reconciliation, stated first, not a fix cycle.

No physics-correctness doubt anywhere. `v = Rω`, the cusp, the cycloid arch, `a = μ_k g`, `t_c = v₀k/(μ_k g(1+k))`, `v_roll = v₀/(1+k)`, the 0.567 envelope coefficient and the whole mark envelope at three radii and two run lengths all reproduce independently. Hence `DESIGN_OK`, not `ESCALATE` — there is nothing here for the founder to decide.

---

## BLOCKING before the 0c-2 dispatch and before json_author touches S3 (3 items)

### B-1 · The retirement trigger diverged: #11 fires retirement on `lane_gap_m = 0`; the canonical paragraph now fires it ONLY on `single_lane: true` — and #11 authors that flag nowhere · `[owner: alex:architect]`

`grep -c "single_lane"` → **#11 REV 3: 0 · sibling REV 6: 11.**

Canonical (`rolling_on_incline/skeleton.md:89`, declared "CANONICAL for the pair; #11 REV 3 quotes this verbatim"):

> **Single-lane retirement — gated on an explicit `single_lane: true` state flag (R-10), never inferred from `lane_gap_m === 0`:** … **A state authoring `lane_gap_m = 0` WITHOUT `single_lane: true` keeps all bodies co-visible.**

#11 REV 3 (`pure_rolling/skeleton.md:64`, and again at `:88` and `:314`):

> **Single-lane retirement:** in a **`lane_gap_m = 0`** state, a body is live from its own `activate_at_ms` until the NEXT body's `activate_at_ms`, at which instant it **retires**…

S3 authors `activate_at_ms = 1500` + `lane_gap_m = 0` and **no `single_lane` flag**. Built against the canonical contract (which is the one the surgeon will build — the sibling's U10/E9 row states "retirement only in `single_lane: true` states"), **#11's S3 retirement never fires**. The pin at 2400 ms then photographs the stopped skidder at s = +1.38 and the roller at s = +0.60 **interpenetrating at z = 0** (gap 0), with the skid trail still on the ground, under the caption "Skid slows; roll does not" — the misconception's own picture in the archived frame of the state that exists to kill it. That is P1-1's consequence, re-created by a flag rename.

**Correction (two edits):** re-copy the current canonical ACTIVATION SEMANTICS ¶ (it also enumerates R-11's whole-body hiding — mesh, arrows via `nlbDriveArrowsForBody`, labels, trail, readout rows — which #11's copy compresses to "by default, hidden"); and author **`single_lane: true` + `lane_gap_m = 0`** on S3 in §3, the camera plan, DoD (a), and union (b)-10/(c)-5. The sibling's S3 already shows the authored form to copy.

### B-2 · #11's E9 acceptance asserts a distinction the canonical paragraph says does not exist (`activate_at_ms: 0`) · `[owner: alex:architect]`

#11: *"`activate_at_ms: 0` ⇒ active from entry **by authored instant**, **distinct from the absent default in the meta**"*. Canonical: *"presence resolved by `typeof`, never truthiness — **authored 0 ≡ absent by definition**"*; the sibling's R-14 adds *"…and **notes where they coincide by definition**."* A surgeon building #11's regression pair for `activate_at_ms` must assert a geometric difference that by definition cannot exist — the test can only fail. (The `lane_gap_m` and `visible_before_activation` halves of P2-6 are correct and stay: for those, 0/`false` genuinely differ from absent.) Correction: adopt the canonical wording — `activate_at_ms` is the *documented coincide-by-definition* case; the falsy-trap regression stands for `lane_gap_m` and `visible_before_activation`.

### B-3 · The sibling minted **E19** for a build item #11's own state table consumes, and #11's dispatch list does not carry it · `[owner: alex:architect]`

Sibling: **U14/E19 = per-body `rotation_locked`**, blocking, `field3d_surgeon`, consumers *"#12 S3 (the skidding block); #11's 16a contrast state"*. #11 consumes it explicitly and repeatedly — `nlb_wheel_locked` (`rotation_locked`), `rotation_locked` constant per id, named primitive in the 16a beat, (b)-7 consumed. #11's `engine_queue` mapping lists E1, E9–E14, E15–E17, E18 — **no E19**. This is the same class REV 3 correctly closed for E15–E17 ("the surgeon's list is ONE list"), recurring one revision later because the sibling minted a new number after REV 3 was written. E20 (U15 centre markers) is correctly absent — #11 declares (b)-15 not consumed ✓. Correction: add E19 to #11's dispatch list.

---

## Pass 1 — scar consultation (the ratchet fires mechanically for the first time)

**Tooling verified.** `query_engine_bug_queue.ts --scenario newtons_laws_body --open` resolves to **exactly eleven concept ids** and returns **29 rows** — **identical to the eleven ids and the 29-row count REV 3's grep-based sweep reports.** REV 3's coverage claim is now machine-verified correct, and its refusal to use `--field3d` as coverage was the right call (that flag's 78 rows span the whole fleet, not this scenario). Credit — the sweep was not hiding rows.

**`pure_rolling --open` → 16 rows (0 in both prior reviews).** Disposition of all sixteen against REV 3:

| Filed class | Verdict against REV 3 |
|---|---|
| `skeleton_authors_a_second_timed_action_after_the_engine_buy_was_scoped_to_one_instant` | **CLOSED.** Dissolve deleted; classification sweep run. Two unnamed spans → P3-1. |
| `prior_rulings_and_internal_ledgers_are_not_re_run_over_the_states_a_restructure_creates` | **CLOSED — exemplary.** Per-state relation-check column over all eight states; full ledger re-read that caught its own further contradiction. This is what the row's DO asks for. |
| `skeleton_authors_a_timed_reveal_chain_of_overlays_on_a_scenario_whose_overlay_config_is_static` | **CLOSED by R-2 conformance.** Formula lines bought + `deriveStateMeta` registered; arrows static + glow-walk. |
| `two_skeletons_sharing_one_engine_build_state_different_semantics_for_the_same_bought_field` | **RECURS → B-1 + B-2.** Not through REV 3's fault (chronology above), but the condition exists now. |
| `paired_skeletons_cite_each_other_by_state_number_across_a_renumbering` | **Closed on #11's side** (references by content). Family residue → B-3. |
| `state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach` | **CLOSED for all eight states.** S2/S5/S6 author none; S7 moved to a window ending at capture; S4 hands back equal. Residue → P3-2. |
| `velocity_arrows_routed_through_a_force_arrow_map_collapse_their_ratio…` | **CLOSED across the whole envelope**, sandbox included. |
| `skeleton_pin_budget_names_the_phase_start_instead_of_the_last_asserted_reveal_inside_it` | **CLOSED.** All eight rows budget to assertion-chain COMPLETION. |
| `architect_reuses_a_marker_mechanism_without_diffing_the_side_effects…` | **CLOSED.** Four-part diff; capacity re-checked at both slider extremes AND both run lengths. |
| `close_camera_framed_extent_is_authored_as_the_run_length_and_omits_the_body_radius` | **CLOSED.** 4.0 m, both endpoints, in-frame acceptance at t = 0 / pin / end. |
| `optional_config_field_with_a_legal_zero_value_is_resolved_by_truthiness` | **Addressed**; one clause diverges → B-2. |
| `skeleton_authors_a_multi_phase_state_on_an_engine_with_no_per_body_activation_time` | **CLOSED** — activation bought; the overlay half done via R-2. |
| `nlb_lane_offsets_apply_to_declared_bodies_not_co_present_ones` | **CLOSED** — lane reader quoted; both bodies z = 0. |
| `field3d_nlb_arrow_min_length_floor_collapses_small_force_visibility_and_ratio` | **CLOSED** — own velocity channel; #11 draws no force arrows. |
| `architect_scar_audit_claims_completeness_while_skipping_open_rows…` | **CLOSED in substance**, now machine-verified. Its DO changed today (`--scenario`); REV 3's method returns the identical id set. |
| `architect_declares_an_engine_limit_without_checking_the_per_concept_override_path` | **CLOSED** — lane reader + marks-reuse diff both read, not asserted. |

---

## Independently re-derived (every number, again)

**The two rows that changed.**

- **S2 (P3-3).** Arch period = 2πR/v = 1.5708/0.6 = **2618 ms** ✓; 2618/5000 = **52.4%** ✓; pin 3000, margin **382** ✓. First cusp πR/v = **1309** ✓. s(3000) = **+0.6** ✓, inside [+2.9, −1.1] ✓; run end **−0.6** ✓. Camera target = midpoint **+0.9** ✓. Extent = 3.0 + 0.5 + 0.5 = **4.0 m ≈ [+2.9, −1.1]** ✓; body spans [+2.15, +2.65] at t = 0 and [−0.85, −0.35] at end — **both inside** ✓ (P2-1 landed; the REV 2 clip is gone).
- **S3 (P1-1).** a = **1.96 m/s²** ✓; stop **1020 ms**, s = **+1.3796** ✓. Hold 1020 → 1500 = 480 ms; **retirement = 1500 = phase B's `activate_at_ms`** — the activation instant itself, no second timed field ✓. Pin 2400 ⇒ t_B = 900 ms ⇒ s = **+0.60** ✓. B ends **−2.6** at 4000, **0.4 m inside** the bound ✓. Last asserted 1800 = 45.0%, margin 600 ✓. **No empty-track instant** ✓ (the 100 ms hole is gone).

**The six rows confirmed as printed — all still correct after the R-2 conversion.**

| Row | Re-derivation |
|---|---|
| S1 | turn = **1745** ✓ · L2 2600 = **52.0%** ✓ · pin 3000, margin **400** ✓ · s(pin) = **−0.30** ✓ · end **−2.1** ✓ · mark 2 @ 3490 > pin ✓ · 2πR = **1.57 m** ✓ |
| S4 | 1200 = **30.0%** ✓ · pin 2400 ⇒ s = **0.0** ✓ · end **−1.6** ✓ |
| S5 | 1200 = **30.0%** ✓ · pin 2400 ✓ · no translation ✓ |
| S6 | L2 2400 = **50.0%** of 4800 ✓ · pin **2880**, margin **480** ✓ · s = **−0.48** ✓ · end **−2.4** ✓ · v = Rω = 1.0 ✓ |
| S7 | t_c = **1360.5 ms** ✓ = **40.0%** ✓ · slide **2.26757 m** ✓ · capture **+0.1324** ✓ · v_roll **1.3333** ✓ · pin 2040 ⇒ **−0.7729** ✓ · end **−2.5863** ✓ · at k = 1, t_c = **2041 = 60.03%** — ON the pin, so the uniform-disc declaration is genuinely load-bearing ✓ |
| envelope | d = **0.56689** ✓ · d_max(2.5) = **3.5431** ✓ · capture s ≥ **−1.1431** ✓ |

**Marks envelope at both run lengths (P3-1).** R = 0.15: +2.4 / +1.45752 / +0.51504 / **−0.42744** / −1.36991 = **5 unseized**; mark 5 at **−2.31239** ⇒ **6 seized** ✓. R = 0.25: 3 unseized (**2.1708 m** from +3.0, **2.2584 m** from −3.0 ✓) ⇒ 4 seized ✓. R = 0.35: **3 both ways** ✓. All in bounds ✓.

**Velocity channel.** Floor = **0.27174 m/s**; 1.5× margin = **0.40761 m/s**. S2 centre 0.552 wu = **2.208×** ✓ · S6 top 1.84 < 2.80, ratio **2 : 1 exact** ✓ · **S8 centre 0.46–2.30 wu over v₀ ∈ [0.5, 2.5]: min 1.84× floor, max 0.50 below MAX** ✓. **S8's contact is a dot + live value at all times**, so the sub-floor band (0, 0.4076) m/s the ω₀ demo creates has a specified honest rendering ✓.

**S1 sentence plan (P2-4).** 10 + 12 + 12 + 10 + 9 = **53 ≤ 55** ✓; literal count of the written strings is 51, so it clears either way and stays ≥ 45 ✓.

**Delta cues.** All eight ≤ 5 words: 4 / 4 / 5 / 4 / **4 (P3-2 landed)** / 4 / 3 / 3 ✓.

---

## The scope guard, checked adversarially (the highest-value catch available)

Every millisecond in the document was re-classified independently, not against REV 3's list:

- **Bought class:** `activate_at_ms = 1500` (S3) — the only activation instant ✓. Formula lines S1 2300/2600, S6 1800/2400 ✓ — legal under R-2, correctly attributed to (c)-9, correctly flagged as requiring `deriveStateMeta` registration.
- **Glow windows:** S2 rim-dot; S4 300–600/600–900/900–1200; S5 same; S6 300–600/600–1000/1000–1400; S7 800→1361. All on the existing `phases[].glow_focal` channel ✓.
- **Physics events:** mark 0 @ 0, mark 1 @ 1745 (turn-count trigger on s(t)), cusp 1309, arch 2618, stop 1020, capture 1361 ✓.
- **Unclassified residue — two items, both benign, neither a new field class** → P3-1.

**Conclusion: no third timed CONFIG FIELD CLASS survives anywhere.** The R-2 conversion is real, not cosmetic — S4/S5/S6's former per-arrow reveal times are gone, replaced by windows over arrows declared static from entry; S2's arrow + marker likewise. The alarm rule is correctly stated at the two-field boundary in both the scope guard and the union closure.

---

## Findings

### P2

**P2-A · The scope guard's own wording is stricter than the canonical guard, and #11's marks primitive contains an animation it forbids.** #11 writes *"no timed property changes"*; the canonical guard writes *"no `phases[].action` revival"* and frames the fence as **field classes**. Under #11's stricter literal wording, S1's bracket drawing from 1745 to 2050 is a timed property change on an overlay — self-falsifying. Under the canonical framing it is a draw duration internal to the bought E12 primitive, which is correct. Adopt the canonical wording. `[alex:architect]`

**P2-B · The `eye_h2` disposition inherits an acceptance the sibling has since corrected.** #11 states the inheritance as *"frozen captures byte-stable under the pin; compared only at the pinned instant"*; the sibling's R-9 re-worded it to the row's actual DO — *"H2 PASSES its tolerance AND any non-zero percentage reproduces on the PRE-change renderer **or has max channel delta ≤ 3**"* — and removed the invented "recorded wobble band" phrasing. Since #11 inherits *by reference*, the reference resolves correctly; quoting the corrected criterion costs one line. `[alex:architect]`

### P3

**P3-1 · Two authored spans the classification sweep does not name.** (i) S1's bracket draw **1745 → 2050** — the trigger is classified (physics event) but the **305 ms draw duration** is not; it belongs in E12's primitive spec or the surgeon will not build it. (ii) S3's *"readouts settle @ 1800"* — a 300 ms settle after activation, presumably existing readout smoothing, unclassified. Neither introduces a field class; both should be named so the sweep's "every authored millisecond" claim is literally true.

**P3-2 · The relation ruling is explicit for S2/S5/S6 and implicit for S1/S4.** The glow table marks S1 and S4 "relation" and gives them `phases[]` + hand-back, but only S2/S5/S6 carry the bold **"NO state-level `glow_focal`"**. Making the cell explicit closes the door a future restructure could reopen — precisely the failure the row's own DO describes.

**P3-3 · S7's slider is 1.0–2.5 m/s while S8's is 0.5–2.5.** Both envelopes separately stated and both check out; the differing range for the same named control is legal per Rule 31 but worth one clause so json_author does not normalise them.

**P3-4 · The 16 newly-filed `pure_rolling` rows need explicit disposition at Checkpoint B.** REV 3's "0 rows" is now stale.

**P3-5 · Cycle-1's and cycle-2's scar candidates remain unfiled at the source.** The rotmech rows are now filed; the remaining upserts are not.

---

## Per-state table (design-level — no frames exist at Checkpoint A)

| state | correct | order_ok | labels_present | reads_sound_off | clearly_different | how_i_would_use | problem_or_missing | pri |
|---|---|---|---|---|---|---|---|---|
| S1 | Y | Y | Y (v, ω dual-labelled, marks, bracket, one formula surface) | Y | Y (marks + bracket stamp the ground) | "One full turn puts exactly one circumference of road behind it." | Bracket draw span unnamed in the sweep; glow cell implicit | P3-1, P3-2 |
| S2 | Y | Y | Y (centre arrow, contact marker) | Y | Y (the cusp) | "Put your finger on the bottom of the wheel — it is not moving." | none new — extent, focal and last-asserted-event all corrected | — |
| S3 | Y (physics re-verified) | Y | Y (f_k, f, trail) | Y | Y (two pictures, one state) | "The skid mark is the proof: a rolling tyre leaves none." | **Retirement trigger diverged from the canonical flag; `single_lane: true` authored nowhere** | **B-1** |
| S4 | Y | Y | Y (three equal arrows, static + glow-walked) | Y | Y (spokes visibly still) | "No turn at all — so every point of it moves at the same speed." | Still the thinnest state; glow cell implicit | P3-2 |
| S5 | Y | Y | Y (±0.92 wu arrows, centre marker) | Y | Y (only spin-in-place state) | "Spin it on the spot: the top goes forward, the bottom goes back, the centre stays." | none new | — |
| S6 | Y | Y | Y (1.84 / 0.92 / marker, two bought formula lines) | Y | Y (the sum) | "Add the two: the top gets 2v, the bottom cancels to zero." | none new — coinage retired, pair declared, R-2 conversion clean | — |
| S7 | Y | Y | Y (v, Rω, contact converging) | Y | Y (capture) | "Watch the two numbers meet — that instant is when it starts rolling." | none new | — |
| S8 | Y | Y | Y (v, Rω, contact dot + live value, turns) | Y | Y (teacher-driven) | "Give it spin, take spin away, watch it settle into rolling." | v₀ range differs from S7's | P3-3 |

---

## `engine_queue` — carry-forward to the 0c-2 dispatch

| # | Item | Owner | Tag | Status at REV 3 |
|---|---|---|---|---|
| E1 | State-local physics clock / `RESET_TRAJECTORY` rebase | `peter_parker:renderer_primitives` → pcpl-surgeon | blocking | precondition of every timing row and both bought fields |
| E9 | Per-body `activate_at_ms` + derived retirement | `peter_parker:field3d_surgeon` | blocking | **B-1/B-2 must land first** |
| E10 | `lane_gap_m` incl. 0 (absorbs the retired E7b) + `single_lane` | `peter_parker:field3d_surgeon` | blocking | falsy-trap regression correct here |
| E11 | Two-channel vector map + live-value marker | `peter_parker:field3d_surgeon` | blocking | acceptance amended to the fleet definition ✓ |
| E12 | Revolution-mark primitive independent of `checkpoints` | `peter_parker:field3d_surgeon` | blocking | **+= the bracket draw span (P3-1)** |
| E13 | ω re-seed on wrap; trail/trace/retirement break | `peter_parker:field3d_surgeon` | ride-along | unchanged |
| E14 | Visible-elements matcher registration | `peter_parker:renderer_primitives` | ride-along | set enumerated ✓ |
| E15–E17 | U1 branch priority · U2 contact picture · U4 apparatus set | `peter_parker:field3d_surgeon` | blocking | carried into #11's list ✓ |
| E18 | Per-line formula reveal + `deriveStateMeta` registration | `peter_parker:field3d_surgeon` | blocking | **Number reconciled ✓** — the sibling's U16 mints E18 for the same content. No conflict. |
| **E19** | **Per-body `rotation_locked` (U14)** | `peter_parker:field3d_surgeon` | blocking | **MISSING from #11's list → B-3** |
| E20 | Centre markers (U15) | — | — | correctly absent — #12-only ✓ |

---

## Carry-forward to `physics_author`

1. **S1 narration must hit the 53-word plan as written** — sentence ① is the anti-planting opener ("the wheel's **CENTRE** moves at v"), ② the ω dual-label + prerequisite patch, ⑤ the 9-word bicycle anchor. Gate 3f counts `text_en`; ~2–4 words of headroom, not more.
2. **Rule 30b symbol expansion** in spoken text while on-canvas labels stay symbolic — the plan's word counts already assume the expanded forms.
3. **S3's narration must bridge the hard cut** at 1500 ms — the skeleton's placeholder is not final copy.
4. **Every `tts_sentences[]` entry carries a `glow`** — with `glowActive` false on S2/S5/S6, per-sentence bindings drive emphasis, which is the intended channel.
5. **S7's one-sentence `tau_eq_i_alpha` patch** + the uniform-disc modelling declaration (k = 0.5); **k never renders**.
6. **`readouts` enum extension** — `:1336` lacks `contact`, `Rω` and bare `ω`; declaration + reader + validator co-edit.

---

## Candidate scar rows (report-only)

```sql
-- 1 (NEW class)
('engine_dispatch_list_omits_a_build_item_the_documents_own_state_table_consumes',
 'A skeleton driving a shared engine build lists only the build items it minted itself, while its own state table names apparatus flags another document minted a number for',
 'MODERATE','alex:architect',
 'Two skeletons drive one engine build and each mints dispatch numbers as its reviews land. One document''s state table names a per-body apparatus flag four separate times and lists it as a consumed row, but its dispatch mapping carries no number for it because the sibling minted that number after the revision was written. The surgeon receives one list and builds one list, so the omitted item is simply not built and the state that depends on it fails at bring-up.',
 'Before dispatch, walk the OTHER document''s full build sheet row by row and assert every row whose consumer column names this concept appears in this concept''s dispatch mapping with the same number. Do the reverse walk too. A consumed-rows table and a dispatch mapping are two different lists and both must close.',
 'manual',
 'For each row of the shared build sheet whose consumer column names either concept, confirm the named concept''s engine_queue mapping carries that E number; and for each E number in either mapping, confirm a build-sheet row exists with that number.',
 'OPEN', ARRAY['pure_rolling','rolling_on_incline']::text[], ARRAY[]::text[], 'founder_proxy Checkpoint A rotmech pure_rolling REV3 2026-08-02', 'directive'),

-- 2 (NEW class)
('canonical_paragraph_moves_after_the_sibling_quotes_it_verbatim_so_both_documents_claim_agreement_while_diverging',
 'One document is declared the canonical source for a shared contract and both documents assert a verbatim quote, but the canonical text is edited after the quote is taken and neither document carries a revision stamp',
 'MAJOR','alex:architect',
 'A pair of skeletons driving one engine build named one paragraph as the single canonical source for a bought config field. The second document quoted it verbatim and said so; four minutes later the canonical document re-gated the field''s central behaviour onto a new flag and re-asserted, in its own header, that the sibling quotes it verbatim. Both documents now claim agreement while stating different trigger conditions, and the flag the new semantics require is authored in neither the second document''s state table nor its union. Built as written the dependent state loses the behaviour entirely and its frozen frame shows the picture the state exists to refute.',
 'A verbatim import carries the source revision and a hash or line range, never the bare word verbatim. The canonical document may not assert what a sibling contains - it states its own revision, and the importing document restates the quote and its revision. Any edit to a paragraph declared canonical for a pair triggers an immediate re-import in the same session, and the flag or field the new semantics require is authored into the importing document''s state table in that same edit.',
 'manual',
 'Before dispatching a shared build sheet, diff the canonical paragraph against every document claiming to quote it verbatim, field by field - name, default, trigger condition, companions, boundary rules - and confirm each importing document authors every flag its own states need under the CURRENT semantics.',
 'OPEN', ARRAY['pure_rolling','rolling_on_incline']::text[], ARRAY[]::text[], 'founder_proxy Checkpoint A rotmech pure_rolling REV3 2026-08-02', 'directive')
```

**UPSERT, do not re-mint:** `two_skeletons_sharing_one_engine_build_state_different_semantics_for_the_same_bought_field` — extend its DO with the *revision-stamp* clause (its current DO assumes the divergence is a restatement, not a post-quote edit of the canonical source). `state_glow_focal_dims_one_half_of_the_relation…` and `field3d_nlb_arrow_min_length_floor…` already carry `pure_rolling` — the cycle-2 upserts landed ✓.

---

## Key artefacts (the four reads that settle this review)

1. `rolling_on_incline/skeleton.md:89` vs `pure_rolling/skeleton.md:64` — the two retirement sentences side by side. B-1 in one comparison; `grep -c "single_lane"` returns 11 and 0.
2. `pure_rolling/skeleton.md:123` — the authored-millisecond classification sweep. The claim asked to be broken adversarially, and it holds; the two unnamed spans (P3-1) are the only residue.
3. `pure_rolling/skeleton.md:221` — the ledger row REV 3 found against itself, verified against `skeleton_rev2.md:213`. Proof the whole-ledger re-read was real work, not a claim.
4. `rolling_on_incline/skeleton.md:284` (U14/E19) vs `pure_rolling/skeleton.md:344–349` — the dispatch list with the gap. B-3.

---

```
RUBRIC (advisory, unratified — docs/EXEMPLAR_RUBRIC.md; did not affect the verdict)
  Checkpoint A subset:  D1 1 · D2 2 · D8 2 · D9 2 · D10 2   = 9/10   (REV 2: 8/10, REV 1: 8/10)
  weakest: D1 information gain — S4 is still the thin state. A non-turning wheel
           translating is a picture already on screen in S3 phase A; S4's whole residue
           is the three-equal-arrows claim, and S6 is by construction S4 + S5.
           D9 title as a teaching claim — repaired this revision (S4/S5 now state
           results, not conditions), so it rises 1 -> 2, but it is the least secure 2 in
           the set: the rail truncates and the first words spend on the condition.
  D2 (2): the order IS the build; the aha lands at 2 of 8.
  D8 (2): exactly two beats (S2, S3), both at genuine pivots, both naming primitives.
  D10 (2): the turns counter keeps the R dial consequential under the reduced preset.
  Movement since REV 2: D9 1 -> 2. D1 unchanged — the split's shape is founder-ruled
  and the do-not-churn list protects it, so this dimension is parked by design.
```

**Fix cycle 2 of 2 closes here.** The three cycle-2 P1s landed, founder ruling R-2 is conformed to, no physics doubt survives — **`DESIGN_OK`**. `physics_author` and the 0c-2 `field3d-surgeon` dispatch are authorised **after B-1/B-2/B-3 land**, which are three mechanical edits (import the current canonical paragraph, author `single_lane: true` on S3, add E19) requiring no design judgment and no further review cycle. No cycle 3 was opened and no escalation raised, because there is no decision here that belongs to the founder: the divergence was created by a parallel edit to the canonical source four minutes after this revision was written, and the canonical source already states the correct answer.
