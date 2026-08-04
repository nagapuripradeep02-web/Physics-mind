# founder_proxy — Checkpoint A (DESIGN GATE) · `rigid_body_rotation` (rotmech #3) · **fix cycle 2 of 2 — FINAL**

**Reviewed:** `docs/loop_runs/rotmech/rigid_body_rotation/skeleton_rev3.md` against `founder_proxy_A_cycle2.md` §7 closure list, `skeleton_rev2.md` (full diff), and the primary sources (`field_3d_renderer.ts`, `deriveStateMeta.ts`, `_engine/findings_c.md`, `_engine/scar_candidates_c.sql`).
**Date:** 2026-08-04 · **Desk:** C (`feat/rotmech-c`) · **Authority:** design gate only. No repo file edited, no agent dispatched, no SQL applied.

> Persisted verbatim by the dispatching session — this cycle's report was returned in-message.

---

## VERDICT — `DESIGN_OK`

**All eight findings and all four P3 notes landed, and I verified each against the primary source rather than the response table.** The two that could only be closed by re-derivation are both correct to the decimal: the pin rule is `clampReveal(maxRevealForField3dState(...))` = `clamp(max(candidates), 1500, 60000)` with **no duration term** (`deriveStateMeta.ts:3423`, `:3445`, `:3215`; `DURATION_MAX_MS = 60000` at `:32`, `DEFAULT_REVEAL_MS = 1500` at `:608`), the six accepted rbr sources are exactly the six named (`:3128-3213`), and the today-state is exactly as stated — S1/S2 register nothing, `!rbrFound` pushes `RBR_CUSHION` 900, clamped to 1500 (`:3212`). The self-caught knock-on is right too: **≥ 2.2 s** is the true worst case (min pin 3.0 s at S1 − 0.8 s ease), and it stays the worst case under every other row. F1's mechanism checks against the code I re-read: `isFocal = (ud.id === focal || ud.elementType === focal)` with `glowActive = !!focal` (`:50776`/`:50773`), so an elementType-as-group-token IS the only way a focal can name eight objects with one string, and the C9(b) rider now enumerates all four surfaces a new family must reach — element-type list, `flags` map, focal-match tokens, and the hardcoded brighten-only list at `:50782-50788`. F3's numbers close: `2π/1.5 = 4.18879` ⇒ crossing at **5.19 s**, θ(0) ⇒ 4.19 s; arcs 0.30 × 2.70 = 0.81 and 0.60 × 2.70 = 1.62. F4's geometry closes against the mesh build: the stripe is a box laid along **+X** from the axis (`:50322-50326`, length `0.55 × 1.8 × 0.92` = 0.506 m) and the rod is `rotation.z = π/2`, i.e. also along ±X — so the rod diameter and the stripe are the same two angles, the 22.5° + k·45° ring misses both, and the chord `2 × 0.50 × sin 11.25° = 0.195 m` is exact. P3-c's foreshortening is exact (`cos 69.9° = 0.3437 × 3.4 = 1.17 world`). The engine ask has **zero drift** — 8 active (C1, C3, C4, C5, C6, C8-BLOCKING, C9, C10) + C7 defer-recommended + C2 withdrawn, stated identically in four places — and F1/F3b/F3c landed as contract text inside C1/C9/C4/C5 exactly as required, not as new rows. The full rev2→rev3 diff contains **no state change, no ring change, no cost change, no new row**; REV 2 is preserved untouched.

I found five residual items. **None is a P1, and I am not inflating any of them to avoid signing.** Four are one-line notes for 0d/Desk E (§R below); the fifth — a stale `7.2 s` pin surviving in the carried-forward cycle-1 response table — is the only place the dead formula still shows, and it is harmless in consequence because the pin is derived and never authored. The document is what Desk E scopes from and what json_author reads weeks from now, and on that test it is now unusually complete: every asserted coincidence is reduced to a number next to the claim, every camera pose has a numeric acceptance test, every engine row names its consumers and its failure mode, and the two places where the concept **cannot** be saved by design (a declined C8; the cumulative timed-class reading) are stated as re-scopes rather than papered over with a fallback that does not work.

