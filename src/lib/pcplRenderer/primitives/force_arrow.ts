import type { P5Instance, ForceArrowSpec } from '../types';
import type { PhysicsResult } from '../../physicsEngine/types';
import { hexToRgb, toPixels } from '../layout';

export function drawForceArrow(
  p: P5Instance,
  spec: ForceArrowSpec,
  physics: PhysicsResult,
  origin: { x: number; y: number },
  dynamicScale?: number
): void {
  const force = physics.forces.find(f => f.id === spec.force_id);
  if (!force || !force.show) return;

  const scale = dynamicScale ?? spec.scale_pixels_per_unit ?? 5;
  const [r, g, b] = hexToRgb(spec.color ?? force.color ?? '#EF4444');

  const dx = toPixels(force.vector.x, scale);
  const dy = -toPixels(force.vector.y, scale); // flip y: physics up → canvas down

  const x1 = origin.x;
  const y1 = origin.y;
  const x2 = x1 + dx;
  const y2 = y1 + dy;

  p.push();
  p.stroke(r, g, b);
  p.strokeWeight(2);
  p.fill(r, g, b);
  p.line(x1, y1, x2, y2);

  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLen = 12;
  p.translate(x2, y2);
  p.rotate(angle);
  p.triangle(0, 0, -headLen, headLen / 2.5, -headLen, -headLen / 2.5);

  if (spec.show_label !== false) {
    p.rotate(-angle);
    p.fill(r, g, b);
    p.noStroke();
    p.textSize(12);
    p.textAlign(p.LEFT, p.CENTER);
    p.text(spec.label_override ?? force.label, 6, 0);
  }
  p.pop();
}
