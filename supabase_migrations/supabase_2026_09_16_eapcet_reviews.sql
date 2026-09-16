-- EAPCET Physics finder — the Solution Reviewer (2026-09-16)
--
-- ep-review reads a photo of a student's HANDWRITTEN working for one question,
-- transcribes it line by line (the reader never corrects the page), runs the
-- $0 code checks on every line (arithmetic, does-a-line-follow, the final
-- value against the key with the exam's conventions), asks one judge on the
-- transcript (DeepSeek) and a second judge on the photo (Gemini) only on
-- doubt, and lets CODE arbitrate: an ERROR always carries the student's own
-- line; a failing arithmetic fact blocks CORRECT; disagreement is UNSURE with
-- a concrete ask (retake, or type the value at one line). The reference the
-- page is compared against is a two-solver ep_solve_cache row, an ep_solutions
-- row, or (harness only) an inline reference — the reviewer never solves.
-- Design: docs/SOLUTION_REVIEWER_ARCHITECTURE.md (master) + the plan of
-- 2026-09-16.
--
-- What is kept is the TRANSCRIPT and the verdict, never the image: the lines
-- as read, the machine facts, each judge's output, the arbiter's verdict, the
-- models and their cost. The rows are the reviewer's flywheel (how students
-- actually go wrong, line by line) and the dispute queue a human clears.
-- No FK on device_id: the harness reviews with throwaway devices.
--
-- SAFE TO RE-RUN: create-if-not-exists only. RLS on with no policies = only
-- the service role (the function) reads or writes, exactly like ep_solve_cache.

create table if not exists ep_reviews (
    id                bigint generated always as identity primary key,
    device_id         uuid not null,
    session_id        text,
    actor             text not null default 'eapcet_student',      -- eapcet_student | eapcet_team | eapcet_local | eapcet_probe
    ref_kind          text not null check (ref_kind in ('fingerprint', 'question_id', 'inline')),
    ref_key           text not null,                               -- the fingerprint, the qid, or inline:<sha16>
    attempt_no        int not null default 1,                      -- the same question by the same device: 1, 2, 3 (a typed clarification keeps its number)
    typed_final       text,                                        -- the final answer the student typed, as typed
    reader            text,                                        -- gemini | openai | deepseek
    reader_model      text,
    transcript        jsonb not null default '[]'::jsonb,          -- [{n, text, tex, calc, kind, legible}] exactly as read
    legible           numeric,                                     -- mean legibility over the non-diagram lines
    final_value_read  text,
    final_matches_key boolean,
    s2                jsonb not null default '{}'::jsonb,          -- {facts:[{line, fact, detail}], final_check:{…}}
    conventions       jsonb not null default '[]'::jsonb,          -- the exam-convention tags that applied (pct_error, g_fixed, ratio_answer)
    judge_a           jsonb,                                       -- Gemini on the photo: {status, judge, reason, model, ms, cost_usd}
    judge_b           jsonb,                                       -- DeepSeek on the transcript: the same shape
    judge_a_ran       boolean not null default false,
    escalation_reason text,                                        -- why judge A ran (escalate mode), or null
    verdict           text not null check (verdict in ('CORRECT', 'ERROR', 'UNSURE')),
    first_error_line  int,
    error_class       text,                                        -- concept | method | calculation | reading | convention | presentation
    concept_tag       text,
    what_should_be    text,
    evidence_quote    text,                                        -- the student's own line, from the transcript
    ask               text,                                        -- retake | type_value_at_line | null
    models            jsonb not null default '[]'::jsonb,          -- every model call itemised: [{stage, model, effort, ms, tokens, cost_usd, cap_hit, error}]
    cost_usd          numeric not null default 0,
    ms                int,
    disputed          boolean not null default false,
    dispute_note      text,
    disputed_at       timestamptz,
    student_next      text,                                        -- retried | clarified | disputed | null (what the student did after this verdict)
    created_at        timestamptz not null default now()
);
create index if not exists ep_reviews_device_ref_idx on ep_reviews (device_id, ref_key, created_at desc);
create index if not exists ep_reviews_verdict_idx on ep_reviews (verdict, created_at desc);
create index if not exists ep_reviews_disputed_idx on ep_reviews (created_at) where disputed;
alter table ep_reviews enable row level security;
comment on table ep_reviews is 'EAPCET finder: every handwritten working ep-review checked — the transcript as read, the machine facts, both judges, the code arbiter''s verdict and the student''s own evidence line. Never the image. The disputed rows are the review queue a human clears.';
