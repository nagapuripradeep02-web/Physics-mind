# resistivity — macro/micro split-canvas redesign (2026-07-08)

## Problem (founder review of the shipped `resistivity` sim)

The whole simulation lives *inside* the rod — lattice ions + drifting electrons. When the
taught variable changes (L longer, A wider, material, T higher), the microscopic view barely
changes in a legible way: electron density and drift speed shift subtly, but the student never
sees the **physical thing that is actually changing** — the rod getting longer, fatter, or hot.
The concept `R = ρL/A` is *macroscopic*; its mechanism (`ρ = m/(ne²τ)`) is *microscopic*. The sim
only showed the mechanism, so the cause was invisible.

## Decision — Approach A: split canvas, one engine, one clock

Divide the single `particle_field` canvas into two horizontal bands:

- **Macro band (top ~38%)** — the rod as a physical object: battery → rod → ammeter with a
  deflecting needle. The rod's on-screen **length** tracks `curL()`, **thickness** tracks
  `curA()`, **fill tint** tracks `currentMaterial().tint`, **heat shimmer** tracks
  `curTemperature()`. A zoom-lens link (circle on the rod + dashed lines) points down to the
  micro band, stating "the bottom view is inside this spot."
- **Micro band (bottom ~62%)** — the existing lattice + electrons + field arrows + drift arrow,
  unchanged, just built into the lower region.

Rejected alternatives: **B (two-panel `renderer_pair`)** — separate iframes/clocks make
cause-first cross-band choreography and single-focal glow impossible, and each level gets half
the pixels. **C (interleaved macro-only / micro-only states)** — violates home-pose continuity
(Rule 32d) and never shows cause + mechanism at the same instant.

## Why this is cheap and safe

The engine's adapter layer is already fully variable-driven (`curL()`, `curA()`,
`currentMaterial()`, `curTemperature()` — added the prior session). The macro band is **purely
additive display code reading the same live values** — no physics change, no state-arc change.

- **Zero re-voice:** narration `text_en/hi/te` is untouched; only per-sentence `glow` focal keys
  change, and glow bindings don't affect TTS audio hashes.
- **No-op for siblings:** gated behind an authored `macro_view: true` flag. `drift_velocity` and
  `ohms_law` (flag absent) render byte-identically. Guaranteed by a `microRegion` indirection
  that returns the full canvas when the flag is off.
- **Main-session engine delta** (same precedent as the L/material/T work), not a
  `renderer_primitives` FAIL-route (which is reserved for auditor-routed bugs).

## Engine mechanics

- Helpers `mvOn()`, `macroBandH()` (`= floor(height*0.38)` when on, else `0`), `microTop()`
  (`= macroBandH()`), `microH()` (`= height - macroBandH()`).
- Micro scene is **built** into `microH()` (particle y-bounds, lattice `spacingY`, field-arrow y,
  particle y-wrap all use `microH()` instead of `height`), and **drawn** inside a single
  `push(); translate(0, microTop()); … ; pop()` wrapper — so no per-primitive offset math.
- New `drawMacroBand()` renders battery + wires + rod (length←L, thickness←A, tint←material,
  shimmer←T) + ammeter needle (deflection ← live current `iAm`) + zoom-lens link.
- Two new glow-focal keys wired as `dimFor()` call-sites: `macro_rod`, `ammeter`. Rod size
  changing is legal under Rule 29 (real physical magnitude, like `tauThrob`).
- Global overlays (thermometer, R/ρ readouts, formula caption) stay in canvas-global space at the
  bottom — unaffected by the micro translate.

## Choreography (glow retune, resistivity JSON)

Cause-first reading order (32a) comes from glow sequencing, not artificial lag (the physics is
genuinely simultaneous). Per state: the **cause sentence** focuses the macro band
(`macro_rod`/`ammeter`), the **mechanism sentence** focuses the micro band
(`electrons`/`lattice`/`drift_arrow`). Exactly one focal at any instant (32e) preserved.

## Proposed doctrine — Rule 33 (macro↔micro dual-level legibility)

> **[A] When a concept's taught variable is macroscopic but its mechanism is microscopic, the sim
> shows BOTH levels simultaneously with an explicit zoom-link; the taught variable's change must
> be visible at the level where it physically happens.** A macroscopic cause (rod longer/wider/
> hotter, plates farther, wire moved) is shown as a physical object that visibly changes; the
> microscopic mechanism is shown as the linked interior. Never show only the interior when the
> cause is a macroscopic manipulation. Enforced by: the architect skeleton declares, per state,
> which level the taught variable lives at; quality_auditor checks that a macroscopic taught
> variable renders a visible macroscopic change. `particle_field` implements this via
> `macro_view: true` (split canvas). Reference: `resistivity`.

CLAUDE.md §7 gets the one-line index entry; full body lives here + CLAUDE_RULES.md — **added only
on founder approval.**

## Model pin (same session, founder-approved)

`quality_auditor` dispatch model → `claude-opus-4-8` (was `claude-sonnet-5`). Rationale: the final
adversarial pre-founder gate reasons across skeleton + physics + JSON + THE EYE + eye_walker
findings + routing, and it never edits files (zero blast radius) — the highest-ROI single Opus
slot. All other fleet roles stay on their current pins (architect Fable-5, everyone else Sonnet-5,
shipper Haiku). physics_author stays Sonnet with a documented "override to Opus on hard chapters
(EMI/AC/optics/rotation)" dispatch convention rather than a standing pin.

## Verification

tsc 0 → `validate:concepts` PASS → reseed `_seed_resistivity_cache.ts` → `visual:eyes` →
eye_walker ∥ quality_auditor (auditor on Opus) → founder review at `localhost:8080/resistivity/` →
`visual:approve` re-locks the 7 baselines (macro band now present).
