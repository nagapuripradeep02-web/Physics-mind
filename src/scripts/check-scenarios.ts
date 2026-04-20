/**
 * Checks that every string in a concept JSON's `available_renderer_scenarios`
 * appears as a string literal in the renderer file that will handle the concept.
 *
 * Catches the common failure mode: Sonnet picks a scenario string that the
 * renderer does not implement, so the sim silently falls back to a generic
 * state and the student sees a broken lesson.
 *
 * Algorithm:
 *   1. For each JSON in src/data/concepts/, read concept_id + available_renderer_scenarios
 *   2. Resolve renderer via CONCEPT_RENDERER_MAP (reusing logic from aiSimulationGenerator)
 *   3. Read renderer file (cached — many concepts share a renderer)
 *   4. For each scenario string, check it appears as a quoted string literal in the file
 *   5. Exit 1 if any scenario is missing (CI-ready)
 *
 * JSONs without `available_renderer_scenarios` are SKIPPED, not failed —
 * only 1/23 is populated today. Validator enforces the FIELD; this script
 * enforces the CONTENTS.
 *
 * Usage: npx tsx src/scripts/check-scenarios.ts
 */

import fs from 'fs';
import path from 'path';
import { resolveRendererType, rendererFilePath, RendererName } from './lib/rendererLookup';

const CONCEPTS_DIR = path.resolve(__dirname, '../data/concepts');

// Mirror of detectTier() from validate-concepts.ts. Kept inline to avoid cross-
// script imports; if tier detection rules change, update both callsites.
type Tier = 'atomic_v2' | 'legacy_bundled' | 'legacy_array' | 'unknown';

function stateUsesLegacyLayers(obj: Record<string, unknown>): boolean {
  const check = (states: unknown): boolean => {
    if (!states || typeof states !== 'object') return false;
    for (const state of Object.values(states)) {
      if (
        state !== null &&
        typeof state === 'object' &&
        ('physics_layer' in state || 'pedagogy_layer' in state)
      ) return true;
    }
    return false;
  };

  const epicL = obj.epic_l_path;
  if (epicL && typeof epicL === 'object' && 'states' in epicL) {
    if (check((epicL as { states?: unknown }).states)) return true;
  }

  const branches = obj.epic_c_branches;
  if (Array.isArray(branches)) {
    for (const branch of branches) {
      if (branch && typeof branch === 'object' && 'states' in branch) {
        if (check((branch as { states?: unknown }).states)) return true;
      }
    }
  }
  return false;
}

function detectTier(data: unknown): Tier {
  if (Array.isArray(data)) return 'legacy_array';
  if (data === null || typeof data !== 'object') return 'unknown';
  const obj = data as Record<string, unknown>;
  const hasRendererPair = typeof obj.renderer_pair === 'object' && obj.renderer_pair !== null;
  const hasRendererHint = typeof obj.renderer_hint === 'object' && obj.renderer_hint !== null;
  if (stateUsesLegacyLayers(obj)) return 'legacy_bundled';
  if (hasRendererHint && !hasRendererPair) return 'legacy_bundled';
  if (hasRendererPair) return 'atomic_v2';
  return 'unknown';
}

// Pathway key → which panel renderer to check against.
// Keys containing "panel_b" (including "panel_b", "panel_b_alt", etc.) route to panel_b.
// Everything else (epic_l, epic_c, micro, local, hotspot, ...) routes to panel_a.
function routePathwayToPanel(pathwayKey: string): 'panel_a' | 'panel_b' {
  return pathwayKey.toLowerCase().includes('panel_b') ? 'panel_b' : 'panel_a';
}

interface MissingScenario {
  scenario: string;
  pathway: string;
  renderer: RendererName;
}

interface UnroutableScenario {
  scenario: string;
  pathway: string;
  panel: 'panel_a' | 'panel_b';
}

interface ScenarioCheckResult {
  file: string;
  conceptId: string;
  totalScenarios: number;
  missing: MissingScenario[];
  unroutable: UnroutableScenario[];
}

interface RendererPair {
  panel_a?: unknown;
  panel_b?: unknown;
}

interface JsonWithScenarios {
  concept_id: string;
  renderer_pair?: RendererPair;
  available_renderer_scenarios?: Record<string, unknown>;
}

const VALID_RENDERER_NAMES = new Set<RendererName>([
  'circuit_live',
  'particle_field',
  'graph_interactive',
  'mechanics_2d',
  'wave_canvas',
  'optics_ray',
  'field_3d',
  'thermodynamics',
]);

