import type { P5Instance, MarkBadgeSpec } from '../types';
import { hexToRgb } from '../layout';

const BADGE_WIDTH = 110;
const BADGE_HEIGHT = 32;
const BADGE_CORNER = 6;
const DEFAULT_COLOR = '#F59E0B';

export function drawMarkBadge(p: P5Instance, spec: MarkBadgeSpec): void {
  if (!spec.position) return;
  const [fr, fg, fb] = hexToRgb(spec.color ?? DEFAULT_COLOR);

  const pluralSuffix = spec.mark_value === 1 ? '' : 's';
  const text = spec.text ?? `+${spec.mark_value} mark${pluralSuffix}`;

  p.push();
  p.fill(fr, fg, fb, 220);
  p.stroke(fr, fg, fb);
  p.strokeWeight(1.5);
  p.rect(spec.position.x, spec.position.y, BADGE_WIDTH, BADGE_HEIGHT, BADGE_CORNER);

  p.noStroke();
  p.fill(30, 30, 30);
  p.textSize(13);
  p.textStyle(p.BOLD);
  p.textAlign(p.CENTER, p.CENTER);
  p.text(
    text,
    spec.position.x + BADGE_WIDTH / 2,
    spec.position.y + BADGE_HEIGHT / 2
  );
  p.pop();
}
