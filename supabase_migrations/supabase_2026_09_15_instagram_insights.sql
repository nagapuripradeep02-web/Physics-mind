-- ═══════════════════════════════════════════════════════════════════════════
-- Instagram register + insights — dxwpkjfypzxrzgbevfnx — 2026-09-15
-- SAFE TO RE-RUN: yes. Every table is `if not exists`, every function is
-- `create or replace`, the config seed is `on conflict do nothing`. No data is
-- touched. The only statement that changes an existing object is the view
-- (create or replace view keeps its name; drop+create only if columns shrink —
-- see the note above the view).
-- ═══════════════════════════════════════════════════════════════════════════
--
-- WHY. The Viditra Instagram account is about to post its first reels and
-- carousels (~3 + 3 a week plus daily Stories). The founder wants ONE register
-- of every post (what it is, its hook, keyword, posted at which IST + Berlin
-- time) and each post's performance pulled DAILY for the first 10+ days, so
-- the ratios that separate a working hook from a failing one (send rate,
-- save rate, keyword intent, completion, hook hold, follow rate) compound
-- into the reel studio's library — the viditra-film R0 promotion law ranks by
-- saves + shares. Instagram reports LIFETIME totals per post, so the 48 h /
-- 7 d picture only exists if something snapshots every day. This is that.
--
-- WHAT.
--   ig_posts           the REGISTER — one row per media id; API columns are
--                      written by the pull job, AUTHORED columns (title, hook,
--                      keyword, format, reel id …) only by ig_apply_registrations.
--   ig_insights_daily  one row per (post, IST day, slot): lifetime counters at
--                      that moment + age_hours. 48 h / 7 d rows are DERIVED
--                      (nearest snapshot within a tolerance), never typed.
--   ig_account_daily   one row per IST day for the account (followers, reach…).
--   ig_registrations   the register's inbox: viditra-film's `ig:register`
--                      writes authored metadata keyed by permalink shortcode;
--                      the pull job attaches it once the post is seen.
--   ig_admin_config    the dashboard token + the Meta access token + user id
--                      (RLS on, zero policies — service role only; the token
--                      is compared INSIDE ig_stats, never in the Edge Function).
--   ig_horizon()       nearest snapshot → one jsonb of counters + ratios.
--   ig_post_ratios     the view every reader uses: posted_ist / posted_berlin,
--                      at48 / at7d / life jsonb, basis, snapshots.
--   ig_apply_registrations()  inbox → ig_posts (whitelisted keys only).
--   ig_stats(token, since)    ONE jsonb for the dashboard / export / analyst.
--
-- Ratio definitions (founder, 2026-09-15 — copied verbatim into
-- viditra-film/marketing/INSIGHTS.md and the dashboard footer):
--   send rate          = shares ÷ views
--   save rate          = saves ÷ views
--   keyword intent     = comments ÷ likes
--   completion         = avg watch time ÷ reel length
--   hook hold          = 1 − reels_skip_rate           (reels only)
--   follow rate        = follows ÷ reach
--   profile-visit rate = profile visits ÷ reach
--   rank               = saves + shares                 (R0)
-- Horizons: 48h = nearest snapshot within ±18 h of 48 h; 7d = within ±24 h of
-- 168 h; life = the latest snapshot. basis = 7d when present, else 48h
-- (provisional). Lifetime never ranks.

-- ── 1. the register ─────────────────────────────────────────────────────────
create table if not exists ig_posts (
    ig_media_id         text primary key,
    shortcode           text not null,          -- from the permalink; the register's join key
    permalink           text not null,
    media_type          text,                   -- IMAGE | VIDEO | CAROUSEL_ALBUM
    media_product_type  text,                   -- FEED | REELS | STORY
    kind                text generated always as (
                            case
                                when media_product_type = 'STORY' then 'STORY'
                                when media_product_type = 'REELS' then 'REEL'
                                when media_type = 'CAROUSEL_ALBUM' then 'CAROUSEL'
                                else 'POST'
                            end) stored,
    posted_at           timestamptz not null,   -- UTC as Instagram reports it; IST/Berlin are computed in the view
    caption             text,
    thumbnail_url       text,
    media_url           text,
    children            jsonb not null default '[]'::jsonb,
    api_like_count      int,
    api_comments_count  int,
    first_seen_at       timestamptz not null default now(),
    last_pulled_at      timestamptz,
    -- authored (viditra-film register) — never written by the pull job
    title               text,
    format              text,                   -- reels: proof|value|identity|dare|product · carousels: one of the eight format slugs
    hook_text           text,
    body_summary        text,
    cta_keyword         text,
    series              text,
    reel_id             text,                   -- viditra-film reels/<id>
    version             int,
    design_system       text,
    presenter           text,                   -- her | ai | product
    source_card         text,
    duration_s          numeric,
    src_tag             text,                   -- ig01 … the ?src= value the DM link carries
    notes               text,
    registered_at       timestamptz,
    props               jsonb not null default '{}'::jsonb
);
create unique index if not exists ig_posts_shortcode_idx on ig_posts (shortcode);
create index if not exists ig_posts_posted_idx on ig_posts (posted_at desc);
create index if not exists ig_posts_reel_idx on ig_posts (reel_id) where reel_id is not null;
alter table ig_posts enable row level security;   -- zero policies: service role only
comment on table ig_posts is 'Instagram register: one row per media id; API columns by ig_pull, authored columns by ig_apply_registrations (2026-09-15)';

