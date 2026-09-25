-- Pilot project (physicsmind-pilot / jqbnmltsupnnbuvqgkix).
-- EAPCET interest list — the sign-up behind viditra.co/eapcet (website/eapcet.html).
-- Dashboard: website/admin/eapcet.html (same funnel_token as website/admin/index.html).
--
-- The table holds students' names and WhatsApp numbers, most of them minors, so
-- nobody outside the database can read it: RLS on, NO policies, and the table
-- privileges revoked from anon/authenticated. The page reaches it only through
-- three security-definer functions:
--   eapcet_join(...)            anon: validate, store one row per number, return #N + share code
--   eapcet_interest_count()     anon: a single number, for the page's counter
--   eapcet_interest_report(tok) token-gated: aggregates + the full list for the founder

create table if not exists public.eapcet_interest (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(name) between 1 and 60),
  whatsapp    text not null unique check (whatsapp ~ '^[6-9][0-9]{9}$'),
  stream      text not null check (stream in ('MPC','BiPC')),
  exam_year   text not null check (exam_year in ('2027','2028','later')),
  wants       text[] not null default '{}',   -- subset of weakness|photo|check|practice
  ref_code    text not null unique,           -- this student's own share code
  referred_by text,                           -- the ref_code of the student who shared the link
  source      text,                           -- ?src= / utm_source of the link they arrived on
  session_id  text,                           -- site-analytics pm_sid, joins a row to its visits
  consent     boolean not null check (consent)
);
create index if not exists eapcet_interest_created_idx on public.eapcet_interest (created_at);
create index if not exists eapcet_interest_referred_idx on public.eapcet_interest (referred_by);

alter table public.eapcet_interest enable row level security;
revoke all on table public.eapcet_interest from anon, authenticated;

