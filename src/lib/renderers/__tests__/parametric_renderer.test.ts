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
