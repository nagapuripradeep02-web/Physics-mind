import type { P5Instance, PrimitiveSpec } from '../types';
import type { PhysicsResult } from '../../physicsEngine/types';

export function drawComparisonPanel(
  p: P5Instance,
  spec: { left_label?: string; right_label?: string; left_scene?: PrimitiveSpec[]; right_scene?: PrimitiveSpec[] },
  physics: PhysicsResult,
  renderSubScene: (p: P5Instance, prims: PrimitiveSpec[], physics: PhysicsResult, offsetX: number, offsetY: number) => void
): void {
  const panelW = 330;
  const panelH = 280;
  const leftX = 30;
  const rightX = 390;
  const topY = 80;

  p.push();
  p.noFill();
  p.stroke(200);
  p.strokeWeight(1);
  p.rect(leftX, topY, panelW, panelH, 6);
  p.rect(rightX, topY, panelW, panelH, 6);

  p.fill(80);
  p.noStroke();
  p.textSize(13);
  p.textAlign(p.CENTER, p.BOTTOM);
  if (spec.left_label) p.text(spec.left_label, leftX + panelW / 2, topY - 4);
  if (spec.right_label) p.text(spec.right_label, rightX + panelW / 2, topY - 4);
  p.pop();

  if (spec.left_scene) renderSubScene(p, spec.left_scene, physics, leftX + 20, topY + 20);
  if (spec.right_scene) renderSubScene(p, spec.right_scene, physics, rightX + 20, topY + 20);
}
