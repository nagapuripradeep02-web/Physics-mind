-- EAPCET Physics finder — the Solutions tab solver (2026-09-12)
--
-- ep-solve reads a photo of ONE question from any material (intake on Gemini
-- 3.5 Flash-Lite), keys it by a fingerprint of the transcribed text, and
-- solves it: a text question on DeepSeek V4.1 Flash (thinking high; max for
-- maths), a question with a drawn figure on Gemini 3.7 Flash and DeepSeek in
-- parallel with an agreement gate. The label (two_ways / once / unsure) is
-- decided by code, never by a model. docs/SOLUTION_GENERATOR_ARCHITECTURE.md
-- (master) is the design; every number there is from docs/MODEL_PROBES.md.
--
-- What is kept is the ANSWER, never the image: the transcribed question, the
-- options, the option and working each model reached, the label, the models
-- and their timings. The second student who sends the same page is served
-- from this table for the cost of the intake call.
--
-- SAFE TO RE-RUN: create-if-not-exists only. RLS on with no policies = only
-- the service role (the function) reads or writes, exactly like ep_photos.

create table if not exists ep_solve_cache (
    fingerprint    text primary key,                       -- sha256 of the normalised question text + options
    subject        text not null,                          -- physics | chemistry | maths | other
    has_figure     boolean not null default false,
    route          text not null,                          -- text | figure
    question_text  text not null,
    options        jsonb not null default '[]'::jsonb,
    option         int,                                    -- 1-4; null when the solvers disagree or the item has no options
    answer         text,                                   -- the final value as the winning solver wrote it
    working        jsonb not null default '[]'::jsonb,     -- [{step, text}] of the winning solver
    working_alt    jsonb,                                  -- {model, steps:[…]} of the other solver when the label is unsure
    label          text not null,                          -- two_ways | once | unsure
    source         text not null default 'model',
    models         jsonb not null default '[]'::jsonb,     -- [{model, effort, option, ms, cap_hit, cost_usd}]
    conventions    jsonb not null default '[]'::jsonb,
    similar_qs     jsonb not null default '[]'::jsonb,     -- related past questions (v1: empty)
    winner         text,                                   -- the model whose working is shown
    syllabus       text,                                   -- within | beyond | unchecked
    hit_count      int not null default 0,
    disputed       boolean not null default false,
    created_at     timestamptz not null default now(),
    updated_at     timestamptz not null default now()
);
create index if not exists ep_solve_cache_subject_idx on ep_solve_cache (subject, created_at desc);
alter table ep_solve_cache enable row level security;
comment on table ep_solve_cache is 'EAPCET finder: every question a student photographed and ep-solve answered, keyed by a fingerprint of the transcribed text. Never the image. The second student who sends the same page is served from here.';

create table if not exists ep_solve_reports (
    id            bigint generated always as identity primary key,
    fingerprint   text not null references ep_solve_cache(fingerprint) on delete cascade,
    device_id     uuid not null,
    option_shown  int,
    label         text,
    note          text,
    created_at    timestamptz not null default now(),
    resolved_at   timestamptz,
    resolution    text                                     -- confirmed_wrong | was_right | key_wrong | unclear
);
create index if not exists ep_solve_reports_open_idx on ep_solve_reports (created_at) where resolved_at is null;
alter table ep_solve_reports enable row level security;
comment on table ep_solve_reports is 'EAPCET finder: "this answer looks wrong" taps on ep-solve answers — the review queue a human clears. The cache row stays disputed until then.';

-- The nearest cached transcript: two reads of one printed page differ by a
-- character or two, so the exact fingerprint alone misses. ep-solve calls this
-- (trigram similarity >= 0.85, same subject, not disputed) and then requires
-- every number in the question and options to match before it serves the row,
-- so a twin question with changed numbers never hits. Applied 2026-09-11 as
-- migration eapcet_solve_lookup_trgm.
create extension if not exists pg_trgm;
create index if not exists ep_solve_cache_trgm_idx on ep_solve_cache using gin (question_text gin_trgm_ops);

create or replace function ep_solve_lookup(p_subject text, p_text text, p_min real default 0.85)
returns table (fingerprint text, sim real)
language sql
security definer
set search_path = public
as $$
    select c.fingerprint, similarity(c.question_text, p_text) as sim
      from ep_solve_cache c
     where c.subject = p_subject
       and c.disputed = false
       and c.question_text % p_text
       and similarity(c.question_text, p_text) >= p_min
     order by sim desc
     limit 1
$$;
revoke all on function ep_solve_lookup(text, text, real) from public, anon, authenticated;
comment on function ep_solve_lookup(text, text, real) is 'EAPCET finder: the nearest cached transcript of the same subject by trigram similarity (default 0.85). ep-solve then requires every number in the question to match before it serves the cached answer.';