-- ── 2. the daily snapshots ──────────────────────────────────────────────────
create table if not exists ig_insights_daily (
    id                  bigint generated always as identity primary key,
    ig_media_id         text not null references ig_posts (ig_media_id),
    snapshot_date       date not null,          -- IST date of the pull
    slot                smallint not null default 0,   -- 0 = the daily run; 1 = an optional second run
    snapshot_at         timestamptz not null default now(),
    age_hours           numeric not null,       -- hours since posted_at at snapshot time
    views               int,
    reach               int,
    likes               int,
    comments            int,
    shares              int,                    -- "sends"
    saved               int,
    total_interactions  int,
    avg_watch_time_ms   int,                    -- ig_reels_avg_watch_time (reels)
    total_watch_time_ms bigint,                 -- ig_reels_video_view_total_time (reels)
    skip_rate           numeric,                -- reels_skip_rate as a FRACTION 0–1 (the job normalises)
    follows             int,
    profile_visits      int,
    reposts             int,
    replies             int,                    -- stories
    link_clicks         int,                    -- stories
    raw                 jsonb not null default '{}'::jsonb,   -- the whole insights response, for name drift
    unique (ig_media_id, snapshot_date, slot)
);
create index if not exists ig_insights_media_age_idx on ig_insights_daily (ig_media_id, age_hours);
alter table ig_insights_daily enable row level security;
comment on table ig_insights_daily is 'Lifetime Instagram counters per post per IST day; 48h/7d rows are derived by ig_horizon (2026-09-15)';

-- ── 3. the account row per day ──────────────────────────────────────────────
create table if not exists ig_account_daily (
    day                 date primary key,       -- IST
    follower_count      int,                    -- the day's delta (API metric; rejected under 100 followers)
    followers_total     int,                    -- followers_count on the user node
    reach               int,
    profile_views       int,
    accounts_engaged    int,
    total_interactions  int,
    media_count         int,
    raw                 jsonb not null default '{}'::jsonb,
    pulled_at           timestamptz not null default now()
);
alter table ig_account_daily enable row level security;
comment on table ig_account_daily is 'One row per IST day for the Viditra Instagram account (2026-09-15)';

-- ── 4. the register''s inbox ─────────────────────────────────────────────────
create table if not exists ig_registrations (
    shortcode           text primary key,
    source              text not null,          -- reel:V01_LAW | carousel:<slug>
    authored            jsonb not null,
    registered_at       timestamptz not null default now(),
    applied_to          text references ig_posts (ig_media_id),
    applied_at          timestamptz
);
alter table ig_registrations enable row level security;
comment on table ig_registrations is 'Authored metadata from viditra-film ig:register, keyed by permalink shortcode; attached by ig_apply_registrations (2026-09-15)';

-- ── 5. config: dashboard token + Meta token (service role only) ─────────────
create table if not exists ig_admin_config (
    key         text primary key,
    value       text not null,
    updated_at  timestamptz not null default now()
);
alter table ig_admin_config enable row level security;
comment on table ig_admin_config is 'Instagram dashboard token, Meta access token, ig_user_id, last pull (2026-09-15)';

insert into ig_admin_config (key, value) values
    ('stats_token',           replace(gen_random_uuid()::text, '-', '')),
    ('meta_access_token',     ''),
    ('meta_token_expires_at', ''),
    ('ig_user_id',            ''),
    ('last_pull_at',          ''),
    ('last_pull_summary',     '')
