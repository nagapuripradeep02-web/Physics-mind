import type { P5Instance, LabelSpec } from '../types';
import { hexToRgb } from '../layout';

export function drawLabel(p: P5Instance, spec: LabelSpec): void {
  if (!spec.position) return; // position resolved by resolvePositions() pre-pass
  const [r, g, b] = hexToRgb(spec.color ?? '#374151');

  p.push();
  p.fill(r, g, b);
  p.noStroke();
  p.textSize(spec.font_size ?? 14);
  if (spec.bold) p.textStyle(p.BOLD);
  if (spec.italic) p.textStyle(p.ITALIC);
  p.textAlign(p.LEFT, p.TOP);
  p.text(spec.text, spec.position.x, spec.position.y);
  p.pop();
}