**The bug-queue outage persists and I verified it myself again this session** — my own run now fails with the PostgREST schema-cache error behind the same dead project. That is the fourth same-day reproduction across two independent callers. The handling is unchanged from what I ruled honest at §R-2: disclosed in the header, same-day carry-forward, boundary claim preserved, conformance to the unfiled candidates stated row-by-row (I spot-checked F and G — both accurate), and the 0d re-run made a precondition on json_author. **Same standard, same ruling: it does not block.**

---

## §V — CLOSURE-LIST VERIFICATION (verified, not accepted)

| Item | Landed? | What I checked, against what |
|---|---|---|
| **F1a** focal token | ✓ | `rbr_marker_rim` / `rbr_marker_line` as elementType is matchable at `:50776`. The **two-group split covers every focal the concept authors** — I grepped: S4 is the ONLY state that names one. More importantly the contract closes the class *generically*: C1 makes "elementType IS the group token" the rule for every marker, so any later focal must name a registered token by construction. |
| **F1b** brighten-only as a code edit | ✓ | The Rule-32 plan now reads "…the HARDCODED elementType list at `:50782-50788`, so 'join' is a per-family C9(b) code edit, never a default", with the 0.40 dim branch named. Verified the list is a literal disjunction of 13 types with no wildcard. C9(b) carries the same obligation for markers, traces AND gauges. |
| **F2** pin rule | ✓ | Re-derived from source (above). Each row now names its registering C9 key; the "C9 registration, not margin arithmetic" sentence is present and bold. |
| **F2** knock-on margin | ✓ (self-caught, correct) | 3.0 − 0.8 = **2.2 s**, and it is the minimum across S1–S5 (5.2/5.2/4.5/6.0 all give more). Corrected in BOTH places. Byte-stability survives even in the unregistered today-state, since the 1500 ms floor is already past the 800 ms ease. |
| **F2** other claims on the old formula | **one residue** | Live sections clean; the only hits are deliberate "the REV 2 formula was not real" citations, the S5 glide *duration* (3.5 s — a physical quantity, not a pin), and **the cycle-1 response table's P3-5 cell, still reading "pin at 7.2 s"** (0.60 × 12 s). See P3-iv. |
| **F3a** same arm | ✓ | Stated in §2 with the reason, in the S1 beat, in the C4/C5 rows and in the response table. The 1.40 m gauge is correctly scoped as the only span crossing the axis; 0.60 + 0.80 = 1.40 and 0.30 + 0.80 = 1.10 both check against the r = 0.80 home mass. |
| **F3b** start-ray constraint | ✓ | Written as a C4 **authoring constraint** in both the S3 beat and the C4 row, with the 5.19 s consequence and the 4.19 s failure. The "the contract exposes them as INDEPENDENT fields, so the relation is stated here because the schema will not" clause is exactly the right level. |
| **F3c** signed offsets | ✓ | Taken as-is: S1 +0.10/−0.10, S3 r₁ +0.10 / r₂ −0.10, authored in §2, in both state beats, and in C5 as an override of the single default. Rod radius is 0.05 world (`:50345`), so ±0.10 clears the cylinder on both sides and the bars sit 0.20 world apart. |
| **F4** rim ring | ✓ | 22.5° + k·45° clears rod diameter AND stripe (both at 0°/180°); chord 0.195 m stated; the REV 2 "clears at every instant" claim correctly scoped to the line dots. |
| **F5** anchor | ✓ | Distance claim, cash-out clause gone. `grep -i "fastest"` → three hits, all meta-statements *about* the word's absence. No reader-facing string carries it. |
| **F6** camera | ✓ | One shared radius for S1–S3, S6 returns to it, S4 a dolly (radius only, φ/θ unchanged), S5 the glide pose — with the framing-move accounting written out. |
| **F7** §8 provenance | ✓ | Rewritten as asked; the "one-line edit" invitation deleted; the cycle-1 R3 cell cross-corrected so the historical table cannot re-plant the inversion. |
| **F8** fallback honesty | ✓ | "There is NO design fallback for the cumulative branch… 6 + 2 = 8 and dropping to 7 changes nothing… the same outcome as a declined C8." |
| **P3-a…P3-d** | ✓ ✓ ✓ ✓ | Dolly named; C8 acceptance test written as a closable checklist; axle foreshortening worked with numbers; 16a placement stated out loud. |
| **Engine count** | ✓ no drift | 8 + C7 + C2-withdrawn, identical in four places. F1 → C1/C9, F3b → C4, F3c → C5, all as contract text. |
| **Bug-queue 522** | ✓ same standard | Third desk reproduction recorded in the header AND in `scar_candidates_c.sql`; my own fourth attempt failed too. 0d re-run obligation unchanged. |

