# newton_third_law — REBUILD brief (founder diagnosis 2026-07-29)

> Read this FIRST, then `docs/loop_runs/push_off_report.md` (in full), `docs/NLB_PUSH_OFF_SPEC.md`,
> and `docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md` §6.
> This is a **re-author of an existing SEALED concept**. `concept_id` stays `newton_third_law`.
> All 4 existing registration sites stay — this REPLACES the states, it is not a new concept.
> The old baselines under `visual_baselines/newton_third_law/` are for the OLD arc and will be
> replaced by `visual:approve` at the end. The v1 artifacts are archived in `v1_old_arc/`.

## 1. Why v1 failed (founder, 2026-07-29)

v1 was two 300 kg blocks with 30 N arrows and `action_reaction: engaged`. Two problems, the second
fatal:

1. **The motion is invisible.** 30 N on 300 kg is a = 0.1 m/s²; the blocks barely move.
2. **THE INTERACTION IS NEVER ON SCREEN.** Newton's third law is a statement about ONE interaction
   between TWO bodies. v1 drew two separate blocks with arrows that appear from nowhere. Nothing
   touches. A student sees "two blocks with labels", not "these two push each other". We *asserted*
   the pair instead of *showing* it.

**Bigger arrows cannot fix that. The CAUSE must be a visible object.** That object is the spring.

## 2. The 5-state arc (founder-approved — do not renegotiate the arc)

| # | Setup | The beat it must land |
|---|---|---|
| 1 | equal carts, compressed spring released | one push, two motions, **the same instant**. `glow_focal` on the spring: point at the cause. |
| 2 | same `force_N`, masses 1:3 | the two force ARROWS STAY IDENTICAL while the accelerations go 3:1. **This single image is the whole lesson.** Kills *"the heavier one pushes harder"*. |
| 3 | cart pushes a `fixed: true` WALL | same equal-and-opposite pair, the wall does not move, because the other body is the Earth. Kills *"if nothing moves there was no force"*. |
| 4 | isolate each cart's free body | the pair lives on **DIFFERENT bodies**, which is why they do not cancel. Kills *"equal and opposite means they cancel"*. |
| 5 | sandbox (`interaction_complete`) | mass-ratio + force sliders. |

## 3. Engine facts that constrain the design — verified against the renderer at HEAD (248abea)

These are read directly out of `field_3d_renderer.ts`. Treat them as ground truth; do not re-derive
by guessing, and do NOT request a renderer change to work around them without escalating first.

### 3.1 Scene scale and geometry
| Constant | Value | Meaning |
|---|---|---|
| `NLB_WORLD_PER_M` | 0.5 | world units per physical metre |
| `NLB_BODY_SIZE` | 0.55 world = **1.1 m** | cart cube, MASS-INDEPENDENT (Rule 29). Half-width **0.55 m** |
| wall slab thickness | 0.275 world → half-width **0.275 m** along the track |
| spring natural | 0.80 world = **1.6 m** | apparatus constant, NOT authorable |
| spring compressed | 0.36 world = **0.72 m** | apparatus constant, NOT authorable |
| `surface.length_m` | default 6 | **visible HALF-length in metres** — authorable. Default frames ±6 m |

### 3.2 The arrow length law — this is what bit `newton_second_law`
`len = clamp(0.55, 2.80, N × 0.048)` world units.
- **Floor:** any force below **11.5 N** collapses to an identical 0.55 stub. Keep the smallest
  on-screen force **≥ 15 N**. Two different forces both under 11.5 N render *the same length* — that
  destroys any ratio the state is trying to teach.
- **Ceiling:** any force above **58.3 N** clamps to 2.80 and stops growing. **A 6 kg body's weight is
  58.8 N and is already clamped.** So if a state shows `weight` arrows, keep m ≤ ~5.5 kg, or don't
  show weight in that state.

### 3.3 `push_off` — the contact-then-release force phase
```ts
push_off?: { body_a_id, body_b_id, force_N, release_at_ms?, contact_from_ms? }
```
- The engine writes `bA.F_applied = +F; bB.F_applied = −F` from ONE expression every frame. The
  equality is unrepresentable-if-broken. Never author two force numbers.
- At `t >= release_at_ms` BOTH applied forces go to 0 and the carts coast (μ = 0). That coast is
  what sells the simultaneity — the *result* of the interaction persists long after it ends.
- `release_at_ms` **defaults to 0**, and 0 means *never in contact*. A push-off state MUST author it.
- **`push_off` is INERT in a `mode: 'sandbox'` state.** STATE_5 therefore cannot use it — a sandbox
  that wants the equal-and-opposite guarantee authors **`action_reaction`**, whose mirror still runs
  there.