function toRendererName(raw: unknown): RendererName | null {
  return typeof raw === 'string' && VALID_RENDERER_NAMES.has(raw as RendererName)
    ? (raw as RendererName)
    : null;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Returns true if `scenario` appears as a quoted string literal (single,
 * double, or backtick) anywhere in `fileContent`.
 */
function scenarioIsPresent(scenario: string, fileContent: string): boolean {
  const escaped = escapeRegExp(scenario);
  const pattern = new RegExp(`(?:"${escaped}"|'${escaped}'|\`${escaped}\`)`);
  return pattern.test(fileContent);
}

interface PathwayEntry {
  pathway: string;
  scenarios: string[];
}

function extractPathwayEntries(field: Record<string, unknown>): PathwayEntry[] {
  const out: PathwayEntry[] = [];
  for (const [pathway, value] of Object.entries(field)) {
    if (!Array.isArray(value)) continue;
    const scenarios = value.filter((v): v is string => typeof v === 'string');
    if (scenarios.length > 0) out.push({ pathway, scenarios });
  }
  return out;
}

function main(): void {
  const files = fs.readdirSync(CONCEPTS_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort();

  console.log(`\nChecking renderer scenarios across ${files.length} concept JSONs...\n`);
  console.log('='.repeat(70));

  const rendererContentCache = new Map<RendererName, string>();
  const results: ScenarioCheckResult[] = [];
  const skipped: string[] = [];
  let parseFailures = 0;

  for (const file of files) {
    const filePath = path.join(CONCEPTS_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf-8');

    let data: unknown;
    try {
      data = JSON.parse(raw);
    } catch {
      console.log(`FAIL  ${file}  (invalid JSON)`);
      parseFailures++;
      continue;
    }

    if (Array.isArray(data) || data === null || typeof data !== 'object') {
      skipped.push(`${file} (not an object)`);
      continue;
    }

    const json = data as JsonWithScenarios;

    if (!json.concept_id || typeof json.concept_id !== 'string') {
      skipped.push(`${file} (no concept_id)`);
      continue;
    }

    const tier = detectTier(data);
    if (tier !== 'atomic_v2') {
      skipped.push(`${file} (${tier})`);
      continue;
    }

    if (
      !json.available_renderer_scenarios ||
      typeof json.available_renderer_scenarios !== 'object'
    ) {
      skipped.push(file);
      continue;
    }

    const panelARenderer =
      toRendererName(json.renderer_pair?.panel_a) ?? resolveRendererType(json.concept_id);
    const panelBRenderer = toRendererName(json.renderer_pair?.panel_b);

    const loadRenderer = (renderer: RendererName): string | null => {
      const cached = rendererContentCache.get(renderer);
      if (cached !== undefined) return cached;
      try {
        const content = fs.readFileSync(rendererFilePath(renderer), 'utf-8');
        rendererContentCache.set(renderer, content);
        return content;
      } catch {
        return null;
      }
    };

    const entries = extractPathwayEntries(
      json.available_renderer_scenarios as Record<string, unknown>,
    );
    const missing: MissingScenario[] = [];
    const unroutable: UnroutableScenario[] = [];
    let totalScenarios = 0;

    for (const { pathway, scenarios } of entries) {
      const panel = routePathwayToPanel(pathway);
      const renderer = panel === 'panel_b' ? panelBRenderer : panelARenderer;

      if (!renderer) {
        for (const scenario of scenarios) unroutable.push({ scenario, pathway, panel });
        continue;
      }

      const rendererContent = loadRenderer(renderer);
      if (rendererContent === null) {
        console.log(`FAIL  ${file}[${pathway}]  — renderer file missing for ${renderer}`);
        for (const scenario of scenarios) missing.push({ scenario, pathway, renderer });
        continue;
      }

      for (const scenario of scenarios) {
        totalScenarios++;
        if (!scenarioIsPresent(scenario, rendererContent)) {
          missing.push({ scenario, pathway, renderer });
        }
      }
    }

    results.push({
      file,
      conceptId: json.concept_id,
      totalScenarios,
      missing,
      unroutable,
    });

    const hasProblems = missing.length > 0 || unroutable.length > 0;
    if (!hasProblems) {
      const pathwayLabels = entries.map((e) => `${e.pathway}→${routePathwayToPanel(e.pathway)}`).join(', ');
      console.log(`PASS  ${file}  (${totalScenarios} scenarios checked, ${pathwayLabels})`);
    } else {
      console.log(`FAIL  ${file}  (concept_id=${json.concept_id})`);
      for (const m of missing) {
        console.log(
          `  MISSING: '${m.scenario}' (pathway=${m.pathway}) — not found in ${path.basename(rendererFilePath(m.renderer))}`,
        );
      }
      for (const u of unroutable) {
        console.log(
          `  UNROUTABLE: '${u.scenario}' (pathway=${u.pathway}) — renderer_pair.${u.panel} not declared in JSON`,
        );
      }
      console.log('');
    }
  }

  console.log('='.repeat(70));
  const totalChecked = results.reduce((sum, r) => sum + r.totalScenarios, 0);
  const totalMissing = results.reduce((sum, r) => sum + r.missing.length, 0);
  const totalUnroutable = results.reduce((sum, r) => sum + r.unroutable.length, 0);
  const filesWithMissing = results.filter((r) => r.missing.length > 0).length;
  const filesWithUnroutable = results.filter((r) => r.unroutable.length > 0).length;

  console.log(`\nSummary:`);
  console.log(`  ${results.length} file(s) checked (had available_renderer_scenarios)`);
  console.log(`  ${skipped.length} file(s) skipped (no available_renderer_scenarios)`);
  if (parseFailures > 0) console.log(`  ${parseFailures} file(s) failed JSON parse`);
  console.log(`  ${totalChecked} scenario string(s) checked`);
  console.log(`  ${totalMissing} missing across ${filesWithMissing} file(s)`);
  console.log(`  ${totalUnroutable} unroutable across ${filesWithUnroutable} file(s) (renderer_pair incomplete)`);

  if (totalMissing > 0 || totalUnroutable > 0 || parseFailures > 0) process.exit(1);
}

main();
