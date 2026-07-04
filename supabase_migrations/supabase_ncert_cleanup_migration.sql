-- ═══════════════════════════════════════════════════
-- FIX 2 — NCERT CONTENT CLEANUP MIGRATION
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════

-- ─────────────────────────────────────────
-- Part 2A — Delete broken DC Pandey chunks (merged words)
-- ─────────────────────────────────────────
DELETE FROM ncert_content
WHERE source_book = 'dc_pandey'
  AND word_count < 15
  AND content_text ~ '[a-z][A-Z]{2,}[a-z]';

-- Verify:
-- SELECT COUNT(*) FROM ncert_content WHERE source_book = 'dc_pandey' AND word_count < 15;

-- ─────────────────────────────────────────
-- Part 2B — Delete TOC contamination chunks
-- ─────────────────────────────────────────
DELETE FROM ncert_content
WHERE content_text ILIKE '%......%'
   OR (
     content_text ~ '^\s*\d+\.\d+\s+[A-Z]'
     AND content_text ~ '\d{2,3}\s*$'
     AND LENGTH(content_text) < 300
   );

-- Verify:
-- SELECT COUNT(*) FROM ncert_content;

-- ─────────────────────────────────────────
-- Part 2C — Fix Class 10 chapter breakdown
-- ─────────────────────────────────────────

-- Light - Reflection and Refraction
UPDATE ncert_content
SET chapter_name = 'Light - Reflection and Refraction', chapter_number = 9
WHERE class_level = '10' AND source_book = 'ncert'
  AND (content_text ILIKE '%reflection%' OR content_text ILIKE '%refraction%'
    OR content_text ILIKE '%mirror%' OR content_text ILIKE '%lens%')
  AND chapter_name = 'NCERT-Class-10-Science';

-- Electricity
UPDATE ncert_content
SET chapter_name = 'Electricity', chapter_number = 11
WHERE class_level = '10' AND source_book = 'ncert'
  AND (content_text ILIKE '%ohm%' OR content_text ILIKE '%resistance%'
    OR content_text ILIKE '%electric circuit%' OR content_text ILIKE '%current%')
  AND chapter_name = 'NCERT-Class-10-Science';

-- Magnetic Effects of Electric Current
UPDATE ncert_content
SET chapter_name = 'Magnetic Effects of Electric Current', chapter_number = 12
WHERE class_level = '10' AND source_book = 'ncert'
  AND (content_text ILIKE '%magnetic field%' OR content_text ILIKE '%electromagnet%'
    OR content_text ILIKE '%motor%' OR content_text ILIKE '%generator%')
  AND chapter_name = 'NCERT-Class-10-Science';

-- Verify:
-- SELECT chapter_name, COUNT(*) FROM ncert_content WHERE class_level = '10' GROUP BY chapter_name;

-- ─────────────────────────────────────────
-- Part 2D — Fix Class 11 NCERT chapter_number NULLs
-- ─────────────────────────────────────────
UPDATE ncert_content SET chapter_number = 1 WHERE class_level = '11' AND source_book = 'ncert' AND chapter_name = 'Physical World';
UPDATE ncert_content SET chapter_number = 2 WHERE class_level = '11' AND source_book = 'ncert' AND chapter_name = 'Units and Measurements';
UPDATE ncert_content SET chapter_number = 3 WHERE class_level = '11' AND source_book = 'ncert' AND chapter_name = 'Motion in a Straight Line';
UPDATE ncert_content SET chapter_number = 4 WHERE class_level = '11' AND source_book = 'ncert' AND chapter_name = 'Motion in a Plane';
UPDATE ncert_content SET chapter_number = 5 WHERE class_level = '11' AND source_book = 'ncert' AND chapter_name = 'Laws of Motion';
UPDATE ncert_content SET chapter_number = 6 WHERE class_level = '11' AND source_book = 'ncert' AND chapter_name = 'Work, Energy and Power';
UPDATE ncert_content SET chapter_number = 7 WHERE class_level = '11' AND source_book = 'ncert' AND chapter_name = 'System of Particles and Rotational Motion';
UPDATE ncert_content SET chapter_number = 8 WHERE class_level = '11' AND source_book = 'ncert' AND chapter_name = 'Gravitation';
UPDATE ncert_content SET chapter_number = 9 WHERE class_level = '11' AND source_book = 'ncert' AND chapter_name = 'Mechanical Properties of Solids';
UPDATE ncert_content SET chapter_number = 10 WHERE class_level = '11' AND source_book = 'ncert' AND chapter_name = 'Mechanical Properties of Fluids';
UPDATE ncert_content SET chapter_number = 11 WHERE class_level = '11' AND source_book = 'ncert' AND chapter_name = 'Thermal Properties of Matter';
UPDATE ncert_content SET chapter_number = 12 WHERE class_level = '11' AND source_book = 'ncert' AND chapter_name = 'Thermodynamics';
UPDATE ncert_content SET chapter_number = 13 WHERE class_level = '11' AND source_book = 'ncert' AND chapter_name = 'Kinetic Theory';
UPDATE ncert_content SET chapter_number = 14 WHERE class_level = '11' AND source_book = 'ncert' AND chapter_name = 'Oscillations';
UPDATE ncert_content SET chapter_number = 15 WHERE class_level = '11' AND source_book = 'ncert' AND chapter_name = 'Waves';

-- Verify:
-- SELECT class_level, source_book, COUNT(*) as chunks,
--   COUNT(CASE WHEN chapter_number IS NOT NULL THEN 1 END) as with_chapter_num
-- FROM ncert_content
-- GROUP BY class_level, source_book;