---

## §R — RESIDUAL NOTES (all P3; **none holds the gate**; carried to 0d / Checkpoint B)

**P3-i · The C1 field list does not declare the group token the S4 focal now depends on.** The schema literal is `point_markers[]: { id, r_m, angle_deg, plane, label?, label_at_ms?/cue? }` — no `group` / `element_type` member — while the very next sentence makes that token load-bearing. This is the same discipline the document imposes on C3 at P3-1 ("must be DECLARED in the TS interface; comment-only members don't count"). One word in the literal. Not blocking: the defining sentence is unmissable and names both values.

**P3-ii · S6's "no pin contract" is conditional on a field the skeleton never names.** `deriveStateMeta.ts:3212` — `if (!rbrFound && rbr.mode !== 'sandbox') candidates.push(RBR_CUSHION)`; and `:3942` — `(rbrHold.mode === 'sandbox' || rbrHold.trusted_drag_seizes === true)` decides the hold classification. Without `mode: 'sandbox'` on S6, the explore pins at the 1500 ms floor and is classified as a scripted state. This matters more than usual because **no rbr concept JSON exists in any branch**, so json_author has no precedent file to clone the field from.

**P3-iii · S3's pin row names the wrong dominating candidate.** The row gives "crossing flash ~5.19 s" as the last asserted reveal. But §3's narration order puts the ω-introducing sentence *after* the ratio sentence in a 45–55-word state, and the ω HUD reveals only after it — and `readout_at_ms` contributes `at + 1200` (`:3193-3198`), so it very likely dominates `max(...)` by roughly ten seconds. No design consequence; naming the dominating candidate is precisely what the corrected table exists for. One clause for physics_author.

**P3-iv · The dead pin formula survives in one historical cell.** FIX-CYCLE-1 RESPONSE, P3-5: *"pin at 7.2 s precedes it by 3.8 s"* — 7.2 = 0.60 × 12 s, the fingerprint of the deleted formula; the corrected table says S5 pins at ≈ 6.0 s. The document set its own precedent at F7, where it cross-corrected a historical cell so it could not re-plant a defect. **Not blocking:** the pin is derived and never authored, both numbers satisfy the design claim, and the corrected table three sections earlier is the labelled source. Sweep at 0d.

**P3-v · S4's focal contrast is brighten-only, and one marker at the taught radius is outside the focal group.** `applyGlowEmphasis` (`:3399-3404`): a `brightenOnly` peer keeps its own opacity, so with markers in the solid carve-out the five line dots neither dim nor brighten — the emphasis reads as "the rim pulses" rather than "the rim pulses while the rest recede". Separately, the line's end dot (r = 0.50 m, 90°) sits ON the rim circle but carries `rbr_marker_line`, so eight of the **nine** markers at the taught radius light up. Both defensible — the carve-out is what protects S4 from the B2 class — but they are pixel questions settled implicitly. Flag to THE EYE at 0d; do not re-open the design now.

---

## §3 — CANDIDATE SCAR ROWS

**No new class is required by any P1 — there are none.** Cycle-2 candidates F and G are correctly indexed in `_engine/scar_candidates_c.sql` with the A6 amendment instruction and the `subject = 'subject_neutral'` convention; that manifest is accurate and I found no `bug_class` collision.

**One OPTIONAL row, the dispatcher's call** (from P3-iv; I would file it, because the fix cycle that produced the correction is exactly when the sweep is cheapest):

