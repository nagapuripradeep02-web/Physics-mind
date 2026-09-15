/**
 * ig:pull — the daily Instagram insights snapshot (built 2026-09-15).
 *
 * Instagram reports LIFETIME totals per post. The 48 h / 7 d picture the
 * founder ranks on (saves + shares, send rate, completion …) only exists if
 * something reads every post every day and keeps the numbers. This is that
 * job. It runs on the laptop (`npm run ig:pull`) and, the same code path, on
 * GitHub Actions at 12:30 UTC = 18:00 IST (`.github/workflows/ig-pull.yml`).
 *
 * What one run does, in order:
 *   1. reads the Meta token + ig_user_id from ig_admin_config (service role);
 *   2. lists the account's media (+ active stories) back `--days` × 4;
 *   3. upserts ig_posts — API columns ONLY (`API_COLUMNS`), never the authored
 *      ones the viditra-film register owns;
 *   4. attaches any queued registrations (RPC ig_apply_registrations);
 *   5. for every post younger than `--days` (or all with `--all`) fetches
 *      /insights and inserts today's snapshot — idempotent on
 *      (post, IST day, slot); a metric the API rejects is dropped, logged, and
 *      the request retried once;
 *   6. writes the account row for today (followers, reach, profile views);
 *   7. refreshes the token when under 10 days, persists it, and EXITS 1 when
 *      under 7 days even after that — a red Actions run is the founder's
 *      free alert;
 *   8. records last_pull_at + a one-line summary, prints the line, exits 1 if
 *      any step collected an error.
 *
 * Flags:
 *   --days N      look back N days for insights (default 14)
 *   --all         snapshot every post (lifetime totals for the whole grid)
 *   --slot 0|1    0 = the daily run (default); 1 = an optional second run
 *   --force       overwrite today's snapshot instead of skipping it
 *   --dry-run     read everything, write nothing
 *   --bootstrap   one-time: copy IG_ACCESS_TOKEN / IG_USER_ID /
 *                 IG_TOKEN_EXPIRES_AT from the environment into ig_admin_config
 *
 * Environment: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (the same
 * names in .env.local and in the GitHub secrets, so there is ONE code path).
 * The Meta token is never in the environment after bootstrap and never printed.
 *
 * No console.log — output goes through `say`/`warn` so the summary is one
 * greppable line and everything else is stderr.
 */

import {
    API_COLUMNS, GRAPH_HOST, GRAPH_VERSION, MEDIA_FIELDS, ageHours, daysLeft, istDate, kindOf,
    metricSetFor, parseInsights, postRowFrom, rejectedMetric, shouldRefresh, summaryLine,
    type MediaNode, type PostKind, type PostRow, type PullResult,
} from '../lib/ig/graph';

// ── flags ───────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const flag = (name: string): boolean => argv.includes(name);
const opt = (name: string, dflt: string): string => {
    const i = argv.indexOf(name);
    return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt;
};
const DAYS = Math.max(1, Number(opt('--days', '14')) || 14);
const ALL = flag('--all');
const SLOT = opt('--slot', '0') === '1' ? 1 : 0;
const FORCE = flag('--force');
const DRY = flag('--dry-run');
const BOOTSTRAP = flag('--bootstrap');

const say = (s: string): void => { process.stdout.write(s + '\n'); };
const warn = (s: string): void => { process.stderr.write(s + '\n'); };

// ── Supabase (PostgREST, service role, retried) ─────────────────────────────
const SUPA_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '');
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
if (!SUPA_URL || !SUPA_KEY) {
    warn('ig:pull: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing (run via npm run ig:pull).');
    process.exit(1);
}

async function withRetry<T>(label: string, fn: () => Promise<T>, tries = 4): Promise<T> {
    let last: unknown;
    for (let attempt = 1; attempt <= tries; attempt++) {
        try {
            return await fn();
        } catch (e) {
            last = e;
            if (attempt < tries) await new Promise((r) => setTimeout(r, 600 * attempt * attempt));
        }
    }
    throw new Error(label + ': ' + (last instanceof Error ? last.message : String(last)));
}

