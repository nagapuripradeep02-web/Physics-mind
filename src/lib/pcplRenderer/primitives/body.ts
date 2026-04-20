import type { P5Instance, BodySpec } from '../types';
import { hexToRgb } from '../layout';

export function drawBody(p: P5Instance, spec: BodySpec): void {
  const pos = spec.position ?? { x: 200, y: 200 };
  const [r, g, b] = hexToRgb(spec.fill_color ?? '#6B7280');

  p.push();
  p.fill(r, g, b, (spec.opacity ?? 1) * 255);
  if (spec.border_color) {
    const [br, bg, bb] = hexToRgb(spec.border_color);
    p.stroke(br, bg, bb);
    p.strokeWeight(spec.border_width ?? 1);
  } else {
    p.noStroke();
  }

  if (spec.rotate_deg) {
    p.translate(pos.x, pos.y);
    p.rotate(p.radians(spec.rotate_deg));
    p.translate(-pos.x, -pos.y);
  }

  if (spec.shape === 'rect' && spec.size && typeof spec.size === 'object') {
    p.rect(pos.x, pos.y, spec.size.w, spec.size.h, 4);
  } else if (spec.shape === 'circle' && typeof spec.size === 'number') {
    p.circle(pos.x, pos.y, spec.size);
  }

  if (spec.label) {
    p.fill(255);
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(12);
    const cx = spec.shape === 'rect' && typeof spec.size === 'object'
      ? pos.x + spec.size.w / 2 : pos.x;
    const cy = spec.shape === 'rect' && typeof spec.size === 'object'
      ? pos.y + spec.size.h / 2 : pos.y;
    p.text(spec.label, cx, cy);
  }
  p.pop();
}
