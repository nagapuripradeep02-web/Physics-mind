/**
 * Equation-evaluation helpers for the Panel B Equation Engine.
 *
 * Concept JSONs ship two equation flavours:
 *   - `equation_expr` (mathjs-style):  "N = m * 9.8 * cos(theta * PI / 180)"
 *   - `y_expr` (JS-style):             "m * 9.8 * Math.cos(theta * Math.PI / 180)"
 *
 * We normalize both into a form mathjs can consume, then call evaluate().
 * Never use `eval` or `new Function` — see CLAUDE.md §21.
 */

import { evaluate } from 'mathjs';

/**
 * Strip two patterns so the expression is safe for mathjs.evaluate():
 *   1. Leading "var = " assignment (e.g. "N = m*g" → "m*g")
 *   2. JS "Math." prefix (e.g. "Math.cos(x)" → "cos(x)")
 */
export function preprocessExpr(raw: string): string {
  let expr = raw.trim();
  expr = expr.replace(/^\s*[A-Za-z_]\w*\s*=\s*/, '');
  expr = expr.replace(/\bMath\./g, '');
  return expr;
}

/**
 * Evaluate an expression against a variable scope.
 * Returns NaN (never throws) when the expression is malformed.
 */
export function evalExpr(expr: string, scope: Record<string, number>): number {
  const preprocessed = preprocessExpr(expr);
  try {
    const result = evaluate(preprocessed, scope);
    return typeof result === 'number' && Number.isFinite(result) ? result : NaN;
  } catch {
    return NaN;
  }
}

/**
 * Evaluate a label template with inline `{expression}` tokens. Handles a
 * trailing `.toFixed(n)` on any token by stripping it, evaluating the inner
 * expression via mathjs, and reapplying `.toFixed(n)` in JS (mathjs has no
 * native `.toFixed`). Silent on eval failure — unresolved tokens are left
 * as the empty string rather than crashing the caller.
 *
 * Example: "|F| = {sqrt(H*H + V*V).toFixed(1)} N" with {H:3, V:4} → "|F| = 5.0 N".
 */
export function evalLabelTemplate(template: string, scope: Record<string, number>): string {
  if (!template) return '';
  return template.replace(/\{([^{}]+)\}/g, (_match, rawInner: string) => {
    const inner = rawInner.trim();
    const fixedMatch = inner.match(/^(.+?)\.toFixed\((\d+)\)\s*$/);
    if (fixedMatch) {
      const innerExpr = fixedMatch[1].trim();
      const digits = Number.parseInt(fixedMatch[2], 10);
      const value = evalExpr(innerExpr, scope);
      return Number.isFinite(value) ? value.toFixed(digits) : '';
    }
    const value = evalExpr(inner, scope);
    if (!Number.isFinite(value)) return '';
    return String(value);
  });
}

/**
 * Sample an equation over [xMin, xMax] at tickInterval spacing, producing the
 * (x, y) pairs Panel B needs to draw the trace.
 *
 * `scope` holds the non-x variables (e.g. `m`); `xVar` is replaced per step.
 */
export function sampleTrace(
  expr: string,
  xVar: string,
  xMin: number,
  xMax: number,
  tickInterval: number,
  scope: Record<string, number>,
): Array<{ x: number; y: number }> {
  const preprocessed = preprocessExpr(expr);
  const points: Array<{ x: number; y: number }> = [];
  if (tickInterval <= 0 || xMax < xMin) return points;

  const localScope: Record<string, number> = { ...scope };
  for (let x = xMin; x <= xMax + 1e-9; x += tickInterval) {
    const rounded = Math.round(x * 1e6) / 1e6;
    localScope[xVar] = rounded;
    let y: number;
    try {
      const raw = evaluate(preprocessed, localScope);
      y = typeof raw === 'number' && Number.isFinite(raw) ? raw : NaN;
    } catch {
      y = NaN;
    }
    points.push({ x: rounded, y });
  }
  return points;
}
