/**
 * Admin Cost Dashboard
 * Server Component that queries Supabase ai_usage_log table and displays cost analytics.
 */

import { supabaseAdmin } from "@/lib/supabaseAdmin";

interface UsageLogEntry {
    id: number;
    created_at: string;
    task_type: string;
    provider: string;
    model: string;
    estimated_cost_usd: number;
    input_chars?: number;
    output_chars?: number;
}

interface ModelStats {
    calls: number;
    cost: number;
}

/**
 * Aggregate usage data by model and provider.
 */
function aggregateData(rows: UsageLogEntry[]): Record<string, ModelStats> {
    return rows.reduce(
        (acc, row) => {
            const key = `${row.provider}:${row.model}`;
            acc[key] = acc[key] ?? { calls: 0, cost: 0 };
            acc[key].calls++;
            acc[key].cost += row.estimated_cost_usd;
            return acc;
        },
        {} as Record<string, ModelStats>
    );
}

/**
 * Format a timestamp to a readable date string.
 */
function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

/**
 * Get the time windows for querying.
 */
function getTimeWindows() {
    const now = new Date();

    // Today: from 00:00 to now
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 7 days ago
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 30 days ago
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return {
        now: now.toISOString(),
        todayStart: todayStart.toISOString(),
        sevenDaysAgo: sevenDaysAgo.toISOString(),
        thirtyDaysAgo: thirtyDaysAgo.toISOString(),
    };
}

