/**
 * ESM-safe seeder that avoids ts-node/tsx/CJS conflicts.
 * Uses the Supabase REST API directly via fetch (available in Node 18+).
 * Run: node src/scripts/seed-concepts-runner.mjs
 */
import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Read .env.local manually (no dotenv dependency needed) ──
const envPath = join(__dirname, '../../.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = Object.fromEntries(
    envContent
        .split('\n')
        .filter(line => line.includes('=') && !line.startsWith('#'))
        .map(line => {
            const [key, ...rest] = line.split('=');
            return [key.trim(), rest.join('=').trim()];
        })
);

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL'];
const SERVICE_KEY = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

// ── Inline the 5 concepts (avoids any TS import) ──
const require = createRequire(import.meta.url);

async function upsert(concept) {
    const url = `${SUPABASE_URL}/rest/v1/verified_concepts?on_conflict=concept_slug`;
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Prefer': 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify(concept),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`${res.status}: ${err}`);
    }
}


// ── Pull the compiled JS concept data by transpiling on the fly ──
// We read the TS file, strip TS-specific syntax, eval with a shim
async function loadConcepts() {
    const tsFile = join(__dirname, '../data/verified-concepts-seed.ts');
    let src = readFileSync(tsFile, 'utf-8');

    // Strip TypeScript interface block and type annotations
    src = src
        .replace(/export interface[\s\S]*?\n\}/m, '')   // remove interface
        .replace(/: VerifiedConcept\[\]/g, '')           // remove type annotation
        .replace(/export const /g, 'const ')             // make it capturable
        .replace(/: string\[\]/g, '')
        .replace(/: string/g, '')
        .replace(/: boolean/g, '')
        .replace(/: \{ latex: string; meaning: string \}\[\]/g, '')
        + '\nmodule.exports = { VERIFIED_CONCEPTS };';

    const tmp = join(__dirname, '../../.tmp-seed.cjs');
    const { writeFileSync, unlinkSync } = await import('fs');
    writeFileSync(tmp, src);
    try {
        const mod = require(tmp);
        return mod.VERIFIED_CONCEPTS;
    } finally {
        try { unlinkSync(tmp); } catch { /* ignore */ }
    }
}

async function main() {
    console.log('Loading concepts...');
    const concepts = await loadConcepts();
    console.log(`Seeding ${concepts.length} concepts to ${SUPABASE_URL}...\n`);

    for (const concept of concepts) {
        try {
            await upsert(concept);
            console.log(`✓ ${concept.concept_name}`);
        } catch (e) {
            console.error(`✗ ${concept.concept_slug}: ${e.message}`);
        }
    }

    console.log('\nSeeding complete. Check Supabase verified_concepts table.');
}

main().catch(err => { console.error(err); process.exit(1); });
