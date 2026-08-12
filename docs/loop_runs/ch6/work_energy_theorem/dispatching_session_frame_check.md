# Dispatching-session frame check — `work_energy_theorem`, 2026-08-07

I read two frozen frames myself rather than relying on the eye-walker report alone, because the
finding lands on the PRIMARY aha state. **eye-walker's central claim is CONFIRMED**, and I found two
things it did not report.

Frames read: `.visual_runs/work_energy_theorem/20260807-172646/STATE_1__frozen.png` and
`STATE_3__frozen.png`.

---

## CONFIRMED — the narration asserts terminal values the frozen pin does not show

**STATE_1** (PRIMARY aha). Frozen frame renders `K = 14.8 J`, `net = 14.8 J`, HUD `v = 2.43 m/s`.
Narration strip reads: *"…the net-work bar and the K bar climb together, both landing on exactly 40.0 J"*.

The physics is CORRECT — `K = ½·5·2.43² = 14.76 ≈ 14.8 J`. K reaches 40.0 J at `v = 4 m/s`, later in
the loop. So this is a **pin-timing / narration-scope** mismatch, not a physics error.

**STATE_3.** Frozen frame renders `pull = 58.8 J`, `friction = −58.8 J`, `net = 0.0 J`, `K = 15.6 J`,
with the displacement arrow labelled `d = 3.00 m`. Narration reads: *"…the pull bar climbs to +98.0 J
and the friction bar dives to −98.0 J…"*.

Again the physics is CORRECT — `19.6 N × 3.00 m = 58.8 J` exactly. `98.0 J` requires `d = 5.00 m`.

**What STATE_3 DOES show correctly, and it matters:** `net` is parked on `0.0 J` at mid-height while
`K = 15.6 J` holds constant. That is the state's actual teaching claim and it reads perfectly in the
still. Only the two specific ±98.0 numerals are unshown.

---

## NOT in the eye-walker report — 1: the two bars read one number but draw at DIFFERENT heights

This is the more serious of my two additions, because it lands on the atomic claim.

In STATE_1 both bars read `14.8 J`. But:
- **`K` is a 0-based bar** (0 … `bar_max_J` 55), so 14.8 J fills ~25% from the bottom.
- **`net` is a SIGNED bar** with zero at mid-height (−55 … +55 on `work_scale_J`), so 14.8 J draws a
  short block starting at the middle.

So the same number renders at two visibly different heights and positions. The narration says the two
bars *"climb together"* — **visually they do not.** The on-canvas delta cue is literally
*"Two bars, one number"*.

This is a **declared** consequence, not a surprise: founder_proxy's cycle-2 report states *"within a
state the work bars and the K bar are DIFFERENT instruments — the equality W_net = ΔK is always read
from the NUMERALS"*, and it forbade any cross-state comparison of bar HEIGHT. But the narration was
then authored to describe a **height** behaviour ("climb together") that the instruments cannot show.
The rule was written down and then contradicted by the prose one layer later.

Checkpoint B should decide whether the fix is narration-side (describe the numerals, not the climb) or
instrument-side.

## NOT in the eye-walker report — 2: canvas composition

Both frames are dominated by empty black space. The apparatus (cart + slab) occupies roughly the
middle third; the entire right half of a 1280-wide frame holds only a small HUD block and one formula
line. The `F` arrow label is tiny and dim, and in STATE_3 the `f_k` label is small and dark against
the slab edge.

Rule 34's intent is that the canvas is dominated by the moving physical picture. This reads sparse.
Flagging for founder eyes — it is a taste call, not a gate failure, and it is consistent across both
states so it is an apparatus-scale decision rather than a per-state slip.

## CONFIRMED — friction arrow contrast (eye-walker's watch item)

Real. In STATE_3 the kinetic-friction arrow renders **dark maroon** pointing left while the pull arrow
beside it is **bright green**. Against the grey slab the friction arrow is markedly the dimmer of the
two. Not pixel-measured here. Given this chapter's history (a 1.07:1 force vector shipped on concept
#3), this deserves a measured contrast ratio before approval, not a visual pass.

---

## What I did NOT do

No files were patched from this check. The findings are handed to Checkpoint B for adjudication and
owner routing, together with the eye-walker and quality-auditor reports.
