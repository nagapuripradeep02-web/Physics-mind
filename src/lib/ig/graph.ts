/**
 * Instagram Graph API helpers — pure functions, no I/O, no dependencies.
 *
 * Everything the daily pull (`src/scripts/ig_pull.ts`) needs to DECIDE is
 * here so it can be unit-tested without a token: which metrics to ask for per
 * post kind, how to flatten an insights response, how to read a shortcode out
 * of a permalink, the IST date and age arithmetic, the token-expiry rule, and
 * the whitelist of columns the job may write to `ig_posts`.
 *
 * API facts (verified 2026-09-15 against developers.facebook.com; re-verify
 * with the six curls in docs/notes/INSTAGRAM_INSIGHTS_RUNBOOK.md §0 — metric
 * names drift, `plays` became `views` in 2024):
 *   host       https://graph.instagram.com/v25.0   (Instagram API with Instagram Login)
 *   media list /{ig-user-id}/media?fields=…        /{ig-user-id}/stories
 *   insights   /{media-id}/insights?metric=…       (lifetime totals — hence daily snapshots)
 *   refresh    /refresh_access_token?grant_type=ig_refresh_token&access_token=…
 */

export const GRAPH_HOST = 'https://graph.instagram.com';
export const GRAPH_VERSION = 'v25.0';

export type PostKind = 'REEL' | 'CAROUSEL' | 'POST' | 'STORY';

/** Fields requested on every media node. `children` is only populated on carousels. */
export const MEDIA_FIELDS =
    'id,media_type,media_product_type,caption,permalink,timestamp,thumbnail_url,media_url,like_count,comments_count,children{id,media_type}';

/**
 * Insight metrics per kind. Breakdown-only metrics (profile_activity,
 * navigation) are deliberately absent — they need a `breakdown` parameter and
 * add nothing the ratios use. A metric the API rejects is dropped at run time
 * (see `rejectedMetric`), so a renamed metric costs one logged line, not a
 * failed run.
 */
export const METRICS: Record<PostKind, readonly string[]> = {
    REEL: [
        'views', 'reach', 'likes', 'comments', 'shares', 'saved', 'total_interactions',
        'ig_reels_avg_watch_time', 'ig_reels_video_view_total_time', 'reels_skip_rate', 'reposts',
    ],
    CAROUSEL: ['views', 'reach', 'likes', 'comments', 'shares', 'saved', 'total_interactions', 'profile_visits', 'follows', 'reposts'],
    POST: ['views', 'reach', 'likes', 'comments', 'shares', 'saved', 'total_interactions', 'profile_visits', 'follows', 'reposts'],
    STORY: ['views', 'reach', 'replies', 'shares', 'follows', 'profile_visits', 'link_clicks', 'reposts'],
};

export function metricSetFor(kind: PostKind): readonly string[] {
    return METRICS[kind];
}

/** Mirrors the generated `kind` column in ig_posts — keep the two in step. */
export function kindOf(mediaType: string | null | undefined, mediaProductType: string | null | undefined): PostKind {
    if (mediaProductType === 'STORY') return 'STORY';
    if (mediaProductType === 'REELS') return 'REEL';
    if (mediaType === 'CAROUSEL_ALBUM') return 'CAROUSEL';
    return 'POST';
}

export interface MediaNode {
    id: string;
    media_type?: string | null;
    media_product_type?: string | null;
    caption?: string | null;
    permalink?: string | null;
    timestamp: string;
    thumbnail_url?: string | null;
    media_url?: string | null;
    like_count?: number | null;
    comments_count?: number | null;
    children?: { data?: { id: string; media_type?: string | null }[] } | null;
}

/**
 * The ONLY columns the pull job may write to ig_posts. Everything authored
 * (title, hook_text, cta_keyword, format, reel_id, duration_s …) belongs to
 * ig_apply_registrations. A test asserts no authored name is in this list.
 */
export const API_COLUMNS = [
    'ig_media_id', 'shortcode', 'permalink', 'media_type', 'media_product_type', 'posted_at',
    'caption', 'thumbnail_url', 'media_url', 'children', 'api_like_count', 'api_comments_count', 'last_pulled_at',
] as const;
export type ApiColumn = (typeof API_COLUMNS)[number];
export type PostRow = Record<ApiColumn, unknown>;

/**
 * The shortcode is the permalink's last path segment under /reel/, /p/ or /tv/.
 * Stories have no shortcode (their permalink is /stories/<user>/<id>/), so the
 * media id stands in — the register only ever joins reels and carousels.
 */
export function shortcodeOf(permalink: string | null | undefined, fallbackId: string): string {
    if (!permalink) return fallbackId;
    const m = /instagram\.com\/(?:[^/]+\/)?(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)\/?/.exec(permalink);
    return m ? m[1] : fallbackId;
}

export function postRowFrom(node: MediaNode, nowIso: string): PostRow {
    return {
        ig_media_id: node.id,
        shortcode: shortcodeOf(node.permalink, node.id),
        permalink: node.permalink ?? ('https://www.instagram.com/stories/' + node.id + '/'),
        media_type: node.media_type ?? null,
        media_product_type: node.media_product_type ?? null,
        posted_at: node.timestamp,
        caption: node.caption ?? null,
        thumbnail_url: node.thumbnail_url ?? null,
        media_url: node.media_url ?? null,
        children: node.children?.data ?? [],
        api_like_count: node.like_count ?? null,
        api_comments_count: node.comments_count ?? null,
        last_pulled_at: nowIso,
    };
}

