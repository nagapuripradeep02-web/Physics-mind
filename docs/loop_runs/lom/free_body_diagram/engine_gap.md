# Engine gap notes — `newtons_laws_body`, found while authoring `free_body_diagram`

> **The concept is NOT parked.** Both gaps below were resolved inside the frozen config surface, at a
> cost in teaching quality that the founder should see. Recorded per `docs/CHAPTER_LOOP.md` §3 so the
> next concept in the chapter does not rediscover them, and so the founder can decide whether either
> is worth a one-time engine amendment before `connected_bodies` and `block_on_incline` are authored.
> Discovered 2026-07-25, branch `feat/lom-a`, engine as of commit `04aa6fa`.

---

## GAP 1 (MAJOR) — there is no monotonic parameter-reveal path for a GUIDED state

**What was wanted.** `free_body_diagram` STATE_5 teaches "N is not a fixed partner of mg": tilt the ramp
0° → 30° and let the student watch the `N` readout fall 19.60 → 16.97 N while the `mg` arrow stays
vertical and its components split. That falling number IS the misconception counter (Rule 16a), and a
visible tilt is the state's declared motion archetype (Rule 31) and its cause-before-effect beat (Rule 32a).

**What the engine offers.** `theta_deg` can only be changed by:
1. a **trusted slider** event (`nlbEmit`, `field_3d_renderer.ts` ~line 30474) — a teacher action, not a
   guided reveal; and
2. **`idle_auto_sweep`** — a **4000 ms triangle** (spec §1 line 81, phase0 §6). Over a ~10 s guided state
   that is ~2.5 up-down cycles. Measured in the cycle-0 EYE frames as
   θ = 23° → 22° → 7° → 22° → 8° → 22° → 8°, with the frozen baseline landing at 14°.

`phases[]` (spec §1 line 82) looks like the right tool but is **not** — it only toggles `glow_focal` /
`phase_action`; it never drives a physics parameter. No other reveal key exists, and adding one would
require a `deriveStateMeta` / `F3D_REVEAL_KEYS` registration (phase0 §4 item 3), i.e. a renderer edit —
forbidden by the loop protocol.

**Consequence / what shipped.** STATE_5 is a **static `theta_deg: 30`** incline. The physics is truthful and
the number is exact (`N = mg·cos 30° = 16.97 N`), and the caption, formula note, narration and
`misconception_watch.visual_counter` were all rewritten so nothing promises a tilt the student never sees.
But the state now teaches by static comparison rather than by watching N fall, which is the weaker beat,
and it is the one guided state in the concept with no motion of its own.

**Minimal fix if the founder wants it.** One authored, monotonic parameter ramp for a guided state — e.g.
`param_ramp?: { param: 'F'|'theta'|'m'; from: number; to: number }` driven off the existing state clock,
plus its `F3D_REVEAL_KEYS` entry. This is NOT `idle_auto_sweep` with a flag; the triangle's round trip is
the problem. **Relevant beyond this concept:** `block_on_incline` almost certainly wants the same ramp
(tilt until the block breaks away at `tan θ = μₛ` is that concept's central beat), so this gap is likely
to recur one concept later.

---

## GAP 2 (MINOR, closed) — `hanging: true` without a `pulley` silently renders nothing

**What happened.** STATE_6 was authored as a lone body hanging from an anchor to teach `T = mg` — the
string-support counterpart to STATE_2's `N = mg`. At runtime the tension arrow never rendered in any
frame, `T` stayed 0.00 N, no anchor or cable appeared, and the body floated off-centre.

**Why it is not a bug.** Spec §1 line 50 defines `hanging?: boolean` as "**hangs vertically off the
pulley**". Tension is produced by the coupled Branch B integrator; an uncoupled lone hanging body has no
string in the model, so `T = 0` is the engine behaving exactly as specified. Phase 0 §6 had already
flagged it: "`hanging: true` with no `pulley` block ... is physically odd — recommend the concept contract
forbid it." The architect designed a state the engine never promised.

**Consequence / what shipped.** STATE_6 was **deleted**; the concept is 6 states and tension belongs to
`connected_bodies` (next in this chapter), which exercises the pulley/rope path properly. The concept's
atomic claim — isolate a body, replace each interaction with one labeled arrow — survives intact; the
arrow vocabulary it covers is now weight / normal / friction / applied / net, without tension.

**Recommendation.** Make it loud rather than silent: either have the engine warn/refuse on
`hanging: true` with no `pulley`, or state the prohibition in the spec's §1 comment (not only in the
phase0 report, which an authoring agent is not guaranteed to read). A config that renders a body with no
support, no arrow and a zero readout — while every deterministic gate passes — is the failure mode THE
EYE exists to catch, and it cost one full fix cycle here.

---

---

## GAP 3 (MAJOR) — **FIXED during this concept**, commit `cd8fe67`: `RESET_TRAJECTORY` was a no-op

Recorded here because it is the most reusable lesson of the run, and because it was originally
mis-triaged (by me) as a config problem and cost a whole content fix cycle before being routed correctly.

`newtons_laws_body` is the **only** field_3d scenario that genuinely integrates — `b.s`, `b.v` and
`eng.t_ms` are accumulators seeded only by `SET_STATE`. Every other scenario poses from a closed form of
`(time − stateStartTime)`, so the shared `RESET_TRAJECTORY` handler getting away with just
`stateStartTime = time` had always been sufficient. For an integrating scenario that rebase is a **silent
no-op**: the body kept the reveal pin's travel, started the dense series ~6 m downrange, and eventually
hit the track bound. **This was a production defect, not a test artifact** — `rollTimeline()` sends
`RESET_TRAJECTORY` on every state entry and replay, so a teacher replaying a state got a body that never
returned home.

The symptom presented as "the body halts", which looks exactly like a too-short track — and authoring a
longer `surface.length_m` did move the halt later, which made the wrong diagnosis look confirmed. It can
never remove it, because the defect was a stale clock. **Prevention rule (now a scar candidate):** any
scenario that integrates must implement `RESET_TRAJECTORY` explicitly, store its seeds beside the live
values, have initial-condition sliders write the seed, and prove the rewind by driving THE EYE's real
message order (`RESET → pin → RESET → dense → RESET → frozen`) — not a single fresh `SET_STATE` run,
which passes even when the reset is fully broken. `connected_bodies` and `block_on_incline` inherit the
fix and need no work.

---

## Note on gate coverage (no action requested)

Every defect found in this concept — the two gaps above, the stale-clock halt, and the coasting body
running off the 6 m default track — passed **31/31 deterministic checks** and a full quality-auditor
gate 0–20 **PASS** at cycle 0. All of them were caught only by eye-walker reading the frames. At cycle 0
the auditor also reported `T = 19.60 N` for the hanging body: correct as worksheet arithmetic, flatly
contradicted by the runtime, and the auditor agreed on re-audit. The reverse also happened once —
eye-walker quoted a precise instant for the halt (`t6000–7000`) that a runtime probe disproved, though the
defect it flagged was real.

Two conclusions worth carrying into the rest of the chapter: keep eye-walker mandatory and parallel, since
it caught every real defect here; and when a visual finding and a worksheet disagree, **probe the runtime
rather than reasoning from either** — both reviewers were confidently wrong about a detail at least once,
and only execution settled it.