on conflict (key) do nothing;
-- Read the dashboard token with:
--   select value from ig_admin_config where key = 'stats_token';
-- Rotate it with:
--   update ig_admin_config set value = replace(gen_random_uuid()::text,'-',''), updated_at = now() where key = 'stats_token';

-- ── 6. nearest snapshot → one jsonb of counters + ratios ────────────────────
-- p_target null = the latest snapshot (lifetime). Returns null when no snapshot
-- lies within the tolerance, so the caller can tell "pending" from "zero".
create or replace function ig_horizon(p_media text, p_target numeric, p_tol numeric, p_duration numeric)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
    select jsonb_build_object(
        'age_hours',            round(d.age_hours, 1),
        'snapshot_date',        d.snapshot_date,
        'snapshot_at',          d.snapshot_at,
        'views',                d.views,
        'reach',                d.reach,
        'likes',                d.likes,
        'comments',             d.comments,
        'shares',               d.shares,
        'saves',                d.saved,
        'total_interactions',   d.total_interactions,
        'avg_watch_time_ms',    d.avg_watch_time_ms,
        'total_watch_time_ms',  d.total_watch_time_ms,
        'skip_rate',            d.skip_rate,
        'follows',              d.follows,
        'profile_visits',       d.profile_visits,
        'reposts',              d.reposts,
        'replies',              d.replies,
        'link_clicks',          d.link_clicks,
        'send_rate',            round(d.shares::numeric         / nullif(d.views, 0), 5),
        'save_rate',            round(d.saved::numeric          / nullif(d.views, 0), 5),
        'keyword_intent',       round(d.comments::numeric       / nullif(d.likes, 0), 5),
        'completion',           round((d.avg_watch_time_ms / 1000.0) / nullif(p_duration, 0), 4),
        'hook_hold',            case when d.skip_rate is null then null else round(1 - d.skip_rate, 4) end,
        'follow_rate',          round(d.follows::numeric        / nullif(d.reach, 0), 5),
        'profile_visit_rate',   round(d.profile_visits::numeric / nullif(d.reach, 0), 5),
        'rank',                 coalesce(d.saved, 0) + coalesce(d.shares, 0)
    )
    from ig_insights_daily d
    where d.ig_media_id = p_media
      and (p_target is null or abs(d.age_hours - p_target) <= p_tol)
    order by case when p_target is null then 0 else abs(d.age_hours - p_target) end,
             d.snapshot_at desc
    limit 1
$$;
revoke all on function ig_horizon(text, numeric, numeric, numeric) from public, anon, authenticated;

-- ── 7. the view every reader uses ───────────────────────────────────────────
-- security_invoker + the revoke below: a plain view runs as its owner and
-- would hand the whole register to the project's anon key through PostgREST.
-- If a later change REMOVES a column, `create or replace view` fails — drop
-- and recreate it in that migration.
create or replace view ig_post_ratios with (security_invoker = true) as
select v.*,
       coalesce(v.at7d, v.at48)                                            as basis_json,
       case when v.at7d is not null then '7d'
            when v.at48 is not null then '48h' end                          as basis
from (
    select p.*,
           to_char(p.posted_at at time zone 'Asia/Kolkata', 'YYYY-MM-DD HH24:MI')   as posted_ist,
           to_char(p.posted_at at time zone 'Europe/Berlin', 'YYYY-MM-DD HH24:MI')  as posted_berlin,
           extract(isodow from p.posted_at at time zone 'Asia/Kolkata')::int         as weekday_ist,
           extract(hour   from p.posted_at at time zone 'Asia/Kolkata')::int         as hour_ist,
           extract(isodow from p.posted_at at time zone 'Europe/Berlin')::int        as weekday_berlin,
           extract(hour   from p.posted_at at time zone 'Europe/Berlin')::int        as hour_berlin,
           to_char(p.posted_at at time zone 'Asia/Kolkata', 'IYYY-"W"IW')            as iso_week_ist,
           extract(epoch from (now() - p.posted_at)) / 3600.0                        as age_hours_now,
           ig_horizon(p.ig_media_id, 48,   18,   p.duration_s)                        as at48,
           ig_horizon(p.ig_media_id, 168,  24,   p.duration_s)                        as at7d,
           ig_horizon(p.ig_media_id, null, null, p.duration_s)                        as life,
           (select count(*) from ig_insights_daily d where d.ig_media_id = p.ig_media_id) as snapshots
    from ig_posts p
) v;
revoke all on ig_post_ratios from public, anon, authenticated;
comment on view ig_post_ratios is 'ig_posts + IST/Berlin posting time + at48/at7d/life jsonb (ig_horizon) + basis; service role only (2026-09-15)';