async function rest<T>(path: string, init: RequestInit & { prefer?: string } = {}): Promise<T> {
    return withRetry('supabase ' + path.split('?')[0], async () => {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 15_000);
        try {
            const res = await fetch(SUPA_URL + '/rest/v1/' + path, {
                ...init,
                signal: ctrl.signal,
                headers: {
                    'Content-Type': 'application/json',
                    apikey: SUPA_KEY,
                    Authorization: 'Bearer ' + SUPA_KEY,
                    ...(init.prefer ? { Prefer: init.prefer } : {}),
                    ...(init.headers ?? {}),
                },
            });
            if (!res.ok) throw new Error('HTTP ' + res.status + ' ' + (await res.text()).slice(0, 300));
            const text = await res.text();
            return (text ? JSON.parse(text) : null) as T;
        } finally {
            clearTimeout(timer);
        }
    });
}

async function readConfig(): Promise<Record<string, string>> {
    const rows = await rest<{ key: string; value: string }[]>('ig_admin_config?select=key,value');
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

async function writeConfig(entries: Record<string, string>): Promise<void> {
    if (DRY) return;
    const now = new Date().toISOString();
    await rest('ig_admin_config?on_conflict=key', {
        method: 'POST',
        prefer: 'resolution=merge-duplicates,return=minimal',
        body: JSON.stringify(Object.entries(entries).map(([key, value]) => ({ key, value, updated_at: now }))),
    });
}

// ── Instagram Graph API ─────────────────────────────────────────────────────
interface GraphError { error?: { message?: string; code?: number; type?: string } }

class GraphRequestError extends Error {
    constructor(public readonly status: number, public readonly apiMessage: string) {
        super('graph ' + status + ': ' + apiMessage);
    }
}

/**
 * One Graph GET. Network failures and 5xx are retried with backoff; a 4xx is a
 * decision (bad metric, bad token, expired story) and is thrown at once so the
 * caller can act on the message.
 */
async function graph<T>(token: string, path: string, params: Record<string, string>): Promise<T> {
    const url = path.startsWith('http') ? path : GRAPH_HOST + '/' + GRAPH_VERSION + '/' + path;
    // A paging `next` URL already carries the token; never send it twice.
    const qs = new URLSearchParams(url.includes('access_token=') ? params : { ...params, access_token: token }).toString();
    let last: unknown;
    for (let attempt = 1; attempt <= 4; attempt++) {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 20_000);
        try {
            const res = await fetch(qs ? url + (url.includes('?') ? '&' : '?') + qs : url, { signal: ctrl.signal });
            const text = await res.text();
            const json = (text ? JSON.parse(text) : {}) as T & GraphError;
            if (res.ok) return json;
            const err = new GraphRequestError(res.status, json.error?.message ?? text.slice(0, 200));
            if (res.status < 500) throw err;
            last = err;
        } catch (e) {
            if (e instanceof GraphRequestError && e.status < 500) throw e;
            last = e;
        } finally {
            clearTimeout(timer);
        }
        if (attempt < 4) await new Promise((r) => setTimeout(r, 600 * attempt * attempt));
    }
    throw new Error('graph ' + path.split('?')[0].slice(0, 60) + ': ' + (last instanceof Error ? last.message : String(last)));
}

interface Paged<T> { data?: T[]; paging?: { next?: string } }

/** Walks /media pages until the oldest item is older than `oldest` or pages run out. */
async function listMedia(token: string, igUserId: string, edge: 'media' | 'stories', oldest: Date): Promise<MediaNode[]> {
    const out: MediaNode[] = [];
    let page = await graph<Paged<MediaNode>>(token, igUserId + '/' + edge, { fields: MEDIA_FIELDS, limit: '50' });
    for (let guard = 0; guard < 40; guard++) {
        const data = page.data ?? [];
        out.push(...data);
        const last = data[data.length - 1];
        if (!page.paging?.next || !last || Date.parse(last.timestamp) < oldest.getTime()) break;
        page = await graph<Paged<MediaNode>>(token, page.paging.next, {});
    }
    return out;
}

