-- Pilot project (physicsmind-pilot / jqbnmltsupnnbuvqgkix) — applied 2026-07-18 via MCP.
-- Marketing-site visit/click tracking + a token-gated funnel summary for the outreach loop.
-- Beacon: website/js/site-analytics.js (anon insert). Dashboard: website/admin/index.html.

create table if not exists public.site_events (
  id          bigint generated always as identity primary key,
  event_type  text not null check (event_type in ('visit','cta_click')),
  path        text,
  referrer    text,
  source      text,        -- outreach ?src= / utm_source, for per-batch attribution
  session_id  text,
  meta        jsonb,       -- e.g. {"cta":"trial"|"demo"|"form"}
  created_at  timestamptz not null default now()
);
create index if not exists site_events_created_idx on public.site_events (created_at);
alter table public.site_events enable row level security;

drop policy if exists site_events_anon_insert on public.site_events;
create policy site_events_anon_insert on public.site_events
  for insert to anon, authenticated with check (true);

-- Private config (holds the funnel dashboard token). No RLS policies => unreadable by
-- anon/authenticated; only security-definer functions and the service role can read it.
create table if not exists public.admin_config (
  key   text primary key,
  value text not null
);
alter table public.admin_config enable row level security;

insert into public.admin_config(key, value)
values ('funnel_token', replace(gen_random_uuid()::text, '-', ''))
on conflict (key) do nothing;

-- Aggregate-only funnel summary, token-gated. Returns counts, never raw rows or PII.
create or replace function public.funnel_summary(tok text, since timestamptz default '2026-07-18')
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  ok boolean;
  result json;
begin
  select exists(select 1 from admin_config where key = 'funnel_token' and value = tok) into ok;
  if not ok then
    raise exception 'unauthorized';
  end if;

  select json_build_object(
    'since', since,
    'generated_at', now(),
    'visits',          (select count(*) from site_events where event_type='visit' and created_at >= since),
    'unique_visitors', (select count(distinct session_id) from site_events where event_type='visit' and created_at >= since),
    'cta_clicks',      (select count(*) from site_events where event_type='cta_click' and created_at >= since),
    'app_clicks',      (select count(*) from site_events where event_type='cta_click' and meta->>'cta'='trial' and created_at >= since),
    'demo_clicks',     (select count(*) from site_events where event_type='cta_click' and meta->>'cta'='demo'  and created_at >= since),
    'form_submits',    (select count(*) from site_events where event_type='cta_click' and meta->>'cta'='form'  and created_at >= since),
    'signups',         (select count(*) from teacher_profiles where created_at >= since),
    'active_users',    (select count(distinct professor_id) from pilot_events where created_at >= since),
    'by_source', (
      select coalesce(json_agg(row_to_json(s) order by (s).visits desc), '[]'::json) from (
        select coalesce(nullif(source,''),'(direct)') as source,
               count(*) filter (where event_type='visit')                              as visits,
               count(*) filter (where event_type='cta_click' and meta->>'cta'='trial') as app_clicks
        from site_events where created_at >= since
        group by 1
      ) s
    )
  ) into result;
  return result;
end;
$$;

revoke all on function public.funnel_summary(text, timestamptz) from public;
grant execute on function public.funnel_summary(text, timestamptz) to anon, authenticated;