-- ── 8. inbox → register ─────────────────────────────────────────────────────
-- Whitelisted keys only: a registration can never touch an API column.
-- Re-registering the same shortcode (applied_at reset to null by the upsert)
-- re-applies, so a corrected hook or duration flows through on the next call.
create or replace function ig_apply_registrations()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    r        record;
    n        int    := 0;
    pending  text[] := '{}';
begin
    for r in
        select g.shortcode, g.authored, p.ig_media_id
        from ig_registrations g
        left join ig_posts p on p.shortcode = g.shortcode
        where g.applied_at is null
    loop
        if r.ig_media_id is null then
            pending := pending || r.shortcode;
            continue;
        end if;
        update ig_posts set
            title         = coalesce(r.authored->>'title',         title),
            format        = coalesce(r.authored->>'format',        format),
            hook_text     = coalesce(r.authored->>'hook_text',     hook_text),
            body_summary  = coalesce(r.authored->>'body_summary',  body_summary),
            cta_keyword   = coalesce(r.authored->>'cta_keyword',   cta_keyword),
            series        = coalesce(r.authored->>'series',        series),
            reel_id       = coalesce(r.authored->>'reel_id',       reel_id),
            version       = coalesce((r.authored->>'version')::int, version),
            design_system = coalesce(r.authored->>'design_system', design_system),
            presenter     = coalesce(r.authored->>'presenter',     presenter),
            source_card   = coalesce(r.authored->>'source_card',   source_card),
            duration_s    = coalesce((r.authored->>'duration_s')::numeric, duration_s),
            src_tag       = coalesce(r.authored->>'src_tag',       src_tag),
            notes         = coalesce(r.authored->>'notes',         notes),
            props         = props || coalesce(r.authored->'props', '{}'::jsonb),
            registered_at = now()
        where ig_media_id = r.ig_media_id;
        update ig_registrations
           set applied_to = r.ig_media_id, applied_at = now()
         where shortcode = r.shortcode;
        n := n + 1;
    end loop;
    return jsonb_build_object('ok', true, 'applied', n, 'pending', to_jsonb(pending));
end
$$;
revoke all on function ig_apply_registrations() from public, anon, authenticated;

