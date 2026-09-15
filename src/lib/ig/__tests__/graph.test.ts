import { describe, expect, it } from 'vitest';
import {
    API_COLUMNS, METRICS, ageHours, daysLeft, istDate, kindOf, metricSetFor, parseInsights,
    postRowFrom, rejectedMetric, shortcodeOf, shouldRefresh, summaryLine,
} from '../graph';

describe('metric sets', () => {
    it('reels ask for watch time and skip rate; feed posts ask for follows and profile visits', () => {
        expect(metricSetFor('REEL')).toContain('ig_reels_avg_watch_time');
        expect(metricSetFor('REEL')).toContain('reels_skip_rate');
        expect(metricSetFor('REEL')).not.toContain('follows');
        expect(metricSetFor('CAROUSEL')).toContain('follows');
        expect(metricSetFor('CAROUSEL')).toContain('profile_visits');
        expect(metricSetFor('STORY')).toContain('replies');
    });

    it('never asks for a breakdown-only metric', () => {
        for (const kind of Object.keys(METRICS) as (keyof typeof METRICS)[]) {
            expect(METRICS[kind]).not.toContain('profile_activity');
            expect(METRICS[kind]).not.toContain('navigation');
        }
    });
});

describe('kindOf mirrors the generated column', () => {
    it('maps product type first, then carousel, else post', () => {
        expect(kindOf('VIDEO', 'REELS')).toBe('REEL');
        expect(kindOf('IMAGE', 'STORY')).toBe('STORY');
        expect(kindOf('CAROUSEL_ALBUM', 'FEED')).toBe('CAROUSEL');
        expect(kindOf('IMAGE', 'FEED')).toBe('POST');
        expect(kindOf(null, null)).toBe('POST');
    });
});

describe('shortcodeOf', () => {
    it('reads the three permalink shapes', () => {
        expect(shortcodeOf('https://www.instagram.com/reel/C0aBcDeFgHi/', 'x')).toBe('C0aBcDeFgHi');
        expect(shortcodeOf('https://www.instagram.com/p/DEf-gh_12/', 'x')).toBe('DEf-gh_12');
        expect(shortcodeOf('https://www.instagram.com/viditra/reel/ABC123/?utm=1', 'x')).toBe('ABC123');
    });
    it('falls back to the media id for stories and junk', () => {
        expect(shortcodeOf('https://www.instagram.com/stories/viditra/1234567/', '1234567')).toBe('1234567');
        expect(shortcodeOf(null, 'id9')).toBe('id9');
    });
});

describe('API_COLUMNS is the whole write surface of the pull job', () => {
    const authored = [
        'title', 'format', 'hook_text', 'body_summary', 'cta_keyword', 'series', 'reel_id', 'version',
        'design_system', 'presenter', 'source_card', 'duration_s', 'src_tag', 'notes', 'registered_at', 'props',
    ];
    it('contains no authored column', () => {
        for (const a of authored) expect(API_COLUMNS as readonly string[]).not.toContain(a);
    });
    it('postRowFrom emits exactly those keys', () => {
        const row = postRowFrom({
            id: '1', media_type: 'VIDEO', media_product_type: 'REELS', permalink: 'https://www.instagram.com/reel/AbC/',
            timestamp: '2026-09-22T13:35:00+0000', caption: 'hi', like_count: 3, comments_count: 1,
        }, '2026-09-23T12:30:00.000Z');
        expect(Object.keys(row).sort()).toEqual([...API_COLUMNS].sort());
        expect(row.shortcode).toBe('AbC');
        expect(row.children).toEqual([]);
        expect(row.api_like_count).toBe(3);
    });
});

