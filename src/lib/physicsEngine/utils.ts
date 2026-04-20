import type { Vector2D, Force, GraphPoint } from './types';

export const G = 9.8;

export function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function magnitude(x: number, y: number): number {
  return Math.sqrt(x * x + y * y);
}

export function angle_deg(x: number, y: number): number {
  return toDeg(Math.atan2(y, x));
}

export function makeVector(x: number, y: number): Vector2D {
  return {
    x,
    y,
    magnitude: magnitude(x, y),
    angle_deg: angle_deg(x, y),
  };
}

export function makeForce(
  id: string,
  label: string,
  x: number,
  y: number,
  color: string,
  draw_from: Force['draw_from'] = 'body_center',
  show = true
): Force {
  return {
    id,
    label,
    vector: makeVector(x, y),
    color,
    draw_from,
    show,
  };
}

export function curvePoints(
  f: (x: number) => number,
  x_min: number,
  x_max: number,
  n = 100
): GraphPoint[] {
  const points: GraphPoint[] = [];
  const step = (x_max - x_min) / (n - 1);
  for (let i = 0; i < n; i++) {
    const x = x_min + i * step;
    points.push({ x, y: f(x) });
  }
  return points;
}
