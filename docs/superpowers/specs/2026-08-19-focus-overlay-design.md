# Focus Overlay — narration-synced pointing (design spec)

**Date:** 2026-08-19 · **Status:** approved (founder, in-session) · **Branch:** `feat/focus-overlay` (Rule 40 platform work)

## Problem

When narration plays (recorded TTS today, the V2 AI professor later), students don't know WHERE
in the sim to look — busy scenes (electrons, meters, graphs, sliders) compete for attention. The
per-sentence `glow` emphasis (Rule 29 brightness) is ambient, mostly targets labels rather than
objects, never dims the chrome, and on field_3d rarely dims peers at all (`brightenOnly` is
near-universal). It emphasizes; it does not POINT.

## Decision

Build our OWN universal Focus Overlay (~200 lines, zero dependencies, zero runtime cost, fully
offline). Rejected alternatives:

- **DOM tour libraries** (driver.js MIT — the mask-technique donor; intro.js AGPL/commercial —
  banned; shepherd — license unclear, banned): all DOM-only; they cannot reach objects inside
  canvas/WebGL, and they assume static targets. Our targets move.
- **three.js OutlinePass**: field_3d renders with plain `renderer.render()` (no EffectComposer);
  adding post-processing = pipeline change + tablet perf risk + every locked baseline shifts.

Four cue modes ship in v1: **spotlight** (dim + cutout) · **ring** (halo, follows motion) ·
**pointer** (chevron) · **underline** (value/symbol box).

## Architecture

**The PLAYER owns the overlay; renderers only publish a resolver.**

- A full-stage `<svg id="focusOverlay">` sibling of the pen canvas in `#stage`
  (`build_review_site.ts`), z-5, `pointer-events:none`. Spotlight = SVG mask cutout (the
  driver.js technique, reimplemented); ring/chevron/underline = simple shapes. Cue motion uses
  wall-clock CSS keyframes only, so cues render correctly on frozen/pinned frames.
- Per-frame, while a cue is active, the player polls the same-origin iframe:
  `iframe.contentWindow.PM_FOCUS_HOST.resolve(token) → {x,y,w,h} | null` (iframe-viewport CSS
  px). Per-frame resolution is what makes a ring FOLLOW a moving object through choreography —
  the capability no library provides.
- Each renderer publishes `window.PM_FOCUS_HOST` from inside its own emitted code:
  - **field_3d:** DOM id → rect; else `resolveGlowAliases` over the `sceneObjects` registry;
    sprites get a projected 4-corner bbox, meshes a projected bounding-sphere box. Behind-camera
    or unresolved → `null`, never a guess.
  - **parametric (PCPL):** token gated against the body/surface/scene registries (the
    `PM_resolvePrimitiveCenter` scene-center fallback is explicitly suppressed — a miss is
    `null`), then canvas→viewport transform for the letterboxed 760×500 box.
  - **particle_field:** subsystem-level v1 — an explicit dictionary over the existing closed
    semantic glow keys (`ammeter_total`, `galvanometer`, `electrons`, …), family-guarded.
    Per-element ids are deferred.
- **Timing (Rule 26 intact):** activation rides `applyReveal(si)` — the state-clock sentence
  boundary that already fires glow/hand/freeze/math/caption. Works with narration muted (the
  default). No new postMessage type exists; only the coordinate lookup crosses the boundary.
- **Miss handling:** a spotlight with no cutout is the catastrophic failure, so after ~200 ms of
  consecutive nulls the cue hides entirely; the miss is recorded on `window.PM_focusMisses`
  (concept/state/sentence/token/cue) with a deduped console.warn. Polling continues — a target
  that appears mid-sentence (choreography reveal) re-shows the cue.
- **Teacher control:** a player-local "Focus cues" toggle (localStorage `pm_focus`, default ON),
  following the subtitles-toggle precedent. Deliberately NOT in the ⚙ widget panel — that panel
  is unreachable on PCPL concepts (no widgets declared → button hidden).

## Authoring surface

Optional per-sentence field in `teacher_script.tts_sentences[]`:

```json
{ "focus": { "target": "far_magnet", "cue": "ring" } }
```

- `cue` optional; player default `ring`. Backward compatible — no `focus`, no change.
- Targets are REAL built ids (field_3d `sceneObjects` userData ids / DOM overlay ids; PCPL
  `scene_composition` ids; particle_field semantic keys). Never the legacy `*_label` glow
  vocabulary — the faraday audit proved those tokens resolve to nothing.
- **Explicit-only: no implicit default from `focal_primitive_id`** (live in PCPL's emphasis
  ladder → doubled emphasis; never read by the other two renderers → dangling ids).
- Build-time fallback: a sentence with no `focus` but a legacy `highlight_primitive_id` gets
  `{target, cue:"ring"}` — the 54 existing bindings stay alive instead of a third mechanism.
- Zod: `focus` typed in `ttsSentenceSchema`; the legacy siblings (`glow`, `scenario_cue`,
  `pause_after_ms`, …) are typed permissively in the same change (they were never in the schema).

## Doctrine rulings (recorded)

- Overlay markers are chrome drawn ABOVE the sim, not element size changes → **Rule 29 stands
  unmodified**.
- **Rule 32e's one-focal budget covers glow + focus jointly** (Gate 3f#7): a sentence carrying
  both must resolve to the SAME target; exactly one cue at any instant.
- Chevron auto-places on the emptiest side of its target (Rule 34d).
- Baselines: THE EYE loads the sim page without the player shell and its message vocabulary
  excludes all narration channels → cues are structurally invisible to the gate; renderer-side
  `PM_FOCUS_HOST` renders zero pixels. **Zero baseline churn by construction.** The flip side —
  the gate cannot catch a focus regression — is accepted, mirroring glow; runtime correctness =
  `PM_focusMisses` empty + the paid vision gate's advisory I3 check.

## Prior art reconciled (Rule 40a)

Name probes (`SET_FOCUS`, `focusOverlay`, `pm_focus`, `PM_FOCUS_HOST`, …) are clean in tree and
history. Behavioral overlaps, reconciled rather than duplicated:

| Mechanism | Relationship |
|---|---|
| `glow_focus` premium primitive | Scene-authored, baseline-VISIBLE halo; stays as-is. The overlay is narration-synced, baseline-INVISIBLE chrome. Complementary layers, one focal budget. |
| `highlight_primitive_id` (54 sentences) | Absorbed as the build-time fallback → `cue:"ring"`. |
| `SET_GLOW` | The emphasis sibling; focus is the pointing sibling on the same sentence beat. |
| `reveal_primitive_id` (110 sentences, zero consumers) | The cautionary precedent: `focus` is wired end-to-end (player, ttsBindings keep-gate, retrofit-surgeon grep audit, auditor gate, architect column) BEFORE any binding is authored. |

## Rollout

Prove-then-harden: full wiring on `faraday_law_induction` (whose 18 inert `*_label` glow tokens
get re-pointed at real ids as part of the prototype — filed as a scar), founder reviews live,
then fleet policy = new concepts author focus at birth (architect control-table column (h));
existing concepts on next touch. No mass retrofit, no re-voice, no re-baseline.

## Deferred

particle_field per-element ids · the V2 voice-professor `FOCUS(target_id)` whitelist op (this
mechanism is its display path; the op is data-only per Rule 28) · fleet retrofit · absorbing
`glow_focus` · a deterministic static target-resolution validator gate · new postMessage types ·
`teacher_layouts` changes · driver.js/OutlinePass vendoring.