- **Do NOT put `'F'` in `controls_visible` on a guided `push_off` state** — the gate rewrites
  `F_applied` every tick, so a trusted drag is silently discarded (thumb moves, canvas does not).
  `'F'` in the STATE_5 sandbox is fine and expected.

### 3.4 The spring — the NON-OPTIONAL authoring contract
```ts
spring?: { between: [idA, idB], compressed?, coils? }
```
Three authored numbers must agree with the apparatus:

1. **Position.** `|s_a − s_b| = 0.72 + half-width(A) + half-width(B)`.
   Cart↔cart → **1.82 m** (e.g. `+0.91` / `−0.91`). Cart↔wall → **1.545 m**.
   Author it wider and the spring floats without touching either face.
2. **Order.** `body_a` gets `+force_N` along **+s**, so **`body_a_id` must be the body on the
   POSITIVE side**. Reversed, the pair drives *together* instead of apart.
3. **Timing.** `release_at_ms = 1000 · sqrt( 1.76 / (force_N · (1/m_a + 1/m_b)) )`, **dropping the
   `1/m` term of a `fixed` body.** Author longer than this and the coil vanishes while the arrows
   still draw. (1.76 = 2 × the 0.88 m of spring extension.)
- The spring **hides** once the gap exceeds natural length — a spring that has let go cannot push.
- `glow_focal: "nlb_spring"` reaches it. It is apparatus → **brighten-only**, it can never dim.

### 3.5 `fixed: true` — the wall / Earth
- Never integrates (a = 0, v = 0, s pinned) but **takes AND exerts forces**, and its arrows draw at
  **full magnitude and full brightness** — the wall's arrow is pixel-identical to the cart's, which
  is the entire point of STATE_3.
- Renders as a wall slab, not a cart. Never an m/F slider target, never draggable.
- Read at **build** time from the body's first appearance across all states — **an id must not flip
  `fixed` between states.** If STATE_3 needs a wall, give it its own body id used nowhere else.

### 3.6 `ghost: true` — READ THIS BEFORE DESIGNING STATE_4
A `ghost` body is **skipped entirely by `nlbDriveArrowsForBody` — it carries NO arrows** (renderer
line ~30051: `if (!spec || b.ghost) { nlbHideBodyArrows(b.id); return; }`), and is forced into the
dim-peer branch regardless of `glow_focal`. It is decorative FBD *context* only.

**Therefore STATE_4 cannot show each cart's force via ghost bodies.** The founder prompt's
"(ghost bodies)" is aspirational shorthand, not an engine instruction. The engine spec's own §6 row
for this concept states the beat correctly: *"the whole 'why don't they cancel' beat IS two separate
free bodies."* Build STATE_4 from **two REAL bodies**, visibly separated, each carrying its own half
of the pair. **This is NOT an engine gap** — do not park on it.

### 3.7 Lane / camera — the prior rule is INVERTED for push-off states, read carefully
`nlbBodyLaneZ` has two guards at the top: **`push_off` states put every body in lane z = 0, and a
state containing a `fixed` body is lane 0 too** — they are head-on, sharing one lane, separated
along the track axis `s`. So:
- The 2026-07-25 lesson *"elevation must exceed ~40°, use 55°, to open the z lane"* **does not apply
  to the push_off / wall states** — there is no z lane to open in them. Separation is along `s` and
  reads best from a **near side-on** camera.
- It **does** still apply to any state with two independent bodies and no `push_off` and no `fixed`
  (i.e. potentially STATE_4 and STATE_5) — those bodies get the 0.85-world z lane offset against a
  0.55 body. Keep their `s` positions well apart so the z offset is never load-bearing for legibility.
- **Never open a lane with a lateral camera x offset on this concept.** Any nonzero camera x breaks
  mirror symmetry about x = 0 and magnifies the body moving toward the camera — on STATE_1, whose
  entire payload is *symmetry*, that produced a false ~28% asymmetry last time. Use elevation (y),
  and keep the camera centred on s = 0.
- Rule 32d: keep the camera close to identical across all five states (same apparatus, home pose).

### 3.8 Reveal pin
`deriveStateMeta` pins a `push_off` state's reveal at **`release_at_ms + 2000`**, so THE EYE's H2
frozen baseline is captured **2 s after release**. Both bodies must still be on screen, and the
state's payload must be legible, **at that instant**. Design the framing for it.

## 4. Verified reference numbers — a consistent set that satisfies every constraint above

`physics-author` owns these and may revise them, but must re-verify §3.2 (arrow floor/ceiling),
§3.4 (position / order / timing), and §3.8 (on screen at release+2000) for any change.