-- ---------------------------------------------------------------------------
-- eapcet_join — the only way in. Returns {ok:true, position, ref} or {ok:false, error}.
-- A number that is already on the list gets its ORIGINAL position and code back and
-- nothing is overwritten, so a second submit can neither double-count nor let someone
-- who knows a number rewrite that student's details.
-- ---------------------------------------------------------------------------
create or replace function public.eapcet_join(
  p_name      text,
  p_whatsapp  text,
  p_stream    text,
  p_exam_year text,
  p_wants     text[]  default '{}',
  p_ref       text    default null,
  p_source    text    default null,
  p_session   text    default null,
  p_consent   boolean default false
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name   text;
  v_phone  text;
  v_wants  text[];
  v_ref    text;
  v_code   text;
  v_id     bigint;
  v_pos    integer;
  v_abc    constant text := 'abcdefghjkmnpqrstuvwxyz23456789';
  i        integer;
begin
  -- name: strip control characters, collapse whitespace, must hold a letter
  v_name := btrim(regexp_replace(regexp_replace(coalesce(p_name, ''), '[[:cntrl:]]', '', 'g'), '\s+', ' ', 'g'));
  if char_length(v_name) < 1 or char_length(v_name) > 60 or v_name !~ '[[:alpha:]]' then
    return json_build_object('ok', false, 'error', 'name');
  end if;

  -- number: digits only; accept +91 / 91 / 0 prefixes; must be an Indian mobile
  v_phone := regexp_replace(coalesce(p_whatsapp, ''), '\D', '', 'g');
  if char_length(v_phone) = 12 and left(v_phone, 2) = '91' then
    v_phone := right(v_phone, 10);
  elsif char_length(v_phone) = 11 and left(v_phone, 1) = '0' then
    v_phone := right(v_phone, 10);
  end if;
  if v_phone !~ '^[6-9][0-9]{9}$' then
    return json_build_object('ok', false, 'error', 'phone');
  end if;

  if p_stream is null or p_stream not in ('MPC', 'BiPC') then
    return json_build_object('ok', false, 'error', 'stream');
  end if;
  if p_exam_year is null or p_exam_year not in ('2027', '2028', 'later') then
    return json_build_object('ok', false, 'error', 'year');
  end if;
  if p_consent is not true then
    return json_build_object('ok', false, 'error', 'consent');
  end if;

  select coalesce(array_agg(distinct w order by w), '{}')
    into v_wants
    from unnest(coalesce(p_wants, '{}'::text[])) as w
   where w in ('weakness', 'photo', 'check', 'practice');

  -- a referral only counts when it names a real student
  v_ref := lower(btrim(coalesce(p_ref, '')));
  if v_ref = '' or not exists (select 1 from eapcet_interest where ref_code = v_ref) then
    v_ref := null;
  end if;

  -- already on the list: hand back the original position and code, change nothing
  select id, ref_code into v_id, v_code from eapcet_interest where whatsapp = v_phone;

  if v_id is null then
    loop
      v_code := '';
      for i in 1..6 loop
        v_code := v_code || substr(v_abc, 1 + floor(random() * char_length(v_abc))::int, 1);
      end loop;
      exit when not exists (select 1 from eapcet_interest where ref_code = v_code);
    end loop;

    insert into eapcet_interest (name, whatsapp, stream, exam_year, wants, ref_code, referred_by, source, session_id, consent)
    values (v_name, v_phone, p_stream, p_exam_year, v_wants, v_code, v_ref,
            left(nullif(btrim(coalesce(p_source, '')), ''), 60),
            left(nullif(btrim(coalesce(p_session, '')), ''), 64),
            true)
    on conflict (whatsapp) do nothing
    returning id into v_id;

    -- lost a race with an identical submit: read the winner
    if v_id is null then
      select id, ref_code into v_id, v_code from eapcet_interest where whatsapp = v_phone;
    end if;
  end if;

  select count(*) into v_pos from eapcet_interest where id <= v_id;
  return json_build_object('ok', true, 'position', v_pos, 'ref', v_code);
end;
$$;

-- ---------------------------------------------------------------------------
-- eapcet_interest_count — the page's "N students have joined" line. A number only.
-- ---------------------------------------------------------------------------
create or replace function public.eapcet_interest_count()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer from eapcet_interest;
$$;

-- ---------------------------------------------------------------------------
-- eapcet_interest_report — token-gated (admin_config.funnel_token). Unlike
-- funnel_summary this DOES return names and numbers: the list exists to message
-- these students when EAPCET opens, and the founder needs it to do that.
-- ---------------------------------------------------------------------------
create or replace function public.eapcet_interest_report(tok text)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  ok     boolean;
  result json;
begin
  select exists(select 1 from admin_config where key = 'funnel_token' and value = tok) into ok;
  if not ok then
    raise exception 'unauthorized';
  end if;

  with r as (
    select e.*,
           (e.created_at at time zone 'Asia/Kolkata')::date as ist_day,
           coalesce(nullif(e.source, ''), case when e.referred_by is not null then 'friend' else '(direct)' end) as src
      from eapcet_interest e
  ),
  visits as (
    select coalesce(nullif(source, ''), '(direct)') as src,
           count(*) as visits,
           count(distinct session_id) as visitors
      from site_events
     where event_type = 'visit' and path like '/eapcet%'
     group by 1
  )
  select json_build_object(
    'generated_at', now(),
    'total',        (select count(*) from r),
    'today',        (select count(*) from r where ist_day = (now() at time zone 'Asia/Kolkata')::date),
    'last_7d',      (select count(*) from r where created_at >= now() - interval '7 days'),
    'page_visitors',(select count(distinct session_id) from site_events where event_type = 'visit' and path like '/eapcet%'),
    'by_stream',    (select coalesce(json_object_agg(stream, n), '{}'::json) from (select stream, count(*) n from r group by 1) s),
    'by_year',      (select coalesce(json_object_agg(exam_year, n), '{}'::json) from (select exam_year, count(*) n from r group by 1) s),
    'by_want',      (select coalesce(json_object_agg(w, n), '{}'::json) from (select w, count(*) n from r, unnest(r.wants) w group by 1) s),
    'by_source', (
      select coalesce(json_agg(json_build_object('source', s.src, 'visitors', coalesce(v.visitors, 0), 'joined', s.n)
                               order by s.n desc, s.src), '[]'::json)
        from (select src, count(*) n from r group by 1) s
        left join visits v on v.src = s.src
    ),
    'top_referrers', (
      select coalesce(json_agg(json_build_object('name', p.name, 'ref', p.ref_code, 'brought', t.n)
                               order by t.n desc, p.name), '[]'::json)
        from (select referred_by, count(*) n from r where referred_by is not null group by 1 order by 2 desc limit 20) t
        join eapcet_interest p on p.ref_code = t.referred_by
    ),
    'daily', (
      select coalesce(json_agg(json_build_object('day', d.ist_day, 'n', d.n) order by d.ist_day desc), '[]'::json)
        from (select ist_day, count(*) n from r group by 1 order by 1 desc limit 60) d
    ),
    'rows', (
      select coalesce(json_agg(json_build_object(
               'n', x.pos, 'at', x.created_at, 'name', x.name, 'whatsapp', x.whatsapp,
               'stream', x.stream, 'year', x.exam_year, 'wants', x.wants, 'source', x.src,
               'ref', x.ref_code, 'referred_by', x.referrer_name)
             order by x.pos desc), '[]'::json)
        from (
          select r.*, row_number() over (order by r.id) as pos, p.name as referrer_name
            from r left join eapcet_interest p on p.ref_code = r.referred_by
        ) x
    )
  ) into result;
  return result;
end;
$$;

revoke all on function public.eapcet_join(text, text, text, text, text[], text, text, text, boolean) from public;
revoke all on function public.eapcet_interest_count() from public;
revoke all on function public.eapcet_interest_report(text) from public;
grant execute on function public.eapcet_join(text, text, text, text, text[], text, text, text, boolean) to anon, authenticated;
grant execute on function public.eapcet_interest_count() to anon, authenticated;
grant execute on function public.eapcet_interest_report(text) to anon, authenticated;