```sql
-- OPTIONAL - P3-iv. A corrected value survives in the same document's own response table.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'fix_cycle_corrects_a_number_in_the_live_section_and_leaves_it_standing_in_the_same_documents_response_table',
    'A fix cycle corrects a derived number where it is used, but the superseded value survives in the documents own fix-response or audit table, so the artifact contradicts itself and a later reader can act on the dead number',
    'MODERATE',
    'alex:architect',
    'rigid_body_rotation REV 3 replaced a pin formula that does not govern the renderer with the real rule and re-derived every row of the live pin table correctly, including a self-caught knock-on to the camera-ease margin. The FIX-CYCLE-1 RESPONSE table, carried forward verbatim, still records the S5 pin as 7.2 s - the value the deleted formula produced (0.60 x 12 s) - against the corrected tables 6.0 s. The same revision demonstrates that the author knows this class matters: at F7 it deliberately cross-corrected a different historical cell in the same table so a future reader could not re-plant a dependency-graph inversion. The gap is that the sweep was applied to the finding that named it and not to the finding whose number moved.',
    'When a fix cycle corrects a derived VALUE (not just a claim), grep the whole document for the superseded number before resubmitting - including carried-forward response, audit and history tables - and either correct the cell or mark it explicitly as the superseded record. A response table is read by later sessions as fact, not as history.',
    'js_eval',
    'For a resubmitted skeleton, extract every numeric value the fix cycle changed (old -> new) from the fix-response table, then search the full document text for each OLD value. Any surviving occurrence outside an explicit "was X, now Y" citation is a finding.',
    'OPEN',
    ARRAY['rigid_body_rotation']::text[],
    ARRAY[]::text[],
    'rotmech desk C - rigid_body_rotation Checkpoint A cycle 2 FINAL, 2026-08-04',
    'incident'
);
```

File with `subject = 'subject_neutral'` per the manifest header. **Not applied by me.**

---

## §4 — ENGINE QUEUE

**No `FIX(engine)` verdict and no new engine row from this review.** The ask is unchanged and must not drift: **8 active (C1, C3, C4, C5, C6, C8-BLOCKING, C9, C10) + C7 defer-recommended + C2 withdrawn to Desk D.** F1 landed inside C1 + C9, F3b inside C4, F3c inside C5 — verified in the row text, not just the response table.

`findings_c.md` PASS 4 (F-C4) and PASS 5 (C10 + the office question) are consistent with the skeleton. PASS 6 (F-C5, ride-along) is not referenced by this skeleton and does not need to be — but it binds this concept's build, so it is in the handover below.

---

## §5 — THE THREE STATEMENTS REQUIRED FOR `DESIGN_OK`

### 1 · What travels with this concept to wave 2

**Blocked until 0c-3 merges.** Before json_author starts, these must be re-verified — a stale answer changes the design, not just the build:

