import { describe, it, expect } from 'vitest';
import { PARAMETRIC_RENDERER_CODE } from '../parametric_renderer';

// String-presence tests — drawer functions live inside a template literal
// that runs in an iframe, so we can't import them as functions. These tests
// protect the dispatchers and helpers from being trimmed or renamed.

describe('PARAMETRIC_RENDERER_CODE — primitive drawer presence', () => {
  it('defines drawVector with ox/oy offset params', () => {
    expect(PARAMETRIC_RENDERER_CODE).toContain('function drawVector(spec, ox, oy)');
  });

  it('defines drawMotionPath with ox/oy offset params', () => {
    expect(PARAMETRIC_RENDERER_CODE).toContain('function drawMotionPath(spec, ox, oy)');
  });

  it('defines drawComparisonPanel', () => {
    expect(PARAMETRIC_RENDERER_CODE).toContain('function drawComparisonPanel(spec)');
  });

  it('defines PM_drawSubScene for nested primitive dispatch', () => {
    expect(PARAMETRIC_RENDERER_CODE).toContain('function PM_drawSubScene(prims, ox, oy)');
  });
});

describe('PARAMETRIC_RENDERER_CODE — Pass 3 dispatch wiring', () => {
  it('dispatches vector in Pass 3', () => {
    expect(PARAMETRIC_RENDERER_CODE).toContain("lPrim.type === 'vector') drawVector(lPrim)");
  });

  it('dispatches motion_path in Pass 3', () => {
    expect(PARAMETRIC_RENDERER_CODE).toContain("lPrim.type === 'motion_path') drawMotionPath(lPrim)");
  });

  it('dispatches comparison_panel in Pass 3', () => {
    expect(PARAMETRIC_RENDERER_CODE).toContain("lPrim.type === 'comparison_panel') drawComparisonPanel(lPrim)");
  });
});

describe('PARAMETRIC_RENDERER_CODE — graceful fallbacks', () => {
  it('comparison_panel falls back to placeholder for 2x2_grid and 3_column layouts', () => {
    expect(PARAMETRIC_RENDERER_CODE).toContain("spec.layout === '2x2_grid'");
    expect(PARAMETRIC_RENDERER_CODE).toContain("spec.layout === '3_column'");
    expect(PARAMETRIC_RENDERER_CODE).toContain('layout "');
  });
});

// bug_class: force_arrow_translate_no_op (peter_parker:renderer_primitives, 2026-07-24).
// drawForceArrow previously never read spec.animation at all, so a "carry a
// vector parallel to itself" beat (rigid translate, length/direction frozen)
// was unbuildable in PCPL. Guards the additive fix: drawForceArrow now reads
// animation.type === 'translate' and offsets ONLY the resolved origin (x1/y1)
// — never the force-vector-derived shaft (dx/dy) — so magnitude/direction
// stay visibly frozen while the arrow slides. Mirrors drawBody's translate
// easing/delay/duration/clamp conventions (one timing vocabulary).
describe('PARAMETRIC_RENDERER_CODE — force_arrow translate (2026-07-24)', () => {
  it('drawForceArrow reads spec.animation.type === "translate" and computes an eased offset', () => {
    expect(PARAMETRIC_RENDERER_CODE).toContain("spec.animation && spec.animation.type === 'translate'");
    expect(PARAMETRIC_RENDERER_CODE).toContain('arrowAnimDx');
    expect(PARAMETRIC_RENDERER_CODE).toContain('arrowAnimDy');
  });

  it('offsets ONLY the origin (x1/y1) — the shaft (dx/dy) stays derived from force.vector alone', () => {
    // x1/y1 pick up the translate offset...
    expect(PARAMETRIC_RENDERER_CODE).toContain('var x1 = origin.x + arrowAnimDx, y1 = origin.y + arrowAnimDy;');
    // ...while dx/dy (the shaft driving length + heading) reference only
    // force.vector/scale/gate.alpha — arrowAnimDx/Dy never appear in that line.
    expect(PARAMETRIC_RENDERER_CODE).toContain('var dx = force.vector.x * scale * gate.alpha;');
    expect(PARAMETRIC_RENDERER_CODE).toContain('var dy = -force.vector.y * scale * gate.alpha;');
  });
});

