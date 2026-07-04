-- ============================================================
-- PhysicsMind — NCERT Content Schema Migration
-- Run this ENTIRE file in the Supabase SQL Editor.
-- Run ONCE before executing npm run extract:ncert
-- ============================================================

-- ── 0. Enable pgvector extension ─────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;

-- ── 1. Alter ncert_content table ─────────────────────────────
-- Table already exists; we add the columns needed for
-- chunked storage + vector embeddings.

ALTER TABLE ncert_content
    ADD COLUMN IF NOT EXISTS class_level    text,
    ADD COLUMN IF NOT EXISTS chapter_number integer,
    ADD COLUMN IF NOT EXISTS chapter_name   text,
    ADD COLUMN IF NOT EXISTS section_name   text,
    ADD COLUMN IF NOT EXISTS content        text,
    ADD COLUMN IF NOT EXISTS page_number    integer,
    ADD COLUMN IF NOT EXISTS chunk_index    integer,
    ADD COLUMN IF NOT EXISTS word_count     integer,
    ADD COLUMN IF NOT EXISTS embedding      vector(768),
    ADD COLUMN IF NOT EXISTS created_at     timestamptz DEFAULT now();

-- ── 2. Indexes ────────────────────────────────────────────────
-- Vector similarity index (ivfflat, cosine distance)
-- Note: Effective only after data is loaded.
-- Run: ANALYZE ncert_content; after extraction completes.
CREATE INDEX IF NOT EXISTS idx_ncert_embedding
    ON ncert_content
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Metadata filter index
CREATE INDEX IF NOT EXISTS idx_ncert_class
    ON ncert_content(class_level, chapter_number);

-- ── 3. Row Level Security ─────────────────────────────────────
ALTER TABLE ncert_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role full access" ON ncert_content;
CREATE POLICY "service_role full access" ON ncert_content
    FOR ALL USING (true) WITH CHECK (true);

-- ── 4. RPC function for vector similarity search ──────────────
CREATE OR REPLACE FUNCTION match_ncert_chunks(
    query_embedding vector(768),
    match_threshold float  DEFAULT 0.70,
    match_count     int    DEFAULT 3,
    filter_class    text   DEFAULT NULL
)
RETURNS TABLE (
    content      text,
    chapter_name text,
    section_name text,
    class_level  text,
    similarity   float
)
LANGUAGE sql STABLE
AS $$
    SELECT
        content,
        COALESCE(chapter_name, 'general') AS chapter_name,
        section_name,
        class_level,
        1 - (embedding <=> query_embedding) AS similarity
    FROM ncert_content
    WHERE
        embedding IS NOT NULL
        AND (filter_class IS NULL OR class_level = filter_class)
        AND 1 - (embedding <=> query_embedding) > match_threshold
    ORDER BY embedding <=> query_embedding
    LIMIT match_count;
$$;

-- ── 5. Verify columns ─────────────────────────────────────────
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'ncert_content'
ORDER BY ordinal_position;
