import type { P5Instance, AnnotationSpec } from '../types';
import { hexToRgb } from '../layout';

export function drawAnnotation(p: P5Instance, spec: AnnotationSpec): void {
  const [r, g, b] = hexToRgb(spec.color ?? '#6B7280');
  const pos = spec.position ?? { x: 100, y: 400 };
  const lines = spec.text.split('\n');
  const lineH = 18;
  const boxW = 220;
  const boxH = lines.length * lineH + 14;

  p.push();
  p.fill(248, 248, 255, 220);
  p.stroke(r, g, b);
  p.strokeWeight(1);
  p.rect(pos.x, pos.y, boxW, boxH, 6);

  if (spec.points_to) {
    p.stroke(r, g, b);
    p.strokeWeight(1);
    p.line(pos.x + boxW / 2, pos.y + boxH, spec.points_to.x, spec.points_to.y);
  }

  p.fill(r, g, b);
  p.noStroke();
  p.textSize(12);
  p.textAlign(p.LEFT, p.TOP);
  lines.forEach((line, i) => {
    p.text(line, pos.x + 7, pos.y + 7 + i * lineH);
  });
  p.pop();
}
