-- ============================================================
-- PhysicsMind — Supabase Schema
-- Run this entire file in the Supabase SQL Editor.
-- ============================================================

-- ── 1. Student Profiles ─────────────────────────────────────
-- One row per student session (keyed by a UUID the browser generates
-- on first visit and stores in a short-lived cookie or query param).
-- No auth required — we use an anonymous session_id.

create table if not exists student_profiles (
    id              uuid primary key default gen_random_uuid(),
    session_id      text unique not null,     -- anonymous browser session key
    name            text not null default '',
    class           text not null default 'Class 11',
    board           text not null default 'CBSE',
    goal            text not null default 'JEE',
    first_topic     text not null default '',
    onboarding_complete boolean not null default false,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

-- Auto-update updated_at on every row change
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger student_profiles_updated_at
before update on student_profiles
for each row execute procedure update_updated_at();


-- ── 2. Concept Entries ──────────────────────────────────────
-- One row per concept the student has interacted with.

create table if not exists concepts (
    id              text not null,            -- slug like "kirchhoffs-current-law-12"
    session_id      text not null references student_profiles(session_id) on delete cascade,
    name            text not null,
    concept_class   text not null,
    subject         text not null,
    status          text not null default 'needs_review'
                    check (status in ('understood', 'needs_review')),
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),
    primary key (id, session_id)
);

create trigger concepts_updated_at
before update on concepts
for each row execute procedure update_updated_at();

create index if not exists concepts_session_idx on concepts(session_id);


-- ── 3. Module Progress ──────────────────────────────────────
-- Tracks the student's best score (0–100) per module.

create table if not exists module_progress (
    session_id      text not null references student_profiles(session_id) on delete cascade,
    module_id       integer not null,
    score           integer not null default 0 check (score between 0 and 100),
    updated_at      timestamptz not null default now(),
    primary key (session_id, module_id)
);

create trigger module_progress_updated_at
before update on module_progress
for each row execute procedure update_updated_at();


-- ── 4. AI Usage Log (cost dashboard) ───────────────────────
-- Populated automatically by the API layer (usageLogger.ts).

create table if not exists ai_usage_log (
    id                  bigserial primary key,
    created_at          timestamptz not null default now(),
    task_type           text,
    provider            text,
    model               text,
    estimated_cost_usd  numeric(10,8) default 0,
    input_chars         integer default 0,
    output_chars        integer default 0,
    latency_ms          integer default 0,
    session_id          text,
    metadata            jsonb
);


-- ── 5. Row Level Security ───────────────────────────────────
-- We use the service-role key server-side, so RLS is advisory here.
-- Enable it + allow the service role unrestricted access.

alter table student_profiles   enable row level security;
alter table concepts            enable row level security;
alter table module_progress     enable row level security;
alter table ai_usage_log        enable row level security;

-- Service-role bypass (Next.js API routes use this key)
create policy "service_role full access" on student_profiles
    for all using (true) with check (true);

create policy "service_role full access" on concepts
    for all using (true) with check (true);

create policy "service_role full access" on module_progress
    for all using (true) with check (true);

create policy "service_role full access" on ai_usage_log
    for all using (true) with check (true);


-- ── 6. Bookmarks ────────────────────────────────────────────
-- Stores saved AI responses and bookmarked MCQ questions.
-- user_id = Supabase auth UID (or null for anonymous localStorage fallback).

create table if not exists bookmarks (
    id          uuid primary key default gen_random_uuid(),
    user_id     text not null,
    type        text not null check (type in ('response', 'mcq_question')),
    title       text,
    content     jsonb not null,           -- full saved data (response text or MCQ json)
    topic       text,                     -- auto-detected topic label
    exam        text,                     -- for MCQs: which exam (JEE Main, NEET, etc.)
    difficulty  text,                     -- easy / medium / hard
    section     text,                     -- conceptual / competitive / solver
    created_at  timestamptz not null default now()
);

create index if not exists bookmarks_user_idx on bookmarks(user_id);
create index if not exists bookmarks_type_idx  on bookmarks(type);

alter table bookmarks enable row level security;

create policy "service_role full access" on bookmarks
    for all using (true) with check (true);


