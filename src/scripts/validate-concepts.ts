/**
 * Validates all concept JSONs in src/data/concepts/ against v2 schema.
 *
 * Classifies each file into one of:
 *   - atomic_v2     — single concept, v2 shape (renderer_pair + direct state shape)
 *   - legacy_bundled — multi-concept bundle (renderer_hint + nested physics_layer/pedagogy_layer).
 *                     Needs splitting, not backfilling. Skipped, listed in summary.
 *   - legacy_array   — root is an array (very old format). Skipped.
 *
 * Only atomic_v2 files are validated against the Zod schema. Exit 1 if any
 * atomic file fails or if any file is unclassifiable. Legacy files do NOT
 * fail the build — they're a splitting backlog, tracked separately in
 * docs/archive/LEGACY_SPLIT_BACKLOG.md.
 *
 * Usage: npx tsx src/scripts/validate-concepts.ts
 */

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { validateConceptJson } from '../schemas/conceptJson';
import { validatePCPLSubSimStates } from '../lib/pcplPhysicsValidator';
import { resolveRendererType } from './lib/rendererLookup';
import {
  checkConceptChoreography,
  type ChoreoWarning,
  animateInDeadConfigWarnings,
  renderScopeCollisionWarnings,
} from './lib/conceptGates';
import {
  ANIMATION_TYPES,
  ANIMATE_IN_KINDS,
} from '../lib/renderers/animation_vocabulary';
import {
  buildDefaultVars,
  declaredDerivedFields,
  extractIdentifiers,
  classifyIdentifier,
} from '../lib/validators/formulaScope';

const CONCEPTS_DIR = path.resolve(__dirname, '../data/concepts');

// Matches createCanvas(760, 500) in src/lib/renderers/parametric_renderer.ts.
// Keep in sync if the renderer canvas ever changes.
const CANVAS_W = 760;
const CANVAS_H = 500;

type Tier = 'atomic_v2' | 'legacy_bundled' | 'legacy_array' | 'unknown';

type BoundsWarning = { path: string; message: string };

type Bbox = { minX: number; minY: number; maxX: number; maxY: number };

function isNum(v: unknown): v is number {
  return typeof v === 'number' && isFinite(v);
}

/**
 * Compute a static bounding box for a primitive, or null if its position
 * depends on symbolic anchors ("block_center"), authoring hints we don't
 * resolve here (text sizing, slider zones), or is malformed.
 *
 * Only handles primitives whose bbox is fully determined by literal numeric
 * fields in the JSON. Symbolic anchors like from: "mango_center" resolve at
 * runtime and can't be checked here — skip those silently.
 */
function primitiveBbox(p: unknown): Bbox | null {
  if (!p || typeof p !== 'object') return null;
  const prim = p as Record<string, unknown>;
  const type = prim.type;
  const pos = prim.position as { x?: unknown; y?: unknown } | undefined;

  if (type === 'body') {
    if (!pos || !isNum(pos.x) || !isNum(pos.y)) return null;
    const shape = prim.shape;
    const size = prim.size;
    if (shape === 'circle' && isNum(size)) {
      const r = size / 2;
      return { minX: pos.x - r, minY: pos.y - r, maxX: pos.x + r, maxY: pos.y + r };
    }
    if (shape === 'rect' && size && typeof size === 'object') {
      const s = size as { w?: unknown; h?: unknown };
      if (isNum(s.w) && isNum(s.h)) {
        return {
          minX: pos.x - s.w / 2, minY: pos.y - s.h / 2,
          maxX: pos.x + s.w / 2, maxY: pos.y + s.h / 2,
        };
      }
    }
    return null;
  }

  if (type === 'vector') {
    const from = prim.from as { x?: unknown; y?: unknown } | undefined;
    const to = prim.to as { x?: unknown; y?: unknown } | undefined;
    if (!from || !to || !isNum(from.x) || !isNum(from.y) || !isNum(to.x) || !isNum(to.y)) return null;
    return {
      minX: Math.min(from.x, to.x), minY: Math.min(from.y, to.y),
      maxX: Math.max(from.x, to.x), maxY: Math.max(from.y, to.y),
    };
  }

  return null;
}

function checkStateBounds(stateId: string, state: unknown, pathPrefix: string): BoundsWarning[] {
  if (!state || typeof state !== 'object') return [];
  const scene = (state as { scene_composition?: unknown }).scene_composition;
  if (!Array.isArray(scene)) return [];
  const warnings: BoundsWarning[] = [];
  for (const prim of scene) {
    const bbox = primitiveBbox(prim);
    if (!bbox) continue;
    const over: string[] = [];
    if (bbox.minX < 0) over.push(`left by ${(-bbox.minX).toFixed(0)}px`);
    if (bbox.minY < 0) over.push(`top by ${(-bbox.minY).toFixed(0)}px`);
    if (bbox.maxX > CANVAS_W) over.push(`right by ${(bbox.maxX - CANVAS_W).toFixed(0)}px`);
    if (bbox.maxY > CANVAS_H) over.push(`bottom by ${(bbox.maxY - CANVAS_H).toFixed(0)}px`);
    if (over.length === 0) continue;
    const id = (prim as { id?: unknown }).id ?? '(no id)';
    const type = (prim as { type?: unknown }).type ?? 'unknown';
    warnings.push({
      path: `${pathPrefix}.${stateId}`,
      message: `primitive ${type}#${id} bbox exceeds canvas [${CANVAS_W}x${CANVAS_H}]: ${over.join(', ')}`,
    });
  }
  return warnings;
}

function checkConceptBounds(data: unknown): BoundsWarning[] {
  if (!data || typeof data !== 'object') return [];
  const obj = data as Record<string, unknown>;
  const warnings: BoundsWarning[] = [];

  const epicL = obj.epic_l_path as { states?: Record<string, unknown> } | undefined;
  if (epicL?.states && typeof epicL.states === 'object') {
    for (const [stateId, state] of Object.entries(epicL.states)) {
      warnings.push(...checkStateBounds(stateId, state, 'epic_l_path.states'));
    }
  }

  const branches = obj.epic_c_branches;
  if (Array.isArray(branches)) {
    branches.forEach((branch, i) => {
      const b = branch as { states?: Record<string, unknown> } | undefined;
      if (b?.states && typeof b.states === 'object') {
        for (const [stateId, state] of Object.entries(b.states)) {
          warnings.push(...checkStateBounds(stateId, state, `epic_c_branches[${i}].states`));
        }
      }
    });
  }

  return warnings;
}

// ─────────────────────────────────────────────────────────────────────────────
// Overlap check (session 54). Mirrors src/scripts/check-layout-overlap.mjs.
// Computes bboxes for force_arrow / annotation / formula_box / label
// primitives (which carry text labels that escape the body-bbox check) and
// reports rect-rect overlaps within the same state. Filters out the common
// "intentional junction overlap" pattern (force_arrows sharing an origin
// point) so the warning list only surfaces real visual collisions.
//
// TEMPORAL-WINDOW + formula_box `equation` field (founder_proxy Checkpoint B
// cycle 3, 2026-08-09; engine_bug_queue:
// pcpl_layout_overlap_checker_measures_data_space_labels_against_pixel_space_
// boxes_and_ignores_temporal_disjointness). This copy DOES NOT get the
// plane_id/position_expr fix check-layout-overlap.mjs received — this file's
// scan of `src/data/concepts/*.json` is FLAT/non-recursive by design (the
// isolation contract, see validate-mathematics.ts's own header) and never
// reaches `src/data/concepts/mathematics/*.json`, the ONLY namespace that
// authors plane_id + position_expr on label/annotation primitives (verified:
// 0 instances anywhere under the flat physics namespace) — so that class
// cannot occur here. But the OTHER two causes ARE subject-neutral and DO fire
// on flat physics concepts today: `scalar_vs_vector.json` STATE_3 warned
// `formula_box#reading_3 <-> formula_box#reading_7` and
// `annotation#ghost_card <-> annotation#verdict_line` — both pairs are a
// crossfade HANDOFF (one's disappear_at_ms equals the other's appear_at_ms),
// never simultaneously on screen. Same fix, same tolerance, as the .mjs
// sibling.
// ─────────────────────────────────────────────────────────────────────────────
type LabelBbox = {
  id: string; type: string; x0: number; y0: number; x1: number; y1: number;
  tail?: { x: number; y: number }; window: { start: number; end: number };
};

