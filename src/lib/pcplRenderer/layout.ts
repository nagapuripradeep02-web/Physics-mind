export const CANVAS_W = 760;
export const CANVAS_H = 500;

export function toCanvasY(physicsY: number, originY = CANVAS_H / 2): number {
  return originY - physicsY;
}

export function toPixels(magnitude: number, scale: number): number {
  return magnitude * scale;
}

export function resolveDrawFrom(
  drawFrom: import('./types').DrawFrom,
  body: { x: number; y: number; w: number; h: number } | null,
  origin: { x: number; y: number }
): { x: number; y: number } {
  if (typeof drawFrom === 'object') return drawFrom;
  if (!body) return origin;
  const { x, y, w, h } = body;
  switch (drawFrom) {
    case 'body_center':        return { x: x + w / 2, y: y + h / 2 };
    case 'body_top':
    case 'body_top_center':    return { x: x + w / 2, y };
    case 'body_bottom':
    case 'body_bottom_center': return { x: x + w / 2, y: y + h };
    case 'body_left':          return { x, y: y + h / 2 };
    case 'body_right':         return { x: x + w, y: y + h / 2 };
    default:                   return origin;
  }
}

export function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}
