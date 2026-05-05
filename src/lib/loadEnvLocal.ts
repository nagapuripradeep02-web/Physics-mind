/**
 * Side-effect module: load .env.local with override-on, regardless of any
 * empty-string env vars already set in the parent shell.
 *
 * Use case: tsx scripts driven by `npm run` on Node 24 sometimes inherit
 * empty-string values for keys like ANTHROPIC_API_KEY from the system env
 * (Windows persistent env, CI runners, etc.). Both Node's native
 * `--env-file=.env.local` and dotenv's default `override: false` skip those
 * keys, leaving the SDK with an unauthenticated client.
 *
 * Importing this module FIRST in a script guarantees the .env.local values
 * win over any empty/stale parent-process values. Idempotent — calling
 * config() twice is a no-op for already-set keys after the first call.
 *
 * Usage:
 *   import '@/lib/loadEnvLocal'; // MUST be the first import
 *   import { supabaseAdmin } from '@/lib/supabaseAdmin';
 *   // ... rest of imports that depend on env vars
 */
import { config } from 'dotenv';
import { resolve } from 'node:path';

config({ path: resolve(process.cwd(), '.env.local'), override: true });