export default async function AdminCostsPage() {
    const windows = getTimeWindows();

    // Fetch data for different time windows in parallel
    const [todayRes, weekRes, monthRes, allTimeRes] = await Promise.all([
        supabaseAdmin
            .from("ai_usage_log")
            .select("id, created_at, provider, model, estimated_cost_usd")
            .gte("created_at", windows.todayStart)
            .order("created_at", { ascending: false }),
        supabaseAdmin
            .from("ai_usage_log")
            .select("id, created_at, provider, model, estimated_cost_usd")
            .gte("created_at", windows.sevenDaysAgo)
            .order("created_at", { ascending: false }),
        supabaseAdmin
            .from("ai_usage_log")
            .select("id, created_at, provider, model, estimated_cost_usd")
            .gte("created_at", windows.thirtyDaysAgo)
            .order("created_at", { ascending: false }),
        supabaseAdmin
            .from("ai_usage_log")
            .select("id, created_at, provider, model, estimated_cost_usd")
            .order("created_at", { ascending: true }),
    ]);

    const todayData = (todayRes.data ?? []) as UsageLogEntry[];
    const weekData = (weekRes.data ?? []) as UsageLogEntry[];
    const monthData = (monthRes.data ?? []) as UsageLogEntry[];
    const allTimeData = (allTimeRes.data ?? []) as UsageLogEntry[];

    // Aggregate data
    const todayAgg = aggregateData(todayData);
    const weekAgg = aggregateData(weekData);
    const monthAgg = aggregateData(monthData);
    const allTimeAgg = aggregateData(allTimeData);

    // Calculate totals
    const todayTotal = Object.values(todayAgg).reduce((sum, stat) => sum + stat.cost, 0);
    const weekTotal = Object.values(weekAgg).reduce((sum, stat) => sum + stat.cost, 0);
    const monthTotal = Object.values(monthAgg).reduce((sum, stat) => sum + stat.cost, 0);
    const allTimeTotal = Object.values(allTimeAgg).reduce((sum, stat) => sum + stat.cost, 0);

    // Calculate projected monthly cost
    let projectedMonthly = 0;
    if (allTimeData.length > 0) {
        const firstDate = new Date(allTimeData[0].created_at);
        const now = new Date();
        const daysElapsed = (now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysElapsed > 0) {
            projectedMonthly = allTimeTotal * (30 / daysElapsed);
        }
    }

    // Calculate Gemini credits remaining
    const GEMINI_STARTING_CREDITS_USD = 272; // €251 ≈ $272 at ~1.08 EUR/USD
    const googleTotal = Object.entries(allTimeAgg)
        .filter(([key]) => key.startsWith("google:"))
        .reduce((sum, [, stat]) => sum + stat.cost, 0);
    const geminiRemaining = Math.max(0, GEMINI_STARTING_CREDITS_USD - googleTotal);

    // Get all unique models for the table
    const allModels = Array.from(
        new Set([
            ...Object.keys(todayAgg),
            ...Object.keys(weekAgg),
            ...Object.keys(monthAgg),
        ])
    ).sort();

    const lastUpdated = new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">AI Usage & Cost Dashboard</h1>
                    <p className="text-slate-400">
                        Last updated: <span className="text-slate-300">{lastUpdated}</span>
                    </p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        label="Today"
                        value={todayTotal}
                        calls={todayData.length}
                    />
                    <StatCard
                        label="This Week"
                        value={weekTotal}
                        calls={weekData.length}
                    />
                    <StatCard
                        label="This Month"
                        value={monthTotal}
                        calls={monthData.length}
                    />
                    <StatCard
                        label="All Time"
                        value={allTimeTotal}
                        calls={allTimeData.length}
                    />
                </div>

                {/* Usage Table */}
                <div className="bg-slate-900 rounded-lg border border-slate-700 mb-8 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-700">
                        <h2 className="text-lg font-semibold text-white">Usage by Model</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-700 bg-slate-800">
                                    <th className="px-6 py-3 text-left font-semibold text-slate-300">
                                        Model
                                    </th>
                                    <th className="px-6 py-3 text-right font-semibold text-slate-300">
                                        Today (Calls)
                                    </th>
                                    <th className="px-6 py-3 text-right font-semibold text-slate-300">
                                        Today (Cost)
                                    </th>
                                    <th className="px-6 py-3 text-right font-semibold text-slate-300">
                                        Week (Calls)
                                    </th>
                                    <th className="px-6 py-3 text-right font-semibold text-slate-300">
                                        Week (Cost)
                                    </th>
                                    <th className="px-6 py-3 text-right font-semibold text-slate-300">
                                        Month (Calls)
                                    </th>
                                    <th className="px-6 py-3 text-right font-semibold text-slate-300">
                                        Month (Cost)
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {allModels.map((modelKey) => {
                                    const todayStat = todayAgg[modelKey] ?? { calls: 0, cost: 0 };
                                    const weekStat = weekAgg[modelKey] ?? { calls: 0, cost: 0 };
                                    const monthStat = monthAgg[modelKey] ?? { calls: 0, cost: 0 };
                                    const [provider, model] = modelKey.split(":");

                                    return (
                                        <tr key={modelKey} className="hover:bg-slate-800 transition">
                                            <td className="px-6 py-3">
                                                <div className="font-mono text-xs">
                                                    <div className="text-slate-400">{provider}</div>
                                                    <div className="text-slate-100">{model}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-right text-slate-300">
                                                {todayStat.calls}
                                            </td>
                                            <td className="px-6 py-3 text-right text-emerald-400 font-mono">
                                                ${todayStat.cost.toFixed(4)}
                                            </td>
                                            <td className="px-6 py-3 text-right text-slate-300">
                                                {weekStat.calls}
                                            </td>
                                            <td className="px-6 py-3 text-right text-emerald-400 font-mono">
                                                ${weekStat.cost.toFixed(4)}
                                            </td>
                                            <td className="px-6 py-3 text-right text-slate-300">
                                                {monthStat.calls}
                                            </td>
                                            <td className="px-6 py-3 text-right text-emerald-400 font-mono">
                                                ${monthStat.cost.toFixed(4)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bottom Section: Projected & Credits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-900 rounded-lg border border-slate-700 p-6">
                        <h3 className="text-sm font-semibold text-slate-400 mb-2">Projected Monthly Cost</h3>
                        <div className="text-3xl font-bold text-emerald-400">
                            ${projectedMonthly.toFixed(2)}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            Based on {allTimeData.length} total calls
                        </p>
                    </div>

                    <div className="bg-slate-900 rounded-lg border border-slate-700 p-6">
                        <h3 className="text-sm font-semibold text-slate-400 mb-2">Gemini Free Trial Credits</h3>
                        <div className="text-3xl font-bold text-blue-400">
                            ${geminiRemaining.toFixed(2)}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            of ${GEMINI_STARTING_CREDITS_USD.toFixed(2)} remaining
                        </p>
                        {geminiRemaining < 50 && (
                            <div className="mt-3 text-xs text-yellow-400 bg-yellow-900 bg-opacity-30 p-2 rounded">
                                ⚠️ Low on Gemini credits!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Stat Card Component
 */
function StatCard({
    label,
    value,
    calls,
}: {
    label: string;
    value: number;
    calls: number;
}) {
    return (
        <div className="bg-slate-900 rounded-lg border border-slate-700 p-6">
            <p className="text-sm font-medium text-slate-400 mb-2">{label}</p>
            <div className="text-2xl font-bold text-emerald-400 mb-1">
                ${value.toFixed(4)}
            </div>
            <p className="text-xs text-slate-500">{calls} calls</p>
        </div>
    );
}