Handy closed forms (μ = 0, flat, spring extension 0.88 m):
- equal masses m: `t_release = sqrt(0.88·m/F)`, `v_release = sqrt(0.88·F/m)`
- masses m and 3m: `t_release = sqrt(1.32·m/F)`, `v_a = sqrt(1.32·F/m)`, `v_b = v_a/3`
- cart m vs `fixed` wall: `t_release = sqrt(1.76·m/F)`, `v = sqrt(1.76·F/m)`

**Hold `force_N = 30 N` constant across STATE_1 → STATE_2** (Rule 32b: only the taught variable —
the mass ratio — may change). 30 N → arrow 1.44 world, well clear of both clamps.

| State | masses | force_N | `s_a` / `s_b` | `release_at_ms` | a | v at release | position at release+2000 |
|---|---|---|---|---|---|---|---|
| 1 | 6 + 6 kg | 30 | +0.91 / −0.91 | **420** | 5.00 / 5.00 | 2.10 / 2.10 | ±5.55 m (symmetric) |
| 2 | 4 + 12 kg | 30 | +0.91 / −0.91 | **420** | 7.50 / 2.50 | 3.15 / 1.05 | +7.87 / −3.23 m |
| 3 | 6 kg cart + wall | 30 | cart +0.7725 / wall −0.7725 | **593** | 5.00 / 0 | 2.97 / 0 | +7.59 m / wall unmoved |

Why this set is worth keeping:
- **STATE_1 and STATE_2 share `release_at_ms = 420`** — not a coincidence, the reduced mass is 3 kg
  in both (6·6/12 = 4·12/16 = 3). The two states are therefore directly comparable frame-for-frame,
  which is exactly what the "arrows identical, accelerations 3:1" image needs.
- STATE_2's distances travelled from the start line at the pin are **6.96 m vs 2.32 m — exactly
  3:1** while both applied arrows are the same 1.44-world length. That IS the lesson, in pixels.
- STATE_3's 6 kg cart matches STATE_1's cart (Rule 32d continuity) and leaves at 2.97 m/s rather
  than 2.10 — correct, because all 0.88 m of spring extension now goes into one body.
- **Set `surface.length_m` to 10** (visible half-length) — the default 6 would run STATE_2's light
  cart off the end of the track before the reveal pin.
- STATE_2's 12 kg body: **do not show its `weight` arrow** (117.6 N clamps at the 2.80 ceiling, as
  does 6 kg's 58.8 N). These states' payload is the horizontal applied pair; leave the vertical
  forces off and keep the canvas uncluttered (Rule 34).

## 5. Authoring rules that are NOT optional

- Smallest on-screen force **≥ 15 N** (§3.2).
- Carts of a **few kg** with **tens of newtons**. Do NOT reuse the 300 kg / 30 N numbers.
- Obey the spring position / order / timing contract (§3.4) exactly.
- No `'F'` in `controls_visible` on a guided `push_off` state (§3.3).
- **Rule 31:** 25–55 EN words of narration per state; ONE idea + ONE complete motion per state; a
  DECLARED distinct motion archetype + one-line delta per state, no archetype repeat except a
  declared contrast pair (STATE_1/STATE_2 are the natural contrast pair); explore last.
- **Rule 32:** cause moves first, only the taught variable moves, ≤5-word delta-cue caption,
  home-pose continuity, exactly ONE glow focal at a time.
- **Rule 34:** ≤5-word delta cue on canvas, prose narration in the strip below; one formula surface;
  value-only HUD; overlays never collide.
- **Rule 35:** universal, culture-neutral anchor. No country-specific place, festival, food,
  currency, brand or name. (Ice skaters pushing apart, a rowboat and a jetty, a rocket and its
  exhaust, a swimmer pushing off a pool wall — all fine and all universal.)
- Rule 15: ≥2 distinct `advance_mode`s; never `wait_for_answer`, never `pause_after_ms`.
- Rule 19: every state has ≥3 primitives.
- Rule 30i: English-only. Author `text_en`. Do not author `text_te`. `text_hi` optional, never voiced.
- Plain English. No Hinglish.

## 6. Scope fence

- `concept_id` stays `newton_third_law`. The 4 existing registration sites stay as they are — check
  them, do not duplicate them. `PCPL_CONCEPTS` is NOT touched (this is field_3d, not PCPL).
- **If the concept appears to need a renderer change, STOP.** Write
  `docs/loop_runs/lom/newton_third_law/engine_gap.md` naming exactly what config knob is missing,
  and escalate. Do not extend the engine. (§3.6 is the one that will tempt you — it is not a gap.)
- Never run: any `tts:*`, `build:pilot`, `deploy:*`, the paid `smoke:visual-validator`. Never edit
  `PILOT_CONCEPTS`. Never write rows to `engine_bug_queue`. Never merge to master.
