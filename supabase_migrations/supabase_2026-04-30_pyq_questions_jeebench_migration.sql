-- ============================================================================
-- Migration paper trail: pyq_questions table + JEEBench ingest (2026-04-30, session 41)
-- ============================================================================
-- This file is DOCUMENTATION ONLY. The actual DDL was applied via Supabase MCP
-- as migration `create_pyq_questions_table` on 2026-04-30. The DDL is duplicated
-- below for offline review and rollback reference.
--
-- What landed: OSS sprint Repo #3 created the pyq_questions table (which did
-- NOT previously exist — PROGRESS.md said "empty" but the table itself was
-- never created) and seeded it with 123 physics questions from JEEBench
-- (dair-iitd/jeebench, MIT, IIT Delhi DAIR Group, JEE Advanced 2016-2023).
--
-- 768-dim Gemini embeddings on each question_text. ivfflat vector index for
-- similarity search. RLS enabled service-role-only.
--
-- Source attribution (MIT — code license; data is academic dataset):
--   Daman Arora, Himanshu Singh, Mausam, "Have LLMs Advanced Enough?
--   A Challenging Problem Solving Benchmark for Large Language Models"
--   (EMNLP 2023). https://github.com/dair-iitd/jeebench
--
-- ============================================================================
-- DDL (already applied — kept for reference)
-- ============================================================================

-- CREATE TABLE IF NOT EXISTS pyq_questions (
--   id              BIGSERIAL PRIMARY KEY,
--   source_repo     TEXT        NOT NULL,
--   external_id     TEXT,
--   exam            TEXT        NOT NULL,
--   paper           TEXT,
--   year            INT,
--   subject         TEXT        NOT NULL,
--   question_type   TEXT,
--   question_text   TEXT        NOT NULL,
--   gold_answer     TEXT,
--   options         JSONB,
--   topic_tags      TEXT[],
--   concept_ids     TEXT[],
--   difficulty      TEXT,
--   embedding       VECTOR(768),
--   license         TEXT        NOT NULL,
--   source_url      TEXT,
--   created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--   CONSTRAINT pyq_unique_source_external UNIQUE (source_repo, external_id),
--   CONSTRAINT pyq_subject_valid CHECK (subject IN ('physics', 'chemistry', 'mathematics')),
--   CONSTRAINT pyq_exam_valid    CHECK (exam IN ('jee_advanced', 'jee_mains', 'neet', 'cbse_boards', 'cbse_class_10', 'cbse_class_12'))
-- );
-- CREATE INDEX pyq_questions_subject_year_idx ON pyq_questions(subject, year DESC);
-- CREATE INDEX pyq_questions_source_repo_idx  ON pyq_questions(source_repo);
-- CREATE INDEX pyq_questions_embedding_idx    ON pyq_questions USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
-- ALTER TABLE pyq_questions ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "service_role full access" ON pyq_questions FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- VERIFICATION QUERIES — run after ingest to confirm load
-- ============================================================================
SELECT year, paper, COUNT(*) AS questions
FROM pyq_questions
WHERE source_repo = 'jeebench'
GROUP BY year, paper
ORDER BY year, paper;

SELECT question_type, COUNT(*)
FROM pyq_questions
WHERE source_repo = 'jeebench'
GROUP BY question_type
ORDER BY 2 DESC;

-- ============================================================================
-- ROLLBACK (if ingest needs to be redone)
-- ============================================================================
-- DELETE FROM pyq_questions WHERE source_repo = 'jeebench';
-- (Or to drop the entire table: DROP TABLE pyq_questions CASCADE; — but other
--  sources may have already seeded it by then.)
-- ============================================================================
