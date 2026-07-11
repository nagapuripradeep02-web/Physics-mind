# Full-Screen Teaching Controls — Design Spec

**Date:** 2026-07-10
**Surface:** teacher review-site player (`src/scripts/build_review_site.ts`) + `src/lib/renderers/field_3d_renderer.ts`
**Status:** design approved (founder, 2026-07-10); ready for implementation plan

---

## 1. Problem

A teacher presenting from the review-site player hits "Full screen" and gets stranded: the current
implementation calls `stageEl2.requestFullscreen()` on `#stage` alone. The Fullscreen API only paints
the *requested element's own subtree* — so the state rail, the caption/subtitle strip, the scrubber, and
the whole footer (play/replay/mute/subtitles/language/speed/auto-advance) sit *outside* `#stage` in the
DOM and are structurally invisible once full screen starts, not just hidden by CSS. The only way to
advance a state, replay, or change speed today is to exit full screen first.

Founder report (screen recording, 2026-07-10): while presenting to a class on a projector/TV, a teacher
does not want to exit full screen just to move to the next state. Request: on-screen Next/Previous state
controls reachable *inside* full screen, a way to reveal the rest of the controls (scrubber/replay/
speed/auto-advance) on demand without permanently cluttering the screen, and a way to strip the sim down
to a bare, label-free canvas for moments where narration alone should carry the room.

## 2. Scope

**In scope:** `field_3d_renderer.ts` concepts only (the majority of shipped diamonds), full-screen
behavior in `build_review_site.ts`.

**Out of scope (fast-follow):** `particle_field_renderer.ts` (Ch.3 circuit concepts, e.g. `ohms_law`,
`combination_of_resistors`). Same postMessage contract (`SET_CLEAN_MODE`) gets ported there once this
ships and is validated on field_3d concepts — its sliders/formula/HUD elements use different, per-scenario
IDs and need their own audit.

## 3. Architecture: widen the full-screen root

Introduce a new wrapper `<div id="fsScope">` inside `#main`, containing `#stage`, `#capStrip`,
`#ctlToggle`, `#scrubbar`, and `<footer>` — everything currently in `#main` **except** `<header>`.
`fsBtn`'s click handler calls `fsScopeEl.requestFullscreen()` instead of `stageEl2.requestFullscreen()`.

Consequences, all deliberate:
- `<header>` (Viditra logo, concept title, "Teacher-Verified" pill) structurally never enters the
  fullscreen subtree — no CSS override needed, no toggle to build. Exiting full screen is the only way
  to see it again, which is fine: it's branding/status, not a control needed mid-lesson.
- The **existing** `#ctlToggle` collapse arrow, and everything it already drives (`#scrubbar` +
  `<footer>`: play/replay/mute/subtitles/language/speed/auto-advance/counter), becomes reachable in full
  screen for free — same markup, same `applyControls()` function, no new UI. Only change: force
  `controlsCollapsed = true` the instant full screen is entered (see §7), so it always opens minimal.
