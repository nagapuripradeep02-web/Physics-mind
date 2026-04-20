// Minimal p5 interface — only the methods PCPL primitives use.
// Avoids @types/p5 dependency since the existing renderer embeds p5 as a string.
export interface P5Instance {
  push(): void;
  pop(): void;
  fill(r: number, g?: number, b?: number, a?: number): void;
  noFill(): void;
  stroke(r: number, g?: number, b?: number, a?: number): void;
  noStroke(): void;
  strokeWeight(w: number): void;
  rect(x: number, y: number, w: number, h: number, r?: number): void;
  circle(x: number, y: number, d: number): void;
  line(x1: number, y1: number, x2: number, y2: number): void;
  arc(x: number, y: number, w: number, h: number, start: number, stop: number): void;
  triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void;
  text(s: string, x: number, y: number): void;
  textSize(s: number): void;
  textAlign(h: number, v?: number): void;
  textStyle(s: number): void;
  translate(x: number, y: number): void;
  rotate(angle: number): void;
  radians(deg: number): number;
  readonly CENTER: number;
  readonly LEFT: number;
  readonly TOP: number;
  readonly BOTTOM: number;
  readonly BOLD: number;
  readonly ITALIC: number;
}

// ── Zone/Anchor positioning mixin ──────────────────────────────────
// Primitives can use zone/anchor fields instead of explicit position:{x,y}.
// Resolution: position:{x,y} wins > zone > anchor > primitive default.

export interface ZonePositioning {
  zone?: string;       // e.g. "MAIN_ZONE", "CALLOUT_ZONE_R"
  anchor?: string;     // e.g. "block.center", "MAIN_ZONE.top_left"
  offset?: { dir: 'up' | 'down' | 'left' | 'right'; gap: number };
}

export type DrawFrom =
  | 'body_center' | 'body_top' | 'body_bottom'
  | 'body_left' | 'body_right'
  | 'body_top_center' | 'body_bottom_center'
  | { x: number; y: number };

export interface BodySpec extends Partial<ZonePositioning> {
  type: 'body';
  id?: string;
  shape: 'rect' | 'circle' | 'line';
  label?: string;
  position?: { x: number; y: number };
  size?: { w: number; h: number } | number;
  fill_color?: string;
  border_color?: string;
  border_width?: number;
  opacity?: number;
  rotate_deg?: number;
  // Engine 20 — motion integrator opt-in. 'static' (default) = position fixed.
  // 'slides_on_surface' = when body is attach_to_surface'd to a surface with
  // friction, runs gravity + friction integration if net force overcomes
  // static friction. Phase 1 ships only these two values.
  physics_behavior?: 'static' | 'slides_on_surface';
}

export interface SurfaceSpec {
  type: 'surface';
  id?: string;
  orientation: 'horizontal' | 'vertical' | 'inclined';
  angle?: number;
  position: { x: number; y: number };
  length: number;
  texture?: 'smooth' | 'rough' | 'wall' | 'floor';
  label?: string;
  // Engine 20 — surface friction coefficients. Consumed by the motion
  // integrator for any body with physics_behavior='slides_on_surface'
  // attached to this surface. Omitted = frictionless (mu_s=mu_k=0).
  friction?: { mu_s: number; mu_k: number };
}

export interface ForceArrowSpec {
  type: 'force_arrow';
  id?: string;
  force_id: string;
  draw_from?: DrawFrom;
  color?: string;
  label_override?: string;
  scale_pixels_per_unit?: number;
  show_label?: boolean;
}

export interface VectorSpec {
  type: 'vector';
  id?: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  label?: string;
  color?: string;
  style?: 'solid' | 'dashed';
}

export interface AngleArcSpec {
  type: 'angle_arc';
  id?: string;
  vertex: { x: number; y: number };
  from_direction: number;
  to_direction: number;
  label?: string;
  radius?: number;
  color?: string;
}

export interface LabelSpec extends Partial<ZonePositioning> {
  type: 'label';
  id?: string;
  text: string;
  position?: { x: number; y: number };
  font_size?: number;
  color?: string;
  bold?: boolean;
  italic?: boolean;
}

export interface FormulaBoxSpec extends Partial<ZonePositioning> {
  type: 'formula_box';
  id?: string;
  formula: string;
  sub_formula?: string;
  position?: { x: number; y: number };
  border_color?: string;
  highlight_term?: string;
}

export interface SliderSpec {
  type: 'slider';
  id?: string;
  variable: string;
  min: number;
  max: number;
  step: number;
  default: number;
  label: string;
  unit?: string;
  position?: 'bottom' | 'bottom_left' | 'bottom_right';
}

export interface AnnotationSpec extends Partial<ZonePositioning> {
  type: 'annotation';
  id?: string;
  text: string;
  position?: { x: number; y: number };
  points_to?: { x: number; y: number };
  style?: 'callout' | 'underline';
  color?: string;
}

export interface ComparisonPanelSpec {
  type: 'comparison_panel';
  id?: string;
  left_label?: string;
  right_label?: string;
  left_scene?: PrimitiveSpec[];
  right_scene?: PrimitiveSpec[];
}

export interface ProjectionShadowSpec {
  type: 'projection_shadow';
  id?: string;
  source_force_id: string;
  onto_axis: 'x' | 'y' | 'along_incline' | 'perpendicular_to_incline';
  label?: string;
  color?: string;
}

export interface MotionPathSpec {
  type: 'motion_path';
  id?: string;
  target_body_id?: string;
  path: 'linear' | 'parabolic' | 'circular';
  start: { x: number; y: number };
  end: { x: number; y: number };
  style?: 'solid' | 'dashed' | 'animated';
}

// ── Engine 19 (Board Mode) primitives ───────────────────────────────
// Used inside mode_overrides.board.derivation_sequence[STATE_N].primitives
// to render handwritten-style step-by-step derivations on an answer sheet.
// The `animate_in` field is declarative; the state machine must pass a
// per-state elapsed-ms value into the draw function for the animation to
// play (wired in Phase C.1). For now the renderer falls back to static.

export interface DerivationStepSpec extends Partial<ZonePositioning> {
  type: 'derivation_step';
  id?: string;
  text: string;
  position?: { x: number; y: number };
  animate_in?: 'handwriting' | 'fade_in' | 'none';
  color?: string;
  font_size?: number;
}

export interface MarkBadgeSpec extends Partial<ZonePositioning> {
  type: 'mark_badge';
  id?: string;
  mark_value: number;
  text?: string;
  tied_to_state?: string;
  position?: { x: number; y: number };
  color?: string;
}

export type PrimitiveSpec =
  | BodySpec | SurfaceSpec | ForceArrowSpec | VectorSpec
  | AngleArcSpec | LabelSpec | FormulaBoxSpec | SliderSpec
  | AnnotationSpec | ComparisonPanelSpec | ProjectionShadowSpec | MotionPathSpec
  | DerivationStepSpec | MarkBadgeSpec;
