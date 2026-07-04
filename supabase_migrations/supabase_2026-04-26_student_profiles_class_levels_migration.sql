-- Phase F slice 1 — multi-class onboarding support.
-- Adds class_levels INTEGER[] column to student_profiles so the catalog
-- can filter chapters by the student's selected class(es).
-- The legacy `class` text column ("Class 10/11/12") is preserved for
-- back-compat with any code path that still reads it.
--
-- Idempotent: ADD COLUMN IF NOT EXISTS + UPDATE WHERE class_levels IS NULL.

ALTER TABLE student_profiles
    ADD COLUMN IF NOT EXISTS class_levels INTEGER[];

-- Backfill existing rows by parsing "Class NN" → [NN]
UPDATE student_profiles
   SET class_levels = ARRAY[
       CAST(REGEXP_REPLACE(class, '^Class\s*', '', 'i') AS INTEGER)
   ]
 WHERE class_levels IS NULL
   AND class IS NOT NULL
   AND class ~ '^Class\s*\d+$';
