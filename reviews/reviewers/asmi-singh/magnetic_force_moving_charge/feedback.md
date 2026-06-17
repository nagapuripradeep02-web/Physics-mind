# Master change-list — `magnetic_force_moving_charge` · Reviewer: Asmi Singh

> **Status: 🛠️ IMPLEMENTED 2026-06-16 — pending founder review, then re-show Asmi.**
> Built from the 2026-06-15 video call (Part 1 Zoom + Part 2 screen recording) **and Asmi's
> handwritten notes (15 Jun, 13:05).** Founder scope call (2026-06-16): implement the whole list
> **except pitch** (deferred to its own nano concept, 2–3 states) and **the hand mesh** (left as-is).
> Everything else done in one pass and verified with THE EYE (frames read, all fixes confirmed).
>
> **Implementation log (2026-06-16):**
> - **Reorder 0°→90°→45°→10°** (#1, #2, #3): states reassigned in `magnetic_force_moving_charge.json`
>   (90° circle block now STATE_2–4, 45° intro+component-split STATE_5–6, 10° stretched helix STATE_7);
>   45°/10° re-framed as *descending* from the circle; lockstep updates to `field_3d_config.states`,
>   `aha_moment.state_id`→STATE_2, `entry_state_map`, `epic_c_branches`.
> - **STATE_1 cleanup** (#4, #5, #7): removed the RHR "thumb-along-v" caption/narration; caption now
>   states **E = 0 + uniform B**; narration shows the **full Lorentz law F = qE + qv×B** (math overlay
>   verified on screen).
> - **RHR moved to the 90° state** with corrected wording **"fingers along v → curl toward B → thumb
>   gives F"** (#6).
> - **Component split now sits with 45°** + the **"why it moves forward" (v cosθ drift)** point + general
>   **r = m·v·sinθ/qB, T = 2πm/qB** (#9), all rendering in STATE_6.
> - **Renderer (`field_3d_renderer.ts`)**: 90° **circle now closes** (skip duplicate/frozen trail samples
>   so a TTS pause no longer burns the buffer mid-orbit) (#11b); **helix path drawn persistently** with a
>   clean loop instead of the dead-zone jump-line (#11); **45° motion balanced** — axial drift ∝ cosθ and
>   circle ∝ sinθ from one base speed, equal at 45° (#12). Verified: 90° closes, 45° opens to a balanced
>   helix, 10° is a very stretched near-straight helix.
> - **Pause discoverability** (#13): added an auto-fading "⏸ Tap the sim anytime to pause" cue to the
>   review-site player (`build_review_site.ts`), retiring once the student pauses.
> - **On-canvas prose removed (Rule 24, 2026-06-16 follow-up #4):** emptied the top `caption` prose box in
>   all 8 `field_3d_config.states` and made the renderer hide an empty caption (`#caption:empty{display:none}`).
>   Kept the small bottom-left **minimal label** (Asmi: "keep a minimal label") + the 3D labels (v, F, v cosθ,
>   v sinθ) + equation overlays. The narration prose lives only in `teacher_script` now. Admin harness
>   descriptions also re-synced to the new order (`page.tsx`).
> - **NOT done (by design):** pitch (#8 → separate nano concept later); #19/#20 left for Asmi to confirm
>   (do not "fix" correct physics).
> - **Verify:** `tsc` 0 · `validate:concepts` PASS · cache re-seeded · THE EYE 43/49 (the 6 fails are
>   expected H2 baseline regressions from the intentional re-order — re-approve baselines *after* founder
>   sign-off).
> **Next: founder review → `visual:approve` to lock baselines → rebuild/redeploy the review link for Asmi.**

- **Sim:** `magnetic_force_moving_charge`
- **Reviewer:** Asmi Singh (physics tutor — reviewing as a teacher who will *use* the sim to teach)
- **Review date:** 2026-06-15
- **Sources:** [video part 1](sources/2026-06-15_video_part1_transcript.md) ·
  [video part 2](sources/2026-06-15_video_part2_transcript.md) ·
  [handwritten notes](sources/2026-06-15_asmi_handwritten_notes.md)
- **Item key:** `source:` video / notes / both · `priority:` P1 (must) / P2 (should) / P3 (nice) ·
  `status:` open / done / clarify

---

## 1. Reorder the states — the dominant change (P1)

| # | Change | source | priority | status |
|---|---|---|---|---|
| 1 | **Re-sequence angle states pedagogically:** θ=0° → **θ=90°** → **θ=45°** → **θ=10° (stretched helix)**. Helix/10° is currently introduced before 90° and 45°, which she (as a teacher) found genuinely confusing. 90° must establish *why circular*; 45° must establish *why it splits + why helical*; only then 10° (stretched helix) makes sense. **Notes add specificity: the state she labels "State 4" "should be introduced earlier"** (a concrete state to pull forward in the re-sequence). | both | P1 | open |
| 2 | **Move the v·cosθ / v·sinθ component-split slide to sit *with* the θ=45° state**, not several slides later. The narration promises "now we'll see how V breaks" but the breakdown currently appears after the 90° material — order mismatch. | both | P1 | open |
| 3 | The states are "dispersed" — after reordering, group the related slides (0 → 90 → 45 → 10 → Fleming) into one continuous interrelated flow. | video | P1 | open |

---

## 2. STATE_1 (θ=0) cleanup (P1)

| # | Change | source | priority | status |
|---|---|---|---|---|
| 4 | **Remove the big UPPERCASE on-canvas text block.** "Nobody reads this" — students listen to narration / read captions. Keep only a minimal label, e.g. **"θ = 0"** (notes: "only take θ=0°"). | both | P1 | open |
| 5 | **Remove the right-hand-thumb-rule content from STATE_1 entirely** — RHR isn't taught yet here, so it only confuses. RHR belongs at θ=90°. | both | P1 | open |
| 6 | **Fix the RHR narration wording.** Sim currently implies *"point your thumb along v / thumb and fingers along the same axis."* Correct & non-confusing RHR: **fingers along v → curl toward B → thumb gives F.** ("Why would I point my thumb along v? That creates a lot of confusion.") | video | P1 | open |
| 7 | **State the Lorentz setup explicitly: E = 0 and B is uniform, and SHOW the Lorentz formula.** Notes: "only take θ=0°. **Show Lorentz formula**" + "nowhere mentioned E=0, B=constant." Full law F = qE + qv×B; here E=0 ⇒ F = qv×B. Display the Lorentz formula at STATE_1 and state E=0 + B uniform. | both | P1 | open |

---

## 3. Missing physics content (P1–P2)

| # | Change | source | priority | status |
|---|---|---|---|---|
| 8 | **Add PITCH.** Not present anywhere. p = v∥·T = v·cosθ·(2πm/qB). She stressed students don't grasp pitch — *make it visible in the helical motion*, ideally called out by the narration. | video | P1 | open |
| 9 | **Add general-angle derivations + "why does it move forward?"** (not just the 90° case): radius **r = m·v·sinθ/qB**, period **T = 2πm/qB** (same as 90° — make the "period unchanged" point); and explicitly explain the forward drift = v·cosθ component. Notes (S2): "**No mention of why is it moving forward.**" Put derivations in the box if it doesn't get messy. | both | P2 | open |
| 10 | **Reconsider the "no drift" callout.** Drift isn't introduced yet at this stage, so mentioning it may confuse — consider removing. | video | P2 | open |

---

## 4. Bugs (P1)

| # | Bug | source | priority | status |
|---|---|---|---|---|
| 11 | **Trajectory/path not drawn fully** — recurring across helical states *and* the STATE_8 explorer. Path line is faint/partial — "only halfway then it's not there." Notes (S2): "Path is not cleared." Frames confirm the path is barely visible. Most-flagged rendering bug. | both | P1 | open |
| 11b | **Circular path does not close/complete.** Notes (S5): "Circle not completed" (also said in video ~25:49: "this is not showing a complete circle"). At the 90° state the circle should render as a full closed loop — currently it doesn't complete. Likely the same trajectory-rendering root cause as #11; verify the circle closes. | both | P1 | open |
| 12 | **θ=45° timing is physically wrong.** Animation shows the circular motion taking *longer* than the forward drift. At 45°, v·cosθ = v·sinθ (= v/√2 each) ⇒ equal contribution, equal time/distance. Fix the relative timing so circle vs forward-drift are balanced at 45°. Notes (S3): "[takes] more time circling? less time forward?" | both | P1 | open |
| 13 | **Pause discoverability.** She first thought she couldn't pause ("it restarts from the beginning"), then found clicking the sim pauses it (freeze feature works — badge confirmed). Make the pause affordance obvious, and verify resume does NOT restart from the beginning. | video | P2 | open |

---

## 5. Keep — explicitly praised, do NOT touch (P3)

| # | Item | source |
|---|---|---|
| 14 | θ=90° circular-motion sim — "very good, everything got cleared." | video |
| 15 | RHR slide at θ=90° — "that slide was really nice." | video |
| 16 | Fleming's left-hand-rule slide relating RHR ↔ LHR — "really nice, no need to change." (Idea floated: later split RHR & LHR into separate 2–3-slide mini-sims; current ones stay for now.) | video |
| 17 | v·cosθ / v·sinθ component-split explanation — "getting very much cleared from the simulation." | video |
| 18 | "Magnetic force does no work (F·v=0 ⇒ constant speed, only direction changes)" — present & correct. | video |

---

## 6. Clarify with Asmi before implementing (possible errors in *her* feedback)

| # | Item | why flag it |
|---|---|---|
| 19 | She said at **θ=0 the particle "loses energy and eventually stops."** | Contradicts the (correct) "magnetic force does no work ⇒ speed constant" point she makes later. In the ideal model, at θ=0 force is zero ⇒ particle moves straight *forever*. **Do not** implement "it stops" — confirm what she meant. |
| 20 | At **θ=90° she said "increase velocity → larger circle, has to remain same."** | Radius *does* grow with v (r=mv/qB); it's the **period** that stays the same. Ambiguous — confirm so we don't "fix" correct behavior. |

---

## 7. Process / meta (not sim changes)

- **Audience confirmed:** founder told her these sims are for **tutors/institutes to teach *with***,
  not standalone for students. She agreed strongly ("I use sims to teach students; you'll use this and
  explain to them") and will review from a teacher's POV. → validates the B2B/B2B2C thesis.
- **Iteration model:** fix this list → show her again → she'll suggest a smaller 2nd pass only if
  needed. She intentionally limits feedback per pass to keep it simple.
- **She offered** to help break any state into 2–3 sub-states (e.g. the v·cosθ component) once the
  above is fixed.
- **Next meeting:** tomorrow morning (2026-06-16), ~15 min before her class — to discuss the
  **product idea** (founder requested).
- **Deliverable status:** Asmi's **handwritten notes received & merged (2026-06-15)** — corroborated
  the P1 items + added #11b and the S4-earlier specificity; no contradictions. List is ready to
  implement on founder's go. (A separate Excel, if it ever comes, would be re-merged.)
