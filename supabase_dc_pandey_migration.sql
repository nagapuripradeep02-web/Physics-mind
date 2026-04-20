-- ============================================================
-- PhysicsMind — DC Pandey source_book migration
-- Run ONCE in the Supabase SQL Editor before ingesting DC Pandey.
--
-- What this does:
--   1. Confirms source_book column exists (backfill already done)
--   2. Adds an index on source_book for fast filtered queries
--   3. Replaces match_ncert_chunks RPC to:
--        a) accept optional filter_source_book parameter
--        b) return content_text (not the legacy 'content' column)
--           so DC Pandey rows (which only populate content_text) are found
-- ============================================================


-- ── 1. Ensure source_book column + index exist ────────────────
ALTER TABLE ncert_content
    ADD COLUMN IF NOT EXISTS source_book text DEFAULT 'ncert';

CREATE INDEX IF NOT EXISTS idx_ncert_source_book
    ON ncert_content(source_book);


-- ── 2. Backfill any NULL source_book rows ─────────────────────
--    (already done, but idempotent)
UPDATE ncert_content
SET source_book = 'ncert'
WHERE source_book IS NULL;


-- ── 3. Replace match_ncert_chunks RPC ────────────────────────
--
--  Changes vs original:
--    • Added  filter_source_book text DEFAULT NULL
--    • Returns content_text (COALESCE with legacy 'content') instead of raw 'content'
--    • WHERE clause filters by source_book when parameter is non-NULL
--
CREATE OR REPLACE FUNCTION match_ncert_chunks(
    query_embedding    vector(768),
    match_threshold    float   DEFAULT 0.70,
    match_count        int     DEFAULT 3,
    filter_class       text    DEFAULT NULL,
    filter_source_book text    DEFAULT NULL
)
RETURNS TABLE (
    content_text text,
    chapter_name text,
    section_name text,
    class_level  text,
    similarity   float
)
LANGUAGE sql STABLE
AS $$
    SELECT
        COALESCE(content_text, content, '')   AS content_text,
        COALESCE(chapter_name, 'general')     AS chapter_name,
        section_name,
        class_level,
        1 - (embedding <=> query_embedding)   AS similarity
    FROM ncert_content
    WHERE
        embedding IS NOT NULL
        AND (filter_class       IS NULL OR class_level  = filter_class)
        AND (filter_source_book IS NULL OR source_book  = filter_source_book)
        AND 1 - (embedding <=> query_embedding) > match_threshold
    ORDER BY embedding <=> query_embedding
    LIMIT match_count;
$$;


-- ── 4. Verification ────────────────────────────────────────────
SELECT source_book, COUNT(*) AS rows
FROM ncert_content
GROUP BY source_book
ORDER BY source_book;
