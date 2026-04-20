/**
 * COORDINATE CONVENTION:
 * Engine outputs physics coordinates: y-positive = upward.
 * Canvas/p5.js uses y-positive = downward.
 * PCPL renderer must flip y when drawing: canvas_y = origin_y - (physics_y * scale)
 */

export interface Vector2D {
  x: number;
  y: number;
  magnitude: number;
  angle_deg: number;
}

export interface Force {
  id: string;
  label: string;
  vector: Vector2D;
  color: string;
  draw_from: 'body_center' | 'body_top' | 'body_bottom' | 'body_left' | 'body_right' | { x: number; y: number };
  show: boolean;
}

export interface GraphPoint {
  x: number;
  y: number;
}

export interface GraphTrace {
  id: string;
  label: string;
  points: GraphPoint[];
  live_point: GraphPoint;
  color: string;
  bars?: { label: string; value: number }[];
}

export interface PhysicsResult {
  concept_id: string;
  variables: Record<string, number>;
  derived: Record<string, number>;
  forces: Force[];
  graph: GraphTrace[];
  constraints_ok: boolean;
  warnings: string[];
}

export interface ConceptPhysicsEngine {
  compute: (variables: Record<string, number>) => PhysicsResult;
  default_variables: Record<string, number>;
  variable_ranges: Record<string, { min: number; max: number; step: number; unit: string }>;
}
