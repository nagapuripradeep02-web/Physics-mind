import type { P5Instance, FormulaBoxSpec } from '../types';
import { hexToRgb } from '../layout';

export function drawFormulaBox(p: P5Instance, spec: FormulaBoxSpec): void {
  if (!spec.position) return; // position resolved by resolvePositions() pre-pass
  const [r, g, b] = hexToRgb(spec.border_color ?? '#6B7280');
  const lines = spec.sub_formula ? [spec.formula, spec.sub_formula] : [spec.formula];
  const boxW = 200;
  const lineH = 20;
  const boxH = lines.length * lineH + 16;
  const { x, y } = spec.position;

  p.push();
  p.fill(255, 255, 255, 230);
  p.stroke(r, g, b);
  p.strokeWeight(1.5);
  p.rect(x, y, boxW, boxH, 4);

  p.fill(30);
  p.noStroke();
  p.textSize(13);
  p.textAlign(p.LEFT, p.TOP);
  lines.forEach((line, i) => {
    p.text(line, x + 8, y + 8 + i * lineH);
  });
  p.pop();
}
