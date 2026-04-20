-- ============================================================
-- NCERT Content Cleanup — Remove Garbled / Low-Quality Rows
-- ============================================================
-- Run in Supabase SQL Editor (or psql).
-- STEP 1: Preview what will be deleted (dry run)
-- STEP 2: Execute the DELETE

-- ── STEP 1 (preview) ─────────────────────────────────────────

-- Count rows by quality signal
SELECT
    COUNT(*)                                                    AS total_rows,
    COUNT(*) FILTER (WHERE length(content_text) < 50)          AS too_short,
    COUNT(*) FILTER (WHERE content_text ~ '[^\x00-\x7F\u00C0-\u024F\u1E00-\u1EFF]') AS non_latin_unicode,
    COUNT(*) FILTER (
        WHERE (
            length(content_text) - length(replace(content_text, '?', ''))
        ) > length(content_text) * 0.05
    )                                                           AS high_replacement_chars
FROM ncert_content;

-- Preview the worst 20 garbled rows (high proportion of ? replacement chars)
SELECT
    id,
    class_level,
    chapter_name,
    length(content_text) AS char_count,
    left(content_text, 120) AS preview
FROM ncert_content
WHERE (
    length(content_text) - length(replace(content_text, '?', ''))
) > length(content_text) * 0.05
   OR length(content_text) < 50
ORDER BY char_count ASC
LIMIT 20;


-- ── STEP 2 (execute DELETE) ───────────────────────────────────
-- Uncomment and run AFTER reviewing the preview above.

/*

-- Option A: Delete only garbled rows (keeps clean existing data)
DELETE FROM ncert_content
WHERE
    -- Too short to be useful
    length(content_text) < 50

    -- High proportion of replacement characters (garbled encoding)
    OR (
        length(content_text) - length(replace(content_text, '?', ''))
    ) > length(content_text) * 0.05

    -- Null or blank content
    OR content_text IS NULL
    OR trim(content_text) = '';


-- Option B: Delete ALL rows and start fresh (use if most data is garbled)
-- TRUNCATE TABLE ncert_content RESTART IDENTITY CASCADE;


-- Verify after delete
SELECT
    class_level,
    COUNT(*) AS remaining_rows,
    AVG(length(content_text))::int AS avg_chars
FROM ncert_content
GROUP BY class_level
ORDER BY class_level;

*/


-- ── After re-embedding, verify the new data ───────────────────

-- Check embedding dimensions (should all be 768)
/*
SELECT
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE array_length(embedding, 1) = 768) AS correct_768_dim,
    COUNT(*) FILTER (WHERE array_length(embedding, 1) != 768) AS wrong_dim
FROM ncert_content;
*/

-- Spot-check similarity search still works
/*
SELECT id, class_level, chapter_name, left(content_text, 80) AS preview
FROM ncert_content
LIMIT 5;
*/
