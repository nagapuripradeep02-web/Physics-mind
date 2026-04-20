import type { P5Instance, AngleArcSpec } from '../types';
import { hexToRgb } from '../layout';

export function drawAngleArc(p: P5Instance, spec: AngleArcSpec): void {
  const [r, g, b] = hexToRgb(spec.color ?? '#6B7280');
  const radius = spec.radius ?? 35;
  const { vertex } = spec;

  // Canvas y-down: negate angles
  const fromRad = -spec.from_direction * Math.PI / 180;
  const toRad = -spec.to_direction * Math.PI / 180;

  p.push();
  p.stroke(r, g, b);
  p.strokeWeight(1.5);
  p.noFill();
  p.arc(vertex.x, vertex.y, radius * 2, radius * 2, Math.min(fromRad, toRad), Math.max(fromRad, toRad));

  if (spec.label) {
    const midAngle = (fromRad + toRad) / 2;
    const lx = vertex.x + (radius + 12) * Math.cos(midAngle);
    const ly = vertex.y + (radius + 12) * Math.sin(midAngle);
    p.fill(r, g, b);
    p.noStroke();
    p.textSize(12);
    p.textAlign(p.CENTER, p.CENTER);
    p.text(spec.label, lx, ly);
  }
  p.pop();
}
