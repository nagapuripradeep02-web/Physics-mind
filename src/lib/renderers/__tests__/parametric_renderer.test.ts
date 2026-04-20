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