// engine_bug_queue: pcpl_layout_overlap_checker_measures_data_space_labels_
// against_pixel_space_boxes_and_ignores_temporal_disjointness (cause c) — see
// the SAME constant + rationale in check-layout-overlap.mjs's header comment.
const TEMPORAL_OVERLAP_TOLERANCE_MS = 1000 / 60;
function activeWindow(p: Record<string, unknown>): { start: number; end: number } {
  const start = isNum(p.appear_at_ms) ? p.appear_at_ms : 0;
  const end = isNum(p.disappear_at_ms) ? p.disappear_at_ms : Infinity;
  return { start, end };
}
function windowsOverlap(a: { start: number; end: number }, b: { start: number; end: number }): boolean {
  const start = Math.max(a.start, b.start);
  const end = Math.min(a.end, b.end);
  return (end - start) > TEMPORAL_OVERLAP_TOLERANCE_MS;
}

const CHAR_W = 7;
const LINE_H = 17;
const PAD_X = 16;
const PAD_Y = 12;

function annotationBbox(p: Record<string, unknown>): LabelBbox | null {
  const pos = p.position as { x?: unknown; y?: unknown } | undefined;
  if (!pos || !isNum(pos.x) || !isNum(pos.y)) return null;
  // formula_box authors its text under `equation`, never `text`/`text_expr`
  // (verified: 76/76 formula_box primitives on the fleet use `equation`,
  // ZERO use `text`/`text_expr`) — reading only the first two measured every
  // formula_box as a near-empty box regardless of its real equation string,
  // silently UNDER-measuring (a missed true collision).
  const txt = String(p.text ?? p.text_expr ?? p.equation ?? '');
  const lines = txt.split('\n');
  const maxLen = lines.reduce((m, l) => Math.max(m, l.length), 0);
  const w = Math.max(60, maxLen * CHAR_W + PAD_X);
  const h = lines.length * LINE_H + PAD_Y;
  return {
    id: String(p.id ?? '(no id)'),
    type: String(p.type ?? 'annotation'),
    x0: pos.x - w / 2, y0: pos.y - h / 2,
    x1: pos.x + w / 2, y1: pos.y + h / 2,
    window: activeWindow(p),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Body position map — a force_arrow authored with origin_body_id/body_id (the
// current PCPL convention; every modern concept uses this, not literal `from`)
// has no static from.x/from.y to read. Prescan the state's own scene_composition
// for type:'body' primitives (bodies are re-registered fresh per state by the
// renderer's PM_bodyRegistry, so this map must be built per-state, not
// concept-wide) and resolve arrows against it, mirroring PM_resolveForceOrigin
// (parametric_renderer.ts ~2413-2471).
// ─────────────────────────────────────────────────────────────────────────────
type BodyInfo = { cx: number; cy: number; w: number; h: number; rotationDeg: number };

function buildBodyMap(scene: unknown[]): Map<string, BodyInfo> {
  const map = new Map<string, BodyInfo>();
  for (const prim of scene) {
    if (!prim || typeof prim !== 'object') continue;
    const p = prim as Record<string, unknown>;
    if (p.type !== 'body' || typeof p.id !== 'string') continue;
    const pos = p.position as { x?: unknown; y?: unknown } | undefined;
    if (!pos || !isNum(pos.x) || !isNum(pos.y)) continue;

    // Mirrors drawBody()'s bw/bh resolution per shape (parametric_renderer.ts
    // ~949-961). Unknown/unhandled shapes fall back to the renderer's own
    // 60x60 default.
    const shape = p.shape;
    const size = p.size;
    let w = 60, h = 60;
    if (shape === 'circle' && isNum(size)) { w = size; h = size; }
    else if (shape === 'pulley' && isNum(size)) { w = size; h = size; }
    else if (shape === 'stickman' && isNum(size)) { w = size * 0.5; h = size; }
    else if ((shape === 'rect' || shape === 'tree' || shape === 'door') && size && typeof size === 'object') {
      const s = size as { w?: unknown; h?: unknown };
      if (isNum(s.w) && isNum(s.h)) { w = s.w; h = s.h; }
    }

    // Mirrors drawBody()'s center resolution (~1020-1025): rect/tree/door are
    // top-left anchored (position → center = position + half-extent);
    // circle/stickman/pulley are already center-anchored. Approximation only
    // (not pixel-perfect) — good enough for an overlap-warning bbox.
    const isBoxed = shape === 'rect' || shape === 'tree' || shape === 'door';
    const cx = isBoxed ? pos.x + w / 2 : pos.x;
    const cy = isBoxed ? pos.y + h / 2 : pos.y;
    const rotationDeg = isNum(p.rotation_deg) ? p.rotation_deg : 0;
    map.set(p.id, { cx, cy, w, h, rotationDeg });
  }
  return map;
}

/**
 * Mirrors PM_resolveForceOrigin's body-anchor resolution (parametric_renderer.ts
 * ~2442-2470): pick the anchor keyword (origin_anchor, falling back to
 * draw_from, default 'body_center'), offset by the body's half-extent, rotate
 * by the body's rotation_deg. Deliberately does NOT replicate the renderer's
 * "no body found → fall back to the first registered body" quirk — that's an
 * arbitrary render-order artifact, not a real resolution, so an unmatched
 * body id here falls through to literal `from` / skip instead (see arrowBbox).
 * Also does not parse legacy compound-string `from` (e.g. "block_top_center")
 * — out of this fix's scope; those already resolve to null as before.
 */
function resolveBodyAnchoredOrigin(
  p: Record<string, unknown>,
  bodies: Map<string, BodyInfo>,
): { x: number; y: number } | null {
  const bodyId = p.origin_body_id ?? p.body_id;
  if (typeof bodyId !== 'string') return null;
  const b = bodies.get(bodyId);
  if (!b) return null;

  const drawFrom = (typeof p.origin_anchor === 'string' && p.origin_anchor)
    || (typeof p.draw_from === 'string' && p.draw_from)
    || 'body_center';
  let dx = 0, dy = 0;
  if (drawFrom === 'body_bottom') dy = b.h / 2;
  else if (drawFrom === 'body_top') dy = -b.h / 2;
  else if (drawFrom === 'body_left') dx = -b.w / 2;
  else if (drawFrom === 'body_right') dx = b.w / 2;
  // else body_center (or unrecognized) → (0, 0)

  if (b.rotationDeg) {
    const r = (b.rotationDeg * Math.PI) / 180;
    const rx = dx * Math.cos(r) - dy * Math.sin(r);
    const ry = dx * Math.sin(r) + dy * Math.cos(r);
    dx = rx; dy = ry;
  }
  return { x: b.cx + dx, y: b.cy + dy };
}

function literalArrowFrom(p: Record<string, unknown>): { x: number; y: number } | null {
  const from = p.from as { x?: unknown; y?: unknown } | undefined;
  if (from && isNum(from.x) && isNum(from.y)) return { x: from.x, y: from.y };
  return null;
}

function arrowBbox(p: Record<string, unknown>, bodies: Map<string, BodyInfo>): LabelBbox | null {
  // Resolution precedence (matches the renderer's post-WP-R4 fallback order):
  // authored body id wins, then a literal `from: {x,y}` object, then skip.
  const from = resolveBodyAnchoredOrigin(p, bodies) ?? literalArrowFrom(p);
  if (!from) return null;
  const dirDeg = isNum(p.direction_deg) ? p.direction_deg : 0;
  const mag = isNum(p.magnitude) ? p.magnitude : 1;
  const scale = isNum(p.scale_pixels_per_unit) ? p.scale_pixels_per_unit : 5;
  const rad = (dirDeg * Math.PI) / 180;
  const dx = Math.cos(rad) * mag * scale;
  const dy = -Math.sin(rad) * mag * scale; // physics-y-up flip in renderer
  const x1 = from.x + dx, y1 = from.y + dy;
  const labelStr = String(p.label ?? '');
  const labelW = labelStr.length * CHAR_W + 8;
  const labelH = 14;
  return {
    id: String(p.id ?? '(no id)'),
    type: 'force_arrow',
    x0: Math.min(from.x, x1) - 4,
    y0: Math.min(from.y, y1) - 4,
    x1: Math.max(from.x, x1) + Math.max(labelW, 4),
    y1: Math.max(from.y, y1) + labelH,
    tail: { x: from.x, y: from.y },
    window: activeWindow(p),
  };
}

function rectsOverlap(a: LabelBbox, b: LabelBbox): boolean {
  return !(a.x1 < b.x0 || b.x1 < a.x0 || a.y1 < b.y0 || b.y1 < a.y0);
}

function checkStateOverlaps(stateId: string, state: unknown, pathPrefix: string): BoundsWarning[] {
  if (!state || typeof state !== 'object') return [];
  const scene = (state as { scene_composition?: unknown }).scene_composition;
  if (!Array.isArray(scene)) return [];
  const bodies = buildBodyMap(scene);
  const boxes: LabelBbox[] = [];
  for (const prim of scene) {
    if (!prim || typeof prim !== 'object') continue;
    const p = prim as Record<string, unknown>;
    const t = p.type;
    if (t === 'force_arrow') {
      const b = arrowBbox(p, bodies); if (b) boxes.push(b);
    } else if (t === 'annotation' || t === 'formula_box' || t === 'label') {
      const b = annotationBbox(p); if (b) { b.type = String(t); boxes.push(b); }
    }
  }
  const warnings: BoundsWarning[] = [];
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      if (!rectsOverlap(a, b)) continue;
      // Filter intentional junction-style overlap: two force_arrows whose
      // tails are within 4 px of each other (shared origin, e.g. wires
      // converging at a junction or pressure pushing every wall).
      if (a.tail && b.tail) {
        const dx = a.tail.x - b.tail.x;
        const dy = a.tail.y - b.tail.y;
        if (Math.hypot(dx, dy) < 4) continue;
      }
      // Temporally disjoint (cause c, see header comment): the two never
      // share the screen for more than one rendered frame, so a spatial
      // overlap between them is not a real collision — it is two different
      // pictures being compared as if they were one.
      if (!windowsOverlap(a.window, b.window)) continue;
      warnings.push({
        path: `${pathPrefix}.${stateId}`,
        message: `OVERLAP ${a.type}#${a.id} <-> ${b.type}#${b.id} (label/arrow visual collision)`,
      });
    }
  }
  return warnings;
}

function checkConceptOverlaps(data: unknown): BoundsWarning[] {
  if (!data || typeof data !== 'object') return [];
  const obj = data as Record<string, unknown>;
  const warnings: BoundsWarning[] = [];

  const epicL = obj.epic_l_path as { states?: Record<string, unknown> } | undefined;
  if (epicL?.states && typeof epicL.states === 'object') {
    for (const [stateId, state] of Object.entries(epicL.states)) {
      warnings.push(...checkStateOverlaps(stateId, state, 'epic_l_path.states'));
    }
  }

  const branches = obj.epic_c_branches;
  if (Array.isArray(branches)) {
    branches.forEach((branch, i) => {
      const b = branch as { states?: Record<string, unknown> } | undefined;
      if (b?.states && typeof b.states === 'object') {
        for (const [stateId, state] of Object.entries(b.states)) {
          warnings.push(...checkStateOverlaps(stateId, state, `epic_c_branches[${i}].states`));
        }
      }
    });
  }

  return warnings;
}

// ─────────────────────────────────────────────────────────────────────────────
// Gate 3 — Physics validator (E42) on every authored EPIC-L + EPIC-C state.
// Mirrors the deep-dive route's call site, but feeds default_variables from
// physics_engine_config so direction-deg checks resolve theta etc. CRITICAL
// violations bubble up as gate failures; WARNINGs render as `WARN` lines.
// ─────────────────────────────────────────────────────────────────────────────

interface PhysicsViolationOut {
  path: string;
  message: string;
  severity: 'CRITICAL' | 'WARNING';
}

function runPhysicsOnStates(
  states: Record<string, unknown>,
  pathPrefix: string,
  defaultVars: Record<string, number>,
): PhysicsViolationOut[] {
  const subStates: Record<string, { scene_composition?: unknown[] }> = {};
  for (const [stateId, state] of Object.entries(states)) {
    if (!state || typeof state !== 'object') continue;
    const scene = (state as { scene_composition?: unknown }).scene_composition;
    subStates[stateId] = { scene_composition: Array.isArray(scene) ? scene : [] };
  }
  const result = validatePCPLSubSimStates(subStates, 2, undefined, defaultVars);
  const out: PhysicsViolationOut[] = [];
  for (const v of result.violations) {
    out.push({
      path: `${pathPrefix}.${v.state_id ?? '?'}`,
      message: `${v.code} primitive #${v.primitive_id} — ${v.message} (expected ${v.expected}, got ${v.actual})`,
      severity: v.severity,
    });
  }
  return out;
}

function checkConceptPhysics(data: unknown): PhysicsViolationOut[] {
  if (!data || typeof data !== 'object') return [];
  const obj = data as Record<string, unknown>;
  const defaultVars = buildDefaultVars(data);
  const out: PhysicsViolationOut[] = [];

  const epicL = obj.epic_l_path as { states?: Record<string, unknown> } | undefined;
  if (epicL?.states && typeof epicL.states === 'object') {
    out.push(...runPhysicsOnStates(epicL.states, 'epic_l_path.states', defaultVars));
  }
  const branches = obj.epic_c_branches;
  if (Array.isArray(branches)) {
    branches.forEach((branch, i) => {
      const b = branch as { states?: Record<string, unknown> } | undefined;
      if (b?.states && typeof b.states === 'object') {
        out.push(...runPhysicsOnStates(b.states, `epic_c_branches[${i}].states`, defaultVars));
      }
    });
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Gate 4 — text_expr / label_expr identifier resolution.
// Mirrors PM_interpolate (parametric_renderer.ts:486–518): regex
// /\{([^{}]+)\}/g for placeholders, math whitelist for sqrt/atan2/etc., and
// concept default_variables for runtime values. Optional
// physics_engine_config.derived_fields_declared lists fields the
// computePhysics_<id> dispatcher will inject at render time — listed
// identifiers resolve cleanly; unlisted ones emit a WARN (not FAIL) so
// authors can still ship while flagging the gap.
// ─────────────────────────────────────────────────────────────────────────────

interface ExprWarning {
  path: string;
  message: string;
  fatal: boolean;
}

const EXPR_PLACEHOLDER_RE = /\{([^{}]+)\}/g;

function checkExprString(
  expr: string,
  fieldName: string,
  pathPrefix: string,
  defaultVars: Record<string, number>,
  derived: Set<string>,
): ExprWarning[] {
  if (typeof expr !== 'string' || expr.length === 0) return [];
  const out: ExprWarning[] = [];
  const seen = new Set<string>();
  let match: RegExpExecArray | null;
  EXPR_PLACEHOLDER_RE.lastIndex = 0;
  while ((match = EXPR_PLACEHOLDER_RE.exec(expr)) !== null) {
    const body = match[1];
    const idents = extractIdentifiers(body);
    for (const ident of idents) {
      if (seen.has(ident)) continue;
      seen.add(ident);
      const cls = classifyIdentifier(ident, defaultVars, derived);
      if (cls === 'resolved') continue;
      const fatal = cls === 'unknown';
      out.push({
        path: pathPrefix,
        message: `${fatal ? 'unresolved_expression_identifier' : 'undeclared_derived_identifier'} ${fieldName}="${expr.length > 80 ? expr.slice(0, 77) + '...' : expr}" — '${ident}' not in default_variables, math whitelist${derived.size > 0 ? ', or derived_fields_declared' : ''}`,
        fatal,
      });
    }
  }
  return out;
}

const EXPR_FIELD_NAMES = [
  'text_expr', 'label_expr', 'label_override', 'equation_expr',
  'x_expr', 'y_expr', 'angle_expr', 'direction_deg_expr', 'magnitude_expr',
];

function walkPrimitivesForExpr(
  prim: unknown,
  pathPrefix: string,
  defaultVars: Record<string, number>,
  derived: Set<string>,
): ExprWarning[] {
  if (!prim || typeof prim !== 'object') return [];
  const p = prim as Record<string, unknown>;
  const out: ExprWarning[] = [];
  for (const field of EXPR_FIELD_NAMES) {
    const val = p[field];
    if (typeof val === 'string') {
      out.push(...checkExprString(val, field, pathPrefix, defaultVars, derived));
    }
  }
  return out;
}

function checkConceptExpressions(data: unknown): ExprWarning[] {
  if (!data || typeof data !== 'object') return [];
  const obj = data as Record<string, unknown>;
  const defaultVars = buildDefaultVars(data);
  const derived = declaredDerivedFields(data);
  const out: ExprWarning[] = [];

  const walkStates = (states: Record<string, unknown>, pathPrefix: string): void => {
    for (const [stateId, state] of Object.entries(states)) {
      if (!state || typeof state !== 'object') continue;
      const scene = (state as { scene_composition?: unknown }).scene_composition;
      if (Array.isArray(scene)) {
        scene.forEach((prim, idx) => {
          const id = (prim as { id?: unknown })?.id ?? idx;
          out.push(...walkPrimitivesForExpr(prim, `${pathPrefix}.${stateId}.scene_composition[${id}]`, defaultVars, derived));
        });
      }
    }
  };

  const epicL = obj.epic_l_path as { states?: Record<string, unknown> } | undefined;
  if (epicL?.states) walkStates(epicL.states, 'epic_l_path.states');

  const branches = obj.epic_c_branches;
  if (Array.isArray(branches)) {
    branches.forEach((branch, i) => {
      const b = branch as { states?: Record<string, unknown> } | undefined;
      if (b?.states) walkStates(b.states, `epic_c_branches[${i}].states`);
    });
  }

  // Board derivation_sequence may also use template literals.
  const overrides = obj.mode_overrides as Record<string, unknown> | undefined;
  if (overrides && typeof overrides === 'object') {
    for (const [modeName, modeVal] of Object.entries(overrides)) {
      if (!modeVal || typeof modeVal !== 'object') continue;
      const ds = (modeVal as { derivation_sequence?: unknown }).derivation_sequence;
      if (Array.isArray(ds)) {
        ds.forEach((step, idx) => {
          const s = step as { text?: unknown; text_expr?: unknown };
          for (const f of ['text', 'text_expr'] as const) {
            const v = s?.[f];
            if (typeof v === 'string') {
              out.push(...checkExprString(v, f, `mode_overrides.${modeName}.derivation_sequence[${idx}]`, defaultVars, derived));
            }
          }
        });
      }
      // Also walk per-state derivation_sequence inside epic_l_path.states
      const epicLOverride = (modeVal as { epic_l_path?: { states?: Record<string, unknown> } }).epic_l_path;
      if (epicLOverride?.states) {
        for (const [stateId, state] of Object.entries(epicLOverride.states)) {
          const ds2 = (state as { derivation_sequence?: unknown })?.derivation_sequence;
          if (Array.isArray(ds2)) {
            ds2.forEach((step, idx) => {
              const s = step as { text?: unknown; text_expr?: unknown };
              for (const f of ['text', 'text_expr'] as const) {
                const v = s?.[f];
                if (typeof v === 'string') {
                  out.push(...checkExprString(v, f, `mode_overrides.${modeName}.epic_l_path.states.${stateId}.derivation_sequence[${idx}]`, defaultVars, derived));
                }
              }
            });
          }
        }
      }
    }
  }

  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Gate 5 — Plain-English check (conceptual surface only).
// Forbidden notation tokens that confuse Indian Class 10–12 students when
// they appear in raw conceptual text. Board / competitive / olympiad mode
// overrides are skipped — formal LaTeX belongs in derivation_sequence.
// ─────────────────────────────────────────────────────────────────────────────

const FORBIDDEN_TOKENS: ReadonlyArray<{ token: string; label: string }> = [
  { token: 'n_hat', label: "'n_hat' (use 'normal direction' or 'perpendicular to surface')" },
  { token: 'F_vec', label: "'F_vec' (use 'force F' — vector arrow shown via diagram)" },
  { token: '\\hat{', label: "'\\hat{...}' LaTeX in conceptual text" },
  { token: '\\vec{', label: "'\\vec{...}' LaTeX in conceptual text" },
];

interface PlainEnWarning { path: string; message: string }

function scanForbidden(text: string, fieldName: string, pathPrefix: string): PlainEnWarning[] {
  if (typeof text !== 'string' || text.length === 0) return [];
  const out: PlainEnWarning[] = [];
  for (const { token, label } of FORBIDDEN_TOKENS) {
    if (text.includes(token)) {
      out.push({
        path: pathPrefix,
        message: `forbidden_token_in_conceptual ${fieldName} contains ${label}`,
      });
    }
  }
  return out;
}

function scanTeacherScript(ts: unknown, pathPrefix: string): PlainEnWarning[] {
  if (!ts || typeof ts !== 'object') return [];
  const obj = ts as Record<string, unknown>;
  const out: PlainEnWarning[] = [];
  const candidate = obj.text_en;
  if (typeof candidate === 'string') {
    out.push(...scanForbidden(candidate, 'teacher_script.text_en', pathPrefix));
  } else if (Array.isArray(candidate)) {
    candidate.forEach((line, i) => {
      if (typeof line === 'string') {
        out.push(...scanForbidden(line, `teacher_script.text_en[${i}]`, pathPrefix));
      }
    });
  }
  return out;
}

function scanScenePrimitives(scene: unknown[], pathPrefix: string): PlainEnWarning[] {
  const out: PlainEnWarning[] = [];
  scene.forEach((prim, idx) => {
    if (!prim || typeof prim !== 'object') return;
    const p = prim as Record<string, unknown>;
    const t = p.type;
    if (t !== 'annotation' && t !== 'formula_box' && t !== 'label') return;
    const id = p.id ?? idx;
    const where = `${pathPrefix}.scene_composition[${id}]`;
    for (const f of ['text', 'text_expr', 'label'] as const) {
      const v = p[f];
      if (typeof v === 'string') out.push(...scanForbidden(v, f, where));
    }
  });
  return out;
}

function checkConceptPlainEnglish(data: unknown): PlainEnWarning[] {
  if (!data || typeof data !== 'object') return [];
  const obj = data as Record<string, unknown>;
  const out: PlainEnWarning[] = [];

  const walk = (states: Record<string, unknown>, pathPrefix: string): void => {
    for (const [stateId, state] of Object.entries(states)) {
      if (!state || typeof state !== 'object') continue;
      const s = state as Record<string, unknown>;
      out.push(...scanTeacherScript(s.teacher_script, `${pathPrefix}.${stateId}`));
      const scene = s.scene_composition;
      if (Array.isArray(scene)) out.push(...scanScenePrimitives(scene, `${pathPrefix}.${stateId}`));
    }
  };

  const epicL = obj.epic_l_path as { states?: Record<string, unknown> } | undefined;
  if (epicL?.states) walk(epicL.states, 'epic_l_path.states');

  const branches = obj.epic_c_branches;
  if (Array.isArray(branches)) {
    branches.forEach((branch, i) => {
      const b = branch as { states?: Record<string, unknown> } | undefined;
      if (b?.states) walk(b.states, `epic_c_branches[${i}].states`);
    });
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Gate 6 — Animation primitive vocabulary whitelist.
// Catches `animation.type: "rotate_about"` and `animate_in: "spin"` —
// authoring typos the renderer silently no-ops.
// ─────────────────────────────────────────────────────────────────────────────

interface AnimWarning { path: string; message: string }

function checkPrimitiveAnimation(prim: unknown, pathPrefix: string): AnimWarning[] {
  if (!prim || typeof prim !== 'object') return [];
  const p = prim as Record<string, unknown>;
  const out: AnimWarning[] = [];

  const animation = p.animation as { type?: unknown } | undefined;
  if (animation && typeof animation === 'object' && typeof animation.type === 'string') {
    if (!(ANIMATION_TYPES as readonly string[]).includes(animation.type)) {
      out.push({
        path: pathPrefix,
        message: `unknown_animation_type animation.type='${animation.type}' (whitelist: ${ANIMATION_TYPES.join(', ')})`,
      });
    }
  }
  if (typeof p.animate_in === 'string') {
    if (!(ANIMATE_IN_KINDS as readonly string[]).includes(p.animate_in)) {
      out.push({
        path: pathPrefix,
        message: `unknown_animate_in animate_in='${p.animate_in}' (whitelist: ${ANIMATE_IN_KINDS.join(', ')})`,
      });
    }
  }
  return out;
}

function checkConceptAnimations(data: unknown): AnimWarning[] {
  if (!data || typeof data !== 'object') return [];
  const obj = data as Record<string, unknown>;
  const out: AnimWarning[] = [];

  const walkScene = (scene: unknown[], pathPrefix: string): void => {
    scene.forEach((prim, idx) => {
      const id = (prim as { id?: unknown })?.id ?? idx;
      out.push(...checkPrimitiveAnimation(prim, `${pathPrefix}.scene_composition[${id}]`));
    });
  };

  const walk = (states: Record<string, unknown>, pathPrefix: string): void => {
    for (const [stateId, state] of Object.entries(states)) {
      if (!state || typeof state !== 'object') continue;
      const scene = (state as { scene_composition?: unknown }).scene_composition;
      if (Array.isArray(scene)) walkScene(scene, `${pathPrefix}.${stateId}`);
    }
  };

  const epicL = obj.epic_l_path as { states?: Record<string, unknown> } | undefined;
  if (epicL?.states) walk(epicL.states, 'epic_l_path.states');

  const branches = obj.epic_c_branches;
  if (Array.isArray(branches)) {
    branches.forEach((branch, i) => {
      const b = branch as { states?: Record<string, unknown> } | undefined;
      if (b?.states) walk(b.states, `epic_c_branches[${i}].states`);
    });
  }

  // Board derivation_sequence steps are also animated primitives.
  const overrides = obj.mode_overrides as Record<string, unknown> | undefined;
  if (overrides) {
    for (const [modeName, modeVal] of Object.entries(overrides)) {
      if (!modeVal || typeof modeVal !== 'object') continue;
      const ds = (modeVal as { derivation_sequence?: unknown }).derivation_sequence;
      if (Array.isArray(ds)) {
        ds.forEach((step, idx) => {
          out.push(...checkPrimitiveAnimation(step, `mode_overrides.${modeName}.derivation_sequence[${idx}]`));
        });
      }
      const epicLOverride = (modeVal as { epic_l_path?: { states?: Record<string, unknown> } }).epic_l_path;
      if (epicLOverride?.states) {
        for (const [stateId, state] of Object.entries(epicLOverride.states)) {
          const ds2 = (state as { derivation_sequence?: unknown })?.derivation_sequence;
          if (Array.isArray(ds2)) {
            ds2.forEach((step, idx) => {
              out.push(...checkPrimitiveAnimation(step, `mode_overrides.${modeName}.epic_l_path.states.${stateId}.derivation_sequence[${idx}]`));
            });
          }
        }
      }
    }
  }

  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Gate 9 — WP-R5 choreography primitives (variable_choreography + anchor_to +
// locus_trace sweep collision). MOVED to ./lib/conceptGates.ts on 2026-08-06 so
// validate-mathematics.ts runs the same checks — they were private to this file,
// which meant subject-namespace concepts never ran ANY choreography gate
// (engine_bug_queue: subject_namespace_concepts_are_invisible_to_flat_scanning_tools).

/**
 * Classifies a parsed JSON into one of four tiers.
 *
 * legacy_array   — root is an array
 * legacy_bundled — has renderer_hint (not renderer_pair) OR any state has
 *                  physics_layer/pedagogy_layer nesting (old authoring format)
 * atomic_v2      — has renderer_pair and states are direct { title, teacher_script, ... }
 * unknown        — doesn't fit any tier; usually indicates a shape error we should see
 */
function detectTier(data: unknown): Tier {
  if (Array.isArray(data)) return 'legacy_array';
  if (data === null || typeof data !== 'object') return 'unknown';

  const obj = data as Record<string, unknown>;

  const hasRendererPair = typeof obj.renderer_pair === 'object' && obj.renderer_pair !== null;
  const hasRendererHint = typeof obj.renderer_hint === 'object' && obj.renderer_hint !== null;

  if (stateUsesLegacyLayers(obj)) return 'legacy_bundled';
  if (hasRendererHint && !hasRendererPair) return 'legacy_bundled';
  if (hasRendererPair) return 'atomic_v2';

  return 'unknown';
}

/**
 * True if any state inside epic_l_path or epic_c_branches has the legacy
 * `physics_layer` / `pedagogy_layer` nesting.
 */
function stateUsesLegacyLayers(obj: Record<string, unknown>): boolean {
  const epicL = obj.epic_l_path;
  if (epicL && typeof epicL === 'object' && 'states' in epicL) {
    const states = (epicL as { states?: unknown }).states;
    if (states && typeof states === 'object') {
      for (const state of Object.values(states)) {
        if (
          state !== null &&
          typeof state === 'object' &&
          ('physics_layer' in state || 'pedagogy_layer' in state)
        ) {
          return true;
        }
      }
    }
  }

  const epicCBranches = obj.epic_c_branches;
  if (Array.isArray(epicCBranches)) {
    for (const branch of epicCBranches) {
      if (branch && typeof branch === 'object' && 'states' in branch) {
        const states = (branch as { states?: unknown }).states;
        if (states && typeof states === 'object') {
          for (const state of Object.values(states)) {
            if (
              state !== null &&
              typeof state === 'object' &&
              ('physics_layer' in state || 'pedagogy_layer' in state)
            ) {
              return true;
            }
          }
        }
      }
    }
  }

  return false;
}

/**
 * Extract a stable category name from a per-error line for tally grouping.
 */
function categorize(errorLine: string): string {
  if (errorLine.includes("uses legacy 'text' field")) return 'legacy_text_field';
  const match = errorLine.match(/^\s*([^:]+):/);
  if (!match) return 'uncategorized';
  const fullPath = match[1].trim();
  if (fullPath === '(root)') return 'root_shape';
  const segments = fullPath.split('.');
  const last = segments[segments.length - 1];
  return last.replace(/\[\d+\]$/, '');
}

interface CliArgs {
  smokeConceptId: string | null;
}

function parseCliArgs(argv: string[]): CliArgs {
  const out: CliArgs = { smokeConceptId: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--with-smoke') {
      const next = argv[i + 1];
      if (typeof next === 'string' && !next.startsWith('-')) {
        out.smokeConceptId = next;
        i++;
      }
    }
  }
  return out;
}

function runSmokeValidator(conceptId: string): boolean {
  console.log('\n' + '='.repeat(70));
  console.log(`Running smoke visual validator (deterministic-only) for ${conceptId}...`);
  console.log('='.repeat(70));
  const result = spawnSync(
    'npx',
    ['tsx', '--env-file=.env.local', 'src/scripts/smoke_visual_validator.ts', conceptId],
    {
      stdio: 'inherit',
      env: { ...process.env, SKIP_VISUAL_VALIDATION: 'true' },
      shell: process.platform === 'win32',
    },
  );
  return result.status === 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Programmatic API for the auto-repair harness (Phase 2).
// `validateConceptFile()` wraps the same gates main() runs, but returns a
// structured result instead of printing. The retry harness uses this to
// formulate "fix these failures" prompts for Sonnet without parsing stdout.
// ─────────────────────────────────────────────────────────────────────────────

export interface GateFailure {
  severity: 'FAIL' | 'WARN';
  category: string;
  path: string;
  message: string;
}

export interface ConceptFileValidation {
  filePath: string;
  parseOk: boolean;
  tier: Tier | null;
  zodPassed: boolean;
  zodErrors: string[];
  gateFailures: GateFailure[];
  passed: boolean;
}

export function validateConceptFile(filePath: string): ConceptFileValidation {
  const out: ConceptFileValidation = {
    filePath,
    parseOk: false,
    tier: null,
    zodPassed: false,
    zodErrors: [],
    gateFailures: [],
    passed: false,
  };

  let raw: string;
  try {
    raw = fs.readFileSync(filePath, 'utf-8');
  } catch {
    out.gateFailures.push({ severity: 'FAIL', category: 'file_read', path: '(file)', message: `cannot read ${filePath}` });
    return out;
  }

  let data: unknown;
  try {
    data = JSON.parse(raw);
    out.parseOk = true;
  } catch (err) {
    out.gateFailures.push({ severity: 'FAIL', category: 'invalid_json', path: '(root)', message: err instanceof Error ? err.message : String(err) });
    return out;
  }

  out.tier = detectTier(data);
  if (out.tier !== 'atomic_v2') {
    out.gateFailures.push({ severity: 'FAIL', category: 'wrong_tier', path: '(root)', message: `tier=${out.tier} (only atomic_v2 supported by harness)` });
    return out;
  }

  const fileName = path.basename(filePath);
  const zodResult = validateConceptJson(data, fileName);
  out.zodPassed = zodResult.passed;
  if (!zodResult.passed) {
    for (const err of zodResult.errors) {
      out.zodErrors.push(err);
      const cat = categorize(err);
      const m = err.match(/^\s*([^:]+):\s*(.*)$/);
      out.gateFailures.push({
        severity: 'FAIL',
        category: cat,
        path: m ? m[1].trim() : '(unknown)',
        message: m ? m[2].trim() : err,
      });
    }
  }

  // Gates 3–6 — only run when zod-shape is sane enough to walk.
  for (const v of checkConceptPhysics(data)) {
    out.gateFailures.push({
      severity: v.severity === 'CRITICAL' ? 'FAIL' : 'WARN',
      category: v.severity === 'CRITICAL' ? 'physics_critical' : 'physics_warning',
      path: v.path,
      message: v.message,
    });
  }
  for (const w of checkConceptExpressions(data)) {
    out.gateFailures.push({
      severity: w.fatal ? 'FAIL' : 'WARN',
      category: w.fatal ? 'unresolved_expression_identifier' : 'undeclared_derived_identifier',
      path: w.path,
      message: w.message,
    });
  }
  for (const w of checkConceptPlainEnglish(data)) {
    out.gateFailures.push({ severity: 'FAIL', category: 'forbidden_token_in_conceptual', path: w.path, message: w.message });
  }
  for (const w of checkConceptAnimations(data)) {
    const cat = w.message.startsWith('unknown_animation_type') ? 'unknown_animation_type' : 'unknown_animate_in';
    out.gateFailures.push({ severity: 'FAIL', category: cat, path: w.path, message: w.message });
  }

  // Bounds + overlap are non-fatal; emit as WARN so the harness can choose
  // to ignore them (it will).
  for (const w of checkConceptBounds(data)) {
    out.gateFailures.push({ severity: 'WARN', category: 'bounds', path: w.path, message: w.message });
  }
  for (const w of checkConceptOverlaps(data)) {
    out.gateFailures.push({ severity: 'WARN', category: 'overlap', path: w.path, message: w.message });
  }

  const fatalCount = out.gateFailures.filter(f => f.severity === 'FAIL').length;
  out.passed = fatalCount === 0;
  return out;
}

// ─── Gate 7 — Rule 31a word budget (25–55 EN words per guided state) ──────────
// Measured on the sum of teacher_script.tts_sentences[].text_en per state; the
// final explore state (advance_mode 'interaction_complete') is exempt (0/open).
// WARN for the legacy fleet (466 over-budget states predate the 2026-07-08
// budget — no fleet retrofit); FAIL only when the concept opts into Rule-31/32
// authorship by declaring motion_archetype or delta_cue on any state.

interface WordBudgetFinding { path: string; message: string; fatal: boolean }

function checkConceptWordBudget(data: unknown): WordBudgetFinding[] {
  const out: WordBudgetFinding[] = [];
  const states = (data as { epic_l_path?: { states?: Record<string, unknown> } })
    ?.epic_l_path?.states;
  if (!states || typeof states !== 'object') return out;

  const entries = Object.entries(states).filter(
    (e): e is [string, Record<string, unknown>] => !!e[1] && typeof e[1] === 'object',
  );
  const rule31Marked = entries.some(
    ([, s]) => 'motion_archetype' in s || 'delta_cue' in s,
  );

  for (const [stateId, state] of entries) {
    if (state.advance_mode === 'interaction_complete') continue;
    const sentences = (state.teacher_script as { tts_sentences?: unknown[] } | undefined)
      ?.tts_sentences;
    if (!Array.isArray(sentences)) continue;
    const words = sentences.reduce<number>((n, s) => {
      const t = (s as { text_en?: unknown })?.text_en;
      return typeof t === 'string' ? n + t.trim().split(/\s+/).filter(Boolean).length : n;
    }, 0);
    if (words > 55) {
      out.push({
        path: `epic_l_path.states.${stateId}`,
        fatal: rule31Marked,
        message: `word budget: ${words} EN words > 55 (Rule 31a — ONE idea per state; split it)${rule31Marked ? '' : ' [legacy fleet — warning only]'}`,
      });
    } else if (words > 0 && words < 20) {
      out.push({
        path: `epic_l_path.states.${stateId}`,
        fatal: false,
        message: `word budget: ${words} EN words < 20 floor (Rule 31a — merge or enrich)`,
      });
    }
  }
  return out;
}

// ─── Gate 7b — tts_sentence id uniqueness (concept-wide) ──────────────────────
// Audio clips + manifest entries are keyed `<id>_<lang>` (generate_tts_audio.ts),
// so per-state id reuse (the legacy `s1..s4`-in-every-state pattern) silently
// overwrites clips state-by-state and leaves the manifest holding only the last
// writer's text_hash — surfaced 2026-07-24 as 14/18 "STALE" on
// vector_addition_law's first voice. Fleet convention: `s<state>_<n>`
// (faraday_law_induction). WARN for the legacy fleet (~41 old-architecture
// files, never voiced); FAIL when the concept opts into Rule-31/32 authorship
// (motion_archetype/delta_cue declared) — same escalation logic as Gate 7.
// generate_tts_audio.ts carries the hard refusal at voicing time regardless.

function checkConceptTtsIdUniqueness(data: unknown): WordBudgetFinding[] {
  const out: WordBudgetFinding[] = [];
  const states = (data as { epic_l_path?: { states?: Record<string, unknown> } })
    ?.epic_l_path?.states;
  if (!states || typeof states !== 'object') return out;

  const entries = Object.entries(states).filter(
    (e): e is [string, Record<string, unknown>] => !!e[1] && typeof e[1] === 'object',
  );
  const rule31Marked = entries.some(
    ([, s]) => 'motion_archetype' in s || 'delta_cue' in s,
  );

  const firstSeenIn = new Map<string, string>();
  const dupes = new Map<string, Set<string>>();
  for (const [stateId, state] of entries) {
    const sentences = (state.teacher_script as { tts_sentences?: unknown[] } | undefined)
      ?.tts_sentences;
    if (!Array.isArray(sentences)) continue;
    for (const s of sentences) {
      const id = (s as { id?: unknown })?.id;
      if (typeof id !== 'string' || id.length === 0) continue;
      const prior = firstSeenIn.get(id);
      if (prior === undefined) {
        firstSeenIn.set(id, stateId);
      } else {
        if (!dupes.has(id)) dupes.set(id, new Set([prior]));
        dupes.get(id)!.add(stateId);
      }
    }
  }
  for (const [id, stateIds] of dupes) {
    out.push({
      path: 'epic_l_path.states',
      fatal: rule31Marked,
      message: `duplicate tts_sentence id "${id}" across ${[...stateIds].join(', ')} — clips are keyed by id; rename to s<state>_<n> before voicing${rule31Marked ? '' : ' [legacy fleet — warning only]'}`,
    });
  }
  return out;
}

// ─── Gate 8b — registration cross-check (fleet-level) ─────────────────────────
// 5 of the 8 registration sites are hand-maintained duplicates of concept-JSON
// fields, and a miss was previously SILENT (the PCPL miss shipped a chapter
// mis-routed, sessions 28–31.5). Text-parses the three registries (no runtime
// imports — intentClassifier/aiSimulationGenerator pull in Supabase) and
// asserts every atomic concept is registered. Any violation exits 1.

interface RegistrationRecord { file: string; id: string; panelA?: string }
interface RegistrationFailure { path: string; message: string }

function stripLineComments(src: string): string {
  return src.replace(/\/\/[^\n]*/g, '');
}

function extractIdSet(src: string, startAnchor: string, endAnchor: string): Set<string> {
  const start = src.indexOf(startAnchor);
  if (start < 0) return new Set();
  const end = src.indexOf(endAnchor, start);
  if (end < 0) return new Set();
  const block = stripLineComments(src.slice(start, end));
  const ids = new Set<string>();
  // [A-Za-z0-9_] — trailing capitals are real (magnetic_field_concept_B et al.;
  // a lowercase-only class silently drops them — the documented drift trap in
  // intentClassifier's own extractAdvertisedConcepts).
  for (const m of block.matchAll(/'([a-z][A-Za-z0-9_]*)'/g)) ids.add(m[1]);
  return ids;
}

function checkRegistrations(records: RegistrationRecord[]): RegistrationFailure[] {
  const failures: RegistrationFailure[] = [];
  const SRC = path.resolve(__dirname, '..');

  const classifierSrc = fs.readFileSync(path.join(SRC, 'lib', 'intentClassifier.ts'), 'utf-8');
  const generatorSrc = fs.readFileSync(path.join(SRC, 'lib', 'aiSimulationGenerator.ts'), 'utf-8');
  const panelSrc = fs.readFileSync(path.join(SRC, 'config', 'panelConfig.ts'), 'utf-8');

  const validIds = extractIdSet(
    classifierSrc, 'VALID_CONCEPT_IDS: ReadonlySet<string> = new Set([', ']);',
  );
  const pcplIds = extractIdSet(
    generatorSrc, 'const PCPL_CONCEPTS = new Set<string>([', ']);',
  );
  const panelIds = new Set<string>();
  for (const m of panelSrc.matchAll(/concept_id:\s*'([a-z][A-Za-z0-9_]*)'/g)) panelIds.add(m[1]);

  if (validIds.size === 0 || pcplIds.size === 0 || panelIds.size === 0) {
    failures.push({
      path: 'registration_gate',
      message: `registry parse failed (VALID_CONCEPT_IDS=${validIds.size}, PCPL_CONCEPTS=${pcplIds.size}, CONCEPT_PANEL_MAP=${panelIds.size}) — the anchor text moved; fix extractIdSet, do not skip the gate`,
    });
    return failures;
  }

  const fileIds = new Set(records.map((r) => r.id));

  for (const r of records) {
    if (!validIds.has(r.id)) {
      failures.push({
        path: r.file,
        message: `'${r.id}' missing from VALID_CONCEPT_IDS (src/lib/intentClassifier.ts) — the classifier will drop it as untrusted`,
      });
    }
    if (!panelIds.has(r.id)) {
      failures.push({
        path: r.file,
        message: `'${r.id}' missing from CONCEPT_PANEL_MAP (src/config/panelConfig.ts) — panel layout falls back silently`,
      });
    }
    // PCPL members route through the parametric assembler, so panel_a
    // ('mechanics_2d'/'parametric') intentionally differs from resolveRendererType.
    if (r.panelA && !pcplIds.has(r.id)) {
      const resolved = resolveRendererType(r.id);
      if (resolved !== r.panelA) {
        failures.push({
          path: r.file,
          message: `renderer mismatch: renderer_pair.panel_a='${r.panelA}' but CONCEPT_RENDERER_MAP resolves '${resolved}' — the concept renders on the wrong engine`,
        });
      }
    }
  }

  for (const id of pcplIds) {
    if (!fileIds.has(id)) {
      failures.push({
        path: 'PCPL_CONCEPTS',
        message: `'${id}' is in PCPL_CONCEPTS but has no concept JSON in src/data/concepts/`,
      });
    }
  }

  return failures;
}

function main(): void {
  const cli = parseCliArgs(process.argv.slice(2));
  // ISOLATION CONTRACT (chemistry, 2026-07-23): this scan is intentionally NON-recursive.
  // Subject subfolders (src/data/concepts/chemistry/) are invisible to the PHYSICS validator
  // by design — their schema/gates differ (e.g. no physics_engine_config, no E42, own animation
  // vocabulary) and they get their own validate:chemistry script (CHEMISTRY_BUILD_PLAN.md Phase 4).
  // Never add recursion here; a chemistry file dropped in the flat dir WILL be validated as
  // physics and fail. See docs/CHEMISTRY_ARCHITECTURE.md §7.
  const files = fs.readdirSync(CONCEPTS_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort();

  console.log(`\nValidating ${files.length} concept JSONs...\n`);
  console.log('='.repeat(70));

  const tierBuckets: Record<Tier, string[]> = {
    atomic_v2: [],
    legacy_bundled: [],
    legacy_array: [],
    unknown: [],
  };

  let passCount = 0;
  let atomicFailCount = 0;
  let unknownCount = 0;
  let boundsWarnCount = 0;
  const boundsWarnFiles = new Set<string>();
  const categoryTally = new Map<string, number>();
  const categoryFiles = new Map<string, Set<string>>();
  const registrationRecords: RegistrationRecord[] = [];

  for (const file of files) {
    const filePath = path.join(CONCEPTS_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf-8');

    let data: unknown;
    try {
      data = JSON.parse(raw);
    } catch {
      console.log(`PARSE_FAIL  ${file}`);
      console.log('  Invalid JSON — parse error');
      console.log('');
      atomicFailCount++;
      const cat = 'invalid_json';
      categoryTally.set(cat, (categoryTally.get(cat) ?? 0) + 1);
      if (!categoryFiles.has(cat)) categoryFiles.set(cat, new Set());
      categoryFiles.get(cat)!.add(file);
      continue;
    }

    const tier = detectTier(data);
    tierBuckets[tier].push(file);

    if (tier === 'legacy_bundled') {
      console.log(`LEGACY      ${file}  (needs splitting — see docs/archive/LEGACY_SPLIT_BACKLOG.md)`);
      continue;
    }

    if (tier === 'legacy_array') {
      console.log(`LEGACY_ARR  ${file}  (skipped — root is a multi-concept array)`);
      continue;
    }

    if (tier === 'unknown') {
      console.log(`UNKNOWN     ${file}  (doesn't match any known tier)`);
      unknownCount++;
      continue;
    }

    // tier === 'atomic_v2' — run Zod validation
    const result = validateConceptJson(data, file);

    if (result.passed) {
      console.log(`PASS        ${file}`);
      passCount++;
    } else {
      console.log(`FAIL        ${file}`);
      for (const err of result.errors) {
        console.log(err);
        const cat = categorize(err);
        categoryTally.set(cat, (categoryTally.get(cat) ?? 0) + 1);
        if (!categoryFiles.has(cat)) categoryFiles.set(cat, new Set());
        categoryFiles.get(cat)!.add(file);
      }
      atomicFailCount++;
    }

    // Non-fatal bounding-box check — catches primitives authored off-canvas
    // (e.g. field_forces STATE_2 earth at y=560 on a 500px canvas, session
    // 30.5). Warnings only, does not affect exit code.
    const bounds = checkConceptBounds(data);
    for (const w of bounds) {
      console.log(`  WARN  ${w.path}: ${w.message}`);
      boundsWarnCount++;
      boundsWarnFiles.add(file);
    }

    // Non-fatal layout-overlap check (session 54). Catches force-arrow labels
    // crashing into right-side annotation boxes — e.g. pressure_scalar
    // wire_out's "i = 7 A (out)" label landing on the kirchhoff_box. Warnings
    // only — same-origin force_arrows (junction visualizations) are filtered
    // out as intentional.
    const overlaps = checkConceptOverlaps(data);
    for (const w of overlaps) {
      console.log(`  WARN  ${w.path}: ${w.message}`);
      boundsWarnCount++;
      boundsWarnFiles.add(file);
    }

    // Gate 3 — physics validator (E42).
    let physicsCriticalThisFile = 0;
    const physics = checkConceptPhysics(data);
    for (const v of physics) {
      const tag = v.severity === 'CRITICAL' ? 'FAIL' : 'WARN';
      console.log(`  ${tag}  ${v.path}: ${v.message}`);
      const cat = v.severity === 'CRITICAL' ? 'physics_critical' : 'physics_warning';
      categoryTally.set(cat, (categoryTally.get(cat) ?? 0) + 1);
      if (!categoryFiles.has(cat)) categoryFiles.set(cat, new Set());
      categoryFiles.get(cat)!.add(file);
      if (v.severity === 'CRITICAL') physicsCriticalThisFile++;
      else { boundsWarnCount++; boundsWarnFiles.add(file); }
    }

    // Gate 4 — expression identifier resolution.
    let exprFatalThisFile = 0;
    const exprs = checkConceptExpressions(data);
    for (const w of exprs) {
      const tag = w.fatal ? 'FAIL' : 'WARN';
      console.log(`  ${tag}  ${w.path}: ${w.message}`);
      const cat = w.fatal ? 'unresolved_expression_identifier' : 'undeclared_derived_identifier';
      categoryTally.set(cat, (categoryTally.get(cat) ?? 0) + 1);
      if (!categoryFiles.has(cat)) categoryFiles.set(cat, new Set());
      categoryFiles.get(cat)!.add(file);
      if (w.fatal) exprFatalThisFile++;
      else { boundsWarnCount++; boundsWarnFiles.add(file); }
    }

    // Gate 5 — plain-English check (conceptual surface only).
    let plainEnFatalThisFile = 0;
    const plainEn = checkConceptPlainEnglish(data);
    for (const w of plainEn) {
      console.log(`  FAIL  ${w.path}: ${w.message}`);
      const cat = 'forbidden_token_in_conceptual';
      categoryTally.set(cat, (categoryTally.get(cat) ?? 0) + 1);
      if (!categoryFiles.has(cat)) categoryFiles.set(cat, new Set());
      categoryFiles.get(cat)!.add(file);
      plainEnFatalThisFile++;
    }

    // Gate 6 — animation vocabulary whitelist.
    let animFatalThisFile = 0;
    const anims = checkConceptAnimations(data);
    for (const w of anims) {
      console.log(`  FAIL  ${w.path}: ${w.message}`);
      const cat = w.message.startsWith('unknown_animation_type') ? 'unknown_animation_type' : 'unknown_animate_in';
      categoryTally.set(cat, (categoryTally.get(cat) ?? 0) + 1);
      if (!categoryFiles.has(cat)) categoryFiles.set(cat, new Set());
      categoryFiles.get(cat)!.add(file);
      animFatalThisFile++;
    }

    // Gate 7 — Rule 31a word budget (WARN for the legacy fleet; FAIL only for
    // concepts that declare motion_archetype/delta_cue — Rule-31/32-era opt-in).
    let wordBudgetFatalThisFile = 0;
    const budget = checkConceptWordBudget(data);
    for (const w of budget) {
      const tag = w.fatal ? 'FAIL' : 'WARN';
      console.log(`  ${tag}  ${w.path}: ${w.message}`);
      const cat = w.fatal ? 'word_budget_fail' : 'word_budget_warning';
      categoryTally.set(cat, (categoryTally.get(cat) ?? 0) + 1);
      if (!categoryFiles.has(cat)) categoryFiles.set(cat, new Set());
      categoryFiles.get(cat)!.add(file);
      if (w.fatal) wordBudgetFatalThisFile++;
      else { boundsWarnCount++; boundsWarnFiles.add(file); }
    }

    // Gate 7b — tts_sentence id uniqueness (WARN legacy; FAIL Rule-31/32-era).
    let ttsIdFatalThisFile = 0;
    const ttsIdFindings = checkConceptTtsIdUniqueness(data);
    for (const w of ttsIdFindings) {
      const tag = w.fatal ? 'FAIL' : 'WARN';
      console.log(`  ${tag}  ${w.path}: ${w.message}`);
      const cat = w.fatal ? 'tts_id_duplicate_fail' : 'tts_id_duplicate_warning';
      categoryTally.set(cat, (categoryTally.get(cat) ?? 0) + 1);
      if (!categoryFiles.has(cat)) categoryFiles.set(cat, new Set());
      categoryFiles.get(cat)!.add(file);
      if (w.fatal) ttsIdFatalThisFile++;
      else { boundsWarnCount++; boundsWarnFiles.add(file); }
    }

    // Gate 9 — WP-R5 choreography primitives (anchor_to chain order +
    // variable_choreography declaration; seizable-without-slider is a WARN).
    let choreoFatalThisFile = 0;
    const choreoWarnings = checkConceptChoreography(data);
    for (const w of choreoWarnings) {
      const tag = w.fatal ? 'FAIL' : 'WARN';
      console.log(`  ${tag}  ${w.path}: ${w.message}`);
      const cat = w.fatal ? 'choreography_fatal' : 'choreography_warning';
      categoryTally.set(cat, (categoryTally.get(cat) ?? 0) + 1);
      if (!categoryFiles.has(cat)) categoryFiles.set(cat, new Set());
      categoryFiles.get(cat)!.add(file);
      if (w.fatal) choreoFatalThisFile++;
      else { boundsWarnCount++; boundsWarnFiles.add(file); }
    }

    // Gate 9b — animate_in_ms dead config on an appear_at_ms<=0 primitive
    // (peter_parker:pcpl_surgeon, Checkpoint B cycle 3, 2026-08-09). WARN-only.
    for (const w of animateInDeadConfigWarnings(data, file)) {
      console.log(`  WARN  ${w}`);
      const cat = 'animate_in_ms_dead_config';
      categoryTally.set(cat, (categoryTally.get(cat) ?? 0) + 1);
      if (!categoryFiles.has(cat)) categoryFiles.set(cat, new Set());
      categoryFiles.get(cat)!.add(file);
      boundsWarnCount++; boundsWarnFiles.add(file);
    }

    // Gate 9c — renderer-output scope name collides with a teacher-control
    // scope name (riemann_bars sum_var/bars_drawn_var vs slider variable /
    // plot_point drag.bind_variable) (peter_parker:pcpl_surgeon, Checkpoint B
    // cycle 3, 2026-08-09). WARN-only — see conceptGates.ts for why.
    for (const w of renderScopeCollisionWarnings(data, file)) {
      console.log(`  WARN  ${w}`);
      const cat = 'render_scope_name_collision';
      categoryTally.set(cat, (categoryTally.get(cat) ?? 0) + 1);
      if (!categoryFiles.has(cat)) categoryFiles.set(cat, new Set());
      categoryFiles.get(cat)!.add(file);
      boundsWarnCount++; boundsWarnFiles.add(file);
    }

    // Collect for the fleet-level registration cross-check (Gate 8b).
    const reg = data as { concept_id?: string; renderer_pair?: { panel_a?: string } };
    if (typeof reg.concept_id === 'string') {
      registrationRecords.push({ file, id: reg.concept_id, panelA: reg.renderer_pair?.panel_a });
    }

    // If any of the new fatal gates fired, treat this file as a failure even
    // though the Zod pass succeeded. Don't double-count files Zod already
    // failed.
    if (
      result.passed &&
      (physicsCriticalThisFile + exprFatalThisFile + plainEnFatalThisFile + animFatalThisFile + wordBudgetFatalThisFile + ttsIdFatalThisFile + choreoFatalThisFile) > 0
    ) {
      // Demote PASS → FAIL retroactively.
      passCount--;
      atomicFailCount++;
    }

    console.log('');
  }

  console.log('='.repeat(70));
  console.log('\nClassification:');
  console.log(`  ${tierBuckets.atomic_v2.length.toString().padStart(3)} ATOMIC v2        (validated against Zod schema)`);
  console.log(`  ${tierBuckets.legacy_bundled.length.toString().padStart(3)} LEGACY BUNDLED   (skipped — need splitting into atomic concepts)`);
  console.log(`  ${tierBuckets.legacy_array.length.toString().padStart(3)} LEGACY ARRAY     (skipped — root is an array)`);
  if (tierBuckets.unknown.length > 0) {
    console.log(`  ${tierBuckets.unknown.length.toString().padStart(3)} UNKNOWN          (fail — shape doesn't match any tier)`);
  }

  // Gate 8b — registration cross-check (fleet-level; a miss was previously silent).
  const regFailures = checkRegistrations(registrationRecords);
  if (regFailures.length > 0) {
    console.log('\nRegistration cross-check FAILURES:');
    for (const f of regFailures) console.log(`  FAIL  ${f.path}: ${f.message}`);
  } else {
    console.log('\nRegistration cross-check: all concepts registered (VALID_CONCEPT_IDS · renderer map · panel map · PCPL) ✓');
  }

  console.log(`\nAtomic results: ${passCount} PASS, ${atomicFailCount} FAIL out of ${tierBuckets.atomic_v2.length} atomic files`);
  if (boundsWarnCount > 0) {
    console.log(`Bounds warnings: ${boundsWarnCount} off-canvas primitive(s) across ${boundsWarnFiles.size} file(s) — non-fatal, fix in JSON`);
  } else {
    console.log(`Bounds check: all primitives within canvas [${CANVAS_W}x${CANVAS_H}] ✓`);
  }
  console.log('');

  if (categoryTally.size > 0) {
    console.log('Backfill checklist — errors grouped by category (atomic files only):');
    console.log('-'.repeat(70));
    const sorted = [...categoryTally.entries()].sort((a, b) => b[1] - a[1]);
    for (const [category, count] of sorted) {
      const fileCount = categoryFiles.get(category)?.size ?? 0;
      console.log(`  ${category.padEnd(30)} ${String(count).padStart(4)} error(s) across ${fileCount} file(s)`);
    }
    console.log('');
  }

  if (tierBuckets.legacy_bundled.length > 0) {
    console.log(`Legacy bundled files (${tierBuckets.legacy_bundled.length}):`);
    for (const f of tierBuckets.legacy_bundled) console.log(`  ${f}`);
    console.log('');
  }

  if (atomicFailCount > 0 || unknownCount > 0 || regFailures.length > 0) {
    process.exit(1);
  }

  if (cli.smokeConceptId) {
    const ok = runSmokeValidator(cli.smokeConceptId);
    if (!ok) {
      console.error(`\n❌ Smoke validator failed for ${cli.smokeConceptId}.`);
      process.exit(1);
    }
    console.log(`\n✅ Smoke validator passed for ${cli.smokeConceptId}.`);
  }
}

// Only run the CLI flow when invoked directly (e.g. `npm run validate:concepts`).
// Importing this module from the auto-repair harness should NOT trigger
// the full file scan — it just needs `validateConceptFile()`.
if (require.main === module) {
  main();
}
