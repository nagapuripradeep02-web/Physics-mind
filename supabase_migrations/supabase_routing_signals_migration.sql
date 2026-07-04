-- Migration: concept_routing_signals table
-- Stores per-concept routing overrides: trigger phrases that force specific scope/simulation_needed values.
-- Populated by compileRoutingSignals.ts build script from physics_constants JSONs.

CREATE TABLE IF NOT EXISTS concept_routing_signals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  concept_id text UNIQUE NOT NULL,
  trigger_phrases text[] DEFAULT '{}',
  default_scope text DEFAULT 'local' CHECK (default_scope IN ('micro', 'local', 'global')),
  default_simulation_needed boolean DEFAULT true,
  force_scope text CHECK (force_scope IS NULL OR force_scope IN ('micro', 'local', 'global')),
  force_simulation_needed boolean,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for concept_id lookups
CREATE INDEX IF NOT EXISTS idx_routing_signals_concept_id
ON concept_routing_signals (concept_id);

-- GIN index for trigger phrase array containment/overlap queries
CREATE INDEX IF NOT EXISTS idx_routing_signals_trigger_phrases
ON concept_routing_signals USING GIN (trigger_phrases);
