-- ============================================================================
-- Migration paper trail: OpenStax College Physics RAG ingestion (2026-04-30)
-- ============================================================================
-- This file is DOCUMENTATION ONLY. No DDL changes are needed because the
-- existing ncert_content table already supports a `source_book` text column
-- (added in supabase_dc_pandey_migration.sql, 2026-XX-XX).
--
-- What landed: OSS sprint Repo #2 ingested OpenStax College Physics
-- (philschatz/physics-book, CC-BY 3.0 Unported, ~150 markdown files,
-- Chapters 5-17 covering NCERT mechanics + thermo + waves) into ncert_content
-- with source_book = 'openstax_cp'. ~960 chunks, 768-dim Gemini embeddings.
--
-- The runtime search was extended in src/lib/ncertSearch.ts Pass 2 to fan out
-- to 'openstax_cp' alongside 'dc_pandey' and 'hc_verma' (3-way Promise.all).
-- NCERT-strong queries are unaffected (Pass 1 early-return at similarity ≥ 0.65).
--
-- Source attribution (required by CC-BY 3.0):
--   "OpenStax College Physics" by OpenStax College, used under CC BY 3.0,
--   originally accessed via https://github.com/philschatz/physics-book
--   (Copyright 2014 OpenStax College).
-- This attribution should appear in any product surface that displays
-- OpenStax-derived content (e.g., chat panel footer, about page).
--
-- ============================================================================
-- VERIFICATION QUERY — run after ingest to confirm row counts per chapter
-- ============================================================================
SELECT
    source_book,
    chapter_number,
    chapter_name,
    COUNT(*)               AS chunks,
    SUM(word_count)        AS total_words,
    MIN(chunk_index)       AS min_idx,
    MAX(chunk_index)       AS max_idx
FROM ncert_content
WHERE source_book = 'openstax_cp'
GROUP BY source_book, chapter_number, chapter_name
ORDER BY chapter_number, chapter_name;

-- ============================================================================
-- Expected result (target post-ingest): 11 NCERT chapter buckets, ~960 chunks
-- ----------------------------------------------------------------------------
--   ch 4  | Motion in a Plane                         |  ~40 chunks
--   ch 5  | Laws of Motion                            | ~200 chunks (Dynamics + Friction + Momentum)
--   ch 6  | Work, Energy and Power                    |  ~85 chunks
--   ch 7  | System of Particles and Rotational Motion | ~130 chunks (Statics + Rotational)
--   ch 8  | Gravitation                               |  ~25 chunks
--   ch 10 | Mechanical Properties of Fluids           | ~150 chunks
--   ch 11 | Thermal Properties of Matter              | ~120 chunks
--   ch 12 | Thermodynamics                            | ~100 chunks
--   ch 13 | Kinetic Theory                            |  ~25 chunks
--   ch 14 | Oscillations                              |  ~55 chunks
--   ch 15 | Waves                                     |  ~25 chunks
-- ============================================================================
-- ROLLBACK (if ingest needs to be redone from scratch):
-- DELETE FROM ncert_content WHERE source_book = 'openstax_cp';
-- ============================================================================
