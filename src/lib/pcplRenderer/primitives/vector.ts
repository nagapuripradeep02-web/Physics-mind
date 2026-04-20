import type { P5Instance, VectorSpec } from '../types';
import { hexToRgb } from '../layout';

export function drawVector(p: P5Instance, spec: VectorSpec): void {
  const [r, g, b] = hexToRgb(spec.color ?? '#8B5CF6');
  const { from, to } = spec;

  p.push();
  p.stroke(r, g, b);
  p.strokeWeight(2);
  p.fill(r, g, b);

  if (spec.style === 'dashed') {
    drawDashedLine(p, from.x, from.y, to.x, to.y);
  } else {
    p.line(from.x, from.y, to.x, to.y);
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const headLen = 10;
    p.translate(to.x, to.y);
    p.rotate(angle);
    p.triangle(0, 0, -headLen, 4, -headLen, -4);
  }

  if (spec.label) {
    p.fill(r, g, b);
    p.noStroke();
    p.textSize(11);
    p.textAlign(p.CENTER, p.BOTTOM);
    p.text(spec.label, (from.x + to.x) / 2, (from.y + to.y) / 2 - 4);
  }
  p.pop();
}

function drawDashedLine(p: P5Instance, x1: number, y1: number, x2: number, y2: number, dashLen = 8): void {
  const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const steps = Math.max(1, Math.floor(dist / (dashLen * 2)));
  const dx = (x2 - x1) / (steps * 2);
  const dy = (y2 - y1) / (steps * 2);
  for (let i = 0; i < steps; i++) {
    const sx = x1 + i * 2 * dx;
    const sy = y1 + i * 2 * dy;
    p.line(sx, sy, sx + dx, sy + dy);
  }
}