// bug_class: pcpl_angle_arc_no_focal_glow_channel (peter_parker:renderer_primitives,
// 2026-07-24). PM_focalEmphasis was consumed by exactly four drawers
// (drawLabel, drawAnnotation, drawForceArrow, drawFormulaBox) — a state whose
// focal_primitive_id named an angle_arc/body/locus_trace dimmed every peer to
// 0.6 but the focal itself never brightened/glowed, because those three
// drawers never asked. Guards the additive fix: all three now fetch
// PM_focalEmphasis, multiply alphaMul into their existing alpha/stroke-alpha
// channel, and set+reset drawingContext.shadowBlur/shadowColor around their
// draw calls when glowPx > 0 (mirrors the four existing call sites exactly;
// geometry never changes — Rule 29 is brightness only).
describe('PARAMETRIC_RENDERER_CODE — angle_arc/body/locus_trace focal-glow channel (2026-07-24)', () => {
  it('drawAngleArc consumes PM_focalEmphasis and resets shadowBlur after drawing', () => {
    expect(PARAMETRIC_RENDERER_CODE).toContain('function drawAngleArc(spec)');
    const fnStart = PARAMETRIC_RENDERER_CODE.indexOf('function drawAngleArc(spec)');
    const fnBody = PARAMETRIC_RENDERER_CODE.slice(fnStart, PARAMETRIC_RENDERER_CODE.indexOf('\nfunction ', fnStart + 1));
    expect(fnBody).toContain('var emph = PM_focalEmphasis(spec);');
    expect(fnBody).toContain('220 * emph.alphaMul');
    expect(fnBody).toContain('drawingContext.shadowBlur = emph.glowPx;');
    // set then reset — reset must appear, and after the set, in source order.
    const setIdx = fnBody.indexOf('drawingContext.shadowBlur = emph.glowPx;');
    const resetIdx = fnBody.indexOf('drawingContext.shadowBlur = 0;');
    expect(resetIdx).toBeGreaterThan(setIdx);
  });

  it('drawBody consumes PM_focalEmphasis and resets shadowBlur after drawing', () => {
    expect(PARAMETRIC_RENDERER_CODE).toContain('function drawBody(spec)');
    const fnStart = PARAMETRIC_RENDERER_CODE.indexOf('function drawBody(spec)');
    const fnBody = PARAMETRIC_RENDERER_CODE.slice(fnStart, PARAMETRIC_RENDERER_CODE.indexOf('\nfunction ', fnStart + 1));
    expect(fnBody).toContain('var emph = PM_focalEmphasis(spec);');
    expect(fnBody).toContain('animOpacityMultiplier * emph.alphaMul');
    expect(fnBody).toContain('drawingContext.shadowBlur = emph.glowPx;');
    const setIdx = fnBody.indexOf('drawingContext.shadowBlur = emph.glowPx;');
    const resetIdx = fnBody.indexOf('drawingContext.shadowBlur = 0;');
    expect(resetIdx).toBeGreaterThan(setIdx);
  });

  it('drawLocusTrace consumes PM_focalEmphasis and resets shadowBlur after drawing', () => {
    expect(PARAMETRIC_RENDERER_CODE).toContain('function drawLocusTrace(spec)');
    const fnStart = PARAMETRIC_RENDERER_CODE.indexOf('function drawLocusTrace(spec)');
    const fnBody = PARAMETRIC_RENDERER_CODE.slice(fnStart, PARAMETRIC_RENDERER_CODE.indexOf('\nfunction ', fnStart + 1));
    expect(fnBody).toContain('var emph = PM_focalEmphasis(spec);');
    expect(fnBody).toContain('gate.alpha * alphaMul * emph.alphaMul');
    expect(fnBody).toContain('drawingContext.shadowBlur = emph.glowPx;');
    const setIdx = fnBody.indexOf('drawingContext.shadowBlur = emph.glowPx;');
    const resetIdx = fnBody.indexOf('drawingContext.shadowBlur = 0;');
    expect(resetIdx).toBeGreaterThan(setIdx);
  });
});