1. **The bug-queue re-run.** The four REV 1 queries re-run against the live table, and the whole Desk C candidate manifest applied SELECT-before-INSERT with the A6 **amendment** rather than a second class. Four failed attempts across two callers; the boundary claim travels with the document until then.
2. **C8's fate (F-C4).** Built, declined, or still open. Declined ⇒ **re-scope, not trim.**
3. **The two-timed-class fence.** Whether it binds 0c-1, and whether it counts cumulatively. Cumulative ⇒ re-scope.
4. **C7 / concept #2's wave membership.** If `motion_of_centre_of_mass` enters a wave, the defer recommendation should be re-taken rather than inherited.
5. **F-C5 (ride-along).** Until it lands, `tts_sentences[].glow` is a **silent no-op on every rbr state** — the working channels are per-state `glow_focal` + `phases[]`. json_author must not author narration-level glow bindings and assume they render, and Checkpoint B must not score narration→canvas binding against this concept as if the channel worked.
6. **No precedent JSON exists.** No concept JSON in any branch consumes the rbr scenario, so every field is authored from the contract, not cloned — including `mode: 'sandbox'` on S6 (P3-ii), `readouts` **re-declared in each of S3–S6** (a state's array is its own — `:50158`/`:50233`), and the exact `visible_elements` tokens (unknown `readouts` tokens are skipped **in silence**, `:50162`/`:50236`).

**What json_author must not silently change:** P₁/P₂ on the **same arm**; `start_line.angle_deg = θ(compare_window.from_ms)`; the **signed** per-gauge offsets (+0.10/−0.10); the rim ring at **22.5° + k·45°**; the marker **group tokens** as elementTypes; the r_point cap at **0.65 m**; **zero formula surfaces and zero v of any kind** (founder ruling R1); the ring assignment and advanced-ring contiguity; both anchors as **distance** claims; and the S3 cut order.

### 2 · Which engine rows are load-bearing — re-scope vs trim

- **C8 declined ⇒ RE-SCOPE, not trim.** All six states are [CAM]-tagged for physical, not cosmetic, reasons: at the pinned pose (aspect 0.399) S2's "circle" is an ellipse, S3's compared arcs foreshorten by an angle-dependent factor, S4's drum face is edge-on, and S1's gauge oscillates 1.0×–0.40× beside a frozen number — a live Rule 33d violation on the state that *defines* the concept. There is no surviving lesson to trim to.
- **The cumulative timed-class reading ⇒ RE-SCOPE.** Confirmed by arithmetic: existing surface six classes, new ask two, the only named reduction takes 8 → 7.
- **C7 declined ⇒ TRIM, cleanly.** S5 is the whole advanced ring; §10(i-1)'s cut is verified. The one row whose loss costs a state and nothing else.
- **C10 declined ⇒ degraded explore, not a re-scope.** The ω₀ slider would have to be dropped or its blank accepted; r_point alone still teaches the r → 0 collapse.
- **C1 / C3 / C4 / C5 / C6 / C9 ⇒ nothing is buildable.** Zero of six states is buildable today; every state needs at least C1 + C8. C9 is not optional bookkeeping — it is the only thing standing between this concept and a 1500 ms pin that photographs an unbuilt gauge.

### 3 · For the chapter-wide Checkpoint C

1. **The one-machine, two-poses question** (F-C4's crux): #3 needs near-top-down, #9 needs oblique, on the same apparatus in the same chapter. Per-state authoring solves it *within* a concept; whether a teacher moving between two Ch.7 sims should see the same machine from two poses is a chapter-level taste call.
2. **The two-timed-class fence** — signed for 0c-2 with no equivalent stated for 0c-1. An office question in two skeletons now; answer it once, chapter-wide.
3. **The unfiled scar backlog.** The entire Desk C manifest is unfiled because the table was unreachable all session. Until applied, the ratchet for the rest of this chapter runs on files, not on the corpus.
4. **One engine-log accuracy item:** `findings_c.md` PASS 6 justified F-C5's fix shape by reference to `conservation_of_angular_momentum`'s "already-approved states", but no rbr concept JSON exists in any branch. Either the reference is to a bring-up config I did not find, or the sentence should be re-worded before Desk E scopes from it.
5. **Cross-concept coherence between #3 and #9** — shared apparatus contract, shared ω/L notation, and the fact that #3 deliberately teaches *no* axial direction while #9 leads with it.

---

## HANDOFF

- **Verdict:** `DESIGN_OK` — cycle 2 of 2 closed. Design gate only; nothing here is a shipping judgment (Rule 17 untouched).
- **Next:** the physics block (this desk, wave-2 design), then **HOLD until 0c-3 merges**; the build resumes at json_author, after the §5.1 re-verification list.
- **Carried forward, not blocking:** P3-i…P3-v, plus the optional scar row in §3. None changes a design decision, an engine row, or a cost.
- **Unchanged and endorsed, must not be re-opened:** the R1 rebuild and the 6-state arc, the deletion bookkeeping, the C8 plan and its arithmetic, C10, the C7 defer recommendation, the C2 withdrawal, the ladder re-tune and clearances, the coined archetypes, both ring cuts, the v-readout and r/m/τ_brake refusals, the S3 cut order, the prerequisite ids and §8's provenance paragraph, and both anchors.
- **The sentence the founder's chapter-end packet asks for, given at the design gate rather than at C:** *within the authority this loop has — a docs-only pass on a concept blocked behind an unbuilt engine row — this is the highest-value version of the design achievable, and what is missing is not authoring but three decisions no desk can take: whether C8 is built, whether the timed-class fence binds cumulatively, and whether the chapter accepts two different camera poses on one machine.*
