import type { P5Instance, DerivationStepSpec } from '../types';
import { hexToRgb } from '../layout';

const HANDWRITING_CPS = 28;
const FADE_MS = 400;
const DEFAULT_FONT_SIZE = 15;
const DEFAULT_COLOR = '#1F2937';

export function drawDerivationStep(
  p: P5Instance,
  spec: DerivationStepSpec,
  elapsedMs?: number
): void {
  if (!spec.position) return;
  const [r, g, b] = hexToRgb(spec.color ?? DEFAULT_COLOR);
  const size = spec.font_size ?? DEFAULT_FONT_SIZE;

  let displayText = spec.text;
  let alpha = 255;

  if (typeof elapsedMs === 'number' && elapsedMs >= 0) {
    const mode = spec.animate_in ?? 'none';
    if (mode === 'handwriting') {
      const totalChars = spec.text.length;
      const charsToShow = Math.min(
        totalChars,
        Math.floor((elapsedMs / 1000) * HANDWRITING_CPS)
      );
      displayText = spec.text.slice(0, charsToShow);
    } else if (mode === 'fade_in') {
      alpha = Math.min(255, Math.max(0, (elapsedMs / FADE_MS) * 255));
    }
  }

  p.push();
  p.noStroke();
  p.fill(r, g, b, alpha);
  p.textSize(size);
  p.textAlign(p.LEFT, p.TOP);
  p.text(displayText, spec.position.x, spec.position.y);
  p.pop();
}
