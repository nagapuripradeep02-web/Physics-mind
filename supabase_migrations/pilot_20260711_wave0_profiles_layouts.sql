-- Wave 0 (2026-07-11): teacher profiles + self-serve trial + per-account rail layouts.
-- APPLY TO THE PILOT PROJECT (physicsmind-pilot / jqbnmltsupnnbuvqgkix), NOT the dev project.
--
-- Access model: FULLY PUBLIC self-serve. Google OAuth (or password) creates the auth.users
-- row, but the product opens only once a teacher_profiles row exists — and the ONLY path
-- that creates one is start_trial(). One Google identity = one profile row = one immutable
-- trial_started_at, forever: signing out and back in never resets the clock. Founder grants
-- special terms via the dashboard (update teacher_profiles set trial_days = 90 where ...).

create table if not exists public.teacher_profiles (
  professor_id     uuid primary key references auth.users(id) on delete cascade,
  display_name     text not null check (char_length(display_name) between 1 and 80),
  school           text,
  teaches          text,
  next_chapter     text,
  trial_started_at timestamptz not null default now(),
  trial_days       integer not null default 14,
  created_at       timestamptz not null default now()
);
comment on table public.teacher_profiles is
  'One row per teacher; created ONLY via start_trial(). trial_started_at never resets. Founder sets trial_days for special terms (pilot professors: 90).';

create table if not exists public.teacher_layouts (
  professor_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  concept_id   text not null,
  layout       jsonb not null,
  updated_at   timestamptz not null default now(),
  primary key (professor_id, concept_id)
);
comment on table public.teacher_layouts is
  'Per-teacher saved state-rail layout {order,hidden,names} per concept (was localStorage-only).';

alter table public.teacher_profiles enable row level security;
alter table public.teacher_layouts  enable row level security;

-- Profiles: read/update own row. NO insert policy — inserts happen only inside start_trial (definer).
create policy profiles_select_own on public.teacher_profiles
  for select to authenticated using (professor_id = auth.uid());
create policy profiles_update_own on public.teacher_profiles
  for update to authenticated using (professor_id = auth.uid()) with check (professor_id = auth.uid());

-- Layouts: full own-row access (client upserts need insert + update).
create policy layouts_select_own on public.teacher_layouts
  for select to authenticated using (professor_id = auth.uid());
create policy layouts_insert_own on public.teacher_layouts
  for insert to authenticated with check (professor_id = auth.uid());
create policy layouts_update_own on public.teacher_layouts
  for update to authenticated using (professor_id = auth.uid()) with check (professor_id = auth.uid());
create policy layouts_delete_own on public.teacher_layouts
  for delete to authenticated using (professor_id = auth.uid());

create or replace function public.start_trial(
  p_display_name text, p_school text, p_teaches text, p_next_chapter text
) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_profile teacher_profiles;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_signed_in');
  end if;
  if exists (select 1 from teacher_profiles where professor_id = v_uid) then
    return jsonb_build_object('ok', false, 'error', 'already_registered');
  end if;
  if p_display_name is null or btrim(p_display_name) = '' then
    return jsonb_build_object('ok', false, 'error', 'name_required');
  end if;

  insert into teacher_profiles (professor_id, display_name, school, teaches, next_chapter)
  values (v_uid, btrim(p_display_name), nullif(btrim(p_school), ''), nullif(btrim(p_teaches), ''),
          nullif(btrim(p_next_chapter), ''))
  returning * into v_profile;

  return jsonb_build_object('ok', true, 'profile', to_jsonb(v_profile));
exception
  when unique_violation then
    -- double-submit race: the first insert won; treat as success
    select * into v_profile from teacher_profiles where professor_id = v_uid;
    return jsonb_build_object('ok', true, 'profile', to_jsonb(v_profile));
end;
$$;

revoke all on function public.start_trial(text, text, text, text) from public;
revoke all on function public.start_trial(text, text, text, text) from anon;
grant execute on function public.start_trial(text, text, text, text) to authenticated;
