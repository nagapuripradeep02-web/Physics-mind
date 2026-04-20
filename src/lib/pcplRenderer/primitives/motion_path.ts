import type { P5Instance, MotionPathSpec } from '../types';

export function drawMotionPath(p: P5Instance, spec: MotionPathSpec): void {
  const { start, end, style = 'solid' } = spec;

  p.push();
  p.stroke(150, 150, 150);
  p.strokeWeight(1.5);
  p.noFill();

  if (style === 'dashed') {
    const dist = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
    const steps = Math.max(1, Math.floor(dist / 16));
    const dx = (end.x - start.x) / (steps * 2);
    const dy = (end.y - start.y) / (steps * 2);
    for (let i = 0; i < steps; i++) {
      const sx = start.x + i * 2 * dx;
      const sy = start.y + i * 2 * dy;
      p.line(sx, sy, sx + dx, sy + dy);
    }
  } else {
    p.line(start.x, start.y, end.x, end.y);
  }

  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  p.fill(150);
  p.translate(end.x, end.y);
  p.rotate(angle);
  p.triangle(0, 0, -10, 4, -10, -4);
  p.pop();
}