describe('parseInsights', () => {
    it('flattens the values[] shape and the total_value shape, leaves missing metrics null', () => {
        const row = parseInsights({
            data: [
                { name: 'views', values: [{ value: 1200 }] },
                { name: 'shares', total_value: { value: 31 } },
                { name: 'saved', values: [{ value: '44' }] },
                { name: 'ig_reels_avg_watch_time', values: [{ value: 18400 }] },
                { name: 'something_new', values: [{ value: 9 }] },
            ],
        });
        expect(row.views).toBe(1200);
        expect(row.shares).toBe(31);
        expect(row.saved).toBe(44);
        expect(row.avg_watch_time_ms).toBe(18400);
        expect(row.likes).toBeNull();
        expect(row.follows).toBeNull();
    });
    it('stores skip rate as a fraction whether the API sends 35 or 0.35', () => {
        expect(parseInsights({ data: [{ name: 'reels_skip_rate', values: [{ value: 35 }] }] }).skip_rate).toBeCloseTo(0.35);
        expect(parseInsights({ data: [{ name: 'reels_skip_rate', values: [{ value: 0.35 }] }] }).skip_rate).toBeCloseTo(0.35);
    });
    it('accepts the legacy plays name as views', () => {
        expect(parseInsights({ data: [{ name: 'plays', values: [{ value: 7 }] }] }).views).toBe(7);
    });
    it('survives an empty or missing body', () => {
        expect(parseInsights(null).views).toBeNull();
        expect(parseInsights({}).reach).toBeNull();
    });
});

describe('rejectedMetric', () => {
    const asked = METRICS.REEL;
    it('names the metric the error message names', () => {
        expect(rejectedMetric('(#100) reels_skip_rate metric is not supported for this media product type', asked)).toBe('reels_skip_rate');
        expect(rejectedMetric('Invalid parameter: The metric ig_reels_video_view_total_time is unavailable', asked)).toBe('ig_reels_video_view_total_time');
    });
    it('does not match a metric name inside a longer identifier', () => {
        expect(rejectedMetric('total_views_something is wrong', ['views'])).toBeNull();
    });
    it('returns null for an unrelated error', () => {
        expect(rejectedMetric('Invalid OAuth access token', asked)).toBeNull();
    });
});

describe('time arithmetic', () => {
    it('ageHours is elapsed hours since posting', () => {
        expect(ageHours('2026-09-22T13:35:00+0000', new Date('2026-09-24T12:35:00Z'))).toBeCloseTo(47);
    });
    it('istDate crosses midnight IST before UTC does', () => {
        // 19:30 UTC on the 22nd is 01:00 IST on the 23rd
        expect(istDate(new Date('2026-09-22T19:30:00Z'))).toBe('2026-09-23');
        expect(istDate(new Date('2026-09-22T12:30:00Z'))).toBe('2026-09-22');
    });
    it('daysLeft and shouldRefresh follow the 10-day rule', () => {
        const now = new Date('2026-09-15T00:00:00Z');
        expect(daysLeft('2026-11-13T00:00:00Z', now)).toBeCloseTo(59);
        expect(shouldRefresh('2026-11-13T00:00:00Z', now)).toBe(false);
        expect(shouldRefresh('2026-09-20T00:00:00Z', now)).toBe(true);
        expect(shouldRefresh('', now)).toBe(true);
        expect(shouldRefresh('not a date', now)).toBe(true);
        expect(daysLeft(null, now)).toBeNull();
    });
});

describe('summaryLine', () => {
    it('is one line with the liveness numbers in it', () => {
        const line = summaryLine({
            posts: 12, byKind: { REEL: 9, CAROUSEL: 3, POST: 0, STORY: 0 }, snapshotsWritten: 12, snapshotsSkipped: 0,
            registrationsApplied: 1, registrationsPending: 0, accountDay: '2026-09-15', tokenDaysLeft: 41.7,
            rejectedMetrics: [], errors: [], seconds: 3.21,
        });
        expect(line).toBe('ig:pull ok · 12 posts (9 REEL, 3 CAROUSEL) · 12 snapshots written, 0 skipped · 1 registration attached, 0 pending · account row 2026-09-15 · token 41d · 3.2s');
        expect(line.includes('\n')).toBe(false);
    });
    it('says FAILED and counts errors', () => {
        const line = summaryLine({
            posts: 0, byKind: { REEL: 0, CAROUSEL: 0, POST: 0, STORY: 0 }, snapshotsWritten: 0, snapshotsSkipped: 0,
            registrationsApplied: 0, registrationsPending: 2, accountDay: null, tokenDaysLeft: null,
            rejectedMetrics: ['reposts'], errors: ['x'], seconds: 0.4,
        });
        expect(line.startsWith('ig:pull FAILED')).toBe(true);
        expect(line).toContain('rejected: reposts');
        expect(line).toContain('errors: 1');
    });
});
