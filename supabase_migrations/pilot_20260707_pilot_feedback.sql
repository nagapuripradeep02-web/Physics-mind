-- pilot_feedback — teacher feedback from the pilot review site (feedback pill widget).
-- APPLY TO THE PILOT PROJECT (physicsmind-pilot / jqbnmltsupnnbuvqgkix), NOT the dev project.
-- Same RLS shape as pilot_events: authenticated insert-own-only, no select
-- (teachers write-only; founder reads via dashboard/service role).

create table pilot_feedback (
  id uuid primary key default gen_random_uuid(),
  professor_id uuid not null default auth.uid() references auth.users(id),
  session_id text,
  concept_id text,
  state_id text,
  page text,
  mood text check (mood in ('confusing','okay','great','broken')),
  text text check (char_length(text) <= 2000),
  client_ts timestamptz,
  created_at timestamptz not null default now()
);

alter table pilot_feedback enable row level security;

create policy "authenticated insert own" on pilot_feedback
  for insert to authenticated with check (professor_id = auth.uid());