/** Fetches insights for one media id, dropping any metric the API refuses (once). */
async function fetchInsights(token: string, mediaId: string, kind: PostKind, rejected: Set<string>) {
    let metrics = metricSetFor(kind).filter((m) => !rejected.has(kind + ':' + m));
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            return await graph<{ data?: { name: string; values?: { value?: unknown }[]; total_value?: { value?: unknown } }[] }>(
                token, mediaId + '/insights', { metric: metrics.join(',') });
        } catch (e) {
            if (!(e instanceof GraphRequestError)) throw e;
            const bad = rejectedMetric(e.apiMessage, metrics);
            if (!bad) throw e;
            warn('ig:pull: metric rejected for ' + kind + ': ' + bad + ' — ' + e.apiMessage.slice(0, 120));
            rejected.add(kind + ':' + bad);
            metrics = metrics.filter((m) => m !== bad);
            if (metrics.length === 0) throw e;
        }
    }
    throw new Error('insights ' + mediaId + ': gave up after three metric rejections');
}

// ── main ────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
    const t0 = Date.now();
    const now = new Date();
    const result: PullResult = {
        posts: 0, byKind: { REEL: 0, CAROUSEL: 0, POST: 0, STORY: 0 }, snapshotsWritten: 0, snapshotsSkipped: 0,
        registrationsApplied: 0, registrationsPending: 0, accountDay: null, tokenDaysLeft: null,
        rejectedMetrics: [], errors: [], seconds: 0,
    };

    if (BOOTSTRAP) {
        const token = process.env.IG_ACCESS_TOKEN ?? '';
        const userId = process.env.IG_USER_ID ?? '';
        const expRaw = process.env.IG_TOKEN_EXPIRES_AT ?? '';
        if (!token || !userId) {
            warn('ig:pull --bootstrap: set IG_ACCESS_TOKEN and IG_USER_ID (and IG_TOKEN_EXPIRES_AT = ISO date or days) in the environment.');
            process.exitCode = 1;
            return;
        }
        const expiresAt = /^\d+$/.test(expRaw)
            ? new Date(now.getTime() + Number(expRaw) * 86_400_000).toISOString()
            : (expRaw && !Number.isNaN(Date.parse(expRaw)) ? new Date(expRaw).toISOString() : new Date(now.getTime() + 60 * 86_400_000).toISOString());
        await writeConfig({ meta_access_token: token, ig_user_id: userId, meta_token_expires_at: expiresAt });
        say('ig:pull bootstrap ok — ig_user_id ' + userId + ', token expires ' + expiresAt.slice(0, 10) + (DRY ? ' (dry run, nothing written)' : ''));
        return;
    }

    const cfg = await readConfig();
    let token = cfg.meta_access_token ?? '';
    const igUserId = cfg.ig_user_id ?? '';
    let expiresAt = cfg.meta_token_expires_at || null;
    if (!token || !igUserId) {
        warn('ig:pull: ig_admin_config has no meta_access_token / ig_user_id — run `npm run ig:pull -- --bootstrap` once (see docs/notes/INSTAGRAM_INSIGHTS_RUNBOOK.md §2).');
        process.exitCode = 1;
        return;
    }

    // 2. list media
    const oldest = new Date(now.getTime() - DAYS * 4 * 86_400_000);
    const nodes: MediaNode[] = [];
    try {
        nodes.push(...await listMedia(token, igUserId, 'media', ALL ? new Date(0) : oldest));
    } catch (e) {
        result.errors.push('media list: ' + (e instanceof Error ? e.message : String(e)));
    }
    try {
        nodes.push(...await listMedia(token, igUserId, 'stories', new Date(0)));
    } catch (e) {
        // Stories are a nice-to-have; an account with none, or an API quirk, must not fail the run.
        warn('ig:pull: stories list failed (continuing): ' + (e instanceof Error ? e.message : String(e)));
    }

    // 3. upsert ig_posts — API columns only
    const nowIso = now.toISOString();
    const rows: PostRow[] = nodes.map((n) => postRowFrom(n, nowIso));
    for (const r of rows) {
        for (const k of Object.keys(r)) {
            if (!(API_COLUMNS as readonly string[]).includes(k)) throw new Error('ig:pull: refusing to write non-API column ' + k);
        }
    }
    result.posts = rows.length;
    for (const n of nodes) result.byKind[kindOf(n.media_type, n.media_product_type)]++;
    if (rows.length && !DRY) {
        try {
            await rest('ig_posts?on_conflict=ig_media_id', {
                method: 'POST', prefer: 'resolution=merge-duplicates,return=minimal', body: JSON.stringify(rows),
            });
        } catch (e) {
            result.errors.push('posts upsert: ' + (e instanceof Error ? e.message : String(e)));
        }
    }

    // 4. attach queued registrations
    if (!DRY) {
        try {
            const applied = await rest<{ applied?: number; pending?: string[] }>('rpc/ig_apply_registrations', { method: 'POST', body: '{}' });
            result.registrationsApplied = applied?.applied ?? 0;
            result.registrationsPending = applied?.pending?.length ?? 0;
        } catch (e) {
            result.errors.push('apply registrations: ' + (e instanceof Error ? e.message : String(e)));
        }
    }

    // 5. snapshots
    const rejected = new Set<string>();
    const cutoff = now.getTime() - DAYS * 86_400_000;
    const snapshotDate = istDate(now);
    const due = nodes.filter((n) => ALL || Date.parse(n.timestamp) >= cutoff);
    const snapshots: Record<string, unknown>[] = [];
    for (const n of due) {
        const kind = kindOf(n.media_type, n.media_product_type);
        try {
            const json = await fetchInsights(token, n.id, kind, rejected);
            const row = parseInsights(json);
            snapshots.push({
                ig_media_id: n.id, snapshot_date: snapshotDate, slot: SLOT, snapshot_at: nowIso,
                age_hours: Math.round(ageHours(n.timestamp, now) * 100) / 100, ...row, raw: json,
            });
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            // Stories under 5 views come back as error code 10 — that is "no data yet", not a failure.
            if (kind === 'STORY' && /code.*10|not enough|fewer than/i.test(msg)) continue;
            result.errors.push('insights ' + n.id + ' (' + kind + '): ' + msg.slice(0, 160));
        }
    }
    result.rejectedMetrics = [...rejected];
    if (snapshots.length && !DRY) {
        try {
            const written = await rest<unknown[]>('ig_insights_daily?on_conflict=ig_media_id,snapshot_date,slot', {
                method: 'POST',
                prefer: (FORCE ? 'resolution=merge-duplicates' : 'resolution=ignore-duplicates') + ',return=representation',
                body: JSON.stringify(snapshots),
            });
            result.snapshotsWritten = Array.isArray(written) ? written.length : 0;
            result.snapshotsSkipped = snapshots.length - result.snapshotsWritten;
        } catch (e) {
            result.errors.push('snapshots insert: ' + (e instanceof Error ? e.message : String(e)));
        }
    } else if (DRY) {
        result.snapshotsSkipped = snapshots.length;
    }

    // 6. account row — two calls because follower_count is time-series only and
    //    is rejected under 100 followers; the user node's followers_count always works.
    try {
        const raw: Record<string, unknown> = {};
        let followerDelta: number | null = null;
        try {
            const fc = await graph<{ data?: { name: string; values?: { value?: unknown }[] }[] }>(
                token, igUserId + '/insights', { metric: 'follower_count', period: 'day' });
            raw.follower_count = fc;
            const v = fc.data?.[0]?.values?.slice(-1)[0]?.value;
            followerDelta = typeof v === 'number' ? v : null;
        } catch (e) {
            warn('ig:pull: follower_count unavailable (under 100 followers?): ' + (e instanceof Error ? e.message.slice(0, 120) : String(e)));
        }
        const totals: Record<string, number | null> = { reach: null, profile_views: null, accounts_engaged: null, total_interactions: null };
        try {
            const tv = await graph<{ data?: { name: string; total_value?: { value?: unknown }; values?: { value?: unknown }[] }[] }>(
                token, igUserId + '/insights', { metric: 'reach,profile_views,accounts_engaged,total_interactions', period: 'day', metric_type: 'total_value' });
            raw.totals = tv;
            for (const d of tv.data ?? []) {
                const v = d.total_value?.value ?? d.values?.slice(-1)[0]?.value;
                if (d.name in totals && typeof v === 'number') totals[d.name] = v;
            }
        } catch (e) {
            warn('ig:pull: account totals unavailable: ' + (e instanceof Error ? e.message.slice(0, 120) : String(e)));
        }
        const user = await graph<{ followers_count?: number; media_count?: number }>(token, igUserId, { fields: 'followers_count,media_count' });
        raw.user = user;
        if (!DRY) {
            await rest('ig_account_daily?on_conflict=day', {
                method: 'POST', prefer: 'resolution=merge-duplicates,return=minimal',
                body: JSON.stringify([{
                    day: snapshotDate, follower_count: followerDelta, followers_total: user.followers_count ?? null,
                    reach: totals.reach, profile_views: totals.profile_views, accounts_engaged: totals.accounts_engaged,
                    total_interactions: totals.total_interactions, media_count: user.media_count ?? null, raw, pulled_at: nowIso,
                }]),
            });
        }
        result.accountDay = snapshotDate;
    } catch (e) {
        result.errors.push('account row: ' + (e instanceof Error ? e.message : String(e)));
    }

    // 7. token
    if (shouldRefresh(expiresAt, now, 10)) {
        try {
            const r = await graph<{ access_token?: string; expires_in?: number }>(token, GRAPH_HOST + '/refresh_access_token', { grant_type: 'ig_refresh_token' });
            if (r.access_token && r.expires_in) {
                token = r.access_token;
                expiresAt = new Date(now.getTime() + r.expires_in * 1000).toISOString();
                await writeConfig({ meta_access_token: token, meta_token_expires_at: expiresAt });
                warn('ig:pull: token refreshed, now expires ' + expiresAt.slice(0, 10));
            }
        } catch (e) {
            result.errors.push('token refresh: ' + (e instanceof Error ? e.message : String(e)));
        }
    }
    result.tokenDaysLeft = daysLeft(expiresAt, now);
    if (result.tokenDaysLeft !== null && result.tokenDaysLeft < 7) {
        result.errors.push('TOKEN EXPIRES IN ' + Math.floor(result.tokenDaysLeft) + ' DAYS — re-authorise (runbook §2)');
    }

    // 8. record + report
    result.seconds = (Date.now() - t0) / 1000;
    const line = summaryLine(result);
    if (!DRY) {
        try {
            await writeConfig({ last_pull_at: nowIso, last_pull_summary: line });
        } catch (e) {
            result.errors.push('write last_pull: ' + (e instanceof Error ? e.message : String(e)));
        }
    }
    for (const err of result.errors) warn('ig:pull: ' + err);
    say(line + (DRY ? ' (dry run)' : ''));
    // exitCode, not process.exit(): a hard exit with a keep-alive socket open
    // trips a libuv assertion on Windows and hides the real message.
    if (result.errors.length) process.exitCode = 1;
}

main().catch((e: unknown) => {
    warn('ig:pull: ' + (e instanceof Error ? e.stack ?? e.message : String(e)));
    process.exitCode = 1;
});
