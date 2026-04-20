-- Migration: add dual-panel columns to simulation_cache
-- Run in Supabase SQL Editor

ALTER TABLE simulation_cache
    ADD COLUMN IF NOT EXISTS secondary_sim_html text,
    ADD COLUMN IF NOT EXISTS concept_id text;
