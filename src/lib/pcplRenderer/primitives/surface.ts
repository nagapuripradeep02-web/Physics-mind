import type { P5Instance, SurfaceSpec } from '../types';

export function drawSurface(p: P5Instance, spec: SurfaceSpec): void {
  const { position, length, orientation, angle = 0, texture = 'smooth', label } = spec;

  p.push();
  p.stroke(100);
  p.strokeWeight(3);

  if (orientation === 'horizontal') {
    p.line(position.x, position.y, position.x + length, position.y);
    if (texture === 'rough') drawHatching(p, position.x, position.y, length, 'horizontal');
  } else if (orientation === 'vertical') {
    p.line(position.x, position.y, position.x, position.y + length);
    if (texture === 'rough') drawHatching(p, position.x, position.y, length, 'vertical');
  } else if (orientation === 'inclined') {
    const rad = angle * Math.PI / 180;
    const endX = position.x + length * Math.cos(rad);
    const endY = position.y - length * Math.sin(rad);
    p.line(position.x, position.y, endX, endY);
  }

  if (label) {
    p.fill(80);
    p.noStroke();
    p.textSize(12);
    p.textAlign(p.LEFT, p.TOP);
    p.text(label, position.x + 4, position.y + 4);
  }
  p.pop();
}

function drawHatching(p: P5Instance, x: number, y: number, length: number, dir: 'horizontal' | 'vertical'): void {
  p.stroke(150);
  p.strokeWeight(1);
  const spacing = 12;
  const hatchLen = 8;
  const count = Math.floor(length / spacing);
  for (let i = 0; i < count; i++) {
    if (dir === 'horizontal') {
      p.line(x + i * spacing, y, x + i * spacing - hatchLen, y + hatchLen);
    } else {
      p.line(x, y + i * spacing, x + hatchLen, y + i * spacing - hatchLen);
    }
  }
}
