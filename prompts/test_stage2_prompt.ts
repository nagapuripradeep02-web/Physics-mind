/**
 * test_stage2_prompt.ts
 *
 * Calls Claude Sonnet with the Stage-2 circuit config writer prompt and
 * asks it to generate a SimulationConfig for Ohm's Law (series, Class 12, Board).
 *
 * Run:
 *   npx tsx prompts/test_stage2_prompt.ts
 *
 * Requires ANTHROPIC_API_KEY in your environment.
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import type { SimulationConfig } from '../public/renderers/circuit_live_renderer_schema';

// ── Load system prompt ────────────────────────────────────────────────────────

const systemPromptPath = path.join(__dirname, 'stage2_circuit_config_writer.txt');
const systemPrompt = fs.readFileSync(systemPromptPath, 'utf-8');

// ── User message ──────────────────────────────────────────────────────────────

const USER_MESSAGE = `
Concept: Ohm's Law — series circuit
Topology hint: series
Class: 12
Mode: board
`;

// ── Anthropic client ──────────────────────────────────────────────────────────

const client = new Anthropic();

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Stage-2 Circuit Config Writer — Test Run ===');
  console.log('Concept: Ohm\'s Law — series circuit, Class 12, Board exam');
  console.log('Model  : claude-sonnet-4-6');
  console.log('');

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      { role: 'user', content: USER_MESSAGE.trim() },
    ],
  });

  // Extract text content
  const rawText = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('');

  console.log('--- Raw response ---');
  console.log(rawText);
  console.log('');

  // ── Parse and validate ────────────────────────────────────────────────────

  let parsed: SimulationConfig;
  try {
    parsed = JSON.parse(rawText);
  } catch (err) {
    console.error('❌  JSON parse failed:', (err as Error).message);
    console.error('    The model returned non-JSON output — check system prompt.');
    process.exit(1);
  }

  console.log('--- Structural validation ---');

  const issues: string[] = [];

  // Top-level keys
  if (!parsed.circuit)  issues.push('Missing top-level key: circuit');
  if (!parsed.states)   issues.push('Missing top-level key: states');

  // Circuit
  if (parsed.circuit) {
    const validTopologies = ['series', 'parallel', 'bridge', 'ladder', 'custom'];
    if (!validTopologies.includes(parsed.circuit.topology)) {
      issues.push(`Invalid topology: "${parsed.circuit.topology}"`);
    }
    if (!Array.isArray(parsed.circuit.nodes) || parsed.circuit.nodes.length === 0) {
      issues.push('circuit.nodes must be a non-empty array');
    }
    if (!Array.isArray(parsed.circuit.components) || parsed.circuit.components.length === 0) {
      issues.push('circuit.components must be a non-empty array');
    }

    const validTypes = ['wire','resistor','battery','capacitor','ammeter','voltmeter','galvanometer','switch','bulb'];
    const nodeSet = new Set(parsed.circuit.nodes);
    const compIds = new Set<string>();

    (parsed.circuit.components || []).forEach((c, i) => {
      if (!c.id)   issues.push(`Component[${i}] missing id`);
      if (!c.type) issues.push(`Component[${i}] missing type`);
      if (!c.from) issues.push(`Component[${i}] missing from`);
      if (!c.to)   issues.push(`Component[${i}] missing to`);
      if (c.id) compIds.add(c.id);
      if (c.type && !validTypes.includes(c.type)) {
        issues.push(`Component[${i}] has invalid type: "${c.type}"`);
      }
      if (c.from && !nodeSet.has(c.from)) {
        issues.push(`Component[${i}] from="${c.from}" not in circuit.nodes`);
      }
      if (c.to && !nodeSet.has(c.to)) {
        issues.push(`Component[${i}] to="${c.to}" not in circuit.nodes`);
      }
    });

    // States
    const requiredStates = ['STATE_1', 'STATE_2', 'STATE_3', 'STATE_4'];
    requiredStates.forEach((sn) => {
      if (!parsed.states[sn]) {
        issues.push(`Missing state: ${sn}`);
        return;
      }
      const s = parsed.states[sn];
      const stateFields = [
        'current_flowing', 'caption', 'visible_components',
        'spotlight', 'show_values', 'show_voltage_drops', 'slider_active',
      ];
      stateFields.forEach((f) => {
        if (!(f in s)) issues.push(`${sn} missing field: ${f}`);
      });

      // spotlight references valid component
      if (s.spotlight && !compIds.has(s.spotlight)) {
        issues.push(`${sn}.spotlight="${s.spotlight}" not a known component id`);
      }
      // visible_components references valid components
      if (Array.isArray(s.visible_components)) {
        s.visible_components.forEach((vc) => {
          if (!compIds.has(vc)) issues.push(`${sn}.visible_components includes unknown id "${vc}"`);
        });
      }
      // current_values references valid components
      if (s.current_values) {
        Object.keys(s.current_values).forEach((k) => {
          if (!compIds.has(k)) issues.push(`${sn}.current_values has unknown id "${k}"`);
        });
      }
      // slider
      if (s.slider_active) {
        if (!['V','R'].includes(s.slider_variable || '')) {
          issues.push(`${sn}.slider_variable must be "V" or "R", got "${s.slider_variable}"`);
        }
        if (s.slider_min === undefined) issues.push(`${sn} slider_active=true but missing slider_min`);
        if (s.slider_max === undefined) issues.push(`${sn} slider_active=true but missing slider_max`);
        if (s.slider_default === undefined) issues.push(`${sn} slider_active=true but missing slider_default`);
      }
    });
  }

  // Formula anchor (optional but validate if present)
  if (parsed.formula_anchor) {
    const fa = parsed.formula_anchor;
    if (!fa.formula_string) issues.push('formula_anchor missing formula_string');
    if (!fa.variables || typeof fa.variables !== 'object') issues.push('formula_anchor missing variables');
    if (!fa.state_highlights || typeof fa.state_highlights !== 'object') issues.push('formula_anchor missing state_highlights');
  }

  if (issues.length === 0) {
    console.log('✅  All validation checks passed!');
  } else {
    console.log(`⚠️   ${issues.length} issue(s) found:`);
    issues.forEach((iss) => console.log(`    • ${iss}`));
  }

  // ── Pretty-print the parsed config ───────────────────────────────────────

  console.log('');
  console.log('--- Parsed SimulationConfig (pretty) ---');
  console.log(JSON.stringify(parsed, null, 2));

  // ── Usage stats ───────────────────────────────────────────────────────────

  console.log('');
  console.log('--- Token usage ---');
  console.log(`  Input : ${response.usage.input_tokens}`);
  console.log(`  Output: ${response.usage.output_tokens}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