-- ── 9. the numbers behind viditra.co/admin/instagram ────────────────────────
-- Token checked here, inside SQL, against ig_admin_config — the Edge Function
-- only proxies. Returns aggregates + the per-post table; never raw snapshots.
create or replace function ig_stats(
    p_token text,
    p_since timestamptz default '2026-09-15T00:00:00Z'
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
    v_posts     jsonb;
    v_week      jsonb;
    v_heat_ist  jsonb;
    v_heat_ber  jsonb;
    v_top       jsonb;
    v_bottom    jsonb;
    v_formats   jsonb;
    v_keywords  jsonb;
    v_kill      jsonb;
    v_account   jsonb;
    v_live      jsonb;
    v_exp       text;
    v_exp_ts    timestamptz;
begin
    if not exists (select 1 from ig_admin_config where key = 'stats_token' and value = p_token) then
        return jsonb_build_object('ok', false, 'error', 'unauthorized');
    end if;

    -- the per-post table
    select coalesce(jsonb_agg(jsonb_build_object(
               'ig_media_id',    v.ig_media_id,
               'shortcode',      v.shortcode,
               'permalink',      v.permalink,
               'kind',           v.kind,
               'title',          v.title,
               'format',         v.format,
               'hook_text',      v.hook_text,
               'body_summary',   v.body_summary,
               'cta_keyword',    v.cta_keyword,
               'series',         v.series,
               'reel_id',        v.reel_id,
               'version',        v.version,
               'presenter',      v.presenter,
               'design_system',  v.design_system,
               'duration_s',     v.duration_s,
               'src_tag',        v.src_tag,
               'caption',        left(v.caption, 200),
               'thumbnail_url',  v.thumbnail_url,
               'posted_at',      v.posted_at,
               'posted_ist',     v.posted_ist,
               'posted_berlin',  v.posted_berlin,
               'weekday_ist',    v.weekday_ist,
               'hour_ist',       v.hour_ist,
               'weekday_berlin', v.weekday_berlin,
               'hour_berlin',    v.hour_berlin,
               'iso_week_ist',   v.iso_week_ist,
               'age_hours_now',  round(v.age_hours_now, 1),
               'registered',     v.registered_at is not null,
               'at48',           v.at48,
               'at7d',           v.at7d,
               'life',           v.life,
               'basis',          v.basis,
               'snapshots',      v.snapshots
           ) order by v.posted_at desc), '[]'::jsonb)
      into v_posts
      from ig_post_ratios v
     where v.posted_at >= p_since;

    -- posts per ISO week (IST) by kind — the "how many reels / carousels this week"
    select coalesce(jsonb_agg(w order by w->>'iso_week'), '[]'::jsonb)
      into v_week
      from (
          select jsonb_build_object(
                     'iso_week', iso_week_ist,
                     'REEL',     count(*) filter (where kind = 'REEL'),
                     'CAROUSEL', count(*) filter (where kind = 'CAROUSEL'),
                     'POST',     count(*) filter (where kind = 'POST'),
                     'STORY',    count(*) filter (where kind = 'STORY')
                 ) as w
            from ig_post_ratios
           where posted_at >= p_since
           group by iso_week_ist
      ) x;

    -- weekday × hour heatmaps of send rate (posts with a basis row, no stories)
    select coalesce(jsonb_agg(h), '[]'::jsonb)
      into v_heat_ist
      from (
          select jsonb_build_object(
                     'weekday', weekday_ist, 'hour', hour_ist, 'n', count(*),
                     'avg_send_rate', round(avg((basis_json->>'send_rate')::numeric), 5),
                     'avg_save_rate', round(avg((basis_json->>'save_rate')::numeric), 5),
                     'avg_views',     round(avg((basis_json->>'views')::numeric))
                 ) as h
            from ig_post_ratios
           where posted_at >= p_since and basis_json is not null and kind <> 'STORY'
           group by weekday_ist, hour_ist
      ) x;

    select coalesce(jsonb_agg(h), '[]'::jsonb)
      into v_heat_ber
      from (
          select jsonb_build_object(
                     'weekday', weekday_berlin, 'hour', hour_berlin, 'n', count(*),
                     'avg_send_rate', round(avg((basis_json->>'send_rate')::numeric), 5),
                     'avg_save_rate', round(avg((basis_json->>'save_rate')::numeric), 5),
                     'avg_views',     round(avg((basis_json->>'views')::numeric))
                 ) as h
            from ig_post_ratios
           where posted_at >= p_since and basis_json is not null and kind <> 'STORY'
           group by weekday_berlin, hour_berlin
      ) x;

    -- top / bottom five by rank (saves + shares) on the basis row
    select coalesce(jsonb_agg(t order by rnk desc, sr desc nulls last), '[]'::jsonb)
      into v_top
      from (
          select jsonb_build_object(
                     'ig_media_id', ig_media_id, 'kind', kind,
                     'title', coalesce(title, left(caption, 60)),
                     'rank', (basis_json->>'rank')::int, 'basis', basis,
                     'send_rate', (basis_json->>'send_rate')::numeric,
                     'save_rate', (basis_json->>'save_rate')::numeric
                 ) as t,
                 (basis_json->>'rank')::int as rnk,
                 (basis_json->>'send_rate')::numeric as sr
            from ig_post_ratios
           where posted_at >= p_since and basis_json is not null and kind <> 'STORY'
           order by rnk desc, sr desc nulls last
           limit 5
      ) x;

    select coalesce(jsonb_agg(t order by rnk asc, sr asc nulls first), '[]'::jsonb)
      into v_bottom
      from (
          select jsonb_build_object(
                     'ig_media_id', ig_media_id, 'kind', kind,
                     'title', coalesce(title, left(caption, 60)),
                     'rank', (basis_json->>'rank')::int, 'basis', basis,
                     'send_rate', (basis_json->>'send_rate')::numeric,
                     'save_rate', (basis_json->>'save_rate')::numeric
                 ) as t,
                 (basis_json->>'rank')::int as rnk,
                 (basis_json->>'send_rate')::numeric as sr
            from ig_post_ratios
           where posted_at >= p_since and basis_json is not null and kind <> 'STORY'
           order by rnk asc, sr asc nulls first
           limit 5
      ) x;

    -- format league
    select coalesce(jsonb_agg(f order by f->>'kind', f->>'format'), '[]'::jsonb)
      into v_formats
      from (
          select jsonb_build_object(
                     'kind',   kind,
                     'format', coalesce(format, '(unregistered)'),
                     'n',      count(*),
                     'avg_send_rate',      round(avg((basis_json->>'send_rate')::numeric), 5),
                     'avg_save_rate',      round(avg((basis_json->>'save_rate')::numeric), 5),
                     'avg_keyword_intent', round(avg((basis_json->>'keyword_intent')::numeric), 5),
                     'avg_completion',     round(avg((basis_json->>'completion')::numeric), 4),
                     'avg_hook_hold',      round(avg((basis_json->>'hook_hold')::numeric), 4),
                     'avg_views',          round(avg((basis_json->>'views')::numeric)),
                     'sum_saves',          sum((basis_json->>'saves')::int),
                     'sum_shares',         sum((basis_json->>'shares')::int),
                     'basis', case when count(distinct basis) = 1 then min(basis) else 'mixed' end
                 ) as f
            from ig_post_ratios
           where posted_at >= p_since and basis_json is not null and kind <> 'STORY'
           group by kind, coalesce(format, '(unregistered)')
      ) x;

    -- keyword league
    select coalesce(jsonb_agg(k order by k->>'cta_keyword'), '[]'::jsonb)
      into v_keywords
      from (
          select jsonb_build_object(
                     'cta_keyword', cta_keyword, 'n', count(*),
                     'avg_keyword_intent', round(avg((basis_json->>'keyword_intent')::numeric), 5),
                     'comments', sum((basis_json->>'comments')::int),
                     'likes',    sum((basis_json->>'likes')::int)
                 ) as k
            from ig_post_ratios
           where posted_at >= p_since and basis_json is not null and cta_keyword is not null
           group by cta_keyword
      ) x;

    -- the kill rule: a registered format with three posts and no saves is dropped
    select coalesce(jsonb_agg(k), '[]'::jsonb)
      into v_kill
      from (
          select jsonb_build_object('kind', kind, 'format', format, 'n', count(*),
                                    'sum_saves', coalesce(sum((basis_json->>'saves')::int), 0)) as k
            from ig_post_ratios
           where posted_at >= p_since and basis_json is not null and kind <> 'STORY' and format is not null
           group by kind, format
          having count(*) >= 3 and coalesce(sum((basis_json->>'saves')::int), 0) = 0
      ) x;

    -- the account curve
    select coalesce(jsonb_agg(jsonb_build_object(
               'day', day, 'followers_total', followers_total, 'follower_count', follower_count,
               'reach', reach, 'profile_views', profile_views, 'accounts_engaged', accounts_engaged,
               'total_interactions', total_interactions, 'media_count', media_count
           ) order by day), '[]'::jsonb)
      into v_account
      from ig_account_daily
     where day >= (p_since at time zone 'Asia/Kolkata')::date;

    -- liveness: the numbers that prove the pull is alive
    select jsonb_build_object(
               'last_pull_at',          nullif((select value from ig_admin_config where key = 'last_pull_at'), ''),
               'last_pull_summary',     nullif((select value from ig_admin_config where key = 'last_pull_summary'), ''),
               'snapshot_rows',         (select count(*) from ig_insights_daily),
               'posts_total',           (select count(*) from ig_posts),
               'posts_unregistered',    (select count(*) from ig_posts where registered_at is null and kind <> 'STORY'),
               'registrations_pending', (select coalesce(jsonb_agg(shortcode), '[]'::jsonb) from ig_registrations where applied_at is null),
               'account_days',          (select count(*) from ig_account_daily)
           )
      into v_live;

    -- token expiry
    select nullif(value, '') into v_exp from ig_admin_config where key = 'meta_token_expires_at';
    begin
        v_exp_ts := v_exp::timestamptz;
    exception when others then
        v_exp_ts := null;
    end;

    return jsonb_build_object(
        'ok',            true,
        'since',         p_since,
        'generated_at',  now(),
        'liveness',      v_live,
        'token',         jsonb_build_object(
                             'expires_at', v_exp_ts,
                             'days_left',  case when v_exp_ts is null then null
                                                else floor(extract(epoch from (v_exp_ts - now())) / 86400) end),
        'posts',         v_posts,
        'week',          v_week,
        'heatmap_ist',   v_heat_ist,
        'heatmap_berlin', v_heat_ber,
        'top',           v_top,
        'bottom',        v_bottom,
        'formats',       v_formats,
        'keywords',      v_keywords,
        'kill_flags',    v_kill,
        'account',       v_account
    );
end
$$;
revoke all on function ig_stats(text, timestamptz) from public, anon, authenticated;
