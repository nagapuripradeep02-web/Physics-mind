# founder-proxy — Checkpoint A (design gate) — `ac_voltage_capacitor` (Ch.7 #3, **cycle 1**)

> **Provenance note (added at Checkpoint C, 2026-07-23).** This report was returned by the founder-proxy
> dispatch but the loop session did not persist it to disk at the time — a process miss caught by
> founder-proxy's own Checkpoint C audit (finding C3). Persisted here by the LOOP SESSION from its
> retained dispatch result, so that concept 3's design-gate reasoning exists in the handover record
> alongside concepts 1 and 2. Content is unedited; only this note was added.
>
> **Attribution (founder-proxy, Checkpoint C re-verify).** founder-proxy independently re-derived and
> confirmed the CORRECTNESS of every physics claim and every line-specific claim in this report, but
> **cannot attest to verbatim identity** across dispatches — its context does not persist between
> dispatches, so it has no memory of the Checkpoint-A dispatch itself. The loop session, which holds the
> retained dispatch result, is the party vouching for fidelity. Recorded so the file does not imply
> founder-proxy certified something it structurally cannot.

## VERDICT: **DESIGN_OK**

Proceed to physics_author. Both cycle-0 blocking findings (F1 glyph-compose fallacy, F1b store-lobe 2×
error) are genuinely fixed, not repackaged. The fix stayed within the four named spots; one cosmetic-only
vestige rides along as a P3 note that misleads no downstream agent. Everything graded DESIGN_OK-grade at
cycle 0 is untouched.

### (a) Does the compose routine actually solve F1? — YES, real two-draw composition

`§0b req 7` (line 63) and `§10b GLYPH FLAG` (line 196) now specify a genuine composition, not another
pass through the B2 auto-width helper:
- draw base letter (X or v) at **full size**,
- **measure** the base glyph width (`ctx.measureText`),
- draw "C" at **reduced size on a lowered baseline, x-advanced by the measured width**,
- both raster paths (`ctx.fillText` graph text + `createLabelSprite` sprite text), and a `<sub>`/CSS span
  on the DOM/HUD path.

This produces a subscript **by construction** rather than by codepoint — exactly the thing the B2 helper
cannot do (it re-fits an existing glyph). The spec explicitly states this ("the B2 auto-width helper only
re-fits… it cannot compose one"). The underlying claim is also factually correct: verified that Unicode
carries no subscript "c" in any block (U+2090–209C: a e h k l m n o p s t x; the i/j/r/u/v subscripts live
in Phonetic Extensions — the architect's cross-block set "a e h i j k l m n o p r s t u v x" is the
complete Latin-subscript-capable set, and c is genuinely absent). F1 is resolved.

### (b) Is the source-string convention unambiguous? — YES

The pinned convention (line 63, restated line 196) is buildable as-is: json_author/physics_author author
the plain ASCII token `X_C` / `v_C` (capital C, underscore, exact casing) in `formula_text` and HUD source
strings; the engine detects the `_C` suffix, renders the styled subscript, and **must never emit the
literal underscore or side-by-side `XC`**. The delimiter is the underscore, so `1/(ωC)` (no underscore)
will not false-trigger — ω·C renders correctly side-by-side. Stated identically in both the §0b spec and
the §10b flag; the symbol table (lines 188, 190) cross-references it via "styled-small-C — see glyph
FLAG." No ambiguity for the engine dispatch to build against.

### (c) Store-lobe arithmetic — integral redone independently: CORRECT

p(t) = (vₘiₘ/2)·sin(2ωt); store lobe is 2ωt ∈ (0, π), i.e. t ∈ (0, π/(2ω)):

∫₀^{π/(2ω)} (vₘiₘ/2) sin(2ωt) dt = (vₘiₘ/2)·[−cos(2ωt)/(2ω)]₀^{π/(2ω)}
= (vₘiₘ/2)·(1/(2ω))·(1−cos π) = (vₘiₘ/2)·(1/(2ω))·2 = **vₘiₘ/(2ω)**.

The patched line 91 writes `vₘiₘ/(4ω)·(1−cos π) = vₘiₘ/(2ω) = 20/π`. The coefficient in front of the
(1−cos π) bracket is now **vₘiₘ/(4ω)** — exactly the |antiderivative coefficient| — and ×(1−cos π)=×2
gives vₘiₘ/(2ω). This matches the independent derivation. The old
`vₘiₘ/(2ω)·(1−cos π)` (= vₘiₘ/ω, 2× too large) is gone.

Numbers check at defaults (vₘ=10, iₘ=2, ω=π/2): vₘiₘ/(2ω) = 20/π ≈ 6.37 J = ½Cvₘ² = ½·(0.4/π)·100 = 20/π ✓
(store-lobe area = max stored energy, physically correct). The clean-defaults check on line 91 also
verifies: at defaults p(t) = 10·sin(πt) W, and ∫₀^{1 s} 10 sin(πt) dt = (10/π)·(1−cos π) = 20/π ≈ 6.37 J ✓
— and t∈(0,1 s) is exactly one quarter cycle (T/4 with T=4 s). F1b is resolved.

### (d) Did the fix stay scoped to the four spots? — YES, with one immaterial vestige

Grep confirms the corrected coefficient appears **only** at line 91 — no other line carried the old 2×
form, so the F1b fix is fully contained (line 41 "∫p dt = ½Cvₘ²", line 242 "½Cvₘ² = 6.37 J" and line 290
are statement/reference forms, all correct; every store-lobe mention resolves to 6.37 J = 20/π). All four
claimed patches are present and internally consistent (§0a line 22, §0b req 7 line 63, §10b line 196, §2
line 91). No collateral drift in physics numbers, state arc, archetypes, misconception pivots, anchors,
or DoD.

**P3 (note, non-blocking — the only residue):** `Escalation FLAG 8` to quality_auditor (line 265) still
reads "verify the styled-small-C `X_C`/`v_C` **fallback** across all THREE text paths (… **B2 class** …)."
This was not one of the four patched spots and was not harmonized alongside §0a. It is loose but **not
contradictory**: "fallback" here names the correct *outcome* (a styled small C where no glyph exists), it
does **not** direct anyone to use the broken B2 auto-width helper as the *mechanism* — so it cannot
re-introduce F1. The binding spec quality_auditor and physics_author build against is §0b req 7 + §10b
(both correct and complete), which line 265 cross-references. A cycle-2 DESIGN_FIX to swap one word
"fallback → compose routine" on an FYI escalation line would spend budget on wording that changes no build
output; per the PRIME DIRECTIVE this affects neither the sim's physics nor its teaching value. Left as a
note for physics_author/quality_auditor: **treat §0b req 7 / §10b as the glyph contract; read line 265 as
shorthand, not spec.**

### Verdict rationale

Zero unresolved blocking findings. F1 replaced by a real composition routine with an unambiguous,
buildable source-string contract; F1b arithmetic independently re-derived and confirmed correct in both
symbolic and numeric forms; the fix is scoped and drift-free save one cosmetic vestige that misleads no
one. This is the highest-value design achievable within loop authority for this concept.
**DESIGN_OK** — physics_author may start.

No scar candidates and no engine_queue entries from this checkpoint (no built sim, no observed defect; the
compose routine is the concept's own already-scoped `ac_capacitor` engine delta per §0b/FLAG 1, which runs
via CHAPTER_LOOP §3b when json_author's build needs it — not a founder-proxy-routed finding).

Reviewed file: `docs/loop_runs/ch7/ac_voltage_capacitor/skeleton.md` (patched spots: lines 22, 63, 91,
196; P3 vestige: line 265).