export interface InsightsRow {
    views: number | null;
    reach: number | null;
    likes: number | null;
    comments: number | null;
    shares: number | null;
    saved: number | null;
    total_interactions: number | null;
    avg_watch_time_ms: number | null;
    total_watch_time_ms: number | null;
    skip_rate: number | null;
    follows: number | null;
    profile_visits: number | null;
    reposts: number | null;
    replies: number | null;
    link_clicks: number | null;
}

/** API metric name → snapshot column. Unmapped names stay in `raw` only. */
const METRIC_TO_COLUMN: Record<string, keyof InsightsRow> = {
    views: 'views',
    plays: 'views',                    // the pre-2024 name, in case a media object still reports it
    reach: 'reach',
    likes: 'likes',
    comments: 'comments',
    shares: 'shares',
    saved: 'saved',
    total_interactions: 'total_interactions',
    ig_reels_avg_watch_time: 'avg_watch_time_ms',
    ig_reels_video_view_total_time: 'total_watch_time_ms',
    reels_skip_rate: 'skip_rate',
    follows: 'follows',
    profile_visits: 'profile_visits',
    reposts: 'reposts',
    replies: 'replies',
    link_clicks: 'link_clicks',
};

interface InsightsEntry {
    name: string;
    values?: { value?: unknown }[];
    total_value?: { value?: unknown };
}

function numberOrNull(v: unknown): number | null {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v);
    return null;
}

/**
 * Flattens `{data:[{name, values:[{value}]}]}` (or the `total_value` shape) to
 * one row. A metric that is absent stays null — the reader can tell "not
 * reported" from "zero". `reels_skip_rate` is stored as a FRACTION: the docs
 * call it a percentage but do not say whether 35 or 0.35 comes back, so a
 * value above 1 is divided by 100.
 */
export function parseInsights(json: { data?: InsightsEntry[] } | null | undefined): InsightsRow {
    const row: InsightsRow = {
        views: null, reach: null, likes: null, comments: null, shares: null, saved: null,
        total_interactions: null, avg_watch_time_ms: null, total_watch_time_ms: null, skip_rate: null,
        follows: null, profile_visits: null, reposts: null, replies: null, link_clicks: null,
    };
    for (const entry of json?.data ?? []) {
        const col = METRIC_TO_COLUMN[entry.name];
        if (!col) continue;
        const raw = entry.total_value?.value ?? entry.values?.[entry.values.length - 1]?.value;
        let n = numberOrNull(raw);
        if (n === null) continue;
        if (col === 'skip_rate' && n > 1) n = n / 100;
        row[col] = n;
    }
    return row;
}

/**
 * When the API refuses a metric set it names the offender in the error
 * message ("(#100) … reels_skip_rate is not supported …"). Returns the first
 * requested metric that appears as a whole word in the message, so the caller
 * can drop it and retry once. Null = the error is about something else.
 */
export function rejectedMetric(message: string, requested: readonly string[]): string | null {
    for (const m of requested) {
        if (new RegExp('(^|[^a-z_])' + m + '([^a-z_]|$)', 'i').test(message)) return m;
    }
    return null;
}

export function ageHours(postedIso: string, now: Date): number {
    return (now.getTime() - Date.parse(postedIso)) / 3_600_000;
}

const IST_DATE = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
});

/** YYYY-MM-DD in Asia/Kolkata — the snapshot day and the account-row day. */
export function istDate(d: Date): string {
    return IST_DATE.format(d);
}

export function daysLeft(expiresIso: string | null | undefined, now: Date): number | null {
    if (!expiresIso) return null;
    const t = Date.parse(expiresIso);
    if (Number.isNaN(t)) return null;
    return (t - now.getTime()) / 86_400_000;
}

/** Refresh when under the threshold — or when the expiry is unknown, which is the same risk. */
export function shouldRefresh(expiresIso: string | null | undefined, now: Date, thresholdDays = 10): boolean {
    const d = daysLeft(expiresIso, now);
    return d === null || d < thresholdDays;
}

export interface PullResult {
    posts: number;
    byKind: Record<PostKind, number>;
    snapshotsWritten: number;
    snapshotsSkipped: number;
    registrationsApplied: number;
    registrationsPending: number;
    accountDay: string | null;
    tokenDaysLeft: number | null;
    rejectedMetrics: string[];
    errors: string[];
    seconds: number;
}

export function summaryLine(r: PullResult): string {
    const kinds = (['REEL', 'CAROUSEL', 'POST', 'STORY'] as const)
        .filter((k) => r.byKind[k] > 0)
        .map((k) => r.byKind[k] + ' ' + k)
        .join(', ');
    const parts = [
        'ig:pull ' + (r.errors.length ? 'FAILED' : 'ok'),
        r.posts + ' posts' + (kinds ? ' (' + kinds + ')' : ''),
        r.snapshotsWritten + ' snapshots written, ' + r.snapshotsSkipped + ' skipped',
        r.registrationsApplied + ' registration' + (r.registrationsApplied === 1 ? '' : 's') + ' attached, ' + r.registrationsPending + ' pending',
        r.accountDay ? 'account row ' + r.accountDay : 'no account row',
        r.tokenDaysLeft === null ? 'token expiry unknown' : 'token ' + Math.floor(r.tokenDaysLeft) + 'd',
        r.seconds.toFixed(1) + 's',
    ];
    if (r.rejectedMetrics.length) parts.push('rejected: ' + r.rejectedMetrics.join(','));
    if (r.errors.length) parts.push('errors: ' + r.errors.length);
    return parts.join(' · ');
}
