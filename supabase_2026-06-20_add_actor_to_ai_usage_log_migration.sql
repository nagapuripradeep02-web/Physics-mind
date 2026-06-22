-- 2026-06-20 — Separate founder testing from real student usage in cost tracking.
-- Additive + defaulted: existing rows AND non-voice callers get 'founder_test',
-- so nothing breaks and historical data stays valid. Filter actor='student' for
-- true cost-per-student unit economics; actor='founder_test' is your own build spend.
-- Applied to project dxwpkjfypzxrzgbevfnx on 2026-06-20.

ALTER TABLE public.ai_usage_log
  ADD COLUMN IF NOT EXISTS actor text NOT NULL DEFAULT 'founder_test';

CREATE INDEX IF NOT EXISTS ai_usage_log_actor_idx ON public.ai_usage_log (actor);

COMMENT ON COLUMN public.ai_usage_log.actor IS
  'Who generated this usage: founder_test (default, incl. all pre-existing + non-voice rows), student (real pilot/B2C user), reviewer (teacher). Filter actor=student for true cost-per-student unit economics.';
