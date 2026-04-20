import type { P5Instance, ProjectionShadowSpec } from '../types';
import type { PhysicsResult } from '../../physicsEngine/types';
import { hexToRgb } from '../layout';

export function drawProjectionShadow(
  p: P5Instance,
  spec: ProjectionShadowSpec,
  physics: PhysicsResult,
  origin: { x: number; y: number },
  dynamicScale?: number
): void {
  const force = physics.forces.find(f => f.id === spec.source_force_id);
  if (!force) return;

  const scale = dynamicScale ?? 5;
  let projX = 0;
  let projY = 0;

  if (spec.onto_axis === 'x') {
    projX = force.vector.x * scale;
  } else if (spec.onto_axis === 'y') {
    projY = -force.vector.y * scale; // flip y
  }

  const [r, g, b] = hexToRgb(spec.color ?? '#94A3B8');

  p.push();
  p.stroke(r, g, b);
  p.strokeWeight(2);
  p.line(origin.x, origin.y, origin.x + projX, origin.y + projY);

  if (spec.label) {
    p.fill(r, g, b);
    p.noStroke();
    p.textSize(12);
    p.textAlign(p.CENTER, p.BOTTOM);
    p.text(spec.label, origin.x + projX / 2, origin.y + projY / 2 - 4);
  }
  p.pop();
}
