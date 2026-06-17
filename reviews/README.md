# Reviews — expert reviewer feedback archive

This is PhysicsMind's **reviewer data engine**. Every professional reviewer (physics / math /
chemistry teachers) who reviews a simulation gets their feedback captured here, per simulation,
forever. Video calls, screen recordings, and Excel/written notes are all stored in one place and
merged into a single master change-list per (reviewer × simulation). As we add more reviewers, the
data accumulates — this is the dataset that eventually trains the backend AI professor.

## The ground-truth inversion (read this first)

**The teacher's method is the ground truth; the simulation adapts to them — never the reverse.** A
reviewer explains the concept in *their own* style, derivation, and order, on their own whiteboard, and
opens the sim to whatever state they want to *show* the student what's happening. The sim is a visual
aid they point at, **not a script they teach from.** If a reviewer ends up teaching "according to the
sim," the review has failed. We never ask a teacher to change how they teach — we watch how they teach
and change the sim to fit it. (CLAUDE.md Rule 24/25d; DISCUSSIONS.md Sessions 69 + 71.)

## Reviewer fleet (built over ~3–4 months — now: 1, Asmi Singh)

Two reviewer roles produce different data:

| Role | Count | What they do | Deliverable |
|---|---|---|---|
| **Deep reviewer** | 2 (Asmi is #1) | Teach a student *with* the sim → record · **plus** a per-state audit | recording **+** Excel/notes (per state: present / missing / correct / wrong) **+** a **recommended state flow** |
| **Usage tutor** | 3 | Just use the sim in their normal teaching, their own method | class recording only (no Excel) |

5 total. We mine all 5 recordings + the 2 Excels for patterns → update sims. The deep reviewer's
**recommended state flow** becomes the JSON's canonical default order (Rule 25d).

## TTS-review policy

- **The simulation is ALWAYS the primary review** (visual correctness, state by state).
- **Deep reviewers** give the `teacher_script` a *separate, optional, secondary* correctness pass —
  explicitly labeled *"audit this for physical correctness; this is our future AI voice, you will NOT
  teach from it."* Keep it a **distinct checkbox** in the Excel so it never bleeds into "is the sim
  right?" and never tempts teaching-from-script. (The script is worth auditing because it's the B2C
  voice seed — CLAUDE.md Rule 24d.)
- **Usage tutors ignore TTS entirely** — they mute (default) and teach.

## Layout (convention — every reviewer follows the same shape)

```
reviews/reviewers/<reviewer-slug>/
  PROFILE.md                         # who they are, subjects, role, contact
  <concept_id>/
    feedback.md                      # MASTER merged change-list for this sim (the actionable doc)
    sources/                         # raw inputs, stored verbatim, never edited
      YYYY-MM-DD_video_partN_transcript.md
      YYYY-MM-DD_<reviewer>_excel_notes.xlsx
      YYYY-MM-DD_<reviewer>_screen_recording_notes.md
```

- `<reviewer-slug>` = kebab-case name, e.g. `asmi-singh`.
- `<concept_id>` = the simulation's concept_id from `src/data/concepts/`, e.g.
  `magnetic_force_moving_charge`. This keeps reviews joined to the actual sim.
- **`feedback.md` is the single source of truth** for that sim's requested changes. It merges every
  source (video + Excel + recording). Each change has a stable ID, priority, status, and a `source:`
  tag so we know whether it came from the call, the Excel, or both.
- **`sources/` is raw and immutable** — transcripts and the reviewer's own files go here untouched, so
  we always have the original record behind every merged change.

## Index

| Reviewer | Subjects | Simulation | Status | Master doc |
|---|---|---|---|---|
| [Asmi Singh](reviewers/asmi-singh/PROFILE.md) | Physics | `magnetic_force_moving_charge` | 🟢 video + notes merged · ready to implement | [feedback.md](reviewers/asmi-singh/magnetic_force_moving_charge/feedback.md) |

_Status legend: 🟡 in review · 🟢 changes implemented · ⚪ awaiting reviewer · ✅ reviewer re-approved._

## How a review cycle runs

1. Reviewer reviews a sim (solo) and/or on a call → we record video + they fill an Excel.
2. We drop the raw transcript(s) and their Excel into that sim's `sources/`.
3. We merge everything into `feedback.md` (the master change-list).
4. We implement the changes, mark items done, redeploy the review link.
5. Reviewer re-reviews → suggests a smaller second pass → repeat until ✅ approved.

## Promotion filter — turning one reviewer's feedback into rules for ALL sims

This archive is not just a per-sim to-do list; it is how the **rulebook compounds**. After each
reviewer pass, sort every item into one of four buckets — only the last graduates to `CLAUDE.md`:

| Bucket | Test | Home |
|---|---|---|
| **This-sim** | specific to one simulation's content | `feedback.md` only |
| **Visual-gate check** | a general quality bar best caught by looking | `CLAUDE_TEST.md` / quality-auditor checklist |
| **Candidate pattern** | general-shaped but single-reviewer taste, not yet corroborated | this README's candidate list (below) |
| **Promote-now** | **generalizes to all sims** AND **forget → build wrong** AND **corroborated** (a 2nd reviewer hit it independently, OR it's grounded in existing doctrine) | new numbered **CLAUDE.md rule** (founder approval required) |

A **candidate pattern graduates** to a CLAUDE.md rule when a *second* reviewer independently hits the
same wall, OR it turns out to be grounded in existing doctrine. **Guard against overfitting to one
reviewer** (Session 68): promote where multiple tutors hit the same wall (signal); log idiosyncratic
one-off taste as noise.

**Promoted so far:** Asmi Singh's first review (2026-06-15) → **CLAUDE.md Rule 24** (sim is the
teacher's silent visual; no on-canvas prose; TTS off but author the script) + **Rule 25** (pedagogical
sequencing is a correctness requirement). Both also grounded in the Session 69 doctrine. Session 71
(2026-06-17, grounded in doctrine) → **Rule 25d** (authored order vs runtime reorder — states are a
reorderable vertical rail; visual must be self-contained) + **Rule 26** (playback runs on the state's
own clock; mute = audio off / clock runs; tap-pause/resume freeze/continue both).

**Candidate patterns (awaiting a 2nd reviewer):**
- _TTS narration pacing too fast_ — Asmi, 2026-06-15. (TTS is off-by-default for teachers now, so low
  urgency; becomes a pacing rule if a 2nd reviewer confirms.)
- _Break a dense state into 2–3 sub-states for clarity_ — Asmi's offer, not yet a repeated pattern.
