# Review analysis — `biot_savart_law` · Reviewer: Asmi Singh

> **Source:** 27-min screen-share recording, 2026-06-17 (`sources/2026-06-17_video_transcript.md`,
> Whisper transcript). Asmi taught the concept "as if to a student", narration OFF, walking the
> deployed review link state-by-state and annotating ON the canvas in red pen.
> **Status:** STATE_10 r/θ physics fix **IMPLEMENTED 2026-06-16/17** (uncommitted). Rest = change-list
> below, to merge with her notes/Excel (arriving ~2026-06-18).

## 0. Is her physics correct? — YES, essentially all of it
- Biot-Savart is an **experimental law** (can't be derived) — correct framing.
- Builds dB from four proportionalities: dB ∝ I, ∝ dl, ∝ sinθ, ∝ 1/r², constant μ₀/4π ⇒
  **dB = (μ₀/4π) I dl sinθ / r²**, then the cross-product form **dB = (μ₀/4π) I (dl×r̂)/r²** — correct.
- θ = angle between **dl** and **r̂** (line element→P) — correct.
- Direction by RHR: thumb along current, curl fingers ⇒ B circles the wire (into page one side, out the
  other) — correct.
- **The key insight (STATE_10):** "r is the distance from the dl **element** to P; it equals the circle
  radius **only at θ=90°**. Move the element and both θ and r change." — **correct and the most important
  point of the whole call.** (Minor wording nuance: she says "no direct relation between θ and r" — for a
  *fixed* P there *is* one, r = d/sinθ; her teaching point — you pick the element, which sets both — is sound.)

## 1. STATE_10 (interactive) — the big one [P1] ✅ FIXED
She and Pradeep spent **~9 minutes (10:17–19:43)** tangled on r vs the circle radius. Root cause was a
**real bug in the sim**, not their misunderstanding:
- The "r" slider was actually the **perpendicular distance d** (= circle radius), but labeled "r".
- The dB readout used that perpendicular distance, so dB was **wrong by sin²θ** when θ≠90°.
- Sliding θ moved the element but "r" never changed ⇒ physically inconsistent ⇒ the confusion.

**Fix shipped:** slider relabeled **d (⊥ wire→P = circle radius)**; the **true r = d/sinθ** is computed,
shown as a live readout, and the slant **r̂ line is now labeled "r"** and visibly lengthens as θ leaves 90°.
`B = μ₀I/2πd` (whole wire, uses d); `dB = (μ₀/4π) I dl sinθ / r²` (one element, uses true r). Verified:
θ=90 → r=d=5cm, dB=2.00µT; θ=30/150 → r=10cm, dB=0.25µT; B stays 20µT. This is her exact lesson, made
correct and visible. (She graciously said "I think it's fine" — but the 9-min struggle says otherwise; now fixed.)

## 2. She had to HAND-DRAW the derivation [P1] — biggest "don't make me draw again"
Across STATE_2→STATE_5 she wrote the **whole proportionality build-up in red on the canvas**:
`dB ∝ I` → `dB ∝ dl` → `dB ∝ sinθ` → `dB ∝ 1/r²` → combine → `dl×r̂` form (frames ~6:00 and ~8:50).
The sim shows only the *final* formula (STATE_4 overlay), not the **step-by-step proportionality chain** she
teaches. **Action:** author an on-canvas derivation ladder (Rule 24 = equations/steps ARE allowed) that
reveals the four proportionalities one at a time, then assembles them into the full law + cross-product form.
This is what stops her reaching for the pen. (Staged — implement next; good candidate to confirm vs her Excel.)

## 3. Choreography / motion she asked for [P2]
- **"Show current motion / current direction each time"** (her words, ~22:00): every state that has the wire
  should run the flowing-current dots so direction is never ambiguous. Audit per state.
- She drew the **circular B field by hand beside the sim** (red loops, ~12:20) while explaining direction →
  the circle assembling + RHR is the moment to keep crisp; consider a brief RHR curl beat co-located with it.

## 4. State-count / scope [P3]
- She explicitly said: *"there are 10 states, I don't know which are necessary — analyze each, tell me what's
  needed / not needed."* → do a per-state necessity pass (candidate merges: STATE_3 geometry + STATE_4 law;
  STATE_7 assemble + STATE_8 weighting). Bring options; don't cut unilaterally.

## 5. Process / strategy (not sim changes)
- She'll send **notes/Excel tomorrow (~2026-06-18)** — merge then.
- Wants sims for **electrostatics next** (she's currently teaching it): E-field / Gauss law (sphere, shell,
  long wire, slab), Coulomb force between two charges. "Electric field can be shown with arrows only — easy."
  → Pradeep to text her the concept list; this unlocks her using the sims in her own classes (B2B2C proof).
- B2B2C idea she floated: Pradeep builds the sim → explains the concept to *her* student using it → records →
  sends to her. Distribution flywheel.

---
### Change-list status
| # | Item | Pri | Status |
|---|---|---|---|
| 1 | STATE_10 r vs circle-radius (d) — true r=d/sinθ, fix dB, relabel, live readout, slant "r" label | P1 | ✅ done (uncommitted) |
| 2 | On-canvas proportionality derivation ladder (dB∝I→dl→sinθ→1/r²→combine→dl×r̂) | P1 | ⏳ staged |
| 3 | Current-flow dots on every wire-bearing state ("show current direction each time") | P2 | ⏳ staged |
| 4 | Per-state necessity pass (which of 10 states to keep/merge) | P3 | ⏳ staged |
| 5 | Next concepts: electrostatics (E-field/Gauss/Coulomb) | — | backlog |
