/**
 * Resolves a concept_id to the renderer file path that should handle it.
 *
 * Mirrors resolveRendererType() in src/lib/aiSimulationGenerator.ts. Rather
 * than importing that module (which transitively loads Supabase and requires
 * env vars), this helper parses the map declarations from the source file
 * as text — keeping the checker pure and runnable without any env setup.
 *
 * Reused by scripts/check-scenarios.ts.
 */

import fs from 'fs';
import path from 'path';

export type RendererName =
  | 'circuit_live'
  | 'particle_field'
  | 'graph_interactive'
  | 'mechanics_2d'
  | 'wave_canvas'
  | 'optics_ray'
  | 'field_3d'
  | 'thermodynamics';

const KNOWN_SUFFIXES = /_(?:basic|advanced|conceptual|exam|jee|neet|definition|intro|overview)$/;

const REPO_ROOT = path.resolve(__dirname, '../../..');
const AI_SIM_GEN_PATH = path.join(REPO_ROOT, 'src', 'lib', 'aiSimulationGenerator.ts');

const VALID_RENDERERS = new Set<RendererName>([
  'circuit_live',
  'particle_field',
  'graph_interactive',
  'mechanics_2d',
  'wave_canvas',
  'optics_ray',
  'field_3d',
  'thermodynamics',
]);

/**
 * Parses a `name: Record<...> = { ... };` block starting at `startIdx`.
 * Returns key → renderer-name pairs, only if the renderer name is valid.
 */
function parseMapBlock(source: string, startIdx: number): Record<string, RendererName> {
  const braceOpen = source.indexOf('{', startIdx);
  if (braceOpen === -1) return {};

  let depth = 1;
  let braceClose = braceOpen + 1;
  while (braceClose < source.length && depth > 0) {
    const ch = source[braceClose];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    if (depth === 0) break;
    braceClose++;
  }
  if (depth !== 0) return {};

  const body = source.slice(braceOpen + 1, braceClose);
  const entryRe = /["']?([a-zA-Z_][\w]*)["']?\s*:\s*["']([a-zA-Z_][\w]*)["']/g;
  const out: Record<string, RendererName> = {};
  let m: RegExpExecArray | null;
  while ((m = entryRe.exec(body)) !== null) {
    const key = m[1];
    const value = m[2];
    if (VALID_RENDERERS.has(value as RendererName)) {
      out[key] = value as RendererName;
    }
  }
  return out;
}

let cachedMaps: {
  conceptRendererMap: Record<string, RendererName>;
  rendererMap: Record<string, RendererName>;
} | null = null;

function loadMaps(): {
  conceptRendererMap: Record<string, RendererName>;
  rendererMap: Record<string, RendererName>;
} {
  if (cachedMaps) return cachedMaps;

  const source = fs.readFileSync(AI_SIM_GEN_PATH, 'utf-8');

  const conceptStart = source.search(/export\s+const\s+CONCEPT_RENDERER_MAP\s*:/);
  const rendererStart = source.search(/export\s+const\s+RENDERER_MAP\s*:/);

  if (conceptStart === -1 || rendererStart === -1) {
    throw new Error(
      `Could not locate CONCEPT_RENDERER_MAP or RENDERER_MAP in ${AI_SIM_GEN_PATH}. ` +
        'The parser expects both to be declared as top-level `export const` with a Record<...> type annotation.',
    );
  }

  cachedMaps = {
    conceptRendererMap: parseMapBlock(source, conceptStart),
    rendererMap: parseMapBlock(source, rendererStart),
  };
  return cachedMaps;
}

/**
 * concept_id → renderer name (same 4-stage logic as aiSimulationGenerator.ts).
 */
export function resolveRendererType(conceptId: string): RendererName {
  const { conceptRendererMap, rendererMap } = loadMaps();

  if (conceptRendererMap[conceptId]) return conceptRendererMap[conceptId];
  if (rendererMap[conceptId]) return rendererMap[conceptId];

  const stripped = conceptId.replace(KNOWN_SUFFIXES, '');
  if (stripped !== conceptId) {
    if (conceptRendererMap[stripped]) return conceptRendererMap[stripped];
    if (rendererMap[stripped]) return rendererMap[stripped];
  }

  for (const [key, type] of Object.entries(rendererMap)) {
    if (conceptId.includes(key) || stripped.includes(key)) return type;
  }

  return 'particle_field';
}

const RENDERER_FILE_PATHS: Record<RendererName, string> = {
  circuit_live: path.join(REPO_ROOT, 'public', 'renderers', 'circuit_live_renderer.js'),
  particle_field: path.join(REPO_ROOT, 'src', 'lib', 'renderers', 'particle_field_renderer.ts'),
  graph_interactive: path.join(REPO_ROOT, 'src', 'lib', 'renderers', 'graph_interactive_renderer.ts'),
  mechanics_2d: path.join(REPO_ROOT, 'src', 'lib', 'renderers', 'mechanics_2d_renderer.ts'),
  wave_canvas: path.join(REPO_ROOT, 'src', 'lib', 'renderers', 'wave_canvas_renderer.ts'),
  optics_ray: path.join(REPO_ROOT, 'src', 'lib', 'renderers', 'optics_ray_renderer.ts'),
  field_3d: path.join(REPO_ROOT, 'src', 'lib', 'renderers', 'field_3d_renderer.ts'),
  thermodynamics: path.join(REPO_ROOT, 'src', 'lib', 'renderers', 'thermodynamics_renderer.ts'),
};

export function rendererFilePath(renderer: RendererName): string {
  return RENDERER_FILE_PATHS[renderer];
}