-- ── 7. Conceptual Chats ───────────────────────────────────
create table if not exists conceptual_chats (
    id          uuid primary key default gen_random_uuid(),
    user_id     text not null,
    title       text not null default 'New Chat',
    messages    jsonb not null default '[]',
    mode        text not null default 'both' check (mode in ('competitive','board','both')),
    exam        text default 'JEE Main',
    keywords    text[] default '{}',
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);
create index if not exists conceptual_chats_user_idx on conceptual_chats(user_id);
drop trigger if exists conceptual_chats_updated_at on conceptual_chats;
create trigger conceptual_chats_updated_at before update on conceptual_chats
    for each row execute procedure update_updated_at();
alter table conceptual_chats enable row level security;
drop policy if exists "service_role full access" on conceptual_chats;
create policy "service_role full access" on conceptual_chats for all using (true) with check (true);


-- ── 8. Problem Chats ──────────────────────────────────────
create table if not exists problem_chats (
    id          uuid primary key default gen_random_uuid(),
    user_id     text not null,
    title       text not null default 'New Problem',
    messages    jsonb not null default '[]',
    mode        text not null default 'both' check (mode in ('competitive','board','both')),
    visual_on   boolean not null default true,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);
create index if not exists problem_chats_user_idx on problem_chats(user_id);
drop trigger if exists problem_chats_updated_at on problem_chats;
create trigger problem_chats_updated_at before update on problem_chats
    for each row execute procedure update_updated_at();
alter table problem_chats enable row level security;
drop policy if exists "service_role full access" on problem_chats;
create policy "service_role full access" on problem_chats for all using (true) with check (true);


-- ── 9. Chat Feedback (confidence meter) ──────────────────
create table if not exists chat_feedback (
    id          bigserial primary key,
    user_id     text not null,
    chat_id     uuid,
    message_idx integer,
    rating      integer not null check (rating between 1 and 5),
    created_at  timestamptz not null default now()
);
alter table chat_feedback enable row level security;
drop policy if exists "service_role full access" on chat_feedback;
create policy "service_role full access" on chat_feedback for all using (true) with check (true);


-- ── 10. Verified Concepts Library ────────────────────────────
-- Pre-written, physics-verified concept explanations.
-- Seeded from src/data/verified-concepts-seed.ts via npm run seed:concepts

create table if not exists verified_concepts (
    concept_slug            text primary key,
    concept_name            text not null,
    chapter                 text not null,
    class_level             text[] not null default '{}',
    trigger_keywords        text[] not null default '{}',
    full_content_competitive text not null default '',
    full_content_board      text not null default '',
    key_equations           jsonb not null default '[]',
    common_mistakes         text[] not null default '{}',
    physics_verified        boolean not null default false,
    created_at              timestamptz not null default now(),
    updated_at              timestamptz not null default now()
);

create index if not exists verified_concepts_chapter_idx on verified_concepts(chapter);
create index if not exists verified_concepts_verified_idx on verified_concepts(physics_verified);

drop trigger if exists verified_concepts_updated_at on verified_concepts;
create trigger verified_concepts_updated_at
before update on verified_concepts
for each row execute procedure update_updated_at();

alter table verified_concepts enable row level security;
drop policy if exists "service_role full access" on verified_concepts;
create policy "service_role full access" on verified_concepts
    for all using (true) with check (true);


-- ── 11. Response Cache ────────────────────────────────────────
-- Caches AI-generated responses keyed by normalized query.
-- Populated automatically by queryRouter.ts after Tier 3 generation.
-- fact_checked = true means Sonnet verified the physics before caching.

create table if not exists response_cache (
    id                  bigserial primary key,
    query_normalized    text unique not null,   -- lowercased, stripped query
    query_keywords      text[] not null default '{}',
    response_competitive text not null default '',
    response_board      text not null default '',
    fact_checked        boolean not null default false,
    served_count        integer not null default 0,
    invalidated         boolean not null default false,  -- set true to force re-generation
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now()
);

create index if not exists response_cache_normalized_idx on response_cache(query_normalized);
create index if not exists response_cache_valid_idx on response_cache(invalidated);

drop trigger if exists response_cache_updated_at on response_cache;
create trigger response_cache_updated_at
before update on response_cache
for each row execute procedure update_updated_at();

alter table response_cache enable row level security;
drop policy if exists "service_role full access" on response_cache;
create policy "service_role full access" on response_cache
    for all using (true) with check (true);

