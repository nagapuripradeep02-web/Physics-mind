/**
 * Single source of truth for animation primitive vocabulary.
 *
 * Both the parametric renderer (which actually animates the primitives) and
 * the validate-concepts gate (which catches author typos like
 * `animation.type: "rotate_about"` that the renderer would silently no-op)
 * must agree on what's supported. Any new animation kind ships in three
 * places: this whitelist, the renderer's switch statement, and an authoring
 * Lesson note in `.agents/json_author/CLAUDE.md`.
 *
 * Renderer dispatch sites (parametric_renderer.ts):
 *   ANIMATION_TYPES   — `spec.animation.type` switches at lines 623–714
 *   ANIMATE_IN_KINDS  — `spec.animate_in` switch at lines 1811–1815
 *
 * The renderer is built as a code-as-string blob inside a template literal,
 * so it can't `import` from this module at runtime. Instead the renderer's
 * switches and these constants must be kept in sync by review — the gate is
 * the safety net.
 */

export const ANIMATION_TYPES: readonly string[] = [
    'fade_in',
    'slide_horizontal',
    'slide_when_kinetic',
    'free_fall',
    'pendulum',
    'atwood',
    'door_swing',
    'translate',
] as const;

export const ANIMATE_IN_KINDS: readonly string[] = [
    'none',
    'handwriting',
    'fade_in',
] as const;

/** Math identifiers PM_buildEvalScope auto-injects (parametric_renderer.ts:462–463). */
export const MATH_WHITELIST: readonly string[] = [
    'sqrt', 'atan2', 'atan', 'asin', 'acos', 'sin', 'cos', 'tan',
    'abs', 'min', 'max', 'pow', 'log', 'exp', 'PI', 'E',
    'round', 'floor', 'ceil', 'sign',
] as const;

/** JS reserved / built-in identifiers that may legitimately appear inside
 *  template-literal expressions like `((x).toFixed(2))` and must not be
 *  flagged as unresolved physics variables. */
export const JS_RESERVED_IDENTIFIERS: readonly string[] = [
    'return', 'true', 'false', 'null', 'undefined',
    'Math', 'String', 'Number', 'Boolean', 'Object', 'Array',
    'toFixed', 'toString', 'parseInt', 'parseFloat',
    'isFinite', 'isNaN', 'NaN', 'Infinity',
] as const;