- `#capStrip` (the prose subtitle strip) stops needing today's reparenting hack
  (`onFsChange` currently moves `#caption` into `#stage` and re-styles it as a floating bottom bubble via
  the `#stage #caption` CSS rule, because `#capStrip` wasn't part of the fullscreen subtree). Under
  `#fsScope`, `#capStrip` is naturally part of the fullscreen layout — a thin strip below the canvas,
  same position as windowed mode. This is **more** consistent with Rule 34a (narration prose lives below
  the canvas, never overlaid) than today's behavior, and removes the reparenting code entirely.
- `#rail` (state list) and the whiteboard (`#boardCol`) stay outside `#fsScope` — unchanged from today's
  behavior (they're already invisible in full screen).

CSS follow-ups required by the retarget: `#stage:fullscreen` / `#stage:fullscreen::after` no longer match
anything (the `:fullscreen` pseudo-class only matches the actual requested element) and must become
`#fsScope:fullscreen` / `#fsScope:fullscreen #stage::after`. `#fsScope` itself needs
`flex:1 1 auto; display:flex; flex-direction:column; min-height:0;` so windowed-mode layout stays
pixel-identical to today.

## 4. Next / Previous state navigation

Two new edge-chevron buttons (`‹` left edge, `›` right edge), absolutely positioned inside `#stage`,
semi-transparent, shown **only** while `#fsScope` is the fullscreen element (`inFullscreen()` gate,
mirroring how `#fsBtn`'s label/icon already swap on `onFsChange`). A small `state N / M` readout sits
between/above them.

They call the **existing** navigation primitives, not new logic:
- `nextVisible(idx, dir)` — already skips hidden states and respects a teacher's saved reorder
  (`order`/`hiddenStates` from `LS_LAYOUT`).
- `goToState(pos, false)` — same call the state-rail cards and the existing `ArrowLeft`/`ArrowRight`
  keydown handlers already make.

Disabled/dimmed at the first/last visible state (`nextVisible` returns `-1`), matching the existing
keyboard-handler guard (`if (nR >= 0) { ... }`).

## 5. Clean / presentation mode

A new icon button next to `#fsBtn`, visible only in full screen. Independent of the `#ctlToggle` panel —
a teacher can have the bottom panel open (for speed control) *and* clean mode on (no on-canvas text) at
the same time.

Toggling it does two things:

1. **Wrapper side** (no postMessage needed): hide `#capStrip` directly (`display:none` / a CSS class).
2. **Iframe side**: post a new message type, `{ type: 'SET_CLEAN_MODE', on: boolean }`. In
   `field_3d_renderer.ts`'s existing `window.addEventListener("message", ...)` switch (same place as
   `SET_STATE`/`SET_GLOW`/`SET_MATH`/etc.), add a `case "SET_CLEAN_MODE"` that toggles a
   `document.body.classList.toggle('pm-clean', !!data.on)`. Add a CSS rule scoped to `body.pm-clean` that
   hides the iframe's own `#caption` (the on-canvas top delta-cue — Rule 32c/34a — a *different* element
   from the wrapper's `#capStrip`/`#caption`, despite the shared id, since they live in separate
   documents), `#formula_overlay`, `#sliders`, and the per-scenario HUD/readout elements (e.g.
   `#b_readout` and equivalents — enumerate the actual ids present per scenario during implementation;
   there is no single shared id today).

**What stays visible in clean mode:** the edge chevrons (§4), Move/Draw/Clear pen bar, and
Exit-full-screen — a teacher is never stranded without navigation or an exit. This was an explicit
founder choice over a "everything fades, tap anywhere to reveal" alternative — that alternative is
deliberately *not* built here (see §8).

**Persistence:** clean mode always resets to **off** on every full-screen entry — a teacher opts in each
time; it never carries over from a previous session or across concepts (founder decision, avoids a
teacher being confused by a blank canvas they forgot they'd left toggled on).

## 6. Idle auto-fade + presenter clicker

Two small, independent additions, both founder-approved as "extra refinements":

- **Idle auto-fade:** after ~3s with no mouse move / touch inside `#fsScope`, the edge chevrons, the
  Exit-full-screen button, and the pen bar fade to low opacity (not `display:none` — still clickable);
  any movement restores full opacity immediately. Implemented as a debounced timer + a CSS class
  (`.pm-idle`) with an opacity transition — orthogonal to clean mode's `display:none` approach, and the
  two can coexist (idle-fade dims whatever clean mode left visible).
- **Presenter clicker support:** most classroom wireless clickers send `PageUp`/`PageDown`, not arrow
  keys. Add both to the existing document `keydown` handler alongside `ArrowLeft`/`ArrowRight`, mapped to
  the same `nextVisible`/`goToState` calls (§4) — near-zero new logic, same guard pattern.

## 7. Panel default behavior

`controlsCollapsed` already persists today, per-concept, via `LS_WBUI` (shared between windowed and
full-screen mode, since today they're the same toggle). This spec **does not** reuse that persisted value
for full-screen entry: every time full screen starts, `controlsCollapsed` is forced to `true` regardless
of the saved windowed-mode preference, so full screen always opens minimal — "nothing more than next
states" per the founder's framing. The teacher's in-session tap on `#ctlToggle` still works exactly as
today (and still calls `saveWbUI()`, so it keeps affecting the windowed-mode default too — unchanged
behavior, just no special-cased full-screen persistence layered on top).

## 8. Explicitly not building

- **Touch swipe-left/right for state navigation** — considered and deferred. Would need careful scoping
  against the existing tap-to-pause gesture on the canvas (`#tapcue` / pause-on-tap) so a swipe doesn't
  get misread as a tap or vice versa; not worth the ambiguity for a first pass when edge chevrons already
  give touch displays a large, unambiguous target.
- **One-time first-run hint tooltip** — considered and deferred. Nice-to-have discoverability aid (same
  pattern as the existing `#tapcue` hint), but not essential to ship the core behavior; can be added later
  without touching this design.
- **"Everything fades, tap-to-reveal" clean mode** — rejected in favor of "nav/exit always stay visible"
  (§5). Founder chose predictability (never stranded) over maximum bare-canvas purity.
- **particle_field_renderer.ts support** — see §2, fast-follow.

## 9. Verification plan

No test suite exists for this surface (per `CLAUDE.md` §6) — verification is manual, in a real full-screen
session:
1. `npm run build:review -- <a field_3d concept>` and serve it; enter full screen.
2. Confirm header is never visible; confirm `#ctlToggle` opens/closes the exact same panel as windowed
   mode (scrubber, play/replay/mute/subtitles/language/speed/auto-advance/counter all present and
   functional).
3. Click the edge chevrons through every state, including a teacher-reordered/hidden layout
   (`LS_LAYOUT`) — confirm they skip hidden states identically to the arrow keys and state-rail cards.
4. Toggle clean mode: confirm caption/formula/HUD/sliders disappear inside the iframe, `#capStrip`
   disappears in the wrapper, and chevrons/pen bar/Exit remain clickable.
5. Sit idle 3s+: confirm chrome fades and restores on mouse move; confirm this does not fight clean mode
   (both hidden = still fine; clean-mode-visible elements should still fade/restore).
6. Test `PageUp`/`PageDown` alongside `ArrowLeft`/`ArrowRight`.
7. Confirm `simSurface.resize()` still fires correctly when `#ctlToggle` is toggled while in full screen
   (existing `applyControls()`/`onFsChange()` resize calls must keep the pen-annotation canvas aligned to
   `#stage` as its height changes).
8. Exit full screen; confirm windowed mode is visually unchanged from before this change (header back,
   rail back, `#capStrip` back in its normal position, no leftover `pm-clean`/idle classes).
